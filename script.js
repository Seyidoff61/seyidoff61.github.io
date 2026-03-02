// ========== 8 Mart Qadınlar Günü Website - Core Logic ==========

// ===== Floating Flowers Background =====
function createFloatingHearts() {
  const container = document.querySelector('.hearts-container');
  if (!container) return;

  const hearts = ['🌸', '🌺', '🌷', '🪷', '🌹', '✨', '💜', '🌼'];

  function spawnHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 16 + 12) + 'px';
    heart.style.animationDuration = (Math.random() * 6 + 8) + 's';
    heart.style.animationDelay = '0s';
    container.appendChild(heart);

    setTimeout(() => heart.remove(), 14000);
  }

  // Initial batch
  for (let i = 0; i < 8; i++) {
    setTimeout(spawnHeart, i * 500);
  }

  // Continuous spawning
  setInterval(spawnHeart, 1500);
}

// ===== Sparkle Particles =====
function createSparkles() {
  const count = 15;
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    sparkle.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    document.body.appendChild(sparkle);
  }
}

// ===== Encode / Decode Data (LZ-String compressed) =====
function encodeData(data) {
  const json = JSON.stringify(data);
  // LZ-String sıxışdırma → URL ~50-60% qısalır
  if (typeof LZString !== 'undefined') {
    return LZString.compressToEncodedURIComponent(json);
  }
  // Fallback: köhnə üsul
  return btoa(unescape(encodeURIComponent(json)));
}

function decodeData(encoded) {
  try {
    // LZ-String ilə açmağa çalış
    if (typeof LZString !== 'undefined') {
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (json) return JSON.parse(json);
    }
    // Fallback: köhnə base64 üsulu ilə açmağa çalış
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// ===== Firebase Config =====
const FIREBASE_URL = 'https://compstyle-8mart-default-rtdb.firebaseio.com';

async function saveToFirebase(data) {
  const response = await fetch(`${FIREBASE_URL}/links.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  return result.name; // Firebase auto-generated short ID, e.g. "-OKx9F2mP3q"
}

// ===== Creator Page: Generate Link =====
function initCreatorPage() {
  const form = document.getElementById('creator-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('girl-name').value.trim();
    const message = document.getElementById('love-message').value.trim();
    const phone = document.getElementById('phone-number').value.trim();

    if (!name || !message || !phone) {
      shakeElement(document.querySelector('.btn-primary'));
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const data = { n: name, m: message, p: cleanPhone };

    // Show loading state
    const linkResult = document.getElementById('link-result');
    const linkText = document.getElementById('link-text');
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Hazırlanır...';
    linkText.textContent = '🔄 Link yaradılır...';
    linkResult.classList.add('show');

    const baseUrl = (window.location.origin + window.location.pathname)
      .replace(/\/index\.html$/, '')
      .replace(/\/$/, '');

    try {
      const id = await saveToFirebase(data);
      const link = `${baseUrl}/8mart.html?id=${id}`;
      linkText.textContent = link;
      copyToClipboard(link);
    } catch (err) {
      // Firebase xətası — köhnə hash metoduna keç (fallback)
      const encoded = encodeData(data);
      const link = `${baseUrl}/8mart.html#${encoded}`;
      linkText.textContent = link;
      copyToClipboard(link);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '✨ Link Yarat';
    }
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const feedback = document.getElementById('copy-feedback');
    feedback.classList.add('show');
    setTimeout(() => feedback.classList.remove('show'), 3000);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);

    const feedback = document.getElementById('copy-feedback');
    feedback.classList.add('show');
    setTimeout(() => feedback.classList.remove('show'), 3000);
  });
}

function copyLink() {
  const linkText = document.getElementById('link-text').textContent;
  copyToClipboard(linkText);
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.5s ease';
  setTimeout(() => el.style.animation = '', 500);
}

