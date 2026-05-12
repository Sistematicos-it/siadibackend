import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CitizenEntity } from '../entities/citizen.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  CitizenDTO,
  CitizenResultDTO,
  CitizenUpdateDTO,
} from '../dto/citizen.dto';
import { ErrorManager } from '../../../utils/error.manager';

import { CitizenshipService } from 'src/modules/nomencladores/person-data/services/citizenship.service';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { CourseAttendanceEntity } from 'src/modules/course/entities/course-attendance.entity';
import * as bcrypt from 'bcrypt';
import { RolesService } from 'src/modules/roles/services/roles.service';
import { ROLES } from 'src/constants';
import {
  generateNumberOtpCode,
  generateOtpCode,
} from 'src/utils/generateOtpCode';
import { SecurityDTO } from 'src/modules/security/dto/security.dto';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { SecurityService } from 'src/modules/security/services/security.service';
import { Request } from 'express';
import { CitizenLoginEntity } from '../entities/citizen-login.entity';
import { v4 } from 'uuid';

@Injectable()
export class CitizenService {
  constructor(
    @InjectRepository(CitizenEntity)
    private readonly CitizenRepository: Repository<CitizenEntity>,

    @InjectRepository(UserEntity)
    private readonly UsersRepository: Repository<UserEntity>,

    @InjectRepository(CourseAttendanceEntity)
    private readonly CourseRecordRepository: Repository<CourseAttendanceEntity>,

    @InjectRepository(CitizenLoginEntity)
    private readonly CitizenLoginRepository: Repository<CitizenLoginEntity>,

    private readonly CitizenshipService: CitizenshipService,
    private readonly SecurityService: SecurityService,
    private readonly RoleService: RolesService,
  ) {}

