import { SeguridadServicio } from '../Servicios/SeguridadServicio.js';

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    const alertaError = document.getElementById('alerta-error');
    const btnSubmit = document.getElementById('btn-submit');

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        alertaError.classList.add('d-none');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Ingresando...`;

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const datosUsuario = await SeguridadServicio.iniciarSesion(username, password);
            
            sessionStorage.setItem('jwtToken', datosUsuario.token);
            sessionStorage.setItem('username', datosUsuario.username);
            sessionStorage.setItem('rol', datosUsuario.rol);
            if(datosUsuario.entidadAsociadaId){
                sessionStorage.setItem('entidadAsociadaId', datosUsuario.entidadAsociadaId);
            }

            window.location.href = '../index.html';
        } catch (error) {
            alertaError.textContent = error.message;
            alertaError.classList.remove('d-none');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = 'Iniciar Sesión';
        }
    });
});