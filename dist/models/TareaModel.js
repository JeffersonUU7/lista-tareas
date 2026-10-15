import { Tarea } from "./Tarea.js";
const PESO = { alta: 0, media: 1, baja: 2 };
export class TareaModel {
    constructor(storage) {
        this.storage = storage;
        this.tareas = this.storage.cargar();
    }
    // ---------- CRUD ----------
    getTareas() {
        return [...this.tareas];
    }
    getById(id) {
        return this.tareas.find((t) => t.id === id);
    }
    addTarea(datos) {
        const tarea = new Tarea(this.siguienteId(), datos.titulo, datos.descripcion, datos.prioridad, datos.fechaLimite);
        Tarea.validarNoPasada(tarea.fechaLimite);
        this.validarDuplicado(tarea.titulo, tarea.id);
        this.tareas.push(tarea);
        this.persistir();
        return tarea;
    }
    updateTarea(id, datos) {
        const tarea = this.getById(id);
        if (!tarea)
            throw new Error("La tarea que intentas editar no existe.");
        Tarea.validar(datos.titulo, datos.descripcion, datos.prioridad, datos.fechaLimite);
        if (datos.fechaLimite !== tarea.fechaLimite)
            Tarea.validarNoPasada(datos.fechaLimite);
        this.validarDuplicado(datos.titulo.trim(), id);
        tarea.actualizar(datos.titulo, datos.descripcion, datos.prioridad, datos.fechaLimite);
        this.persistir();
    }
    deleteTarea(id) {
        const antes = this.tareas.length;
        this.tareas = this.tareas.filter((t) => t.id !== id);
        if (this.tareas.length === antes)
            throw new Error("La tarea que intentas eliminar no existe.");
        this.persistir();
    }
    toggleTarea(id) {
        const tarea = this.getById(id);
        if (!tarea)
            throw new Error("La tarea no existe.");
        tarea.toggle();
        this.persistir();
    }
    // ---------- Búsqueda, filtros y orden ----------
    searchTareas(texto, base = this.tareas) {
        const q = texto.trim().toLowerCase();
        if (!q)
            return base;
        return base.filter((t) => t.titulo.toLowerCase().includes(q));
    }
    filterTareas(estado, prioridad, base = this.tareas) {
        return base.filter((t) => {
            const okEstado = estado === "todas" ||
                (estado === "pendientes" && !t.completada) ||
                (estado === "completadas" && t.completada) ||
                (estado === "vencidas" && t.estaVencida());
            const okPrioridad = prioridad === "todas" || t.prioridad === prioridad;
            return okEstado && okPrioridad;
        });
    }
    sortTareas(orden, base) {
        const lista = [...base];
        const porFecha = (a, b) => a.fechaLimite.localeCompare(b.fechaLimite);
        const porPrioridad = (a, b) => PESO[a.prioridad] - PESO[b.prioridad];
        switch (orden) {
            case "fecha-asc": return lista.sort(porFecha);
            case "fecha-desc": return lista.sort((a, b) => porFecha(b, a));
            case "prioridad-desc": return lista.sort((a, b) => porPrioridad(a, b) || porFecha(a, b));
            case "prioridad-asc": return lista.sort((a, b) => porPrioridad(b, a) || porFecha(a, b));
        }
    }
    // Búsqueda + filtros + orden combinados
    consultar(c) {
        const buscadas = this.searchTareas(c.texto);
        const filtradas = this.filterTareas(c.estado, c.prioridad, buscadas);
        return this.sortTareas(c.orden, filtradas);
    }
    // ---------- Estadísticas ----------
    getResumen() {
        const total = this.tareas.length;
        const completadas = this.tareas.filter((t) => t.completada).length;
        return {
            total,
            completadas,
            pendientes: total - completadas,
            vencidas: this.tareas.filter((t) => t.estaVencida()).length,
            alta: this.tareas.filter((t) => t.prioridad === "alta").length,
            media: this.tareas.filter((t) => t.prioridad === "media").length,
            baja: this.tareas.filter((t) => t.prioridad === "baja").length,
        };
    }
    getProximas(cantidad) {
        return this.sortTareas("fecha-asc", this.tareas.filter((t) => !t.completada)).slice(0, cantidad);
    }
    // ---------- Privados ----------
    validarDuplicado(titulo, idIgnorar) {
        const existe = this.tareas.some((t) => t.id !== idIgnorar && t.titulo.toLowerCase() === titulo.toLowerCase());
        if (existe)
            throw new Error("Ya existe una tarea con ese título.");
    }
    siguienteId() {
        return this.tareas.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    }
    persistir() {
        this.storage.guardar(this.tareas);
    }
}
