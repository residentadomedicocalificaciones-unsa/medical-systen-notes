"use client"

import { useQuery } from "@tanstack/react-query"
import { usuarioService } from "../services"
import { useState } from "react"

export const useUsuarios = () => {
  const [id, setId] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)

  const queryId = useQuery({
    queryKey: ["usuarios", id],
    queryFn: () => (id ? usuarioService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  })

  const queryEmail = useQuery({
    queryKey: ["usuarios", "email", email],
    queryFn: () => (email ? usuarioService.getByEmail(email) : Promise.resolve(null)),
    enabled: !!email,
  })

  // Obtener un usuario por ID
  const getById = (id: string | undefined) => {
    setId(id)
  }

  // Obtener un usuario por email
  const getByEmail = (email: string | undefined) => {
    setEmail(email)
  }

  return {
    getById,
    getByEmail,
    queryId,
    queryEmail,
  }
}
