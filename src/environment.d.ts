declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      /** API de Real CRM, p. ej. https://crm.example.com/api. Sin ella no se envían leads. */
      CRM_API_URL?: string
      /** Clave de Configuración → Integraciones en Real CRM. */
      CRM_API_KEY?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
