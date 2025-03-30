import { inject, injectable } from 'inversify';
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import IEnviosRedis from '@infrastructure/redis/interfaces/IClienteRedis';
import { IUsuariosVehiculos } from '@infrastructure/bd/interfaces/IUsuariosVehiculos';
import { IRutaRepository } from '../domain/repositories/RutaRepository';
import { EstadoRuta } from '../domain/enums';
import { IEnvioRepository } from '../domain/repositories/EnvioRepository';
import { EstadoEnvio } from '../domain/enums/EstadoEnvio.enum';
import { orderByDistance } from 'geolib';
import { IEnvioResponse, IEnviosEntrantes } from '../domain/interfaces';
import { IRutaEnvioRepository } from '../domain/repositories/RutaEnvioRepository';
import { TYPES } from '@common/dependencies';
import { ILogger } from '@common/logger';

@injectable()
export default class RutearUseCase {
    private readonly rutaRepository = GLOBAL_CONTAINER.get<IRutaRepository>(TYPESDEPENDENCIES.IRutaRepository);
    private readonly rutaEnvioRepository = GLOBAL_CONTAINER.get<IRutaEnvioRepository>(
        TYPESDEPENDENCIES.IRutaEnvioRepository,
    );
    private readonly envioRepository = GLOBAL_CONTAINER.get<IEnvioRepository>(TYPESDEPENDENCIES.IEnvioRepository);
    private readonly redis = GLOBAL_CONTAINER.get<IEnviosRedis>(TYPESDEPENDENCIES.RedisRepoCache);
    constructor(@inject(TYPES.Logger) private log: ILogger) {}

    async execute(data: IUsuariosVehiculos, logData: unknown[]): Promise<string | void> {
        this.log.add('info', 'iniciando ruteo!', logData);
        const idRuta = await this.rutaRepository.guardarRuta(data.id_equipos_vehiculos, EstadoRuta.ASIGNANDO_RUTAS);
        const { combinados: enviosAcumulados, porPrioridad } = await this.acumularEnviosPorPrioridades(data.terminal);

        const enviosOrdenados = this.ordenarEnviosPorDistancia(enviosAcumulados, data);

        const { enviosValidados, enviosExcedidos, acumuladoPeso, acumuladoVolumen } = this.filtrarEnviosPorCapacidad(
            enviosOrdenados,
            data,
        );

        this.log.add('info', `pesoAcumulado ${acumuladoPeso} vs, ${data.capacidad_peso}`, logData);
        this.log.add('info', `volumenAcumulado ${acumuladoVolumen} vs, ${data.capacidad_volumen}`, logData);

        await this.actualizarEstadoYGuardarRutaEnvios(idRuta, enviosValidados);

        const idsValidados = enviosValidados.map((envio) => envio.id);
        await this.actualizarRedisDespuesDeValidacion(porPrioridad, idsValidados);

        await this.rutaRepository.actualizarRuta(idRuta, EstadoRuta.ASIGNACION_FINALIZADA);

        if (enviosExcedidos.length > 0) {
            this.log.add('info', `Ruta ${idRuta} calculada con envíos excedidos`, logData);
            return 'Ruteo calculado exitosamente';
        }
        this.log.add('info', `Ruta ${idRuta} calculada sin envíos excedidos`, logData);
        return 'Ruteo calculado exitosamente';
    }

    private ordenarEnviosPorDistancia(enviosAcumulados: IEnvioResponse[], data: IUsuariosVehiculos): IEnvioResponse[] {
        const ubicacionEquipo = {
            latitude: data.latitud_actual,
            longitude: data.longitud_actual,
        };

        const enviosConCoordenadas = enviosAcumulados.map((envio) => ({
            ...envio,
            latitude: Number(envio.latitud),
            longitude: Number(envio.longitud),
        }));

        return orderByDistance(ubicacionEquipo, enviosConCoordenadas) as unknown as IEnvioResponse[];
    }

