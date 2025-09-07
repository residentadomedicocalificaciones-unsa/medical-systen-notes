import {
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { Administrador, Usuario } from "../types";
import { BaseService } from "./base.service";
import { usuarioService } from "./usuario.service";
import { db } from "../firebase/config";

class AdministradorService extends BaseService<Administrador> {
  constructor() {
    super("administradores");
  }

  async isAdmin(userId: string): Promise<boolean> {
    try {
      console.log(`🔍 Verificando si ${userId} es admin...`);

      // Usar getDoc directamente para evitar problemas con el BaseService
      const adminDocRef = doc(db, "administradores", userId);
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data() as Administrador;
        const isActiveAdmin = adminData.activo === true;
        console.log(`✅ Admin encontrado: ${userId}, activo: ${isActiveAdmin}`);
        return isActiveAdmin;
      }

      console.log(`❌ No se encontró admin: ${userId}`);
      return false;
    } catch (error) {
      console.error("❌ Error al verificar si es administrador:", error);
      return false;
    }
  }

  async getAllAdminsWithDetails(): Promise<Usuario[]> {
    try {
      const admins = await this.getAll([where("activo", "==", true)]);
      const adminUsers: Usuario[] = [];

      for (const admin of admins) {
        if (admin.id) {
          try {
            const user = await usuarioService.getById(admin.id);
            if (user) {
              adminUsers.push({
                ...user,
                adminStatus: "activo",
              });
            }
          } catch (error) {
            console.warn(
              `No se pudo obtener usuario para admin ${admin.id}:`,
              error
            );
          }
        }
      }

      return adminUsers;
    } catch (error) {
      console.error("Error al obtener administradores con detalles:", error);
      throw error;
    }
  }

  async getPendingAdmins(): Promise<Administrador[]> {
    try {
      return this.getAll([where("activo", "==", false)]);
    } catch (error) {
      console.error("Error al obtener administradores pendientes:", error);
      throw error;
    }
  }

  async addAdmin(
    email: string
  ): Promise<{ success: boolean; message: string; isPending?: boolean }> {
    try {
      console.log(`➕ Agregando admin: ${email}`);

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("El formato del correo electrónico no es válido");
      }

      // Verificar si ya existe como admin activo
      const existingActiveAdminQuery = query(
        this.getCollection(),
        where("email", "==", email),
        where("activo", "==", true)
      );
      const existingActiveAdminSnapshot = await getDocs(
        existingActiveAdminQuery
      );

      if (!existingActiveAdminSnapshot.empty) {
        throw new Error("Este usuario ya es administrador activo");
      }

      // Verificar si ya existe como admin pendiente
      const existingPendingAdminQuery = query(
        this.getCollection(),
        where("email", "==", email),
        where("activo", "==", false)
      );
      const existingPendingAdminSnapshot = await getDocs(
        existingPendingAdminQuery
      );

      if (!existingPendingAdminSnapshot.empty) {
        throw new Error(
          "Este usuario ya está pendiente de activación como administrador"
        );
      }

      // Buscar si el usuario existe en la colección usuarios
      const user = await usuarioService.getByEmail(email);

      if (user && user.id) {
        console.log(`✅ Usuario existe, creando admin activo: ${email}`);
        // Usuario existe - crear admin activo inmediatamente
        await this.createWithId(user.id, {
          email: email,
          activo: true,
          createdAt: new Date(),
        });

        return {
          success: true,
          message: "Usuario agregado como administrador exitosamente",
          isPending: false,
        };
      } else {
        console.log(`⏳ Usuario no existe, creando admin pendiente: ${email}`);
        // Usuario no existe - crear admin pendiente
        await this.create({
          email: email,
          activo: false,
          createdAt: new Date(),
        });

        return {
          success: true,
          message:
            "Usuario agregado como administrador pendiente. Se activará cuando inicie sesión por primera vez.",
          isPending: true,
        };
      }
    } catch (error) {
      console.error("❌ Error al agregar administrador:", error);
      throw error;
    }
  }

  async activatePendingAdmin(userId: string, email: string): Promise<boolean> {
    try {
      console.log(
        `🔄 Intentando activar admin pendiente: ${email} -> ${userId}`
      );

      // Buscar admin pendiente por email usando operaciones directas de Firestore
      const pendingAdminQuery = query(
        this.getCollection(),
        where("email", "==", email),
        where("activo", "==", false)
      );
      const pendingAdminSnapshot = await getDocs(pendingAdminQuery);

      if (!pendingAdminSnapshot.empty) {
        const pendingAdminDoc = pendingAdminSnapshot.docs[0];
        const pendingAdminData = pendingAdminDoc.data() as Administrador;

        console.log(`✅ Admin pendiente encontrado, activando...`);

        // Usar operaciones directas de Firestore para evitar problemas de permisos

        // 1. Crear admin activo con el ID del usuario
        const activeAdminRef = doc(db, "administradores", userId);
        await setDoc(activeAdminRef, {
          email: email,
          activo: true,
          createdAt: pendingAdminData.createdAt || serverTimestamp(),
          activatedAt: serverTimestamp(),
        });

        // 2. Eliminar el admin pendiente
        const pendingAdminRef = doc(db, "administradores", pendingAdminDoc.id);
        await deleteDoc(pendingAdminRef);

        console.log(
          `🎉 Admin pendiente activado exitosamente: ${email} -> ${userId}`
        );
        return true;
      }

      console.log(`ℹ️ No se encontró admin pendiente para: ${email}`);
      return false;
    } catch (error) {
      console.error("❌ Error al activar administrador pendiente:", error);
      console.error("Error details:", error);
      return false;
    }
  }

  async removeAdmin(adminId: string): Promise<void> {
    try {
      // Usar deleteDoc directamente para evitar problemas de permisos
      const adminRef = doc(db, "administradores", adminId);
      await deleteDoc(adminRef);
    } catch (error) {
      console.error("Error al eliminar administrador:", error);
      throw error;
    }
  }

  async removePendingAdminByEmail(email: string): Promise<void> {
    try {
      const pendingAdminQuery = query(
        this.getCollection(),
        where("email", "==", email),
        where("activo", "==", false)
      );
      const pendingAdminSnapshot = await getDocs(pendingAdminQuery);

      if (!pendingAdminSnapshot.empty) {
        const pendingAdminDoc = pendingAdminSnapshot.docs[0];
        // Usar deleteDoc directamente
        const pendingAdminRef = doc(db, "administradores", pendingAdminDoc.id);
        await deleteDoc(pendingAdminRef);
      }
    } catch (error) {
      console.error("Error al eliminar administrador pendiente:", error);
      throw error;
    }
  }

  // Método para verificar y reparar permisos si es necesario
  async repairAdminPermissions(
    userId: string,
    email: string
  ): Promise<boolean> {
    try {
      console.log(`🔧 Reparando permisos para: ${email}`);

      // Verificar si existe como admin activo
      const activeAdmin = await this.isAdmin(userId);
      if (activeAdmin) {
        console.log(`✅ Admin ya está activo: ${email}`);
        return true;
      }

      // Verificar si existe como pendiente y activar
      const activated = await this.activatePendingAdmin(userId, email);
      if (activated) {
        console.log(`🔄 Admin activado desde pendiente: ${email}`);
        return true;
      }

      console.log(`❌ Usuario no es admin: ${email}`);
      return false;
    } catch (error) {
      console.error("❌ Error al reparar permisos de admin:", error);
      return false;
    }
  }

  // Método para verificar si existe un admin pendiente por email
  async hasPendingAdminByEmail(email: string): Promise<boolean> {
    try {
      const pendingAdminQuery = query(
        this.getCollection(),
        where("email", "==", email),
        where("activo", "==", false)
      );
      const pendingAdminSnapshot = await getDocs(pendingAdminQuery);
      return !pendingAdminSnapshot.empty;
    } catch (error) {
      console.error("Error al verificar admin pendiente:", error);
      return false;
    }
  }
}

export const administradorService = new AdministradorService();
