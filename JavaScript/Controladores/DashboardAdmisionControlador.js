import { AdmisionServicio } from '../Servicios/AdmisionServicio.js';
import { crearTarjetaSector } from '../Componentes/Tarjetas/TarjetaSector.js';
import { inicializarVistaCamas } from './CamasSectorControlador.js';

export const inicializarDashboardAdmision = async () => {
    const contenedor = document.getElementById('contenedor-dinamico');
    const tituloPantalla = document.getElementById('titulo-pantalla');

    tituloPantalla.textContent = "Sectores Hospitalarios";

    contenedor.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Cargando sectores...</p>
        </div>
    `;

    try {
        const sectores = await AdmisionServicio.obtenerSectores();

        if (sectores.length === 0) {
            contenedor.innerHTML = `<div class="alert alert-warning">No hay sectores configurados en el hospital.</div>`;
            return;
        }

        let htmlGrilla = '<div class="row">';
        sectores.forEach(sector => {
            htmlGrilla += crearTarjetaSector(sector);
        });
        htmlGrilla += '</div>';

        contenedor.innerHTML = htmlGrilla;

        const botonesVerCamas = contenedor.querySelectorAll('button[data-sector-id]');
        botonesVerCamas.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const sectorId = e.currentTarget.getAttribute('data-sector-id');
                const nombreSector = e.currentTarget.closest('.card').querySelector('.card-title').textContent.trim();
                
                inicializarVistaCamas(sectorId, nombreSector, inicializarDashboardAdmision);
            });
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `
            <div class="alert alert-danger shadow-sm">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> Error al cargar los sectores: ${error.message}
            </div>
        `;
    }
};