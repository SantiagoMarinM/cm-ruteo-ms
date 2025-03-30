import 'reflect-metadata';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import RutearRouter from '@modules/Ruteo/controllers/RutearRouter';
import { CustomRequest } from '@modules/Ruteo/application/data/in/IRuteoDataIn';

// Mocks para dependencias
const mockRutearUseCase = {
    execute: jest.fn().mockResolvedValue('Ruta asignada correctamente'),
};

const mockNovedadesUseCase = {
    execute: jest.fn().mockResolvedValue('Novedad registrada correctamente'),
};

// Mock de PubsubValidator y JsonValidator
jest.mock('@modules/shared/config/schemas/SchemaValidator', () => {
    return jest.fn().mockImplementation(() => ({
        validate: (_schema: any, data: any) => data,
    }));
});

jest.mock('@modules/shared/config/schemas', () => {
    return {
        JsonValidator: jest.fn().mockImplementation(() => ({
            validate: (_schema: any, data: any) => data,
        })),
    };
});

describe('RutearRouter', () => {
    let router: RutearRouter;
    let req: Partial<CustomRequest>;
    const logger = ['log'];

    beforeEach(() => {
        router = new RutearRouter();

        jest.clearAllMocks();

        req = {
            data: {},
            logData: logger,
        };

        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.RutearUseCase)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.RutearUseCase);
        }
        GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.RutearUseCase).toConstantValue(mockRutearUseCase);

        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.NovedadesUseCase)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.NovedadesUseCase);
        }
        GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.NovedadesUseCase).toConstantValue(mockNovedadesUseCase);
    });

    describe('asignarRuta', () => {
        it('debería retornar respuesta exitosa cuando RutearUseCase funciona', async () => {
            const response = await router.asignarRuta(req as CustomRequest);
            const { response: res, status } = response;

            if ('isError' in res && res.isError) {
                throw new Error('Se esperaba una respuesta exitosa, pero falló');
            }

            expect(mockRutearUseCase.execute).toHaveBeenCalled();
            expect('isError' in res ? res.isError : false).toBe(false);
            expect(res.message).toBe('Ruta asignada correctamente');
            expect('data' in res ? res.data : undefined).toBe('Ruta asignada correctamente');
            expect(status).toBe(200);
        });

        it('debería retornar error cuando RutearUseCase falla', async () => {
            mockRutearUseCase.execute.mockRejectedValueOnce(new Error('fallo ruteo'));

            const response = await router.asignarRuta(req as CustomRequest);
            const { response: res, status } = response;

            expect('isError' in res ? res.isError : false).toBe(true);
            expect(status).toBe(501);
            expect(res.message).toBe('fallo ruteo');
        });
    });

    describe('registrarNovedades', () => {
        it('debería retornar respuesta exitosa cuando NovedadesUseCase funciona', async () => {
            const response = await router.registrarNovedades(req as CustomRequest);
            const { response: res, status } = response;

            if ('isError' in res && res.isError) {
                throw new Error('Se esperaba una respuesta exitosa, pero falló');
            }

            expect(mockNovedadesUseCase.execute).toHaveBeenCalled();
            expect('isError' in res ? res.isError : false).toBe(false);
            expect(res.message).toBe('Novedad registrada correctamente');
            expect('data' in res ? res.data : undefined).toBeNull();
            expect(status).toBe(200);
        });

        it('debería retornar error cuando NovedadesUseCase falla', async () => {
            mockNovedadesUseCase.execute.mockRejectedValueOnce(new Error('fallo novedad'));

            const response = await router.registrarNovedades(req as CustomRequest);
            const { response: res, status } = response;

            expect('isError' in res ? res.isError : false).toBe(true);
            expect(status).toBe(404);
            expect(res.message).toBe('fallo novedad');
        });
    });
});
