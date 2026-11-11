# Guia de Despliegue y Procedimientos Operativos

**Documento:** Manual de Despliegue e Infraestructura  
**Codigo de Entrega:** WP-09 (Issue #14)  
**Version:** v0.1.0-pilot  
**Fecha de Entrega:** 2026-11-11  
**Autor:** Staff Backend & Solutions Architect (TL1 / DEV01)  
**Estado:** Aprobado para Despliegue de Piloto  

---

## 1. Alcance y Topologias Soportadas

Este documento define el procedimiento estandarizado para compilar, desplegar, migrar y operar OnlyDucks en sus dos topologias de infraestructura aprobadas:

1. **Topologia A (Contenerizada on-premises / IaaS):** Orquestacion mediante Docker y Docker Compose con PostgreSQL dedicado en red aislada y servicio Next.js en ejecucion standalone.
2. **Topologia B (PaaS / Serverless Cloud):** Despliegue en Vercel acoplado a una base de datos PostgreSQL gestionada (Supabase, Neon o AWS RDS) con proxy de pooling de conexiones transaccionales.

Ambas configuraciones preservan la integridad de las sesiones de mentoria, la proteccion de concurrencia y el registro sanitizado de eventos de atribucion hacia `notodoescodigo.com`.

---

## 2. Despliegue Contenerizado con Docker y Docker Compose

### 2.1. Arquitectura de Imagenes y Contenedores

La infraestructura contenerizada utiliza una compilacion multi-etapa optimizada para Node.js 22 LTS:

- **Etapa deps:** Instalacion limpia de dependencias de produccion y desarrollo requeridas para compilar (`package.json`, `package-lock.json`).
- **Etapa builder:** Generacion de artefactos Prisma (`prisma generate`) y compilacion optimizada de Next.js (`npm run build`) en modo standalone.
- **Etapa runner:** Entorno de ejecucion minimalista basado en `node:22-alpine` que no contiene herramientas de compilacion. Corre bajo un usuario de sistema sin privilegios (`nextjs:nodejs`, UID 1001), exponiendo el puerto 3000.

El archivo `docker-compose.yml` orquesta dos servicios:
- `db`: PostgreSQL 16 Alpine con volumen persistente `onlyducks_pgdata` y comprobacion de salud activa mediante `pg_isready`.
- `app`: Servicio de aplicacion Next.js standalone, dependiente del estado saludable del servicio `db`.

### 2.2. Procedimiento de Lanzamiento Paso a Paso

1. **Preparacion de variables de entorno:**
   Crear el archivo `.env.production` en el directorio raiz a partir de la matriz de variables definida en la Seccion 5:
   ```bash
   cp .env.example .env.production
   ```

2. **Compilacion y arranque de servicios en segundo plano:**
   ```bash
   docker compose --env-file .env.production up -d --build
   ```

3. **Verificacion del estado de los contenedores:**
   ```bash
   docker compose ps
   ```
   Ambos contenedores deben mostrar estado `Up` y `(healthy)`.

4. **Aplicacion de migraciones del esquema de base de datos:**
   ```bash
   docker compose exec app npx prisma migrate deploy
   ```

5. **Provisionamiento de credenciales locales de demostracion (MVP):**
   ```bash
   docker compose exec -e DEMO_USERNAME=pilotdemo -e DEMO_PASSWORD=PilotPassword2026! app node scripts/create-demo-user.mjs
   ```

6. **Ejecucion de la bateria de Smoke Tests automatizados:**
   ```bash
   docker compose exec app npm run test:smoke
   ```
   La suite debe concluir con `OVERALL STATUS: ALL SMOKE TESTS PASSED (EXIT CODE 0)`.

7. **Inspeccion de registros en tiempo real:**
   ```bash
   docker compose logs -f app
   ```

---

## 3. Despliegue en Plataforma PaaS / Serverless (Vercel + PostgreSQL Gestionado)

### 3.1. Requisitos de la Base de Datos Gestionada (Supabase / Neon)

En entornos Serverless, cada invocacion de funcion lambda puede crear una nueva conexion hacia la base de datos, lo que provoca agotamiento del pool de PostgreSQL (`max_connections exceeded`). Para mitigar este riesgo:

1. **Connection Pooling (PgBouncer):**
   - Configurar `DATABASE_URL` apuntando al endpoint de pool transaccional (puerto 6543 en Supabase o endpoint `-pooler` en Neon), habilitando `?pgbouncer=true&connection_limit=1`.
2. **Direct URL para Migraciones:**
   - Para ejecutar `prisma migrate deploy`, utilizar una variable complementaria `DIRECT_URL` que apunte al puerto directo de PostgreSQL (5432) sin pasar por PgBouncer, ya que PgBouncer no soporta transacciones DDL o advisory locks de Prisma.

### 3.2. Configuracion del Proyecto en Vercel

1. **Importacion de Repositorio:**
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Node.js Version: `22.x`

2. **Pipeline de Compilacion (Build Settings):**
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Variables de Entorno en Vercel Dashboard:**
   - Navegar a **Settings -> Environment Variables**.
   - Cargar todas las variables requeridas para el entorno `Production` (ver Seccion 5).
   - Marcar variables secretas como `Sensitive` / `Encrypted`.

### 3.3. Pipeline de Migracion Pre-Deploy

En plataformas Serverless, las migraciones de base de datos nunca deben ejecutarse durante el ciclo de vida de una funcion lambda. Deben ejecutarse previamente en el pipeline de integracion o despliegue continuo (CI/CD):

```bash
# Ejecutar localmente con acceso seguro o en GitHub Actions antes de promover el despliegue
DATABASE_URL="postgresql://user:pass@host:5432/onlyducks?sslmode=require" npx prisma migrate deploy
```

---

## 4. Estrategia y Aplicacion de Migraciones de Base de Datos

### 4.1. Diferencia Operativa entre Comandos Prisma

- **`npx prisma migrate deploy` (OBLIGATORIO EN PRODUCCION):**
  - Lee las migraciones contenidas en la carpeta `prisma/migrations/`.
  - Aplica de forma secuencial y determinista las migraciones pendientes que no hayan sido registradas en la tabla `_prisma_migrations`.
  - Falla de manera inmediata ante cualquier discrepancia o drift en la base de datos, sin riesgo de perdida accidental de datos.
- **`npx prisma db push` (SOLO DESARROLLO / PROTOTIPADO RAPIDO):**
  - Modifica el esquema directamente contra la base de datos sin generar historial ni registrar archivos de migracion.
  - Prohibido su uso en entornos de testing compartido, staging o produccion del piloto.

### 4.2. Procedimiento de Verificacion y Ejecucion de Migraciones

Antes de aplicar cualquier migracion en un entorno de despliegue:

1. **Comprobar el estado actual de las migraciones:**
   ```bash
   npx prisma migrate status
   ```
2. **Realizar un snapshot o backup de seguridad de la base de datos:**
   ```bash
   pg_dump -h <host> -U <usuario> -d onlyducks -F c -b -v -f "./backup_pre_deploy_$(date +%Y%m%d_%H%M%S).dump"
   ```
3. **Aplicar las migraciones pendientes:**
   ```bash
   npx prisma migrate deploy
   ```
4. **Verificar que el esquema y los clientes esten sincronizados:**
   ```bash
   npx prisma generate
   ```

---

## 5. Matriz de Variables de Entorno del Servidor

Todas las variables de entorno deben configurarse en el sistema de gestion de secretos de la plataforma de hosting. Queda terminantemente prohibido incluir valores de produccion en el control de versiones.

| Variable | Requerida | Ambito | Descripcion | Valor de Ejemplo Sanitizado |
|---|---|---|---|---|
| `NODE_ENV` | Si | Build / Runtime | Modo de ejecucion de la aplicacion Next.js | `production` |
| `APP_BASE_URL` | Si | Runtime | URL canonica publica del servicio (usada para validacion CSRF y enlaces) | `https://onlyducks.tu-dominio.com` |
| `DATABASE_URL` | Si | Build / Runtime | Cadena de conexion PostgreSQL (con pooling en Serverless) | `postgresql://user:secret@db.host.internal:5432/onlyducks?schema=public` |
| `DIRECT_URL` | Condicional | Migraciones | Cadena de conexion directa a PostgreSQL (necesaria en Supabase/Neon para migraciones) | `postgresql://user:secret@db.host.internal:5432/onlyducks` |
| `GROQ_API_KEY` | Si (Piloto) | Runtime | Clave API de Groq para el adaptador conversacional de mentores | `gsk_demo_service_key_placeholder` |
| `GROQ_MODEL` | No | Runtime | Modelo LLM configurado en el adaptador Groq | `llama-3.3-70b-versatile` |
| `AI_MODEL_NAME` | No | Runtime | Identificador de visualizacion del modelo LLM | `llama-3.3-70b-versatile` |
| `DEMO_USERNAME` | No | Scripts / Local | Nombre de usuario inicial para la cuenta demo del piloto | `pilotdemo` |
| `DEMO_PASSWORD` | No | Scripts / Local | Contrasena para la cuenta demo del piloto (minimo 12 caracteres) | `PilotPassword2026!` |
| `OSCAR_API_BASE_URL`| No | Runtime | Endpoint base de Oscar API (pendiente de acceso de produccion) | `https://api.oscar.interno.client.net/v1` |
| `OSCAR_API_KEY` | No | Runtime | Token de servicio para Oscar API | `oscar_sec_placeholder` |
| `AUTH_ISSUER_URL` | No | Runtime | Emisor OpenID Connect para SSO corporativo (Fase post-piloto) | `https://auth.client.net/realms/corporate` |
| `AUTH_CLIENT_ID` | No | Runtime | Client ID registrado en el IdP corporativo | `onlyducks-pilot-client` |
| `AUTH_CLIENT_SECRET`| No | Runtime | Client Secret registrado en el IdP corporativo | `auth_sec_placeholder` |
| `AUTH_CALLBACK_URL`| No | Runtime | Callback URL de redireccion post-autenticacion | `https://onlyducks.tu-dominio.com/api/auth/callback` |

---

## 6. Procedimiento de Rollback y Recuperacion ante Incidentes

Ante fallos criticos detectados durante el despliegue o la ejecucion de los smoke tests, se activara de forma inmediata el procedimiento de rollback correspondiente.

### 6.1. Rollback a Nivel de Aplicacion (Fast Rollback)

- **En Vercel (PaaS):**
  1. Acceder a **Deployments** en el panel de Vercel.
  2. Localizar el despliegue precedente que se encontraba en estado saludable.
  3. Seleccionar **Instant Rollback**. El trafico de red se redirige al commit anterior en menos de 5 segundos sin re-compilar.
- **En Docker Compose (Contenerizado):**
  1. Revertir el puntero git al commit o tag previo:
     ```bash
     git checkout <commit-anterior-estable>
     ```
  2. Reconstruir e iniciar contenedores con la imagen verificada:
     ```bash
     docker compose --env-file .env.production up -d --build
     ```

### 6.2. Recuperacion y Rollback a Nivel de Base de Datos

Si el incidente involucro migraciones de base de datos:

1. **Principio de Compatibilidad Hacia Atras:**
   Todas las migraciones deben redactarse bajo la regla de no romper el codigo previo (backward-compatible). Si una columna deja de usarse, no se elimina hasta una version posterior.
2. **Restauracion Point-in-Time (PITR):**
   En bases de datos gestionadas (Supabase / AWS RDS / Neon), restaurar la base de datos al punto exacto previo a la ejecucion de la migracion fallida mediante la consola del proveedor.
3. **Restauracion desde Backup Manual (Docker):**
   ```bash
   docker compose down
   docker volume rm onlyducks_onlyducks_pgdata
   docker compose up -d db
   docker compose exec -T db pg_restore -U onlyducks -d onlyducks < ./backup_pre_deploy.dump
   ```

### 6.3. Protocolo de Notificacion y Clasificacion

Toda anomalia que impida la consecucion de los 7 pasos de smoke test debe notificarse conforme a la guia de `docs/operations/incident-response.md`, clasificandola con severidad P0 (Bloqueo de servicio) o P1 (Degradacion funcional) y asignando la resolucion al Staff Backend Architect (TL1).

---

## 7. Verificacion Operativa Post-Despliegue (Smoke Testing)

Una vez completado el despliegue en cualquiera de las plataformas, es de obligado cumplimiento ejecutar la bateria de pruebas de aceptacion operativa:

```bash
# En el host de ejecucion o runner CI
APP_BASE_URL="https://onlyducks.tu-dominio.com" npm run test:smoke
```

Criterio de exito irrestricto:
- Los 7 pasos deben emitir `[PASS]`.
- Ningun error HTTP 5xx registrado en logs del servidor.
- Evento de atribucion `outbound_click` registrado y verificado en la base de datos.
