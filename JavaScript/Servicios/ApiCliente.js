export class ApiCliente {
    static async get(url) {
        const token = sessionStorage.getItem('jwtToken');
        const respuesta = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (respuesta.status === 401) {
            sessionStorage.clear();
            window.location.href = 'Paginas/login.html';
            throw new Error("Su sesión ha expirado.");
        }
        if (!respuesta.ok) throw new Error(`Error en la petición: ${respuesta.statusText}`);
        if (respuesta.status === 204) return null;
        return await respuesta.json();
    }

    static async patch(url, body) {
        const token = sessionStorage.getItem('jwtToken');
        
        const respuesta = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (respuesta.status === 401) {
            sessionStorage.clear();
            window.location.href = 'Paginas/login.html';
            throw new Error("Su sesión ha expirado.");
        }

        if (!respuesta.ok) {
            let mensajeError = respuesta.statusText;
            try {
                const errorJson = await respuesta.json();
                mensajeError = errorJson.detail || errorJson.title || mensajeError;
            } catch (e) { /* Si no es JSON, dejamos el genérico */ }
            
            throw new Error(mensajeError);
        }

        if (respuesta.status === 204) return null;
        return await respuesta.json();
    }
}