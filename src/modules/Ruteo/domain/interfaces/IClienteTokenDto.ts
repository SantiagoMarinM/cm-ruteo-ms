export interface IEnvioResponse {
    id: number;
    guia: string;
    etiqueta1d: string;
    latitud: string;
    longitud: string;
    terminal_tenencia: number;
    peso: number;
    volumen: number;
    fecha_limite_entrega: string;
    prioridad: number;
    estado: number;
}

export interface IEnviosEntrantes extends IEnvioResponse {
    orden: number;
}
