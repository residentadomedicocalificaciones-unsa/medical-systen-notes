import logo_medicina from "../assets/logo_medicina.jpg"

interface LogoProps {
  className?: string
}

const Logo = ({ className = "h-12 w-auto" }: LogoProps) => {
  return (
    <img
      src={logo_medicina}
      alt="Facultad de Medicina UNSA"
      className={className}
    />
  )
}

export default Logo
