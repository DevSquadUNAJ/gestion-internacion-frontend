import { API_URLS } from '../config.js';
import { ApiCliente } from './ApiCliente.js';

export class AdmisionServicio {
    static async obtenerSectores() {
        const url = `${API_URLS.Admision}/api/sectores`;
        return await ApiCliente.get(url);
    }

    static async obtenerCamasPorSector(sectorId) {
        const url = `${API_URLS.Admision}/api/sectores/${sectorId}/camas`;
        return await ApiCliente.get(url);
    }

    static async cambiarEstadoCama(camaId, nuevoEstado, motivo) {
        const url = `${API_URLS.Admision}/api/camas/${camaId}/estado`;
        const body = {
            nuevoEstado: nuevoEstado,
            motivo: motivo
        };
        return await ApiCliente.patch(url, body);
    }

    static async procesarAltaInternacion(internacionId, estadoEgreso = "AltaMedica") {
        const url = `${API_URLS.Admision}/api/internaciones/${internacionId}/alta`;
        const body = {
            estadoEgreso: estadoEgreso
        };
        return await ApiCliente.patch(url, body);
    }

    static async trasladarPaciente(internacionId, camaDestinoId, motivoTraslado) {
        const url = `${API_URLS.Admision}/api/internaciones/${internacionId}`;
        const body = {
            camaDestinoId: camaDestinoId,
            motivoTraslado: motivoTraslado
        };
        return await ApiCliente.patch(url, body);
    }

    static async buscarPacientePorDni(dni) {
        const url = `${API_URLS.Admision}/api/pacientes?dni=${dni}`;
        return await ApiCliente.get(url);
    }

    static async registrarInternacion(pacienteId, camaId, motivo) {
        const url = `${API_URLS.Admision}/api/internaciones`;
        const body = {
            pacienteId: pacienteId,
            camaId: camaId,
            motivo: motivo
        };
        return await ApiCliente.post(url, body);
    }
}