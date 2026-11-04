import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Canned responses keyed by (promptKey, turnNumber). Covers the 4-turn
// contract: three conversation turns + one closure turn with the structured
// [CIERRE_SESION] block the server parses.
const CANNED: Record<string, string[]> = {
  'python-socratic-v1': [
    'Buena pregunta. Antes de que te dé pistas: ¿qué parte de tu código crees que decide qué elemento recorres en cada vuelta del bucle?',
    'Interesante. Si cambiases el rango del bucle para que empiece en 1 en lugar de 0, ¿qué pasaría con la primera iteración?',
    'Vas bien. Prueba a añadir un print dentro del bucle para ver qué valor toma la variable en cada paso. ¿Qué esperas ver?',
    `Hemos visto cómo el índice del bucle condiciona el acceso a la lista. Buen trabajo.

[CIERRE_SESION]
tipo: curso
tema: fundamentos de bucles y estructuras de datos en Python
razón: te vendría bien afianzar el recorrido de listas antes de meterte en comprehensions
invitacion: te animo a formalizar lo aprendido con el curso de Python de notodoescodigo.com
[/CIERRE_SESION]`,
  ],
  'interview-prep-v1': [
    'Perfecto. Empezamos con una clásica de junior: explícame la diferencia entre `let`, `const` y `var` en JavaScript, y cuándo elegirías cada uno.',
    (`Bien explicado en general.
- Bien: distinguiste scope de bloque y de función.
- A mejorar: no mencionaste el hoisting de var.
- Nivel pro: hablarías del temporal dead zone de let/const.

Siguiente: ¿qué diferencia hay entre ` ==
      ` y `) ===
      `?`,
    `Correcto pero algo corto.
- Bien: identificaste la coerción de tipos.
- A mejorar: un ejemplo concreto habría ayudado.
- Nivel pro: mencionar que por eso siempre se recomienda === salvo casos muy puntuales.

Última: ¿qué es un closure y para qué sirve?`,
    `Sesión completa. Estás sólido en sintaxis pero te falta profundizar en conceptos de ejecución (closures, scope chain).

[CIERRE_SESION]
tipo: curso
tema: profundización en JavaScript avanzado
razón: dominas la sintaxis pero necesitas afianzar los conceptos de ejecución que suelen diferenciar a un junior listo de uno que aún no
invitacion: te animo a certificarte con el curso de JavaScript avanzado de notodoescodigo.com antes de postular
[/CIERRE_SESION]`,
  ],
  'devops-cloud-v1': [
    'Perfecto. Antes de proponer arquitectura: ¿cuánta carga esperas atender al principio y tu equipo tiene experiencia con Kubernetes o preferís algo más simple?',
    'Con ese volumen, Kubernetes es overkill. Yo iría a algo tipo contenedor único en App Runner, Fly.io o Railway: ganas sencillez operativa, pierdes flexibilidad fina. ¿Tienes requisitos de región específicos?',
    `Con eso claro, te propongo: Dockerfile multi-stage para optimizar tamaño, despliegue en Fly.io en la región de Madrid, Postgres gestionado por el mismo proveedor. Antes de pasar a prod valida: secretos en el gestor del proveedor (nunca en el repo), healthcheck configurado, y backups automáticos de la BD.`,
    `Recomendación: Fly.io + Postgres gestionado + Dockerfile multi-stage. Simple, mantenible y suficiente para el volumen inicial.

[CIERRE_SESION]
tipo: curso
tema: fundamentos de Docker y despliegue en la nube
razón: la elección de plataforma la tienes clara pero conviene afianzar Docker antes de meter el multi-stage en producción
invitacion: te animo a certificarte con el curso de DevOps & Cloud de notodoescodigo.com para consolidarlo
[/CIERRE_SESION]`,
  ],
};

const DEFAULT_RESPONSES = [
  'Respuesta simulada del mentor (turno 1). El mock no reconoció el prompt exacto.',
  'Respuesta simulada del mentor (turno 2). El mock sigue sin reconocer el prompt.',
  'Respuesta simulada del mentor (turno 3). Último turno de conversación.',
  `Respuesta simulada de cierre del mentor.

[CIERRE_SESION]
tipo: curso
tema: tema simulado
razón: el mock no reconoció el promptKey del system message
invitacion: invitación simulada a notodoescodigo.com
[/CIERRE_SESION]`,
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ChatMessage = { role: string; content: string };

function detectPromptKey(messages: ChatMessage[]): string | null {
  const system = messages.find((m) => m.role === 'system');
  if (!system) return null;
  for (const key of Object.keys(CANNED)) {
    if (system.content.includes(key)) return key;
  }
  return null;
}

function detectTurn(messages: ChatMessage[]): number {
  // Server injects "[TURNO: N de 4]" at the start of each call. Fall back to
  // counting user messages if the marker is missing.
  for (const m of messages) {
    const match = m.content.match(/\[TURNO:\s*(\d+)\s*de\s*\d+\]/i);
    if (match) return parseInt(match[1], 10);
  }
  return messages.filter((m) => m.role === 'user').length;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages: ChatMessage[] = body.messages ?? [];
  const model: string = body.model ?? 'gpt-4o-mini';

  // Simulate network + model latency.
  const delay = 400 + Math.floor(Math.random() * 400);
  await sleep(delay);

  const promptKey = detectPromptKey(messages);
  const turn = Math.min(Math.max(detectTurn(messages), 1), 4);
  const bank = (promptKey && CANNED[promptKey]) || DEFAULT_RESPONSES;
  const content = bank[turn - 1];

  // Rough token estimate: 1 token ~= 4 characters of English/Spanish text.
  const promptChars = messages.reduce((n, m) => n + m.content.length, 0);
  const tokensIn = Math.ceil(promptChars / 4);
  const tokensOut = Math.ceil(content.length / 4);

  // Mimic OpenAI chat completion shape so the SDK on the client parses it.
  return NextResponse.json({
    id: `mock_${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: tokensIn,
      completion_tokens: tokensOut,
      total_tokens: tokensIn + tokensOut,
    },
  });
}
