package com.uss.sistemaventas.repository;

import com.uss.sistemaventas.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository
        extends JpaRepository<Venta, Long> {
}
