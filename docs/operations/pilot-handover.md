# Documento de Handover del Piloto y Release Notes

**Proyecto:** OnlyDucks MVP  
**Version:** v0.1.0-pilot  
**Fecha de Entrega:** 11 de noviembre de 2026  
**Responsable Tecnico:** Staff Backend & Solutions Architect (TL1 / DEV01)  
**Aprobador de Negocio:** Project Manager (PM)  
**Estado:** Entregado para Piloto  

---

## 1. Resumen Ejecutivo de la Entrega

El presente documento formaliza la entrega y traspaso operativo del MVP Piloto de OnlyDucks (version `v0.1.0-pilot`) en la fecha fijada por el roadmap del proyecto (11 de noviembre de 2026).

El objetivo primordial del piloto consiste en validar de forma fehaciente en un entorno productivo controlado:
1. La arquitectura desacoplada y la experiencia de usuario orientada a mentoria tecnica guiada.
2. La resiliencia transaccional y la garantia de concurrencia estricta de una sola sesion activa por usuario.
3. El motor conversacional acotado a turnos didacticos que desembocan en una recomendacion accionable.
4. La medicion y atribucion fidedigna de clics salientes hacia los recursos formativos de `notodoescodigo.com` sin exponer informacion confidencial ni simular conversiones no verificadas.

Todos los criterios de calidad tecnica (cobertura de tests unitarios y de integracion en verde, verificacion de tipos con TypeScript y validacion estricta con ESLint) se han completado al 100%.

---

## 2. Recorrido del Flujo Critico Acordado

El recorrido de usuario implementado y validado de extremo a extremo abarca las siguientes 4 fases secuenciales:

```
[1. Aterrizaje / Bienvenida]
          │
          ▼
[2. Seleccion de Mentor / Sandbox]
          │
          ▼
[3. Conversacion Orientada a 4 Turnos]
          │
          ▼
[4. Recomendacion y Atribucion hacia notodoescodigo.com]
```

### 2.1. Fase 1: Aterrizaje y Acceso Seguro (`/welcome` o `/`)
- Presentacion clara de la propuesta de valor de OnlyDucks.
- Autenticacion del usuario mediante sesion HTTP-only cifrada con proteccion frente a CSRF basada en verificacion de origen estricta (`hasValidRequestOrigin`).
- Creacion y vinculacion transparente de la identidad del usuario en la tabla `User`.

### 2.2. Fase 2: Seleccion de Mentor y Preparacion del Sandbox (`/mentors` o `/sandbox`)
- Presentacion de los tres perfiles de mentoria aprobados:
  1. `python-socratic`: Mentoria socratica focalizada en resolucion de problemas y arquitectura con Python.
  2. `interview-prep`: Preparacion tecnica de entrevistas de ingenieria de software y diseno de sistemas.
  3. `supportive-learning`: Acompanamiento guiado y refuerzo pedagogico para desarrolladores en transicion.
- Inicializacion atomica de la sesion de mentoria via `POST /api/mentor-sessions`.
- Bloqueo transaccional ante intentos de sesion concurrente (HTTP 409 Conflict).

### 2.3. Fase 3: Conversacion Didactica Orientada a 4 Turnos (`/agent` o interfaz de chat)
- Interaccion acotada pedagogicamente: turnos 1 a 4 disenados para diagnosticar el reto, profundizar en la solucion y evaluar la implementacion.
- Preservacion del contexto de mensajes en base de datos (`MentorMessage`) con incremento secuencial de `turnCount`.
- Salvaguarda frente a fallos del proveedor de IA, evitando caidas del cliente web y garantizando respuestas degradadas seguras si la cuota externa se agota.

### 2.4. Fase 4: Recomendacion y Atribucion hacia `notodoescodigo.com`
- Generacion del siguiente paso formativo al finalizar la conversacion o alcanzar el hito didactico.
- Presentacion de tarjetas de contenido (`ContentItem`) enlazadas a recursos especificos de `notodoescodigo.com`.
- Despacho de eventos de analitica sanitizados via `POST /api/analytics/events` (`eventType: outbound_click`), garantizando que tokens, contrasenas y correos sean eliminados o redactados antes de persistir en base de datos.
- Cierre formal de la sesion a estado `COMPLETED` via `PATCH /api/mentor-sessions/:id`.

---

## 3. Registro Formal de Limitaciones Conocidas y Ruta de Demo Controlada (Gobernanza PM - Issue #24)

Conforme a la resolucion formal de gobernanza emitida por el Project Manager en el marco del **Issue #24** para salvaguardar la fecha de entrega del piloto, se establecen las siguientes limitaciones operativas y su estrategia de mitigacion:

### 3.1. Autenticacion: Contrato de Identidad Local del MVP
- **Estado:** Se opera con el modulo de autenticacion local con hash de contrasenas mediante `scrypt` (`User` vinculado a `LocalCredential` con prefijo `local:<username>`).
- **Motivo de Gobernanza:** A la fecha de entrega del piloto, las credenciales de produccion y el protocolo de integracion definitivo del proveedor de Single Sign-On (SSO) corporativo del cliente permanecen pendientes de formalizacion contractual y apertura de cortafuegos.
- **Garantia Arquitectonica:** La entidad `User` abstrae completamente el `externalUserId`. Cuando el cliente proporcione el IdP corporativo (OpenID Connect / SAML), se sustituira el proveedor de login sin alterar los esquemas de sesiones, historial ni atribucion.
- **Impacto en Piloto:** Ninguno en el flujo funcional. Los usuarios de prueba se autentican mediante las credenciales de demo habilitadas.

