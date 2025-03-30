import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { UNAUTHORIZED } from '@common/http/exceptions';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { injectable } from 'inversify';
import { IDatabase, IMain, as } from 'pg-promise';
import { actualizarRuta, guardarRuta } from './querys/RuteoQueries';
import { IRutaRepository } from '@modules/Ruteo/domain/repositories/RutaRepository';

@injectable()
export class RutaDAO implements IRutaRepository {
    private readonly db = GLOBAL_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql);

    async guardarRuta(id_equipo_vehiculo: number, estado_ruta: number): Promise<number> {
        try {
            const query = as.format(guardarRuta, [id_equipo_vehiculo, estado_ruta]);
            const resultado: { id: number } | null = await this.db.oneOrNone(query);
            return resultado ? resultado.id : 0;
        } catch (error) {
            throw new UNAUTHORIZED('Error al guardar ruta', '500', error.message);
        }
    }

    async actualizarRuta(id: number, estado_ruta: number): Promise<void> {
        try {
            const query = as.format(actualizarRuta, [id, estado_ruta]);
            await this.db.none(query);
        } catch (error) {
            throw new UNAUTHORIZED('Error al guardar ruta', '500', error.message);
        }
    }
}
