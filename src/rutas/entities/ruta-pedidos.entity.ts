export class RutaPedidoEntity {
    constructor(
        public readonly idRuta: number,
        public readonly idPedido: number,
        public readonly orden: number | null,
    ) { }

    static create(
        idRuta: number,
        idPedido: number,
        orden?: number,
    ): RutaPedidoEntity {
        return new RutaPedidoEntity(
            idRuta,
            idPedido,
            orden || null
        );
    }

    actualizar(
        cambios: Partial<{
            idRuta: number;
            idPedido: number;
            orden: number;
        }>,
    ): RutaPedidoEntity {
        return new RutaPedidoEntity(
            cambios.idRuta ?? this.idRuta,
            cambios.idPedido ?? this.idPedido,
            cambios.orden ?? this.orden
        );
    }
}