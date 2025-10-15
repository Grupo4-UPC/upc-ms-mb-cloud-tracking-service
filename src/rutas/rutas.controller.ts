import { Controller, Get, Param, Query, BadRequestException, Put, Body,ParseIntPipe,Post,UploadedFile, UseInterceptors} from '@nestjs/common';
import { RutasService } from './rutas.service';
import dayjs from 'dayjs';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Controller, Get, Param, Query, BadRequestException, Put, Body } from '@nestjs/common';
import { RutasService } from './rutas.service';
import dayjs from 'dayjs';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';

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
  constructor(private readonly rutasService: RutasService) { }

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
  @Get('detalle/:idRuta')
  async obtenerDetalleRuta(
    @Param('idRuta') idRuta: number
  ) {
    return this.rutasService.obtenerDetalleRuta(idRuta);
  }

  

  @Get('estados')
  async obtenerEstados() {
    return this.rutasService.obtenerEstados();
  }

  @Get('estados/:id/subestados')
  async obtenerSubEstados(@Param('id') id: number) {
    return this.rutasService.obtenerSubEstadosPorEstado(id);
  }

  @Put('pedidos/:idOrder')
  async actualizarPedido(
    @Param('idOrder') idOrder: number,
    @Body() actualizarPedidoDto: ActualizarPedidoDto
  ) {
    return this.rutasService.update(idOrder, actualizarPedidoDto);
  }
 /* @Post('subir-firma/:idRuta')
  @UseInterceptors(FileInterceptor('file')) // 👈 ESTA LÍNEA ES CLAVE
  async subirFirma(
    @Param('idRuta', ParseIntPipe) idRuta: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha recibido ningún archivo');
    }

    return this.rutasService.subirFirma(idRuta, file);
  } */

   @Post('subir-firma/:idRuta')
@UseInterceptors(FileInterceptor('file'))
async subirFirma(
  @Param('idRuta', ParseIntPipe) idRuta: number,
  @UploadedFile() file: Express.Multer.File,
   @Body('tipo') tipo: 'firma' | 'evidencia',
) {
  if (!file) {
    throw new BadRequestException('No se ha recibido ningún archivo');
  }

  
  return this.rutasService.subirFirma(idRuta, file,tipo);
}
}
