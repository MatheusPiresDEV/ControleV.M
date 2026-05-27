// --- 1. CANVAS BACKGROUND INTERATIVO (Estrada Infinita + Transição Atmosférica + Ciclo Dia/Noite) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetSpeed: 0.8 };
let speed = 0.8; 
let horizonY;
let roadLines = [];
let stars = [];
let isNight = true;

const currentHour = new Date().getHours();
isNight = currentHour < 6 || currentHour >= 18; 

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    horizonY = canvas.height * 0.58; 
    
    stars = [];
    if (isNight) {
        for(let i = 0; i < 45; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * horizonY,
                size: Math.random() * 1.2 + 0.5,
                baseAlpha: Math.random() * 0.4 + 0.2
            });
        }
    }

    roadLines = [];
    const totalLines = 12;
    for(let i = 0; i < totalLines; i++) {
        roadLines.push((i / totalLines) * 100);
    }
}

window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetSpeed = 0.3 + ((canvas.height - e.clientY) / canvas.height) * 1.2;
});

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    speed += (mouse.targetSpeed - speed) * 0.04;
    let curveFactor = (mouse.x - canvas.width / 2) / (canvas.width / 2);

    let skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    if (isNight) {
        skyGrad.addColorStop(0, '#02040a');
        skyGrad.addColorStop(0.6, '#081026');
        skyGrad.addColorStop(0.9, '#111f42');
        skyGrad.addColorStop(1, '#1b2d5a');
    } else {
        skyGrad.addColorStop(0, '#1a1c4b');  
        skyGrad.addColorStop(0.4, '#3b1c55'); 
        skyGrad.addColorStop(0.7, '#832161'); 
        skyGrad.addColorStop(0.9, '#da4453'); 
        skyGrad.addColorStop(1, '#f6bb42');   
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, horizonY);

    if (isNight) {
        stars.forEach(star => {
            ctx.fillStyle = `rgba(0, 210, 255, ${star.baseAlpha})`;
            ctx.beginPath();
            ctx.arc(star.x - (curveFactor * 15), star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    let roadGrad = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
    if (isNight) {
        roadGrad.addColorStop(0, '#0a0d1a');
        roadGrad.addColorStop(1, '#03050a');
    } else {
        roadGrad.addColorStop(0, '#1f1924'); 
        roadGrad.addColorStop(1, '#0d0a10');
    }
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

    let centerX = canvas.width / 2 + (curveFactor * 100);

    roadLines.forEach((progress, index) => {
        progress += speed;
        if (progress >= 100) progress = 0;
        roadLines[index] = progress;

        let normZ = progress / 100;
        let perspectiveY = horizonY + (normZ * normZ) * (canvas.height - horizonY);
        let roadWidth = normZ * canvas.width * 0.45;
        let opacity = normZ;

        ctx.strokeStyle = isNight ? `rgba(0, 245, 212, ${opacity * 0.25})` : `rgba(255, 133, 161, ${opacity * 0.35})`;
        ctx.lineWidth = 1 + normZ * 2;
        ctx.beginPath();
        ctx.moveTo(centerX - roadWidth / 2, perspectiveY);
        ctx.lineTo(centerX + roadWidth / 2, perspectiveY);
        ctx.stroke();

        if (Math.sin(progress * 0.2) > 0) {
            ctx.strokeStyle = `rgba(255, 211, 42, ${opacity * 0.6})`;
            ctx.lineWidth = 1 + normZ * 3;
            ctx.beginPath();
            let lineLength = 10 + normZ * 30;
            ctx.moveTo(centerX + (curveFactor * normZ * 30), perspectiveY);
            ctx.lineTo(centerX + (curveFactor * normZ * 30), perspectiveY + lineLength > canvas.height ? canvas.height : perspectiveY + lineLength);
            ctx.stroke();
        }
    });

    ctx.strokeStyle = isNight ? 'rgba(0, 210, 255, 0.15)' : 'rgba(234, 95, 148, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, horizonY);
    ctx.lineTo(canvas.width / 2 - canvas.width * 0.225 + (curveFactor * 100), canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, horizonY);
    ctx.lineTo(canvas.width / 2 + canvas.width * 0.225 + (curveFactor * 100), canvas.height);
    ctx.stroke();

    let atmosphericGlow = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 40);
    if (isNight) {
        atmosphericGlow.addColorStop(0, 'rgba(27, 45, 90, 0)');
        atmosphericGlow.addColorStop(0.6, 'rgba(27, 45, 90, 0.8)'); 
        atmosphericGlow.addColorStop(1, 'rgba(10, 13, 26, 0)');     
    } else {
        atmosphericGlow.addColorStop(0, 'rgba(246, 187, 66, 0)');
        atmosphericGlow.addColorStop(0.6, 'rgba(246, 187, 66, 0.5)'); 
        atmosphericGlow.addColorStop(1, 'rgba(31, 25, 36, 0)');
    }
    ctx.fillStyle = atmosphericGlow;
    ctx.fillRect(0, horizonY - 60, canvas.width, 100);

    requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animateCanvas();

// --- 2. ENGINE DE AUTENTICAÇÃO CRIPTOGRÁFICA (Segurança para Portfólio) ---
// Chave codificada para não deixar o texto "mathe0us" explícito para recrutadores
const AM_ENCODED = "bWF0aGUwdXM="; 

function showAdminPasswordInput() {
    document.getElementById('auth-choices').style.display = 'none';
    document.getElementById('admin-auth-box').style.display = 'block';
    document.getElementById('admin-pass').focus();
}

function backToChoices() {
    document.getElementById('admin-auth-box').style.display = 'none';
    document.getElementById('auth-choices').style.display = 'flex';
    document.getElementById('admin-pass').value = '';
}

function verifyAdminPassword() {
    const input = document.getElementById('admin-pass').value;
    
    // Validação direta e síncrona (Sem travar o navegador)
    if(btoa(input) === AM_ENCODED) {
        sessionStorage.setItem('eh_session', 'admin');
        document.getElementById('auth-overlay').style.display = 'none';
        document.querySelector('main').style.opacity = '1';
        
        // Garante que o app inicialize os dados do admin
        loadAppEngine();
        
        // Notificação de sucesso
        if (typeof showToast === "function") {
            showToast("Bem-vindo de volta, Capitão Matheus!");
        } else {
            alert("Bem-vindo de volta, Capitão Matheus!");
        }
    } else {
        if (typeof showToast === "function") {
            showToast("Chave de ignição incorreta.", "danger");
        } else {
            alert("Chave de ignição incorreta.");
        }
        document.getElementById('admin-pass').value = '';
        document.getElementById('admin-pass').focus();
    }
}

function enterAsGuest() {
    sessionStorage.setItem('eh_session', 'guest');
    document.getElementById('auth-overlay').style.display = 'none';
    document.querySelector('main').style.opacity = '1';
    
    loadAppEngine();
    
    if (typeof showToast === "function") {
        showToast("Navegando no modo Portfólio / Visitante.", "info");
    }
}

function logoutSession() {
    sessionStorage.removeItem('eh_session');
    window.location.reload();
}

// Executa a validação de sessão ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    const activeSession = sessionStorage.getItem('eh_session');
    if(activeSession) {
        document.getElementById('auth-overlay').style.display = 'none';
        document.querySelector('main').style.opacity = '1';
        loadAppEngine();
    }
});


// --- 3. SISTEMA FLUIDO DE FEEDBACK (Toasts) ---
function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '<i class="fa-solid fa-circle-check" style="color: var(--success-color)"></i>';
    if(type === 'danger') icon = '<i class="fa-solid fa-circle-exclamation" style="color: var(--accent-red)"></i>';
    if(type === 'info') icon = '<i class="fa-solid fa-circle-info" style="color: var(--primary-color)"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// --- 4. CONTROLE DE MENU RESPONSIVO ---
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});


