import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceEntity } from '../entities/attendance.entity';
import {
  Between,
  DeleteResult,
  LessThan,
  MoreThan,
  Repository,
  UpdateResult,
} from 'typeorm';
import {
  ArrangedAttendancesDTO,
  AttendanceDTO,
  AttendanceResultDTO,
  AttendanceUpdateDTO,
  SubordinatesAttendaceAllDTO,
  SubordinatesAttendancesAllArrayDTO,
  SubordinatesAttendancesAllResult,
} from '../dto/attendance.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { UsersService } from 'src/modules/users/services/users.service';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { SecurityService } from 'src/modules/security/services/security.service';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { Request } from 'express';
import { ROLES } from 'src/constants';
import { PointService } from 'src/modules/points/services/point.service';
import { TYPE_OF_ATTENDANCE } from 'src/constants/enums';
import {
  differenceInBusinessDays,
  differenceInHours,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { EmployeeCommandChainEntity } from 'src/modules/employee/entities/employee_command_chain.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly AttendanceRepository: Repository<AttendanceEntity>,

    @InjectRepository(EmployeeCommandChainEntity)
    private readonly CommandChainRepository: Repository<EmployeeCommandChainEntity>,

    private readonly UserService: UsersService,
    private readonly EmployeeService: EmployeeService,
    private readonly SecurityService: SecurityService,
    private readonly PointService: PointService,
  ) {}

  public async createAttendance(
    body: AttendanceDTO,
    user_id: string,
    ip: string,
  ): Promise<AttendanceEntity> {
    try {
      const user = await this.UserService.findUserById(user_id);

      //ip = ::ffff:10.0.0.1 --> direccion ipv4 dentro del namespace del ipv6 de la red
      const ipv4 = ip?.split(':')[ip?.split(':').length - 1]; //remover namespace de ipv6 por retro compatibilidad para comprobacion con ipv4 del pde

      const Attendance: Partial<AttendanceEntity> = { ...body, ip: ipv4 };

      if (Attendance) {
        const type = Attendance.attendanceType;
        const alreadyEntered =
          await this.AttendanceRepository.createQueryBuilder('attendance')
            .leftJoinAndSelect('attendance.user', 'user')
            .where('attendance.attendanceType = :type', {
              type: type,
            })
            .andWhere('user.id = :id', { id: user.id })
            .andWhere('attendance.attendanceDate >= CURRENT_DATE')
            .getOne();

        if (alreadyEntered) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message:
              'Solo se puede registrar ese tipo de asistencia una vez al dia',
          });
        }
      }

      if (user?.role?.role_value === ROLES.FACILITATOR) {
        const employee = await this.EmployeeService.findEmployeeByUserId(
          user_id,
        );

        const point = await this.PointService.getPointByFacilitator(
          employee.id,
        );

        if (point?.ip !== ipv4) {
          Attendance.isInPoint = false;
        }
      }

      Attendance.observation = body.observation;
      Attendance.user = user;

      const saved = await this.AttendanceRepository.save(Attendance);

      return saved;
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findAttendance(
    page: number,
    limit: number,
    user_id: string,
    req: Request,
  ): Promise<AttendanceResultDTO> {
    try {
      const queryBuilder =
        this.AttendanceRepository.createQueryBuilder('attendance');

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
          key !== 'attendanceDate'
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `attendance.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} attendance.latitud ILIKE '%${
            req.query.search
          }%' OR  attendance.longitude ILIKE '%${req.query.search}%'`,
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      queryBuilder
        .leftJoinAndSelect('attendance.user', 'user')
        .where('user.id = :id', { id: user_id })
        .orderBy('attendance.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit);

      if (query_string) {
        queryBuilder.andWhere(query_string);
      }

      if (req.query.attendanceDate) {
        const date = new Date(String(req.query.attendanceDate));

        queryBuilder.andWhere({
          createdAt: Between(startOfDay(date), endOfDay(date)),
        });
      }
      const [Attendance, totalElements] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Attendance],
      };
    } catch (error) {
      console.log(error);
      console.log(
        '%cattendance.service.ts line:194 error',
        'color: #007acc;',
        error,
      );
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findEmployeeAttendance(
    id: string,
    page: number,
    limit: number,
    req?: Request,
  ) {
    try {
      const employee = await this.EmployeeService.findEmployeeById(id);

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el empleado',
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const queryBuilder =
        this.AttendanceRepository.createQueryBuilder('attendance');

      queryBuilder.where('user.id = :id', { id: employee?.user?.id });

      if (req.query?.attendanceDate) {
        const date = new Date(String(req.query?.attendanceDate));
        queryBuilder.andWhere({
          createdAt: Between(startOfDay(date), endOfDay(date)),
        });
      }

      if (req?.query?.attendanceType) {
        queryBuilder.andWhere({ attendanceType: req?.query?.attendanceType });
      }

      console.log(
        '%cattendance.service.ts line:223 queryBuilder.getSql(',
        'color: #007acc;',
        queryBuilder.getSql(),
      );

      const [attendances, totalElements] = await queryBuilder
        .leftJoin('attendance.user', 'user')

        .orderBy('attendance.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...attendances],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findAllSubordinateAttendances(
    start_date: string,
    end_date: string,
    user_id: string,
    page: number,
    limit: number,
  ) {
    try {
      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const employee = await this.EmployeeService.findEmployeeByUserId(user_id);
      let totalElements = 0;

      let subordinates: EmployeeEntity[] = [];

      if (process.env.EXTRA_FEATURES == '1' && employee.user_type === ROLES.COORDINATOR) {
        //en caso de estar activo el flag de extra features, el reporte solo obtiene las asistencias
        //de los facilitadores y asistentes técnicos exclusivamente para el rol coordinador
        const tech_assistents = await this.EmployeeService.filterEmployeeByRoleName(
              page,
              limit,
              ROLES.TECHNICAL_ASSISTENT,
            );

        subordinates = tech_assistents?.data;
        totalElements = tech_assistents?.totalElements;
        const facilitators = await this.EmployeeService.filterEmployeeByRoleName(
          page,
          limit,
          ROLES.FACILITATOR,
        );                
        subordinates = subordinates.concat(facilitators?.data);
        totalElements += facilitators?.totalElements;
        
      } else {
        if (
          employee.user_type === ROLES.MANAGER ||
          employee.user_type === ROLES.COORDINATOR
        ) {
          const [sub_command_chain, elements] =
            await this.CommandChainRepository.findAndCount({
              where: {
                boss: {
                  id: employee?.id,
                },
              },
              relations: { subordinate: { user: true } },
              skip: (pageNumber - 1) * pageLimit,
              take: pageLimit,
            });

          sub_command_chain.forEach((cm) => {
            subordinates.push(cm.subordinate);
          });

          totalElements = elements;
        }

        if (employee.user_type === ROLES.TECHNICAL_CHIEF) {
          const tech_assistents =
            await this.EmployeeService.filterEmployeeByRoleName(
              page,
              limit,
              ROLES.TECHNICAL_ASSISTENT,
            );

          subordinates = tech_assistents.data;
          totalElements = tech_assistents.totalElements;
        }
      }      

      let attendancesArr: SubordinatesAttendancesAllArrayDTO = [];
      //aqui empieza a recorrer las asistencias de la lista de subordinados
      for (let i = 0; i < subordinates?.length; i++) {
        let attendanceObj: SubordinatesAttendaceAllDTO = {
          subordinate_nui: '',
          subordinate_name: '',
          daysUnnmarked: 0,
          total_hours: 0,
        };

        attendanceObj.subordinate_nui = subordinates[i]?.id_value;
        attendanceObj.subordinate_name = subordinates[i]?.name;

        const attendances = await this.generateAttendanceReport(
          subordinates[i]?.id,
          start_date,
          end_date,
        );

        let totalHours = 0;
        let daysSinceLastAttendance = -1;

        attendances?.arranged_attendances.forEach((attendance) => {
          let dates: {
            start: Date;
            lunch: Date;
            return: Date;
            exit: Date;
            real_values: {
              start: boolean;
              lunch: boolean;
              return: boolean;
              exit: boolean;
            };
          } = {
            start: new Date(),
            lunch: new Date(),
            return: new Date(),
            exit: new Date(),
            real_values: {
              start: false,
              lunch: false,
              return: false,
              exit: false,
            },
          };

          let hoursInLunch = 0;
          let hoursToExit = 0;
          let totalWorkedHours = 0;

          attendance?.attendances?.forEach((_attendance) => {
            if (
              _attendance.attendanceType === TYPE_OF_ATTENDANCE.ENTRANCE_TO_WORK
            ) {
              dates.start = _attendance.attendanceDate;
              dates.real_values.start = true;
            }
            if (_attendance.attendanceType === TYPE_OF_ATTENDANCE.OUT_TO_EAT) {
              dates.lunch = _attendance.attendanceDate;
              dates.real_values.lunch = true;
            }
            if (
              _attendance.attendanceType === TYPE_OF_ATTENDANCE.RETURN_OF_FOOD
            ) {
              dates.return = _attendance.attendanceDate;
              dates.real_values.return = true;
            }
            if (_attendance.attendanceType === TYPE_OF_ATTENDANCE.OUT_OF_WORK) {
              dates.exit = _attendance.attendanceDate;
              dates.real_values.exit = true;
            }
          });

          if (dates?.real_values.return && dates?.real_values.lunch) {
            hoursInLunch = differenceInHours(dates?.return, dates?.lunch);
          }
          if (dates?.real_values.start && dates?.real_values.exit) {
            hoursToExit = differenceInHours(dates?.exit, dates?.start);
          }
          totalWorkedHours = hoursToExit - hoursInLunch;

          totalHours += totalWorkedHours;
        });

        const latestAttendance = await this.AttendanceRepository.findOne({
          where: {
            user: { id: subordinates[i]?.user?.id },
          },
          order: { createdAt: 'DESC' },
        });

        if (latestAttendance) {
          daysSinceLastAttendance = differenceInBusinessDays(
            new Date(),
            latestAttendance?.attendanceDate,
          );
        }

        attendanceObj.daysUnnmarked = daysSinceLastAttendance
          ? daysSinceLastAttendance
          : 0;
        attendanceObj.total_hours = totalHours;

        attendancesArr.push(attendanceObj);
      }

      const _totalElements =
        totalElements > 0 ? totalElements : attendancesArr?.length;

      const totalPages = Math.ceil(_totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements: _totalElements,
        totalPages,
        data: [...attendancesArr],
      };
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findSubordinateAttendance(
    page: number,
    limit: number,
    user_id: string,
    subordinate_id: string,
    req: Request,
  ): Promise<AttendanceResultDTO> {
    try {
      const employee = await this.EmployeeService.findEmployeeByUserId(user_id);

      const subordinate = employee.subordinates.find(
        (sub) => sub.id === subordinate_id,
      );

      if (!subordinate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El empleado no es subordinado del usuario logueado',
        });
      }

      const user_subordinate = await this.EmployeeService.findEmployeeById(
        subordinate.id,
      );

      const queryBuilder =
        this.AttendanceRepository.createQueryBuilder('attendance');

      if (req.query?.attendanceDate) {
        const date = new Date(String(req.query?.attendanceDate));
        queryBuilder.andWhere({
          createdAt: Between(startOfDay(date), endOfDay(date)),
        });
      }

      if (req?.query?.attendanceType) {
        queryBuilder.andWhere({ attendanceType: req?.query?.attendanceType });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Attendance, totalElements] = await queryBuilder
        .leftJoin('attendance.user', 'user')
        .where('user.id = :id', { id: user_subordinate.user.id })
        .orderBy('attendance.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Attendance],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({
    key,
    value,
  }: {
    key: keyof AttendanceDTO;
    value: any;
  }) {
    try {
      const Attendance = await this.AttendanceRepository.createQueryBuilder(
        'attendance',
      )
        .where({ [key]: value })
        .getOne();

      return Attendance;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async generateAttendanceReport(
    id: string,
    start_date?: string,
    end_date?: string,
  ) {
    try {
      const employee = await this.EmployeeService.findEmployeeById(id).catch(e => null);

      if(!employee){return null}

      const point = await this.PointService.getPointByFacilitator(employee.id);

      let attendances: AttendanceEntity[];

      attendances = await this.AttendanceRepository.find({
        where: { user: { id: employee.user.id } },
        relations: { user: true },
        order: { attendanceDate: { direction: 'DESC' } },
      });

      if (start_date) {
        if (end_date) {
          attendances = await this.AttendanceRepository.find({
            where: {
              user: { id: employee.user.id },
              attendanceDate: Between(
                startOfDay(new Date(start_date)),
                endOfDay(new Date(end_date)),
              ),
            },
            order: { attendanceDate: { direction: 'DESC' } },
            relations: { user: true },
          });
        } else {
          attendances = await this.AttendanceRepository.find({
            where: {
              user: { id: employee.user.id },
              attendanceDate: MoreThan(startOfDay(new Date(start_date))),
            },
            order: { attendanceDate: { direction: 'DESC' } },
            relations: { user: true },
          });
        }
      } else {
        if (end_date) {
          attendances = await this.AttendanceRepository.find({
            where: {
              user: { id: employee.user.id },
              attendanceDate: LessThan(endOfDay(new Date(end_date))),
            },
            order: { attendanceDate: { direction: 'DESC' } },
            relations: { user: true },
          });
        }
      }

      let attendance_dates: Date[] = [];
      let arranged_attendances: ArrangedAttendancesDTO[] = [];

      attendances.forEach((attendance) => {
        if (
          !attendance_dates.find(
            (date) =>
              format(date, 'yyyy-MM-dd') ===
              format(attendance.attendanceDate, 'yyyy-MM-dd'),
          )
        ) {
          attendance_dates.push(attendance.attendanceDate);
        }
      });

      attendance_dates.forEach((date) => {
        let arrange_attendance_object: ArrangedAttendancesDTO = {
          date,
          attendances: [],
        };

        attendances.forEach((attendance) => {
          if (isSameDay(date, attendance.attendanceDate)) {
            arrange_attendance_object.attendances.push(attendance);
          }
        });

        arranged_attendances.push(arrange_attendance_object);
      });

      const boss = await this.EmployeeService.getBoss(employee.id);

      return { employee, arranged_attendances, boss, point };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findAttendanceById(id: string): Promise<AttendanceEntity> {
    try {
      const Attendance: AttendanceEntity =
        await this.AttendanceRepository.createQueryBuilder('attendance')
          .where({ id })
          .getOne();
      return Attendance;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateAttendance(
    id: string,
    body: AttendanceUpdateDTO,
    user_id: string,
    ip?: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const AttendanceToUpdate = await this.AttendanceRepository.findOneBy({
        id,
      });

      if (!AttendanceToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Institucion',
        });
      }
      const objUpdated = await this.AttendanceRepository.update(id, body);

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'attendance',
        entry_id: AttendanceToUpdate.id,
        ip,
      });

      return objUpdated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteAttendance(
    id: string,
    user_id: string,
    ip?: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Attendance: DeleteResult =
        await this.AttendanceRepository.softDelete(id);
      if (Attendance.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'attendance',
        entry_id: id,
        ip,
      });
      return Attendance;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
