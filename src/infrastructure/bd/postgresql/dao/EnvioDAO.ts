import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { UNAUTHORIZED } from '@common/http/exceptions';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { injectable } from 'inversify';
import { IDatabase, IMain, as } from 'pg-promise';
import { actualizarEstadoEnvios, obtenerEnviosSinProcesar } from './querys/RuteoQueries';
import { IEnvioRepository } from '@modules/Ruteo/domain/repositories/EnvioRepository';
import { IEnvioResponse } from '@modules/Ruteo/domain/interfaces';

@injectable()
export class EnvioDAO implements IEnvioRepository {
    private readonly db = GLOBAL_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql);

    async obtenerEnviosSinProcesarPorPrioridadYTerminal(
        prioridad: number,
        terminal: number,
    ): Promise<IEnvioResponse[] | null> {
        try {
            const query = as.format(obtenerEnviosSinProcesar, [prioridad, terminal]);
            const respuesta: IEnvioResponse[] | null = await this.db.manyOrNone(query);
            return respuesta;
        } catch (error) {
            throw new UNAUTHORIZED('Error al guardar ruta', '500', error.message);
        }
    }

    async actualizarEstadoEnvios(id: number[], estado: number): Promise<void> {
        if (id.length === 0) return;
        const query = as.format(actualizarEstadoEnvios, [id, estado]);

        const filasActualizadas = await this.actualizarConReintento(query, id.length, 3, 1000);

        if (filasActualizadas !== id.length) {
            throw new UNAUTHORIZED(
                'Error al actualizar todos los envíos',
                '500',
                `Se actualizaron ${filasActualizadas} de ${id.length}`,
            );
        }
    }

    private async actualizarConReintento(
        query: string,
        expectedCount: number,
        maxIntentos: number,
        delayMs: number,
    ): Promise<number> {
        let intentos = 0;
        let filasActualizadas = 0;

        while (intentos < maxIntentos) {
            const result = await this.db.result(query);
            filasActualizadas = result.rowCount;

            if (filasActualizadas === expectedCount) {
                return filasActualizadas;
            }

            console.warn(
                `Intento ${
                    intentos + 1
                }: Se actualizaron ${filasActualizadas} de ${expectedCount} registros. Reintentando...`,
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            intentos++;
        }
        return filasActualizadas;
    }
}
