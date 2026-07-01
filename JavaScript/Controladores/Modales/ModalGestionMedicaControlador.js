// JavaScript/Controladores/Modales/ModalGestionMedicaControlador.js
import { MedicoServicio } from '../../Servicios/MedicoServicio.js';
import { abrirModalValidacionIA } from './ModalValidacionIAControlador.js';

export const abrirModalGestionMedica = (internacionId, nombrePaciente, pacienteId) => {
    const modalElemento = document.getElementById('modalGestionMedica');
    const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElemento);

    // ======================================================
    // Configurar cabecera
    // ======================================================

    document.getElementById('modal-medico-internacion-id').value = internacionId;
    document.getElementById('lbl-medico-paciente').textContent = nombrePaciente;

    // ======================================================
    // Resetear pestañas y formularios
    // ======================================================

    // Ahora el flujo comienza mostrando la Historia Clínica
    document.getElementById('tab-historia').click();
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

    // ======================================================
    // Fechas por defecto
    // ======================================================

    const fechaInicio = new Date();
    fechaInicio.setMinutes(fechaInicio.getMinutes() + 3 - fechaInicio.getTimezoneOffset());

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 1);

    document.getElementById('input-fecha-inicio').value = fechaInicio.toISOString().slice(0, 16);
    document.getElementById('input-fecha-fin').value = fechaFin.toISOString().slice(0, 16);

    modalBootstrap.show();

    // ======================================================
    // CU-08 - Cargar Historia Clínica
    // ======================================================

    const cargarHistoria = async () => {

        const divCargando = document.getElementById('hc-cargando');
        const divSinDatos = document.getElementById('hc-sin-datos');
        const divContenido = document.getElementById('hc-contenido');

        divCargando.classList.remove('d-none');
        divSinDatos.classList.add('d-none');
        divContenido.classList.add('d-none');

        try {

            const hc = await MedicoServicio.obtenerHistoriaClinica(pacienteId);

            divCargando.classList.add('d-none');

            if (!hc) {
                divSinDatos.classList.remove('d-none');
                return;
            }

            document.getElementById('hc-sangre').textContent =
                hc.grupoSanguineo || 'No especificado';

            document.getElementById('hc-alergias').textContent =
                hc.alergias || 'Ninguna registrada';

            document.getElementById('hc-antecedentes').textContent =
                hc.antecedentes || 'Sin antecedentes';

            // -----------------------------
            // Tratamientos activos
            // -----------------------------

            const listaTratamientos = document.getElementById('hc-lista-tratamientos');

            if (hc.tratamientosActivos && hc.tratamientosActivos.length > 0) {

                listaTratamientos.innerHTML = hc.tratamientosActivos.map(t => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold">${t.medicamento}</span><br>
                            <small class="text-muted">
                                ${t.dosis} ${t.unidadMedida} - ${t.frecuencia}
                            </small>
                        </div>

                        <span class="badge bg-success rounded-pill">
                            Activo
                        </span>
                    </li>
                `).join('');

            } else {

                listaTratamientos.innerHTML =
                    '<li class="list-group-item text-muted small">Sin tratamientos activos.</li>';

            }

            // -----------------------------
            // Diagnósticos
            // -----------------------------

            const listaDiagnosticos = document.getElementById('hc-lista-diagnosticos');

            if (hc.diagnosticos && hc.diagnosticos.length > 0) {

                listaDiagnosticos.innerHTML = hc.diagnosticos.map(d => `
                    <li class="list-group-item">
                        <span class="fw-bold text-oscuro">
                            ${d.codigoCie10}
                        </span>
                        -
                        <small class="text-muted">
                            ${d.descripcion || 'Sin detalle'}
                        </small>
                    </li>
                `).join('');

            } else {

                listaDiagnosticos.innerHTML =
                    '<li class="list-group-item text-muted small">Sin diagnósticos previos.</li>';

            }

            divContenido.classList.remove('d-none');

        }
        catch (error) {

            divCargando.classList.add('d-none');

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la historia clínica.'
            });

        }

    };

    cargarHistoria();

    // ======================================================
    // CU-09 - Registrar Diagnóstico
    // ======================================================

    const btnDiag = document.getElementById('btn-guardar-diagnostico');
    const btnDiagNuevo = btnDiag.cloneNode(true);
    btnDiag.parentNode.replaceChild(btnDiagNuevo, btnDiag);

    btnDiagNuevo.addEventListener('click', async () => {

        const internacion = document.getElementById('modal-medico-internacion-id').value;
        const medicoId = sessionStorage.getItem('entidadAsociadaId');

        const cie10 = document.getElementById('input-cie10').value.trim();
        const obs = document.getElementById('input-obs-diagnostico').value.trim();

        if (!cie10) {
            return Swal.fire({
                icon: 'warning',
                title: 'Faltan datos',
                text: 'Ingrese el código CIE-10.'
            });
        }

        btnDiagNuevo.disabled = true;
        btnDiagNuevo.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span> Guardando...';

        try {

            const respuesta = await MedicoServicio.registrarDiagnostico(
                internacion,
                medicoId,
                cie10,
                obs
            );

            document.getElementById('modal-medico-diagnostico-id').value =
                respuesta.diagnosticoId;

            Swal.fire({
                icon: 'success',
                title: 'Diagnóstico Registrado',
                text: 'Ahora puede proceder a prescribir el tratamiento.',
                timer: 2000,
                showConfirmButton: false
            });

            const tabTratamiento = document.getElementById('tab-tratamiento');
            tabTratamiento.classList.remove('disabled');
            tabTratamiento.click();

        }
        catch (error) {

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });

        }
        finally {

            btnDiagNuevo.disabled = false;
            btnDiagNuevo.innerHTML = 'Guardar Diagnóstico';

        }

    });

    // ======================================================
    // CU-11 y CU-12 - Prescribir Tratamiento
    // ======================================================

    const btnPrescribir = document.getElementById('btn-prescribir');
    const btnPrescribirNuevo = btnPrescribir.cloneNode(true);
    btnPrescribir.parentNode.replaceChild(btnPrescribirNuevo, btnPrescribir);

    btnPrescribirNuevo.addEventListener('click', async () => {

        const diagnosticoId = document.getElementById('modal-medico-diagnostico-id').value;

        const solicitud = {
            diagnosticoId: diagnosticoId,
            medicamentoId: document.getElementById('select-medicamento').value,
            unidadMedidaId: document.getElementById('select-unidad').value,
            frecuenciaAdministracionId: document.getElementById('select-frecuencia').value,
            dosis: parseFloat(document.getElementById('input-dosis').value),
            fechaInicio: document.getElementById('input-fecha-inicio').value
                ? new Date(document.getElementById('input-fecha-inicio').value).toISOString()
                : null,
            fechaFin: document.getElementById('input-fecha-fin').value
                ? new Date(document.getElementById('input-fecha-fin').value).toISOString()
                : null,
            observaciones: 'Prescrito desde Centro de Comando Médico',
            omitirValidacionIA: document.getElementById('switch-omitir-ia').checked
        };

        if (
            !solicitud.medicamentoId ||
            !solicitud.unidadMedidaId ||
            !solicitud.frecuenciaAdministracionId ||
            !solicitud.dosis
        ) {
            return Swal.fire({
                icon: 'warning',
                title: 'Faltan datos',
                text: 'Complete todos los campos obligatorios de la receta.'
            });
        }

        btnPrescribirNuevo.disabled = true;
        btnPrescribirNuevo.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span> Analizando y Prescribiendo...';

        try {

            const respuesta = await MedicoServicio.prescribirTratamiento(solicitud);

            // Cerramos el modal actual
            modalBootstrap.hide();

            // Si la IA requiere intervención del médico
            if (respuesta.estado === 'PendienteValidacion' && respuesta.analisisIA) {

                abrirModalValidacionIA(
                    respuesta.tratamientoId,
                    respuesta.analisisIA,
                    solicitud
                );

            } else {

                Swal.fire({
                    icon: 'success',
                    title: 'Prescripción Exitosa',
                    text: 'El tratamiento ha sido recetado y enviado a enfermería.',
                    timer: 2000,
                    showConfirmButton: false
                });

            }

        }
        catch (error) {

            Swal.fire({
                icon: 'error',
                title: 'Error al prescribir',
                text: error.message
            });

        }
        finally {

            btnPrescribirNuevo.disabled = false;
            btnPrescribirNuevo.innerHTML =
                '<i class="bi bi-send-check me-2"></i>Emitir Prescripción';

        }

    });

};