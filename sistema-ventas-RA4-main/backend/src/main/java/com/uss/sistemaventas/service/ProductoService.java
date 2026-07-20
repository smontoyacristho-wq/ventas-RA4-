package com.uss.sistemaventas.service;

import com.uss.sistemaventas.model.Producto;
import com.uss.sistemaventas.repository.ProductoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public Page<Producto> listarProductos(
            String busqueda,
            Pageable pageable
    ) {
        if (busqueda == null || busqueda.isBlank()) {
            return productoRepository.findAll(pageable);
        }

        return productoRepository
                .findByNombreContainingIgnoreCaseOrBarcodeContainingIgnoreCase(
                        busqueda,
                        busqueda,
                        pageable
                );
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Producto no encontrado")
                );
    }

    public Producto guardarProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto actualizarProducto(
            Long id,
            Producto productoActualizado
    ) {
        Producto productoExistente = buscarPorId(id);

        productoExistente.setNombre(
                productoActualizado.getNombre()
        );

        productoExistente.setBarcode(
                productoActualizado.getBarcode()
        );

        productoExistente.setDescripcion(
                productoActualizado.getDescripcion()
        );

        productoExistente.setPrecioVenta(
                productoActualizado.getPrecioVenta()
        );

        productoExistente.setStock(
                productoActualizado.getStock()
        );

        return productoRepository.save(productoExistente);
    }

    public void eliminarProducto(Long id) {
        Producto producto = buscarPorId(id);
        productoRepository.delete(producto);
    }
}