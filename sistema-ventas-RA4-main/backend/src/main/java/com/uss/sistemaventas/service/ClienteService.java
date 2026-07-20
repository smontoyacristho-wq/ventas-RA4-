package com.uss.sistemaventas.service;

import com.uss.sistemaventas.model.Cliente;
import com.uss.sistemaventas.repository.ClienteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public Page<Cliente> listarClientes(
            String busqueda,
            Pageable pageable
    ) {
        if (busqueda == null || busqueda.isBlank()) {
            return clienteRepository.findAll(pageable);
        }

        return clienteRepository
                .findByNombreContainingIgnoreCaseOrDniContainingIgnoreCase(
                        busqueda,
                        busqueda,
                        pageable
                );
    }

    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado")
                );
    }

    public Cliente guardarCliente(Cliente cliente) {

        if (clienteRepository.existsByDni(cliente.getDni())) {
            throw new RuntimeException(
                    "Ya existe un cliente registrado con ese DNI"
            );
        }

        return clienteRepository.save(cliente);
    }

    public Cliente actualizarCliente(
            Long id,
            Cliente clienteActualizado
    ) {
        Cliente clienteExistente = buscarPorId(id);

        boolean cambioDni =
                !clienteExistente.getDni()
                        .equals(clienteActualizado.getDni());

        if (cambioDni &&
                clienteRepository.existsByDni(
                        clienteActualizado.getDni()
                )) {

            throw new RuntimeException(
                    "Ya existe otro cliente registrado con ese DNI"
            );
        }

        clienteExistente.setNombre(
                clienteActualizado.getNombre()
        );

        clienteExistente.setDni(
                clienteActualizado.getDni()
        );

        clienteExistente.setTelefono(
                clienteActualizado.getTelefono()
        );

        clienteExistente.setCorreo(
                clienteActualizado.getCorreo()
        );

        clienteExistente.setDireccion(
                clienteActualizado.getDireccion()
        );

        return clienteRepository.save(clienteExistente);
    }

    public void eliminarCliente(Long id) {
        Cliente cliente = buscarPorId(id);
        clienteRepository.delete(cliente);
    }
}
