// JavaScript/Controladores/CamasSectorMedicoControlador.js
import { AdmisionServicio } from '../Servicios/AdmisionServicio.js';
import { crearTarjetaCama } from '../Componentes/Tarjetas/TarjetaCama.js';
import { abrirModalGestionMedica } from './Modales/ModalGestionMedicaControlador.js';

export const inicializarVistaCamasMedico = async (sectorId, nombreSector, callbackVolver) => {
    const contenedor = document.getElementById('contenedor-dinamico');
    const tituloPantalla = document.getElementById('titulo-pantalla');

    tituloPantalla.innerHTML = `
        <button id="btn-volver-sectores" class="btn btn-link text-oscuro p-0 me-2 text-decoration-none shadow-none">
            <i class="bi bi-arrow-left-circle-fill fs-4 text-primary"></i>
        </button>
        Sector: ${nombreSector} (Gestión Médica)
    `;

    document.getElementById('btn-volver-sectores').addEventListener('click', () => callbackVolver());

    const cargarCamas = async () => {
        contenedor.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;
        
        try {
            const camas = await AdmisionServicio.obtenerCamasPorSector(sectorId);
            camas.sort((a, b) => a.numero - b.numero);

            let htmlGrilla = '<div class="row">';
            camas.forEach(cama => {
                // Truco de UX: Cambiamos el texto del botón de la tarjeta para el médico
                let tarjeta = crearTarjetaCama(cama);
                if (cama.estado === 'Ocupada') {
                    tarjeta = tarjeta.replace('Gestionar', '<i class="bi bi-clipboard2-pulse me-1"></i> Atender Paciente');
                } else {
                    tarjeta = tarjeta.replace('Gestionar', 'Sin Paciente');
                }
                htmlGrilla += tarjeta;
            });
            htmlGrilla += '</div>';

            contenedor.innerHTML = htmlGrilla;

            // ATAR EVENTOS (Solo a camas ocupadas)
            const botonesGestionar = document.querySelectorAll('button[data-cama-id]');
            botonesGestionar.forEach(boton => {
                const estadoActual = boton.closest('.card').querySelector('.badge').textContent.trim();
                
                if (estadoActual !== 'Ocupada') {
                    boton.disabled = true; // El médico no gestiona limpieza ni mantenimiento
                    boton.classList.replace('btn-outline-primary', 'btn-outline-secondary');
                } else {
                    boton.classList.replace('btn-outline-primary', 'btn-primary');
                    boton.addEventListener('click', (e) => {
                        const internacionId = e.currentTarget.getAttribute('data-internacion-id');
                        const nombrePaciente = e.currentTarget.closest('.card').querySelector('p.text-oscuro').textContent.trim();
                        
                        // TODO: Aquí llamaremos al modal del médico en el próximo paso
                        boton.addEventListener('click', (e) => {
                            const internacionId = e.currentTarget.getAttribute('data-internacion-id');
                            const nombrePaciente = e.currentTarget.closest('.card').querySelector('p.text-oscuro').textContent.trim();
                            
                            // LLAMADA AL MODAL DEL MÉDICO
                            abrirModalGestionMedica(internacionId, nombrePaciente);
                        });
                    });
                }
            });

        } catch (error) {
            contenedor.innerHTML = `<div class="alert alert-danger shadow-sm">Error: ${error.message}</div>`;
        }
    };

    await cargarCamas();
};