// --- 5. ENGINE DE TEMPO REAL (Visões Separadas Admin vs Visitante) ---
let destinations = [];
let currentActiveCardId = null; 

function loadAppEngine() {
    const role = sessionStorage.getItem('eh_session');
    
    if (role === 'admin') {
        document.getElementById('life-stats').style.display = 'block';
        document.getElementById('guest-profile-setup').style.display = 'none';
        destinations = JSON.parse(localStorage.getItem('explore_destinations')) || [];
        setInterval(updateAdminCounters, 1000);
        updateAdminCounters();
    } else {
        // Fluxo do Visitante Customizado
        destinations = JSON.parse(localStorage.getItem('guest_destinations')) || [];
        const savedProfile = JSON.parse(localStorage.getItem('guest_profile'));
        
        if (savedProfile) {
            document.getElementById('life-stats').style.display = 'block';
            document.getElementById('guest-profile-setup').style.display = 'none';
            setInterval(updateGuestCounters, 1000);
            updateGuestCounters();
        } else {
            document.getElementById('life-stats').style.display = 'none';
            document.getElementById('guest-profile-setup').style.display = 'block';
        }
    }
    renderDashboard();
}

function updateAdminCounters() {
    const now = new Date();
    const BIRTH_DATE = new Date('2006-11-12T00:00:00');
    
    let ageYears = now.getFullYear() - BIRTH_DATE.getFullYear();
    let ageMonths = now.getMonth() - BIRTH_DATE.getMonth();
    let ageDays = now.getDate() - BIRTH_DATE.getDate();

    if (ageDays < 0) {
        const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        ageDays += prevMonthLastDay;
        ageMonths--;
    }
    if (ageMonths < 0) { ageMonths += 12; ageYears--; }

    let nextBday = new Date(now.getFullYear(), BIRTH_DATE.getMonth(), BIRTH_DATE.getDate());
    if (now > nextBday) nextBday.setFullYear(now.getFullYear() + 1);
    
    const diffTime = nextBday - now;
    const totalDaysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const monthsLeft = Math.floor(totalDaysLeft / 30.43);
    const daysLeft = Math.floor(totalDaysLeft % 30.43);
    const hoursLeft = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((diffTime % (1000 * 60)) / 1000);

    const currentYear = now.getFullYear();
    const tripsThisYear = destinations.filter(d => d.visited && d.completedAt && new Date(d.completedAt).getFullYear() === currentYear).length;
    const totalTrips = destinations.filter(d => d.visited).length;

    document.getElementById('welcome-stats').innerHTML = `Você tem <span style="color: #00f5d4; font-weight: bold;">${ageYears} anos, ${ageMonths} meses e ${ageDays} dias</span> de estrada e <span style="color: #ffd32a; font-weight: bold;">${totalTrips}</span> viagens realizadas!`;
    document.getElementById('bday-countdown').innerHTML = `Faltam <strong>${monthsLeft} meses, ${daysLeft} dias, ${hoursLeft}h, ${minutesLeft}m e ${secondsLeft}s</strong> para seu aniversário.<br>Você conquistou <strong>${tripsThisYear}</strong> destino(s) no ano de ${currentYear}!`;
}

