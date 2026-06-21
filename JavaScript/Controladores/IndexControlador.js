document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('jwtToken');
    
    if (!token) {
        window.location.href = 'Paginas/login.html';
        return;
    }

    const username = sessionStorage.getItem('username') || 'Usuario';
    const rol = sessionStorage.getItem('rol') || 'Sin Rol';

    document.getElementById('lbl-username').textContent = username;
    document.getElementById('lbl-rol').textContent = rol;

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
});