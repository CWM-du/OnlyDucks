import 'server-only';

export type ClosurePayload = {
  tipo: string | null;
  tema: string | null;
  razon: string | null;
  invitacion: string | null;
};

const BLOCK_RE = /\[CIERRE_SESION\]([\s\S]*?)\[\/CIERRE_SESION\]/i;
const FIELD_RE = /^\s*(tipo|tema|razón|razon|invitaci[oó]n)\s*:\s*(.+)\s*$/i;

/**
 * Pulls the [CIERRE_SESION] block out of the assistant content and returns
 * its four fields. Tolerant of accents and casing. Returns nulls if the
 * block is absent or a field is missing.
 */
export function parseClosure(content: string): ClosurePayload {
  const result: ClosurePayload = {
    tipo: null,
    tema: null,
    razon: null,
    invitacion: null,
  };

  const match = content.match(BLOCK_RE);
  if (!match) return result;

  for (const line of match[1].split('\n')) {
    const field = line.match(FIELD_RE);
    if (!field) continue;

    const key = field[1].toLowerCase();
    const value = field[2].trim();

    if (key === 'tipo') result.tipo = value;
    else if (key === 'tema') result.tema = value;
    else if (key === 'razon' || key === 'razón') result.razon = value;
    else if (key.startsWith('invitaci')) result.invitacion = value;
  }

  return result;
}

/**
 * Removes the [CIERRE_SESION] block from the content before showing it to
 * the user. The parsed fields are rendered as a separate CTA card by the UI.
 */
export function stripClosureBlock(content: string): string {
  return content.replace(BLOCK_RE, '').trim();
}
