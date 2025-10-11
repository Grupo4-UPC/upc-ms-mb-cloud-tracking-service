import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from "@nestjs/common";
import { Pool } from "pg";
import { ActualizarPedidoDto } from "./dto/actualizar-pedido.dto";
export interface Ruta {
  id_ruta: number; // r.id_ruta
  fecha: string; // r.fecha
  estado_ruta: number; // r.id_estado_ruta
  estado_servicio_id: number; // p.id_estado
  estado_servicio_desc: string; // e.estado_desc
  subestado_servicio_id: number; // p.id_subestado
  subestado_servicio_desc?: string | null; // s.subestado_desc (puede ser null)
  tecnico: string; // t.nombre
  direccion: string; // c.direccion
  distrito: string; // c.distrito
  codigo_postal: string; // c.codigo_postal
  telefono: string; // c.telefono
  nombre_cliente: string; // c.nombre_cliente
  num_doc_cliente: string; // c.num_doc_cliente
  referencia?: string | null; // c.referencia
  id_pedido: number; // p.id_pedido
  sku_producto: string; // p.sku_producto
  sku_producto_desc: string; // p.sku_producto_desc
  sku_servicio: string; // p.sku_servicio
  sku_servicio_desc: string; // p.sku_servicio_desc
  turno: string; // p.turno
  observacion_servicio?: string | null; // p.observacion_servicio
  nueva_observacion?: string | null; // p.nueva_observacion
  info_addicional?: string | null; // p.info_adicional,
  nom_persona_atendio?: string | null; // p.nom_persona_atendio
  num_doc_persona_atendio?: string | null; // p.num_doc_persona_atendio
  firmado?: boolean; // p.firmado
}
export interface Estado {
  idEstado: number;
  estadoDesc: string;
}

export interface SubEstado {
  idSubestado: number;
  subestadoDesc: string;
  idEstado: number;
}
@Injectable()
export class RutasService {
  constructor(@Inject("PG_POOL") private pool: Pool) {}

