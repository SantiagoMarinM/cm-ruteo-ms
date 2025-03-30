import 'reflect-metadata';
import { IDatabase, IMain } from 'pg-promise';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { EnvioDAO } from '@infrastructure/bd/postgresql/dao/EnvioDAO';
import { UNAUTHORIZED } from '@common/http/exceptions';

jest.mock('@infrastructure/bd/postgresql/dao/querys/RuteoQueries', () => ({
    obtenerEnviosSinProcesar: 'SELECT * FROM obtener_envios_sin_procesar($1, $2);',
    actualizarEstadoEnvios: 'SELECT * FROM actualizar_estado_envios($1, $2);',
}));

describe('EnvioDAO', () => {
    const dbMock: Partial<IDatabase<IMain>> = {
        manyOrNone: jest.fn(),
        result: jest.fn(),
    };

    beforeAll(() => {
        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.Postgresql)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.Postgresql);
        }
        GLOBAL_CONTAINER.bind<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql).toConstantValue(
            dbMock as IDatabase<IMain>,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería retornar envíos sin procesar correctamente', async () => {
        const mockResponse = [{ id: 1, prioridad: 1 }];
        (dbMock.manyOrNone as jest.Mock).mockResolvedValueOnce(mockResponse);

        const dao = new EnvioDAO();
        const result = await dao.obtenerEnviosSinProcesarPorPrioridadYTerminal(1, 1);

        expect(result).toEqual(mockResponse);
    });

    it('debería lanzar UNAUTHORIZED si falla obtenerEnviosSinProcesarPorPrioridadYTerminal', async () => {
        (dbMock.manyOrNone as jest.Mock).mockRejectedValueOnce(new Error('Error DB'));

        const dao = new EnvioDAO();
        try {
            await dao.obtenerEnviosSinProcesarPorPrioridadYTerminal(1, 1);
        } catch (error) {
            expect(error).toBeInstanceOf(UNAUTHORIZED);
            expect(error).toMatchObject({
                statusCode: 401,
                error: {
                    message: 'Error al guardar ruta',
                },
            });
        }
    });

    it('debería actualizar correctamente los estados de los envíos', async () => {
        (dbMock.result as jest.Mock).mockResolvedValueOnce({ rowCount: 2 });

        const dao = new EnvioDAO();
        await expect(dao.actualizarEstadoEnvios([1, 2], 3)).resolves.toBeUndefined();
    });

    it('debería lanzar UNAUTHORIZED si no se actualizan todos los registros', async () => {
        (dbMock.result as jest.Mock).mockResolvedValue({ rowCount: 1 });

        const dao = new EnvioDAO();
        try {
            await dao.actualizarEstadoEnvios([1, 2], 3);
        } catch (error) {
            expect(error).toBeInstanceOf(UNAUTHORIZED);
            expect(error).toMatchObject({
                statusCode: 401,
                error: {
                    message: 'Error al actualizar todos los envíos',
                },
            });
        }
    });

    it('no debe ejecutar actualización si la lista de IDs está vacía', async () => {
        const dao = new EnvioDAO();
        await expect(dao.actualizarEstadoEnvios([], 3)).resolves.toBeUndefined();
        expect(dbMock.result).not.toHaveBeenCalled();
    });
});
