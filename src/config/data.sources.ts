import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

ConfigModule.forRoot();

const configService = new ConfigService();

// si no se referencian bien los a entitites y
// migrations no dara error pero va a decir que no hay migraciones que ejecutar

export const DataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  // entities: [ProjectEntity, UserEntity, UsersProjectsEntity],
  entities: [__dirname + '/../**/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
  synchronize: true,
  migrationsRun: true,
  
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  
};

export const AppDS = new DataSource(DataSourceConfig);