// ===== Valentine Page =====
async function initValentinePage() {
  const container = document.querySelector('.valentine-container');
  if (!container) return;

  let data = null;

  // 1) Yeni format: ?id=Firebase_ID
  const urlParams = new URLSearchParams(window.location.search);
  const firebaseId = urlParams.get('id');

  if (firebaseId) {
    try {
      const response = await fetch(`${FIREBASE_URL}/links/${firebaseId}.json`);
      data = await response.json();
    } catch (err) {
      data = null;
    }
  }

  // 2) Köhnə format fallback: #hash (LZ-String və ya base64)
  if (!data) {
    const hash = window.location.hash.substring(1);
    if (hash) data = decodeData(hash);
  }

  // Heç bir data yoxdursa — ana səhifəyə yönləndir
  if (!data || !data.n) {
    window.location.href = 'index.html';
    return;
  }

  // Adı göstər
  const nameEl = document.getElementById('girl-name-display');
  if (nameEl) nameEl.textContent = data.n;

  // Store data and Firebase ID for later use (wish save)
  window.valentineData = data;
  window.firebaseId = firebaseId || null;

  // ===== Orchestrate Intro Animation =====
  createLoaderParticles();
  createRosePetals();
  createStarField();

  // Phase 1: Gift box bounces in via CSS (0-1s)

  // Phase 2: Lid wobbles at 1.2s (CSS handles it for 2 cycles)

  // Phase 3: Lid opens + magic stars burst out
  setTimeout(() => {
    const lid = document.getElementById('gift-box-lid');
    if (lid) lid.classList.add('lid-open');

    // Create magic stars bursting from the box
    setTimeout(() => createMagicStars(), 300);
  }, 2800);

  // Phase 4: Gift box exits, logo reveals
  setTimeout(() => {
    const giftBox = document.getElementById('gift-box-container');
    const logoReveal = document.getElementById('logo-reveal');
    const rays = document.getElementById('loader-rays');

    if (giftBox) giftBox.classList.add('gift-exit');

    setTimeout(() => {
      if (giftBox) giftBox.style.display = 'none';
      if (logoReveal) logoReveal.classList.add('active');
      if (rays) {
        createLightRays();
        rays.classList.add('active');
      }
      // Sparkle burst when logo appears
      createSparkleBurst();
    }, 400);
  }, 3600);

  // Phase 5: Hide loader & show page
  setTimeout(() => {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 1000);
    }
  }, 5800);

  // Init wheel
  initWheel();
}

// ===== Spinning Wheel =====
const GIFTS = [
  { name: 'Güllər', symbol: '✿' },
  { name: 'Parfüm', symbol: '✦' },
  { name: 'SPA', symbol: '◆' },
  { name: 'Şokolad', symbol: '♥' },
  { name: 'Zinət', symbol: '★' },
  { name: 'Tort', symbol: '✧' },
  { name: 'Kitab', symbol: '❖' },
  { name: 'Sürpriz', symbol: '✦' }
];

// Women's Day - violet-purple-gold palette
const WHEEL_COLORS = [
  ['#5b1a8a', '#7b2fbe'], // deep violet
  ['#1a1535', '#2d1f55'], // dark indigo
];

let currentRotation = 0;
let isSpinning = false;

function initWheel() {
  const canvas = document.getElementById('wheel-canvas');
  if (!canvas) return;

  drawWheel(canvas);
  createVegasLights();
}

function drawWheel(canvas) {
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2 - 5;
  const segmentAngle = (2 * Math.PI) / GIFTS.length;

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw segments
  GIFTS.forEach((gift, i) => {
    const startAngle = i * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;

    // Segment background - alternating Valentine colors
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();

    const colorPair = WHEEL_COLORS[i % 2];
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, colorPair[1]);
    gradient.addColorStop(1, colorPair[0]);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Segment border
    ctx.strokeStyle = 'rgba(255, 200, 200, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);

    // Custom decorative icon - near the outer edge
    ctx.save();
    ctx.translate(radius * 0.78, 0);
    drawSegmentIcon(ctx, i);
    ctx.restore();

    // Name - uniform positioning
    ctx.font = 'bold 24px Poppins, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(gift.name, radius * 0.44, 0);
    ctx.shadowBlur = 0;

    ctx.restore();
  });

  // Outer ring glow
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(155, 50, 220, 0.4)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Golden dots around the border
  const dotCount = 32;
  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    const dotX = centerX + Math.cos(angle) * (radius - 12);
    const dotY = centerY + Math.sin(angle) * (radius - 12);

    ctx.beginPath();
    ctx.arc(dotX, dotY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 215, 0, 0.8)' : 'rgba(180, 100, 255, 0.7)';
    ctx.shadowColor = i % 2 === 0 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(180, 100, 255, 0.5)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 34, 0, 2 * Math.PI);
  const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 34);
  centerGrad.addColorStop(0, '#2d1f55');
  centerGrad.addColorStop(1, '#0d0820');
  ctx.fillStyle = centerGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Center: draw a flower / 8-pointed star
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(0.9, 0.9);
  // Draw a simple 8-petal flower
  for (let p = 0; p < 8; p++) {
    ctx.save();
    ctx.rotate((p / 8) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -10, 4, 9, 0, 0, Math.PI * 2);
    const flowerGrad = ctx.createLinearGradient(0, -18, 0, 0);
    flowerGrad.addColorStop(0, '#ffd700');
    flowerGrad.addColorStop(1, '#b464ff');
    ctx.fillStyle = flowerGrad;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }
  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd700';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

