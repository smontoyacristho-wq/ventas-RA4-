package com.uss.sistemaventas.service;

import com.uss.sistemaventas.dto.DetalleVentaRequest;
import com.uss.sistemaventas.dto.VentaRequest;
import com.uss.sistemaventas.model.Cliente;
import com.uss.sistemaventas.model.DetalleVenta;
import com.uss.sistemaventas.model.Producto;
import com.uss.sistemaventas.model.Venta;
import com.uss.sistemaventas.repository.VentaRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ClienteService clienteService;
    private final ProductoService productoService;

    public VentaService(
            VentaRepository ventaRepository,
            ClienteService clienteService,
            ProductoService productoService
    ) {
        this.ventaRepository = ventaRepository;
        this.clienteService = clienteService;
        this.productoService = productoService;
    }

    // Registrar una nueva venta
    @Transactional
    public Venta registrarVenta(VentaRequest ventaRequest) {

        if (ventaRequest.getClienteId() == null) {
            throw new RuntimeException(
                    "Debe seleccionar un cliente"
            );
        }

        if (ventaRequest.getMetodoPago() == null ||
                ventaRequest.getMetodoPago().isBlank()) {

            throw new RuntimeException(
                    "Debe indicar el método de pago"
            );
        }

        if (ventaRequest.getDetalles() == null ||
                ventaRequest.getDetalles().isEmpty()) {

            throw new RuntimeException(
                    "La venta debe contener al menos un producto"
            );
        }

        Cliente cliente = clienteService.buscarPorId(
                ventaRequest.getClienteId()
        );

        Venta venta = new Venta();

        venta.setCliente(cliente);
        venta.setFecha(LocalDateTime.now());
        venta.setMetodoPago(
                ventaRequest.getMetodoPago()
        );
        venta.setTotal(BigDecimal.ZERO);

        BigDecimal totalVenta = BigDecimal.ZERO;

        for (DetalleVentaRequest detalleRequest
                : ventaRequest.getDetalles()) {

            if (detalleRequest.getProductoId() == null) {
                throw new RuntimeException(
                        "Debe indicar el producto"
                );
            }

            if (detalleRequest.getCantidad() == null ||
                    detalleRequest.getCantidad() <= 0) {

                throw new RuntimeException(
                        "La cantidad debe ser mayor que cero"
                );
            }

            Producto producto = productoService.buscarPorId(
                    detalleRequest.getProductoId()
            );

            if (producto.getStock() <
                    detalleRequest.getCantidad()) {

                throw new RuntimeException(
                        "Stock insuficiente para el producto: "
                                + producto.getNombre()
                );
            }

            BigDecimal precioUnitario =
                    producto.getPrecioVenta();

            BigDecimal subtotal = precioUnitario.multiply(
                    BigDecimal.valueOf(
                            detalleRequest.getCantidad()
                    )
            );

            DetalleVenta detalleVenta =
                    new DetalleVenta(
                            producto,
                            detalleRequest.getCantidad(),
                            precioUnitario,
                            subtotal
                    );

            venta.agregarDetalle(detalleVenta);

            int nuevoStock =
                    producto.getStock()
                            - detalleRequest.getCantidad();

            producto.setStock(nuevoStock);

            productoService.guardarProducto(producto);

            totalVenta = totalVenta.add(subtotal);
        }

        venta.setTotal(totalVenta);

        return ventaRepository.save(venta);
    }

    // Listar todas las ventas
    @Transactional(readOnly = true)
    public List<Venta> listarVentas() {

        return ventaRepository.findAll(
                Sort.by("id").descending()
        );
    }

    // Buscar una venta por ID
    @Transactional(readOnly = true)
    public Venta buscarPorId(Long id) {

        return ventaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Venta no encontrada"
                        )
                );
    }
}
