import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { IDatabase, IMain } from 'pg-promise';
import TYPESDEPENDENCIES from './TypesDependencies';
import { autorizacion } from '@infrastructure/bd';
import { RedisClient } from 'redis';
import { RedisClientesConnection } from '@infrastructure/redis/adapter/redis';
import IEnviosRedis from '@infrastructure/redis/interfaces/IClienteRedis';
import { EnviosRedis } from '@infrastructure/redis/EnviosRedis';
import RutearUseCase from '../useCase/RutearUseCase';
import { IRutaRepository } from '../domain/repositories/RutaRepository';
import { RutaDAO } from '@infrastructure/bd/postgresql/dao/RutaDAO';
import { IEnvioRepository } from '../domain/repositories/EnvioRepository';
import { EnvioDAO } from '@infrastructure/bd/postgresql/dao/EnvioDAO';
import { IRutaEnvioRepository } from '../domain/repositories/RutaEnvioRepository';
import { RutasEnvioDAO } from '@infrastructure/bd/postgresql/dao/RutasEnvioDAO';
import { INovedadesRepository } from '../domain/repositories/NovedadesRepository';
import { NovedadesDAO } from '@infrastructure/bd/postgresql/dao/NovedadesDAO';
import NovedadesUseCase from '../useCase/NovedadesUseCase';

export const createDependencies = (): void => {
    GLOBAL_CONTAINER.bind<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql).toConstantValue(autorizacion);
    GLOBAL_CONTAINER.bind<IRutaRepository>(TYPESDEPENDENCIES.IRutaRepository).to(RutaDAO).inSingletonScope();
    GLOBAL_CONTAINER.bind<IEnvioRepository>(TYPESDEPENDENCIES.IEnvioRepository).to(EnvioDAO).inSingletonScope();
    GLOBAL_CONTAINER.bind<IRutaEnvioRepository>(TYPESDEPENDENCIES.IRutaEnvioRepository)
        .to(RutasEnvioDAO)
        .inSingletonScope();
    GLOBAL_CONTAINER.bind<INovedadesRepository>(TYPESDEPENDENCIES.INovedadesRepository)
        .to(NovedadesDAO)
        .inSingletonScope();

    GLOBAL_CONTAINER.bind<RutearUseCase>(TYPESDEPENDENCIES.RutearUseCase).to(RutearUseCase).inSingletonScope();
    GLOBAL_CONTAINER.bind<NovedadesUseCase>(TYPESDEPENDENCIES.NovedadesUseCase).to(NovedadesUseCase).inSingletonScope();

    GLOBAL_CONTAINER.bind<RedisClient>(TYPESDEPENDENCIES.RedisAdapter).toConstantValue(RedisClientesConnection);
    GLOBAL_CONTAINER.bind<IEnviosRedis>(TYPESDEPENDENCIES.RedisRepoCache).to(EnviosRedis).inSingletonScope();
};
