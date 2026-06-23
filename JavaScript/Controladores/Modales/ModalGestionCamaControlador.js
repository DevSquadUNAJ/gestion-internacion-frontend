// JavaScript/Controladores/Modales/ModalGestionCamaControlador.js
import { AdmisionServicio } from '../../Servicios/AdmisionServicio.js';

export const abrirModalGestionCama = (camaId, internacionId, estadoActual, callbackRecargarCamas) => {
    const modalElemento = document.getElementById('modalGestionarCama');
    const modalBootstrap = new bootstrap.Modal(modalElemento);

    // 1. Preparar el DOM base
    document.getElementById('modal-cama-id').value = camaId;
    document.getElementById('modal-internacion-id').value = internacionId;
    
    const formCambiarEstado = document.getElementById('form-cambiar-estado');
    const seccionCamaOcupada = document.getElementById('acciones-cama-ocupada');
    const btnGuardarActual = document.getElementById('btn-guardar-estado'); 

    // 2. Mutación de Interfaz según Estado
    if (estadoActual === 'Ocupada') {
        document.getElementById('bloque-botones-ocupada').classList.remove('d-none');
        document.getElementById('formulario-traslado').classList.add('d-none');
        formCambiarEstado.classList.add('d-none');
        btnGuardarActual.classList.add('d-none');
        seccionCamaOcupada.classList.remove('d-none');
    } else {
        seccionCamaOcupada.classList.add('d-none');
        formCambiarEstado.classList.remove('d-none');
        btnGuardarActual.classList.remove('d-none');
        document.getElementById('modal-estado-actual').value = estadoActual;
        document.getElementById('select-nuevo-estado').value = "";
        document.getElementById('input-motivo').value = "";
    }

    modalBootstrap.show();

    // --- LÓGICA CU-02: CAMBIAR ESTADO ---
    const btnGuardarViejo = document.getElementById('btn-guardar-estado');
    const btnGuardarNuevo = btnGuardarViejo.cloneNode(true);
    btnGuardarViejo.parentNode.replaceChild(btnGuardarNuevo, btnGuardarViejo);

    btnGuardarNuevo.addEventListener('click', async () => {
        const idCama = document.getElementById('modal-cama-id').value;
        const nuevoEstado = document.getElementById('select-nuevo-estado').value;
        const motivo = document.getElementById('input-motivo').value;

        if (!nuevoEstado) return Swal.fire({ icon: 'warning', title: 'Atención', text: 'Seleccione un estado.' });

        btnGuardarNuevo.disabled = true;
        btnGuardarNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

        try {
            await AdmisionServicio.cambiarEstadoCama(idCama, nuevoEstado, motivo);
            modalBootstrap.hide();
            Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Estado cambiado con éxito.', timer: 1500, showConfirmButton: false });
            callbackRecargarCamas();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            btnGuardarNuevo.disabled = false;
            btnGuardarNuevo.innerHTML = 'Guardar Cambios';
        }
    });

    // --- LÓGICA CU-04: PROCESAR ALTA ---
    const btnAltaViejo = document.getElementById('btn-procesar-alta');
    const btnAltaNuevo = btnAltaViejo.cloneNode(true);
    btnAltaViejo.parentNode.replaceChild(btnAltaNuevo, btnAltaViejo);

    btnAltaNuevo.addEventListener('click', async () => {
        const idInternacion = document.getElementById('modal-internacion-id').value;
        if (!idInternacion) return Swal.fire({ icon: 'error', title: 'Error', text: 'No hay ID de internación.'});

        const confirmacion = await Swal.fire({
            title: '¿Confirmar Alta Médica?', text: "La cama pasará a Limpieza.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: 'var(--color-primario)', cancelButtonColor: 'var(--color-peligro)',
            confirmButtonText: 'Sí, procesar alta', cancelButtonText: 'Cancelar'
        });

        if (confirmacion.isConfirmed) {
            btnAltaNuevo.disabled = true;
            btnAltaNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
            try {
                await AdmisionServicio.procesarAltaInternacion(idInternacion);
                modalBootstrap.hide();
                Swal.fire({ icon: 'success', title: 'Alta Procesada', timer: 2000, showConfirmButton: false });
                callbackRecargarCamas();
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message });
            } finally {
                btnAltaNuevo.disabled = false;
                btnAltaNuevo.innerHTML = '<i class="bi bi-person-walking me-2"></i> Procesar Alta Médica';
            }
        }
    });

    // --- LÓGICA CU-03: TRASLADO ---
    const btnIniciarTraslado = document.getElementById('btn-iniciar-traslado');
    const btnIniciarNuevo = btnIniciarTraslado.cloneNode(true);
    btnIniciarTraslado.parentNode.replaceChild(btnIniciarNuevo, btnIniciarTraslado);

    btnIniciarNuevo.addEventListener('click', async () => {
        document.getElementById('bloque-botones-ocupada').classList.add('d-none');
        document.getElementById('formulario-traslado').classList.remove('d-none');
        
        const selectSectorActivo = document.getElementById('select-traslado-sector');
        const selectCamaActiva = document.getElementById('select-traslado-cama');
        
        selectSectorActivo.innerHTML = '<option value="" selected disabled>Cargando sectores...</option>';
        selectCamaActiva.innerHTML = '<option value="" selected disabled>Seleccione primero un sector...</option>';
        selectCamaActiva.disabled = true;
        document.getElementById('input-traslado-motivo').value = "";

        try {
            const sectores = await AdmisionServicio.obtenerSectores();
            selectSectorActivo.innerHTML = '<option value="" selected disabled>Seleccione un sector...</option>';
            sectores.forEach(sec => selectSectorActivo.innerHTML += `<option value="${sec.sectorId}">${sec.nombre} (Piso ${sec.piso})</option>`);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar sectores.' });
        }
    });

    const selectTrasladoSector = document.getElementById('select-traslado-sector');
    const selectSectorNuevo = selectTrasladoSector.cloneNode(true);
    selectTrasladoSector.parentNode.replaceChild(selectSectorNuevo, selectTrasladoSector);
    
    selectSectorNuevo.addEventListener('change', async (e) => {
        const sectorDestinoId = e.target.value;
        const selectCamaActiva = document.getElementById('select-traslado-cama');
        selectCamaActiva.innerHTML = '<option value="" selected disabled>Cargando camas...</option>';
        selectCamaActiva.disabled = true;

        try {
            const camas = await AdmisionServicio.obtenerCamasPorSector(sectorDestinoId);
            const camasDisponibles = camas.filter(c => c.estado === 'Disponible');

            if (camasDisponibles.length === 0) {
                selectCamaActiva.innerHTML = '<option value="" selected disabled>No hay camas disponibles</option>';
                return;
            }

            selectCamaActiva.innerHTML = '<option value="" selected disabled>Seleccione una cama...</option>';
            camasDisponibles.sort((a, b) => a.numero - b.numero).forEach(c => selectCamaActiva.innerHTML += `<option value="${c.camaId}">Cama ${c.numero}</option>`);
            selectCamaActiva.disabled = false;
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar camas.' });
        }
    });

    const btnCancelarTraslado = document.getElementById('btn-cancelar-traslado');
    const btnCancelarTrasladoNuevo = btnCancelarTraslado.cloneNode(true);
    btnCancelarTraslado.parentNode.replaceChild(btnCancelarTrasladoNuevo, btnCancelarTraslado);
    btnCancelarTrasladoNuevo.addEventListener('click', () => {
        document.getElementById('formulario-traslado').classList.add('d-none');
        document.getElementById('bloque-botones-ocupada').classList.remove('d-none');
    });

    const btnConfirmarTraslado = document.getElementById('btn-confirmar-traslado');
    const btnConfirmarTrasladoNuevo = btnConfirmarTraslado.cloneNode(true);
    btnConfirmarTraslado.parentNode.replaceChild(btnConfirmarTrasladoNuevo, btnConfirmarTraslado);

    btnConfirmarTrasladoNuevo.addEventListener('click', async () => {
        const idInternacion = document.getElementById('modal-internacion-id').value;
        const camaDestinoId = document.getElementById('select-traslado-cama').value;
        const motivoTraslado = document.getElementById('input-traslado-motivo').value;

        if (!camaDestinoId || !motivoTraslado.trim()) return Swal.fire({ icon: 'warning', title: 'Incompleto', text: 'Complete los datos.' });

        btnConfirmarTrasladoNuevo.disabled = true;
        btnConfirmarTrasladoNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Trasladando...';

        try {
            await AdmisionServicio.trasladarPaciente(idInternacion, camaDestinoId, motivoTraslado);
            modalBootstrap.hide();
            Swal.fire({ icon: 'success', title: 'Trasladado', timer: 2000, showConfirmButton: false });
            callbackRecargarCamas();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            btnConfirmarTrasladoNuevo.disabled = false;
            btnConfirmarTrasladoNuevo.innerHTML = 'Confirmar Traslado';
        }
    });
};