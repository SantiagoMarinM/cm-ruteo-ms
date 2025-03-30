import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { UNAUTHORIZED } from '@common/http/exceptions';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { injectable } from 'inversify';
import { IDatabase, IMain, as } from 'pg-promise';
import { consultarIdRutaEnvio, guardarRutaEnvio } from './querys/RuteoQueries';
import { IRutaEnvioRepository } from '@modules/Ruteo/domain/repositories/RutaEnvioRepository';

@injectable()
export class RutasEnvioDAO implements IRutaEnvioRepository {
    private readonly db = GLOBAL_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql);

    guardarRutaEnvio(id_ruta: number, id_envio: number, orden: number): void {
        try {
            const query = as.format(guardarRutaEnvio, [id_ruta, id_envio, orden]);
            this.db.none(query);
        } catch (error) {
            throw new UNAUTHORIZED('Error al guardar ruta', '500', error.message);
        }
    }
    async obtenerRutasEnvio(etiqueta1d: string): Promise<number | null> {
        try {
            const query = as.format(consultarIdRutaEnvio, [etiqueta1d]);
            const idEnvio: { id: number } | null = await this.db.oneOrNone(query);
            return idEnvio ? idEnvio.id : null;
        } catch (error) {
            throw new UNAUTHORIZED('Error al guardar ruta', '500', error.message);
        }
    }
}
