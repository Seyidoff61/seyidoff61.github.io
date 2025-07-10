// games.js
alert('games.js yükləndi!'); // Bu sətri əlavə edin
Document.addEventListener('DOMContentLoaded', async () => {
    // ... qalan kod

Document.addEventListener('DOMContentLoaded', async () => {
    const gamesContainer = document.getElementById('games-list');

    if (gamesContainer) {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/games');
            if (!response.ok) {
                throw new Error(`HTTP xətası! Status: ${response.status}`);
            }
            const games = await response.json();

            if (games.length === 0) {
                gamesContainer.innerHTML = '<p>Heç bir oyun tapılmadı. Zəhmət olmasa backend-ə nümunə oyunlar əlavə edin.</p>';
                return;
            }

            gamesContainer.innerHTML = ''; // "Oyunlar yüklənir..." mesajını sil
            games.forEach(game => {
                const gameDiv = document.createElement('div');
                gameDiv.className = 'game-item';

                let actionHtml = '';
                if (game.action_type === 'id_input') {
                    // FREE FIRE DIAMOND və PUBG MOBILE UC üçün
                    actionHtml = `
                        <input type="text" placeholder="ID daxil edin" class="game-id-input" data-game-id="${game.id}">
                        <button class="buy-button" data-game-id="${game.id}" data-game-name="${game.name}" data-action-type="${game.action_type}">Al</button>
                    `;
                } else if (game.action_type === 'whatsapp') {
                    // TİKTOK JETON üçün
                    // Zəhmət olmasa, 'YOUR_PHONE_NUMBER' yerinə öz real WhatsApp nömrənizi yazın (məsələn, +99450XXXXXXX)
                    const whatsappNumber = 'YOUR_PHONE_NUMBER'; // <--- BURANI DƏYİŞDİRİN!
                    const whatsappMessage = `Salam, ${game.name} haqqında məlumat almaq istərdim.`;
                    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                    actionHtml = `
                        <a href="${whatsappLink}" target="_blank" class="whatsapp-link">
                            <button class="whatsapp-button">WhatsApp ilə əlaqə</button>
                        </a>
                    `;
                } else {
                    // Digər oyunlar üçün standart düymə (əgər belə oyunlar olarsa)
                    actionHtml = `<button class="buy-button" data-game-id="${game.id}" data-game-name="${game.name}">Al</button>`;
                }


                gameDiv.innerHTML = `
                    <img src="${game.image_url || 'https://via.placeholder.com/150'}" alt="${game.name}">
                    <h3>${game.name}</h3>
                    <p>Qiymət: ${game.price === 0.00 ? 'Pulsuz' : `${game.price.toFixed(2)} AZN`}</p>
                    ${actionHtml}
                `;
                gamesContainer.appendChild(gameDiv);
            });

            // "Al" düymələri üçün event listener əlavə edin
            document.querySelectorAll('.buy-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const gameId = e.target.dataset.gameId;
                    const gameName = e.target.dataset.gameName;
                    const actionType = e.target.dataset.actionType;

                    if (actionType === 'id_input') {
                        const inputElement = e.target.closest('.game-item').querySelector('.game-id-input');
                        const userIdValue = inputElement ? inputElement.value.trim() : '';

                        if (!userIdValue) {
                            alert(`Zəhmət olmasa "${gameName}" üçün ID daxil edin.`);
                            return;
                        }
                        alert(`"${gameName}" (ID: ${userIdValue}) üçün sifariş qəbul edildi! (Demo)`);
                        // Real tətbiqdə burada bir API çağırışı etməlisiniz (məsələn, /api/purchase)
                        // fetch('http://127.0.0.1:5000/api/purchase', { method: 'POST', body: JSON.stringify({ gameId, userIdValue }) });
                    } else {
                        // Bu hissə TikTok jetonları üçün işləməyəcək, çünki orada WhatsApp düyməsi var
                        alert(`"${gameName}" sifariş edildi! (Demo)`);
                    }
                });
            });

        } catch (error) {
            console.error('Oyunlar çəkilərkən xəta baş verdi:', error);
            if (gamesContainer) {
                gamesContainer.innerHTML = '<p>Oyunlar yüklənərkən xəta baş verdi. Serverin işlək olduğundan əmin olun.</p>';
            }
        }
    }
});
