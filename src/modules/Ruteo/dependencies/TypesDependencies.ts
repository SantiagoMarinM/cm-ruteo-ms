const TYPESDEPENDENCIES = {
    Postgresql: Symbol.for('Postgresql'),
    IRutaRepository: Symbol.for('IRutaRepository'),
    IRutaEnvioRepository: Symbol.for('IRutaEnvioRepository'),
    INovedadesRepository: Symbol.for('INovedadesRepository'),
    NovedadesUseCase: Symbol.for('NovedadesUseCase'),
    IEnvioRepository: Symbol.for('IEnvioRepository'),
    RedisAdapter: Symbol.for('RedisAdapter'),
    RedisRepoCache: Symbol.for('RedisRepoCache'),
    RutearUseCase: Symbol.for('RutearUseCase'),
};

export default TYPESDEPENDENCIES;
