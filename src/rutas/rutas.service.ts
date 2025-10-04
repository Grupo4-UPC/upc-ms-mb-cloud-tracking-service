import { Injectable, Inject,InternalServerErrorException  } from '@nestjs/common';
import { Pool } from 'pg';
export interface Ruta {
  id_ruta: number;                          // r.id_ruta
  fecha: string;                            // r.fecha
  estado_ruta: number;                      // r.id_estado_ruta
  estado_servicio_desc: string;             // e.estado_desc
  subestado_servicio_desc?: string | null;  // s.subestado_desc (puede ser null)
  tecnico: string;                          // t.nombre
  direccion: string;                        // c.direccion
  distrito: string;                         // c.distrito
  telefono: string;                         // c.telefono
  nombre_cliente: string;                   // c.nombre_cliente
  referencia?: string | null;               // c.referencia
  id_pedido: number;                        // p.id_pedido
  sku_producto: string;                     // p.sku_producto
  sku_producto_desc: string;                // p.sku_producto_desc
  sku_servicio: string;                     // p.sku_servicio
  turno: string;                            // p.turno
  fecha_servicio: string;                   // alias r.fecha AS fecha_servicio
  observacion_servicio?: string | null;     // p.observacion_servicio
}
export interface Estado { idEstado: number; estadoDesc: string; }

export interface SubEstado {
  idSubestado: number;
  subestadoDesc: string;
  idEstado: number;
}
@Injectable()
export class RutasService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async obtenerRutasTecnico(id_tecnico: string, fecha: string): Promise<Ruta[]> {
    const query = `
          SELECT r.id_ruta, r.fecha,r.id_estado_ruta as estado_ruta, e.estado_desc as estado_servicio_desc,s.subestado_desc as subestado_servicio_desc, t.nombre AS tecnico,c.direccion,c.distrito,c.telefono,c.nombre_cliente,c.referencia, p.id_pedido,
  p.sku_producto, p.sku_producto_desc,p.sku_servicio, p.sku_servicio,p.turno,r.fecha as fecha_servicio,
  p.observacion_servicio
        FROM rutas r
       inner JOIN tecnicos t ON r.id_tecnico = t.id_tecnico
      inner JOIN ruta_pedidos rt on r.id_ruta=rt.id_ruta
      inner join pedidos p on rt.id_pedido=p.id_pedido
      inner join clientes c on p.id_cliente=c.id_cliente
	  left join estados e on p.id_estado=e.id_estado
      left join sub_estados s on p.id_subestado=s.id_subestado
        WHERE t.usuario = $1
          AND DATE(r.fecha) =  $2
        ORDER BY r.fecha DESC;

    `;
    const result = await this.pool.query(query,[id_tecnico,fecha]);
    return result.rows as Ruta[];
  }
    async obtenerEstados(): Promise<Estado[]> {
    const query = `
      SELECT id_estado, estado_desc 
      FROM estados
    `;

    try {
      const result = await this.pool.query(query);

      return result.rows.map(row => ({
        idEstado: row.id_estado,
        estadoDesc: row.estado_desc,
      }));
    } catch (error:any) {
      console.error('Error al obtener estados:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
    async obtenerSubEstadosPorEstado(idEstado: number): Promise<SubEstado[]> {
    const query = `
      SELECT id_subestado, subestado_desc, id_estado
      FROM sub_estados
      WHERE id_estado = $1
    `;
       try {
    const result = await this.pool.query(query, [idEstado]);

    return result.rows.map(row => ({
      idSubestado: row.id_subestado,
      subestadoDesc: row.subestado_desc,
      idEstado: row.id_estado,
    }));
        
      } catch (error:any) {
      console.error('Error al obtener estados:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

}