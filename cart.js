document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');

    // Səbətdəki məhsulları saxlamaq üçün sadə bir array (gələcəkdə localStorage və ya server istifadə ediləcək)
    let cart = []; 

    // Səbət məlumatlarını local storage-dən yükləyin (brauzerin yaddaşı)
    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
    } else {
        // İlk dəfə sayta daxil olanda səbəti boş göstərmək üçün
        localStorage.setItem('cart', JSON.stringify([])); 
    }

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = ''; // Səbətin tərkibini təmizlə
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Səbətiniz boşdur.</p>';
            totalPriceSpan.textContent = '0.00';
            checkoutButton.disabled = true; // Səbət boşdursa sifariş düyməsini deaktiv et
            return;
        }

        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.price} AZN</p>
                    <button class="remove-from-cart" data-id="${item.id}">Sil</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
            total += item.price;
        });

        totalPriceSpan.textContent = total.toFixed(2); // Ümumi qiyməti göstər
        checkoutButton.disabled = false; // Səbətdə məhsul varsa sifariş düyməsini aktiv et
    }

    // Bu funksiya `script.js` və `game-detail.html` fayllarından çağırılacaq
    window.addToCart = function(game) {
        let existingCart = JSON.parse(localStorage.getItem('cart')) || [];
        existingCart.push(game); 
        localStorage.setItem('cart', JSON.stringify(existingCart));
        cart = existingCart; // Yerli səbət dəyişənini yenilə
        updateCartDisplay(); // Səbəti yenidən göstər
        alert(`${game.name} səbətə əlavə edildi!`);
    };

    // Səbətdən məhsulu silmə funksionallığı
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-from-cart')) {
            const itemIdToRemove = parseInt(e.target.dataset.id);
            cart = cart.filter(item => item.id !== itemIdToRemove);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            alert('Məhsul səbətdən silindi.');
        }
    });

    // Sifarişi tamamla düyməsinin funksionallığı
    checkoutButton.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Sifarişiniz qəbul edildi! (Bu sadəcə demo mesajıdır)');
            cart = []; // Sifarişdən sonra səbəti boşalt
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        } else {
            alert('Sifariş vermək üçün səbətiniz boş olmamalıdır.');
        }
    });

    // Səhifə yüklənəndə səbəti göstər
    updateCartDisplay();
});