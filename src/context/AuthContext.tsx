"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/config"
import { usuarioService, administradorService } from "../services"

interface AuthContextType {
  currentUser: User | null
  isAdmin: boolean
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdminStatus = async (user: User) => {
    try {
      const adminStatus = await administradorService.isAdmin(user.uid)
      setIsAdmin(adminStatus)
    } catch (error) {
      console.error("Error al verificar estado de administrador:", error)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await checkAdminStatus(user)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Guardar información del usuario
      await usuarioService.createUserIfNotExists({
        id: user.uid,
        nombre: user.displayName || "Usuario sin nombre",
        email: user.email || "",
        photoURL: user.photoURL || undefined,
      })

      await checkAdminStatus(user)
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setIsAdmin(false)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const value = {
    currentUser,
    isAdmin,
    loading,
    signInWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
