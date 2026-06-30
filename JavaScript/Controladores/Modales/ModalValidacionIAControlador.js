// JavaScript/Controladores/Modales/ModalValidacionIAControlador.js
import { MedicoServicio } from '../../Servicios/MedicoServicio.js';

export const abrirModalValidacionIA = (tratamientoId, analisisIA, solicitudOriginal) => {
    const modalElemento = document.getElementById('modalValidacionIA');
    const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElemento);

    // Mapear elementos del DOM
    const header = document.getElementById('ia-modal-header');
    const lblRiesgo = document.getElementById('ia-nivel-riesgo');
    const iconoRiesgo = document.getElementById('ia-icono-riesgo');
    const txtResumen = document.getElementById('ia-resumen-clinico');
    const contenedorAlertas = document.getElementById('ia-contenedor-alertas');
    const listaAlertas = document.getElementById('ia-lista-alertas');
    const contenedorSugerencia = document.getElementById('ia-contenedor-sugerencia');
    const txtSugerencia = document.getElementById('ia-texto-sugerencia');
    const contenedorJustificacion = document.getElementById('ia-contenedor-justificacion');
    const inputJustificacion = document.getElementById('ia-input-justificacion');

    const btnMostrarJust = document.getElementById('btn-ia-mostrar-justificacion');
    const btnConfirmarForzado = document.getElementById('btn-ia-confirmar-forzado');
    const btnConfirmarSeguro = document.getElementById('btn-ia-confirmar-seguro');

    // 1. Resetear el estado visual del modal
    inputJustificacion.value = '';
    contenedorJustificacion.classList.add('d-none');
    btnMostrarJust.classList.add('d-none');
    btnConfirmarForzado.classList.add('d-none');
    btnConfirmarSeguro.classList.add('d-none');
    contenedorAlertas.classList.add('d-none');
    contenedorSugerencia.classList.add('d-none');
    
    header.classList.remove('bg-success', 'bg-warning', 'bg-danger');
    lblRiesgo.className = 'fw-bold mb-0 '; // Limpiar clases previas

    // 2. Inyectar datos base
    lblRiesgo.textContent = analisisIA.nivelRiesgo;
    txtResumen.textContent = analisisIA.resumenClinico || 'Sin contexto clínico disponible.';

    // 3. Pintar según Nivel de Riesgo
    if (analisisIA.nivelRiesgo === 'Bajo') {
        header.classList.add('bg-success');
        lblRiesgo.classList.add('text-success');
        iconoRiesgo.className = 'bi bi-shield-check fs-1 text-success';
        btnConfirmarSeguro.classList.remove('d-none'); // Todo bien, botón verde habilitado
    } else if (analisisIA.nivelRiesgo === 'Medio') {
        header.classList.add('bg-warning');
        lblRiesgo.classList.add('text-warning');
        iconoRiesgo.className = 'bi bi-shield-exclamation fs-1 text-warning';
        btnMostrarJust.classList.remove('d-none'); // Requiere justificar para forzar
    } else {
        header.classList.add('bg-danger');
        lblRiesgo.classList.add('text-danger');
        iconoRiesgo.className = 'bi bi-shield-x fs-1 text-danger';
        btnMostrarJust.classList.remove('d-none'); // Riesgo alto/crítico
    }

    // 4. Dibujar Alertas si existen
    if (analisisIA.alertas && analisisIA.alertas.length > 0) {
        contenedorAlertas.classList.remove('d-none');
        listaAlertas.innerHTML = analisisIA.alertas.map(a => 
            `<li class="list-group-item border-start border-4 border-danger">
                <strong>${a.tipo} (${a.severidad}):</strong> ${a.descripcion}
            </li>`
        ).join('');
    }

    // 5. Dibujar Sugerencia si existe
    if (analisisIA.sugerencia && analisisIA.sugerencia.aplicar) {
        contenedorSugerencia.classList.remove('d-none');
        txtSugerencia.innerHTML = `<strong>Alternativa propuesta:</strong> ${analisisIA.sugerencia.medicamentoAlternativo || 'Ajuste de dosis'}<br>
                                   <strong>Motivo:</strong> ${analisisIA.sugerencia.justificacion || '-'}`;
    }

    modalBootstrap.show();

    // --- EVENTOS DE LOS BOTONES --- (Usamos cloneNode para limpiar eventos viejos)
    const btnCancelar = document.getElementById('btn-ia-cancelar');
    const btnCancelarNuevo = btnCancelar.cloneNode(true);
    btnCancelar.parentNode.replaceChild(btnCancelarNuevo, btnCancelar);

    const btnMostrarJustNuevo = btnMostrarJust.cloneNode(true);
    btnMostrarJust.parentNode.replaceChild(btnMostrarJustNuevo, btnMostrarJust);

    const btnConfirmarForzadoNuevo = btnConfirmarForzado.cloneNode(true);
    btnConfirmarForzado.parentNode.replaceChild(btnConfirmarForzadoNuevo, btnConfirmarForzado);

    const btnConfirmarSeguroNuevo = btnConfirmarSeguro.cloneNode(true);
    btnConfirmarSeguro.parentNode.replaceChild(btnConfirmarSeguroNuevo, btnConfirmarSeguro);

    // Acción: Cancelar
    btnCancelarNuevo.addEventListener('click', async () => {
        try {
            await MedicoServicio.cancelarTratamiento(tratamientoId);
            modalBootstrap.hide();
            Swal.fire({ icon: 'info', title: 'Tratamiento Cancelado', text: 'Se ha cancelado la prescripción por precaución.', timer: 2000, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    });

    // Acción: Desbloquear Forzado
    btnMostrarJustNuevo.addEventListener('click', () => {
        contenedorJustificacion.classList.remove('d-none');
        btnMostrarJustNuevo.classList.add('d-none');
        btnConfirmarForzadoNuevo.classList.remove('d-none');
    });

    // Lógica común de confirmación (Para Seguro o Forzado)
    const ejecutarConfirmacion = async (fueForzado) => {
        const justificacion = inputJustificacion.value.trim();
        
        if (fueForzado && !justificacion) {
            return Swal.fire({ icon: 'warning', title: 'Requerido', text: 'Debe redactar la justificación clínica para forzar el tratamiento.' });
        }

        // Armamos el payload mezclando los datos originales con la justificación
        const payloadConfirmacion = {
            ...solicitudOriginal, // Copiamos medicamento, dosis, fechas, etc.
            fueForzado: fueForzado,
            justificacionClinica: justificacion || null
        };

        try {
            await MedicoServicio.confirmarTratamiento(tratamientoId, payloadConfirmacion);
            modalBootstrap.hide();
            Swal.fire({ icon: 'success', title: 'Tratamiento Confirmado', text: 'Enviado exitosamente a enfermería.', timer: 2000, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    };

    // Asignar eventos de confirmación
    btnConfirmarSeguroNuevo.addEventListener('click', () => ejecutarConfirmacion(false));
    btnConfirmarForzadoNuevo.addEventListener('click', () => ejecutarConfirmacion(true));
};