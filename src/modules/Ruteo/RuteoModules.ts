import { IModule } from '@common/modules/IModule';
import { HTTPMETODO, Ruta } from '@common/modules/Ruta';
import RutearRouter from './controllers/RutearRouter';
import createDependencyContainer from '@common/dependencies/DependencyContainer';
import { createDependencies } from './dependencies/Dependencies';

export default class RuteoModules implements IModule {
    private readonly moduloRuta = '/';
    private readonly controller = new RutearRouter();

    constructor() {
        createDependencies();
        createDependencyContainer();
    }

    getRutas = (): Ruta[] => {
        return [
            {
                metodo: HTTPMETODO.POST,
                url: '/rutas',
                evento: this.controller.asignarRuta.bind(this.controller),
            },
            {
                metodo: HTTPMETODO.POST,
                url: '/novedades',
                evento: this.controller.registrarNovedades.bind(this.controller),
            },
        ];
    };

    get ruta(): string {
        return this.moduloRuta;
    }
}
