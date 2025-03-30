export interface IRuteoIn {
    codigo_equipo: string;
    terminal: number;
    placa_vehiculo: string;
}

export interface CustomRequest {
    data: IRuteoIn | INovedadesDataIn | Record<string, unknown>;
    headers: {
        authorization: string;
        'x-client-id': string;
        'x-request-id': string;
        [key: string]: string;
    };
    logData: unknown[];
}

export interface INovedadesDataIn {
    nombre_novedad: string;
    etiqueta1d: string;
}
