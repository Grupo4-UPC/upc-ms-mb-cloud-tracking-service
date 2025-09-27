import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class RutasService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findByTecnicoAndFecha(id_tecnico: number, fecha: string) {
    const query = `
      SELECT r.id_ruta, r.fecha, r.estado, t.nombre AS tecnico
      FROM rutas r
      JOIN tecnicos t ON r.id_tecnico = t.id_tecnico
      WHERE r.id_tecnico = $1
        AND DATE(r.fecha) = $2
      ORDER BY r.fecha DESC;
    `;
    const result = await this.pool.query(query, [id_tecnico, fecha]);
    return result.rows;
  }
}