function saveGuestProfile() {
    const name = document.getElementById('guest-name-input').value.trim();
    const bday = document.getElementById('guest-bday-input').value;

    if(!name || !bday) {
        alert("Preencha seu nome e nascimento para gerar as estatísticas!");
        return;
    }

    localStorage.setItem('guest_profile', JSON.stringify({ name: name, date: bday }));
    document.getElementById('guest-profile-setup').style.display = 'none';
    document.getElementById('life-stats').style.display = 'block';
    
    setInterval(updateGuestCounters, 1000);
    updateGuestCounters();
    showToast(`Perfil de ${name} criado com sucesso!`);
}

function updateGuestCounters() {
    const now = new Date();
    const profile = JSON.parse(localStorage.getItem('guest_profile'));
    if(!profile) return;

    const BIRTH_DATE = new Date(profile.date + 'T00:00:00');
    
    let ageYears = now.getFullYear() - BIRTH_DATE.getFullYear();
    let ageMonths = now.getMonth() - BIRTH_DATE.getMonth();
    let ageDays = now.getDate() - BIRTH_DATE.getDate();

    if (ageDays < 0) {
        const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        ageDays += prevMonthLastDay;
        ageMonths--;
    }
    if (ageMonths < 0) { ageMonths += 12; ageYears--; }

    let nextBday = new Date(now.getFullYear(), BIRTH_DATE.getMonth(), BIRTH_DATE.getDate());
    if (now > nextBday) nextBday.setFullYear(now.getFullYear() + 1);
    
    const diffTime = nextBday - now;
    const totalDaysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const monthsLeft = Math.floor(totalDaysLeft / 30.43);
    const daysLeft = Math.floor(totalDaysLeft % 30.43);
    const hoursLeft = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((diffTime % (1000 * 60)) / 1000);

    const currentYear = now.getFullYear();
    const tripsThisYear = destinations.filter(d => d.visited && d.completedAt && new Date(d.completedAt).getFullYear() === currentYear).length;
    const totalTrips = destinations.filter(d => d.visited).length;

    document.getElementById('welcome-stats').innerHTML = `Olá, <span style="color: #00f5d4; font-weight: bold;">${profile.name}</span>! Você já viveu <span>${ageYears} anos, ${ageMonths} meses e ${ageDays} dias</span> e tem <strong>${totalTrips}</strong> conquista(s)!`;
    document.getElementById('bday-countdown').innerHTML = `Faltam <strong>${monthsLeft}m, ${daysLeft}d, ${hoursLeft}h, ${minutesLeft}m e ${secondsLeft}s</strong> para seu próximo aniversário. Você registrou <strong>${tripsThisYear}</strong> viagem(ns) em ${currentYear}!`;
}


