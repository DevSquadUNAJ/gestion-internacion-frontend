import { EnfermeriaServicio } from '../../Servicios/EnfermeriaServicio.js';

export const abrirModalGestionDosis = (dosisId, medicamento, paciente, callbackRecargar) => {
    const modalElemento = document.getElementById('modalGestionDosis');
    const modalBootstrap = new bootstrap.Modal(modalElemento);

    // Llenar datos de la cabecera
    document.getElementById('modal-dosis-id').value = dosisId;
    document.getElementById('lbl-dosis-medicamento').textContent = medicamento;
    document.getElementById('lbl-dosis-paciente').innerHTML = `<i class="bi bi-person-fill me-1"></i> ${paciente}`;

    // Resetear formulario a estado inicial (Administrar)
    const selectAccion = document.getElementById('select-accion-dosis');
    selectAccion.value = 'administrar';
    
    document.getElementById('seccion-administrar-dosis').classList.remove('d-none');
    document.getElementById('seccion-omitir-dosis').classList.add('d-none');

    // Setear la fecha actual por defecto en el datetime-local
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset()); // Ajuste de zona horaria para datetime-local
    document.getElementById('input-fecha-suministro').value = ahora.toISOString().slice(0,16);
    
    document.getElementById('input-obs-administrar').value = '';
    document.getElementById('select-motivo-omision').value = '';
    document.getElementById('input-obs-omitir').value = '';

    modalBootstrap.show();

    // --- LÓGICA DE MUTACIÓN DE INTERFAZ (Tabs) ---
    const selectAccionNuevo = selectAccion.cloneNode(true);
    selectAccion.parentNode.replaceChild(selectAccionNuevo, selectAccion);

    selectAccionNuevo.addEventListener('change', (e) => {
        if (e.target.value === 'administrar') {
            document.getElementById('seccion-administrar-dosis').classList.remove('d-none');
            document.getElementById('seccion-omitir-dosis').classList.add('d-none');
        } else {
            document.getElementById('seccion-administrar-dosis').classList.add('d-none');
            document.getElementById('seccion-omitir-dosis').classList.remove('d-none');
        }
    });

    // --- LÓGICA DE GUARDADO ---
    const btnGuardar = document.getElementById('btn-guardar-dosis');
    const btnGuardarNuevo = btnGuardar.cloneNode(true);
    btnGuardar.parentNode.replaceChild(btnGuardarNuevo, btnGuardar);

    btnGuardarNuevo.addEventListener('click', async () => {
        const accion = document.getElementById('select-accion-dosis').value;
        const idDosis = document.getElementById('modal-dosis-id').value;
        const enfermeraId = sessionStorage.getItem('entidadAsociadaId');

        btnGuardarNuevo.disabled = true;
        btnGuardarNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

        try {
            if (accion === 'administrar') {
                // CU-16: Administrar
                const fecha = document.getElementById('input-fecha-suministro').value;
                const obs = document.getElementById('input-obs-administrar').value;
                
                if (!fecha) throw new Error('La fecha y hora de suministro es obligatoria.');
                
                // Convertir la fecha local al estándar UTC ISO para el backend
                const fechaIso = new Date(fecha).toISOString();
                
                await EnfermeriaServicio.registrarAdministracion(enfermeraId, idDosis, fechaIso, obs);
                Swal.fire({ icon: 'success', title: 'Dosis Administrada', text: 'Se ha registrado la administración exitosamente.', timer: 2000, showConfirmButton: false });
                
            } else {
                // CU-17: Omitir
                const motivo = document.getElementById('select-motivo-omision').value;
                const obs = document.getElementById('input-obs-omitir').value;

                if (!motivo) throw new Error('Debe seleccionar un motivo para la omisión.');

                await EnfermeriaServicio.registrarOmision(enfermeraId, idDosis, motivo, obs);
                Swal.fire({ icon: 'success', title: 'Dosis Omitida', text: 'Se ha registrado la omisión y notificado al médico.', timer: 2000, showConfirmButton: false });
            }

            modalBootstrap.hide();
            callbackRecargar(); // Refrescar el tablero

        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al registrar', text: error.message });
        } finally {
            btnGuardarNuevo.disabled = false;
            btnGuardarNuevo.innerHTML = 'Confirmar Registro';
        }
    });
};