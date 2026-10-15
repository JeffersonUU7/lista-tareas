import { Tarea, Prioridad } from "../models/Tarea.js";
import { DatosTarea, FiltroEstado, FiltroPrioridad, Orden, Resumen } from "../models/TareaModel.js";

export type TipoNotificacion = "ok" | "error" | "info";

export class TareaView {
  // Formulario de creación
  private form = this.el<HTMLFormElement>("form-tarea");
  private inTitulo = this.el<HTMLInputElement>("titulo");
  private inDescripcion = this.el<HTMLTextAreaElement>("descripcion");
  private inPrioridad = this.el<HTMLSelectElement>("prioridad");
  private inFecha = this.el<HTMLInputElement>("fecha");

  // Controles de la lista
  private inBuscar = this.el<HTMLInputElement>("buscar");
  private selEstado = this.el<HTMLSelectElement>("filtro-estado");
  private selPrioridad = this.el<HTMLSelectElement>("filtro-prioridad");
  private selOrden = this.el<HTMLSelectElement>("orden");
  private lista = this.el<HTMLUListElement>("lista");
  private toasts = this.el<HTMLDivElement>("toasts");

  // Modal de edición
  private modal = this.el<HTMLDivElement>("modal-editar");
  private formEditar = this.el<HTMLFormElement>("form-editar");
  private eTitulo = this.el<HTMLInputElement>("e-titulo");
  private eDescripcion = this.el<HTMLTextAreaElement>("e-descripcion");
  private ePrioridad = this.el<HTMLSelectElement>("e-prioridad");
  private eFecha = this.el<HTMLInputElement>("e-fecha");
  private errorEditar = this.el<HTMLDivElement>("error-editar");

  // Estadísticas
  private anillo = this.el<HTMLDivElement>("anillo");
  private listaProximas = this.el<HTMLUListElement>("proximas");

  constructor() {
    this.inFecha.min = Tarea.hoy();
    this.inFecha.value = Tarea.hoy();
    this.iniciarPestanas();
    this.iniciarModal();
  }

