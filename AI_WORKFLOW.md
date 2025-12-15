📘 AI_WORKFLOW.md

Marco de Trabajo para la Interacción con Inteligencia Artificial

Este documento define cómo el equipo usará IA (GitHub Copilot, ChatGPT u otros modelos) dentro del flujo de desarrollo del proyecto.
Es un documento vivo: debe actualizarse a medida que evoluciona el proyecto.

1. 🎯 Propósito del Marco de Trabajo

Asegurar que el uso de IA sea:

Estructurado
Trazable
Eficiente
Consistente en el equipo
El objetivo NO es "usar IA porque sí", sino integrarla como herramienta formal dentro del ciclo de desarrollo.

2. 🧭 Metodología de Trabajo con IA
2.1. Principios
1. Contexto primero
Toda solicitud a la IA debe incluir:
Qué se está desarrollando.
Qué existe actualmente en el sistema.
Qué se espera obtener (output).

2. Iteración controlada
Se trabaja en ciclos de:
Solicitud →
Respuesta IA →
Evaluación →
Ajuste →
Implementación.

3. Validación humana obligatoria
Nada generado por IA pasa a producción sin revisión del equipo.

4. Documentación inmediata
Cada ayuda recibida debe quedar registrada cuando aplique:
Commits
Issues
Documentación técnica

3. 🗂 Interacciones Clave con IA
3.1. Para Desarrollo
Generación de snippets de código.
Refactorización.
Corrección de errores.
Explicación técnica de librerías, procesos o arquitecturas.
Diseño de estructuras de carpetas.

3.2. Para Arquitectura
Comparación de patrones.
Evaluación de alternativas tecnológicas.
Generación de diagramas (texto → UML → herramienta externa).

3.3. Para Documentación
Readme.
Documentación técnica.
Descripciones de APIs.
Protocolos de uso.

3.4. Para QA
Generación de casos de prueba.

4. 📄 Documentos Clave y Contextualización
Cada interacción con IA debe referenciar uno o varios de estos documentos:

| Documento           | Descripción                        | Se actualiza cuando…                |
| ------------------- | ---------------------------------- | ----------------------------------- |
| **AI_WORKFLOW.md**  | Protocolo de interacción con IA    | Cuando cambia la metodología        |
| **README.md**       | Información general del proyecto   | Cambios funcionales importantes     |


5. 🔁 Dinámicas de Interacción
5.1. Solicitud estándar

Toda petición debe seguir este formato:

Contexto:
[Explicar qué se está haciendo y por qué]

Objetivo:
[Qué se quiere obtener]

Restricciones:
[Lenguajes, versiones, tecnologías]

Formato de salida:
[Ej: código, tabla, texto, diagrama]


Ejemplo real:

Contexto: Tengo un microservicio Node.js que consume una cola RabbitMQ y envia pedidos a cocina.
Objetivo: Necesito un worker que procese un pedido a la vez y notifique vía WebSocket.
Restricciones: Node.js, ts-node, RabbitMQ 3.12, Express, ws.
Formato: Código + explicación breve.

5.2. Tipos de solicitud permitidos

Explicación técnica.
Recomendación.
Mejora o refactor de código.
Generación de funciones, endpoints o componentes.
Validación de ideas o diseño.

5.3. Tipos de solicitud prohibidos

Solicitar decisiones sin criterio humano.
Enviar datos sensibles reales.
Usar IA para bypassear revisiones del equipo.


6. 🛠 Flujo de Trabajo Completo

6.1 Identificar necesidad
(ej: “necesito optimizar la función del worker”).

6.2 Consultar la IA siguiendo el formato estándar.

6.3 Analizar la respuesta
¿Tiene sentido técnico?
¿Rompe algo?
¿Es mejor que lo actual?

6.4 Implementar (si aplica)
Documentar los cambios
README
Commits
Pull request

6.5 Revisión por pares

6.6 Merge

7. 🤖 Responsabilidades del Equipo Frente a la IA

| Rol                | Responsabilidad                                         |
| ------------------ | ------------------------------------------------------- |
| **Desarrollador**  | Solicita, valida e implementa contenido generado por IA |
| **Líder técnico**  | Revisa consistencia, arquitectura, decisiones           |
| **QA**             | Evalúa casos generados por IA y detecta errores         |
| **Todo el equipo** | Mantiene actualizado este documento                     |


8. 📌 Mantenimiento del Documento

Este archivo debe actualizarse cuando:

Cambien las reglas de uso de IA.
Se incluya una nueva herramienta (ej: Claude, Gemini).
Se modifique el proceso de desarrollo.
Se identifiquen malas prácticas que deban evitarse.
