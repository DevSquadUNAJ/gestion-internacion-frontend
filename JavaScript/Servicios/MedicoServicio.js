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

    // Confirmar tratamiento (con o sin forzado)
    static async confirmarTratamiento(tratamientoId, datosConfirmacion) {
        const url = `${API_URLS.Clinico}/api/Tratamientos/${tratamientoId}/confirmar`;
        // datosConfirmacion incluirá la justificación clínica si fue forzado
        return await ApiCliente.post(url, datosConfirmacion);
    }

    // Cancelar tratamiento rechazado por la IA
    static async cancelarTratamiento(tratamientoId) {
        const url = `${API_URLS.Clinico}/api/Tratamientos/${tratamientoId}/cancelar`;
        return await ApiCliente.post(url, {}); // Mandamos un body vacío porque el endpoint es POST
    }
}