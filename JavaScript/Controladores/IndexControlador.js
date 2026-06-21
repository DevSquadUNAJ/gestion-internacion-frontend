// JavaScript/Controladores/IndexControlador.js
import { inicializarDashboardAdmision } from './DashboardAdmisionControlador.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. GUARDIÁN DE AUTENTICACIÓN: Verificar si hay un token en sessionStorage
    const token = sessionStorage.getItem('jwtToken');
    
    if (!token) {
        window.location.href = 'Paginas/login.html';
        return; 
    }

    // 2. Cargar datos del usuario en la interfaz
    const username = sessionStorage.getItem('username') || 'Usuario';
    const rol = sessionStorage.getItem('rol') || 'Sin Rol';

    document.getElementById('lbl-username').textContent = username;
    document.getElementById('lbl-rol').textContent = rol;

    // 3. Lógica para Cerrar Sesión con SweetAlert2
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Se cerrará tu sesión actual en el sistema.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'var(--color-primario)',
                cancelButtonColor: 'var(--color-peligro)',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar',
                background: 'var(--color-blanco)',
                color: 'var(--color-oscuro)'
            }).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.clear();
                    window.location.href = 'Paginas/login.html';
                }
            });
        });
    }

    // 4. Renderizado condicional según Rol (¡Ahora sí está al nivel correcto!)
    if (rol === 'Admision' || rol === 'Admisión') {
        inicializarDashboardAdmision();
    } else {
        document.getElementById('contenedor-dinamico').innerHTML = `
            <div class="alert alert-info shadow-sm">
                <i class="bi bi-info-circle-fill me-2"></i> Módulo en construcción para el rol: ${rol}
            </div>
        `;
    }
});