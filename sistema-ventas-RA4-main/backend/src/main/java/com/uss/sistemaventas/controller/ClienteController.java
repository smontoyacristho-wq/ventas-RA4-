package com.uss.sistemaventas.controller;

import com.uss.sistemaventas.model.Cliente;
import com.uss.sistemaventas.service.ClienteService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // GET: listar clientes o buscar por nombre y DNI
    // Ejemplo:
    // /api/v1/clientes?search=Juan&offset=0&limit=10
    @GetMapping
    public Page<Cliente> listarClientes(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit
    ) {

        Pageable pageable = PageRequest.of(
                offset,
                limit,
                Sort.by("id").ascending()
        );

        return clienteService.listarClientes(
                search,
                pageable
        );
    }

    // GET: buscar cliente por ID
    // Ejemplo: /api/v1/clientes/1
    @GetMapping("/{id}")
    public Cliente buscarClientePorId(
            @PathVariable Long id
    ) {
        return clienteService.buscarPorId(id);
    }

    // POST: registrar cliente
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cliente registrarCliente(
            @RequestBody Cliente cliente
    ) {
        cliente.setId(null);

        return clienteService.guardarCliente(cliente);
    }

    // PUT: actualizar cliente
    @PutMapping("/{id}")
    public Cliente actualizarCliente(
            @PathVariable Long id,
            @RequestBody Cliente cliente
    ) {
        return clienteService.actualizarCliente(
                id,
                cliente
        );
    }

    // DELETE: eliminar cliente
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarCliente(
            @PathVariable Long id
    ) {
        clienteService.eliminarCliente(id);
    }
}
