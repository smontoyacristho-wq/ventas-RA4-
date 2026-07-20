// ===== INSTANCIAS (definidas en comun.js) =====
const productoApi = crearApiClient('http://localhost:8091/api/v1/productos');

const paginador = crearPaginador({
  elementoTexto: document.getElementById('textoPagina'),
  botonAnterior: document.getElementById('btnAnterior'),
  botonSiguiente: document.getElementById('btnSiguiente')
});

const modalProducto = crearModalForm('modalProducto', 'formProducto', 'tituloModal');

const CAMPOS_PRODUCTO = ['id', 'nombre', 'barcode', 'descripcion', 'precioVenta', 'stock'];

// ===== REFERENCIAS AL DOM =====
const cuerpoTabla = document.getElementById('cuerpoTabla');
const inputBusqueda = document.getElementById('inputBusqueda');
const btnBuscar = document.getElementById('btnBuscar');
const btnNuevo = document.getElementById('btnNuevo');

let productosPagina = []; // productos que se ven ahora mismo en la tabla

// ===== CARGA INICIAL =====
document.addEventListener('DOMContentLoaded', () => cargarProductos(0));
paginador.onCambioPagina(cargarProductos);
btnBuscar.addEventListener('click', () => cargarProductos(0));

// GET .../productos?search=texto&offset=0&limit=10
async function cargarProductos(pagina) {
  try {
    const search = inputBusqueda.value.trim();
    const data = await productoApi.listar({ offset: pagina, limit: 10, search });

    productosPagina = data.content;
    paginador.actualizar(data.number, data.totalPages || 1);
    renderTabla(productosPagina);
  } catch (error) {
    alert(error.message);
  }
}

// ===== RENDERIZAR TABLA =====
function renderTabla(lista) {
  cuerpoTabla.innerHTML = '';

  lista.forEach(producto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${producto.id}</td>
      <td>${producto.barcode}</td>
      <td>${producto.nombre}</td>
      <td>${producto.descripcion}</td>
      <td>S/ ${producto.precioVenta}</td>
      <td>${producto.stock}</td>
      <td>
        <button class="btn btn-sm btn-warning btn-editar" data-id="${producto.id}">Editar</button>
        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${producto.id}">Eliminar</button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// Delegación de eventos para los botones Editar / Eliminar
cuerpoTabla.addEventListener('click', (evento) => {
  const id = parseInt(evento.target.dataset.id);

  if (evento.target.classList.contains('btn-editar')) {
    const producto = productosPagina.find(p => p.id === id);
    if (producto) modalProducto.abrirEditar(producto, 'Editar Producto');
  }

  if (evento.target.classList.contains('btn-eliminar')) {
    eliminarProducto(id);
  }
});

// ===== NUEVO PRODUCTO =====
btnNuevo.addEventListener('click', () => modalProducto.abrirNuevo('Nuevo Producto'));

// ===== GUARDAR (CREAR o ACTUALIZAR) =====
modalProducto.alGuardar(async () => {
  const datos = modalProducto.obtenerDatos(CAMPOS_PRODUCTO);

  const producto = {
    nombre: datos.nombre,
    barcode: datos.barcode,
    descripcion: datos.descripcion,
    precioVenta: parseFloat(datos.precioVenta),
    stock: parseInt(datos.stock)
  };

  try {
    if (datos.id) {
      await productoApi.actualizar(datos.id, producto);
    } else {
      await productoApi.crear(producto);
    }
    modalProducto.cerrar();
    cargarProductos(paginador.paginaActual());
  } catch (error) {
    alert(error.message);
  }
});

// ===== ELIMINAR PRODUCTO =====
async function eliminarProducto(id) {
  const confirmar = confirm('¿Seguro que deseas eliminar este producto?');
  if (!confirmar) return;

  try {
    await productoApi.eliminar(id);
    cargarProductos(paginador.paginaActual());
  } catch (error) {
    alert(error.message);
  }
}
