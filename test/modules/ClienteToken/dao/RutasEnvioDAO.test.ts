import 'reflect-metadata';
import { IDatabase, IMain } from 'pg-promise';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { RutasEnvioDAO } from '@infrastructure/bd/postgresql/dao/RutasEnvioDAO';
import { UNAUTHORIZED } from '@common/http/exceptions';

jest.mock('@infrastructure/bd/postgresql/dao/querys/RuteoQueries', () => ({
    guardarRutaEnvio: 'SELECT * FROM guardar_ruta_envio($1, $2, $3);',
    consultarIdRutaEnvio: 'SELECT * FROM consultar_id_ruta_envio($1);',
}));

describe('RutasEnvioDAO', () => {
    const dbMock: Partial<IDatabase<IMain>> = {
        none: jest.fn(),
        oneOrNone: jest.fn(),
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

    it('debería guardar la ruta del envío sin errores', () => {
        const dao = new RutasEnvioDAO();
        dao.guardarRutaEnvio(1, 100, 3);

        expect(dbMock.none).toHaveBeenCalledWith('SELECT * FROM guardar_ruta_envio(1, 100, 3);');
    });

    it('debería lanzar UNAUTHORIZED si falla guardarRutaEnvio', () => {
        (dbMock.none as jest.Mock).mockImplementation(() => {
            throw new Error('Fallo DB');
        });

        const dao = new RutasEnvioDAO();

        expect(() => dao.guardarRutaEnvio(1, 100, 3)).toThrow(UNAUTHORIZED);
    });

    it('debería retornar el id de la ruta si existe', async () => {
        (dbMock.oneOrNone as jest.Mock).mockResolvedValueOnce({ id: 50 });

        const dao = new RutasEnvioDAO();
        const result = await dao.obtenerRutasEnvio('ETQ123');

        expect(result).toBe(50);
        expect(dbMock.oneOrNone).toHaveBeenCalledWith(`SELECT * FROM consultar_id_ruta_envio('ETQ123');`);
    });

    it('debería retornar null si no encuentra resultado', async () => {
        (dbMock.oneOrNone as jest.Mock).mockResolvedValueOnce(null);

        const dao = new RutasEnvioDAO();
        const result = await dao.obtenerRutasEnvio('ETQ456');

        expect(result).toBeNull();
    });
    it('debería lanzar UNAUTHORIZED si falla obtenerRutasEnvio', async () => {
        (dbMock.oneOrNone as jest.Mock).mockRejectedValueOnce(new Error('Error en consulta'));

        const dao = new RutasEnvioDAO();

        try {
            await dao.obtenerRutasEnvio('ETQ789');
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
});
