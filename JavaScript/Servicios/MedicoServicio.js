// JavaScript/Servicios/MedicoServicio.js
import { API_URLS } from '../config.js';
import { ApiCliente } from './ApiCliente.js';

export class MedicoServicio {
    
    // CU-09: Registrar Diagnóstico
    static async registrarDiagnostico(internacionId, medicoId, codigoCie10, observaciones) {
        const url = `${API_URLS.Clinico}/api/Diagnosticos`;
        const body = {
            internacionId: internacionId,
            medicoId: medicoId,
            codigoCie10: codigoCie10,
            observaciones: observaciones
        };
        return await ApiCliente.post(url, body);
    }

    // CU-11 y CU-12: Prescribir Tratamiento (Con o Sin IA)
    static async prescribirTratamiento(tratamientoSolicitud) {
        // tratamientoSolicitud es un objeto con todos los campos (medicamento, dosis, omitirValidacionIA, etc.)
        const url = `${API_URLS.Clinico}/api/Tratamientos`;
        return await ApiCliente.post(url, tratamientoSolicitud);
    }
}