import { API_URLS } from '../config.js';
import { ApiCliente } from './ApiCliente.js';

export class AdmisionServicio {
    static async obtenerSectores() {
        const url = `${API_URLS.Admision}/api/sectores`;
        return await ApiCliente.get(url);
    }
}