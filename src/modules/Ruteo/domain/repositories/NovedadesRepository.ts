export interface INovedadesRepository {
    registrar(id_envio: number, novedad: number): Promise<void>;
}
