// ======================================================
// DIRECCIONES DE LAS API REST
// ======================================================

const URL_VENTAS =
    'http://localhost:8091/api/v1/ventas';

const clienteApi = crearApiClient(
    'http://localhost:8091/api/v1/clientes'
);

const productoApi = crearApiClient(
    'http://localhost:8091/api/v1/productos'
);


// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

const cuerpoTablaVentas =
    document.getElementById('cuerpoTablaVentas');

const mensajeSinVentas =
    document.getElementById('mensajeSinVentas');

const btnNuevaVenta =
    document.getElementById('btnNuevaVenta');

const btnRecargar =
    document.getElementById('btnRecargar');

const formVenta =
    document.getElementById('formVenta');

const selectCliente =
    document.getElementById('selectCliente');

const selectMetodoPago =
    document.getElementById('selectMetodoPago');

const selectProducto =
    document.getElementById('selectProducto');

const inputCantidad =
    document.getElementById('inputCantidad');

const btnAgregarDetalle =
    document.getElementById('btnAgregarDetalle');

const cuerpoDetalleVenta =
    document.getElementById('cuerpoDetalleVenta');

const textoTotalVenta =
    document.getElementById('textoTotalVenta');

const informacionVenta =
    document.getElementById('informacionVenta');

const cuerpoDetalleConsulta =
    document.getElementById('cuerpoDetalleConsulta');


// ======================================================
// MODALES DE BOOTSTRAP
// ======================================================

const modalVenta = new bootstrap.Modal(
    document.getElementById('modalVenta')
);

const modalDetalle = new bootstrap.Modal(
    document.getElementById('modalDetalle')
);


// ======================================================
// VARIABLES DEL MÓDULO
// ======================================================

let ventasRegistradas = [];
let clientesDisponibles = [];
let productosDisponibles = [];
let detallesVenta = [];


// ======================================================
// CARGA INICIAL
// ======================================================

document.addEventListener(
    'DOMContentLoaded',
    () => cargarVentas()
);


// ======================================================
// FUNCIÓN GENERAL PARA PETICIONES HTTP
// ======================================================

async function solicitarJson(url, opciones = {}) {

    const respuesta = await fetch(url, opciones);

    if (!respuesta.ok) {

        let mensaje = `Error ${respuesta.status}`;

        try {

            const error = await respuesta.json();

            mensaje =
                error.message ||
                error.error ||
                mensaje;

        } catch {

            const texto = await respuesta.text();

            if (texto) {
                mensaje = texto;
            }

        }

        throw new Error(mensaje);
    }

    if (respuesta.status === 204) {
        return null;
    }

    return respuesta.json();
}


// ======================================================
// LISTAR VENTAS
// ======================================================

async function cargarVentas() {

    try {

        ventasRegistradas = await solicitarJson(
            URL_VENTAS
        );

        renderTablaVentas(ventasRegistradas);

    } catch (error) {

        alert(
            'No se pudieron cargar las ventas: ' +
            error.message
        );

    }
}


// ======================================================
// MOSTRAR VENTAS EN LA TABLA
// ======================================================

function renderTablaVentas(lista) {

    cuerpoTablaVentas.innerHTML = '';

    if (!lista || lista.length === 0) {

        mensajeSinVentas.classList.remove('d-none');

        return;
    }

    mensajeSinVentas.classList.add('d-none');

    lista.forEach(venta => {

        const fila = document.createElement('tr');

        fila.innerHTML = `
      <td>${venta.id}</td>

      <td>
        ${formatearFecha(venta.fecha)}
      </td>

      <td>
        ${escaparHtml(venta.cliente.nombre)}
      </td>

      <td>
        ${escaparHtml(venta.cliente.dni)}
      </td>

      <td>
        ${escaparHtml(venta.metodoPago)}
      </td>

      <td>
        S/ ${Number(venta.total).toFixed(2)}
      </td>

      <td>
        <button
          type="button"
          class="btn btn-sm btn-info btn-ver-detalle"
          data-id="${venta.id}"
        >
          Ver detalle
        </button>
      </td>
    `;

        cuerpoTablaVentas.appendChild(fila);

    });
}


// ======================================================
// ABRIR FORMULARIO DE NUEVA VENTA
// ======================================================

btnNuevaVenta.addEventListener(
    'click',
    async () => {

        limpiarFormularioVenta();

        try {

            await Promise.all([
                cargarClientes(),
                cargarProductos()
            ]);

            modalVenta.show();

        } catch (error) {

            alert(
                'No se pudieron cargar los datos: ' +
                error.message
            );

        }

    }
);


// ======================================================
// CARGAR CLIENTES EN EL SELECT
// ======================================================

