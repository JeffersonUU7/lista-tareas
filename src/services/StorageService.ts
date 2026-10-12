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
      return lista.map((t) => Tarea.desdeObjeto(t));
    } catch {
      return [];
    }
  }
}