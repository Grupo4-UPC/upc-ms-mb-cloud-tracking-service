import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RutasModule } from './rutas/rutas.module';

@Module({
  imports: [DatabaseModule, RutasModule],
})
export class AppModule {}