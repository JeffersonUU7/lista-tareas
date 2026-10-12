export class Tarea {
    constructor(id, titulo, descripcion, completada = false) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.completada = completada;
        Tarea.validar(titulo, descripcion);
        this.titulo = titulo.trim();
        this.descripcion = descripcion.trim();
    }
    static validar(titulo, descripcion) {
        if (titulo.trim().length < 3) {
            throw new Error("El título debe tener al menos 3 caracteres.");
        }
        if (titulo.trim().length > 60) {
            throw new Error("El título no puede superar 60 caracteres.");
        }
        if (descripcion.trim().length > 200) {
            throw new Error("La descripción no puede superar 200 caracteres.");
        }
    }
    actualizar(titulo, descripcion) {
        Tarea.validar(titulo, descripcion);
        this.titulo = titulo.trim();
        this.descripcion = descripcion.trim();
    }
    toggle() {
        this.completada = !this.completada;
    }
    static desdeObjeto(obj) {
        return new Tarea(obj.id, obj.titulo, obj.descripcion, obj.completada);
    }
}
