package com.uss.sistemaventas.dto;

public class DetalleVentaRequest {

    private Long productoId;
    private Integer cantidad;

    public DetalleVentaRequest() {
    }

    public DetalleVentaRequest(
            Long productoId,
            Integer cantidad
    ) {
        this.productoId = productoId;
        this.cantidad = cantidad;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}
