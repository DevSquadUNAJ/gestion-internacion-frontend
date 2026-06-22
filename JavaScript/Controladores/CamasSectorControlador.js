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
    // 1. Instanciamos el Modal de Bootstrap mediante JS
    const modalElemento = document.getElementById('modalGestionarCama');
    const modalBootstrap = new bootstrap.Modal(modalElemento);

    const botonesGestionar = document.querySelectorAll('button[data-cama-id]');
    
    // 2. Al hacer clic en "Gestionar" en cualquier tarjeta
    botonesGestionar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const camaId = e.currentTarget.getAttribute('data-cama-id');
            // Extraer el estado actual leyendo la "badge" de la tarjeta HTML
            const estadoActual = e.currentTarget.closest('.card').querySelector('.badge').textContent.trim();

            // Rellenamos el modal con los datos
            document.getElementById('modal-cama-id').value = camaId;
            document.getElementById('modal-estado-actual').value = estadoActual;
            document.getElementById('select-nuevo-estado').value = ""; // Limpiar select
            document.getElementById('input-motivo').value = ""; // Limpiar text area

            // Mostrar el Modal
            modalBootstrap.show();
        });
    });

    // 3. Lógica para el botón "Guardar Cambios" dentro del Modal
    // (Usamos un truco para evitar que se dupliquen eventos si abren y cierran el modal varias veces: clonamos el botón)
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
            // Consumir el API (CU-02)
            await AdmisionServicio.cambiarEstadoCama(camaId, nuevoEstado, motivo);
            
            // Éxito: Ocultar Modal, mostrar mensaje y recargar la vista de camas
            modalBootstrap.hide();
            Swal.fire({ 
                icon: 'success', 
                title: 'Estado actualizado', 
                text: 'La cama ha cambiado de estado exitosamente.',
                timer: 1500,
                showConfirmButton: false
            });
            
            // Volvemos a dibujar las camas para ver el nuevo estado
            callbackRecargarCamas();

        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            // Restaurar estado del botón
            btnGuardarNuevo.disabled = false;
            btnGuardarNuevo.innerHTML = 'Guardar Cambios';
        }
    });
};