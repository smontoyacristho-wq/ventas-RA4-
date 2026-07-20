package com.uss.sistemaventas.dto;

import java.util.ArrayList;
import java.util.List;

public class VentaRequest {

    private Long clienteId;
    private String metodoPago;
    private List<DetalleVentaRequest> detalles = new ArrayList<>();

    public VentaRequest() {
    }

    public VentaRequest(
            Long clienteId,
            String metodoPago,
            List<DetalleVentaRequest> detalles
    ) {
        this.clienteId = clienteId;
        this.metodoPago = metodoPago;
        this.detalles = detalles;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public List<DetalleVentaRequest> getDetalles() {
        return detalles;
    }

    public void setDetalles(
            List<DetalleVentaRequest> detalles
    ) {
        this.detalles = detalles;
    }
}