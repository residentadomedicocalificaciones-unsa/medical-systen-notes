interface LogoProps {
  className?: string
}

const Logo = ({ className = "h-12 w-auto" }: LogoProps) => {
  return (
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_medicina.jpg-mheUimOJ1o46nqomtimfoXJ0CqcZSv.jpeg"
      alt="Facultad de Medicina UNSA"
      className={className}
    />
  )
}

export default Logo
