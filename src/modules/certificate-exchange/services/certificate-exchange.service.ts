import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CertificateExchangeEntity } from '../entities/certificate-exchange.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  CertificateExchangeDTO,
  CertificateExchangeResultDTO,
  UpdateCertificateExchangeDTO,
} from '../dto/certificate-exchange.dto';
import { ErrorManager } from '../../../utils/error.manager';

import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { ProgramService } from 'src/modules/nomencladores/program/services/program.service';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { CERTIFICATE_EXCHANGE_STATUS } from 'src/constants/enums';
import { getCertificateTemplate } from 'src/utils/certificate.template';
import * as QRCode from 'qrcode';
import { format } from 'date-fns';
import { getVirtualCertificateTemplate } from 'src/utils/certificate-virtual.template';
import * as fs from 'fs/promises';
import { getType } from 'mime';
import { Request } from 'express';
import { ROLES } from 'src/constants';
@Injectable()
export class CertificateExchangeService {
  constructor(
    @InjectRepository(CertificateExchangeEntity)
    private readonly CertificateExchangeRepository: Repository<CertificateExchangeEntity>,

    @InjectRepository(CourseEntity)
    private readonly CourseRepository: Repository<CourseEntity>,

    private readonly CitizenService: CitizenService,
    private readonly ProgramService: ProgramService,
    private readonly EmployeeService: EmployeeService,
  ) {}

