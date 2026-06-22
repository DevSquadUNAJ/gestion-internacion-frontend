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

    contenedor.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Cargando camas...</p>
        </div>
    `;

    try {
        const camas = await AdmisionServicio.obtenerCamasPorSector(sectorId);

        if (camas.length === 0) {
            contenedor.innerHTML = `<div class="alert alert-warning shadow-sm">Este sector aún no tiene camas configuradas.</div>`;
            return;
        }

        camas.sort((a, b) => a.numero - b.numero);

        let htmlGrilla = '<div class="row">';
        camas.forEach(cama => {
            htmlGrilla += crearTarjetaCama(cama);
        });
        htmlGrilla += '</div>';

        contenedor.innerHTML = htmlGrilla;

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `
            <div class="alert alert-danger shadow-sm">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> Error al cargar las camas: ${error.message}
            </div>
        `;
    }
};