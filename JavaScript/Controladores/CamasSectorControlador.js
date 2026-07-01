// JavaScript/Controladores/CamasSectorControlador.js
import { AdmisionServicio } from '../Servicios/AdmisionServicio.js';
import { crearTarjetaCama } from '../Componentes/Tarjetas/TarjetaCama.js';
import { abrirModalGestionCama } from './Modales/ModalGestionCamaControlador.js';

export const inicializarVistaCamas = async (sectorId, nombreSector, callbackVolver) => {
    const contenedor = document.getElementById('contenedor-dinamico');
    const tituloPantalla = document.getElementById('titulo-pantalla');

    tituloPantalla.innerHTML = `
        <button id="btn-volver-sectores" class="btn btn-link text-oscuro p-0 me-2 text-decoration-none shadow-none">
            <i class="bi bi-arrow-left-circle-fill fs-4 text-primary"></i>
        </button>
        Sector: ${nombreSector}
    `;

    document.getElementById('btn-volver-sectores').addEventListener('click', () => callbackVolver());

    const cargarCamas = async () => {
        contenedor.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="text-muted mt-2">Cargando camas...</p></div>`;
        
        try {
            const camas = await AdmisionServicio.obtenerCamasPorSector(sectorId);

            if (camas.length === 0) {
                return contenedor.innerHTML = `<div class="alert alert-warning shadow-sm">Este sector aún no tiene camas configuradas.</div>`;
            }

            camas.sort((a, b) => a.numero - b.numero);

            let htmlGrilla = '<div class="row">';
            camas.forEach(cama => htmlGrilla += crearTarjetaCama(cama));
            htmlGrilla += '</div>';

            contenedor.innerHTML = htmlGrilla;

            // --- Mutación dinámica del DOM para Admisión ---
            const tarjetas = contenedor.querySelectorAll('.card');
            tarjetas.forEach(tarjeta => {
                const estado = tarjeta.querySelector('.badge').textContent.trim();
                const btnOriginal = tarjeta.querySelector('button[data-cama-id]');
                const camaId = btnOriginal.getAttribute('data-cama-id');
                const internacionId = btnOriginal.getAttribute('data-internacion-id') || '';
                
                if (estado === 'Disponible') {
                    const contenedorBotones = document.createElement('div');
                    contenedorBotones.className = 'd-flex gap-2 w-100 mt-3';
                    contenedorBotones.innerHTML = `
                        <button class="btn btn-outline-success btn-sm w-100 fw-bold btn-accion rounded-pill shadow-sm" data-cama-id="${camaId}" data-accion="internar">
                            <i class="bi bi-person-plus-fill"></i> Internar
                        </button>
                        <button class="btn btn-outline-secondary btn-sm w-100 fw-bold btn-accion rounded-pill shadow-sm" data-cama-id="${camaId}" data-accion="estado">
                            <i class="bi bi-gear-fill"></i> Estado
                        </button>
                    `;
                    btnOriginal.replaceWith(contenedorBotones);
                } 
                else if (estado === 'Ocupada') {
                    const contenedorBotones = document.createElement('div');
                    contenedorBotones.className = 'd-flex gap-2 w-100 mt-3';
                    contenedorBotones.innerHTML = `
                        <button class="btn btn-outline-danger btn-sm w-100 fw-bold btn-accion rounded-pill shadow-sm" data-cama-id="${camaId}" data-internacion-id="${internacionId}" data-accion="alta">
                            <i class="bi bi-box-arrow-right"></i> Alta
                        </button>
                        <button class="btn btn-outline-primary btn-sm w-100 fw-bold btn-accion rounded-pill shadow-sm" data-cama-id="${camaId}" data-internacion-id="${internacionId}" data-accion="trasladar">
                            <i class="bi bi-arrow-left-right"></i> Traslado
                        </button>
                    `;
                    btnOriginal.replaceWith(contenedorBotones);
                } 
                else {
                    // Para Limpieza o Mantenimiento
                    btnOriginal.setAttribute('data-accion', 'estado');

                    btnOriginal.classList.add(
                        'btn-outline-secondary',
                        'btn-accion',
                        'rounded-pill',
                        'shadow-sm'
                    );

                    btnOriginal.classList.remove('btn-primary');

                    // Cambiar ícono y texto del botón
                    btnOriginal.innerHTML = `
                        <i class="bi bi-gear-fill me-1"></i> Estado
                    `;
                }
            });

            // ATAR EVENTOS A TODOS LOS BOTONES NUEVOS
            const botonesAccion = document.querySelectorAll('.btn-accion');
            botonesAccion.forEach(boton => {
                boton.addEventListener('click', (e) => {
                    const camaId = e.currentTarget.getAttribute('data-cama-id');
                    const accion = e.currentTarget.getAttribute('data-accion');
                    const internacionId = e.currentTarget.getAttribute('data-internacion-id') || null;
                    const estadoActual = e.currentTarget.closest('.card').querySelector('.badge').textContent.trim();

                    // Pasamos el nuevo parámetro "accion" al modal
                    abrirModalGestionCama(camaId, internacionId, estadoActual, cargarCamas, accion);
                });
            });

        } catch (error) {
            contenedor.innerHTML = `<div class="alert alert-danger shadow-sm"><i class="bi bi-exclamation-triangle-fill me-2"></i> Error: ${error.message}</div>`;
        }
    };

    await cargarCamas();
};