    private filtrarEnviosPorCapacidad(
        enviosOrdenados: IEnvioResponse[],
        data: IUsuariosVehiculos,
    ): {
        enviosValidados: IEnviosEntrantes[];
        enviosExcedidos: IEnvioResponse[];
        acumuladoPeso: number;
        acumuladoVolumen: number;
    } {
        const enviosValidados: IEnviosEntrantes[] = [];
        const enviosExcedidos: IEnvioResponse[] = [];
        let acumuladoPeso = 0;
        let acumuladoVolumen = 0;
        const pesoMaximo = data.capacidad_peso;
        const volumenMaximo = data.capacidad_volumen;

        for (let i = 0; i < enviosOrdenados.length; i++) {
            const envio = enviosOrdenados[i];
            const pesoEnvio = Number(envio.peso);
            const volumenEnvio = Number(envio.volumen);

            if (acumuladoPeso + pesoEnvio > pesoMaximo || acumuladoVolumen + volumenEnvio > volumenMaximo) {
                enviosExcedidos.push(envio);
                continue;
            }

            const envioConOrden = { ...envio, orden: enviosValidados.length + 1 };
            enviosValidados.push(envioConOrden);
            acumuladoPeso += pesoEnvio;
            acumuladoVolumen += volumenEnvio;
        }

        return { enviosValidados, enviosExcedidos, acumuladoPeso, acumuladoVolumen };
    }

    private async acumularEnviosPorPrioridades(
        terminal: number,
        maxPrioridad = 3,
    ): Promise<{
        combinados: IEnvioResponse[];
        porPrioridad: Record<number, IEnvioResponse[]>;
    }> {
        const combinados: IEnvioResponse[] = [];
        const porPrioridad: Record<number, IEnvioResponse[]> = {};
        for (let prioridad = 1; prioridad <= maxPrioridad; prioridad++) {
            const redisKey = `envios_ruteo_${prioridad}`;
            let envios = await this.redis.obtenerEnvioPorPrioridad(redisKey);
            if (!envios || envios.length === 0) {
                envios = await this.envioRepository.obtenerEnviosSinProcesarPorPrioridadYTerminal(prioridad, terminal);
                if (envios && envios.length > 0) {
                    this.log.add('info', `Encontré envíos en DB para prioridad ${prioridad}`);
                    this.redis.guardarRegistrosEnRedis(redisKey, envios);
                    const idsEnvios: number[] = envios.map((e) => e.id);
                    await this.envioRepository.actualizarEstadoEnvios(idsEnvios, EstadoEnvio.EN_CACHE);
                }
            } else {
                this.log.add('info', `Encontré envíos en REDIS para prioridad ${prioridad}`);
            }
            porPrioridad[prioridad] = envios || [];
            combinados.push(...(envios || []));
        }
        return { combinados, porPrioridad };
    }

    private async actualizarEstadoYGuardarRutaEnvios(
        idRuta: number,
        enviosValidados: IEnviosEntrantes[],
    ): Promise<void> {
        if (enviosValidados.length > 0) {
            const idsValidados = enviosValidados.map((envio) => envio.id);
            await this.envioRepository.actualizarEstadoEnvios(idsValidados, EstadoEnvio.PROCESADAS);
            enviosValidados.forEach((envio) => {
                this.rutaEnvioRepository.guardarRutaEnvio(idRuta, envio.id, envio.orden);
            });
        }
    }

    private async actualizarRedisDespuesDeValidacion(
        porPrioridad: Record<number, IEnvioResponse[]>,
        idsValidados: number[],
    ): Promise<void> {
        for (const prioridad in porPrioridad) {
            const redisKey = `envios_ruteo_${prioridad}`;
            const enviosOriginales = porPrioridad[Number(prioridad)] || [];
            const enviosRestantes = enviosOriginales.filter((envio) => !idsValidados.includes(envio.id));
            await this.redis.guardarRegistrosEnRedis(redisKey, enviosRestantes);
        }
    }
}
