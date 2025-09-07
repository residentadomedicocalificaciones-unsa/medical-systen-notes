"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { usuarioService, administradorService } from "../services";

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (user: User): Promise<boolean> => {
    try {
      if (!user.email) {
        console.log("❌ Usuario sin email");
        setIsAdmin(false);
        return false;
      }

      console.log(`🔍 Verificando admin status para: ${user.email}`);

      // Verificar si hay un admin pendiente primero
      const hasPending = await administradorService.hasPendingAdminByEmail(
        user.email
      );
      if (hasPending) {
        console.log(`⏳ Admin pendiente encontrado, intentando activar...`);
        const activated = await administradorService.activatePendingAdmin(
          user.uid,
          user.email
        );
        if (activated) {
          console.log(`🎉 Admin pendiente activado exitosamente!`);
        }
      }

      // Verificar el estado actual después de la posible activación
      const adminStatus = await administradorService.isAdmin(user.uid);
      setIsAdmin(adminStatus);

      console.log(`🎯 Admin status final para ${user.email}: ${adminStatus}`);
      return adminStatus;
    } catch (error) {
      console.error("❌ Error al verificar estado de administrador:", error);
      setIsAdmin(false);
      return false;
    }
  };

  const refreshAdminStatus = async () => {
    if (currentUser) {
      console.log("🔄 Refrescando admin status...");
      await checkAdminStatus(currentUser);
    }
  };

  useEffect(() => {
    console.log("🚀 Iniciando AuthProvider...");

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔄 Auth state changed:", user?.email || "No user");
      setCurrentUser(user);

      if (user) {
        try {
          console.log(`👤 Procesando usuario: ${user.email}`);

          // Crear o actualizar información del usuario
          const userData = {
            id: user.uid,
            nombre: user.displayName || "Usuario sin nombre",
            email: user.email || "",
            photoURL: user.photoURL || undefined,
          };

          console.log("💾 Creando/actualizando usuario...");
          await usuarioService.createUserIfNotExists(userData);
          console.log("✅ Usuario creado/actualizado exitosamente");

          // Verificar estado de admin con un delay más corto
          console.log("⏳ Verificando admin status...");
          setTimeout(async () => {
            await checkAdminStatus(user);
            setLoading(false);
          }, 1500);
        } catch (error) {
          console.error("❌ Error al procesar usuario:", error);
          setIsAdmin(false);
          setLoading(false);
        }
      } else {
        console.log("👋 Usuario desconectado");
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log("🔐 Iniciando login con Google...");

      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      const result = await signInWithPopup(auth, provider);
      console.log("✅ Login exitoso:", result.user.email);

      // El resto del procesamiento se maneja en onAuthStateChanged
    } catch (error) {
      console.error("❌ Error al iniciar sesión con Google:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("👋 Cerrando sesión...");
      await signOut(auth);
      setIsAdmin(false);
      console.log("✅ Logout exitoso");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    signInWithGoogle,
    logout,
    refreshAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
