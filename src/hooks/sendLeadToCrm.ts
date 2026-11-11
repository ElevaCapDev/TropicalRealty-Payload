import type { CollectionAfterChangeHook } from 'payload'

type Entry = { field: string; value?: unknown }

// Nombres de campo de los formularios del sitio → campos del lead en Real CRM.
const ALIASES: Record<string, string> = {
  'full-name': 'fullName',
  nombre: 'fullName',
  'first-name': 'firstName',
  'last-name': 'lastName',
  apellido: 'lastName',
  email: 'email',
  correo: 'email',
  phone: 'phone',
  telefono: 'phone',
  teléfono: 'phone',
  message: 'message',
  mensaje: 'message',
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_term: 'utmTerm',
  utm_content: 'utmContent',
  product_sku: 'productSku',
}

const text = (value: unknown) =>
  value === undefined || value === null || value === '' ? undefined : String(value).trim()

/**
 * Envía cada envío de formulario a Real CRM como lead (`POST /leads/intake`). Apagado mientras
 * falten CRM_API_URL o CRM_API_KEY. Si el CRM falla, el envío ya quedó guardado en Payload y el
 * visitante ve su confirmación igual; el error queda en el log.
 */
export const sendLeadToCrm: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  const { CRM_API_URL, CRM_API_KEY } = process.env
  if (operation !== 'create' || !CRM_API_URL || !CRM_API_KEY) return doc

  const lead: Record<string, string | undefined> = {}
  const fields: Record<string, unknown> = {}
  for (const { field, value } of (doc.submissionData ?? []) as Entry[]) {
    const key = ALIASES[field.toLowerCase()]
    if (key) lead[key] = text(value)
    else fields[field] = value
  }

  const formId = typeof doc.form === 'object' ? doc.form.id : doc.form
  const form = await req.payload
    .findByID({ collection: 'forms', id: formId, depth: 0, req })
    .catch(() => null)
  if (form?.title) fields.form = form.title

  const { fullName, ...rest } = lead
  const [firstName, ...lastNames] = fullName?.split(/\s+/) ?? []

  try {
    const response = await fetch(`${CRM_API_URL.replace(/\/$/, '')}/leads/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': CRM_API_KEY },
      body: JSON.stringify({
        idempotencyKey: `tropicalrealty-form-${doc.id}`,
        channel: 'form',
        firstName,
        lastName: lastNames.join(' ') || undefined,
        ...rest,
        fields,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) {
      req.payload.logger.error(
        `Real CRM rechazó el envío ${doc.id}: ${response.status} ${await response.text()}`,
      )
    }
  } catch (error) {
    req.payload.logger.error({ err: error }, `No se pudo enviar el envío ${doc.id} a Real CRM`)
  }
  return doc
}
