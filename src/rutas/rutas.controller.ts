import { Controller, Get, Param,Query,BadRequestException,ParseEnumPipe } from '@nestjs/common';
import { RutasService } from './rutas.service';
import dayjs from 'dayjs';
export enum EstadoRuta {
  PENDIENTE = 'PENDIENTE',
  FINALIZADO = 'FINALIZADO'
}
export const EstadoRutaMap: Record<EstadoRuta, number> = {
  [EstadoRuta.PENDIENTE]: 0,
  [EstadoRuta.FINALIZADO]: 1,
};
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Get('tecnico')
  async obtenerRutasTecnico(
    @Query('usuario') usuario: string,
    @Query('fecha') fecha: string
  ) {
    const fechaValida = dayjs(fecha, 'YYYY-MM-DD', true);

    if (!fechaValida.isValid()) {
      throw new BadRequestException('Formato de fecha inválido. Usa YYYY-MM-DD');
    }

    return this.rutasService.obtenerRutasTecnico(
      usuario,
      fechaValida.format('YYYY-MM-DD')
    );
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
