import { Tarea, ITarea } from "../models/Tarea.js";

export class StorageService {
  private readonly clave = "tareas";

  guardar(tareas: Tarea[]): void {
    localStorage.setItem(this.clave, JSON.stringify(tareas));
  }

  cargar(): Tarea[] {
    const datos = localStorage.getItem(this.clave);
    if (!datos) return [];
    try {
      const lista: ITarea[] = JSON.parse(datos);
      if (!Array.isArray(lista)) return [];
      const tareas: Tarea[] = [];
      for (const item of lista) {
        try {
          tareas.push(Tarea.desdeObjeto(item));
        } catch {
          // Se ignora un registro dañado sin perder los demás
        }
      }
      return tareas;
    } catch {
      return [];
    }
  }
}