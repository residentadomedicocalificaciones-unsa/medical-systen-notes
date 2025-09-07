import { query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import type { Usuario } from "../types";
import { BaseService } from "./base.service";
import { db } from "../firebase/config";

class UsuarioService extends BaseService<Usuario> {
  constructor() {
    super("usuarios");
  }

  async getByEmail(email: string): Promise<Usuario | null> {
    try {
      console.log(`🔍 Buscando usuario por email: ${email}`);

      const q = query(
        this.getCollection(),
        where("email", "==", email),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const usuario = {
          id: doc.id,
          ...doc.data(),
        } as Usuario;

        console.log(`✅ Usuario encontrado: ${email}`);
        return usuario;
      }

      console.log(`❌ Usuario no encontrado: ${email}`);
      return null;
    } catch (error) {
      console.error("❌ Error al obtener usuario por email:", error);
      throw error;
    }
  }

  async createUserIfNotExists(user: Usuario): Promise<Usuario> {
    try {
      console.log(`👤 Verificando/creando usuario: ${user.email}`);

      if (!user.id) {
        throw new Error("ID de usuario es requerido");
      }

      // Usar getDoc directamente para verificar existencia
      const userDocRef = doc(db, "usuarios", user.id);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log(`✅ Usuario ya existe: ${user.email}`);
        return {
          id: userDoc.id,
          ...userDoc.data(),
        } as Usuario;
      }

      console.log(`➕ Creando nuevo usuario: ${user.email}`);
      const newUser = await this.createWithId(user.id, {
        nombre: user.nombre,
        email: user.email,
        photoURL: user.photoURL,
      });

      console.log(`🎉 Usuario creado exitosamente: ${user.email}`);
      return newUser;
    } catch (error) {
      console.error("❌ Error al crear usuario si no existe:", error);
      throw error;
    }
  }
}

export const usuarioService = new UsuarioService();
