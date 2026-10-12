export class TareaView {
    constructor() {
        this.form = document.getElementById("form-tarea");
        this.inputTitulo = document.getElementById("titulo");
        this.inputDescripcion = document.getElementById("descripcion");
        this.inputBuscar = document.getElementById("buscar");
        this.selectFiltro = document.getElementById("filtro");
        this.lista = document.getElementById("lista");
        this.mensaje = document.getElementById("mensaje");
        this.btnGuardar = document.getElementById("btn-guardar");
        this.btnCancelar = document.getElementById("btn-cancelar");
        this.anillo = document.getElementById("anillo");
        this.pctTexto = document.getElementById("pct-texto");
        this.statTotal = document.getElementById("stat-total");
        this.statPend = document.getElementById("stat-pend");
        this.statComp = document.getElementById("stat-comp");
        this.barraPend = document.getElementById("barra-pend");
        this.barraComp = document.getElementById("barra-comp");
    }
    // ---- Eventos (el controlador los conecta) ----
    alEnviar(handler) {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            handler(this.inputTitulo.value, this.inputDescripcion.value);
        });
    }
    alBuscar(handler) {
        this.inputBuscar.addEventListener("input", () => handler(this.inputBuscar.value));
    }
    alFiltrar(handler) {
        this.selectFiltro.addEventListener("change", () => handler(this.selectFiltro.value));
    }
    alCancelar(handler) {
        this.btnCancelar.addEventListener("click", handler);
    }
    alAccion(handler) {
        this.lista.addEventListener("click", (e) => {
            const boton = e.target.closest("button");
            if (!boton)
                return;
            const li = boton.closest("li");
            handler(boton.dataset.accion ?? "", Number(li.dataset.id));
        });
    }
    // ---- Renderizado ----
    renderizar(tareas) {
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
            acciones.append(this.crearBoton(t.completada ? "↩ Pendiente" : "✔ Completar", "toggle"), this.crearBoton("✏ Editar", "editar"), this.crearBoton("🗑 Eliminar", "eliminar"));
            li.append(info, acciones);
            this.lista.appendChild(li);
        });
    }
    crearBoton(texto, accion) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = texto;
        b.dataset.accion = accion;
        return b;
    }
    actualizarResumen(total, pendientes, completadas) {
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
    mostrarMensaje(texto, tipo) {
        this.mensaje.textContent = texto;
        this.mensaje.className = `mensaje ${tipo}`;
        window.setTimeout(() => {
            this.mensaje.textContent = "";
            this.mensaje.className = "mensaje";
        }, 3000);
    }
    confirmar(texto) {
        return window.confirm(texto);
    }
    limpiarFormulario() {
        this.form.reset();
        this.btnGuardar.textContent = "Agregar tarea";
        this.btnCancelar.hidden = true;
    }
    cargarEnFormulario(tarea) {
        this.inputTitulo.value = tarea.titulo;
        this.inputDescripcion.value = tarea.descripcion;
        this.btnGuardar.textContent = "Guardar cambios";
        this.btnCancelar.hidden = false;
        this.inputTitulo.focus();
    }
}
