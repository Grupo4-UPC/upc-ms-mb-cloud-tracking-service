import { Module } from '@nestjs/common';
import { RutasService } from './rutas.service';
import { RutasController } from './rutas.controller';
import { MulterModule } from '@nestjs/platform-express';
@Module({ imports: [
    MulterModule.register({
      dest: './uploads', // o solo para activar el interceptor
    }),
  ],
  controllers: [RutasController],
  providers: [RutasService],
})
export class RutasModule {}