import { IEnvioResponse } from '../interfaces';

export interface IEnvioRepository {
    obtenerEnviosSinProcesarPorPrioridadYTerminal(
        prioridad: number,
        terminal: number,
    ): Promise<IEnvioResponse[] | null>;
    actualizarEstadoEnvios(id: number[], estado: number): Promise<void>;
}
