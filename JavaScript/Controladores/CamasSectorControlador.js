import { AdmisionServicio } from '../Servicios/AdmisionServicio.js';
import { crearTarjetaCama } from '../Componentes/Tarjetas/TarjetaCama.js';

export const inicializarVistaCamas = async (sectorId, nombreSector, callbackVolver) => {
    const contenedor = document.getElementById('contenedor-dinamico');
    const tituloPantalla = document.getElementById('titulo-pantalla');

    tituloPantalla.innerHTML = `
        <button id="btn-volver-sectores" class="btn btn-link text-oscuro p-0 me-2 text-decoration-none shadow-none">
            <i class="bi bi-arrow-left-circle-fill fs-4 text-primary"></i>
        </button>
        Sector: ${nombreSector}
    `;

    document.getElementById('btn-volver-sectores').addEventListener('click', () => {
        callbackVolver();
    });

    // Función interna para cargar y dibujar las camas
    const cargarCamas = async () => {
        contenedor.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="text-muted mt-2">Cargando camas...</p></div>`;
        
        try {
            const camas = await AdmisionServicio.obtenerCamasPorSector(sectorId);

            if (camas.length === 0) {
                contenedor.innerHTML = `<div class="alert alert-warning shadow-sm">Este sector aún no tiene camas configuradas.</div>`;
                return;
            }

            camas.sort((a, b) => a.numero - b.numero);

            let htmlGrilla = '<div class="row">';
            camas.forEach(cama => { htmlGrilla += crearTarjetaCama(cama); });
            htmlGrilla += '</div>';

            contenedor.innerHTML = htmlGrilla;

            // --- LÓGICA DEL MODAL CU-02 ---
            atarEventosGestionarCama(cargarCamas);

        } catch (error) {
            contenedor.innerHTML = `<div class="alert alert-danger shadow-sm"><i class="bi bi-exclamation-triangle-fill me-2"></i> Error: ${error.message}</div>`;
        }
    };

    // Llamamos a la función de carga por primera vez
    await cargarCamas();
};

// Función para inicializar los botones y el Modal
const atarEventosGestionarCama = (callbackRecargarCamas) => {
    const modalElemento = document.getElementById('modalGestionarCama');
    const modalBootstrap = new bootstrap.Modal(modalElemento);

    // Elementos del DOM del Modal
    const formCambiarEstado = document.getElementById('form-cambiar-estado');
    const seccionCamaOcupada = document.getElementById('acciones-cama-ocupada');
    const btnGuardarEstado = document.getElementById('btn-guardar-estado');

    const botonesGestionar = document.querySelectorAll('button[data-cama-id]');
    
    botonesGestionar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const camaId = e.currentTarget.getAttribute('data-cama-id');
            const internacionId = e.currentTarget.getAttribute('data-internacion-id');
            const estadoActual = e.currentTarget.closest('.card').querySelector('.badge').textContent.trim();

            document.getElementById('modal-cama-id').value = camaId;
            document.getElementById('modal-internacion-id').value = internacionId;
            
            // BUSCAMOS EL BOTÓN AQUÍ ADENTRO PARA EVITAR EL ERROR DEL CLON FANTASMA
            const btnGuardarActual = document.getElementById('btn-guardar-estado'); 
            
            if (estadoActual === 'Ocupada') {
                // Modo: Gestión de Paciente
                formCambiarEstado.classList.add('d-none');
                btnGuardarActual.classList.add('d-none'); // Oculta el botón correcto
                seccionCamaOcupada.classList.remove('d-none');
            } else {
                // Modo: Mantenimiento de Cama
                seccionCamaOcupada.classList.add('d-none');
                formCambiarEstado.classList.remove('d-none');
                btnGuardarActual.classList.remove('d-none'); // Muestra el botón correcto
                
                document.getElementById('modal-estado-actual').value = estadoActual;
                document.getElementById('select-nuevo-estado').value = "";
                document.getElementById('input-motivo').value = "";
            }

            modalBootstrap.show();
        });
    });

    // --- LÓGICA BOTÓN: CAMBIAR ESTADO (CU-02) ---
    const btnGuardarViejo = document.getElementById('btn-guardar-estado');
    const btnGuardarNuevo = btnGuardarViejo.cloneNode(true);
    btnGuardarViejo.parentNode.replaceChild(btnGuardarNuevo, btnGuardarViejo);

    btnGuardarNuevo.addEventListener('click', async () => {
        const camaId = document.getElementById('modal-cama-id').value;
        const nuevoEstado = document.getElementById('select-nuevo-estado').value;
        const motivo = document.getElementById('input-motivo').value;

        if (!nuevoEstado) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar un nuevo estado.' });
            return;
        }

        btnGuardarNuevo.disabled = true;
        btnGuardarNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

        try {
            await AdmisionServicio.cambiarEstadoCama(camaId, nuevoEstado, motivo);
            modalBootstrap.hide();
            Swal.fire({ icon: 'success', title: 'Estado actualizado', text: 'La cama ha cambiado de estado exitosamente.', timer: 1500, showConfirmButton: false });
            callbackRecargarCamas();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            btnGuardarNuevo.disabled = false;
            btnGuardarNuevo.innerHTML = 'Guardar Cambios';
        }
    });

    // --- LÓGICA BOTÓN: PROCESAR ALTA (CU-04) ---
    const btnAltaViejo = document.getElementById('btn-procesar-alta');
    const btnAltaNuevo = btnAltaViejo.cloneNode(true);
    btnAltaViejo.parentNode.replaceChild(btnAltaNuevo, btnAltaViejo);

    btnAltaNuevo.addEventListener('click', async () => {
        const internacionId = document.getElementById('modal-internacion-id').value;
        
        if (!internacionId) {
            Swal.fire({ icon: 'error', title: 'Error de Datos', text: 'No se encontró el ID de internación para este paciente.'});
            return;
        }

        // Confirmación de seguridad
        const confirmacion = await Swal.fire({
            title: '¿Confirmar Alta Médica?',
            text: "El paciente será dado de alta y la cama pasará a estado de Limpieza automáticamente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-primario)',
            cancelButtonColor: 'var(--color-peligro)',
            confirmButtonText: 'Sí, procesar alta',
            cancelButtonText: 'Cancelar'
        });

        if (confirmacion.isConfirmed) {
            btnAltaNuevo.disabled = true;
            btnAltaNuevo.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';

            try {
                // Consumir el API (CU-04)
                await AdmisionServicio.procesarAltaInternacion(internacionId);
                
                modalBootstrap.hide();
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Alta Procesada', 
                    text: 'El paciente fue dado de alta con éxito.',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                // Recargamos las camas para ver que ahora está en Limpieza
                callbackRecargarCamas();

            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error al procesar alta', text: error.message });
            } finally {
                btnAltaNuevo.disabled = false;
                btnAltaNuevo.innerHTML = '<i class="bi bi-person-walking me-2"></i> Procesar Alta Médica';
            }
        }
    });
};