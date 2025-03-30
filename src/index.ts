import 'module-alias/register';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { TYPESSERVER } from '@infrastructure/app/server/TypeServer';
import ModulesFactory from '@common/modules/ModulesFactory';
import RuteoModules from '@modules/Ruteo/RuteoModules';

dotenv.config();

async function bootstrap() {
    const modulesFactory = new ModulesFactory();
    const server = modulesFactory.createServer(TYPESSERVER.Fastify);
    modulesFactory.initModules([RuteoModules]);
    server?.start();
}
bootstrap();
