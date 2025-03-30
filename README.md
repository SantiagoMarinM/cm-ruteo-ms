# Módulo de Ruteo

Este módulo gestiona las operaciones relacionadas con la asignación de rutas y el registro de novedades asociadas a los envíos.

---

## Endpoints Disponibles

| Método | Ruta         | Descripción                                   |
|--------|--------------|-----------------------------------------------|
| POST   | /rutas       | Calcula y asigna una ruta basada en la capacidad del equipo y la cercanía de los envíos. |
| POST   | /novedades   | Registra una novedad asociada a un envío.     |

---

## Clases Principales

### RutearUseCase
**Responsabilidad:** Asignar una ruta optimizada a un equipo vehicular.

**Dependencias:**
- `IRutaRepository`
- `IRutaEnvioRepository`
- `IEnvioRepository`
- `IEnviosRedis`
- `ILogger`

**Flujo:**
1. Se crea un registro de ruta con estado `ASIGNANDO_RUTAS`.
2. Se recuperan los envíos por prioridad desde Redis o BD.
3. Se ordenan los envíos por distancia desde la posición actual del equipo.
4. Se validan los envíos según la capacidad del vehículo (peso y volumen).
5. Se actualizan los estados de los envíos procesados y se guardan en la ruta.
6. Se actualiza el estado de la ruta a `ASIGNACION_FINALIZADA`.

### NovedadesUseCase
**Responsabilidad:** Registrar una novedad asociada a un envío.

**Dependencias:**
- `INovedadesRepository`
- `IRutaEnvioRepository`
- `ILogger`

**Flujo:**
1. Consulta si existe un envío asociado a la etiqueta proporcionada.
2. Mapea el texto de la novedad a un ID correspondiente.
3. Registra la novedad en la base de datos.

---

## Consideraciones
- Se utiliza `InversifyJS` para inyección de dependencias.
- Redis funciona como cache para mejorar el rendimiento al consultar envíos por prioridad.
- Las rutas se asignan de forma geoespacial (usando coordenadas) y optimizando por cercanía y capacidad.

---

## Paquetes

### `geolib`
- Se utiliza para ordenar los envíos según su distancia al equipo.
- Método clave: `orderByDistance`

### `redis`
- Utilizado como almacenamiento temporal para las prioridades de los envíos.
- Clave para reducir la carga a la base de datos y mejorar la velocidad de lectura/escritura.

