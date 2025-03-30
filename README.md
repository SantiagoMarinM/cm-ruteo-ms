# Módulo de Ruteo

Este módulo gestiona la asignación de rutas para envíos y el registro de novedades asociadas al proceso logístico.

## Endpoints Disponibles

| Método | Ruta       | Descripción                                            |
|--------|------------|---------------------------------------------------------|
| POST   | /rutas     | Calcula y asigna una ruta a un equipo según su ubicación y capacidad |
| POST   | /novedades | Registra una novedad (como lluvia o tráfico) asociada a un envío |

## Clases Principales

### RutearUseCase
**Responsabilidad:** Asignar rutas a un equipo basado en su ubicación, capacidad y prioridad de envíos.

**Dependencias:**
- `IRutaRepository`
- `IRutaEnvioRepository`
- `IEnvioRepository`
- `IEnviosRedis`
- `ILogger`

**Flujo:**
1. Guarda una nueva ruta con estado "asignando rutas".
2. Recupera los envíos según prioridad desde Redis o base de datos.
3. Ordena los envíos por distancia usando `geolib`.
4. Filtra envíos excedentes de capacidad (peso/volumen).
5. Guarda los envíos validados en la ruta y actualiza su estado.
6. Actualiza Redis con los envíos no asignados.
7. Finaliza la ruta actualizando su estado a "asignación finalizada".

### NovedadesUseCase
**Responsabilidad:** Registrar una novedad (climática o de tráfico) relacionada a un envío específico.

**Dependencias:**
- `IRutaEnvioRepository`
- `INovedadesRepository`
- `ILogger`

**Flujo:**
1. Busca el `idEnvio` en base al código de etiqueta.
2. Valida si el nombre de la novedad corresponde a las aceptadas (`lluvia`, `tráfico`).
3. Registra la novedad con su ID correspondiente.
4. Guarda logs informativos en el proceso.

## Consideraciones
- **Inversify** se usa para la inyección de dependencias.
- **Redis** actúa como caché para los envíos clasificados por prioridad.
- **Geolib** permite ordenar los puntos de entrega según distancia.
- **CustomError** y **UNAUTHORIZED** se utilizan para el manejo estructurado de errores.
- Las novedades se identifican por palabras clave contenidas en el campo `nombre_novedad`.

---

Este módulo es parte de un sistema logístico más grande orientado a la eficiencia de reparto mediante asignación inteligente de rutas y monitoreo de eventos relevantes durante la operación.