async function cargarClientes() {

    const respuesta = await clienteApi.listar({
        offset: 0,
        limit: 1000,
        search: ''
    });

    clientesDisponibles = respuesta.content || [];

    selectCliente.innerHTML = `
    <option value="">
      Seleccione un cliente
    </option>
  `;

    clientesDisponibles.forEach(cliente => {

        const opcion = document.createElement('option');

        opcion.value = cliente.id;

        opcion.textContent =
            `${cliente.nombre} - DNI ${cliente.dni}`;

        selectCliente.appendChild(opcion);

    });
}


// ======================================================
// CARGAR PRODUCTOS EN EL SELECT
// ======================================================

async function cargarProductos() {

    const respuesta = await productoApi.listar({
        offset: 0,
        limit: 1000,
        search: ''
    });

    productosDisponibles =
        (respuesta.content || [])
            .filter(producto => producto.stock > 0);

    selectProducto.innerHTML = `
    <option value="">
      Seleccione un producto
    </option>
  `;

    productosDisponibles.forEach(producto => {

        const opcion = document.createElement('option');

        opcion.value = producto.id;

        opcion.textContent =
            `${producto.nombre} | ` +
            `S/ ${Number(producto.precioVenta).toFixed(2)} | ` +
            `Stock: ${producto.stock}`;

        selectProducto.appendChild(opcion);

    });
}


// ======================================================
// AGREGAR PRODUCTO AL DETALLE
// ======================================================

btnAgregarDetalle.addEventListener(
    'click',
    () => {

        const productoId =
            Number(selectProducto.value);

        const cantidad =
            Number(inputCantidad.value);

        if (!productoId) {

            alert('Seleccione un producto.');

            return;
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {

            alert(
                'La cantidad debe ser un número mayor que cero.'
            );

            return;
        }

        const producto =
            productosDisponibles.find(
                productoActual =>
                    productoActual.id === productoId
            );

        if (!producto) {

            alert('El producto seleccionado no existe.');

            return;
        }

        const detalleExistente =
            detallesVenta.find(
                detalle =>
                    detalle.productoId === productoId
            );

        const cantidadActual =
            detalleExistente
                ? detalleExistente.cantidad
                : 0;

        const nuevaCantidad =
            cantidadActual + cantidad;

        if (nuevaCantidad > producto.stock) {

            alert(
                `Stock insuficiente. Solo existen ` +
                `${producto.stock} unidades disponibles.`
            );

            return;
        }

        if (detalleExistente) {

            detalleExistente.cantidad =
                nuevaCantidad;

        } else {

            detallesVenta.push({

                productoId: producto.id,
                nombre: producto.nombre,

                precioUnitario:
                    Number(producto.precioVenta),

                stock: producto.stock,
                cantidad: cantidad

            });

        }

        selectProducto.value = '';
        inputCantidad.value = 1;

        renderDetalleVenta();

    }
);


// ======================================================
// MOSTRAR PRODUCTOS AGREGADOS
// ======================================================

function renderDetalleVenta() {

    cuerpoDetalleVenta.innerHTML = '';

    detallesVenta.forEach(detalle => {

        const subtotal =
            detalle.precioUnitario *
            detalle.cantidad;

        const fila = document.createElement('tr');

        fila.innerHTML = `
      <td>
        ${escaparHtml(detalle.nombre)}
      </td>

      <td>
        S/ ${detalle.precioUnitario.toFixed(2)}
      </td>

      <td>
        ${detalle.cantidad}
      </td>

      <td>
        S/ ${subtotal.toFixed(2)}
      </td>

      <td>
        <button
          type="button"
          class="btn btn-sm btn-danger btn-quitar-producto"
          data-id="${detalle.productoId}"
        >
          Quitar
        </button>
      </td>
    `;

        cuerpoDetalleVenta.appendChild(fila);

    });

    actualizarTotal();
}


// ======================================================
// QUITAR PRODUCTO DEL DETALLE
// ======================================================

cuerpoDetalleVenta.addEventListener(
    'click',
    evento => {

        if (
            !evento.target.classList.contains(
                'btn-quitar-producto'
            )
        ) {
            return;
        }

        const productoId =
            Number(evento.target.dataset.id);

        detallesVenta =
            detallesVenta.filter(
                detalle =>
                    detalle.productoId !== productoId
            );

        renderDetalleVenta();

    }
);


// ======================================================
// CALCULAR TOTAL EN LA INTERFAZ
// ======================================================

function actualizarTotal() {

    const total = detallesVenta.reduce(
        (acumulado, detalle) =>
            acumulado +
            detalle.precioUnitario *
            detalle.cantidad,
        0
    );

    textoTotalVenta.textContent =
        `S/ ${total.toFixed(2)}`;
}


// ======================================================
// REGISTRAR VENTA
// ======================================================

formVenta.addEventListener(
    'submit',
    async evento => {

        evento.preventDefault();

        const clienteId =
            Number(selectCliente.value);

        const metodoPago =
            selectMetodoPago.value;

        if (!clienteId) {

            alert('Seleccione un cliente.');

            return;
        }

        if (!metodoPago) {

            alert('Seleccione un método de pago.');

            return;
        }

        if (detallesVenta.length === 0) {

            alert(
                'Debe agregar al menos un producto.'
            );

            return;
        }

        const ventaRequest = {

            clienteId: clienteId,

            metodoPago: metodoPago,

            detalles: detallesVenta.map(
                detalle => ({

                    productoId:
                        detalle.productoId,

                    cantidad:
                        detalle.cantidad

                })
            )

        };

        const botonRegistrar =
            formVenta.querySelector(
                'button[type="submit"]'
            );

        try {

            botonRegistrar.disabled = true;
            botonRegistrar.textContent = 'Registrando...';

            const ventaRegistrada =
                await solicitarJson(
                    URL_VENTAS,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json'
                        },

                        body: JSON.stringify(
                            ventaRequest
                        )
                    }
                );

            modalVenta.hide();

            alert(
                `Venta registrada correctamente.\n` +
                `Número de venta: ${ventaRegistrada.id}\n` +
                `Total: S/ ${Number(
                    ventaRegistrada.total
                ).toFixed(2)}`
            );

            limpiarFormularioVenta();

            await cargarVentas();

        } catch (error) {

            alert(
                'No se pudo registrar la venta: ' +
                error.message
            );

        } finally {

            botonRegistrar.disabled = false;
            botonRegistrar.textContent =
                'Registrar venta';

        }

    }
);


