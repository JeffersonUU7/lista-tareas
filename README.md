# 📝 Lista de Tareas - TypeScript + MVC

**Laboratorio #2 - Proyecto 1** | Programación Orientada a Eventos
**Autor:** Jefferson Requeno | **Carnet:** u20250779 | **Fecha:** Octubre 2026

Aplicación web para gestionar tareas personales, desarrollada con **TypeScript** y arquitectura **MVC**, con persistencia en `localStorage`.

---

## 🚀 Cómo ejecutar el proyecto (paso a paso)

### Requisitos
- **Node.js** versión 18 o superior (incluye `npm`). Descarga: https://nodejs.org
- Un navegador moderno (Chrome, Edge o Firefox actualizado)
- Conexión a internet (solo para la tipografía de Google Fonts; sin internet la app funciona igual con otra fuente)

Para verificar que Node está instalado:
```bash
node -v
npm -v
```

### Instalación y ejecución
```bash
git clone https://github.com/TU_USUARIO/lista-tareas.git
cd lista-tareas
npm install
npm start
```

Luego abre en el navegador: **http://localhost:3000**

> `npm start` compila automáticamente el TypeScript (carpeta `dist/`) y levanta el servidor local.

### Comandos disponibles
| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias (TypeScript y serve) |
| `npm run build` | Compila TypeScript a JavaScript en `dist/` |
| `npm run watch` | Recompila automáticamente al guardar cambios |
| `npm start` | Compila y levanta el servidor en el puerto 3000 |

### ⚠️ Importante
- **No abrir `index.html` con doble clic.** Los módulos ES no funcionan desde `file://`; debe usarse el servidor (`npm start`).
- Si el puerto 3000 está ocupado, ejecutar: `npx serve . -l 3001` y abrir `http://localhost:3001`.
- Si el navegador muestra una versión vieja, refrescar con `Ctrl + F5`.
- Los datos se guardan en el `localStorage` del navegador, por lo que son independientes por puerto y por navegador.

### Solución de problemas
| Problema | Solución |
|---|---|
| `'npm' no se reconoce como comando` | Instalar Node.js y reiniciar la terminal |
| Pantalla en blanco / no carga | Verificar que se usó `npm start` y no doble clic en el HTML |
| Error de puerto en uso | Usar otro puerto: `npx serve . -l 3001` |
| Cambios no se reflejan | Ejecutar `npm run build` y refrescar con `Ctrl + F5` |

---

## ✅ Funcionalidades

- Registrar tareas con **título y descripción**
- Marcar tareas como **completadas o pendientes**
- **Buscar** tareas por título
- **Filtrar** por estado (todas, pendientes, completadas)
- **Editar** tareas existentes
- **Eliminar** tareas con confirmación
- **Validaciones** (título de 3 a 60 caracteres, descripción máximo 200)
- **Persistencia** en `localStorage`
- Interfaz moderna con animaciones (glassmorphism, borde neón, efectos 3D)

---

## 🏗️ Arquitectura MVC

| Capa | Archivo | Responsabilidad |
|---|---|---|
| **Model** | `src/models/Tarea.ts` | Datos de la tarea y sus validaciones |
| **View** | `src/views/TareaView.ts`, `index.html`, `styles.css` | Mostrar la interfaz y capturar eventos del DOM |
| **Controller** | `src/controllers/TareaController.ts` | Coordina vista, modelo y almacenamiento |
| **Service** | `src/services/StorageService.ts` | Guardar y cargar desde `localStorage` |

**Flujo:** el usuario interactúa con la **Vista** → la Vista notifica al **Controlador** → el Controlador usa el **Modelo** y el **Servicio de almacenamiento** → el Controlador ordena a la Vista volver a renderizar.

### Conceptos de TypeScript aplicados
- Clases con constructor y modificadores `public`, `private` y `readonly`
- Interfaz `ITarea` implementada por la clase `Tarea`
- Tipo de unión literal `Filtro = "todas" | "pendientes" | "completadas"`
- Modo `strict` activado en `tsconfig.json`
- Métodos estáticos, tipado de eventos y elementos del DOM

---

## 📁 Estructura del proyecto

```
lista-tareas/
├── index.html
├── package.json
├── tsconfig.json
├── README.md
├── dist/                 (JavaScript compilado)
└── src/
    ├── main.ts
    ├── models/Tarea.ts
    ├── views/TareaView.ts
    ├── controllers/TareaController.ts
    ├── services/StorageService.ts
    └── styles/styles.css
```