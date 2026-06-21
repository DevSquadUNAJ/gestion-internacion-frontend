import { API_URLS } from '../config.js';

export class SeguridadServicio {
    static async iniciarSesion(username, password) {
        const respuesta = await fetch(`${API_URLS.Seguridad}/api/autenticacion/iniciar-sesion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!respuesta.ok) {
            throw new Error("Credenciales inválidas o error en el servidor.");
        }

        return await respuesta.json(); 
    }
}