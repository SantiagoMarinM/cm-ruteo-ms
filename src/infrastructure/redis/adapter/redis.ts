import { ENV } from '@modules/shared';
import redis, { RedisClient } from 'redis';

const getRedisConnection = (): RedisClient => {
    const port = ENV.REDIS_PORT || 6379;
    const host = ENV.REDIS_HOST ?? 'localhost';
    const adapter = redis.createClient(+port, host, { connect_timeout: 10000 });
    adapter.on('error', (e) => {
        console.log('REDIS UNIDADES TOKEN ERROR ==> ', JSON.stringify(e?.message ?? e));
    });
    adapter.on('connect', () => {
        const date = new Date().toLocaleString();
        adapter.rpush('CONEXIONES', `Conectado ${date}`);
        console.log('CONEXIÓN DE REDIS UNIDADES ESTABLECIDA');
    });
    return adapter;
};
export const RedisClientesConnection = getRedisConnection();