// --- 6. ENGINE DE DADOS COMPLETA (CRUD SEPARADO) ---
const destForm = document.getElementById('destination-form');
const visitedStatus = document.getElementById('visited-status');
const statusText = document.getElementById('status-text');

if(visitedStatus) {
    visitedStatus.addEventListener('change', () => {
        statusText.innerText = visitedStatus.checked ? "Já visitei!" : "Não fui ainda";
    });
}

if(destForm) {
    destForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('place-name').value;
        const isVisited = visitedStatus.checked;
        const now = new Date().toISOString();

        const transportType = document.getElementById('transport-type').value;
        const vehicleModel = document.getElementById('vehicle-model').value || "Não informado";
        const tripKm = parseFloat(document.getElementById('trip-km').value) || 0;
        const tripDays = parseInt(document.getElementById('trip-days').value) || 1;

        const newDest = {
            id: 'dest_' + Date.now(),
            name: name,
            visited: isVisited,
            createdAt: now,
            completedAt: isVisited ? now : null,
            rating: 0,
            photos: [],
            stats: { transport: transportType, model: vehicleModel, km: tripKm, days: tripDays }
        };

        destinations.push(newDest);
        saveAndRender();
        destForm.reset();
        statusText.innerText = "Não fui ainda";
        showToast(`"${name}" adicionado à lista!`);
    });
}

function saveAndRender() {
    const role = sessionStorage.getItem('eh_session');
    if(role === 'admin') {
        localStorage.setItem('explore_destinations', JSON.stringify(destinations));
    } else {
        localStorage.setItem('guest_destinations', JSON.stringify(destinations));
    }
    renderDashboard();
}

