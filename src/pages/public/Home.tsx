import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-purple-800 mb-4">Notas de Residentes UNSA</h1>
        <p className="text-xl text-gray-600">
          Plataforma para la gestión y consulta de calificaciones de residentes en rotaciones hospitalarias
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Para Residentes</h2>
          <p className="text-gray-600 mb-6">
            Consulta tus calificaciones en las diferentes rotaciones y servicios hospitalarios. Accede con tu correo
            institucional, CUI y DNI.
          </p>
          <Link to="/consulta" className="btn-primary inline-block">
            Consultar Notas
          </Link>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Para Administradores</h2>
          <p className="text-gray-600 mb-6">
            Accede al panel administrativo para registrar calificaciones, gestionar residentes y administrar usuarios
            del sistema.
          </p>
          <Link to="/auth/login" className="btn-primary inline-block">
            Acceso Administrativo
          </Link>
        </div>
      </div>

      <div className="card mb-12">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">Acerca del Sistema</h2>
        <p className="text-gray-600 mb-4">
          El Sistema de Evaluación para Residentes Médicos permite a los docentes y administradores registrar las
          calificaciones de los residentes en sus rotaciones hospitalarias, evaluando tres aspectos fundamentales:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
          <li>Conocimientos teóricos</li>
          <li>Habilidades prácticas</li>
          <li>Aptitudes profesionales</li>
        </ul>
        <p className="text-gray-600">
          Los residentes pueden consultar sus calificaciones de manera sencilla y segura, accediendo con sus
          credenciales institucionales.
        </p>
      </div>
    </div>
  )
}

export default Home
