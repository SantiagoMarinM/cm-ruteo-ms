import Joi from 'joi';
import { INovedadesDataIn } from '../application/data/in/IRuteoDataIn';
import { IUsuariosVehiculos } from '@infrastructure/bd/interfaces/IUsuariosVehiculos';

export const BodyRegistrarNovedadesSchema = Joi.object<INovedadesDataIn>({
    nombre_novedad: Joi.string().required(),
    etiqueta1d: Joi.string().required(),
}).unknown(true);

export const RuteoSchema = Joi.object<IUsuariosVehiculos>({
    id_equipos_vehiculos: Joi.number().required(),
    id_equipo: Joi.number().required(),
    id_vehiculo: Joi.number().required(),
    capacidad_peso: Joi.number().required(),
    capacidad_volumen: Joi.number().required(),
    vehiculo_activo: Joi.boolean().required(),
    placa_vehiculo: Joi.string().required(),
    equipo_activo: Joi.boolean().required(),
    latitud_actual: Joi.string().required(),
    longitud_actual: Joi.string().required(),
    terminal: Joi.number().required(),
}).unknown(true);
