import { inject, injectable } from 'inversify';
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { INovedadesDataIn } from '../application/data/in/IRuteoDataIn';
import { TYPES } from '@common/dependencies';
import { ILogger } from '@common/logger';
import CustomError from '@common/utils/CustomError';
import { INovedadesRepository } from '../domain/repositories/NovedadesRepository';
import { IRutaEnvioRepository } from '../domain/repositories/RutaEnvioRepository';
import { Novedades } from '../domain/enums';

@injectable()
export default class NovedadesUseCase {
    private readonly novedadesRepository = GLOBAL_CONTAINER.get<INovedadesRepository>(
        TYPESDEPENDENCIES.INovedadesRepository,
    );
    private readonly rutaEnvioRepository = GLOBAL_CONTAINER.get<IRutaEnvioRepository>(
        TYPESDEPENDENCIES.IRutaEnvioRepository,
    );
    constructor(@inject(TYPES.Logger) private log: ILogger) {}

    async execute(data: INovedadesDataIn, logData: unknown[]): Promise<string> {
        try {
            this.log.add('info', 'Obteniendo idEnvio', logData);
            const idEnvio = await this.rutaEnvioRepository.obtenerRutasEnvio(data.etiqueta1d);
            if (!idEnvio) throw new CustomError('Envio no encontrado', 404, true);
            const idNovedad = this.buscarNovedad(data.nombre_novedad);
            this.log.add('info', 'Registrando novedad', logData);
            await this.novedadesRepository.registrar(idEnvio, idNovedad);
            this.log.add('info', 'Novedad registrada exitosamente', logData);
            return 'Novedad registrada';
        } catch (error) {
            throw new CustomError(error.message, error.code, true);
        }
    }

    private buscarNovedad(query: string): Novedades {
        const normalizedQuery = query.toLowerCase();
        if (normalizedQuery.includes('lluvia')) {
            return Novedades.LLUVIA;
        }
        if (normalizedQuery.includes('tráfico') || normalizedQuery.includes('trafico')) {
            return Novedades.TRAFICO;
        }
        throw new CustomError('Novedad no encontrada', 404, true);
    }
}
