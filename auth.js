// auth.js
Document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Giriş formunu təqdim etmək
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm['login-username'].value;
            const password = loginForm['login-password'].value;

            try {
                const response = await fetch('http://127.0.0.1:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message || 'Giriş uğurlu!');
                    // Giriş uğurlu olduqda ana səhifəyə yönləndir
                    window.location.href = 'index.html';
                } else {
                    alert(data.message || 'Giriş uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.');
                    console.error('Giriş xətası:', data);
                }
            } catch (error) {
                alert('Serverlə əlaqə qurularkən xəta baş verdi. Serverin işlək olduğundan əmin olun.');
                console.error('API çağırışı zamanı xəta:', error);
            }
        });
    }

    // Qeydiyyat formunu təqdim etmək
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm['register-username'].value;
            const email = registerForm['register-email'].value;
            const password = registerForm['register-password'].value;
            const confirmPassword = registerForm['register-confirm-password'].value;

            if (password !== confirmPassword) {
                alert('Şifrələr uyğun gəlmir!');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:5000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message || 'Qeydiyyat uğurlu oldu! İndi daxil ola bilərsiniz.');
                    // Qeydiyyat uğurlu olduqda giriş formuna keç
                    if (loginForm) { // loginForm mövcudluğunu yoxlayın
                        loginForm.style.display = 'block';
                    }
                    registerForm.style.display = 'none';
                } else {
                    alert(data.message || 'Qeydiyyat uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.');
                    console.error('Qeydiyyat xətası:', data);
                }
            } catch (error) {
                alert('Serverlə əlaqə qurularkən xəta baş verdi. Serverin işlək olduğundan əmin olun.');
                console.error('API çağırışı zamanı xəta:', error);
            }
        });
    }


    // Formları dəyişdirmək (göstər/gizlət)
    if (showRegisterLink && loginForm && registerForm) { // Bütün elementlərin mövcudluğunu yoxlayın
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }

    if (showLoginLink && loginForm && registerForm) { // Bütün elementlərin mövcudluğunu yoxlayın
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });
    }

    // Səhifə yüklənəndə formaların ilkin vəziyyətini təyin etmək
    // Əmin olun ki, login.html-də register-form display: none olaraq qalır.
    // auth.js faylı login.html səhifəsinə aiddir.
    if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('/login')) {
        if (loginForm && registerForm) {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        }
    }
});
