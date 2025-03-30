import 'reflect-metadata';
import { IDatabase, IMain } from 'pg-promise';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { NovedadesDAO } from '@infrastructure/bd/postgresql/dao/NovedadesDAO';
import { UNAUTHORIZED } from '@common/http/exceptions';

jest.mock('@infrastructure/bd/postgresql/dao/querys/RuteoQueries', () => ({
    guardarNovedades: 'SELECT * FROM guardar_novedades($1, $2);',
}));

describe('NovedadesDAO', () => {
    const dbMock: Partial<IDatabase<IMain>> = {
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

    it('debería registrar la novedad sin errores', async () => {
        (dbMock.none as jest.Mock).mockResolvedValueOnce(undefined);

        const dao = new NovedadesDAO();
        await expect(dao.registrar(1, 101)).resolves.toBeUndefined();

        // Validamos que se haya llamado con los valores interpolados
        expect(dbMock.none).toHaveBeenCalledWith('SELECT * FROM guardar_novedades(1, 101);');
    });

    it('debería lanzar UNAUTHORIZED si falla la inserción', async () => {
        (dbMock.none as jest.Mock).mockRejectedValueOnce(new Error('Fallo DB'));

        const dao = new NovedadesDAO();
        try {
            await dao.registrar(1, 101);
        } catch (error) {
            expect(error).toBeInstanceOf(UNAUTHORIZED);
            expect(error).toMatchObject({
                statusCode: 401,
                error: {
                    message: 'Error registrar novedad',
                },
            });
        }
    });
});
