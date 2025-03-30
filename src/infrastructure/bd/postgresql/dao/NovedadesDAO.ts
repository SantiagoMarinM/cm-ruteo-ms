import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { UNAUTHORIZED } from '@common/http/exceptions';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { injectable } from 'inversify';
import { IDatabase, IMain, as } from 'pg-promise';
import { guardarNovedades } from './querys/RuteoQueries';
import { INovedadesRepository } from '@modules/Ruteo/domain/repositories/NovedadesRepository';

@injectable()
export class NovedadesDAO implements INovedadesRepository {
    private readonly db = GLOBAL_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql);

    async registrar(id_envio: number, novedad: number): Promise<void> {
        try {
            const query = as.format(guardarNovedades, [id_envio, novedad]);
            await this.db.none(query);
        } catch (error) {
            throw new UNAUTHORIZED('Error registrar novedad', '500', error.message);
        }
    }
}
