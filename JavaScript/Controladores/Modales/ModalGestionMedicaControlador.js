// JavaScript/Controladores/Modales/ModalGestionMedicaControlador.js
import { MedicoServicio } from '../../Servicios/MedicoServicio.js';

export const abrirModalGestionMedica = (internacionId, nombrePaciente) => {
    const modalElemento = document.getElementById('modalGestionMedica');
    const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElemento);

    // 1. Configurar Cabecera
    document.getElementById('modal-medico-internacion-id').value = internacionId;
    document.getElementById('lbl-medico-paciente').textContent = nombrePaciente;
    
    // 2. Resetear Pestañas y Formularios (Forzar vista de Diagnóstico)
    document.getElementById('tab-diagnostico').click();
    document.getElementById('tab-tratamiento').classList.add('disabled');
    
    document.getElementById('modal-medico-diagnostico-id').value = '';
    document.getElementById('input-cie10').value = '';
    document.getElementById('input-obs-diagnostico').value = '';
    
    // Resetear formulario de prescripción
    document.getElementById('select-medicamento').value = '';
    document.getElementById('input-dosis').value = '';
    document.getElementById('select-unidad').value = '';
    document.getElementById('select-frecuencia').value = '';
    document.getElementById('switch-omitir-ia').checked = false;
    
    // Setear fechas por defecto.
    // Inicio: ahora + 3 minutos.
    // Fin: inicio + 1 día.
    const fechaInicio = new Date();
    fechaInicio.setMinutes(fechaInicio.getMinutes() + 3 - fechaInicio.getTimezoneOffset());

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 1);

    document.getElementById('input-fecha-inicio').value = fechaInicio.toISOString().slice(0, 16);
    document.getElementById('input-fecha-fin').value = fechaFin.toISOString().slice(0, 16);

    modalBootstrap.show();

    // --- LÓGICA CU-09: GUARDAR DIAGNÓSTICO ---
    const btnDiag = document.getElementById('btn-guardar-diagnostico');
    const btnDiagNuevo = btnDiag.cloneNode(true);
    btnDiag.parentNode.replaceChild(btnDiagNuevo, btnDiag);

    btnDiagNuevo.addEventListener('click', async () => {
        const internacion = document.getElementById('modal-medico-internacion-id').value;
        const medicoId = sessionStorage.getItem('entidadAsociadaId'); // ID del médico logueado
        const cie10 = document.getElementById('input-cie10').value.trim();
        const obs = document.getElementById('input-obs-diagnostico').value.trim();

        if (!cie10) return Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Ingrese el código CIE-10.' });

        btnDiagNuevo.disabled = true;
        btnDiagNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

        try {
            const respuesta = await MedicoServicio.registrarDiagnostico(internacion, medicoId, cie10, obs);
            
            // ÉXITO: Guardamos el ID devuelto y habilitamos la Pestaña 2
            document.getElementById('modal-medico-diagnostico-id').value = respuesta.diagnosticoId;
            
            Swal.fire({ icon: 'success', title: 'Diagnóstico Registrado', text: 'Ahora puede proceder a prescribir el tratamiento.', timer: 2000, showConfirmButton: false });
            
            // Habilitamos y saltamos a la pestaña 2 automáticamente
            const tabTratamiento = document.getElementById('tab-tratamiento');
            tabTratamiento.classList.remove('disabled');
            tabTratamiento.click();

        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            btnDiagNuevo.disabled = false;
            btnDiagNuevo.innerHTML = 'Guardar Diagnóstico';
        }
    });

    // --- LÓGICA CU-11 y CU-12: PRESCRIBIR TRATAMIENTO ---
    const btnPrescribir = document.getElementById('btn-prescribir');
    const btnPrescribirNuevo = btnPrescribir.cloneNode(true);
    btnPrescribir.parentNode.replaceChild(btnPrescribirNuevo, btnPrescribir);

    btnPrescribirNuevo.addEventListener('click', async () => {
        const diagnosticoId = document.getElementById('modal-medico-diagnostico-id').value;
        
        // Construimos el JSON basándonos en tu Swagger
        const solicitud = {
            diagnosticoId: diagnosticoId,
            medicamentoId: document.getElementById('select-medicamento').value,
            unidadMedidaId: document.getElementById('select-unidad').value,
            frecuenciaAdministracionId: document.getElementById('select-frecuencia').value,
            dosis: parseFloat(document.getElementById('input-dosis').value),
            fechaInicio: document.getElementById('input-fecha-inicio').value ? new Date(document.getElementById('input-fecha-inicio').value).toISOString() : null,
            fechaFin: document.getElementById('input-fecha-fin').value ? new Date(document.getElementById('input-fecha-fin').value).toISOString() : null,
            observaciones: "Prescrito desde Centro de Comando Médico",
            omitirValidacionIA: document.getElementById('switch-omitir-ia').checked // Aquí viaja tu magia del Camino Rápido
        };

        if (!solicitud.medicamentoId || !solicitud.unidadMedidaId || !solicitud.frecuenciaAdministracionId || !solicitud.dosis) {
            return Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Complete todos los campos obligatorios de la receta.' });
        }

        btnPrescribirNuevo.disabled = true;
        btnPrescribirNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Analizando y Prescribiendo...';

        try {
            const respuesta = await MedicoServicio.prescribirTratamiento(solicitud);
            
            // Cerramos modal y mostramos resultado
            modalBootstrap.hide();

            // Si omitimos IA, la respuesta será directa. Si no, capaz traiga datos de AnalisisIA. 
            // Vamos a mostrar un mensaje genérico por ahora de éxito.
            let mensajeExito = 'El tratamiento ha sido recetado y enviado a enfermería.';
            if (!solicitud.omitirValidacionIA && respuesta.analisisIA) {
                 mensajeExito += `<br><br><b>Validación IA:</b> Nivel de Riesgo ${respuesta.analisisIA.nivelRiesgo}`;
            }

            Swal.fire({ 
                icon: 'success', 
                title: 'Prescripción Exitosa', 
                html: mensajeExito
            });

        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al prescribir', text: error.message });
        } finally {
            btnPrescribirNuevo.disabled = false;
            btnPrescribirNuevo.innerHTML = '<i class="bi bi-send-check me-2"></i>Emitir Prescripción';
        }
    });
};