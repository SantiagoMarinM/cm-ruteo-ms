import { IEnvioResponse } from '@modules/Ruteo/domain/interfaces';

export default interface IEnviosRedis {
    guardarRegistrosEnRedis(key: string, value: object | null): Promise<void>;
    obtenerEnvioPorPrioridad(key: string): Promise<IEnvioResponse[] | null | []>;
    flushAll(): Promise<void>;
}