// ======================================================
// VER DETALLE DE UNA VENTA REGISTRADA
// ======================================================

cuerpoTablaVentas.addEventListener(
    'click',
    evento => {

        if (
            !evento.target.classList.contains(
                'btn-ver-detalle'
            )
        ) {
            return;
        }

        const ventaId =
            Number(evento.target.dataset.id);

        const venta =
            ventasRegistradas.find(
                ventaActual =>
                    ventaActual.id === ventaId
            );

        if (venta) {
            mostrarDetalleVenta(venta);
        }

    }
);


// ======================================================
// LLENAR MODAL DE CONSULTA
// ======================================================

function mostrarDetalleVenta(venta) {

    informacionVenta.innerHTML = `
    <p>
      <strong>Número de venta:</strong>
      ${venta.id}
    </p>

    <p>
      <strong>Fecha:</strong>
      ${formatearFecha(venta.fecha)}
    </p>

    <p>
      <strong>Cliente:</strong>
      ${escaparHtml(venta.cliente.nombre)}
    </p>

    <p>
      <strong>DNI:</strong>
      ${escaparHtml(venta.cliente.dni)}
    </p>

    <p>
      <strong>Método de pago:</strong>
      ${escaparHtml(venta.metodoPago)}
    </p>

    <p>
      <strong>Total:</strong>
      S/ ${Number(venta.total).toFixed(2)}
    </p>
  `;

    cuerpoDetalleConsulta.innerHTML = '';

    venta.detalles.forEach(detalle => {

        const fila = document.createElement('tr');

        fila.innerHTML = `
      <td>
        ${escaparHtml(detalle.producto.nombre)}
      </td>

      <td>
        S/ ${Number(
            detalle.precioUnitario
        ).toFixed(2)}
      </td>

      <td>
        ${detalle.cantidad}
      </td>

      <td>
        S/ ${Number(
            detalle.subtotal
        ).toFixed(2)}
      </td>
    `;

        cuerpoDetalleConsulta.appendChild(fila);

    });

    modalDetalle.show();
}


// ======================================================
// BOTÓN ACTUALIZAR LISTADO
// ======================================================

btnRecargar.addEventListener(
    'click',
    () => cargarVentas()
);


// ======================================================
// LIMPIAR EL FORMULARIO
// ======================================================

function limpiarFormularioVenta() {

    formVenta.reset();

    detallesVenta = [];

    cuerpoDetalleVenta.innerHTML = '';

    textoTotalVenta.textContent =
        'S/ 0.00';

    inputCantidad.value = 1;
}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFecha(fecha) {

    if (!fecha) {
        return '';
    }

    const fechaConvertida =
        new Date(fecha);

    if (
        Number.isNaN(
            fechaConvertida.getTime()
        )
    ) {
        return fecha;
    }

    return new Intl.DateTimeFormat(
        'es-PE',
        {
            dateStyle: 'short',
            timeStyle: 'short'
        }
    ).format(fechaConvertida);
}

// ======================================================
// EVITAR INTERPRETAR TEXTO COMO HTML
// ======================================================

function escaparHtml(valor) {

    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}