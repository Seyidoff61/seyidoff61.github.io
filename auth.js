document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Formlar arasında keçid
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault(); // Səhifənin yenilənməsinin qarşısını al
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault(); // Səhifənin yenilənməsinin qarşısını al
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Giriş formunun göndərilməsi (Hal-hazırda sadəcə mesaj verir)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Formun standart göndərilməsini dayandır
        const username = loginForm.querySelector('#login-username').value;
        const password = loginForm.querySelector('#login-password').value;

        // Buraya real login məntiqi (serverə sorğu göndərmək, məlumatları yoxlamaq) gələcək
        alert(`Giriş cəhdi: İstifadəçi Adı: ${username}, Şifrə: ${password}\n(Bu sadəcə demo mesajıdır)`);
    });

    // Qeydiyyat formunun göndərilməsi (Hal-hazırda sadəcə mesaj verir)
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Formun standart göndərilməsini dayandır
        const username = registerForm.querySelector('#register-username').value;
        const email = registerForm.querySelector('#register-email').value;
        const password = registerForm.querySelector('#register-password').value;
        const confirmPassword = registerForm.querySelector('#register-confirm-password').value;

        if (password !== confirmPassword) {
            alert('Şifrələr uyğun gəlmir!');
            return;
        }

        // Buraya real qeydiyyat məntiqi (serverə məlumat göndərmək, bazaya yazmaq) gələcək
        alert(`Qeydiyyat cəhdi: İstifadəçi Adı: ${username}, E-poçt: ${email}, Şifrə: ${password}\n(Bu sadəcə demo mesajıdır)`);
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });
});