package com.uss.sistemaventas.controller;

import com.uss.sistemaventas.model.Producto;
import com.uss.sistemaventas.service.ProductoService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // GET: listar y buscar productos
    // Ejemplo:
    // /api/v1/productos?search=arroz&offset=0&limit=10
    @GetMapping
    public Page<Producto> listarProductos(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit
    ) {
        Pageable pageable = PageRequest.of(
                offset,
                limit,
                Sort.by("id").ascending()
        );

        return productoService.listarProductos(search, pageable);
    }

    // GET: buscar un producto por su ID
    // Ejemplo: /api/v1/productos/1
    @GetMapping("/{id}")
    public Producto buscarProductoPorId(
            @PathVariable Long id
    ) {
        return productoService.buscarPorId(id);
    }

    // POST: registrar un producto
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Producto registrarProducto(
            @RequestBody Producto producto
    ) {
        producto.setId(null);
        return productoService.guardarProducto(producto);
    }

    // PUT: actualizar un producto
    @PutMapping("/{id}")
    public Producto actualizarProducto(
            @PathVariable Long id,
            @RequestBody Producto producto
    ) {
        return productoService.actualizarProducto(
                id,
                producto
        );
    }

    // DELETE: eliminar un producto
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarProducto(
            @PathVariable Long id
    ) {
        productoService.eliminarProducto(id);
    }
}