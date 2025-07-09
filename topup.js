document.addEventListener('DOMContentLoaded', () => {
    const topupForm = document.getElementById('topup-form');
    const amountInput = document.getElementById('amount');
    const messageDiv = document.getElementById('message');

    if (topupForm) { // topupForm elementinin mövcudluğunu yoxlayırıq
        topupForm.addEventListener('submit', async (e) => { // 'async' əlavə edildi
            e.preventDefault(); // Formun standart göndərilməsini dayandır

            const amount = parseFloat(amountInput.value); // Məbləği rəqəm olaraq al
            const userId = 1; // Demo istifadəçi ID-si. Real tətbiqdə bu, giriş etmiş istifadəçinin ID-si olmalıdır.

            if (isNaN(amount) || amount <= 0) {
                displayMessage('Zəhmət olmasa, düzgün məbləğ daxil edin.', 'error');
                return;
            }

            displayMessage('Balans artırma sorğusu göndərilir...', 'info'); // Yüklənmə mesajı

            try {
                // !!! DİQQƏT: Buradaki IP ünvanı Termux-da Flask serverinizin işlədiyi ünvan olmalıdır.
                // Əksər hallarda bu, http://127.0.0.1:5000 olacaq.
                const response = await fetch('http://127.0.0.1:5000/api/topup', { // Backend API ünvanı
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                        // 'Authorization': 'Bearer ' + userToken // Əgər istifadəçi giriş edibsə, token buraya əlavə olunacaq
                    },
                    body: JSON.stringify({ amount: amount, userId: userId }) // Məlumatları JSON formatında göndəririk
                });

                const data = await response.json(); // Serverdən gələn JSON cavabını oxuyuruq

                if (response.ok) { // Əgər HTTP status kodu 200-299 aralığındadırsa (uğurlu cavab)
                    displayMessage(data.message || `Balansınız ${amount.toFixed(2)} AZN qədər artırıldı!`, 'success');
                    amountInput.value = ''; // Məbləğ sahəsini təmizlə
                    // Real tətbiqdə, burada istifadəçinin balansını yeniləyə bilərsiniz (əgər səhifədə göstərilirsə)
                } else {
                    // Əgər HTTP status kodu xəta göstərirsə (4xx, 5xx)
                    displayMessage(data.message || 'Balans artırılarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.', 'error');
                    console.error('Serverdən xəta cavabı:', data);
                }
            } catch (error) {
                console.error('API çağırışı zamanı xəta:', error);
                displayMessage('Serverlə əlaqə qurularkən xəta baş verdi. Serverin işlək olduğundan əmin olun.', 'error');
            }
        });
    }

    function displayMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`; // Klassları dəyişdir (success/error)
        messageDiv.style.display = 'block'; // Mesajı göstər
    }
});
