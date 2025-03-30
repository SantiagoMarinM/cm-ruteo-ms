export const guardarRuta = `INSERT INTO santiago.rutas (id_equipo_vehiculo, estado) VALUES ($1, $2) RETURNING id`;

export const guardarNovedades = `UPDATE santiago.rutas_envios SET id_evento_inesperado = $2 WHERE id = $1`;

export const consultarIdRutaEnvio = `SELECT re.id FROM santiago.rutas_envios re 
JOIN santiago.envios e ON re.id_envio = e.id WHERE e.etiqueta1d = $1`;

export const actualizarRuta = `UPDATE santiago.rutas SET estado = $2 WHERE id = $1`;

export const guardarRutaEnvio = `INSERT INTO santiago.rutas_envios (id_ruta, id_envio, orden) VALUES ($1, $2, $3)`;

export const obtenerEnviosSinProcesar = `SELECT * FROM santiago.envios WHERE estado = 1 and prioridad = $1 and terminal_tenencia = $2`;

export const actualizarEstadoEnvios = `UPDATE santiago.envios SET estado = $2, ultima_actualizacion = now() WHERE id in ($1:csv)`;
