import { BaseEntity } from 'src/config';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PointEntity } from './point.entity';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { SecurityLogsEntity } from 'src/modules/security/entities/security.entity';

@Entity({ name: 'point_history' })
export class PointHistoryEntity extends PointEntity {
    
    @PrimaryGeneratedColumn('uuid')
    history_id: string

    @ManyToOne(()=>UserEntity)
    @JoinColumn()
    changed_by: UserEntity

    @ManyToOne(()=>SecurityLogsEntity)
    @JoinColumn()
    security: SecurityLogsEntity
    
    @Column()
    changedAt: Date
}
