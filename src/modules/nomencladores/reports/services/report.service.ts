import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from '../entities/report.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  ReportDTO,
  ReportResultDTO,
  ReportUpdateDTO,
} from '../dto/report.dto';
import { ErrorManager } from '../../../../utils/error.manager';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
  ) {}

  public async createReport(
    body: ReportDTO,
  ): Promise<ReportEntity> {
    try {
      const objReport = new ReportEntity();
      objReport.name = body.name;
      return await this.reportRepository.save(objReport);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findReport(
    page: number,
    limit: number,
    search: string,
  ): Promise<ReportResultDTO> {
    try {
      const queryBuilder =
        this.reportRepository.createQueryBuilder('report');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('report.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Report, totalElements] = await queryBuilder
        .orderBy('report.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Report],
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
    key: keyof ReportDTO;
    value: any;
  }) {
    try {
      const Report =
        await this.reportRepository.createQueryBuilder('report')
          .where({ [key]: value })
          .getOne();

      return Report;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findReportById(
    id: string,
  ): Promise<ReportEntity> {
    try {
      const Report: ReportEntity =
        await this.reportRepository.createQueryBuilder('report')
          .where({ id })
          .getOne();
      return Report;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateReport(
    id: string,
    body: ReportUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const ReportToUpdate =
        await this.reportRepository.findOneBy({ id });

      if (!ReportToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Institucion',
        });
      }
      const updateData: Partial<ReportEntity> = {
        name: body.name,
      };
      return await this.reportRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteReport(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Report: DeleteResult =
        await this.reportRepository.softDelete(id);
      if (Report.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return Report;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
