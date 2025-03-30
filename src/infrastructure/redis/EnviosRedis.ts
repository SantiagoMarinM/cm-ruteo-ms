import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { ENV } from '@modules/shared';
import { injectable } from 'inversify';
import { RedisClient } from 'redis';
import IEnviosRedis from './interfaces/IClienteRedis';
import { promisify } from 'util';
import { IEnvioResponse } from '@modules/Ruteo/domain/interfaces';

@injectable()
export class EnviosRedis implements IEnviosRedis {
    private readonly redis = GLOBAL_CONTAINER.get<RedisClient>(TYPESDEPENDENCIES.RedisAdapter);

    async guardarRegistrosEnRedis(key: string, value: object): Promise<void> {
        try {
            const objetoJSON = JSON.stringify(value);
            this.redis.set(`${key}`, objetoJSON);
            const segundosExpiracion = 24 * 60 * 60 * +ENV.DIAS_REDIS;
            this.redis.expire(key, segundosExpiracion);
        } catch (error) {
            console.error('Error al guardar cliente en redis: ', error.message);
        }
    }

    async obtenerEnvioPorPrioridad(key: string): Promise<IEnvioResponse[] | null> {
        try {
            const getAsync = promisify(this.redis.get).bind(this.redis);
            const value = await getAsync(`${key}`);
            return value ? JSON.parse(value) : null;
        } catch ({ message }) {
            return null;
        }
    }
    async flushAll(): Promise<void> {
        try {
            this.redis.flushall();
        } catch (error) {
            console.log('Error eliminando data de redis ==> ', JSON.stringify(error));
        }
    }
}