function calculateDuration(start, end) {
    if (!start || !end) return "";
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1 ? "Adicionado e visitado no mesmo dia" : `Planejado por ${diffDays} dia(s) antes de visitar`;
}

function renderDashboard() {
    const grid = document.getElementById('cards-grid');
    if(!grid) return;
    grid.innerHTML = '';
    let visitedCount = 0, pendingCount = 0;

    destinations.forEach(dest => {
        if (dest.visited) visitedCount++; else pendingCount++;

        const card = document.createElement('div');
        card.className = 'glass-card dest-card';
        let durationText = dest.visited ? calculateDuration(dest.createdAt, dest.completedAt) : "Aguardando sua visita";
        
        let transportSpecsHTML = '';
        if (dest.stats) {
            const icon = dest.stats.transport === 'Moto' ? 'fa-motorcycle' : dest.stats.transport === 'Carro' ? 'fa-car' : 'fa-route';
            transportSpecsHTML = `
                <div class="trip-specs" style="margin: 10px 0; font-size: 0.9rem; opacity: 0.85; display: flex; gap: 10px; flex-wrap: wrap;">
                    <span><i class="fa-solid ${icon}"></i> ${dest.stats.model}</span>
                    <span><i class="fa-solid fa-road"></i> ${dest.stats.km} KM</span>
                    <span><i class="fa-solid fa-calendar-day"></i> ${dest.stats.days} dia(s)</span>
                </div>
            `;
        }

        let carouselHTML = '';
        if (dest.visited && dest.photos && dest.photos.length > 0) {
            carouselHTML = `
                <div class="carousel-container" id="carousel-${dest.id}">
                    <div class="carousel-track" style="transform: translateX(0px)">
                        ${dest.photos.map(p => `<img src="${p}" class="carousel-img" onclick="openLightbox('${p}')">`).join('')}
                    </div>
                    ${dest.photos.length > 1 ? `
                        <button class="carousel-btn prev" onclick="moveCarousel('${dest.id}', -1, event)"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="carousel-btn next" onclick="moveCarousel('${dest.id}', 1, event)"><i class="fa-solid fa-chevron-right"></i></button>
                    ` : ''}
                </div>
            `;
        }

        let starsHTML = '';
        if (dest.visited) {
            starsHTML = `<div class="stars-rating">`;
            for (let i = 1; i <= 5; i++) {
                starsHTML += `<i class="fa-star fa-solid ${i <= dest.rating ? 'checked' : ''}" onclick="rateDestination('${dest.id}', ${i})"></i>`;
            }
            starsHTML += `</div>`;
        }

        card.innerHTML = `
            <div>
                <div class="card-header">
                    <h3>${dest.name}</h3>
                    <span class="status-badge ${dest.visited ? 'visited' : 'pending'}">${dest.visited ? 'Visitado' : 'Quero Ir'}</span>
                </div>
                <p class="time-elapsed" style="font-size:0.85rem; margin-bottom:5px;"><i class="fa-regular fa-clock"></i> ${durationText}</p>
                ${transportSpecsHTML}
                ${carouselHTML}
                ${starsHTML}
            </div>
            <div class="card-actions">
                <button class="btn-secondary" onclick="toggleVisited('${dest.id}')">
                    <i class="fa-solid ${dest.visited ? 'fa-arrow-rotate-left' : 'fa-check'}"></i> 
                    ${dest.visited ? 'Mudar para Quero Ir' : 'Marcar como já fui'}
                </button>
                <div class="action-row">
                    ${dest.visited ? `<button class="btn-primary" onclick="openPhotoModal('${dest.id}')"><i class="fa-solid fa-camera"></i> Fotos</button>` : ''}
                    <button class="btn-danger" onclick="deleteDestination('${dest.id}', '${dest.name}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    document.getElementById('total-visited').innerText = visitedCount;
    document.getElementById('total-pending').innerText = pendingCount;
}

function toggleVisited(id) {
    const dest = destinations.find(d => d.id === id);
    if (dest) {
        dest.visited = !dest.visited;
        dest.completedAt = dest.visited ? new Date().toISOString() : null;
        if(!dest.visited) { dest.photos = []; dest.rating = 0; } 
        saveAndRender();
        showToast(`Status de "${dest.name}" atualizado!`, 'info');
    }
}

function deleteDestination(id, name) {
    if(confirm(`Tem certeza que deseja remover "${name}"?`)) {
        destinations = destinations.filter(d => d.id !== id);
        saveAndRender();
        showToast(`"${name}" removido.`, 'danger');
    }
}

function rateDestination(id, rating) {
    const dest = destinations.find(d => d.id === id);
    if (dest) {
        dest.rating = rating;
        saveAndRender();
    }
}

// --- 7. MODAIS & MULTIMÍDIA ---
function openModal(modalId) { document.getElementById(modalId).style.display = 'flex'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

function openLightbox(src) {
    document.getElementById('lightbox-img').src = src;
    openModal('lightbox-modal');
}

const carouselPositions = {};
function moveCarousel(id, direction, event) {
    event.stopPropagation();
    const container = document.getElementById(`carousel-${id}`);
    const track = container.querySelector('.carousel-track');
    const imgCount = track.children.length;
    
    if (!carouselPositions[id]) carouselPositions[id] = 0;
    carouselPositions[id] += direction;
    if (carouselPositions[id] < 0) carouselPositions[id] = imgCount - 1;
    if (carouselPositions[id] >= imgCount) carouselPositions[id] = 0;
    
    track.style.transform = `translateX(-${carouselPositions[id] * 100}%)`;
}

function openPhotoModal(id) {
    currentActiveCardId = id;
    renderModalPhotosPreview();
    openModal('photo-modal');
}

const fileInput = document.getElementById('file-input');
const uploadLoader = document.getElementById('upload-loader');

if(fileInput) {
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        const dest = destinations.find(d => d.id === currentActiveCardId);
        if(!files.length) return;

        uploadLoader.style.display = 'block';
        let loadedCount = 0;
        files.forEach(file => {
            if (file.size > 1.5 * 1024 * 1024) { 
                showToast(`A imagem "${file.name}" excede 1.5MB.`, 'danger');
                loadedCount++;
                if(loadedCount === files.length) uploadLoader.style.display = 'none';
                return; 
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    const canvasComp = document.createElement('canvas');
                    const ctxComp = canvasComp.getContext('2d');
                    let width = img.width, height = img.height;
                    
                    if (width > 900) { height *= 900 / width; width = 900; }
                    canvasComp.width = width; canvasComp.height = height;
                    ctxComp.drawImage(img, 0, 0, width, height);
                    
                    const base64Str = canvasComp.toDataURL('image/jpeg', 0.65); 
                    dest.photos.push(base64Str);
                    
                    loadedCount++;
                    if(loadedCount === files.length) {
                        saveAndRender();
                        renderModalPhotosPreview();
                        uploadLoader.style.display = 'none';
                        showToast("Imagens importadas!");
                    }
                }
            }
            reader.readAsDataURL(file);
        });
    });
}

function renderModalPhotosPreview() {
    const preview = document.getElementById('modal-photos-preview');
    if(!preview) return;
    preview.innerHTML = '';
    const dest = destinations.find(d => d.id === currentActiveCardId);
    
    if (dest && dest.photos) {
        dest.photos.forEach((photo, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'preview-img-wrap';
            wrap.innerHTML = `<img src="${photo}"><button class="remove-photo-btn" onclick="removePhoto(${idx})">&times;</button>`;
            preview.appendChild(wrap);
        });
    }
}

function removePhoto(idx) {
    const dest = destinations.find(d => d.id === currentActiveCardId);
    if(dest) {
        dest.photos.splice(idx, 1);
        saveAndRender();
        renderModalPhotosPreview();
        showToast("Foto removida.", 'info');
    }
}