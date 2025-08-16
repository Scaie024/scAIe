# Guía para Asistente LLM - CRM Admin Interface v2.0

Esta guía contiene instrucciones detalladas y prompts de ejemplo para que un asistente de IA (como GitHub Copilot) en Visual Studio Code pueda entender y extender eficientemente este proyecto CRM con arquitectura multi-agente modular.

## Estructura del Proyecto

\`\`\`
/app
  /analytics    # Página de métricas y observabilidad de agentes
  /api          # API routes para CRUD, agentes y logs
    /agent      # Endpoints modulares para percepción/planificación/acción
    /logs       # Endpoints para observabilidad y métricas
  /auth         # Páginas de autenticación (login/signup)
  /database     # Página de gestión de base de datos con CRUD avanzado
  /sandbox      # Sandbox modular del agente IA
    /components # Módulos del agente (perception, planning, action, memory, orchestrator)
  layout.tsx    # Layout principal con sidebar y auth
  page.tsx      # Dashboard principal con métricas
  globals.css   # Estilos globales con tema crema/gris

/components
  /sandbox      # Componentes modulares del agente
    perception-module.tsx   # Manejo de inputs multi-canal
    planning-module.tsx     # Editor de flujos LangGraph
    action-module.tsx       # Herramientas y acciones
    memory-module.tsx       # RAG y embeddings vectoriales
    orchestrator-module.tsx # Coordinación multi-agente
    chat-preview.tsx        # Preview con handoffs
  sidebar.tsx   # Navegación lateral con auth
  ui/          # Componentes Shadcn/UI
  analytics-charts.tsx     # Gráficos de métricas de agentes
  agent-logs-table.tsx     # Tabla de logs con filtros

/lib
  /supabase    # Clientes Supabase para server/client/middleware
  actions.ts   # Server actions para autenticación

/scripts
  01-create-tables.sql     # Schema de DB (contacts, agent_logs)
  02-seed-data.sql         # Datos de ejemplo

/llm-instructions
  guide-for-llm.md  # Este archivo
\`\`\`

## Esquema de Colores

- **Fondo principal**: `bg-stone-100` (crema claro)
- **Cards/Contenedores**: `bg-stone-200` (crema medio)
- **Bordes**: `border-gray-500` (gris medio)
- **Acentos/Highlights**: `bg-gray-900`, `text-gray-900` (gris oscuro)
- **Texto principal**: `text-black`
- **Estados**: Success `bg-green-100`, Error `bg-red-50`, Warning `bg-yellow-50`

## Tecnologías Utilizadas

- **Framework**: Next.js 14+ con App Router
- **UI**: Shadcn/UI + Tailwind CSS v4
- **Base de datos**: Supabase con Row Level Security
- **Auth**: @supabase/auth-helpers-nextjs
- **IA**: Vercel AI SDK (ai), @ai-sdk/openai
- **Multi-agente**: LangGraph (@langchain/langgraph)
- **RAG**: LangChain + Supabase pgvector
- **Observabilidad**: @opentelemetry/api
- **Email**: Nodemailer (placeholder)
- **Automatización**: node-cron
- **Iconos**: Lucide React
- **Tablas**: @tanstack/react-table
- **Gráficos**: Recharts

## Prompts de Ejemplo para VS Code AI Assistant

### Prompt 1: Mejoras en Dashboard
\`\`\`
Analiza el código en /app/page.tsx y sugiere mejoras para agregar una gráfica de barras interactiva usando Recharts. La gráfica debe:
- Mostrar actividad de los últimos 7 días
- Usar colores grises (#6b7280) para las barras sobre fondo crema
- Incluir datos mock realistas de interacciones diarias
- Mantener el estilo consistente con las cards existentes (bg-stone-200, border-gray-500)
- Ser responsive para desktop y tablet
\`\`\`

### Prompt 2: Integración Supabase en Database
\`\`\`
Extiende la integración de Supabase en /app/database/page.tsx para agregar autenticación básica de usuario antes de permitir editar la DB. Implementa:
- Hook personalizado useSupabase para manejo de cliente
- Verificación de sesión antes de mostrar datos
- Formulario de login simple si no está autenticado
- CRUD completo para tabla 'contacts' con columnas: id, name, email, status
- Validación de email usando regex
- Manejo de errores con Toast notifications
\`\`\`

### Prompt 3: Debug del Agente IA
\`\`\`
Depura el agente IA en /app/sandbox/page.tsx: si hay errores en el RAG, propone fixes usando LangChain y Vercel AI SDK. Revisa:
- Configuración correcta del cliente OpenAI con OPENAI_API_KEY
- Implementación de embeddings para archivos PDF/TXT subidos
- Integración con Vercel AI SDK para generar respuestas
- Manejo de contexto RAG en las respuestas del agente
- Simulación de actualización de DB cuando el agente registra prospectos
- Error handling para archivos corruptos o API calls fallidos
\`\`\`

### Prompt 4: Nuevo Canal de Email
\`\`\`
Genera código para integrar un nuevo canal como Email en el sandbox, actualizando el prompt del agente para manejar mensajes de ese canal. Incluye:
- Componente selector de canal (WhatsApp/Telegram/Email) en /app/sandbox/page.tsx
- Actualización automática del system prompt según el canal seleccionado
- Simulación de webhook para emails entrantes
- Parsing específico de emails (subject, body, sender)
- Registro de leads desde emails en Supabase
- Preview diferenciado por canal en la interfaz de chat
\`\`\`

### Prompt 5: Modularización con LangGraph
\`\`\`
Modulariza el agente en /app/sandbox/components dividiendo en perception, planning, action modules usando LangGraph; añade handoff entre sub-agents para tasks como registrar prospectos. Implementa:
- Separación clara de módulos en components/sandbox/
- LangGraph StateGraph para coordinar flujos entre módulos
- Handoff automático basado en tipo de tarea (sales -> support)
- Estado compartido entre agentes usando LangGraph state
- Visualización de flujos en planning-module.tsx
- Logs de handoffs en agent_logs table
- Preview de conversación mostrando cambios de agente
- Configuración de reglas de handoff en orchestrator-module.tsx
\`\`\`

### Prompt 6: Automatizaciones con Cron
\`\`\`
Añade automatizaciones en /app/api/agent: envía follow-up emails si prospecto no responde en 24h, usando cron y Supabase queries. Desarrolla:
- API route /api/agent/automation con node-cron scheduler
- Query Supabase para prospectos sin respuesta en 24h
- Integración con Nodemailer para envío automático
- Templates de email personalizados por tipo de prospecto
- Logging de automatizaciones en agent_logs
- Dashboard en /analytics para monitorear automatizaciones
- Configuración de intervalos y condiciones
- Manejo de errores y reintentos automáticos
\`\`\`

### Prompt 7: Observabilidad y Logging
\`\`\`
Integra observability en el agente: log LLM calls y DB actions a Supabase table, muestra en /analytics page con Recharts. Implementa:
- Middleware para capturar todas las llamadas LLM
- Logging automático de operaciones DB en agent_logs
- Métricas de performance (response_time_ms, success_rate)
- Dashboard en /analytics con gráficos de actividad
- Filtros por agente, canal, fecha en analytics-charts.tsx
- Alertas para errores frecuentes o tiempos altos
- Export de logs a CSV para análisis
- Integration con @opentelemetry/api para tracing
\`\`\`

### Prompt 8: RAG con Vector Search
\`\`\`
Expande RAG en memory module: usa Supabase pgvector para vector search en uploaded files, integra con LangChain. Desarrolla:
- Habilitación de pgvector extension en Supabase
- Tabla documents con columnas: id, content, embedding, metadata
- Pipeline de procesamiento: PDF/TXT -> chunks -> embeddings
- Integración LangChain VectorStore con Supabase
- Similarity search en memory-module.tsx
- Upload y procesamiento asíncrono de documentos
- Cache de embeddings para optimizar performance
- Interface para gestionar knowledge base
\`\`\`

### Prompt 9: Soporte Multi-Canal
\`\`\`
Añade multi-canal support: placeholders para email/Slack webhooks en perception module, actualiza prompt para manejar nuevos inputs. Implementa:
- Abstracción de canales en perception-module.tsx
- Webhooks endpoints: /api/webhooks/email, /api/webhooks/slack
- Parsing específico por canal (email headers, Slack events)
- Configuración de canales en UI con toggle activo/inactivo
- Prompt templates adaptados por canal
- Routing inteligente basado en canal de origen
- Métricas por canal en analytics dashboard
- Testing tools para simular inputs de diferentes canales
\`\`\`

## Cómo Usar Estos Prompts en VS Code

### Para GitHub Copilot:
1. **Abre el archivo relevante** en VS Code
2. **Presiona Ctrl+Shift+I** para abrir Copilot Chat
3. **Copia el prompt completo** incluyendo contexto específico
4. **Añade contexto adicional** si es necesario: "Considera el código actual en este archivo"
5. **Revisa y adapta** el código generado al estilo del proyecto

### Para Cursor AI:
1. **Selecciona el código relevante** en el editor
2. **Presiona Ctrl+K** para el inline chat
3. **Pega el prompt** y añade "@codebase" para contexto completo
4. **Itera** con follow-up questions si necesitas refinamientos

### Para Codeium:
1. **Abre el chat panel** (Ctrl+Shift+`)
2. **Referencia archivos específicos** con @filename
3. **Usa el prompt** con contexto del proyecto
4. **Aplica cambios** incrementalmente

