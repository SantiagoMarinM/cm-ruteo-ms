import 'reflect-metadata';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { TYPES } from '@common/dependencies';
import NovedadesUseCase from '@modules/Ruteo/useCase/NovedadesUseCase';
import { Novedades } from '@modules/Ruteo/domain/enums';

describe('NovedadesUseCase', () => {
    const mockLogger = { add: jest.fn() };
    const mockNovedadesRepo = { registrar: jest.fn() };
    const mockRutaEnvioRepo = { obtenerRutasEnvio: jest.fn() };
    const logData = ['dummy'];

    beforeAll(() => {
        if (GLOBAL_CONTAINER.isBound(TYPES.Logger)) {
            GLOBAL_CONTAINER.unbind(TYPES.Logger);
        }
        GLOBAL_CONTAINER.bind(TYPES.Logger).toConstantValue(mockLogger);

        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.INovedadesRepository)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.INovedadesRepository);
        }
        GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.INovedadesRepository).toConstantValue(mockNovedadesRepo);

        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.IRutaEnvioRepository)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.IRutaEnvioRepository);
        }
        GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.IRutaEnvioRepository).toConstantValue(mockRutaEnvioRepo);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería registrar novedad correctamente', async () => {
        mockRutaEnvioRepo.obtenerRutasEnvio.mockResolvedValueOnce(123);

        const useCase = new NovedadesUseCase(mockLogger as any);
        const result = await useCase.execute(
            {
                etiqueta1d: 'ETQ123',
                nombre_novedad: 'lluvia fuerte',
            },
            logData,
        );

        expect(result).toBe('Novedad registrada');
        expect(mockNovedadesRepo.registrar).toHaveBeenCalledWith(123, Novedades.LLUVIA);
    });

    it('debería lanzar error si no se encuentra el idEnvio', async () => {
        mockRutaEnvioRepo.obtenerRutasEnvio.mockResolvedValueOnce(null);

        const useCase = new NovedadesUseCase(mockLogger as any);
        await expect(useCase.execute({ etiqueta1d: 'ETQ404', nombre_novedad: 'lluvia' }, logData)).rejects.toThrow(
            'Envio no encontrado',
        );
    });

    it('debería lanzar error si el nombre de la novedad no es válido', async () => {
        mockRutaEnvioRepo.obtenerRutasEnvio.mockResolvedValueOnce(123);

        const useCase = new NovedadesUseCase(mockLogger as any);
        await expect(useCase.execute({ etiqueta1d: 'ETQ456', nombre_novedad: 'otra cosa' }, logData)).rejects.toThrow(
            'Novedad no encontrada',
        );
    });

    it('debería lanzar error si ocurre un fallo interno', async () => {
        mockRutaEnvioRepo.obtenerRutasEnvio.mockImplementation(() => {
            throw new Error('fallo inesperado');
        });

        const useCase = new NovedadesUseCase(mockLogger as any);
        await expect(useCase.execute({ etiqueta1d: 'ETQ123', nombre_novedad: 'lluvia' }, logData)).rejects.toThrow(
            'fallo inesperado',
        );
    });
});
