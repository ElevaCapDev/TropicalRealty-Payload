export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const

export type UtmKey = (typeof UTM_KEYS)[number]

const STORAGE_KEY = 'tr-utm'

// Se guardan al llegar porque el visitante suele navegar a otra página antes de enviar el
// formulario. Una visita con UTMs nuevos reemplaza las anteriores.
export const rememberUtm = (search: string) => {
  const params = new URLSearchParams(search)
  const found = UTM_KEYS.filter((key) => params.get(key)).map((key) => [key, params.get(key)!])
  if (!found.length) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(found)))
  } catch {
    // Sin almacenamiento (modo privado estricto): el lead llega sin UTMs.
  }
}

export const storedUtm = (): Partial<Record<UtmKey, string>> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}
