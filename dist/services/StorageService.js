import { Tarea } from "../models/Tarea.js";
export class StorageService {
    constructor() {
        this.clave = "tareas";
    }
    guardar(tareas) {
        localStorage.setItem(this.clave, JSON.stringify(tareas));
    }
    cargar() {
        const datos = localStorage.getItem(this.clave);
        if (!datos)
            return [];
        try {
            const lista = JSON.parse(datos);
            if (!Array.isArray(lista))
                return [];
            const tareas = [];
            for (const item of lista) {
                try {
                    tareas.push(Tarea.desdeObjeto(item));
                }
                catch {
                    // Se ignora un registro dañado sin perder los demás
                }
            }
            return tareas;
        }
        catch {
            return [];
        }
    }
}
