import { EnfermeriaServicio } from '../Servicios/EnfermeriaServicio.js';

export const inicializarDashboardEnfermeria = async () => {
    const contenedor = document.getElementById('contenedor-dinamico');
    const tituloPantalla = document.getElementById('titulo-pantalla');

    tituloPantalla.innerHTML = `<i class="bi bi-heart-pulse-fill text-danger me-2"></i>Panel de Enfermería`;

    // Obtenemos el ID de la enfermera que guardamos en el login
    const enfermeraId = sessionStorage.getItem('entidadAsociadaId');

    if (!enfermeraId) {
        contenedor.innerHTML = `<div class="alert alert-danger shadow-sm">Error: No se encontró el identificador de la enfermera en la sesión.</div>`;
        return;
    }

    contenedor.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-danger" role="status"></div><p class="text-muted mt-2">Cargando tareas pendientes...</p></div>`;

    try {
        const tareas = await EnfermeriaServicio.obtenerPanelControl(enfermeraId);

        if (!tareas || tareas.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-success shadow-sm border-0 bg-success bg-opacity-10 d-flex align-items-center">
                    <i class="bi bi-check-circle-fill fs-3 text-success me-3"></i>
                    <div>
                        <h5 class="mb-1 fw-bold text-success">¡Excelente trabajo!</h5>
                        <p class="mb-0">No hay dosis pendientes de administración en tu sector en este momento.</p>
                    </div>
                </div>`;
            return;
        }

        // Lógica CU-15: Ordenar tareas (Atrasadas primero, luego por hora más próxima)
        const ahora = new Date();
        tareas.sort((a, b) => new Date(a.fechaProgramada) - new Date(b.fechaProgramada));

        let htmlTareas = '<div class="row">';
        
        tareas.forEach(tarea => {
            const fechaProg = new Date(tarea.fechaProgramada);
            const estaAtrasada = fechaProg < ahora;
            
            // Colores semánticos según prioridad/atraso
            const colorBorde = estaAtrasada ? 'border-danger' : 'border-primary';
            const colorInsignia = estaAtrasada ? 'bg-danger' : 'bg-primary';
            const textoAtraso = estaAtrasada ? '<span class="text-danger fw-bold small ms-2"><i class="bi bi-exclamation-triangle-fill"></i> ¡ATRASADA!</span>' : '';

            // Formatear hora (Ej: 14:30)
            const horaFormateada = fechaProg.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            htmlTareas += `
                <div class="col-12 col-xl-6 mb-3">
                    <div class="card shadow-sm border-0 border-start border-5 ${colorBorde} h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="fw-bold text-oscuro mb-0">
                                    <i class="bi bi-capsule me-2 text-secondary"></i>${tarea.medicamento}
                                </h5>
                                <span class="badge ${colorInsignia} fs-6 shadow-sm"><i class="bi bi-clock me-1"></i> ${horaFormateada}</span>
                            </div>
                            
                            <hr class="text-muted">
                            
                            <div class="row align-items-center">
                                <div class="col-8">
                                    <p class="mb-1 text-oscuro fw-semibold"><i class="bi bi-person-fill me-2"></i>${tarea.paciente || 'Paciente Desconocido'}</p>
                                    <p class="mb-0 text-muted small"><i class="bi bi-hospital me-2"></i>Cama ${tarea.numeroCama} ${textoAtraso}</p>
                                </div>
                                <div class="col-4 text-end">
                                    <button class="btn btn-outline-danger btn-sm rounded-pill fw-bold" 
                                            data-dosis-id="${tarea.dosisId}"
                                            data-medicamento="${tarea.medicamento}"
                                            data-paciente="${tarea.paciente}">
                                        Gestionar Dosis
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        htmlTareas += '</div>';
        contenedor.innerHTML = htmlTareas;

        // Aquí luego ataremos los eventos del botón "Gestionar Dosis" para los CU-16 y CU-17

    } catch (error) {
        contenedor.innerHTML = `<div class="alert alert-danger shadow-sm"><i class="bi bi-exclamation-triangle-fill me-2"></i> Error: ${error.message}</div>`;
    }
};