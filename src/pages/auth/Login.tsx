"use client"

import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Logo from "../../components/Logo"

const Login = () => {
  const { currentUser, isAdmin, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch (err) {
      setError("Error al iniciar sesión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Redirigir si el usuario ya está autenticado y es administrador
  if (currentUser && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  // Mostrar mensaje si el usuario está autenticado pero no es administrador
  const notAdminMessage =
    currentUser && !isAdmin ? (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p>Tu cuenta no tiene permisos de administrador. Contacta al administrador del sistema.</p>
      </div>
    ) : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center mb-6">
          <Logo className="h-20 w-auto mb-4" />
          <h2 className="text-2xl font-bold text-purple-800">Acceso Administrativo</h2>
          <p className="text-gray-600 text-center mt-2">Inicia sesión para acceder al panel de administración</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {notAdminMessage}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mb-4"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.082z"
              fill="#4285F4"
            />
          </svg>
          {loading ? "Iniciando sesión..." : "Iniciar sesión con Google"}
        </button>

        <div className="text-center mt-4">
          <a href="/" className="text-sm text-purple-600 hover:text-purple-800">
            Volver a la página principal
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login
