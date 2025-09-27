import { Controller, Get, Param } from '@nestjs/common';
import { RutasService } from './rutas.service';

@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Get('tecnico/:id/fecha/:fecha')
  async getRutasByTecnicoAndFecha(
    @Param('id') id: string,
    @Param('fecha') fecha: string,
  ) {
    return this.rutasService.findByTecnicoAndFecha(Number(id), fecha);
  }
}
