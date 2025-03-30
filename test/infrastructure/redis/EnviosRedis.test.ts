import 'reflect-metadata';
import { EnviosRedis } from '@infrastructure/redis/EnviosRedis';
import { RedisClient } from 'redis';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';

jest.mock('@modules/shared', () => ({
    ENV: {
        DIAS_REDIS: '2',
    },
}));

describe('EnviosRedis', () => {
    const mockRedis = {
        set: jest.fn(),
        expire: jest.fn(),
        get: jest.fn(),
        flushall: jest.fn(),
    };

    beforeAll(() => {
        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.RedisAdapter)) {
            GLOBAL_CONTAINER.rebind<RedisClient>(TYPESDEPENDENCIES.RedisAdapter).toConstantValue(mockRedis as any);
        } else {
            GLOBAL_CONTAINER.bind<RedisClient>(TYPESDEPENDENCIES.RedisAdapter).toConstantValue(mockRedis as any);
        }

        process.env.DIAS_REDIS = '2';
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería guardar registros en Redis correctamente', async () => {
        const redisService = new EnviosRedis();
        const key = 'envios_ruteo_1';
        const value = [{ id: 1, prioridad: 1 }];

        await redisService.guardarRegistrosEnRedis(key, value);

        expect(mockRedis.set).toHaveBeenCalledWith(key, JSON.stringify(value));
        expect(mockRedis.expire).toHaveBeenCalledWith(key, 24 * 60 * 60 * 2); // 172800
    });

    it('debería eliminar todos los datos de Redis con flushAll', async () => {
        const redisService = new EnviosRedis();
        await redisService.flushAll();

        expect(mockRedis.flushall).toHaveBeenCalled();
    });
});
