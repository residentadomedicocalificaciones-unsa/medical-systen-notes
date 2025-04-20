import Logo from "./Logo"

const Footer = () => {
  return (
    <footer className="bg-purple-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Logo className="h-12 w-auto" />
            <div className="ml-4">
              <h3 className="text-xl font-semibold">Facultad de Medicina</h3>
              <p className="text-sm">Universidad Nacional de San Agustín de Arequipa</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm">&copy; {new Date().getFullYear()} Todos los derechos reservados</p>
            <p className="text-sm mt-1">Sistema de Evaluación para Residentes</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
