import { Response, ResponseMethod } from '@common/http/Response';
import { JsonValidator } from '@modules/shared/config/schemas';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies';

import RutearUseCase from '../useCase/RutearUseCase';
import { injectable } from 'inversify';
import { CustomRequest, INovedadesDataIn } from '../application/data/in/IRuteoDataIn';
import PubsubValidator from '@modules/shared/config/schemas/SchemaValidator';
import { BodyRegistrarNovedadesSchema, RuteoSchema } from '../schemas';
import Result from '@common/http/Result';
import NovedadesUseCase from '../useCase/NovedadesUseCase';

@injectable()
export default class RutearRouter {
    async asignarRuta(req: CustomRequest): Promise<Response<ResponseMethod<string | void | null>>> {
        const payload = req.data as Record<string, unknown>;
        const data = new PubsubValidator().validate(RuteoSchema, payload);
        const logger = req.logData;
        const rutearUseCase = GLOBAL_CONTAINER.get<RutearUseCase>(TYPESDEPENDENCIES.RutearUseCase);
        try {
            const rutear = await rutearUseCase.execute(data, logger);
            return Result.ok({ data: rutear, message: 'Ruta asignada correctamente' });
        } catch (error) {
            return Result.failure(error);
        }
    }

    async registrarNovedades(req: CustomRequest): Promise<Response<ResponseMethod<null>>> {
        const logger = req.logData;
        const body = req.data as INovedadesDataIn;
        new JsonValidator().validate(BodyRegistrarNovedadesSchema, body);
        const novedadUseCase = GLOBAL_CONTAINER.get<NovedadesUseCase>(TYPESDEPENDENCIES.NovedadesUseCase);
        try {
            const response = await novedadUseCase.execute(body, logger);
            return Result.ok({ data: null, message: response });
        } catch (error) {
            return Result.failure(error, 404);
        }
    }
}
