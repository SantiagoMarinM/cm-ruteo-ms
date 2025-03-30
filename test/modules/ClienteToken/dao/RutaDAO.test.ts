import 'reflect-metadata';
import { IDatabase, IMain } from 'pg-promise';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { RutaDAO } from '@infrastructure/bd/postgresql/dao/RutaDAO';
import { UNAUTHORIZED } from '@common/http/exceptions';

jest.mock('@infrastructure/bd/postgresql/dao/querys/RuteoQueries', () => ({
    guardarRuta: 'SELECT * FROM guardar_ruta($1, $2);',
    actualizarRuta: 'SELECT * FROM actualizar_ruta($1, $2);',
}));

describe('RutaDAO', () => {
    const dbMock: Partial<IDatabase<IMain>> = {
        oneOrNone: jest.fn(),
        none: jest.fn(),
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

    it('debería guardar ruta y retornar el ID correctamente', async () => {
        const resultadoSimulado = { id: 10 };
        (dbMock.oneOrNone as jest.Mock).mockResolvedValueOnce(resultadoSimulado);

        const dao = new RutaDAO();
        const result = await dao.guardarRuta(5, 2);

        expect(result).toBe(10);
        expect(dbMock.oneOrNone).toHaveBeenCalledWith('SELECT * FROM guardar_ruta(5, 2);');
    });

    it('debería retornar 0 si no se retorna ningún resultado en guardarRuta', async () => {
        (dbMock.oneOrNone as jest.Mock).mockResolvedValueOnce(null);

        const dao = new RutaDAO();
        const result = await dao.guardarRuta(5, 2);

        expect(result).toBe(0);
    });

    it('debería lanzar UNAUTHORIZED si ocurre un error en guardarRuta', async () => {
        (dbMock.oneOrNone as jest.Mock).mockRejectedValueOnce(new Error('Error DB'));

        const dao = new RutaDAO();

        try {
            await dao.guardarRuta(5, 2);
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

    it('debería actualizar ruta correctamente', async () => {
        (dbMock.none as jest.Mock).mockResolvedValueOnce(undefined);

        const dao = new RutaDAO();
        await expect(dao.actualizarRuta(10, 3)).resolves.toBeUndefined();

        expect(dbMock.none).toHaveBeenCalledWith('SELECT * FROM actualizar_ruta(10, 3);');
    });

    it('debería lanzar UNAUTHORIZED si ocurre un error en actualizarRuta', async () => {
        (dbMock.none as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

        const dao = new RutaDAO();

        try {
            await dao.actualizarRuta(10, 3);
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
