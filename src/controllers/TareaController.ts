import { Tarea } from "../models/Tarea.js";
import { StorageService } from "../services/StorageService.js";
import { TareaView, Filtro } from "../views/TareaView.js";

export class TareaController {
  private tareas: Tarea[];
  private editandoId: number | null = null;
  private textoBusqueda = "";
  private filtro: Filtro = "todas";

  constructor(private view: TareaView, private storage: StorageService) {
    this.tareas = this.storage.cargar();
    this.conectarEventos();
    this.actualizarVista();
  }

  private conectarEventos(): void {
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
      if (accion === "toggle") this.toggle(id);
      if (accion === "editar") this.iniciarEdicion(id);
      if (accion === "eliminar") this.eliminar(id);
    });
  }

  private guardar(titulo: string, descripcion: string): void {
    try {
      if (this.editandoId === null) {
        this.tareas.push(new Tarea(Date.now(), titulo, descripcion));
        this.view.mostrarMensaje("Tarea agregada.", "ok");
      } else {
        const tarea = this.buscarPorId(this.editandoId);
        tarea?.actualizar(titulo, descripcion);
        this.view.mostrarMensaje("Tarea actualizada.", "ok");
        this.editandoId = null;
      }
      this.storage.guardar(this.tareas);
      this.view.limpiarFormulario();
      this.actualizarVista();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido.";
      this.view.mostrarMensaje(msg, "error");
    }
  }

  private toggle(id: number): void {
    this.buscarPorId(id)?.toggle();
    this.storage.guardar(this.tareas);
    this.actualizarVista();
  }

  private iniciarEdicion(id: number): void {
    const tarea = this.buscarPorId(id);
    if (!tarea) return;
    this.editandoId = id;
    this.view.cargarEnFormulario(tarea);
  }

  private cancelarEdicion(): void {
    this.editandoId = null;
    this.view.limpiarFormulario();
  }

  private eliminar(id: number): void {
    if (!this.view.confirmar("¿Seguro que deseas eliminar esta tarea?")) return;
    this.tareas = this.tareas.filter((t) => t.id !== id);
    if (this.editandoId === id) this.cancelarEdicion();
    this.storage.guardar(this.tareas);
    this.view.mostrarMensaje("Tarea eliminada.", "ok");
    this.actualizarVista();
  }

  private buscarPorId(id: number): Tarea | undefined {
    return this.tareas.find((t) => t.id === id);
  }

  private tareasFiltradas(): Tarea[] {
    const texto = this.textoBusqueda.trim().toLowerCase();
    return this.tareas.filter((t) => {
      const coincideTexto = t.titulo.toLowerCase().includes(texto);
      const coincideEstado =
        this.filtro === "todas" ||
        (this.filtro === "completadas" && t.completada) ||
        (this.filtro === "pendientes" && !t.completada);
      return coincideTexto && coincideEstado;
    });
  }

  private actualizarVista(): void {
    this.view.renderizar(this.tareasFiltradas());
    const completadas = this.tareas.filter((t) => t.completada).length;
    this.view.actualizarResumen(
      this.tareas.length,
      this.tareas.length - completadas,
      completadas
    );
  }
}