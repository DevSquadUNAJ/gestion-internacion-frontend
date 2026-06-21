export const crearTarjetaSector = (sector) => {
    let colorBarra = 'bg-success';
    if (sector.porcentajeOcupacion >= 80) colorBarra = 'bg-danger';
    else if (sector.porcentajeOcupacion >= 50) colorBarra = 'bg-warning';

    return `
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="card h-100 border-0 shadow-sm" style="border-radius: 12px; transition: transform 0.2s;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="card-title mb-0 fw-bold text-oscuro">
                            <i class="bi bi-door-open me-2 text-primary"></i>${sector.nombre}
                        </h5>
                        <span class="badge bg-light text-dark border">Piso ${sector.piso}</span>
                    </div>
                    
                    <div class="mb-3">
                        <div class="d-flex justify-content-between small mb-1 text-muted">
                            <span>Ocupación</span>
                            <span class="fw-bold">${sector.porcentajeOcupacion.toFixed(0)}%</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar ${colorBarra}" role="progressbar" style="width: ${sector.porcentajeOcupacion}%" aria-valuenow="${sector.porcentajeOcupacion}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>

                    <div class="row text-center border-top pt-3 mt-3">
                        <div class="col-4 border-end">
                            <h6 class="mb-0 fw-bold text-oscuro">${sector.cantidadTotalCamas}</h6>
                            <small class="text-muted" style="font-size: 0.75rem;">Total</small>
                        </div>
                        <div class="col-4 border-end">
                            <h6 class="mb-0 fw-bold text-success">${sector.cantidadCamasDisponibles}</h6>
                            <small class="text-muted" style="font-size: 0.75rem;">Libres</small>
                        </div>
                        <div class="col-4">
                            <h6 class="mb-0 fw-bold text-danger">${sector.cantidadCamasOcupadas}</h6>
                            <small class="text-muted" style="font-size: 0.75rem;">Ocupadas</small>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white border-0 text-center pb-3">
                    <button class="btn btn-outline-primary btn-sm rounded-pill px-4" data-sector-id="${sector.sectorId}">
                        Ver Camas <i class="bi bi-arrow-right ms-1"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};