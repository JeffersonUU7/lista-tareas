import { Tarea } from "../models/Tarea.js";

export type Filtro = "todas" | "pendientes" | "completadas";

export class TareaView {
  private form = document.getElementById("form-tarea") as HTMLFormElement;
  private inputTitulo = document.getElementById("titulo") as HTMLInputElement;
  private inputDescripcion = document.getElementById("descripcion") as HTMLTextAreaElement;
  private inputBuscar = document.getElementById("buscar") as HTMLInputElement;
  private selectFiltro = document.getElementById("filtro") as HTMLSelectElement;
  private lista = document.getElementById("lista") as HTMLUListElement;
  private mensaje = document.getElementById("mensaje") as HTMLDivElement;
  private btnGuardar = document.getElementById("btn-guardar") as HTMLButtonElement;
  private btnCancelar = document.getElementById("btn-cancelar") as HTMLButtonElement;
  private anillo = document.getElementById("anillo") as HTMLDivElement;
  private pctTexto = document.getElementById("pct-texto") as HTMLSpanElement;
  private statTotal = document.getElementById("stat-total") as HTMLSpanElement;
  private statPend = document.getElementById("stat-pend") as HTMLSpanElement;
  private statComp = document.getElementById("stat-comp") as HTMLSpanElement;
  private barraPend = document.getElementById("barra-pend") as HTMLDivElement;
  private barraComp = document.getElementById("barra-comp") as HTMLDivElement;

  // ---- Eventos (el controlador los conecta) ----
  alEnviar(handler: (titulo: string, descripcion: string) => void): void {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      handler(this.inputTitulo.value, this.inputDescripcion.value);
    });
  }

  alBuscar(handler: (texto: string) => void): void {
    this.inputBuscar.addEventListener("input", () => handler(this.inputBuscar.value));
  }

  alFiltrar(handler: (filtro: Filtro) => void): void {
    this.selectFiltro.addEventListener("change", () => handler(this.selectFiltro.value as Filtro));
  }

  alCancelar(handler: () => void): void {
    this.btnCancelar.addEventListener("click", handler);
  }

  alAccion(handler: (accion: string, id: number) => void): void {
    this.lista.addEventListener("click", (e) => {
      const boton = (e.target as HTMLElement).closest("button");
      if (!boton) return;
      const li = boton.closest("li") as HTMLLIElement;
      handler(boton.dataset.accion ?? "", Number(li.dataset.id));
    });
  }

  // ---- Renderizado ----
  renderizar(tareas: Tarea[]): void {
    this.lista.innerHTML = "";

    if (tareas.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "No hay tareas para mostrar.";
      this.lista.appendChild(vacio);
      return;
    }

    tareas.forEach((t) => {
      const li = document.createElement("li");
      li.dataset.id = String(t.id);
      li.className = t.completada ? "tarea completada" : "tarea";

      const info = document.createElement("div");
      info.className = "info";
      const titulo = document.createElement("strong");
      titulo.textContent = t.titulo;
      const desc = document.createElement("p");
      desc.textContent = t.descripcion;
      info.append(titulo, desc);

      const acciones = document.createElement("div");
      acciones.className = "acciones";
      acciones.append(
        this.crearBoton(t.completada ? "↩ Pendiente" : "✔ Completar", "toggle"),
        this.crearBoton("✏ Editar", "editar"),
        this.crearBoton("🗑 Eliminar", "eliminar")
      );

      li.append(info, acciones);
      this.lista.appendChild(li);
    });
  }

  private crearBoton(texto: string, accion: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = texto;
    b.dataset.accion = accion;
    return b;
  }

  actualizarResumen(total: number, pendientes: number, completadas: number): void {
    const pct = total === 0 ? 0 : Math.round((completadas / total) * 100);
    const pctPend = total === 0 ? 0 : Math.round((pendientes / total) * 100);

    this.statTotal.textContent = String(total);
    this.statPend.textContent = String(pendientes);
    this.statComp.textContent = String(completadas);
    this.pctTexto.textContent = `${pct}%`;

    this.anillo.style.setProperty("--pct", String(pct));
    this.barraComp.style.setProperty("--w", String(pct));
    this.barraPend.style.setProperty("--w", String(pctPend));
  }

  // ---- Utilidades de interfaz ----
  mostrarMensaje(texto: string, tipo: "ok" | "error"): void {
    this.mensaje.textContent = texto;
    this.mensaje.className = `mensaje ${tipo}`;
    window.setTimeout(() => {
      this.mensaje.textContent = "";
      this.mensaje.className = "mensaje";
    }, 3000);
  }

  confirmar(texto: string): boolean {
    return window.confirm(texto);
  }

  limpiarFormulario(): void {
    this.form.reset();
    this.btnGuardar.textContent = "Agregar tarea";
    this.btnCancelar.hidden = true;
  }

  cargarEnFormulario(tarea: Tarea): void {
    this.inputTitulo.value = tarea.titulo;
    this.inputDescripcion.value = tarea.descripcion;
    this.btnGuardar.textContent = "Guardar cambios";
    this.btnCancelar.hidden = false;
    this.inputTitulo.focus();
  }
}