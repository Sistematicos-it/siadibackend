import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitRecordEntity } from '../entities/visit-record.entity';
import { Between, DeleteResult, Not, Repository, UpdateResult } from 'typeorm';
import { VisitRecordDTO, VisitRecordResultDTO, iCanton, iPDG, iProvince, iRegion } from '../dto/visit-record.dto';
import { ErrorManager } from '../../../utils/error.manager';

import { VisitTypeService } from 'src/modules/visit-type/services/visit-type.service';
import { PointService } from 'src/modules/points/services/point.service';
import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { IVisitCount } from 'src/modules/visit-type/interfaces/visit-type.interface';
import { VISIT_TYPES } from 'src/constants/visit-types';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { endOfDay, startOfDay, differenceInYears } from 'date-fns';
import {
  ITotalVisits,
  IVisitRecord,
} from '../interfaces/visit-record.interface';
import { DashboardService } from 'src/modules/dashboard/services/dashboard.service';
import { CitizenVulneraabilityVisitsEntity } from '../entities/citizen-visits-by-vulnerability.entity';
import { VisitRecordView } from 'src/modules/dashboard/entities/visitRecordView.entity';
import { ethnicity } from 'src/modules/citizen/interfaces/citizen.interface';
import { GENDERS } from 'src/modules/employee/interfaces/employee.interface';

@Injectable()
export class VisitRecordService {
  constructor(
    @InjectRepository(VisitRecordEntity)
    private readonly VisitRecordRepository: Repository<VisitRecordEntity>,

    @InjectRepository(PointEntity)
    private readonly PointRepository: Repository<PointEntity>,

    @InjectRepository(CitizenVulneraabilityVisitsEntity)
    private readonly CitizenVulneraabilityVisitsRepository: Repository<CitizenVulneraabilityVisitsEntity>,
    @InjectRepository(VisitRecordView)
    private readonly VisitRecordViewRepository: Repository<VisitRecordView>,

    private readonly VisitTypeService: VisitTypeService,
    private readonly PointService: PointService,
    private readonly CitizenService: CitizenService,
    private readonly DashBoardService: DashboardService,
  ) {}

