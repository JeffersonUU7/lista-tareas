export interface ITarea {
  id: number;
  titulo: string;
  descripcion: string;
  completada: boolean;
}

export class Tarea implements ITarea {
  constructor(
    public readonly id: number,
    public titulo: string,
    public descripcion: string,
    public completada: boolean = false
  ) {
    Tarea.validar(titulo, descripcion);
    this.titulo = titulo.trim();
    this.descripcion = descripcion.trim();
  }

  static validar(titulo: string, descripcion: string): void {
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

  actualizar(titulo: string, descripcion: string): void {
    Tarea.validar(titulo, descripcion);
    this.titulo = titulo.trim();
    this.descripcion = descripcion.trim();
  }

  toggle(): void {
    this.completada = !this.completada;
  }

  static desdeObjeto(obj: ITarea): Tarea {
    return new Tarea(obj.id, obj.titulo, obj.descripcion, obj.completada);
  }
}