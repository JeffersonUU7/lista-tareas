import { TareaView } from "../views/TareaView.js";
import { TareaModel, Criterios, DatosTarea, FiltroEstado, FiltroPrioridad, Orden } from "../models/TareaModel.js";

export class TareaController {
  private editandoId: number | null = null;
  private criterios: Criterios = { texto: "", estado: "todas", prioridad: "todas", orden: "fecha-asc" };

  constructor(private view: TareaView, private model: TareaModel) {
    this.enlazarEventos();
    this.refrescar();
    // Actualiza automáticamente las tareas vencidas cada minuto
    window.setInterval(() => this.refrescar(), 60000);
  }

  private enlazarEventos(): void {
    this.view.alCrear((d) => this.handleCreate(d));
    this.view.alGuardarEdicion((d) => this.handleUpdate(d));
    this.view.alBuscar((t) => this.handleSearch(t));
    this.view.alFiltrar((e, p) => this.handleFilter(e, p));
    this.view.alOrdenar((o) => this.handleSort(o));
    this.view.alAccion((accion, id) => {
      if (accion === "toggle") this.handleToggle(id);
      if (accion === "editar") this.handleEdit(id);
      if (accion === "eliminar") this.handleDelete(id);
    });
  }

  // ---------- Manejadores ----------
  private handleCreate(datos: DatosTarea): void {
    try {
      this.model.addTarea(datos);
      this.view.limpiarFormulario();
      this.view.mostrarNotificacion("Tarea agregada correctamente.", "ok");
      this.refrescar();
    } catch (e) {
      this.view.mostrarNotificacion(this.mensajeError(e), "error");
    }
  }

  private handleEdit(id: number): void {
    const tarea = this.model.getById(id);
    if (!tarea) return;
    this.editandoId = id;
    this.view.renderEditForm(tarea);
  }

  private handleUpdate(datos: DatosTarea): void {
    if (this.editandoId === null) return;
    try {
      this.model.updateTarea(this.editandoId, datos);
      this.editandoId = null;
      this.view.cerrarEdicion();
      this.view.mostrarNotificacion("Tarea actualizada.", "ok");
      this.refrescar();
    } catch (e) {
      this.view.mostrarErrorEdicion(this.mensajeError(e));
    }
  }

  private handleDelete(id: number): void {
    if (!this.view.confirmar("¿Seguro que deseas eliminar esta tarea?")) return;
    try {
      this.model.deleteTarea(id);
      this.view.mostrarNotificacion("Tarea eliminada.", "info");
      this.refrescar();
    } catch (e) {
      this.view.mostrarNotificacion(this.mensajeError(e), "error");
    }
  }

  private handleToggle(id: number): void {
    try {
      this.model.toggleTarea(id);
      this.refrescar();
    } catch (e) {
      this.view.mostrarNotificacion(this.mensajeError(e), "error");
    }
  }

  private handleSearch(texto: string): void {
    this.criterios.texto = texto;
    this.refrescar();
  }

  private handleFilter(estado: FiltroEstado, prioridad: FiltroPrioridad): void {
    this.criterios.estado = estado;
    this.criterios.prioridad = prioridad;
    this.refrescar();
  }

  private handleSort(orden: Orden): void {
    this.criterios.orden = orden;
    this.refrescar();
  }

  // ---------- Utilidades ----------
  private refrescar(): void {
    this.view.renderizar(this.model.consultar(this.criterios));
    const resumen = this.model.getResumen();
    this.view.renderCounter(resumen.pendientes, resumen.vencidas);
    this.view.actualizarResumen(resumen, this.model.getProximas(5));
  }

  private mensajeError(e: unknown): string {
    return e instanceof Error ? e.message : "Ocurrió un error inesperado.";
  }
}