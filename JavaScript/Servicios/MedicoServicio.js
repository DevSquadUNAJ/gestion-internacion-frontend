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

    // Obtener Historia Clínica por Paciente
    static async obtenerHistoriaClinica(pacienteId) {
        const url = `${API_URLS.Clinico}/api/HistoriaClinica/paciente/${pacienteId}`;
        try {
            return await ApiCliente.get(url);
        } catch (error) {
            // Si devuelve 404 Not Found, devolvemos null para que el controlador lo maneje
            if (error.message.includes("404") || error.message.toLowerCase().includes("not found")) {
                return null;
            }
            throw error; // Si es otro error (500, red), lo lanzamos
        }
    }
}