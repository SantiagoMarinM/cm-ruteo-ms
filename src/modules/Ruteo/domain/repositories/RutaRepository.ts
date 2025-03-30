export interface IRutaRepository {
    guardarRuta(id_equipo_vehiculo: number, estado_ruta: number): Promise<number>;
    actualizarRuta(id: number, estado_ruta: number): Promise<void>;
}