### 3.2. Oscar API: Adaptador Compatible con Groq / Llama 3.3
- **Estado:** Se opera mediante el adaptador de IA basado en la API de Groq (`llama-3.3-70b-versatile` / OpenAI-compatible).
- **Motivo de Gobernanza:** La API propietaria de Oscar del cliente no dispone de cuotas de produccion ni documentacion de endpoints definitivos en la fecha de cierre del piloto.
- **Garantia Arquitectonica:** Toda invocacion reside en el modulo servidor `src/modules/mentors/` aislado detras de la interfaz del servicio, impidiendo la exposicion de claves al navegador y permitiendo el intercambio del cliente HTTP en cuanto se habiliten las credenciales de Oscar.
- **Impacto en Piloto:** Las conversaciones operan con alta velocidad y precision didactica a traves del modelo LLM configurado.

### 3.3. Feed de Contenido: Adaptadores Controlados y Catalogo Curado
- **Estado:** El catalogo de recursos recomendados se sirve mediante adaptadores estructurados y semillas curadas en base de datos.
- **Motivo de Gobernanza:** El endpoint definitivo del CMS o feed dinamico del cliente no ha sido publicado en el entorno de integracion.
- **Garantia Arquitectonica:** Los objetos `ContentItem` cumplen el contrato unificado (`type`, `title`, `summary`, `destinationUrl`, `source`), permitiendo conectar un scraper o webhook sin impactar el modelo de datos.
- **Impacto en Piloto:** Los enlaces conducen de forma veridica hacia `notodoescodigo.com` y permiten auditar la captura de clics en la base de datos.

### 3.4. Guia de Demostracion Controlada para Stakeholders

Para llevar a cabo una demostracion impecable ante el comite de direccion o stakeholders:

1. **Paso 1 - Acceso:**
   Navegar a `APP_BASE_URL` (o `http://localhost:3000`). Iniciar sesion con las credenciales demo:
   - Usuario: `pilotdemo`
   - Contrasena: `PilotPassword2026!`
2. **Paso 2 - Seleccion de Mentor:**
   Acceder a `/mentors` o `/sandbox` y seleccionar **Python Socratic**.
3. **Paso 3 - Interaccion Guiada:**
   Enviar una duda representativa (ej. *"Como estructurar un refactor de un modulo monolito en servicios independientes?"*).
   Comprobar la respuesta pedagogica socratica orientada a la reflexion del desarrollador.
4. **Paso 4 - Recomendacion y Atribucion:**
   Visualizar la tarjeta de contenido recomendada vinculada a `notodoescodigo.com`.
   Hacer clic en el enlace del recurso.
5. **Paso 5 - Verificacion de Smoke Test:**
   Ejecutar en la terminal `npm run test:smoke` para demostrar al cliente que la salud del sistema, la integridad de concurrencia y la captura analitica se encuentran al 100% en verde.

---

## 4. Matriz de Responsabilidades y Propiedad Operativa (Handover Matrix)

| Rol / Area | Titular | Componentes Asignados | Responsabilidad en Piloto |
|---|---|---|---|
| **Project Manager (PM)** | PM Team | Gobernanza y Aceptacion | Coordinacion con stakeholders, gestion de alcance y aprobacion de hitos |
| **Staff Backend Architect (TL1 / DEV01)** | TL1 / DEV01 | Backend, DB, Docker, Infraestructura | Integridad del esquema Prisma, concurrencia, despliegue, smoke tests y rollback |
| **Security & Auth Lead (TL2 / DEV02)** | TL2 / DEV02 | Autenticacion y Sesiones | Gestion de cookies de sesion, sanitizacion CSRF y preparacion de interfaz SSO |
| **AI Mentors & UX Lead (TL3 / DEV03)** | TL3 / DEV03 | Motor Conversacional y UI | Adaptador de LLM, perfiles de mentores y control de turnos en cliente |
| **Feed, Analytics & QA Lead (TL4 / DEV04)**| TL4 / DEV04 | Feed, Eventos y Calidad | Catalogo de contenidos, sanitizacion de eventos analiticos y pruebas E2E |

### 4.1. Canales de Soporte y Escalado Durante el Piloto

- **Incidencias de Severidad P0 (Bloqueo Total / Caida de Base de Datos):**
  - Notificacion inmediata al canal de operaciones.
  - Tiempo de respuesta objetivo (SLA): < 30 minutos.
  - Responsable directo de guardia: Staff Backend Architect (TL1).
- **Incidencias de Severidad P1 (Degradacion de IA o Inconsistencia Analitica):**
  - Tiempo de respuesta objetivo (SLA): < 2 horas.
  - Responsable directo de guardia: TL3 (IA) o TL4 (Analitica).
- **Incidencias de Severidad P2 / Consultas Generales:**
  - Gestion mediante el tablero de seguimiento de incidencias con resolucion en ventana de mantenimiento.

---

## 5. Artefactos Entregados

1. **Script de Smoke Test:** `scripts/smoke-test.mjs` (disponible via `npm run test:smoke`).
2. **Guia de Despliegue y Operaciones:** `docs/operations/deployment.md`.
3. **Documento de Handover y Release Notes:** `docs/operations/pilot-handover.md`.
4. **Esquema de Base de Datos y Migraciones:** `prisma/schema.prisma` y directorio de migraciones.
5. **Configuracion de Contenedores:** `Dockerfile` y `docker-compose.yml`.
