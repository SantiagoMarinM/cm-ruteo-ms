flowchart TD
    A([Inicio – Petición API]) --> B{Validar JWT}
    B -- Invalid --> C([401 Unauthorized])
    B -- Valid --> D[Obtener datos equipo & vehículo]

    D --> E[Obtener envíos activos desde Redis]

    loopPriority{{Por cada prioridad (1 → 3)}}
    E --> loopPriority

    loopPriority --> F{¿Envíos disponibles?}
    F -- No --> G[Obtener “Sin procesar” desde DB → Cachear en Redis] --> E
    F -- Yes --> H[Ordenar por prioridad SLA + proximidad]
    H --> I{¿Cabe en capacidad?}
    I -- No --> J[Eliminar última unidad de ruta] --> H
    I -- Yes --> K[Asignar envío → Estado “Procesado”]
    K --> L[Actualizar envíos restantes → Estado “En Cola”] --> M([200 OK])

    subgraph EventHandling["Triggers de Evento Inesperado"]
      X([Evento inesperado]) --> Y[Incrementar orden de todos los envíos en +1]
      Y --> Z[Encolar evento inesperado al final de la ruta]
    end