  // ======== Eventos (el controlador los conecta) ========
  alCrear(handler: (datos: DatosTarea) => void): void {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      handler(this.leer(this.inTitulo, this.inDescripcion, this.inPrioridad, this.inFecha));
    });
  }

  alGuardarEdicion(handler: (datos: DatosTarea) => void): void {
    this.formEditar.addEventListener("submit", (e) => {
      e.preventDefault();
      handler(this.leer(this.eTitulo, this.eDescripcion, this.ePrioridad, this.eFecha));
    });
  }

  alBuscar(handler: (texto: string) => void): void {
    this.inBuscar.addEventListener("input", () => handler(this.inBuscar.value));
  }

  alFiltrar(handler: (estado: FiltroEstado, prioridad: FiltroPrioridad) => void): void {
    const emitir = () =>
      handler(this.selEstado.value as FiltroEstado, this.selPrioridad.value as FiltroPrioridad);
    this.selEstado.addEventListener("change", emitir);
    this.selPrioridad.addEventListener("change", emitir);
  }

  alOrdenar(handler: (orden: Orden) => void): void {
    this.selOrden.addEventListener("change", () => handler(this.selOrden.value as Orden));
  }

  alAccion(handler: (accion: string, id: number) => void): void {
    this.lista.addEventListener("click", (e) => {
      const boton = (e.target as HTMLElement).closest("button");
      if (!boton) return;
      const li = boton.closest("li") as HTMLLIElement;
      handler(boton.dataset.accion ?? "", Number(li.dataset.id));
    });
  }

  // ======== Renderizado ========
  renderizar(tareas: Tarea[]): void {
    this.lista.innerHTML = "";

    if (tareas.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "No hay tareas para mostrar. Agrega una o ajusta los filtros.";
      this.lista.appendChild(vacio);
      return;
    }

    tareas.forEach((t) => {
      const li = document.createElement("li");
      li.dataset.id = String(t.id);
      li.className = [
        "tarea",
        `p-${t.prioridad}`,
        t.completada ? "completada" : "",
        t.estaVencida() ? "vencida" : "",
      ].filter(Boolean).join(" ");

      const info = document.createElement("div");
      info.className = "info";

      const fila = document.createElement("div");
      fila.className = "fila-titulo";
      const titulo = document.createElement("strong");
      titulo.textContent = t.titulo;
      const badge = document.createElement("span");
      badge.className = `badge prio-${t.prioridad}`;
      badge.textContent = t.prioridad.charAt(0).toUpperCase() + t.prioridad.slice(1);
      fila.append(titulo, badge);

      info.appendChild(fila);
      if (t.descripcion) {
        const desc = document.createElement("p");
        desc.textContent = t.descripcion;
        info.appendChild(desc);
      }
      const fecha = document.createElement("span");
      fecha.className = "fecha";
      fecha.textContent = this.textoFecha(t);
      info.appendChild(fecha);

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

  renderCounter(pendientes: number, vencidas: number): void {
    this.texto("contador-pend", `${pendientes} ${pendientes === 1 ? "pendiente" : "pendientes"}`);
    this.texto("badge-tab", pendientes);
    this.texto(
      "contador-venc",
      vencidas === 0 ? "Sin vencidas" : `${vencidas} ${vencidas === 1 ? "vencida" : "vencidas"}`
    );
    this.el("contador-venc").classList.toggle("alerta", vencidas > 0);
  }

  actualizarResumen(r: Resumen, proximas: Tarea[]): void {
    const pct = r.total === 0 ? 0 : Math.round((r.completadas / r.total) * 100);
    this.texto("est-total", r.total);
    this.texto("est-pend", r.pendientes);
    this.texto("est-comp", r.completadas);
    this.texto("est-venc", r.vencidas);
    this.texto("pct-texto", `${pct}%`);
    this.anillo.style.setProperty("--pct", String(pct));

    (["alta", "media", "baja"] as Prioridad[]).forEach((p) => {
      this.texto(`num-${p}`, r[p]);
      this.el(`bar-${p}`).style.setProperty("--w", String(r.total === 0 ? 0 : Math.round((r[p] / r.total) * 100)));
    });

    this.listaProximas.innerHTML = "";
    if (proximas.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "No tienes tareas pendientes. 🎉";
      this.listaProximas.appendChild(vacio);
      return;
    }
    proximas.forEach((t) => {
      const li = document.createElement("li");
      li.className = t.estaVencida() ? "prox vencida" : "prox";
      const nombre = document.createElement("strong");
      nombre.textContent = t.titulo;
      const fecha = document.createElement("span");
      fecha.textContent = this.textoFecha(t);
      li.append(nombre, fecha);
      this.listaProximas.appendChild(li);
    });
  }

  // ======== Edición (modal) ========
  renderEditForm(tarea: Tarea): void {
    this.eTitulo.value = tarea.titulo;
    this.eDescripcion.value = tarea.descripcion;
    this.ePrioridad.value = tarea.prioridad;
    this.eFecha.value = tarea.fechaLimite;
    this.errorEditar.textContent = "";
    this.modal.hidden = false;
    document.body.classList.add("sin-scroll");
    this.eTitulo.focus();
  }

  cerrarEdicion(): void {
    this.modal.hidden = true;
    document.body.classList.remove("sin-scroll");
  }

  mostrarErrorEdicion(texto: string): void {
    this.errorEditar.textContent = texto;
  }

  // ======== Utilidades de interfaz ========
  mostrarNotificacion(texto: string, tipo: TipoNotificacion = "ok", ms: number = 3500): void {
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.setAttribute("role", "status");
    toast.style.setProperty("--dur", `${ms}ms`);

    const icono = document.createElement("span");
    icono.className = "toast-ico";
    icono.textContent = tipo === "ok" ? "✔" : tipo === "error" ? "✖" : "ℹ";

    const mensaje = document.createElement("span");
    mensaje.className = "toast-msg";
    mensaje.textContent = texto;

    const cerrar = document.createElement("button");
    cerrar.type = "button";
    cerrar.className = "toast-x";
    cerrar.setAttribute("aria-label", "Cerrar notificación");
    cerrar.textContent = "×";

    const barra = document.createElement("div");
    barra.className = "toast-barra";

    const quitar = () => {
      toast.classList.add("saliendo");
      window.setTimeout(() => toast.remove(), 300);
    };
    cerrar.addEventListener("click", quitar);
    window.setTimeout(quitar, ms); // auto-cierre

    toast.append(icono, mensaje, cerrar, barra);
    this.toasts.appendChild(toast);
  }

  confirmar(texto: string): boolean {
    return window.confirm(texto);
  }

  limpiarFormulario(): void {
    this.form.reset();
    this.inFecha.min = Tarea.hoy();
    this.inFecha.value = Tarea.hoy();
  }

  // ======== Privados ========
  private el<T extends HTMLElement = HTMLElement>(id: string): T {
    const elemento = document.getElementById(id);
    if (!elemento) throw new Error(`No se encontró el elemento #${id}`);
    return elemento as T;
  }

  private texto(id: string, valor: string | number): void {
    this.el(id).textContent = String(valor);
  }

  private leer(
    t: HTMLInputElement,
    d: HTMLTextAreaElement,
    p: HTMLSelectElement,
    f: HTMLInputElement
  ): DatosTarea {
    return { titulo: t.value, descripcion: d.value, prioridad: p.value as Prioridad, fechaLimite: f.value };
  }

  private crearBoton(texto: string, accion: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = texto;
    b.dataset.accion = accion;
    return b;
  }

  private textoFecha(t: Tarea): string {
    const [y, m, d] = t.fechaLimite.split("-");
    const f = `${d}/${m}/${y}`;
    if (t.completada) return `📅 ${f}`;
    const dias = t.diasRestantes();
    if (dias < 0) return `⚠ Vencida hace ${-dias} ${-dias === 1 ? "día" : "días"} · ${f}`;
    if (dias === 0) return `⏰ Vence hoy · ${f}`;
    if (dias === 1) return `⏳ Vence mañana · ${f}`;
    return `📅 En ${dias} días · ${f}`;
  }

  private iniciarPestanas(): void {
    const tabs = document.querySelectorAll<HTMLButtonElement>(".tab");
    const paneles = document.querySelectorAll<HTMLElement>(".vista");
    tabs.forEach((tab) =>
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          const activa = t === tab;
          t.classList.toggle("activa", activa);
          t.setAttribute("aria-selected", String(activa));
        });
        paneles.forEach((p) => {
          p.hidden = p.id !== `vista-${tab.dataset.vista}`;
        });
      })
    );
  }

  private iniciarModal(): void {
    this.modal.querySelectorAll("[data-cerrar]").forEach((b) =>
      b.addEventListener("click", () => this.cerrarEdicion())
    );
    this.modal.addEventListener("mousedown", (e) => {
      if (e.target === this.modal) this.cerrarEdicion();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal.hidden) this.cerrarEdicion();
    });
  }
}