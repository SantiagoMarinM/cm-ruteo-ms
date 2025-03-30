export interface IRutaEnvioRepository {
    guardarRutaEnvio(id_ruta: number, id_envio: number, orden: number): void;
    obtenerRutasEnvio(etiqueta1d: string): Promise<number | null>;
}
