"use client"

import { Link } from "react-router-dom"
import { useState } from "react"
import Logo from "./Logo"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Logo className="h-10 w-auto" />
              <span className="ml-2 text-xl font-semibold text-purple-800">Sistema de Evaluación</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md">
              Inicio
            </Link>
            <Link to="/consulta" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md">
              Consultar Notas
            </Link>
            <Link to="/auth/login" className="btn-primary">
              Acceso Administrativo
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-purple-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/consulta"
              className="block text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Consultar Notas
            </Link>
            <Link to="/auth/login" className="block btn-primary mt-2" onClick={() => setIsOpen(false)}>
              Acceso Administrativo
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
