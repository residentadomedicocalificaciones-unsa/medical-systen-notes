import type { User } from "firebase/auth"

interface HeaderProps {
  user: User | null
}

const Header = ({ user }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-6">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-800">Notas de Residentes UNSA</h1>
      </div>

      {user && (
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-4">{user.displayName}</span>
          {user.photoURL ? (
            <img
              src={user.photoURL || "/placeholder.svg"}
              alt={user.displayName || "Usuario"}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
              {user.displayName ? user.displayName[0].toUpperCase() : "U"}
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Header
