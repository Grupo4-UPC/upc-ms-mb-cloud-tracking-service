export class ActualizarPedidoDto {
  id_cliente?: number;
  fecha_creacion?: Date;
  estado?: string;
  fecha_entrega?: Date;
  sku_producto?: string;
  sku_producto_desc?: string;
  turno?: string;
  sku_servicio?: string;
  sku_servicio_desc?: string;
  observacion_servicio?: string;
  id_estado?: number;
  id_subestado?: number;
  nueva_observacion?: string;
  info_adicional?: string;
  nom_persona_atendio?: string;
  num_doc_persona_atendio?: string;
  firmado?: boolean;
}