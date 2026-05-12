import { BaseEntity } from "src/config";
import { PointEntity } from "src/modules/points/entities/point.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity({name: 'citizen_login'})
export class CitizenLoginEntity extends BaseEntity {
    @Column({nullable: true})
    citizen_id?: string;

    @Column({nullable: true})
    citizen_name?: string;

    @Column({ type: 'timestamp', precision: 3, nullable: true})
    logout_date?: Date

    @Column({type: 'timestamp', precision: 3, nullable: true})
    login_date?: Date

    @Column({nullable: true})
    user_agent?: string

    @Column({nullable: true})
    browser?: string

    @Column({nullable: true})
    device?: string

    @Column({nullable: true})
    os?: string

    @Column({nullable: true})
    ip?: string

    @ManyToOne(()=>PointEntity, {nullable: true})
    point?: PointEntity

}