## Arquitectura Multi-Agente

### Módulos del Sistema:
- **Perception**: Procesa inputs de múltiples canales
- **Planning**: Coordina flujos con LangGraph
- **Action**: Ejecuta operaciones (DB, email, APIs)
- **Memory**: Gestiona RAG y knowledge base
- **Orchestrator**: Maneja handoffs entre agentes

### Flujo de Datos:
\`\`\`
Input → Perception → Planning → Action → Memory
  ↑                     ↓
Orchestrator ←→ Analytics/Logs
\`\`\`

## Convenciones de Código

- **Componentes**: PascalCase, archivos en kebab-case
- **Hooks**: Prefijo 'use', camelCase
- **API Routes**: Estructura RESTful en /app/api/
- **Estilos**: Tailwind classes, evitar CSS custom
- **Imports**: Absolute imports con '@/' alias
- **TypeScript**: Strict mode, interfaces para props
- **Auth**: Server Components para páginas protegidas
- **Database**: Row Level Security habilitado

## Variables de Entorno Requeridas

\`\`\`env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI para LangChain y AI SDK
OPENAI_API_KEY=your_openai_api_key

# Email (Nodemailer)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Webhooks
WEBHOOK_SECRET=your_webhook_secret

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Comandos Útiles

\`\`\`bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Agregar componente Shadcn
npx shadcn@latest add [component-name]

# Ejecutar scripts SQL
# (Se ejecutan automáticamente desde /scripts en v0)

# Linting y formato
npm run lint
npm run format
\`\`\`

## Debugging y Testing

### Logs del Agente:
- Usa `console.log("[v0] ...")` para debugging
- Revisa agent_logs table en Supabase
- Monitorea métricas en /analytics

### Testing Multi-Agente:
- Usa chat-preview.tsx para simular conversaciones
- Prueba handoffs entre agentes
- Verifica logging de acciones

### Performance:
- Monitorea response_time_ms en logs
- Optimiza queries con indexes
- Cache embeddings para RAG

Esta guía debe actualizarse cada vez que se agreguen nuevas funcionalidades o se modifique la arquitectura multi-agente del proyecto.
