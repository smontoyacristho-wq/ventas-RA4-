package com.uss.sistemaventas.controller;

import com.uss.sistemaventas.dto.VentaRequest;
import com.uss.sistemaventas.model.Venta;
import com.uss.sistemaventas.service.VentaService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    // POST: registrar una nueva venta
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Venta registrarVenta(
            @RequestBody VentaRequest ventaRequest
    ) {
        return ventaService.registrarVenta(ventaRequest);
    }

    // GET: listar todas las ventas
    @GetMapping
    public List<Venta> listarVentas() {
        return ventaService.listarVentas();
    }

    // GET: buscar una venta por su ID
    @GetMapping("/{id}")
    public Venta buscarVentaPorId(
            @PathVariable Long id
    ) {
        return ventaService.buscarPorId(id);
    }
}