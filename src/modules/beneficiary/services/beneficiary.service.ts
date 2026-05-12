import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BeneficiaryEntity } from '../entities/beneficiary.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  BeneficiaryDTO,
  BeneficiaryResultDTO,
  BeneficiaryUpdateDTO,
} from '../dto/beneficiary.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { InstitutionService } from 'src/modules/nomencladores/institution/services/institution.service';
import { PoliticalLineService } from 'src/modules/nomencladores/political-line/services/political-line.service';
import { ProfessionalTitleService } from 'src/modules/nomencladores/professional-title/services/professional-title.service';
import { BeneficiaryTypeService } from 'src/modules/nomencladores/beneficiary-type/services/beneficiary-type.service';
import { AddressService } from 'src/modules/nomencladores/geolocation/services/address.service';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { FileService } from 'src/modules/file/services/file.service';
import { FILE_ENTITY_NAMES, MODULES_NAMES } from 'src/constants/enums';
import { Request } from 'express';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { SecurityService } from 'src/modules/security/services/security.service';
import { format } from 'date-fns';

@Injectable()
export class BeneficiaryService {
  constructor(
    @InjectRepository(BeneficiaryEntity)
    private readonly BeneficiaryRepository: Repository<BeneficiaryEntity>,
    private readonly InstitutionService: InstitutionService,
    private readonly PoliticalLineService: PoliticalLineService,
    private readonly ProfessionalTitleService: ProfessionalTitleService,
    private readonly BeneficiaryTypeService: BeneficiaryTypeService,
    private readonly AddressService: AddressService,
    private readonly fileService: FileService,
    private readonly SecurityService: SecurityService,
  ) {}

  public async createBeneficiary(
    body: BeneficiaryDTO,
    files: Express.Multer.File[],
    user_id: string,
    ip?: string,
  ): Promise<BeneficiaryEntity> {
    try {
      const objBeneficiary = new BeneficiaryEntity();
      objBeneficiary.name = body.name;
      objBeneficiary.alt_phone = body.alt_phone;
      objBeneficiary.cell_phone = body.cell_phone;
      objBeneficiary.email = body.email;
      objBeneficiary.facebook_link = body.facebook_link;
      objBeneficiary.gender = body.gender;
      objBeneficiary.government_affinity = body.government_affinity;
      objBeneficiary.id_value = body.id_value;
      objBeneficiary.marital_status = body.marital_status;
      objBeneficiary.phone = body.phone;
      objBeneficiary.web_link = body.web_link;
      objBeneficiary.position = body.position;
      objBeneficiary.birth_date = body.birth_date;

      if (body?.institution?.id) {
        const institution = await this.InstitutionService.findInstitutionById(
          body?.institution?.id,
        );
        objBeneficiary.institution = institution;
      }

      if (body?.address?.id) {
        const address = await this.AddressService.findAddressById(
          body?.address?.id,
        );
        objBeneficiary.address = address;
      }

      if (body?.political_line?.id) {
        const politicalLine =
          await this.PoliticalLineService.findPoliticalLineById(
            body?.political_line?.id,
          );
        objBeneficiary.political_line = politicalLine;
      }

      if (body?.title?.id) {
        const title =
          await this.ProfessionalTitleService.findProfessionalTitleById(
            body?.title?.id,
          );

        objBeneficiary.title = title;
      }

      if (body?.type?.id) {
        const type = await this.BeneficiaryTypeService.findBeneficiaryTypeById(
          body?.type?.id,
        );
        objBeneficiary.type = type;
      }

      const CreatedBeneficiary = await this.BeneficiaryRepository.save(
        objBeneficiary,
      );

      if (files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.BENEFICIARY,
          relationshipName: 'beneficiary',
          valueRelationship: CreatedBeneficiary.id,
        };
        this.fileService.createFile(files, optionsFiles);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.CREATE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'beneficiary',
        entry_id: CreatedBeneficiary.id,
        ip,
      });

