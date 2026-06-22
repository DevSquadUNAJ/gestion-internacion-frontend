export const crearTarjetaCama = (cama) => {
    let colorInsignia = 'bg-secondary';
    let icono = 'bi-hospital';

    switch (cama.estado) {
        case 'Disponible': 
            colorInsignia = 'bg-success'; 
            icono = 'bi-check-circle-fill'; 
            break;
        case 'Ocupada': 
            colorInsignia = 'bg-danger'; 
            icono = 'bi-person-bed'; 
            break;
        case 'Limpieza': 
            colorInsignia = 'bg-warning text-dark'; 
            icono = 'bi-stars'; 
            break;
        case 'Mantenimiento': 
            colorInsignia = 'bg-secondary'; 
            icono = 'bi-tools'; 
            break;
    }

    const infoPaciente = cama.pacienteAsignado
        ? `<p class="mb-0 mt-3 small fw-semibold text-oscuro"><i class="bi bi-person-fill me-1"></i>${cama.pacienteAsignado}</p>`
        : `<p class="mb-0 mt-3 small text-muted fst-italic">Sin paciente</p>`;

    return `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <div class="card h-100 border-0 shadow-sm text-center pt-3" style="border-radius: 12px; transition: transform 0.2s;">
                <div class="card-body">
                    <h4 class="fw-bold text-oscuro mb-2">Cama ${cama.numero}</h4>
                    <span class="badge ${colorInsignia} rounded-pill px-3 py-2 shadow-sm">
                        <i class="bi ${icono} me-1"></i> ${cama.estado}
                    </span>
                    ${infoPaciente}
                </div>
                <div class="card-footer bg-white border-0 pb-3">
                    <button class="btn btn-outline-primary btn-sm rounded-pill w-100 fw-bold" data-cama-id="${cama.camaId}">
                        Gestionar
                    </button>
                </div>
            </div>
        </div>
    `;
};