  public async createCitizen(
    body: CitizenDTO,
    user_id?: string,
    ip?: string,
  ): Promise<CitizenEntity> {
    try {
      const objCitizen = new CitizenEntity();
      const citizenUser = new UserEntity();

      const citizen_role = await this.RoleService.findBy({
        key: 'role_value',
        value: ROLES.CITIZEN,
      });

      citizenUser.email = body.email;
      citizenUser.username = body.id_value;
      citizenUser.password = await bcrypt.hash(
        body.id_value,
        +process.env.HASH_SALT,
      );
      citizenUser.role = citizen_role;
      citizenUser.isFirstTime = true;

      const saved_user = await this.UsersRepository.save(citizenUser).catch(
        (err) => {
          throw new ErrorManager({
            type: 'INTERNAL_SERVER_ERROR',
            message: 'Error al crear el usuario para el nuevo ciudadano',
          });
        },
      );

      objCitizen.isPregnant = body.isPregnant;
      objCitizen.hasUnderAgeKids = body.hasUnderAgeKids;

      objCitizen.name = body.name;
      objCitizen.cell_phone = body.cell_phone;
      objCitizen.email = body.email;
      objCitizen.gender = body.gender;
      objCitizen.id_value = body.id_value;
      objCitizen.phone = body.phone;
      objCitizen.birth_date = body.birth_date;
      objCitizen.disability = body.disability;
      objCitizen.disabilityAmount = body.disabilityAmount;
      objCitizen.ethnicity = body.ethnicity;
      objCitizen.user = saved_user;

      const citizenship = await this.CitizenshipService.findCitizenshipById(
        body?.citizenship?.id,
      );

      objCitizen.citizenship = citizenship;

      const saved = await this.CitizenRepository.save(objCitizen).catch(
        async (err) => {
          await this.UsersRepository.delete(saved_user.id);
          console.log(err);
          throw new ErrorManager({
            type: 'INTERNAL_SERVER_ERROR',
            message: 'Error al crear ciudadano',
          });
        },
      );

      const security: SecurityDTO = {
        action: SECURITY_ACTION.CREATE,
        made_on: new Date(),
        entity: 'citizen',
        entry_id: saved.id,
        user_id: user_id,
        ip,
      };

      await this.SecurityService.createSecurity(security);

      return saved;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async resetCitizenPassword(citizen_id: string) {
    try {
      const citizen = await this.findCitizenById(citizen_id);

      if (!citizen) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el ciudadano',
        });
      }

      const new_pass = generateNumberOtpCode();

      const hash = await bcrypt.hash(new_pass, +process.env.HASH_SALT);

      const updateUser = await this.UsersRepository.update(citizen.user.id, {
        password: hash,
        isFirstTime: true,
      });

      if (updateUser.affected === 0) {
        throw new ErrorManager({
          type: 'INTERNAL_SERVER_ERROR',
          message: 'Ocurrio un error al cambiar la contraseña',
        });
      }

      return { code: new_pass };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async validateUniqueValues(email: string, id_value: string) {
    try {
      let invalid_fields: { property: string; message: string }[] = [];

      if (email) {
        const user = await this.UsersRepository.findOne({
          where: { email: email },
          withDeleted: true,
        });

        if (user)
          invalid_fields.push({
            property: 'email',
            message: 'El correo proporcionado ya esta en uso',
          });
      }

      if (id_value) {
        const citizen = await this.CitizenRepository.findOne({
          where: {
            id_value: id_value,
          },
          withDeleted: true,
        });

        if (citizen) {
          invalid_fields.push({
            property: 'id_value',
            message: 'La identificación proporcionada ya esta en uso',
          });
        }
      }

      if (invalid_fields?.length > 0) {
        let field_string = '';

        invalid_fields.forEach(
          (field, i) =>
            (field_string =
              field_string +
              `${i === 0 ? '' : '/'}${field.property}#${field.message}`),
        );

        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `Algunos campos ya se encuentran en uso :: ${field_string}`,
        });
      }
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async enrollInCourse(citizen: CitizenEntity, course: CourseEntity) {
    try {
      const objEnrollment = new CourseAttendanceEntity();

      objEnrollment.citizen = citizen;
      objEnrollment.course = course;

      return await this.CourseRecordRepository.save(objEnrollment);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getEnrolledCourses(user_id: string) {
    try {
      const citizen = await this.findByUserId(user_id);

      if (!citizen) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el ciudadano',
        });
      }

      const courses = await this.CourseRecordRepository.createQueryBuilder(
        'course_attendance',
      )

        .leftJoin('course_attendance.citizen', 'citizen')
        .leftJoinAndSelect('course_attendance.course', 'course')

        .distinctOn(['course.id'])
        .where('citizen.id = :id', { id: citizen.id })

        .getMany();

      return {
        courses,
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getEnrollment(citizen_id: string, course_id: string) {
    try {
      const citizen = await this.findCitizenById(citizen_id);

      if (!citizen) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el ciudadano',
        });
      }

      const courses = await this.CourseRecordRepository.createQueryBuilder(
        'course_attendance',
      )
        .leftJoin('course_attendance.citizen', 'citizen')
        .leftJoin('course_attendance.course', 'course')
        .where('citizen.id = :id', { id: citizen.id })
        .andWhere('course.id = :id', { id: course_id })
        .andWhere('course_attendance.deletedAt = NULL')

        .getOne();

      return courses;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCitizen(
    page: number,
    limit: number,
    req: Request,
  ): Promise<CitizenResultDTO> {
    try {
      const queryBuilder = this.CitizenRepository.createQueryBuilder('citizen');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `citizen.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} citizen.name ILIKE '%${
            req.query.search
          }%' OR  citizen.id_value ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Citizen, totalElements] = await queryBuilder

        .leftJoinAndSelect('citizen.citizenship', 'citizenship')
        .leftJoinAndSelect('citizen.user', 'user')
        .leftJoinAndSelect('citizen.point', 'point')
        //.orderBy('citizen.updatedAt', 'DESC')
        .orderBy('citizen.name', 'ASC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Citizen],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findByUserId(id: string) {
    try {
      const citizen = await this.CitizenRepository.createQueryBuilder('citizen')
        .leftJoinAndSelect('citizen.user', 'user')
        .leftJoinAndSelect('citizen.point', 'point')
        .where('user.id = :id', { id: id })
        .getOne();

      return citizen;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof CitizenDTO; value: any }) {
    try {
      const Citizen = await this.CitizenRepository.createQueryBuilder('citizen')
        .where({ [key]: value })
        .leftJoinAndSelect('citizen.citizenship', 'citizenship')
        .leftJoinAndSelect('citizen.point', 'point')
        .leftJoinAndSelect('citizen.user', 'user')
        .getOne();

      return Citizen;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getCitizenLoginRecord(id: string, page: number, limit: number) {
    try {
      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const [loginRecord, totalElements] =
        await this.CitizenLoginRepository.findAndCount({
          where: { citizen_id: id },
          skip: (pageNumber - 1) * pageLimit,
          take: pageLimit,
          relations: {
            point: {
              address: {
                parish: { canton: { province: { region: { country: true } } } },
              },
            },
          },
        });

      const totalPages = Math.ceil(totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...loginRecord],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCitizenById(id: string): Promise<CitizenEntity> {
    try {
      const Citizen: CitizenEntity =
        await this.CitizenRepository.createQueryBuilder('citizen')
          .where({ id })
          .leftJoinAndSelect('citizen.citizenship', 'citizenship')
          .leftJoinAndSelect('citizen.user', 'user')
          .getOne();
      return Citizen;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCitizen(
    id: string,
    body: CitizenUpdateDTO,
    user_id: string,
    ip?: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const CitizenToUpdate = await this.CitizenRepository.findOneBy({
        id,
      });

      if (!CitizenToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el ciudadano',
        });
      }
      const updateData: Partial<CitizenEntity> = {
        name: body.name,
        cell_phone: body.cell_phone,
        email: body.email,
        phone: body.phone,
        disability: body.disability,
        disabilityAmount: body.disabilityAmount,
        ethnicity: body.ethnicity,
        birth_date: body.birth_date,
        gender: body.gender,
        isPregnant: body.isPregnant,
        hasUnderAgeKids: body.hasUnderAgeKids,
      };

      const citizenship = await this.CitizenshipService.findCitizenshipById(
        body?.citizenship?.id,
      );

      body?.citizenship?.id ? (updateData.citizenship = citizenship) : '';

      const updated = await this.CitizenRepository.update(id, updateData);

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'citizen',
        entry_id: CitizenToUpdate.id,
        ip,
      });

      return updated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteCitizen(
    id: string,
    user_id?: string,
    ip?: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const citizenToDelete = await this.CitizenRepository.findOne({
        where: {
          id,
        },
        relations: {
          user: true,
        },
      });
      const uuid = v4();

      await this.CitizenRepository.update(id, {
        id_value: `${citizenToDelete?.id_value}_deleted_${uuid}`,
        email: `${citizenToDelete?.email}_deleted_${uuid}`,
      });

      const Citizen: DeleteResult = await this.CitizenRepository.softDelete(id);
      const User: DeleteResult = await this.UsersRepository.update(
        citizenToDelete?.user?.id,
        {
          email: citizenToDelete?.user?.email + Date.now(),
          username: citizenToDelete?.user?.username + Date.now(),
        },
      );
      if (Citizen.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      const security: SecurityDTO = {
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        entity: 'citizen',
        entry_id: id,
        user_id: user_id,
        ip,
      };

      await this.SecurityService.createSecurity(security);

      return Citizen;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
