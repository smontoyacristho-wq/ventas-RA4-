// =====================================================================
// comun.js — piezas reutilizables para cualquier pantalla de listado/CRUD
// =====================================================================

// ---------------------------------------------------------------------
// PATRÓN FACTORY: crea un cliente HTTP para un recurso REST (search/offset/limit
// + create/update/delete). Se puede reutilizar para "productos", "clientes", etc.
// simplemente cambiando el baseUrl.
// ---------------------------------------------------------------------
function crearApiClient(baseUrl) {

  async function enviar(url, metodo, datos) {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      throw new Error(`Error ${respuesta.status}: ${detalle || respuesta.statusText}`);
    }
    return respuesta.status === 204 ? null : respuesta.json();
  }

  return {
    async listar({ offset = 0, limit = 10, search = '' } = {}) {
      const parametros = new URLSearchParams({ offset, limit });
      if (search) parametros.append('search', search);

      const respuesta = await fetch(`${baseUrl}?${parametros}`);
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status} al listar`);
      return respuesta.json(); // Page<T>: { content, totalPages, number, ... }
    },
    crear(datos) {
      return enviar(baseUrl, 'POST', datos);
    },
    actualizar(id, datos) {
      return enviar(`${baseUrl}/${id}`, 'PUT', datos);
    },
    eliminar(id) {
      return enviar(`${baseUrl}/${id}`, 'DELETE');
    }
  };
}

// ---------------------------------------------------------------------
// PATRÓN OBSERVER: el paginador solo sabe mostrar "Página X de Y" y mover
// el número de página. Cuando cambia, avisa a quien se haya suscrito con
// onCambioPagina(); no sabe nada de productos ni de la API.
// ---------------------------------------------------------------------
function crearPaginador({ elementoTexto, botonAnterior, botonSiguiente }) {
  let paginaActual = 0;
  let totalPaginas = 1;
  const observadores = [];

  function render() {
    elementoTexto.textContent = `Página ${paginaActual + 1} de ${totalPaginas}`;
    botonAnterior.parentElement.classList.toggle('disabled', paginaActual === 0);
    botonSiguiente.parentElement.classList.toggle('disabled', paginaActual >= totalPaginas - 1);
  }

  function notificar() {
    observadores.forEach(fn => fn(paginaActual));
  }

  botonAnterior.addEventListener('click', () => {
    if (paginaActual > 0) { paginaActual--; render(); notificar(); }
  });

  botonSiguiente.addEventListener('click', () => {
    if (paginaActual < totalPaginas - 1) { paginaActual++; render(); notificar(); }
  });

  return {
    onCambioPagina(fn) {
      observadores.push(fn);
    },
    actualizar(pagina, paginas) {
      paginaActual = pagina;
      totalPaginas = paginas;
      render();
    },
    paginaActual() {
      return paginaActual;
    }
  };
}

// ---------------------------------------------------------------------
// PATRÓN FACADE: esconde los detalles de bootstrap.Modal + FormData detrás
// de 4 métodos simples (abrirNuevo, abrirEditar, obtenerDatos, cerrar).
// Requiere que cada campo del formulario tenga el atributo "name" igual
// a la propiedad del objeto (ej. name="precioVenta").
// ---------------------------------------------------------------------
function crearModalForm(idModal, idFormulario, idTitulo) {
  const modalBootstrap = new bootstrap.Modal(document.getElementById(idModal));
  const formulario = document.getElementById(idFormulario);
  const titulo = document.getElementById(idTitulo);

  return {
    abrirNuevo(tituloTexto) {
      formulario.reset();
      titulo.textContent = tituloTexto;
      modalBootstrap.show();
    },
    abrirEditar(datos, tituloTexto) {
      Object.keys(datos).forEach(campo => {
        if (formulario.elements[campo]) formulario.elements[campo].value = datos[campo];
      });
      titulo.textContent = tituloTexto;
      modalBootstrap.show();
    },
    obtenerDatos(campos) {
      const resultado = {};
      campos.forEach(campo => resultado[campo] = formulario.elements[campo].value);
      return resultado;
    },
    alGuardar(callback) {
      formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        callback();
      });
    },
    cerrar() {
      modalBootstrap.hide();
    }
  };
}