      return CreatedBeneficiary;
    } catch (error) {
      console.log(error);
      console.log(error);
      throw new Error(error);
    }
  }

  public async addFiles(id: string, files: Express.Multer.File[]) {
    try {
      const beneficiary = await this.BeneficiaryRepository.findOneBy({ id });

      if (!beneficiary) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el beneficiarye',
        });
      }

      const optionsFiles: FileOptionsDTO = {
        moduleName: 'beneficiary',
        relationshipName: 'beneficiary',
        valueRelationship: beneficiary.id,
      };
      this.fileService.createFile(files, optionsFiles);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBeneficiary(
    page: number,
    limit: number,
    req: Request,
  ): Promise<BeneficiaryResultDTO> {
    try {
      const queryBuilder =
        this.BeneficiaryRepository.createQueryBuilder('beneficiary');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `beneficiary.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} beneficiary.name ILIKE '%${
            req.query.search
          }%' OR  beneficiary.position ILIKE '%${
            req.query.search
          }%' OR  beneficiary.id_value ILIKE '%${
            req.query.search
          }%' OR  beneficiary.facebook_link ILIKE '%${
            req.query.search
          }%'  OR  beneficiary.web_link ILIKE '%${req.query.search}%'`,
        );
      }

      console.log(query_string);

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Beneficiary, totalElements] = await queryBuilder
        .leftJoinAndSelect('beneficiary.type', 'type')
        .leftJoinAndSelect('beneficiary.address', 'address')
        .leftJoinAndSelect('beneficiary.title', 'title')
        .leftJoinAndSelect('beneficiary.institution', 'institution')
        .leftJoinAndSelect('beneficiary.political_line', 'political_line')
        .leftJoinAndSelect('beneficiary.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .orderBy('beneficiary.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Beneficiary],
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
    key: keyof BeneficiaryDTO;
    value: any;
  }) {
    try {
      const Beneficiary = await this.BeneficiaryRepository.createQueryBuilder(
        'Beneficiary',
      )
        .where({ [key]: value })
        .leftJoinAndSelect('beneficiary.type', 'type')
        .leftJoinAndSelect('beneficiary.address', 'address')
        .leftJoinAndSelect('beneficiary.title', 'title')
        .leftJoinAndSelect('beneficiary.institution', 'institution')
        .leftJoinAndSelect('beneficiary.political_line', 'political_line')
        .getOne();

      const files = await this.fileService.findByEntityId(
        Beneficiary.id,
        FILE_ENTITY_NAMES.BENEFICIARY,
      );

      Beneficiary.files = files;

      return Beneficiary;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBeneficiaryById(id: string): Promise<BeneficiaryEntity> {
    try {
      const Beneficiary: BeneficiaryEntity =
        await this.BeneficiaryRepository.createQueryBuilder('beneficiary')
          .where({ id })
          .leftJoinAndSelect('beneficiary.type', 'type')
          .leftJoinAndSelect('beneficiary.address', 'address')
          .leftJoinAndSelect('beneficiary.title', 'title')
          .leftJoinAndSelect('beneficiary.institution', 'institution')
          .leftJoinAndSelect('beneficiary.political_line', 'political_line')
          .getOne();

      if (Beneficiary) {
        const files = await this.fileService.findByEntityId(
          Beneficiary?.id,
          FILE_ENTITY_NAMES.BENEFICIARY,
        );
        Beneficiary.files = files;
      }

      return Beneficiary;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateBeneficiary(
    id: string,
    body: BeneficiaryUpdateDTO,
    files: Express.Multer.File[],
    user_id: string,
    ip?: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const BeneficiaryToUpdate = await this.BeneficiaryRepository.findOneBy({
        id,
      });

      if (!BeneficiaryToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la beneficiarios',
        });
      }

      let birth_date = body?.birth_date;

      if (body.birth_date) {
        birth_date = format(new Date(birth_date), 'yyyy-MM-dd');
      }

      const updateData: Partial<BeneficiaryEntity> = {
        name: body.name,
        alt_phone: body.alt_phone,
        cell_phone: body.cell_phone,
        email: body.email,
        facebook_link: body.facebook_link,
        gender: body.gender,
        government_affinity: body.government_affinity,
        id_value: body.id_value,
        marital_status: body.marital_status,
        phone: body.phone,
        web_link: body.web_link,
        position: body.position,
        birth_date: birth_date,
      };

      if (body?.institution?.id) {
        const institution = await this.InstitutionService.findInstitutionById(
          body?.institution?.id,
        );
        updateData.institution = institution;
      }

      if (body?.address?.id) {
        const address = await this.AddressService.findAddressById(
          body?.address?.id,
        );
        updateData.address = address;
      }

      if (body?.political_line?.id) {
        const politicalLine =
          await this.PoliticalLineService.findPoliticalLineById(
            body?.political_line?.id,
          );

        updateData.political_line = politicalLine;
      }

      if (body?.title?.id) {
        const title =
          await this.ProfessionalTitleService.findProfessionalTitleById(
            body?.title?.id,
          );
        updateData.title = title;
      }

      if (body?.type?.id) {
        const type = await this.BeneficiaryTypeService.findBeneficiaryTypeById(
          body?.type?.id,
        );
        updateData.type = type;
      }

      const objUpdated = await this.BeneficiaryRepository.update(
        id,
        updateData,
      );
      if (objUpdated.affected > 0 && files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.BENEFICIARY,
          relationshipName: 'beneficiary',
          valueRelationship: BeneficiaryToUpdate.id,
        };
        await this.fileService.deleteAndCreateFile(files, optionsFiles);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'beneficiary',
        entry_id: BeneficiaryToUpdate.id,
        ip,
      });

      return objUpdated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteBeneficiary(
    id: string,
    user_id: string,
    ip?: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Beneficiary: DeleteResult =
        await this.BeneficiaryRepository.softDelete(id);
      if (Beneficiary.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'beneficiary',
        entry_id: id,
        ip,
      });

      return Beneficiary;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
