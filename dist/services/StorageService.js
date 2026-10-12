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
            return lista.map((t) => Tarea.desdeObjeto(t));
        }
        catch {
            return [];
        }
    }
}
