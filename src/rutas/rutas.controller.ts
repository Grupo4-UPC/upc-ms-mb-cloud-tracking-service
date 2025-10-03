import { Controller, Get, Param,Query  } from '@nestjs/common';
import { RutasService } from './rutas.service';

@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Get('tecnico')
  async obtenerRutasTecnico(
    @Query('id') id: string,
    @Query('fecha') fecha: string,
    @Query('estado') estado: number
  ) {
    return this.rutasService.obtenerRutasTecnico(String(id), fecha,estado);
  }
  @Get('estados')
  async obtenerEstados() {
    return this.rutasService.obtenerEstados();
  }
  @Get('estados/:id/subestados')
  async obtenerSubEstados(@Param('id') id: number) {
    return this.rutasService.obtenerSubEstadosPorEstado(id);
  }
}
