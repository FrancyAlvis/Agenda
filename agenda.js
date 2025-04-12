// JavaScript completo para la aplicación de notas con tabla paginada y filtros

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("NotesForm");
  const inputTitulo = document.getElementById("inputTitulo");
  const inputDescripcion = document.getElementById("inputDescripcion");
  const noteContent = document.getElementById("noteContent");
  const selectCategoria = document.getElementById("selectcategory");
  const notesContainer = document.getElementById("NotesContainer");
  const mensajeSinNotas = document.getElementById("mensajeSinNotas");
  const submitBtn = form.querySelector("button[type='submit']");
  const eliminarTodoBtn = document.querySelector("[data-accion='eliminar-todo']");
  const filtrosBtns = document.querySelectorAll(".btn-filtro");

  let notaEditando = null;
  let notas = [];
  let filtroActual = "Todas";
  let paginaActual = 1;
  const notasPorPagina = 5;

// Iconos para las notas
  const categoriaIconos = {
    Trabajo: "briefcase",
    Personal: "chat-square-text",
    Estudios: "book"
  };

  // Cargar notas desde Local Storage
  if (localStorage.getItem("notas")) {
    notas = JSON.parse(localStorage.getItem("notas"));
  }

  // Guardar notas en Local Storage
  function guardarNotas() {
    localStorage.setItem("notas", JSON.stringify(notas));
  }

  // Fecha y hora en formato legible
  function obtenerFechaHora() {
    const fecha = new Date();
    return fecha.toLocaleString();
  }

  // Renderizar tabla con paginación
  function renderizarTablaNotas() {
    let notasFiltradas = filtroActual === "Todas"
      ? notas
      : notas.filter(n => n.categoria === filtroActual);

    const inicio = (paginaActual - 1) * notasPorPagina;
    const fin = inicio + notasPorPagina;
    const notasPagina = notasFiltradas.slice(inicio, fin);

    // Mostrar mensaje si no hay notas
    if (notasFiltradas.length === 0) {
      mensajeSinNotas.style.display = "block";
      notesContainer.innerHTML = "";
    } else {
      mensajeSinNotas.style.display = "none";
      
      // Generar contenido de la tabla
      let html = "";
      notasPagina.forEach(nota => {
        const icono = categoriaIconos[nota.categoria] || "sticky";
        html += `
          <tr data-id="${nota.id}">
            <td>${nota.titulo}</td>
            <td>${nota.descripcion}</td>
            <td><i class="bi bi-${icono}"></i> ${nota.categoria}</td>
            <td>${nota.fecha}</td>
            <td>
              <button class="btn btn-sm btn-warning btn-editar me-2">Editar</button>
              <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
            </td>
          </tr>
        `;
      });
      
      // Actualizar el contenido de la tabla
      notesContainer.innerHTML = html;
    }

    // Crear el contenedor de paginación 
    let paginacionContainer = document.querySelector(".paginacion-container");
    if (!paginacionContainer) {
      paginacionContainer = document.createElement("div");
      paginacionContainer.className = "paginacion-container d-flex justify-content-center mt-3";
      // Insertar después de la tabla
      notesContainer.closest(".table-responsive").after(paginacionContainer);
    }

    // Actualizar paginación
    const totalPaginas = Math.ceil(notasFiltradas.length / notasPorPagina);
    if (totalPaginas > 1) {
      paginacionContainer.innerHTML = `
        <button class="btn btn-outline-primary btn-sm me-2" ${paginaActual === 1 ? "disabled" : ""} id="btnAnterior">Anterior</button>
        <button class="btn btn-outline-primary btn-sm" ${paginaActual === totalPaginas ? "disabled" : ""} id="btnSiguiente">Siguiente</button>
      `;
      paginacionContainer.style.display = "flex";
    } else {
      paginacionContainer.style.display = "none";
    }

    // Eventos paginación
    const btnAnterior = document.getElementById("btnAnterior");
    const btnSiguiente = document.getElementById("btnSiguiente");

    if (btnAnterior) {
      btnAnterior.addEventListener("click", () => {
        if (paginaActual > 1) {
          paginaActual--;
          renderizarTablaNotas();
        }
      });
    }

    if (btnSiguiente) {
      btnSiguiente.addEventListener("click", () => {
        if (paginaActual < totalPaginas) {
          paginaActual++;
          renderizarTablaNotas();
        }
      });
    }
  }

  // Evento para guardar nueva nota o actualizar existente
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = inputTitulo.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const contenido = noteContent.value.trim();
    const categoria = selectCategoria.value;

    if (!titulo || !descripcion || !contenido) {
      alert("Por favor completa todos los campos.");
      return;
    }

    if (notaEditando) {
      notaEditando.titulo = titulo;
      notaEditando.descripcion = descripcion;
      notaEditando.contenido = contenido;
      notaEditando.categoria = categoria;
      guardarNotas();
      notaEditando = null;
      submitBtn.textContent = "Agregar Nota";
      submitBtn.classList.remove("btn-primary");
      submitBtn.classList.add("btn-success");
    } else {
      const nuevaNota = {
        id: Date.now(),
        titulo,
        descripcion,
        contenido,
        categoria,
        fecha: obtenerFechaHora()
      };
      notas.push(nuevaNota);
      guardarNotas();
    }

    form.reset();
    renderizarTablaNotas();
  });

  // Delegación de eventos para editar y eliminar
  notesContainer.addEventListener("click", (e) => {
    const fila = e.target.closest("tr");
    if (!fila) return;
    const id = Number(fila.dataset.id);
    const nota = notas.find(n => n.id === id);

    if (e.target.classList.contains("btn-editar")) {
      // Confirmación de edición con SweetAlert2
      Swal.fire({
        title: '¿Estás seguro de editar esta nota?',
        text: "Esta acción actualizará la información de la nota.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, editar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          inputTitulo.value = nota.titulo;
          inputDescripcion.value = nota.descripcion;
          noteContent.value = nota.contenido;
          selectCategoria.value = nota.categoria;
          notaEditando = nota;
          submitBtn.textContent = "Actualizar Nota";
          submitBtn.classList.remove("btn-success");
          submitBtn.classList.add("btn-primary");
        }
      });
    } else if (e.target.classList.contains("btn-eliminar")) {
      // Confirmación de eliminación con SweetAlert2
      Swal.fire({
        title: '¿Estás seguro de eliminar esta nota?',
        text: "Esta acción no se puede deshacer.",
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          notas = notas.filter(n => n.id !== id);
          guardarNotas();
          renderizarTablaNotas();
        }
      });
    }
  });

  // Filtros
  filtrosBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filtroActual = btn.dataset.filtro;
      paginaActual = 1;
      renderizarTablaNotas();
    });
  });

  // Eliminar todas las notas
  eliminarTodoBtn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres eliminar todas las notas?")) {
      notas = [];
      guardarNotas();
      renderizarTablaNotas();
    }
  });

  // Renderizar inicial
  renderizarTablaNotas();
});