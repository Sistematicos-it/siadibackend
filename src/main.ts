import { ConfigService, registerAs } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import * as morgan from 'morgan';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as express from 'express';
import { AppModule } from './app.module';
import { CORS } from './constants';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  dayjs.extend(timezone);
  dayjs.tz.setDefault('America/Merida');

  app.use(morgan('dev')); //Usar morgan para ver los logs de las peticiones, solo como herramienta de desarrollo

  // Esto lo que me va a permitir es poder validar en los DTo con class validator
  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException(result);
      },
    }),
  );

  // Este codigo lo que hace junto con el Exclude() de Class-Transform es evitar de que la contraseña salga en los resultados de las consultas
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  const configService = app.get(ConfigService); //configService.get('PORT') -> forma de llamar a una variable de entorno

  app.enableCors(CORS); //Habilitar los CORS

  app.setGlobalPrefix('api'); //Esto es para que todos los endpoint empiecen con el prefijo api

  const config = new DocumentBuilder()
    .setTitle('SIADI_BACKEND')
    .setDescription('The SIADI API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Configurar la carpeta pública
  app.use(express.static(path.join(__dirname, '../uploads')));

  await app.listen(configService.get('PORT') || 3000);
  console.log(`Applications running on: ${await app.getUrl()}`);
}
bootstrap();
