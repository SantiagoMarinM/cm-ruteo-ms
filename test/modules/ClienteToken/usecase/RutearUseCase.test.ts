import 'reflect-metadata';
import RutearUseCase from '@modules/Ruteo/useCase/RutearUseCase';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { TYPES } from '@common/dependencies';
import { EstadoRuta } from '@modules/Ruteo/domain/enums';
import { EstadoEnvio } from '@modules/Ruteo/domain/enums/EstadoEnvio.enum';

const mockLogger = { add: jest.fn() };
const mockRutaRepository = {
    guardarRuta: jest.fn().mockResolvedValue(10),
    actualizarRuta: jest.fn().mockResolvedValue(undefined),
};
const mockRutaEnvioRepository = {
    guardarRutaEnvio: jest.fn(),
};
const mockEnvioRepository = {
    obtenerEnviosSinProcesarPorPrioridadYTerminal: jest.fn().mockResolvedValue([]),
    actualizarEstadoEnvios: jest.fn(),
};
const mockRedis = {
    obtenerEnvioPorPrioridad: jest.fn().mockResolvedValue([]),
    guardarRegistrosEnRedis: jest.fn(),
};

beforeAll(() => {
    if (GLOBAL_CONTAINER.isBound(TYPES.Logger)) GLOBAL_CONTAINER.unbind(TYPES.Logger);
    GLOBAL_CONTAINER.bind(TYPES.Logger).toConstantValue(mockLogger);

    if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.IRutaRepository))
        GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.IRutaRepository);
    GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.IRutaRepository).toConstantValue(mockRutaRepository);

    if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.IRutaEnvioRepository))
        GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.IRutaEnvioRepository);
    GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.IRutaEnvioRepository).toConstantValue(mockRutaEnvioRepository);

    if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.IEnvioRepository))
        GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.IEnvioRepository);
    GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.IEnvioRepository).toConstantValue(mockEnvioRepository);

    if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.RedisRepoCache))
        GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.RedisRepoCache);
    GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.RedisRepoCache).toConstantValue(mockRedis);
});

describe('RutearUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería ejecutar ruteo correctamente sin envíos excedidos', async () => {
        const useCase = new RutearUseCase(mockLogger as any);

        const equipo: any = {
            id_equipos_vehiculos: 1,
            terminal: 1,
            latitud_actual: 4.6,
            longitud_actual: -74.1,
            capacidad_peso: 500,
            capacidad_volumen: 100,
        };

        const logData = ['test'];

        const result = await useCase.execute(equipo, logData);

        expect(result).toBe('Ruteo calculado exitosamente');
        expect(mockRutaRepository.guardarRuta).toHaveBeenCalledWith(1, EstadoRuta.ASIGNANDO_RUTAS);
        expect(mockRutaRepository.actualizarRuta).toHaveBeenCalledWith(10, EstadoRuta.ASIGNACION_FINALIZADA);
    });

    it('debería guardar ruta con envíos y actualizar redis', async () => {
        const useCase = new RutearUseCase(mockLogger as any);

        mockRedis.obtenerEnvioPorPrioridad.mockResolvedValueOnce(null);
        mockEnvioRepository.obtenerEnviosSinProcesarPorPrioridadYTerminal.mockResolvedValueOnce([
            { id: 1, peso: 50, volumen: 10, latitud: '4.5', longitud: '-74.0' },
        ]);

        const equipo: any = {
            id_equipos_vehiculos: 1,
            terminal: 1,
            latitud_actual: 4.6,
            longitud_actual: -74.1,
            capacidad_peso: 100,
            capacidad_volumen: 50,
        };

        const result = await useCase.execute(equipo, ['log']);

        expect(result).toBe('Ruteo calculado exitosamente');
        expect(mockEnvioRepository.actualizarEstadoEnvios).toHaveBeenCalledWith([1], EstadoEnvio.EN_CACHE);
        expect(mockRedis.guardarRegistrosEnRedis).toHaveBeenCalled();
        expect(mockRutaEnvioRepository.guardarRutaEnvio).toHaveBeenCalledWith(10, 1, 1);
    });
});
