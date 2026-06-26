import { API_URLS } from '../config.js';
import { ApiCliente } from './ApiCliente.js';

export class EnfermeriaServicio {
    // CU-15: Consultar Tablero
    static async obtenerPanelControl(enfermeraId) {
        const url = `${API_URLS.Clinico}/api/enfermeras/${enfermeraId}/panel`;
        return await ApiCliente.get(url);
    }

    // CU-16: Registrar Administración
    static async registrarAdministracion(enfermeraId, dosisId, fechaSuministro, observaciones) {
        const url = `${API_URLS.Clinico}/api/enfermeras/${enfermeraId}/dosis/${dosisId}/administracion`;
        const body = {
            fechaSuministro: fechaSuministro, // Debe ser en formato ISO 8601
            observaciones: observaciones
        };
        return await ApiCliente.put(url, body);
    }

    // CU-17: Registrar Omisión
    static async registrarOmision(enfermeraId, dosisId, motivo, observaciones) {
        const url = `${API_URLS.Clinico}/api/enfermeras/${enfermeraId}/dosis/${dosisId}/omision`;
        const body = {
            motivo: motivo,
            observaciones: observaciones
        };
        return await ApiCliente.put(url, body);
    }
}