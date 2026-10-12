import { Tarea } from "../models/Tarea.js";
export class TareaController {
    constructor(view, storage) {
        this.view = view;
        this.storage = storage;
        this.editandoId = null;
        this.textoBusqueda = "";
        this.filtro = "todas";
        this.tareas = this.storage.cargar();
        this.conectarEventos();
        this.actualizarVista();
    }
    conectarEventos() {
        this.view.alEnviar((t, d) => this.guardar(t, d));
        this.view.alBuscar((texto) => {
            this.textoBusqueda = texto;
            this.actualizarVista();
        });
        this.view.alFiltrar((f) => {
            this.filtro = f;
            this.actualizarVista();
        });
        this.view.alCancelar(() => this.cancelarEdicion());
        this.view.alAccion((accion, id) => {
            if (accion === "toggle")
                this.toggle(id);
            if (accion === "editar")
                this.iniciarEdicion(id);
            if (accion === "eliminar")
                this.eliminar(id);
        });
    }
    guardar(titulo, descripcion) {
        try {
            if (this.editandoId === null) {
                this.tareas.push(new Tarea(Date.now(), titulo, descripcion));
                this.view.mostrarMensaje("Tarea agregada.", "ok");
            }
            else {
                const tarea = this.buscarPorId(this.editandoId);
                tarea?.actualizar(titulo, descripcion);
                this.view.mostrarMensaje("Tarea actualizada.", "ok");
                this.editandoId = null;
            }
            this.storage.guardar(this.tareas);
            this.view.limpiarFormulario();
            this.actualizarVista();
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : "Error desconocido.";
            this.view.mostrarMensaje(msg, "error");
        }
    }
    toggle(id) {
        this.buscarPorId(id)?.toggle();
        this.storage.guardar(this.tareas);
        this.actualizarVista();
    }
    iniciarEdicion(id) {
        const tarea = this.buscarPorId(id);
        if (!tarea)
            return;
        this.editandoId = id;
        this.view.cargarEnFormulario(tarea);
    }
    cancelarEdicion() {
        this.editandoId = null;
        this.view.limpiarFormulario();
    }
    eliminar(id) {
        if (!this.view.confirmar("¿Seguro que deseas eliminar esta tarea?"))
            return;
        this.tareas = this.tareas.filter((t) => t.id !== id);
        if (this.editandoId === id)
            this.cancelarEdicion();
        this.storage.guardar(this.tareas);
        this.view.mostrarMensaje("Tarea eliminada.", "ok");
        this.actualizarVista();
    }
    buscarPorId(id) {
        return this.tareas.find((t) => t.id === id);
    }
    tareasFiltradas() {
        const texto = this.textoBusqueda.trim().toLowerCase();
        return this.tareas.filter((t) => {
            const coincideTexto = t.titulo.toLowerCase().includes(texto);
            const coincideEstado = this.filtro === "todas" ||
                (this.filtro === "completadas" && t.completada) ||
                (this.filtro === "pendientes" && !t.completada);
            return coincideTexto && coincideEstado;
        });
    }
    actualizarVista() {
        this.view.renderizar(this.tareasFiltradas());
        const completadas = this.tareas.filter((t) => t.completada).length;
        this.view.actualizarResumen(this.tareas.length, this.tareas.length - completadas, completadas);
    }
}
