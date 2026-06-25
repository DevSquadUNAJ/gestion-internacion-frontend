import { API_URLS } from '../config.js';
import { ApiCliente } from './ApiCliente.js';

export class EnfermeriaServicio {
    static async obtenerPanelControl(enfermeraId) {
        const url = `${API_URLS.Clinico}/api/enfermeras/${enfermeraId}/panel`;
        return await ApiCliente.get(url);
    }
}