  public async createVisitRecord(
    body: Partial<VisitRecordDTO>,
  ): Promise<VisitRecordEntity> {
    try {
      let objVisitRecord = new VisitRecordEntity();

      const visitType = await this.VisitTypeService.findBy({
        key: 'value',
        value: body.visit_type,
      });

      objVisitRecord.date = body?.date;
      objVisitRecord.citizen = body?.citizen;
      objVisitRecord.point = body?.point;
      objVisitRecord.visit_type = visitType;

      if (
        visitType?.value === VISIT_TYPES.FACE_TO_FACE ||
        visitType?.value === VISIT_TYPES.ON_SITE
      ) {
        const visitExits = await this.VisitRecordRepository.createQueryBuilder(
          'visit_record',
        )
          .leftJoin('visit_record.visit_type', 'visit_type')
          .leftJoin('visit_record.citizen', 'citizen')
          .where('visit_type.value = :value', { value: visitType?.value })
          .andWhere('citizen.id = :id', { id: body?.citizen?.id })
          .andWhere('visit_record.date >= CURRENT_DATE')
          .getOne();

        if (visitExits) {
          return null;
        }
      }

      return await this.VisitRecordRepository.save(objVisitRecord);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findVisitRecord(
    page: number,
    limit: number,
  ): Promise<VisitRecordResultDTO> {
    try {
      const queryBuilder =
        this.VisitRecordRepository.createQueryBuilder('visit_record');

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [VisitRecord, totalElements] = await queryBuilder
        .leftJoinAndSelect('visit_record.visit_type', 'type')
        .leftJoinAndSelect('visit_record.point', 'point')
        .leftJoinAndSelect('visit_record.citizen', 'citizen')
        .orderBy('visit_record.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...VisitRecord],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async generateVisitRecordPerPoint(point_ids?: string[]) {
    try {
      const points = await this.PointRepository.createQueryBuilder('point')
        .where('point.id IN (:...ids)', { ids: point_ids })
        .orderBy('point.createdAt')
        .getMany();

      const [visits, count] =
        await this.VisitRecordViewRepository.createQueryBuilder(
          'visit_record_view',
        )
          .where('point_id IN (:...ids)', { ids: point_ids })
          .getManyAndCount();
      let VisitRecord: ITotalVisits[] = [
        {
          age_adolescent: 0,
          age_baby: 0,
          age_early_adulthood: 0,
          age_mayor_adult: 0,
          age_middle_adult: 0,
          age_preescholar_kid: 0,
          age_primary_kid: 0,
          age_small_kid: 0,
          age_young_adult: 0,
          entnicithy_afroecuadorian: 0,
          entnicithy_halfbreed: 0,
          entnicithy_native: 0,
          entnicithy_white: 0,
          hasLittleChildren: 0,
          isPregnant: 0,
          point_name: 'Total',
          point_id: 'Total',
          total: 0,
          total_adults: 0,
          total_man: 0,
          total_under_age: 0,
          total_woman: 0,
        },
      ];

      visits.forEach((_visit) => {
        if (
          !VisitRecord.find((v) => {
            return v?.point_id === _visit.point_id;
          })
        ) {
          VisitRecord.push({
            age_adolescent: 0,
            age_baby: 0,
            age_early_adulthood: 0,
            age_mayor_adult: 0,
            age_middle_adult: 0,
            age_preescholar_kid: 0,
            age_primary_kid: 0,
            age_small_kid: 0,
            age_young_adult: 0,
            entnicithy_afroecuadorian: 0,
            entnicithy_halfbreed: 0,
            entnicithy_native: 0,
            entnicithy_white: 0,
            hasLittleChildren: 0,
            isPregnant: 0,
            point_name: _visit?.point_name,
            point_id: _visit?.point_id,
            total: 0,
            total_adults: 0,
            total_man: 0,
            total_under_age: 0,
            total_woman: 0,
          });
        }
      });

      for (let i = 0; i < visits.length; i++) {
        VisitRecord.forEach((_vr, j) => {
          if (_vr?.point_id === visits[i].point_id) {
            if (
              differenceInYears(new Date(), new Date(visits[i].birth_date)) < 3
            ) {
              VisitRecord[j].age_baby += 1;
              VisitRecord[j].total_under_age += 1;
              VisitRecord[0].age_baby += 1;
              VisitRecord[0].total_under_age += 1;
            }
            if (
              differenceInYears(new Date(), new Date(visits[i].birth_date)) <
                5 &&
              differenceInYears(new Date(), new Date(visits[i].birth_date)) > 2
            ) {
              VisitRecord[j].age_small_kid += 1;
              VisitRecord[j].total_under_age += 1;
              VisitRecord[0].age_small_kid += 1;
              VisitRecord[0].total_under_age += 1;
            }

            if (
              differenceInYears(new Date(), new Date(visits[i].birth_date)) <
                7 &&
              differenceInYears(new Date(), new Date(visits[i].birth_date)) > 4
            ) {
              VisitRecord[j].age_preescholar_kid += 1;
              VisitRecord[j].total_under_age += 1;
              VisitRecord[0].age_preescholar_kid += 1;
              VisitRecord[0].total_under_age += 1;
            }
            if (
              differenceInYears(new Date(), new Date(visits[i].birth_date)) <
                12 &&
              differenceInYears(new Date(), new Date(visits[i].birth_date)) > 6
            ) {
              VisitRecord[j].age_primary_kid += 1;
              VisitRecord[j].total_under_age += 1;
              VisitRecord[0].age_primary_kid += 1;
              VisitRecord[0].total_under_age += 1;
            }
            if (
              differenceInYears(new Date(), new Date(visits[i].birth_date)) <
                18 &&
              differenceInYears(new Date(), new Date(visits[i].birth_date)) > 12
            ) {
              VisitRecord[j].age_adolescent += 1;
              VisitRecord[j].total_under_age += 1;
              VisitRecord[0].age_adolescent += 1;
              VisitRecord[0].total_under_age += 1;
            }
            if (
              differenceInYears(new Date(), new Date(visits[i].birth_date)) <
                21 &&
              differenceInYears(new Date(), new Date(visits[i].birth_date)) > 17
            ) {
              VisitRecord[j].age_young_adult += 1;
              VisitRecord[j].total_adults += 1;
              VisitRecord[0].age_young_adult += 1;
              VisitRecord[0].total_adults += 1;
            }
            if (
              differenceInYears(new Date(), new Date(visits[i].birth_date)) <
                40 &&
              differenceInYears(new Date(), new Date(visits[i].birth_date)) > 20
            ) {
              VisitRecord[j].age_early_adulthood += 1;
              VisitRecord[j].total_adults += 1;
              VisitRecord[0].age_early_adulthood += 1;
              VisitRecord[0].total_adults += 1;
            }
            if (
              differenceInYears(new Date(), new Date(visits[i].birth_date)) <
                60 &&
              differenceInYears(new Date(), new Date(visits[i].birth_date)) > 39
            ) {
              VisitRecord[j].age_middle_adult += 1;
              VisitRecord[j].total_adults += 1;
              VisitRecord[0].age_middle_adult += 1;
              VisitRecord[0].total_adults += 1;
            }
            if (
              differenceInYears(new Date(), new Date(visits[i].birth_date)) > 59
            ) {
              VisitRecord[j].age_mayor_adult += 1;
              VisitRecord[j].total_adults += 1;

              VisitRecord[0].age_mayor_adult += 1;
              VisitRecord[0].total_adults += 1;
            }

            if (visits[i]?.ethnicity === ethnicity.afro_ecuadorian) {
              VisitRecord[j].entnicithy_afroecuadorian += 1;
              VisitRecord[0].entnicithy_afroecuadorian += 1;
            }
            if (visits[i]?.ethnicity === ethnicity.half_blood) {
              VisitRecord[j].entnicithy_halfbreed += 1;
              VisitRecord[0].entnicithy_halfbreed += 1;
            }
            if (visits[i]?.ethnicity === ethnicity.native) {
              VisitRecord[j].entnicithy_native += 1;
              VisitRecord[0].entnicithy_native += 1;
            }
            if (visits[i]?.ethnicity === ethnicity.white) {
              VisitRecord[j].entnicithy_white += 1;
              VisitRecord[0].entnicithy_white += 1;
            }

            if (visits[i]?.is_pregnant) {
              VisitRecord[j].isPregnant += 1;
              VisitRecord[0].isPregnant += 1;
            }
            if (visits[i]?.has_under_age_kids) {
              VisitRecord[j].hasLittleChildren += 1;
              VisitRecord[0].hasLittleChildren += 1;
            }

            if (visits[i]?.gender === GENDERS.MALE) {
              VisitRecord[j].total_man += 1;
              VisitRecord[0].total_man += 1;
            }
            if (visits[i]?.gender === GENDERS.FEMALE) {
              VisitRecord[j].total_woman += 1;
              VisitRecord[0].total_woman += 1;
            }

            VisitRecord[j].total += 1;
            VisitRecord[0].total += 1;
          }
        });
      }

      return VisitRecord;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async filterByCitizen(
    page: number,
    limit: number,
    citizen_id: string,
  ) {
    try {
      const citizen = await this.CitizenService.findCitizenById(citizen_id);

      if (!citizen) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el ciudadano',
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const [VisitRecord, totalElements] =
        await this.VisitRecordRepository.createQueryBuilder('visit_record')
          .leftJoinAndSelect('visit_record.visit_type', 'type')
          .leftJoinAndSelect('visit_record.point', 'point')
          .leftJoinAndSelect('visit_record.citizen', 'citizen')
          .where('citizen.id = :id', { id: citizen.id })
          .orderBy('visit_record.updatedAt', 'DESC')
          .skip((pageNumber - 1) * pageLimit)
          .take(pageLimit)
          .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...VisitRecord],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async filterByPoint(page: number, limit: number, point_id: string) {
    try {
      const point = await this.PointService.findPointById(point_id);

      if (!point) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el punto',
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const [VisitRecord, totalElements] =
        await this.VisitRecordRepository.createQueryBuilder('visit_record')
          .leftJoinAndSelect('visit_record.visit_type', 'type')
          .leftJoinAndSelect('visit_record.point', 'point')
          .leftJoinAndSelect('visit_record.citizen', 'citizen')
          .where('point.id = :id', { id: point.id })
          .orderBy('visit_record.updatedAt', 'DESC')
          .skip((pageNumber - 1) * pageLimit)
          .take(pageLimit)
          .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...VisitRecord],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async filterByType(page: number, limit: number, type_id: string) {
    try {
      const type = await this.VisitTypeService.findVisitTypeById(type_id);

      if (!type) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el tipo',
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const [VisitRecord, totalElements] =
        await this.VisitRecordRepository.createQueryBuilder('visit_record')
          .leftJoinAndSelect('visit_record.visit_type', 'type')
          .leftJoinAndSelect('visit_record.point', 'point')
          .leftJoinAndSelect('visit_record.citizen', 'citizen')
          .where('type.id = :id', { id: type.id })
          .orderBy('visit_record.updatedAt', 'DESC')
          .skip((pageNumber - 1) * pageLimit)
          .take(pageLimit)
          .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...VisitRecord],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getVisitTotalsByDate(start_date: Date, end_date: Date) {
    try {
      let visits = await this.VisitRecordRepository.find({
        where: {
          date: Between(startOfDay(start_date), endOfDay(end_date)),
        },
        relations: {
          point: {
            address: { parish: { canton: { province: { region: true } } } },
          },
          visit_type: true,
        },
      });

      visits = visits.filter((visit) => visit.point !== null);      
      let Regions = [];

      visits.forEach((visit) => {
        if (
          !Regions.find(
            (_region) =>
              _region?.id ===
              visit.point?.address?.parish?.canton?.province?.region?.id,
          )
        ) {
          Regions.push(visit.point?.address?.parish?.canton?.province?.region);
        }
      });

      let Provinces = [];

      visits.forEach((visit) => {
        if (
          !Provinces.find(
            (_province) =>
              _province?.id ===
              visit.point?.address?.parish?.canton?.province?.id,
          )
        ) {
          Provinces.push(visit.point?.address?.parish?.canton?.province);
        }
      });

      let Cantons = [];
      visits.forEach((visit) => {
        if (
          !Cantons.find(
            (_canton) =>
              _canton?.id === visit.point?.address?.parish?.canton?.id,
          )
        ) {
          Cantons.push(visit.point?.address?.parish?.canton);
        }
      });

      let objGeoChainArray = [];

      Regions.forEach((region) => {
        let objGeoChain = {
          region: region,
          provinces: [],
        };

        Provinces.forEach((province) => {
          let objProvinceChain = {
            province: province,
            cantons: [],
          };

          Cantons.forEach((canton) => {
            if (canton?.province?.id === province?.id) {
              objProvinceChain.cantons.push(canton);
            }
          });

          if (province?.region?.id === region?.id) {
            objGeoChain.provinces.push(objProvinceChain);
          }
        });

        objGeoChainArray.push(objGeoChain);
      });

      let points: PointEntity[] = [];

      visits.forEach((visit) => {
        if (!points.find((point) => point?.id === visit?.point?.id)) {
          points.push(visit?.point);
        }
      });

      let totals = {
        facetoface: 0,
        visit: 0,
        virtual: 0,
        on_site: 0,
      };

      let final_geo_stats = [];

      objGeoChainArray.forEach((chain) => {
        let region_stats = {
          region: chain?.region?.name,
          facetoface: 0,
          visit: 0,
          virtual: 0,
          on_site: 0,
          total: 0,
          provinces: [],
        };

        chain?.provinces.forEach((province) => {
          if (
            region_stats?.provinces.find(
              (_province) => _province?.id === province?.id,
            )
          ) {
            return null;
          }
          let province_stats = {
            province: province?.province?.name,
            facetoface: 0,
            visit: 0,
            virtual: 0,
            on_site: 0,
            total: 0,
            cantons: [],
          };

          province.cantons.forEach((canton) => {
            if (
              province_stats.cantons.find(
                (_canton) => _canton?.id === canton?.id,
              )
            ) {
              return null;
            }

            let canton_stats = {
              canton: canton?.name,
              facetoface: 0,
              visit: 0,
              virtual: 0,
              on_site: 0,
              total: 0,
              points: [],
            };

            points.forEach((point) => {
              if (point?.address?.parish?.canton?.id === canton?.id) {
                let arranged_visit = {
                  point: point?.name,
                  facetoface: 0,
                  visit: 0,
                  virtual: 0,
                  total: 0,
                  on_site: 0,
                };

                visits.forEach((visit) => {
                  if (visit.point.id === point.id) {
                    if (visit.visit_type.value === VISIT_TYPES.FACE_TO_FACE) {
                      arranged_visit.facetoface = arranged_visit.facetoface + 1;
                      arranged_visit.total++;
                      canton_stats.facetoface = canton_stats.facetoface + 1;
                      canton_stats.total++;
                      province_stats.facetoface = province_stats.facetoface + 1;
                      province_stats.total++;
                      region_stats.facetoface = region_stats.facetoface + 1;
                      region_stats.total++;
                      totals.facetoface = totals.facetoface + 1;
                    }
                    if (visit.visit_type.value === VISIT_TYPES.ON_SITE) {
                      arranged_visit.on_site = arranged_visit.on_site + 1;
                      arranged_visit.total++;
                      canton_stats.total++;
                      province_stats.total++;
                      region_stats.total++;
                      canton_stats.on_site = canton_stats.on_site + 1;
                      province_stats.on_site = province_stats.on_site + 1;
                      region_stats.on_site = region_stats.on_site + 1;
                      totals.on_site = totals.on_site + 1;
                    }
                    if (visit.visit_type.value === VISIT_TYPES.VIRTUAL) {
                      arranged_visit.virtual = arranged_visit.virtual + 1;
                      arranged_visit.total++;
                      canton_stats.total++;
                      province_stats.total++;
                      region_stats.total++;
                      canton_stats.virtual = canton_stats.virtual + 1;
                      province_stats.virtual = province_stats.virtual + 1;
                      region_stats.virtual = region_stats.virtual + 1;
                      totals.virtual = totals.virtual + 1;
                    }
                    if (visit.visit_type.value === VISIT_TYPES.VISIT) {
                      arranged_visit.visit = arranged_visit.visit + 1;
                      arranged_visit.total++;
                      canton_stats.total++;
                      province_stats.total++;
                      region_stats.total++;
                      canton_stats.visit = canton_stats.visit + 1;
                      province_stats.visit = province_stats.visit + 1;
                      region_stats.visit = region_stats.visit + 1;
                      totals.visit = totals.visit + 1;
                    }
                  }
                });

                canton_stats.points.push(arranged_visit);
              }
            });
            province_stats.cantons.push(canton_stats);
          });
          region_stats.provinces.push(province_stats);
        });

        final_geo_stats.push(region_stats);
      });   

      return { regions: final_geo_stats, total: totals };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
  /*** 
   * Utilizada para totalizar las visitas de los PDG por zona geográfica
   * **/
  public async summarizeVisitTotalsByDate(start_date: Date, end_date: Date) {
    try {
      const visits = await this.VisitRecordRepository.find({
        where: { date: Between(startOfDay(start_date), endOfDay(end_date)) },
        relations: {
          point: {
            address: { parish: { canton: { province: { region: true } } } },
          },
          visit_type: true,
        },
      });
  
      const filteredVisits = visits.filter(visit => visit.point !== null);

      const regionMap = new Map<string, iRegion>();
  
      filteredVisits.forEach(visit => {
        const region = visit?.point?.address?.parish?.canton?.province?.region;
        const province = visit?.point?.address?.parish?.canton?.province;
        const canton = visit?.point?.address?.parish?.canton;
        const point = visit?.point;
  
        if (!regionMap.has(region.id)) {
          regionMap.set(region.id, { region: region.name, provinces: new Map<string, iProvince>(),
            facetoface: 0, visit: 0, virtual: 0, on_site: 0, total: 0 });
        }
  
        const regionStats = regionMap.get(region.id);
        if (!regionStats.provinces.has(province.id)) {
          regionStats.provinces.set(province.id, { province: province.name, cantons: new Map<string, iCanton>(),
            facetoface: 0, visit: 0, virtual: 0, on_site: 0, total: 0 });
        }
  
        const provinceStats = regionStats.provinces.get(province.id);
        if (!provinceStats.cantons.has(canton.id)) {
          provinceStats.cantons.set(canton.id, { canton: canton.name, points: new Map<string, iPDG>(),
            facetoface: 0, visit: 0, virtual: 0, on_site: 0, total: 0 });
        }
  
        const cantonStats = provinceStats.cantons.get(canton.id);
        if (!cantonStats.points.has(point.id)) {
          cantonStats.points.set(point.id, { point: point.name,
            facetoface: 0, visit: 0, virtual: 0, on_site: 0, total: 0 });
        }
      });
  
      const totals = {
        facetoface: 0,
        visit: 0,
        virtual: 0,
        on_site: 0,
        total: 0,
      };
  
      filteredVisits.forEach(visit => {
        const point = visit.point;
        const canton = visit.point?.address?.parish?.canton;
        const province = visit.point?.address?.parish?.canton?.province;
        const region = visit.point?.address?.parish?.canton?.province.region;        
        const visitTypeValue = visit.visit_type.value;
  
        const updateStats = (stats: any, type: string) => {
          if(type === VISIT_TYPES.FACE_TO_FACE) stats["facetoface"]++;
          if(type === VISIT_TYPES.VISIT) stats["visit"]++;
          if(type === VISIT_TYPES.VIRTUAL) stats["virtual"]++;
          if(type === VISIT_TYPES.ON_SITE) stats["on_site"]++;
          stats.total++;
        };
  
        updateStats(totals, visitTypeValue);
  
        const regionStats = regionMap.get(region.id);
        updateStats(regionStats, visitTypeValue);
  
        //const provinceStats = provinceMap.get(province.id);
        const provinceStats = regionStats.provinces.get(province.id);
        updateStats(provinceStats, visitTypeValue);
          
        //const cantonStats = cantonMap.get(canton.id);
        const cantonStats = provinceStats.cantons.get(canton.id);
        updateStats(cantonStats, visitTypeValue);

        //const pointStats = pointMap.get(point.id);
        const pointStats = cantonStats.points.get(point.id);
        updateStats(pointStats, visitTypeValue);
      });
      console.log(regionMap);
      let finalGeoStats = new Array<any>();
      finalGeoStats = Array.from(regionMap.values()).map(region => {
        const provinces = Array.from(region.provinces.values()).map(province => {
          const cantons = Array.from(province.cantons.values()).map(canton => {
            const points = Array.from(canton.points.values());
            return { ...canton, points };
          });
          return { ...province, cantons };
        });
        return { ...region, provinces };
      });
  
      return { regions: finalGeoStats, total: totals };
    } catch (error) {
      console.error(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
  
  public async getCountByPoint(point_id: string) {
    try {
      let count: IVisitCount[] = [];

      const types = await this.VisitTypeService.findVisitType();

      const point = await this.PointService.findPointById(point_id);

      if (!point) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el punto',
        });
      }

      await types.forEach(async (type) => {
        const [VisitRecord, totalElements] =
          await this.VisitRecordRepository.createQueryBuilder('visit_record')
            .leftJoinAndSelect('visit_record.visit_type', 'type')
            .leftJoinAndSelect('visit_record.point', 'point')
            .leftJoinAndSelect('visit_record.citizen', 'citizen')
            .where('point.id = :id', { id: point.id })
            .andWhere('type.id = :type_id', { type_id: type.id })
            .orderBy('visit_record.updatedAt', 'DESC')
            .getManyAndCount();

        count.push({ type: type?.name, count: totalElements });
      });

      return { point: point, count };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({
    key,
    value,
  }: {
    key: keyof VisitRecordDTO;
    value: any;
  }) {
    try {
      const VisitRecord = await this.VisitRecordRepository.createQueryBuilder(
        'visit_record',
      )
        .where({ [key]: value })
        .leftJoinAndSelect('visit_record.visit_type', 'type')
        .leftJoinAndSelect('visit_record.point', 'point')
        .leftJoinAndSelect('visit_record.citizen', 'citizen')
        .getOne();

      return VisitRecord;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findVisitRecordById(id: string): Promise<VisitRecordEntity> {
    try {
      const VisitRecord: VisitRecordEntity =
        await this.VisitRecordRepository.createQueryBuilder('visit_record')
          .where({ id })
          .leftJoinAndSelect('visit_record.visit_type', 'type')
          .leftJoinAndSelect('visit_record.point', 'point')
          .leftJoinAndSelect('visit_record.citizen', 'citizen')
          .getOne();
      return VisitRecord;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteVisitRecord(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const VisitRecord: DeleteResult =
        await this.VisitRecordRepository.softDelete(id);
      if (VisitRecord.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return VisitRecord;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