  public async createCertificateExchange(
    body: CertificateExchangeDTO,
    user_id: string,
  ): Promise<CertificateExchangeEntity> {
    try {
      let objCertificateExchange = new CertificateExchangeEntity();

      objCertificateExchange.certificate_code = body.certificate_code;

      const citizen = await this.CitizenService.findCitizenById(body.citizen);

      if (!citizen) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el ciudadano',
        });
      }

      const requester = await this.EmployeeService.findEmployeeByUserId(
        user_id,
      );

      const reviewer = await this.EmployeeService.getBoss(requester.id);

      objCertificateExchange.citizen = citizen;
      objCertificateExchange.requester = requester;
      objCertificateExchange.reviewer = reviewer;

      if (body.course && body.program) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message:
            'Solo es posible seleccionar un curso presencial o uno virtual, no ambos',
        });
      }

      if (!body.course && !body.program) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Debe seleccionar un curso virtual o presencial',
        });
      }

      if (body.course) {
        const course = <CourseEntity>(
          await this.CourseRepository.findOne({ where: { id: body.course } })
        );

        if (!course) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No se encontro el curso',
          });
        }

        objCertificateExchange.course = course;
      }

      if (body.program) {
        const program = await this.ProgramService.findProgramById(body.program);

        if (!program) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No se encontro el curso',
          });
        }

        objCertificateExchange.program = program;
      }

      return await this.CertificateExchangeRepository.save(
        objCertificateExchange,
      );
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async printCertificate(id: string) {
    try {
      let html: string = '';
      const certificateExchange =
        await this.CertificateExchangeRepository.findOne({
          where: { id },
          relations: {
            course: true,
            citizen: { citizenship: true },
            program: { certificate: true },
          },
        });

      if (certificateExchange.status !== CERTIFICATE_EXCHANGE_STATUS.APROVED) {
        throw new ErrorManager({
          type: 'PRECONDITION_FAILED',
          message: 'El certificado no ha sido aprobado',
        });
      }

      const citizen = certificateExchange.citizen;

      if (certificateExchange.course?.id) {
        const course = certificateExchange.course;
        const qr_course_text = `Datos del Curso\n Nombre: ${course.name} \n Fecha de Inicio: ${course.start_date} \n Fecha de Finalizacion: ${course.end_date} \n Dias por semana: ${course.week_days_amount} \n Contenidos: ${course.observations} \n \n Datos del ciudadano \n Nombre: ${citizen.name} \n Ciudadania: ${citizen.citizenship.name} \n Genero: ${citizen.gender} \n Nui: ${citizen.id_value} \n Email: ${citizen.email} \n`;

        const qr_course = await QRCode.toString(qr_course_text, {
          type: 'svg',
        });

        const qr_code = await QRCode.toString(
          `Codigo del certificado: ${certificateExchange.certificate_code}`,
          {
            type: 'svg',
          },
        );

        html = getCertificateTemplate(
          qr_course,
          'Presencial',
          `${format(course.start_date, 'yyyy-MM-dd')} a ${format(
            course.end_date,
            'yyyy-MM-dd',
          )}`,
          course.name,
          citizen.name,
          citizen.id_value,
        );
      }

      if (certificateExchange.program?.id) {
        const course = certificateExchange.program;
        let file_logo: Buffer;
        try {
          file_logo = await fs.readFile(`uploads/${course.certificate.file}`);
        } catch (error) {
          console.log(error);
          file_logo = new Buffer('');
        }
        const base64logo = file_logo.toString('base64');
        const qr_course_text = `Datos del Curso\n Nombre: ${course.name} \n Total en horas: ${course.hours} \n Nombre del convenio: ${course.certificate.name} \n \n Datos del ciudadano \n Nombre: ${citizen.name} \n Ciudadania: ${citizen.citizenship} \n Genero: ${citizen.gender} \n Nui: ${citizen.id_value} \n Email: ${citizen.email} \n`;

        const type = getType(`uploads/${course.certificate.file}`);
        const qr_course = await QRCode.toString(qr_course_text, {
          type: 'svg',
        });

        const qr_code = await QRCode.toString(
          `Url del convenio: ${course.url} \n Codigo del certificado: ${certificateExchange.certificate_code}`,
          {
            type: 'svg',
          },
        );

        html = getVirtualCertificateTemplate(
          qr_code,
          qr_course,
          'Virtual',
          `${course.hours} horas`,
          course.name,
          citizen.name,
          citizen.id_value,

          `data:${type};base64,${base64logo}`,
        );
      }

      return html;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCertificateExchange(
    page: number,
    limit: number,
    user_id: string,
    req: Request,
  ): Promise<CertificateExchangeResultDTO> {
    try {
      const employee = await this.EmployeeService.findEmployeeByUserId(user_id);

      const queryBuilder =
        this.CertificateExchangeRepository.createQueryBuilder(
          'certificate_exchange',
        )
          .leftJoinAndSelect('certificate_exchange.citizen', 'citizen')
          .leftJoinAndSelect('certificate_exchange.course', 'course')
          .leftJoinAndSelect('certificate_exchange.program', 'program')
          .leftJoinAndSelect('certificate_exchange.requester', 'requester')
          .leftJoinAndSelect('certificate_exchange.reviewer', 'reviewer');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `certificate_exchange.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} citizen.name ILIKE '%${
            req.query.search
          }%' OR  certificate_exchange.observations ILIKE '%${
            req.query.search
          }%' OR  certificate_exchange.certificate_code ILIKE '%${
            req.query.search
          }%' OR  program.name ILIKE '%${
            req.query.search
          }%' OR  course.name ILIKE '%${
            req.query.search
          }%'`,
        );
      }

      if (req.roleUser === ROLES.FACILITATOR) {
        queryBuilder.andWhere('requester.id = :id', {
          id: employee.id,
        });
      }
      if (req.roleUser === ROLES.MANAGER) {
        queryBuilder.andWhere('reviewer.id = :id', {
          id: employee.id,
        });
      }
      if (query_string) {
        queryBuilder.andWhere(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [CertificateExchange, totalElements] = await queryBuilder

        .orderBy('certificate_exchange.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...CertificateExchange],
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
    key: keyof CertificateExchangeDTO;
    value: any;
  }) {
    try {
      const CertificateExchange =
        await this.CertificateExchangeRepository.createQueryBuilder(
          'certificate_exchange',
        )
          .where({ [key]: value })

          .leftJoinAndSelect('certificate_exchange.citizen', 'citizen')
          .leftJoinAndSelect('certificate_exchange.course', 'course')
          .leftJoinAndSelect('certificate_exchange.program', 'program')
          .leftJoinAndSelect('certificate_exchange.requester', 'requester')
          .leftJoinAndSelect('certificate_exchange.reviewer', 'reviewer')
          .getOne();

      return CertificateExchange;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async validateCertificateExchange(
    id: string,
    status: CERTIFICATE_EXCHANGE_STATUS,
    observations?: string,
  ) {
    try {
      const exchange = await this.CertificateExchangeRepository.findOneBy({
        id,
      });

      if (!exchange) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el registro',
        });
      }

      return await this.CertificateExchangeRepository.update(exchange.id, {
        status: status,
        observations: observations,
      });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCertificateExchange(
    id: string,
    body: UpdateCertificateExchangeDTO,
  ) {
    try {
      const exchange = await this.CertificateExchangeRepository.findOneBy({
        id,
      });

      if (!exchange) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el registro',
        });
      }

      const objUpdate: Partial<CertificateExchangeEntity> = {
        certificate_code: body.certificate_code,
      };

      if (body.citizen) {
        const citizen = await this.CitizenService.findCitizenById(body.citizen);
        objUpdate.citizen = citizen;
      }

      if (body.course) {
        const course = await this.CourseRepository.findOneBy({
          id: body.course,
        });
        objUpdate.course = course;
      }

      if (body.program) {
        const program = await this.ProgramService.findProgramById(body.program);
        objUpdate.program = program;
      }

      return await this.CertificateExchangeRepository.update(
        exchange.id,
        objUpdate,
      );
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCertificateExchangeById(
    id: string,
  ): Promise<CertificateExchangeEntity> {
    try {
      const CertificateExchange: CertificateExchangeEntity =
        await this.CertificateExchangeRepository.createQueryBuilder(
          'certificate_exchange',
        )
          .where({ id })

          .leftJoinAndSelect('certificate_exchange.citizen', 'citizen')
          .leftJoinAndSelect('certificate_exchange.course', 'course')
          .leftJoinAndSelect('certificate_exchange.program', 'program')
          .leftJoinAndSelect('certificate_exchange.requester', 'requester')
          .leftJoinAndSelect('certificate_exchange.reviewer', 'reviewer')
          .getOne();
      return CertificateExchange;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteCertificateExchange(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const CertificateExchange: DeleteResult =
        await this.CertificateExchangeRepository.softDelete(id);
      if (CertificateExchange.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return CertificateExchange;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
