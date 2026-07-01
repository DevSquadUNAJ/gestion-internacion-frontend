// JavaScript/Controladores/Modales/ModalGestionCamaControlador.js
import { AdmisionServicio } from '../../Servicios/AdmisionServicio.js';

export const abrirModalGestionCama = (camaId, internacionId, estadoActual, callbackRecargarCamas, accion) => {
    const modalElemento = document.getElementById('modalGestionarCama');
    const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElemento);

    // 1. Preparar el DOM base
    document.getElementById('modal-cama-id').value = camaId;
    document.getElementById('modal-internacion-id').value = internacionId;
    
    const formCambiarEstado = document.getElementById('form-cambiar-estado');
    const seccionCamaOcupada = document.getElementById('acciones-cama-ocupada');
    const btnGuardarActual = document.getElementById('btn-guardar-estado'); 
    const seccionCamaDisponible = document.getElementById('acciones-cama-disponible');

    // 2. Mutación inicial base de Interfaz según Estado
    if (estadoActual === 'Ocupada') {
        seccionCamaDisponible.classList.add('d-none');
        formCambiarEstado.classList.add('d-none');
        btnGuardarActual.classList.add('d-none');
        seccionCamaOcupada.classList.remove('d-none');

        // Mostramos el bloque contenedor para que los botones existan en el DOM
        document.getElementById('bloque-botones-ocupada').classList.remove('d-none');
        document.getElementById('formulario-traslado').classList.add('d-none');
        
        // Restauramos visibilidad por defecto para limpiar estados de aperturas previas
        document.getElementById('btn-iniciar-traslado').classList.remove('d-none');
        document.getElementById('btn-procesar-alta').classList.remove('d-none');

    } else if (estadoActual === 'Disponible') {
        seccionCamaOcupada.classList.add('d-none');
        
        if (accion === 'internar') {
            formCambiarEstado.classList.add('d-none');
            btnGuardarActual.classList.add('d-none');
            seccionCamaDisponible.classList.remove('d-none');
        } else if (accion === 'estado') {
            seccionCamaDisponible.classList.add('d-none');
            formCambiarEstado.classList.remove('d-none');
            btnGuardarActual.classList.remove('d-none');
        }
        
        // Resetear datos genéricos del subformulario de ingreso
        document.getElementById('modal-estado-actual').value = estadoActual;
        document.getElementById('select-nuevo-estado').value = "";
        document.getElementById('input-motivo').value = "";
        document.getElementById('input-buscar-dni').value = '';
        document.getElementById('input-motivo-internacion').value = "";
        document.getElementById('tarjeta-paciente-encontrado').classList.add('d-none');
        document.getElementById('btn-registrar-internacion').disabled = true;
    } else {
        // Limpieza / Mantenimiento
        seccionCamaOcupada.classList.add('d-none');
        seccionCamaDisponible.classList.add('d-none'); 
        formCambiarEstado.classList.remove('d-none');
        btnGuardarActual.classList.remove('d-none');
        document.getElementById('modal-estado-actual').value = estadoActual;
        document.getElementById('select-nuevo-estado').value = "";
        document.getElementById('input-motivo').value = "";
    }

    // --- LÓGICA DE UX: Bloquear estados redundantes en el Select ---
    const selectEstado = document.getElementById('select-nuevo-estado');
    Array.from(selectEstado.options).forEach(opcion => {
        if (opcion.value === 'Ocupada') {
            opcion.disabled = true;
            opcion.style.color = '#adb5bd';
            opcion.text = 'Ocupada (Automático al internar)';
        } else if (opcion.value === estadoActual) {
            opcion.disabled = true;
            opcion.style.color = '#adb5bd';
            opcion.text = `${opcion.value} (Estado Actual)`;
        } else {
            opcion.disabled = false;
            opcion.style.color = '';
            opcion.text = opcion.value;
        }
    });

    // =========================================================================
    // ATAR LISTENERS DE ACCIONES (Tus funciones de guardado se mantienen aquí)
    // =========================================================================

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
        modalBootstrap.hide(); // Al presionar cancelar, cerramos el flujo directo
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

    // --- LÓGICA CU-01: BUSCAR PACIENTE ---
    const btnBuscarPaciente = document.getElementById('btn-buscar-paciente');
    const btnBuscarNuevo = btnBuscarPaciente.cloneNode(true);
    btnBuscarPaciente.parentNode.replaceChild(btnBuscarNuevo, btnBuscarPaciente);

    btnBuscarNuevo.addEventListener('click', async () => {
        const dni = document.getElementById('input-buscar-dni').value.trim();
        if (!dni) return Swal.fire({ icon: 'warning', title: 'DNI Requerido', text: 'Ingrese un DNI para buscar.' });

        btnBuscarNuevo.disabled = true;
        btnBuscarNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

        try {
            const paciente = await AdmisionServicio.buscarPacientePorDni(dni);
            if (!paciente) throw new Error("Paciente no encontrado en el sistema.");

            document.getElementById('hidden-paciente-id').value = paciente.pacienteId; 
            document.getElementById('lbl-paciente-nombre').textContent = paciente.nombre;
            
            // --- NUEVA VALIDACIÓN PROACTIVA ---
            // IMPORTANTE: El backend debe enviar la propiedad 'estaInternado' en true/false, o 'internacionActivaId' con datos.
            const yaEstaInternado = paciente.estaInternado || paciente.internacionActivaId || false;

            if (yaEstaInternado) {
                document.getElementById('lbl-paciente-datos').innerHTML = `DNI: ${paciente.dni} <br><span class="badge bg-danger mt-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Paciente ya internado</span>`;
                document.getElementById('btn-registrar-internacion').disabled = true; // Bloqueamos el botón
            } else {
                document.getElementById('lbl-paciente-datos').textContent = `DNI: ${paciente.dni}`;
                document.getElementById('btn-registrar-internacion').disabled = false; // Habilitamos el botón
            }

            document.getElementById('tarjeta-paciente-encontrado').classList.remove('d-none');

        } catch (error) {
            document.getElementById('tarjeta-paciente-encontrado').classList.add('d-none');
            document.getElementById('btn-registrar-internacion').disabled = true;
            Swal.fire({ icon: 'error', title: 'Búsqueda fallida', text: error.message });
        } finally {
            btnBuscarNuevo.disabled = false;
            btnBuscarNuevo.innerHTML = '<i class="bi bi-search"></i> Buscar';
        }
    });

    // --- LÓGICA CU-01: REGISTRAR INTERNACIÓN ---
    const btnRegistrar = document.getElementById('btn-registrar-internacion');
    const btnRegistrarNuevo = btnRegistrar.cloneNode(true);
    btnRegistrar.parentNode.replaceChild(btnRegistrarNuevo, btnRegistrar);

    btnRegistrarNuevo.addEventListener('click', async () => {
        const camaId = document.getElementById('modal-cama-id').value;
        const pacienteId = document.getElementById('hidden-paciente-id').value;
        const motivo = document.getElementById('input-motivo-internacion').value;

        if (!motivo.trim()) return Swal.fire({ icon: 'warning', title: 'Falta Motivo', text: 'El motivo de internación es obligatorio.' });

        btnRegistrarNuevo.disabled = true;
        btnRegistrarNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Registrando...';

        try {
            await AdmisionServicio.registrarInternacion(pacienteId, camaId, motivo);
            
            modalBootstrap.hide();
            Swal.fire({ icon: 'success', title: 'Internación Registrada', text: 'El paciente fue internado exitosamente.', timer: 2000, showConfirmButton: false });
            callbackRecargarCamas();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al internar', text: error.message });
        } finally {
            btnRegistrarNuevo.disabled = false;
            btnRegistrarNuevo.innerHTML = '<i class="bi bi-clipboard2-pulse-fill me-2"></i>Registrar Internación';
        }
    });

    // =========================================================================
    // ¡LA SOLUCIÓN DE ENRUTAMIENTO DIRECTO AL FINAL DEL ARCHIVO!
    // =========================================================================
    if (estadoActual === 'Ocupada') {
        if (accion === 'alta') {
            // Escondemos SOLAMENTE el botón de inicio de traslado intermedio
            document.getElementById('btn-iniciar-traslado').classList.add('d-none');
            document.getElementById('formulario-traslado').classList.add('d-none');
            // El botón de "Procesar Alta Médica" queda perfectamente visible
        } else if (accion === 'trasladar') {
            // Disparamos el click programático sobre el botón NUEVO ya clonado con sus listeners activos
            const btnIniciarTrasladoActivo = document.getElementById('btn-iniciar-traslado');
            if (btnIniciarTrasladoActivo) {
                btnIniciarTrasladoActivo.click(); // Esto disparará la carga de sectores de la API perfectamente
            }
        }
    }

    modalBootstrap.show();
};