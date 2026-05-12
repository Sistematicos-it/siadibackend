import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/users.entity';
import { BSON, DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import {
  OtpCodeDTO,
  UserDTO,
  UserPrescriptionDTO,
  UserResultDTO,
  UserUpdateDTO,
} from '../dto/user.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { OtpCodeEntity } from '../entities/otp.entity';
import { generateOtpCode } from 'src/utils/generateOtpCode';
import { sendEmail } from 'src/utils/sendEmail';
import { OtpCodeService } from './otp.service';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { EmployeeCommandChainEntity } from 'src/modules/employee/entities/employee_command_chain.entity';
import { ROLES } from 'src/constants';
import { EMPLOYEE_STATUS } from 'src/constants/enums';
import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';
import { UserRolesEntity } from '../entities/users-roles.entity';
import { RoleEntity } from 'src/modules/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(EmployeeEntity)
    private readonly EmployeeRepository: Repository<EmployeeEntity>,

    @InjectRepository(EmployeeCommandChainEntity)
    private readonly CommandChainRepository: Repository<EmployeeCommandChainEntity>,

    @InjectRepository(CitizenEntity)
    private readonly CitizenRepository: Repository<CitizenEntity>,
    
    @InjectRepository(RoleEntity)
    private readonly RolesRepository: Repository<RoleEntity>,

    @InjectRepository(UserRolesEntity)
    private readonly UserRolesRepository: Repository<UserRolesEntity>,
  ) {}

  public async createUser(body: UserDTO): Promise<UserEntity> {
    try {
      body.password = await bcrypt.hash(body.password, +process.env.HASH_SALT);

      const emailExists = await this.findBy({
        key: 'email',
        value: body.email,
      });

      if (emailExists) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El correo electronico proporcionado ya se encunetra en uso',
        });
      }

      return await this.userRepository.save(body);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUsers(
    page: number,
    limit: number,
    search: string,
  ): Promise<UserResultDTO> {
    try {
      const queryBuilder = this.userRepository.createQueryBuilder('users');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where(
          'users.email ILIKE :search OR users.username ILIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [users, totalElements] = await queryBuilder
        .leftJoinAndSelect('users.role', 'role')
        .orderBy('users.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...users],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof UserDTO; value: any }) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('users')
        // .addSelect('user.password')
        .where(`users.${key} = :value`, { value: value })
        .withDeleted()
        .leftJoinAndSelect('users.role', 'role')
        .leftJoinAndSelect('users.employee', 'employee')
        .leftJoinAndSelect('users.userRoles', 'userRoles')
        .getOne();

      return user;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUserById(id: string) {
    // leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
    // Esto lo que hace es traer los datos de la tabla intermedia entre User y Project

    // leftJoinAndSelect('projectsIncludes.project', 'project')
    // SIguiendo el orden de los Join, primero se accede a la relacion con el Join de arriba y luego
    // accedes al objeto en si que quieres traer
    try {
      const user: UserEntity = await this.userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.role', 'role')
        .leftJoinAndSelect('users.employee', 'employee')
        .leftJoinAndSelect('users.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'userRole')
        .where({ id })
        // .leftJoinAndSelect('user.employee', 'employee')
        // .leftJoinAndSelect('person.address', 'address')
        .getOne();

      return user;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUserRolByRolAndUser(user: string, role: string) {
    try {
      const userRoles: UserRolesEntity = await this.UserRolesRepository
        .createQueryBuilder('userRoles')
        .where('userRoles.user = :user', { user })
        .andWhere('userRoles.role = :role', { role })
        .getOne();

      return userRoles;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async userMe(id: string) {
    const user = await this.findUserById(id);

    if (user?.role?.role_value === ROLES.CITIZEN) {
      const citizen = await this.CitizenRepository.findOne({
        where: { user: { id: id } },
        relations: { user: true },
      });

      return { user, citizen };
    }

    if (user?.employee?.id) {
      const Employee: EmployeeEntity =
        await this.EmployeeRepository.createQueryBuilder('employee')
          .where({ id: user?.employee?.id })

          .getOne();

      if (Employee && Employee.status === EMPLOYEE_STATUS.UNNACTIVE) {
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: 'Usted ha sido desvinculado del sistema',
        });
      }

      if (user?.role?.role_value === ROLES.TECHNICAL_CHIEF) {
        const subordinates = await this.EmployeeRepository.find({
          where: { user_type: ROLES.TECHNICAL_ASSISTENT },
          relations: { user: true },
        });

        return { user, subordinates, boss: null };
      }

      if (user?.role?.role_value === ROLES.HUMAN_TALENT) {
        // Se consulta a la base todos los roles definidos para que talento humano los controle (como subordinados)
        const subordinates = await this.EmployeeRepository.find({
            where: { user_type: In([ROLES.MONITOR, ROLES.COORDINATOR, ROLES.TECHNICAL_CHIEF]) },
            relations: { user: true },
            order: { name: 'ASC' },
        });
    
        // Filtramos los resultados en memoria para separarlos por roles
        // const monitors = subordinates.filter(emp => emp.user_type === ROLES.MONITOR);
        // const coordinators = subordinates.filter(emp => emp.user_type === ROLES.COORDINATOR);
        // const tech_chiefs = subordinates.filter(emp => emp.user_type === ROLES.TECHNICAL_CHIEF);
    
        return {
            user,
            //subordinates: [...monitors, ...coordinators, ...tech_chiefs],
            subordinates: subordinates,
            boss: null,
        };
    }

      const subordinates = await this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .leftJoin('employee_command_chain.boss', 'boss')
        .leftJoinAndSelect('employee_command_chain.subordinate', 'subordinate')
        .leftJoinAndSelect('subordinate.user', 'user')
        .where('boss.id = :id', { id: Employee?.id })
        .getMany();

        //console.log(subordinates)
      let _subordinates: EmployeeEntity[] = [];
      if (subordinates) {
        subordinates?.forEach((sub) =>{ if(!_subordinates.find(_sub => _sub?.id === sub?.subordinate?.id)){_subordinates.push(sub?.subordinate)}});
      }

      const boss = await this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .leftJoinAndSelect('employee_command_chain.boss', 'boss')
        .leftJoin('employee_command_chain.subordinate', 'subordinate')
        .where('subordinate.id = :id', { id: Employee?.id })
        .getOne();

      return { user, subordinates: _subordinates, boss: boss?.boss };
    }

    return { user, subordinates: [], boss: null, optRoles: process.env.OPTROLES };
  }

  public async getRoleByUserId(id: string) {
    try {
      const user: UserEntity = await this.findUserById(id);

      console.log(user);
      return user?.role?.role_value;
    } catch (error) {
      console.log(error);}
  }

  /*public async getRolesByUserId(
    id: string,
  ): Promise<UserRolesResultDTO> {
    try {
      const queryBuilder = this.RolesRepository.createQueryBuilder('users_roles');

      // Agregar filtros de búsqueda
      if (id) {
        queryBuilder.where(
          'users_roles.user_id LIKE :id',
          {
            id: `%${id}%`,
          },
        );
      }

      const [roles, totalElements] = await queryBuilder
        .getManyAndCount();

      return {
        totalElements,
        data: [...roles],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }*/

  public async changeUserPassword(id: string, new_password: string) {
    try {
      const User = await this.userRepository.findOneBy({ id });

      if (!User) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el usuario',
        });
      }

      return await this.changePassword(id, new_password);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateUser(
    id: string,
    body: UserUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const objUser: Partial<UserEntity> = {
        email: body.email,
        username: body.username,
      };

      if (body.role?.id) {
        objUser.role = body.role;
      }

      const user: UpdateResult = await this.userRepository.update(id, objUser);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar el registro',
        });
      }
      return user;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteUser(id: string): Promise<DeleteResult | undefined> {
    try {
      // const objUser = await this.userRepository.findOneBy({ id });
      const user: DeleteResult = await this.userRepository.delete(id);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return user;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Obtén toda la información de la Persona asociada a través de la relación OneToOne en Usuario
  // async getEmployeeByUserId(userId: string): Promise<UserPrescriptionDTO> {
  //   const user = await this.userRepository
  //     .createQueryBuilder('users')

  //     // .leftJoinAndSelect('person.address', 'address')
  //     .where('users.id = :id', { id: userId })
  //     //.leftJoinAndSelect('users.employee', 'employee')
  //     .getOne();
  //   if (user) {
  //     const userPerson = new UserPrescriptionDTO();
  //     userPerson.id = user.id;
  //     userPerson.email = user.email;
  //     userPerson.username = user.username;
  //     // userPerson.employee = user.employee;
  //     return userPerson;
  //   }
  //   return null;
  // }

  async changePassword(
    idOrEmail: string,
    newPassword: string,
  ): Promise<UserEntity> {
    let user: UserEntity;

    // Verificar si se proporcionó un ID o un correo electrónico
    if (idOrEmail.includes('@')) {
      // Cambiar la contraseña por correo electrónico
      user = await this.findBy({ key: 'email', value: idOrEmail });
    } else {
      // Cambiar la contraseña por ID de usuario
      user = await this.findUserById(idOrEmail);
    }

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizar la contraseña del usuario en la base de datos
    user.password = await bcrypt.hash(newPassword, +process.env.HASH_SALT);
    user.isFirstTime = false;
    await this.userRepository.save(user);

    return user;
  }
}
