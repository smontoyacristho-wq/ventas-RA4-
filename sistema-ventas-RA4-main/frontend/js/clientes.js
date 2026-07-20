// API REST de clientes
const clienteApi = crearApiClient(
  'http://localhost:8091/api/v1/clientes'
);

// Paginador reutilizable definido en comun.js
const paginador = crearPaginador({
  elementoTexto: document.getElementById('textoPagina'),
  botonAnterior: document.getElementById('btnAnterior'),
  botonSiguiente: document.getElementById('btnSiguiente')
});

// Modal reutilizable definido en comun.js
const modalCliente = crearModalForm(
  'modalCliente',
  'formCliente',
  'tituloModal'
);

const CAMPOS_CLIENTE = [
  'id',
  'nombre',
  'dni',
  'telefono',
  'correo',
  'direccion'
];

// Elementos de la página
const cuerpoTabla = document.getElementById('cuerpoTabla');
const inputBusqueda = document.getElementById('inputBusqueda');
const btnBuscar = document.getElementById('btnBuscar');
const btnNuevo = document.getElementById('btnNuevo');

let clientesPagina = [];

// Carga inicial
document.addEventListener(
  'DOMContentLoaded',
  () => cargarClientes(0)
);

paginador.onCambioPagina(cargarClientes);

btnBuscar.addEventListener(
  'click',
  () => cargarClientes(0)
);

// Buscar al presionar Enter
inputBusqueda.addEventListener('keydown', evento => {
  if (evento.key === 'Enter') {
    cargarClientes(0);
  }
});

// Listar clientes
async function cargarClientes(pagina) {
  try {
    const search = inputBusqueda.value.trim();

    const data = await clienteApi.listar({
      offset: pagina,
      limit: 10,
      search
    });

    clientesPagina = data.content;

    paginador.actualizar(
      data.number,
      data.totalPages || 1
    );

    renderTabla(clientesPagina);

  } catch (error) {
    alert(error.message);
  }
}

// Mostrar los clientes en la tabla
function renderTabla(lista) {
  cuerpoTabla.innerHTML = '';

  lista.forEach(cliente => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${cliente.id}</td>
      <td>${cliente.dni}</td>
      <td>${cliente.nombre}</td>
      <td>${cliente.telefono || ''}</td>
      <td>${cliente.correo || ''}</td>
      <td>${cliente.direccion || ''}</td>
      <td>
        <button
          class="btn btn-sm btn-warning btn-editar"
          data-id="${cliente.id}"
        >
          Editar
        </button>

        <button
          class="btn btn-sm btn-danger btn-eliminar"
          data-id="${cliente.id}"
        >
          Eliminar
        </button>
      </td>
    `;

    cuerpoTabla.appendChild(fila);
  });
}

// Detectar botones Editar y Eliminar
cuerpoTabla.addEventListener('click', evento => {
  const id = parseInt(evento.target.dataset.id);

  if (evento.target.classList.contains('btn-editar')) {
    const cliente = clientesPagina.find(
      clienteActual => clienteActual.id === id
    );

    if (cliente) {
      modalCliente.abrirEditar(
        cliente,
        'Editar Cliente'
      );
    }
  }

  if (evento.target.classList.contains('btn-eliminar')) {
    eliminarCliente(id);
  }
});

// Abrir formulario de cliente nuevo
btnNuevo.addEventListener('click', () => {
  modalCliente.abrirNuevo('Nuevo Cliente');
});

// Registrar o actualizar cliente
modalCliente.alGuardar(async () => {
  const datos = modalCliente.obtenerDatos(
    CAMPOS_CLIENTE
  );

  const cliente = {
    nombre: datos.nombre.trim(),
    dni: datos.dni.trim(),
    telefono: datos.telefono.trim(),
    correo: datos.correo.trim(),
    direccion: datos.direccion.trim()
  };

  try {
    if (datos.id) {
      await clienteApi.actualizar(
        datos.id,
        cliente
      );
    } else {
      await clienteApi.crear(cliente);
    }

    modalCliente.cerrar();

    cargarClientes(
      paginador.paginaActual()
    );

  } catch (error) {
    alert(error.message);
  }
});

// Eliminar cliente
async function eliminarCliente(id) {
  const confirmar = confirm(
    '¿Seguro que deseas eliminar este cliente?'
  );

  if (!confirmar) {
    return;
  }

  try {
    await clienteApi.eliminar(id);

    cargarClientes(
      paginador.paginaActual()
    );

  } catch (error) {
    alert(error.message);
  }
}