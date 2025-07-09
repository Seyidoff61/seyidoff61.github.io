document.addEventListener('DOMContentLoaded', () => {
    const gameListing = document.getElementById('game-listing');

    // Oyunları API-dən çəkən funksiya
    async function fetchGames() {
        try {
            // !!! DİQQƏT: Buradaki IP ünvanı Termux-da Flask serverinizin işlədiyi ünvan olmalıdır.
            // Əksər hallarda bu, http://127.0.0.1:5000 olacaq.
            const response = await fetch('http://127.0.0.1:5000/api/games'); 
            
            if (!response.ok) {
                // Əgər server 200 OK cavabı verməzsə xəta at
                const errorText = await response.text(); // Xəta mesajını oxu
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const games = await response.json(); // Cavabı JSON-a çevir
            displayGames(games); // Çəkilən oyunları göstər
        } catch (error) {
            console.error('Oyunlar yüklənərkən xəta baş verdi:', error);
            gameListing.innerHTML = '<p>Oyunlar yüklənərkən xəta baş verdi. Zəhmət olmasa, daha sonra yenidən cəhd edin.</p>';
            // Debugging üçün: Serverin işlək olduğundan və CORS-un düzgün qurulduğundan əmin olun.
        }
    }
    
    // Oyunları HTML-də göstərən funksiya (dəyişmədi)
    function displayGames(games) {
        gameListing.innerHTML = ''; // Mövcud oyunları təmizlə
        if (games.length === 0) {
            gameListing.innerHTML = '<p>Heç bir oyun tapılmadı.</p>';
            return;
        }

        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.classList.add('game-card');
            
            // Ana səhifədə göstəriləcək ən ucuz qiyməti tapırıq
            const minPrice = game.prices && game.prices.length > 0 
                ? game.prices.reduce((min, p) => p.amount < min ? p.amount : min, game.prices[0].amount)
                : 'Qiymət yoxdur'; // game.prices mövcudluğunu yoxlayırıq

            gameCard.innerHTML = `
                <a href="game-detail.html?id=${game.id}" style="text-decoration: none; color: inherit;">
                    <img src="${game.image}" alt="${game.name}">
                    <h3>${game.name}</h3>
                    <p class="game-description">${game.description.substring(0, 70)}...</p>
                    <p class="game-price">${typeof minPrice === 'number' ? minPrice.toFixed(2) + ' AZN-dən başlayan' : minPrice}</p>
                </a>
                `;
            gameListing.appendChild(gameCard);
        });
    }

    // Səhifə yüklənəndə oyunları çək və göstər
    fetchGames(); 

    // --- Hamburger menyu kodu ---
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const navLinks = document.getElementById('nav-links');

    if (hamburgerIcon && navLinks) { // Elementlərin mövcudluğunu yoxla
        hamburgerIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburgerIcon.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    hamburgerIcon.classList.remove('active');
                }
            });
        });
    } else {
        console.warn("Hamburger menyu elementləri tapılmadı. Zəhmət olmasa HTML-i yoxlayın.");
    }

    // Mövcud addToCart və digər istifadə olunmayan hissələri silməyə davam edə bilərsiniz
    // Sizin atdığınız kodda bu hissələr artıq qeyd edilmişdi.
});
