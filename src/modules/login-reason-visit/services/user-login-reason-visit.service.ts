import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginReasonOfVisitEntity } from '../entities/user_login-reason-visit.entity';

@Injectable()
export class UserLoginReasonOfVisitService {
  constructor(
    @InjectRepository(UserLoginReasonOfVisitEntity)
    private readonly userLoginReasonOfVisitRepository: Repository<UserLoginReasonOfVisitEntity>,
  ) {}

  async createUserLoginReasonOfVisit(data: Partial<UserLoginReasonOfVisitEntity>): Promise<UserLoginReasonOfVisitEntity> {
    const newUserLoginReason = this.userLoginReasonOfVisitRepository.create(data);
    return this.userLoginReasonOfVisitRepository.save(newUserLoginReason);
  }

  // async updateUserLoginReasonOfVisit(id: string, data: Partial<UserLoginReasonOfVisitEntity>): Promise<UserLoginReasonOfVisitEntity | null> {
  //   const userLoginReason = await this.userLoginReasonOfVisitRepository.findOne(id);
  //   if (!userLoginReason) {
  //     return null;
  //   }
  //   Object.assign(userLoginReason, data);
  //   return this.userLoginReasonOfVisitRepository.save(userLoginReason);
  // }

  async getCitizenReasonCount(citizenId: string): Promise<number> {
    return this.userLoginReasonOfVisitRepository.count({ where: { citizen: { id: citizenId } } });
  }

  async getReasonUserCount(reasonId: string): Promise<number> {
    return this.userLoginReasonOfVisitRepository.count({ where: { loginReazonOfVisit: { id: reasonId } } });
  }
}
