package com.uss.sistemaventas.repository;

import com.uss.sistemaventas.model.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Page<Cliente> findByNombreContainingIgnoreCaseOrDniContainingIgnoreCase(
            String nombre,
            String dni,
            Pageable pageable
    );

    boolean existsByDni(String dni);
}
