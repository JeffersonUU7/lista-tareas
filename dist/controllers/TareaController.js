export class TareaController {
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.editandoId = null;
        this.criterios = { texto: "", estado: "todas", prioridad: "todas", orden: "fecha-asc" };
        this.enlazarEventos();
        this.refrescar();
        // Actualiza automáticamente las tareas vencidas cada minuto
        window.setInterval(() => this.refrescar(), 60000);
    }
    enlazarEventos() {
        this.view.alCrear((d) => this.handleCreate(d));
        this.view.alGuardarEdicion((d) => this.handleUpdate(d));
        this.view.alBuscar((t) => this.handleSearch(t));
        this.view.alFiltrar((e, p) => this.handleFilter(e, p));
        this.view.alOrdenar((o) => this.handleSort(o));
        this.view.alAccion((accion, id) => {
            if (accion === "toggle")
                this.handleToggle(id);
            if (accion === "editar")
                this.handleEdit(id);
            if (accion === "eliminar")
                this.handleDelete(id);
        });
    }
    // ---------- Manejadores ----------
    handleCreate(datos) {
        try {
            this.model.addTarea(datos);
            this.view.limpiarFormulario();
            this.view.mostrarNotificacion("Tarea agregada correctamente.", "ok");
            this.refrescar();
        }
        catch (e) {
            this.view.mostrarNotificacion(this.mensajeError(e), "error");
        }
    }
    handleEdit(id) {
        const tarea = this.model.getById(id);
        if (!tarea)
            return;
        this.editandoId = id;
        this.view.renderEditForm(tarea);
    }
    handleUpdate(datos) {
        if (this.editandoId === null)
            return;
        try {
            this.model.updateTarea(this.editandoId, datos);
            this.editandoId = null;
            this.view.cerrarEdicion();
            this.view.mostrarNotificacion("Tarea actualizada.", "ok");
            this.refrescar();
        }
        catch (e) {
            this.view.mostrarErrorEdicion(this.mensajeError(e));
        }
    }
    handleDelete(id) {
        if (!this.view.confirmar("¿Seguro que deseas eliminar esta tarea?"))
            return;
        try {
            this.model.deleteTarea(id);
            this.view.mostrarNotificacion("Tarea eliminada.", "info");
            this.refrescar();
        }
        catch (e) {
            this.view.mostrarNotificacion(this.mensajeError(e), "error");
        }
    }
    handleToggle(id) {
        try {
            this.model.toggleTarea(id);
            this.refrescar();
        }
        catch (e) {
            this.view.mostrarNotificacion(this.mensajeError(e), "error");
        }
    }
    handleSearch(texto) {
        this.criterios.texto = texto;
        this.refrescar();
    }
    handleFilter(estado, prioridad) {
        this.criterios.estado = estado;
        this.criterios.prioridad = prioridad;
        this.refrescar();
    }
    handleSort(orden) {
        this.criterios.orden = orden;
        this.refrescar();
    }
    // ---------- Utilidades ----------
    refrescar() {
        this.view.renderizar(this.model.consultar(this.criterios));
        const resumen = this.model.getResumen();
        this.view.renderCounter(resumen.pendientes, resumen.vencidas);
        this.view.actualizarResumen(resumen, this.model.getProximas(5));
    }
    mensajeError(e) {
        return e instanceof Error ? e.message : "Ocurrió un error inesperado.";
    }
}
