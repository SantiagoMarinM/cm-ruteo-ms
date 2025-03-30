import { Container } from 'inversify';
import { TYPES } from './Types';
import { AgrupadorLogger } from '@common/logger/AgrupadorLogger';
import { ILogger } from '@common/logger';

export const GLOBAL_CONTAINER = new Container();

const createDependencyContainer = () => {
    GLOBAL_CONTAINER.bind<ILogger>(TYPES.Logger).to(AgrupadorLogger).inSingletonScope();
};

export default createDependencyContainer;