  async obtenerRutasTecnico(
    id_tecnico: string,
    fecha: string
  ): Promise<Ruta[]> {
    const query = `
          SELECT r.id_ruta, TO_CHAR(r.fecha, 'DD/MM/YYYY') as fecha,r.id_estado_ruta as estado_ruta,
                 p.id_estado as estado_servicio_id, e.estado_desc as estado_servicio_desc, p.id_subestado as subestado_servicio_id, s.subestado_desc as subestado_servicio_desc, 
                 t.nombre AS tecnico,c.direccion,c.distrito,c.codigo_postal,c.telefono,c.nombre_cliente,c.num_documento as num_doc_cliente,c.referencia,
                 p.id_pedido,p.sku_producto, p.sku_producto_desc,p.sku_servicio, p.sku_servicio_desc,p.turno,
                 p.observacion_servicio, p.nueva_observacion,p.info_adicional, p.nom_persona_atendio, p.num_doc_persona_atendio, p.firmado
        FROM rutas r
       inner JOIN tecnicos t ON r.id_tecnico = t.id_tecnico
      inner JOIN ruta_pedidos rt on r.id_ruta=rt.id_ruta
      inner join pedidos p on rt.id_pedido=p.id_pedido
      inner join clientes c on p.id_cliente=c.id_cliente
	    left join estados e on p.id_estado=e.id_estado
      left join sub_estados s on p.id_subestado=s.id_subestado
        WHERE t.id_tecnico = $1
          AND DATE(r.fecha) =  $2
        ORDER BY r.fecha DESC;

    `;
    const result = await this.pool.query(query, [id_tecnico, fecha]);
    return result.rows as Ruta[];
  }
  async obtenerEstados(): Promise<Estado[]> {
    const query = `
      SELECT id_estado, estado_desc 
      FROM estados
    `;

    try {
      const result = await this.pool.query(query);

      return result.rows.map((row) => ({
        idEstado: row.id_estado,
        estadoDesc: row.estado_desc,
      }));
    } catch (error: any) {
      console.error("Error al obtener estados:", error.message);
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

      return result.rows.map((row) => ({
        idSubestado: row.id_subestado,
        subestadoDesc: row.subestado_desc,
        idEstado: row.id_estado,
      }));
    } catch (error: any) {
      console.error("Error al obtener estados:", error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(idOrder: number, datos: ActualizarPedidoDto): Promise<any> {
    try {
      const queryRutaPedido = `
        SELECT id_ruta, id_pedido, orden 
        FROM ruta_pedidos 
        WHERE id_pedido = $1
      `;

      const rutaPedidoResult = await this.pool.query(queryRutaPedido, [
        idOrder,
      ]);

      if (rutaPedidoResult.rows.length === 0) {
        throw new InternalServerErrorException(
          "No se encontró la ruta asociada al pedido"
        );
      }

      const { id_ruta } = rutaPedidoResult.rows[0];

      const campos = [];
      const valores = [];
      let contador = 1;

      if (datos.id_cliente !== undefined) {
        campos.push(`id_cliente = $${contador++}`);
        valores.push(datos.id_cliente);
      }
      if (datos.fecha_creacion !== undefined) {
        campos.push(`fecha_creacion = $${contador++}`);
        valores.push(datos.fecha_creacion);
      }
      if (datos.estado !== undefined) {
        campos.push(`estado = $${contador++}`);
        valores.push(datos.estado);
      }
      if (datos.fecha_entrega !== undefined) {
        campos.push(`fecha_entrega = $${contador++}`);
        valores.push(datos.fecha_entrega);
      }
      if (datos.sku_producto !== undefined) {
        campos.push(`sku_producto = $${contador++}`);
        valores.push(datos.sku_producto);
      }
      if (datos.sku_producto_desc !== undefined) {
        campos.push(`sku_producto_desc = $${contador++}`);
        valores.push(datos.sku_producto_desc);
      }
      if (datos.turno !== undefined) {
        campos.push(`turno = $${contador++}`);
        valores.push(datos.turno);
      }
      if (datos.sku_servicio !== undefined) {
        campos.push(`sku_servicio = $${contador++}`);
        valores.push(datos.sku_servicio);
      }
      if (datos.sku_servicio_desc !== undefined) {
        campos.push(`sku_servicio_desc = $${contador++}`);
        valores.push(datos.sku_servicio_desc);
      }
      if (datos.observacion_servicio !== undefined) {
        campos.push(`observacion_servicio = $${contador++}`);
        valores.push(datos.observacion_servicio);
      }
      if (datos.id_estado !== undefined) {
        campos.push(`id_estado = $${contador++}`);
        valores.push(datos.id_estado);
      }
      if (datos.id_subestado !== undefined) {
        campos.push(`id_subestado = $${contador++}`);
        valores.push(datos.id_subestado);
      }
      if (datos.nueva_observacion !== undefined) {
        campos.push(`nueva_observacion = $${contador++}`);
        valores.push(datos.nueva_observacion);
      }
      if (datos.info_adicional !== undefined) {
        campos.push(`info_adicional = $${contador++}`);
        valores.push(datos.info_adicional);
      }
      if (datos.nom_persona_atendio !== undefined) {
        campos.push(`nom_persona_atendio = $${contador++}`);
        valores.push(datos.nom_persona_atendio);
      }
      if (datos.num_doc_persona_atendio !== undefined) {
        campos.push(`num_doc_persona_atendio = $${contador++}`);
        valores.push(datos.num_doc_persona_atendio);
      }
      if (datos.firmado !== undefined) {
        campos.push(`firmado = $${contador++}`);
        valores.push(datos.firmado);
      }

      if (campos.length === 0) {
        throw new InternalServerErrorException("No hay campos para actualizar");
      }

      valores.push(idOrder);

      const queryUpdatePedido = `
        UPDATE pedidos 
        SET ${campos.join(", ")}
        WHERE id_pedido = $${contador}
        RETURNING *
      `;

      const pedidoResult = await this.pool.query(queryUpdatePedido, valores);

      if (pedidoResult.rows.length === 0) {
        throw new InternalServerErrorException("Pedido no encontrado");
      }

      const pedidoActualizado = pedidoResult.rows[0];

      let estadoDesc = null;

      if (datos.id_estado !== undefined) {
        const queryUpdateRuta = `
          UPDATE rutas 
          SET fecha = CURRENT_DATE, id_estado_ruta = $1
          WHERE id_ruta = $2
        `;
        await this.pool.query(queryUpdateRuta, [datos.id_estado, id_ruta]);
        const queryEstado = `
          SELECT estado_desc 
          FROM estados 
          WHERE id_estado = $1
        `;
        const estadoResult = await this.pool.query(queryEstado, [
          datos.id_estado,
        ]);
        estadoDesc = estadoResult.rows[0]?.estado_desc;
      }

      return {
        message: estadoDesc
          ? `Los datos del pedido y el estado de la ruta se actualizó a ${estadoDesc}`
          : "Los datos del pedido se actualizaron correctamente",
        data: pedidoActualizado,
      };
    } catch (error: any) {
      console.error("Error al actualizar pedido:", error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
