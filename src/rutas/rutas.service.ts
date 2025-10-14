import {
  Injectable,
  Inject,
  InternalServerErrorException,BadRequestException
} from "@nestjs/common";
import { Pool } from "pg";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ActualizarPedidoDto } from "./dto/actualizar-pedido.dto";
import fs from 'fs';
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
export interface RutaDetalle {
  id_ruta: number;
  fecha: string;
  estado_ruta: number;
  tecnico: string;
  direccion: string;
  distrito: string;
  codigo_postal: string;
  telefono: string;
  nombre_cliente: string;
  num_doc_cliente: string;
  referencia: string;
  firmas: string[];
  fotos: string[];
  pedido: {
    id_pedido: number;
    sku_producto: string;
    sku_producto_desc: string;
    sku_servicio: string;
    sku_servicio_desc: string;
    turno: string;
    observacion_servicio: string;
    nueva_observacion: string;
    info_adicional: string;
    nom_persona_atendio: string;
    num_doc_persona_atendio: string;
    firmado: boolean;
    estado_servicio_id: number;
    estado_servicio_desc: string;
    subestado_servicio_id: number;
    subestado_servicio_desc: string;
  };
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
   private readonly s3 = new S3Client({ region: 'us-east-1', credentials: undefined });
  private readonly bucket = 'awsbucket-upcmov';
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
  async obtenerDetalleRuta(id_ruta: number): Promise<RutaDetalle | null> {
  const query = `
    SELECT 
      r.id_ruta,
      TO_CHAR(r.fecha, 'DD/MM/YYYY') AS fecha,
      r.id_estado_ruta AS estado_ruta,
      t.nombre AS tecnico,
      c.direccion, c.distrito, c.codigo_postal, c.telefono, 
      c.nombre_cliente, c.num_documento AS num_doc_cliente, c.referencia,
      p.id_pedido, p.sku_producto, p.sku_producto_desc, p.sku_servicio, 
      p.sku_servicio_desc, p.turno, p.observacion_servicio, p.nueva_observacion,
      p.info_adicional, p.nom_persona_atendio, p.num_doc_persona_atendio, p.firmado,
      p.id_estado AS estado_servicio_id, e.estado_desc AS estado_servicio_desc,
      p.id_subestado AS subestado_servicio_id, s.subestado_desc AS subestado_servicio_desc,
      fc.url_foto AS firma_url,
      ef.url_foto AS foto_url
    FROM rutas r
    INNER JOIN tecnicos t ON r.id_tecnico = t.id_tecnico
    INNER JOIN ruta_pedidos rt ON r.id_ruta = rt.id_ruta
    INNER JOIN pedidos p ON rt.id_pedido = p.id_pedido
    INNER JOIN clientes c ON p.id_cliente = c.id_cliente
    LEFT JOIN estados e ON p.id_estado = e.id_estado
    LEFT JOIN sub_estados s ON p.id_subestado = s.id_subestado
    LEFT JOIN ruta_evidencia_foto ef ON r.id_ruta = ef.id_ruta
    LEFT JOIN ruta_firma_cliente fc ON r.id_ruta = fc.id_ruta
    WHERE r.id_ruta = $1
  `;

  const result = await this.pool.query(query, [id_ruta]);
  const rows = result.rows;

  if (rows.length === 0) return null;

  // Tomamos la primera fila para los datos del pedido y ruta
  const row = rows[0];

  // Sets para evitar duplicados en firmas y fotos
  const firmasSet = new Set<string>();
  const fotosSet = new Set<string>();

  rows.forEach(r => {
    if (r.firma_url) firmasSet.add(r.firma_url);
    if (r.foto_url) fotosSet.add(r.foto_url);
  });

  return {
    id_ruta: row.id_ruta,
    fecha: row.fecha,
    estado_ruta: row.estado_ruta,
    tecnico: row.tecnico,
    direccion: row.direccion,
    distrito: row.distrito,
    codigo_postal: row.codigo_postal,
    telefono: row.telefono,
    nombre_cliente: row.nombre_cliente,
    num_doc_cliente: row.num_doc_cliente,
    referencia: row.referencia,
    firmas: Array.from(firmasSet),
    fotos: Array.from(fotosSet),
    pedido: {
      id_pedido: row.id_pedido,
      sku_producto: row.sku_producto,
      sku_producto_desc: row.sku_producto_desc,
      sku_servicio: row.sku_servicio,
      sku_servicio_desc: row.sku_servicio_desc,
      turno: row.turno,
      observacion_servicio: row.observacion_servicio,
      nueva_observacion: row.nueva_observacion,
      info_adicional: row.info_adicional,
      nom_persona_atendio: row.nom_persona_atendio,
      num_doc_persona_atendio: row.num_doc_persona_atendio,
      firmado: row.firmado,
      estado_servicio_id: row.estado_servicio_id,
      estado_servicio_desc: row.estado_servicio_desc,
      subestado_servicio_id: row.subestado_servicio_id,
      subestado_servicio_desc: row.subestado_servicio_desc,
    }
  };
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
   async subirFirma(idRuta: number, file: Express.Multer.File,tipo: 'firma' | 'evidencia'
) {
    if (!file) {
      throw new BadRequestException('No se ha recibido ningún archivo');
    }

    const buffer = fs.readFileSync(file.path);
    const fileName = `upc/firma_${idRuta}_${Date.now()}.jpg`;
    const urlDestino = `https://awsbucket-upcmov.s3.us-east-1.amazonaws.com/${fileName}`;

   
    const response = await fetch(urlDestino, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`Error al subir: ${await response.text()}`);
    }
    const tabla = tipo === 'firma' ? 'ruta_firma_cliente' : 'ruta_evidencia_foto';


     await this.pool.query(
      `
      INSERT INTO public.${tabla} (id_ruta, url_foto, fecha_creacion)
      VALUES ($1, $2, CURRENT_DATE)
      `,
      [idRuta, urlDestino],
    );

    return { message: '✅ Archivo subido correctamente', url: urlDestino };
  }

}
