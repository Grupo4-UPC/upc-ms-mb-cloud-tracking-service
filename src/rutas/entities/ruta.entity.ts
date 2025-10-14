export class RutaEntity {
    constructor(
        public readonly idRuta: number,
        public readonly idTecnico: number,
        public readonly fecha: Date,
        public readonly idEstadoRuta: number | null,
    ) { }

    static create(
        idTecnico: number,
        idEstadoRuta?: number,
        fecha?: Date,
    ): RutaEntity {
        return new RutaEntity(
            0,
            idTecnico,
            fecha || new Date(),
            idEstadoRuta || null
        );
    }

    actualizar(
        cambios: Partial<{
            idTecnico: number;
            fecha: Date;
            idEstadoRuta: number;
        }>,
    ): RutaEntity {
        return new RutaEntity(
            this.idRuta,
            cambios.idTecnico ?? this.idTecnico,
            cambios.fecha ?? this.fecha,
            cambios.idEstadoRuta ?? this.idEstadoRuta
        );
    }
}