// Create Vegas-style blinking lights around the wheel
function createVegasLights() {
  const container = document.getElementById('wheel-lights');
  if (!container) return;

  const bulbCount = 24;
  const containerSize = container.offsetWidth;
  const radius = (containerSize / 2) - 4; // hug the edge
  const colors = ['#ffd700', '#b464ff', '#ffd700', '#9b32dc'];

  for (let i = 0; i < bulbCount; i++) {
    const angle = (i / bulbCount) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const bulb = document.createElement('div');
    bulb.className = 'wheel-light-bulb';
    const color = colors[i % colors.length];
    bulb.style.backgroundColor = color;
    bulb.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;
    bulb.style.marginLeft = (x - 4) + 'px';
    bulb.style.marginTop = (y - 4) + 'px';
    bulb.style.animationDelay = (i * 0.1) + 's';
    container.appendChild(bulb);
  }
}

// Draw custom icon for each wheel segment
function drawSegmentIcon(ctx, index) {
  const s = 22; // icon scale
  ctx.shadowColor = 'rgba(255, 215, 0, 0.4)';
  ctx.shadowBlur = 6;

  switch (index) {
    case 0: // Şokolad - chocolate bar
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-s, -s * 0.6, s * 2, s * 1.2);
      ctx.strokeStyle = '#1a0a10';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-s, -s * 0.6, s * 2, s * 1.2);
      // sections
      ctx.beginPath();
      ctx.moveTo(-s + s * 0.66, -s * 0.6);
      ctx.lineTo(-s + s * 0.66, s * 0.6);
      ctx.moveTo(-s + s * 1.33, -s * 0.6);
      ctx.lineTo(-s + s * 1.33, s * 0.6);
      ctx.stroke();
      break;

    case 1: // Güllər - rose/flower
      ctx.fillStyle = '#ff6b9d';
      // Petals
      for (let a = 0; a < 5; a++) {
        ctx.save();
        ctx.rotate((a * Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.55, s * 0.4, s * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Center
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      break;

    case 2: // Ayıcıq - bear face
      ctx.fillStyle = '#daa06d';
      // Head
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.arc(-s * 0.6, -s * 0.65, s * 0.35, 0, Math.PI * 2);
      ctx.arc(s * 0.6, -s * 0.65, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#1a0a10';
      ctx.beginPath();
      ctx.arc(-s * 0.28, -s * 0.15, s * 0.12, 0, Math.PI * 2);
      ctx.arc(s * 0.28, -s * 0.15, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.arc(0, s * 0.15, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 3: // Ətir - perfume bottle
      ctx.fillStyle = '#ffd700';
      // Bottle body
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, -s * 0.2);
      ctx.quadraticCurveTo(-s * 0.6, s * 0.8, 0, s);
      ctx.quadraticCurveTo(s * 0.6, s * 0.8, s * 0.5, -s * 0.2);
      ctx.closePath();
      ctx.fill();
      // Cap
      ctx.fillStyle = '#ff6b9d';
      ctx.fillRect(-s * 0.2, -s * 0.7, s * 0.4, s * 0.5);
      // Spray top
      ctx.fillRect(-s * 0.08, -s, s * 0.16, s * 0.3);
      break;

    case 4: // Zinət - diamond
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.9, -s * 0.2);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.9, -s * 0.2);
      ctx.closePath();
      ctx.fill();
      // Facet line
      ctx.strokeStyle = 'rgba(26, 10, 16, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-s * 0.9, -s * 0.2);
      ctx.lineTo(s * 0.9, -s * 0.2);
      ctx.stroke();
      break;

    case 5: // Şam yeməyi - candle/flame
      ctx.fillStyle = '#ffd700';
      // Candle body
      ctx.fillRect(-s * 0.25, -s * 0.1, s * 0.5, s);
      // Flame
      ctx.fillStyle = '#ff6b9d';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.9);
      ctx.quadraticCurveTo(s * 0.35, -s * 0.5, 0, -s * 0.1);
      ctx.quadraticCurveTo(-s * 0.35, -s * 0.5, 0, -s * 0.9);
      ctx.fill();
      // Flame inner
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.75);
      ctx.quadraticCurveTo(s * 0.15, -s * 0.5, 0, -s * 0.2);
      ctx.quadraticCurveTo(-s * 0.15, -s * 0.5, 0, -s * 0.75);
      ctx.fill();
      break;

    case 6: // Sevgi məktubu - love envelope
      ctx.fillStyle = '#ff6b9d';
      // Envelope body
      ctx.fillRect(-s, -s * 0.6, s * 2, s * 1.2);
      // Flap
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.6);
      ctx.lineTo(0, s * 0.2);
      ctx.lineTo(s, -s * 0.6);
      ctx.closePath();
      ctx.fill();
      // Small heart
      ctx.fillStyle = '#e91e63';
      ctx.beginPath();
      ctx.arc(-s * 0.15, s * 0.2, s * 0.15, 0, Math.PI * 2);
      ctx.arc(s * 0.15, s * 0.2, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 7: // Sürpriz - gift box
      ctx.fillStyle = '#ffd700';
      // Box
      ctx.fillRect(-s, -s * 0.3, s * 2, s * 1.3);
      // Lid
      ctx.fillRect(-s * 1.1, -s * 0.6, s * 2.2, s * 0.35);
      // Ribbon vertical
      ctx.fillStyle = '#ff6b9d';
      ctx.fillRect(-s * 0.12, -s * 0.6, s * 0.24, s * 1.6);
      // Ribbon horizontal
      ctx.fillRect(-s * 1.1, -s * 0.15, s * 2.2, s * 0.2);
      // Bow
      ctx.beginPath();
      ctx.ellipse(-s * 0.35, -s * 0.75, s * 0.3, s * 0.2, -0.3, 0, Math.PI * 2);
      ctx.ellipse(s * 0.35, -s * 0.75, s * 0.3, s * 0.2, 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.shadowBlur = 0;
}

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;

  const canvas = document.getElementById('wheel-canvas');
  const spinBtn = document.getElementById('spin-btn');
  spinBtn.disabled = true;
  spinBtn.textContent = 'Fırlanır...';

  // Always land on "Sürpriz" (index 7)
  const segmentAngle = 360 / GIFTS.length; // 45°
  const targetIndex = 7; // Sürpriz
  // For the pointer at top: index = floor(((360 - normalizedDeg) % 360) / segmentAngle)
  // To land on index 7: normalizedDeg should be in range (0°, 45°), target middle ~22.5°
  const targetDeg = segmentAngle / 2 + (Math.random() * 20 - 10); // ~12.5° to ~32.5° for natural look
  const fullSpins = (Math.floor(Math.random() * 4) + 5) * 360; // 5-8 full rotations
  const totalRotation = currentRotation + fullSpins + ((targetDeg - (currentRotation % 360) + 360) % 360);

  // Animate
  const duration = 5000;
  const startTime = Date.now();
  const startRotation = currentRotation;

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);

    currentRotation = startRotation + (totalRotation - startRotation) * eased;
    canvas.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Spin complete
      isSpinning = false;

      // Calculate which segment we landed on
      const normalizedDeg = ((currentRotation % 360) + 360) % 360;
      const segmentAngle = 360 / GIFTS.length;
      // The pointer is at the top (0°), wheel rotates clockwise
      // So we need to find which segment is at the top
      const index = Math.floor(((360 - normalizedDeg) % 360) / segmentAngle);
      const gift = GIFTS[index >= 0 ? index % GIFTS.length : 0];

      // Show result after a brief pause
      setTimeout(() => showResult(gift), 500);
    }
  }

  requestAnimationFrame(animate);
}

