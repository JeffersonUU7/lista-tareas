export type Prioridad = "alta" | "media" | "baja";

export interface ITarea {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  fechaLimite: string; // formato YYYY-MM-DD
  completada: boolean;
}

export class Tarea implements ITarea {
  constructor(
    public readonly id: number,
    public titulo: string,
    public descripcion: string,
    public prioridad: Prioridad,
    public fechaLimite: string,
    public completada: boolean = false
  ) {
    Tarea.validar(titulo, descripcion, prioridad, fechaLimite);
    this.titulo = titulo.trim();
    this.descripcion = descripcion.trim();
  }

  // ---------- Utilidades de fecha ----------
  static formatear(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  static hoy(): string {
    return Tarea.formatear(new Date());
  }

  static fechaMaxima(): string {
    const f = new Date();
    f.setFullYear(f.getFullYear() + 5);
    return Tarea.formatear(f);
  }

  // ---------- Validaciones (formato y rangos) ----------
  static validar(titulo: string, descripcion: string, prioridad: string, fechaLimite: string): void {
    const t = titulo.trim();
    if (t.length < 3) throw new Error("El título debe tener al menos 3 caracteres.");
    if (t.length > 60) throw new Error("El título no puede superar 60 caracteres.");
    if (!/\p{L}/u.test(t)) throw new Error("El título debe contener al menos una letra.");
    if (descripcion.trim().length > 200) throw new Error("La descripción no puede superar 200 caracteres.");
    if (!["alta", "media", "baja"].includes(prioridad)) throw new Error("Selecciona una prioridad válida.");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaLimite)) throw new Error("Selecciona una fecha límite válida.");
    const [y, m, d] = fechaLimite.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    if (f.getFullYear() !== y || f.getMonth() !== m - 1 || f.getDate() !== d) {
      throw new Error("La fecha límite no existe en el calendario.");
    }
    if (fechaLimite > Tarea.fechaMaxima()) {
      throw new Error("La fecha límite no puede superar los 5 años desde hoy.");
    }
  }

  static validarNoPasada(fechaLimite: string): void {
    if (fechaLimite < Tarea.hoy()) throw new Error("La fecha límite no puede estar en el pasado.");
  }

  // ---------- Comportamiento ----------
  diasRestantes(): number {
    const [y, m, d] = this.fechaLimite.split("-").map(Number);
    const limite = new Date(y, m - 1, d);
    const h = new Date();
    const hoy = new Date(h.getFullYear(), h.getMonth(), h.getDate());
    return Math.round((limite.getTime() - hoy.getTime()) / 86400000);
  }

  estaVencida(): boolean {
    return !this.completada && this.diasRestantes() < 0;
  }

  actualizar(titulo: string, descripcion: string, prioridad: Prioridad, fechaLimite: string): void {
    Tarea.validar(titulo, descripcion, prioridad, fechaLimite);
    this.titulo = titulo.trim();
    this.descripcion = descripcion.trim();
    this.prioridad = prioridad;
    this.fechaLimite = fechaLimite;
  }

  toggle(): void {
    this.completada = !this.completada;
  }

  // Compatible con datos guardados del Laboratorio #2 (sin prioridad ni fecha)
  static desdeObjeto(obj: ITarea): Tarea {
    return new Tarea(
      obj.id,
      obj.titulo,
      obj.descripcion ?? "",
      obj.prioridad ?? "media",
      obj.fechaLimite ?? Tarea.hoy(),
      obj.completada ?? false
    );
  }
}