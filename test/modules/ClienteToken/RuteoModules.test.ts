import RuteoModules from '@modules/Ruteo/RuteoModules';

jest.mock('@modules/Ruteo/controllers/RutearRouter', () => {
    return jest.fn().mockImplementation(() => ({
        asignarRuta: jest.fn(),
        registrarNovedades: jest.fn(),
    }));
});

jest.mock('@modules/Ruteo/dependencies/Dependencies', () => ({
    createDependencies: jest.fn(),
}));

jest.mock('@common/dependencies/DependencyContainer', () => ({
    __esModule: true,
    default: jest.fn(),
    createDependencyContainer: jest.fn(),
}));

describe('RuteoModules', () => {
    let modulo: RuteoModules;

    beforeEach(() => {
        jest.clearAllMocks();
        modulo = new RuteoModules();
    });

    it('debe retornar la ruta base correctamente', () => {
        expect(modulo.ruta).toBe('/');
    });

    it('debe registrar las rutas correctamente', () => {
        const rutas = modulo.getRutas();
        expect(rutas).toHaveLength(2);

        expect(rutas[0]).toMatchObject({
            metodo: 'post',
            url: '/rutas',
        });

        expect(rutas[1]).toMatchObject({
            metodo: 'post',
            url: '/novedades',
        });

        expect(typeof rutas[0].evento).toBe('function');
        expect(typeof rutas[1].evento).toBe('function');
    });
});
