import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from '../entities/course.entity';
import { Brackets, DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import { CourseDTO, CourseResultDTO, CourseUpdateDTO } from '../dto/course.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { format } from 'date-fns';
import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { CourseAttendanceEntity } from '../entities/course-attendance.entity';
import { VisitRecordService } from 'src/modules/visit-record/services/visit-record.service';
import { VisitRecordDTO } from 'src/modules/visit-record/dto/visit-record.dto';
import { VISIT_TYPES } from 'src/constants/visit-types';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PointService } from 'src/modules/points/services/point.service';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { Request } from 'express';
import { ROLES } from 'src/constants';
import { SecurityService } from 'src/modules/security/services/security.service';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { UsersService } from 'src/modules/users/services/users.service';
import { CourseCatalogEntity } from 'src/modules/nomencladores/course-catalog/entities/course-catalog.entity';
import { CourseCatalogDTO } from 'src/modules/nomencladores/course-catalog/dto/course-catalog.dto';
import { ca } from 'date-fns/locale';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly CourseRepository: Repository<CourseEntity>,

    @InjectRepository(EmployeeEntity)
    private readonly EmployeeRepository: Repository<EmployeeEntity>,

    @InjectRepository(CourseAttendanceEntity)
    private readonly CourseAttendanceRepository: Repository<CourseAttendanceEntity>,

    @InjectRepository(PointEntity)
    private readonly PointRepository: Repository<PointEntity>,

    @InjectRepository(CourseCatalogEntity)
    private readonly CourseCatalogRepository: Repository<CourseCatalogEntity>,

    private readonly SecurityService: SecurityService,
    private readonly CitizenService: CitizenService,
    private readonly VisitRecordService: VisitRecordService,
    private readonly UserService: UsersService,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {

    let query = this.CourseRepository.createQueryBuilder('course');

    query = query.where('course.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('course.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  async checkIfCourseExistsInPoint(name: string, point_id: string, start_date?: string, end_date?: string): Promise<boolean> {

     // Convertir start_date y end_date a formato 'YYYY-MM-DD'
    const formattedStartDate = start_date ? new Date(start_date).toISOString().slice(0, 10) : null;
    const formattedEndDate = end_date ? new Date(end_date).toISOString().slice(0, 10) : null;

    let query = this.CourseRepository.createQueryBuilder('course')
                 .where('course.name ILIKE :name', { name })
                 .andWhere('course.point_id = :point_id', { point_id });
    // Agrupando las condiciones en paréntesis
    query = query.andWhere(
      new Brackets((qb) => {
        if (formattedStartDate) {
          qb.where('(Date(course.start_date) <= :start_date AND Date(course.end_date) >= :start_date)', { start_date: formattedStartDate });
        }
        if (formattedEndDate) {
          qb.orWhere('(Date(course.start_date) <= :end_date AND Date(course.end_date) >= :end_date)', { end_date: formattedEndDate });
        }
      })
    );
    try {      
      const existingItem = await query.getOne();
      return !!existingItem;
    } catch (e) {
      console.log("Error->", e);
      throw new Error(e);
    }   
    
  }

  public async createCourse(
    user_id: string,
    body: CourseDTO,
    coverImage: Express.Multer.File,
    ip: string,
  ): Promise<CourseEntity> {
    try {
      const _body: Partial<CourseEntity> = {
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        name: body.name,
        observations: body.observations,
        week_days_amount: body.week_days_amount,
      };
      const catalog = await this.CourseCatalogRepository.createQueryBuilder('course-catalog')
        .where('course-catalog.id = :id', { id: body.catalog_id })
        .getOne();

      if (!catalog){        
        throw new Error("El curso no existe en el catálogo");
      } 
      _body.catalog = catalog;
      _body.name = catalog.name;

      const employee = await this.EmployeeRepository.createQueryBuilder(
        'employee',
      )
        .leftJoinAndSelect('employee.user', 'user')
        .where('user.id = :id', { id: user_id })
        .getOne();

      const point = await this.PointRepository.createQueryBuilder('point')
        .leftJoinAndSelect('point.facilitator_employee', 'facilitator_employee')
        .where('facilitator_employee.id = :id', { id: employee?.id })
        .getOne();

      if (!point){        
        throw new Error("Facilitador no tiene punto de encuentro asignado");
      }      
      _body.point = point;
      
      if(await this.checkIfCourseExistsInPoint(_body.name, point.id, body.start_date, body.end_date)){
        throw new Error("Ya existe un curso con el mismo nombre y fechas en conflicto para el mismo punto");
      }

      if (coverImage) {
        // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/course/';

        // Construir la ruta completa del archivo
        const filePath = path.join(
          uploadPath,
          `${uniqueFileName}${path.extname(coverImage.originalname)}`,
        );

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = coverImage.buffer;

        await fs.writeFile(filePath, fileBuffer);

        // Actualizar el campo de imagen en el service
        _body.coverImage = `course/${uniqueFileName}${path.extname(
          coverImage.originalname,
        )}`;
      }
      const saved = await this.CourseRepository.save(_body);

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.CREATE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'course',
        entry_id: saved.id,
        ip,
      });

      return saved;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findCourse(
    page: number,
    limit: number,
    req: Request,
  ): Promise<CourseResultDTO> {
    try {
      const queryBuilder = this.CourseRepository.createQueryBuilder('course');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;

      keys.forEach((key, i) => {
        if (
          key !== 'page' &&
          key !== 'limit' &&
          key !== 'search' &&
          key !== 'isCertificate' &&
          key !== 'citizen_id' &&
          key !== 'onlyActive'
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `course.${key}`
            }=${
              key === 'start_date' || key === 'end_date'
                ? `:${key}`
                : `'${values[i]}'`
            }`,
          );
          realIndex++;
        }
      });

      

      if (
        req.roleUser === ROLES.CITIZEN ||
        req.roleUser === ROLES.FACILITATOR
      ) {
        if (req.roleUser === ROLES.CITIZEN) {
          const citizen = await this.CitizenService.findByUserId(req.idUser);

          queryBuilder.where('point.id = :id', { id: citizen.point.id });
        }

        if (req.roleUser === ROLES.FACILITATOR) {
          const employee = await this.EmployeeRepository.findOne({
            where: { user: { id: req.idUser } },
            relations: { user: true },
          });
          const point = await this.PointRepository.findOne({
            where: { facilitator_employee: { id: employee.id } },
            relations: { facilitator_employee: true },
          });

          queryBuilder.where('point.id = :id', { id: point?.id });
        }
        if (query_string) {
          const start_date = new Date(
            String(req.query.start_date ? req.query.start_date : ''),
          );
          const end_date = new Date(
            String(req.query.end_date ? req.query.end_date : ''),
          );

          queryBuilder.andWhere(query_string, {
            start_date,
            end_date,
          });
        }

        if (req.query.search) {
          queryBuilder.andWhere(
            'course.name ILIKE :search OR course.observations ILIKE :search',
            {
              search: `%%${req.query.search}%`,
            },
          );
        }
        if (req.query.onlyActive) {
          queryBuilder.andWhere('course.end_date > CURRENT_DATE');
        }
      } else {
        if (query_string) {
          const start_date = new Date(
            String(req.query.start_date ? req.query.start_date : ''),
          );
          const end_date = new Date(
            String(req.query.end_date ? req.query.end_date : ''),
          );
          queryBuilder.where(query_string, {
            start_date,
            end_date,
          });
          if (req.query.search) {
            queryBuilder.andWhere(
              'course.name ILIKE :search OR course.observations ILIKE :search',
              {
                search: `%%${req.query.search}%`,
              },
            );
          }

          if (req.query.onlyActive) {
            queryBuilder.andWhere('course.end_date > CURRENT_DATE');
          }
        }
        if (req.query.search) {
          queryBuilder.where(
            'course.name ILIKE :search OR course.observations ILIKE :search',
            {
              search: `%%${req.query.search}%`,
            },
          );

          if (req.query.onlyActive) {
            queryBuilder.andWhere('course.end_date > CURRENT_DATE');
          }
        } else {
          if (req.query.onlyActive) {
            queryBuilder.where('course.end_date > CURRENT_DATE');
          }
        }
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Course, totalElements] = await queryBuilder
        .leftJoinAndSelect('course.point', 'point')
        .leftJoinAndSelect('course.catalog', 'course-catalog')
        .orderBy('course.createdAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);

      if (req.query.isCertificate) {
        if (req.query.citizen_id) {
          const citizen = await this.CitizenService.findCitizenById(
            String(req.query.citizen_id),
          );

          const { courses: citizen_courses } =
            await this.CitizenService.getEnrolledCourses(citizen?.user?.id);

          let courses: CourseEntity[] = [];
          Course.forEach((Course) => {
            citizen_courses.forEach((attendance) => {
              if (Course.id === attendance.course.id) {
                courses.push(Course);
              }
            });
          });

          return {
            pageNumber: 1,
            pageLimit: 10,
            totalPages: 1,
            totalElements: courses?.length,
            data: [...courses],
          };
        }
      }

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Course],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof CourseDTO; value: any }) {
    try {
      const Course = await this.CourseRepository.createQueryBuilder('course')
        .leftJoinAndSelect('course.point', 'point')
        .leftJoinAndSelect('course.catalog', 'course-catalog')
        .where({ [key]: value })
        .getOne();

      let _course = Course;

      let start_date: string = null;
      let end_date: string = null;

      if (Course.start_date) {
        start_date = format(Course.start_date, 'yyyy-MM-dd');
      }

      if (Course.end_date) {
        end_date = format(Course.end_date, 'yyyy-MM-dd');
      }

      delete _course.start_date;
      delete _course.end_date;

      return { ..._course, start_date, end_date };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCourseById(id: string) {
    try {
      const Course: CourseEntity =
        await this.CourseRepository.createQueryBuilder('course')
          .leftJoinAndSelect('course.point', 'point')
          .leftJoinAndSelect('course.catalog', 'course-catalog')
          .where({ id })
          .getOne();

      let _course = Course;

      let start_date: string = null;
      let end_date: string = null;

      if (Course.start_date) {
        start_date = format(Course.start_date, 'yyyy-MM-dd');
      }

      if (Course.end_date) {
        end_date = format(Course.end_date, 'yyyy-MM-dd');
      }

      delete _course.start_date;
      delete _course.end_date;

      return { ..._course, start_date, end_date };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async registerCitizenAttendance(user_id: string, course_id: string) {
    try {
      const citizen = await this.CitizenService.findByUserId(user_id);

      if (!citizen) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el ciudadano',
        });
      }

      const course = await this.CourseRepository.createQueryBuilder('course')
        .where('course.id = :id', { id: course_id })
        .leftJoinAndSelect('course.point', 'point')
        .getOne();

      if (!course) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el curso',
        });
      }

      if (course.point?.id !== citizen.point?.id) {
        throw new ErrorManager({
          type: 'PRECONDITION_FAILED',
          message:
            'Usted no se encuentra en el punto del encuentro donde se imparte este curso',
        });
      }

      const citizenAlreadyAttended =
        await this.CourseAttendanceRepository.createQueryBuilder(
          'course_attendance',
        )
          .leftJoin('course_attendance.citizen', 'citizen')
          .leftJoin('course_attendance.course', 'course')
          .where('citizen.id = :id', { id: citizen.id })
          .andWhere('course.id = :course_id', { course_id: course.id })
          .andWhere('course_attendance.created_at >= CURRENT_DATE')
          .getExists();

      if (citizenAlreadyAttended) {
        throw new ErrorManager({
          type: 'PRECONDITION_FAILED',
          message: 'El ciudadano ya asistio a ese curso hoy',
        });
      }
      // create a record of the attendace for that user in that specific date and time
      const attendance = new CourseAttendanceEntity();
      attendance.citizen = citizen;
      attendance.course = course;

      const visit = new VisitRecordDTO();
      visit.date = new Date();
      visit.citizen = citizen;
      visit.point = course.point;
      visit.visit_type = VISIT_TYPES.ON_SITE;

      await this.VisitRecordService.createVisitRecord(visit);
      return await this.CourseAttendanceRepository.save(attendance);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getTodayAttended(user_id: string, course_id: string) {
    try {
      const citizen = await this.CitizenService.findByUserId(user_id);

      if (!citizen) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el ciudadano',
        });
      }

      const course = await this.CourseRepository.createQueryBuilder('course')
        .where('course.id = :id', { id: course_id })
        .leftJoinAndSelect('course.point', 'point')
        .getOne();

      if (!course) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el curso',
        });
      }

      const citizenAlreadyAttended =
        await this.CourseAttendanceRepository.createQueryBuilder(
          'course_attendance',
        )
          .leftJoin('course_attendance.citizen', 'citizen')
          .leftJoin('course_attendance.course', 'course')
          .where('citizen.id = :id', { id: citizen.id })
          .andWhere('course.id = :course_id', { course_id: course.id })
          .andWhere('course_attendance.created_at >= CURRENT_DATE')
          .getExists();

      return { attended: citizenAlreadyAttended };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getCourseAttendaces(
    page: number,
    limit: number,
    user_id: string,
  ) {
    try {
      const queryBuilder =
        this.CourseAttendanceRepository.createQueryBuilder('course_attendance');

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Attendances, totalElements] = await queryBuilder
        .leftJoinAndSelect('course_attendance.citizen', 'citizen')
        .leftJoinAndSelect('course_attendance.course', 'course')
        .orderBy('course_attendance.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Attendances],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getCourseAttendacesByCourseId(page: number, limit: number, course_id: string) {
    try {
      const pageNumber = page || 1;
      const pageLimit = limit || 10;
  
      const queryBuilder = this.CourseAttendanceRepository.createQueryBuilder('course_attendance')
        .select([
          'course.id AS curso_id',
          'course.name AS curso',
          'citizen.name AS ciudadano_nombre',
          'citizen.id_value AS ciudadano_id',
          'citizen.email AS ciudadano_email',
          'citizen.gender AS ciudadano_genero',
          'COUNT(course_attendance.id) AS asistencias'
        ])
        .leftJoin('course_attendance.citizen', 'citizen')
        .leftJoin('course_attendance.course', 'course')
        .where('course.id = :course_id', { course_id })
        .groupBy('course.id, course.name, citizen.name, citizen.id_value, citizen.email, citizen.gender')
        .orderBy('course.name', 'ASC')
        .addOrderBy('citizen.name', 'ASC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit);
  
      // Cambia a `getRawMany()` para obtener los datos como un array de objetos planos
      const Attendances = await queryBuilder.getRawMany();
      const totalElements = Attendances.length;
      const totalPages = Math.ceil(totalElements / pageLimit);
  
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: Attendances,
      };
    } catch (error) {
      console.error(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }  

  public async filterByDate(
    page: number,
    limit: number,
    start_date: string,
    end_date: string,
    user_id: string,
    onlyActive?: string,
  ) {
    try {
      const user = await this.UserService.findUserById(user_id);

      const _start_date = new Date(start_date);
      let _end_date = new Date(end_date);

      _end_date.setDate(_end_date.getDate() + 1);

      if (_start_date > _end_date) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'La fecha de inicio no puede ser mayor a la de fin',
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const queryBuilder = this.CourseRepository.createQueryBuilder('course')
        .leftJoinAndSelect('course.point', 'point')
        .leftJoinAndSelect('course.catalog', 'course-catalog')
        .where('course.start_date >= :start_date', {
          start_date: _start_date,
        })
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit);

      if (onlyActive) {
        queryBuilder.andWhere('course.end_date > CURRENT_DATE');
      }

      if (end_date) {
        console.log(end_date);
        queryBuilder.andWhere('course.end_date <= :end_date', {
          end_date: _end_date,
        });
      }

      if (user?.role.role_value === ROLES.CITIZEN) {
        const citizen = await this.CitizenService.findByUserId(user.id);

        queryBuilder.andWhere('point.id = :id', { id: citizen.point.id });
      }

      const [courses, totalAmount] = await queryBuilder.orderBy('course_attendance.updatedAt', 'ASC').getManyAndCount();

      const totalPages = Math.ceil(totalAmount / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements: totalAmount,
        totalPages,
        data: [...courses],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCourse(
    id: string,
    body: CourseUpdateDTO,
    coverImage: Express.Multer.File,
    user_id: string,
    ip: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const CourseToUpdate = await this.CourseRepository.findOneBy({ id });

      if (!CourseToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la curso',
        });
      }

      const updateData: Partial<CourseEntity> = {
        name: body.name,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        observations: body.observations,
        week_days_amount: body.week_days_amount,        
      };
      const catalogo = await this.CourseCatalogRepository.createQueryBuilder('course-catalog')
                            .where('course-catalog.id = :id', { id: body.catalog_id })
                            .getOne();                             
      if (!catalogo) {        
        throw new Error("El curso no existe en el catálogo"); 
      }
      updateData.catalog = catalogo;  
      updateData.name = catalogo.name;     

      const employee = await this.EmployeeRepository.createQueryBuilder('employee')
        .leftJoinAndSelect('employee.user', 'user')
        .where('user.id = :id', { id: user_id })
        .getOne();

      const point = await this.PointRepository.createQueryBuilder('point')
        .leftJoinAndSelect('point.facilitator_employee', 'facilitator_employee')
        .where('facilitator_employee.id = :id', { id: employee?.id })
        .getOne();

      if (!point){        
        throw new Error("Facilitador no tiene punto de encuentro asignado");
      }      
      //updateData.point = point;
      
      if(await this.checkIfCourseExistsInPoint(catalogo.name, point.id, body.start_date, body.end_date)){
        throw new Error("Ya existe un curso con el mismo nombre y fechas en conflicto para el mismo punto");
      }

      if (coverImage) {
        // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/course/';

        // Construir la ruta completa del archivo
        const filePath = path.join(
          uploadPath,
          `${uniqueFileName}${path.extname(coverImage.originalname)}`,
        );

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = coverImage.buffer;

        await fs.writeFile(filePath, fileBuffer);

        // Actualizar el campo de imagen en el service
        updateData.coverImage = `course/${uniqueFileName}${path.extname(
          coverImage.originalname,
        )}`;
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'course',
        entry_id: CourseToUpdate.id,
        ip,
      });

      return await this.CourseRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async deleteCourse(
    id: string,
    user_id: string,
    ip: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Course: DeleteResult = await this.CourseRepository.softDelete(id);
      if (Course.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'course',
        entry_id: id,
        ip,
      });
      return Course;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
