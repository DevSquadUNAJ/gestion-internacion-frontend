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

        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.statusText}`);
        }

        if (respuesta.status === 204) return null;

        return await respuesta.json();
    }

    // Más adelante agregaremos post(), patch(), etc.
}