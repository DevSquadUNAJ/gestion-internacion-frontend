// JavaScript/Controladores/DashboardMedicoControlador.js
import { AdmisionServicio } from '../Servicios/AdmisionServicio.js'; // Usamos el de admisión para leer sectores
import { crearTarjetaSector } from '../Componentes/Tarjetas/TarjetaSector.js';
import { inicializarVistaCamasMedico } from './CamasSectorMedicoControlador.js';

export const inicializarDashboardMedico = async () => {
    const contenedor = document.getElementById('contenedor-dinamico');
    const tituloPantalla = document.getElementById('titulo-pantalla');

    tituloPantalla.innerHTML = `<i class="bi bi-heart-pulse text-primary me-2"></i>Sectores Hospitalarios (Área Médica)`;

    contenedor.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="text-muted mt-2">Cargando sectores...</p></div>`;

    try {
        const sectores = await AdmisionServicio.obtenerSectores();

        if (sectores.length === 0) {
            contenedor.innerHTML = `<div class="alert alert-warning">No hay sectores configurados.</div>`;
            return;
        }

        let htmlGrilla = '<div class="row">';
        sectores.forEach(sector => htmlGrilla += crearTarjetaSector(sector));
        htmlGrilla += '</div>';

        contenedor.innerHTML = htmlGrilla;

        const botonesVerCamas = contenedor.querySelectorAll('button[data-sector-id]');
        botonesVerCamas.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const sectorId = e.currentTarget.getAttribute('data-sector-id');
                const nombreSector = e.currentTarget.closest('.card').querySelector('.card-title').textContent.trim();
                
                inicializarVistaCamasMedico(sectorId, nombreSector, inicializarDashboardMedico);
            });
        });

    } catch (error) {
        contenedor.innerHTML = `<div class="alert alert-danger shadow-sm">Error: ${error.message}</div>`;
    }
};