function showResult(gift) {
  // Trigger confetti
  createConfetti();

  // Show gift reveal
  const resultSection = document.getElementById('result-section');
  document.getElementById('gift-emoji-display').textContent = '🎁';
  document.getElementById('gift-name-display').textContent = gift.name;
  document.getElementById('love-message-display').textContent = window.valentineData.m;

  resultSection.classList.add('show');

  // Smooth scroll to result - show gift emoji area in view
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Store gift for WhatsApp message
  window.wonGift = gift;

  // Hide spin button
  document.getElementById('spin-btn').style.display = 'none';
}

// ===== Send WhatsApp =====
function sendWhatsApp() {
  const giftInput = document.getElementById('gift-choice').value.trim();
  if (!giftInput) {
    const input = document.getElementById('gift-choice');
    input.style.borderColor = '#ff4444';
    input.placeholder = '⚠️ Zəhmət olmasa bir hədiyyə yazın...';
    setTimeout(() => {
      input.style.borderColor = 'rgba(255, 215, 0, 0.2)';
      input.placeholder = 'Məsələn: Güllər, Parfüm, SPA...';
    }, 2000);
    return;
  }

  const data = window.valentineData;

  // Arzunu Firebase-ə yaz
  if (window.firebaseId) {
    fetch(`${FIREBASE_URL}/links/${window.firebaseId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wish: giftInput })
    }).catch(() => { });
  }

  // WhatsApp mesajı — birbaşa UTF-8 simvollar
  const msg = [
    '\uD83C\uDF38 S\u00FCrprizini a\u00E7d\u0131m, \u00E7ox g\u00F6z\u0259l idi! \uD83C\uDF38',
    '\u2728 \u018Fn \u00E7ox arzulad\u0131\u011F\u0131m: *' + giftInput + '*',
    '\uD83E\uDD70 \u2014 compstyle.tech'
  ].join('\n\n');

  const phone = data.p.startsWith('994') ? data.p : '994' + data.p;
  const url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);

  // Mobil üçün ən etibarlı üsul — anchor click
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}




// ===== Confetti =====
function createConfetti() {
  const colors = ['#ffd700', '#ff6b9d', '#e91e63', '#ff5c8d', '#ffe44d', '#ff8fab', '#ffaa00', '#fff5cc'];
  const shapes = ['circle', 'square', 'star'];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + 'vw';

    const color = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.backgroundColor = color;
    confetti.style.boxShadow = `0 0 4px ${color}`;

    const size = Math.random() * 10 + 5;
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';

    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    if (shape === 'circle') confetti.style.borderRadius = '50%';
    else if (shape === 'star') {
      confetti.style.borderRadius = '2px';
      confetti.style.transform = 'rotate(45deg)';
    }

    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    confetti.style.animationDelay = (Math.random() * 1.5) + 's';
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 6000);
  }
}

// ===== Helper: Lighten Color =====
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

// ===== Light Rays =====
function createLightRays() {
  const container = document.getElementById('loader-rays');
  if (!container) return;

  const rayCount = 12;
  const colors = ['rgba(255, 215, 0, 0.4)', 'rgba(233, 30, 99, 0.3)', 'rgba(255, 170, 0, 0.3)'];

  for (let i = 0; i < rayCount; i++) {
    const ray = document.createElement('div');
    ray.className = 'loader-ray';
    const angle = (i / rayCount) * 360;
    const color = colors[i % colors.length];
    ray.style.background = `linear-gradient(to bottom, ${color}, transparent)`;
    ray.style.transform = `rotate(${angle}deg)`;
    ray.style.animationDelay = (i * 0.15) + 's';
    container.appendChild(ray);
  }
}

// ===== Sparkle Burst =====
function createSparkleBurst() {
  const container = document.getElementById('sparkle-burst');
  if (!container) return;

  const sparkleCount = 20;
  const colors = ['#ffd700', '#ff6b9d', '#fff5cc', '#e91e63', '#ffaa00'];

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'burst-sparkle';
    const angle = (i / sparkleCount) * Math.PI * 2;
    const distance = 60 + Math.random() * 100;
    const tx = Math.cos(angle) * distance + 'px';
    const ty = Math.sin(angle) * distance + 'px';
    sparkle.style.setProperty('--tx', tx);
    sparkle.style.setProperty('--ty', ty);
    const color = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.backgroundColor = color;
    sparkle.style.boxShadow = `0 0 8px ${color}`;
    const size = Math.random() * 5 + 3;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    sparkle.style.animationDelay = (Math.random() * 0.3) + 's';
    container.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 2000);
  }
}

// ===== Rose Petals =====
function createRosePetals() {
  const container = document.getElementById('loader-petals');
  if (!container) return;

  const petalColors = ['#ff6b9d', '#e91e63', '#f06292', '#ff5c8d', '#c2185b'];
  const petalCount = 15;

  for (let i = 0; i < petalCount; i++) {
    setTimeout(() => {
      const petal = document.createElement('div');
      petal.className = 'loader-petal';
      const color = petalColors[Math.floor(Math.random() * petalColors.length)];
      petal.innerHTML = `<svg viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="8" ry="5" fill="${color}" opacity="0.7" transform="rotate(${Math.random() * 360} 10 10)"/></svg>`;
      petal.style.left = Math.random() * 100 + '%';
      const size = Math.random() * 14 + 12;
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.animationDuration = (Math.random() * 3 + 3) + 's';
      container.appendChild(petal);

      setTimeout(() => petal.remove(), 7000);
    }, i * 300);
  }
}

// ===== Loader Particles =====
function createLoaderParticles() {
  const container = document.getElementById('loader-particles');
  if (!container) return;

  const colors = ['#ffd700', '#ff6b9d', '#e91e63', '#ffaa00', '#ff5c8d'];
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'loader-particle';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 6 + 3;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
    particle.style.left = Math.random() * 100 + '%';
    particle.style.bottom = '-10px';
    particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
    particle.style.animationDelay = (Math.random() * 2) + 's';
    container.appendChild(particle);
  }
}

// ===== Star Field Background =====
function createStarField() {
  const container = document.getElementById('star-field');
  if (!container) return;

  const starCount = 40;
  const colors = ['#ffd700', '#ff6b9d', '#fff5cc', '#ffaa00', '#e91e63'];

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'mini-star';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 4 + 2;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.backgroundColor = color;
    star.style.boxShadow = `0 0 ${size * 3}px ${color}`;
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDuration = (Math.random() * 2 + 1) + 's';
    star.style.animationDelay = (Math.random() * 3) + 's';
    container.appendChild(star);
  }
}

// ===== Magic Stars Burst (from Gift Box) =====
function createMagicStars() {
  const stage = document.querySelector('.loader-center-stage');
  if (!stage) return;

  const starCount = 16;
  const colors = ['#ffd700', '#ff6b9d', '#e91e63', '#ffaa00', '#fff5cc', '#ff5c8d'];
  const starSVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'magic-star';
    star.innerHTML = starSVG;
    const color = colors[Math.floor(Math.random() * colors.length)];
    star.style.color = color;
    star.style.filter = `drop-shadow(0 0 6px ${color})`;

    const size = Math.random() * 18 + 10;
    star.style.width = size + 'px';
    star.style.height = size + 'px';

    const angle = (i / starCount) * Math.PI * 2;
    const midDist = 40 + Math.random() * 30;
    const endDist = 100 + Math.random() * 80;
    const sx = Math.cos(angle) * midDist + 'px';
    const sy = Math.sin(angle) * midDist - 20 + 'px';
    const ex = Math.cos(angle) * endDist + 'px';
    const ey = Math.sin(angle) * endDist - 40 + 'px';

    star.style.setProperty('--sx', sx);
    star.style.setProperty('--sy', sy);
    star.style.setProperty('--ex', ex);
    star.style.setProperty('--ey', ey);
    star.style.animationDelay = (Math.random() * 0.3) + 's';

    stage.appendChild(star);
    setTimeout(() => star.remove(), 2000);
  }
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  createSparkles();
  initCreatorPage();
  initValentinePage();
});
