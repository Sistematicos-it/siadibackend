import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { FaceToFaceTrainingEntity } from './entities/face-to-face-training.entity';
import { FaceToFaceTrainingService } from './services/face-to-face-training.service';
import { FaceToFaceTrainingController } from './controllers/face-to-face-training.controller';
import { FileService } from 'src/modules/file/services/file.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([FaceToFaceTrainingEntity])],
  providers: [FaceToFaceTrainingService, FileService],
  controllers: [FaceToFaceTrainingController],
  exports: [FaceToFaceTrainingService, FileService, TypeOrmModule],
})
export class FaceToFaceTrainingsModule {}
