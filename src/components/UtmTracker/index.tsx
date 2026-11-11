'use client'

import { useEffect } from 'react'

import { rememberUtm } from '@/utilities/utm'

/** Guarda los UTMs de la URL de llegada para enviarlos con el formulario. */
export const UtmTracker = () => {
  useEffect(() => {
    rememberUtm(window.location.search)
  }, [])

  return null
}
