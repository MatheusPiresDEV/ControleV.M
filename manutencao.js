// --- CONTROLE DE SESSÃO SEPARADO ---
const activeSession = sessionStorage.getItem('eh_session') || 'guest';
const STORAGE_PREFIX = activeSession === 'admin' ? 'admin_' : 'guest_';

// Estruturas de Dados locais
let garageSettings = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'garage')) || { 
    model: '', 
    currentKm: 0, 
    oilInterval: 5000,
    oilStartKm: 0 
};
let fuelRecords = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'fuel_records')) || [];
let maintRecords = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'maint_records')) || [];
let customReminders = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'reminders')) || [
    { text: "Verificar calibragem dos pneus", done: false },
    { text: "Lubrificar a corrente", done: false }
];

// Intervalos de Manutenções Preventivas de Manual (Modificável)
const PREVENTIVE_CONFIG = [
    { name: "Filtro de Ar", interval: 10000, icon: "fa-wind", color: "#00bbf9" },
    { name: "Vela de Ignição", interval: 12000, icon: "fa-bolt", color: "#ffb703" },
    { name: "Kit Relação (Corrente/Coroa/Pinhão)", interval: 20000, icon: "fa-circle-nodes", color: "#ff85a1" }
];

// Ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date().toISOString().split('T')[0];
    if (document.getElementById('fuel-date')) document.getElementById('fuel-date').value = hoje;
    if (document.getElementById('maint-date')) document.getElementById('maint-date').value = hoje;

    loadVehicleData();
    calculateDashboardMetrics();
    renderReminders();
    renderPreventiveStatus();
    renderHistoryAndCharts();
    initCanvas();
});

function loadVehicleData() {
    if (document.getElementById('veh-model')) document.getElementById('veh-model').value = garageSettings.model;
    if (document.getElementById('veh-km')) document.getElementById('veh-km').value = garageSettings.currentKm;
    if (document.getElementById('veh-oil-interval')) document.getElementById('veh-oil-interval').value = garageSettings.oilInterval;
    if (document.getElementById('veh-oil-start')) document.getElementById('veh-oil-start').value = garageSettings.oilStartKm || garageSettings.currentKm;
}

function saveVehicleSettings() {
    const modelEl = document.getElementById('veh-model');
    const kmEl = document.getElementById('veh-km');
    const intervalEl = document.getElementById('veh-oil-interval');
    const oilStartEl = document.getElementById('veh-oil-start');

    if (!modelEl || !kmEl || !intervalEl || !oilStartEl) return;

    garageSettings.model = modelEl.value.trim();
    garageSettings.currentKm = parseInt(kmEl.value) || 0;
    garageSettings.oilInterval = parseInt(intervalEl.value) || 5000;
    garageSettings.oilStartKm = parseInt(oilStartEl.value) || garageSettings.currentKm;

    localStorage.setItem(STORAGE_PREFIX + 'garage', JSON.stringify(garageSettings));
    showToast("Garagem atualizada!");
    calculateDashboardMetrics();
    renderPreventiveStatus();
}

// LANÇAR COMBUSTÍVEL
function addFuelRecord() {
    const km = parseInt(document.getElementById('fuel-km').value);
    const liters = parseFloat(document.getElementById('fuel-liters').value);
    const price = parseFloat(document.getElementById('fuel-price').value); // Preço Total
    const date = document.getElementById('fuel-date').value;

    if (!km || !liters || !price || !date) { alert("Preencha todos os campos do abastecimento."); return; }

    fuelRecords.push({ km, liters, price, date });
    localStorage.setItem(STORAGE_PREFIX + 'fuel_records', JSON.stringify(fuelRecords));

    if (km > garageSettings.currentKm) {
        garageSettings.currentKm = km;
        const vehKmEl = document.getElementById('veh-km');
        if (vehKmEl) vehKmEl.value = km;
        localStorage.setItem(STORAGE_PREFIX + 'garage', JSON.stringify(garageSettings));
    }

    showToast("Abastecimento registrado com sucesso!");
    clearInputs(['fuel-km', 'fuel-liters', 'fuel-price']);
    calculateDashboardMetrics();
    renderPreventiveStatus();
    renderHistoryAndCharts();
}

// LANÇAR OFICINA
function addMaintRecord() {
    const type = document.getElementById('maint-type').value;
    const desc = document.getElementById('maint-desc').value.trim();
    const km = parseInt(document.getElementById('maint-km').value);
    const price = parseFloat(document.getElementById('maint-price').value);
    const date = document.getElementById('maint-date').value;

    if (!desc || !km || isNaN(price) || !date) { alert("Preencha os campos obrigatórios."); return; }

    maintRecords.push({ type, desc, km, price, date });
    localStorage.setItem(STORAGE_PREFIX + 'maint_records', JSON.stringify(maintRecords));

    if (km > garageSettings.currentKm) {
        garageSettings.currentKm = km;
        const vehKmEl = document.getElementById('veh-km');
        if (vehKmEl) vehKmEl.value = km;
        localStorage.setItem(STORAGE_PREFIX + 'garage', JSON.stringify(garageSettings));
    }

    showToast("Manutenção registrada!");
    clearInputs(['maint-desc', 'maint-km', 'maint-price']);
    calculateDashboardMetrics();
    renderPreventiveStatus();
    renderHistoryAndCharts();
}

// MÉTRICAS DO CORE (MÉDIAS, VALORES, CONSUMO POR LITRO)
function calculateDashboardMetrics() {
    // 1. Status do Óleo
    const ultimaTroca = maintRecords.filter(r => r.type === "Troca de Óleo").sort((a, b) => b.km - a.km)[0];
    const kmUltimaTroca = ultimaTroca ? ultimaTroca.km : (garageSettings.oilStartKm || 0);
    const kmRodadosComOleo = garageSettings.currentKm - kmUltimaTroca;
    const restanteOleo = garageSettings.oilInterval - kmRodadosComOleo;

    const oilCard = document.getElementById('card-oil-status');
    const oilSub = document.getElementById('card-oil-sub');
    if (oilCard && oilSub) {
        if (restanteOleo <= 0) {
            oilCard.innerText = "CRÍTICO! Troque Já";
            oilCard.style.color = "#ff4757";
            oilSub.innerText = `Passou ${Math.abs(restanteOleo)} KM do limite.`;
        } else {
            oilCard.innerText = `${restanteOleo} KM restantes`;
            oilCard.style.color = "#00f5d4";
            oilSub.innerText = ultimaTroca ? `Última troca feita com ${kmUltimaTroca} KM.` : `Contando do KM inicial: ${kmUltimaTroca} KM.`;
        }
    }

    // 2. Média de Consumo Real (Exige 2 ou mais registros para calcular a variação de KM real)
    let consumoMedio = 0;
    if (fuelRecords.length > 1) {
        const ordenados = [...fuelRecords].sort((a, b) => a.km - b.km);
        const deltaKm = ordenados[ordenados.length - 1].km - ordenados[0].km;
        const totalLiters = ordenados.slice(0, -1).reduce((sum, r) => sum + r.liters, 0);
        consumoMedio = totalLiters > 0 ? (deltaKm / totalLiters) : 0;
    }
    const consumptionEl = document.getElementById('card-consumption');
    if (consumptionEl) {
        consumptionEl.innerText = consumoMedio > 0 ? `${consumoMedio.toFixed(2)} km/L` : "Falta 1 abastecimento...";
    }

    // 3. Preço por KM Rodado Geral
    const totalGastoCombustivel = fuelRecords.reduce((sum, r) => sum + r.price, 0);
    const totalGastoMaint = maintRecords.reduce((sum, r) => sum + r.price, 0);
    const totalGeral = totalGastoCombustivel + totalGastoMaint;

    let custoPorKm = 0;
    const Kms = fuelRecords.map(r => r.km).concat(maintRecords.map(r => r.km)).concat([garageSettings.currentKm]);
    const minKm = Math.min(...Kms);
    const maxKm = Math.max(...Kms);
    const deltaTotal = maxKm - minKm;
    custoPorKm = deltaTotal > 0 ? (totalGeral / deltaTotal) : 0;

    const costKmEl = document.getElementById('card-cost-per-km');
    if (costKmEl) costKmEl.innerText = `R$ ${custoPorKm.toFixed(2)} / KM`;

    // 4. Preço Médio por Litro
    const totalLitros = fuelRecords.reduce((sum, r) => sum + r.liters, 0);
    let precoMedioLitro = totalLitros > 0 ? (totalGastoCombustivel / totalLitros) : 0;
    const avgFuelEl = document.getElementById('card-avg-fuel-price');
    if (avgFuelEl) avgFuelEl.innerText = `R$ ${precoMedioLitro.toFixed(2)}`;
}

// SISTEMA RECOMENDADOR DE PREVENTIVAS DE COMPONENTES
function renderPreventiveStatus() {
    const grid = document.getElementById('preventive-grid');
    if (!grid) return;
    grid.innerHTML = '';

    PREVENTIVE_CONFIG.forEach(item => {
        // Busca a última manutenção realizada cujo termo da descrição coincida com o nome do item
        const manuts = maintRecords.filter(r => r.desc.toLowerCase().includes(item.name.toLowerCase())).sort((a,b) => b.km - a.km);
        const ultimoKmManut = manuts.length > 0 ? manuts[0].km : (garageSettings.oilStartKm || 0);
        
        const kmRodados = garageSettings.currentKm - ultimoKmManut;
        const restante = item.interval - kmRodados;
        const percent = Math.max(0, Math.min(100, (restante / item.interval) * 100));

        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.cssText = `border-top: 3px solid ${restante <= 0 ? '#ff4757' : item.color}; background: rgba(0,0,0,0.2); padding: 15px;`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                <strong><i class="fa-solid ${item.icon}" style="color:${item.color}"></i> ${item.name}</strong>
                <span style="font-size: 0.85rem; color: ${restante <= 0 ? '#ff4757' : '#00f5d4'}">
                    ${restante <= 0 ? 'Trocar Já!' : restante + ' KM rest.'}
                </span>
            </div>
            <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 6px; overflow:hidden;">
                <div style="background: ${restante <= 0 ? '#ff4757' : item.color}; width: ${percent}%; height:100%;"></div>
            </div>
            <small style="opacity:0.5; font-size:0.75rem; display:block; margin-top:8px;">Substituição a cada ${item.interval} KM</small>
        `;
        grid.appendChild(card);
    });
}

// RENDERIZAR HISTÓRICO COM EXIBIÇÃO DE VALOR TOTAL, PREÇO POR LITRO E LITROS
function renderHistoryAndCharts() {
    const filterEl = document.getElementById('filter-period');
    const timeline = document.getElementById('history-timeline');
    if (!timeline) return;

    const filtro = filterEl ? filterEl.value : 'all';
    timeline.innerHTML = '';

    let todasAtividades = [];
    fuelRecords.forEach(r => todasAtividades.push({ ...r, classe: 'Abastecimento', icone: 'fa-gas-pump', cor: '#00bbf9' }));
    maintRecords.forEach(r => todasAtividades.push({ ...r, classe: r.type, icone: 'fa-wrench', cor: '#00f5d4' }));
    todasAtividades.sort((a, b) => new Date(b.date) - new Date(a.date));

    const agora = new Date();
    const filtrados = todasAtividades.filter(act => {
        if (filtro === 'all') return true;
        const dataAct = new Date(act.date);
        const diffDays = Math.ceil(Math.abs(agora - dataAct) / (1000 * 60 * 60 * 24));
        if (filtro === 'week') return diffDays <= 7;
        if (filtro === 'month') return diffDays <= 30;
        if (filtro === 'year') return diffDays <= 365;
        return true;
    });

    if (filtrados.length === 0) {
        timeline.innerHTML = `<p style="opacity:0.5; text-align:center;">Nenhuma atividade localizada.</p>`;
    }

    filtrados.forEach(act => {
        const item = document.createElement('div');
        item.style.cssText = `padding: 14px; background: rgba(255,255,255,0.03); margin-bottom: 10px; border-radius: 8px; border-left: 4px solid ${act.cor}; display: flex; justify-content: space-between; align-items: center;`;
        
        let subTexto = '';
        let valorDireita = `R$ ${act.price.toFixed(2)}`;

        if (act.classe === 'Abastecimento') {
            const precoPorLitro = act.price / act.liters;
            subTexto = `${act.liters} Litros`;
            // Formatação solicitada: Abastecimento - 12 Litros | KM | Preço Litro e valor total
            item.innerHTML = `
                <div>
                    <strong><i class="fa-solid ${act.icone}"></i> ${act.classe} - ${subTexto}</strong>
                    <br><span style="font-size:0.85rem; opacity:0.7;">KM: ${act.km} | Data: ${act.date.split('-').reverse().join('/')}</span>
                    <br><small style="opacity:0.5;">Preço por Litro: R$ ${precoPorLitro.toFixed(2)}</small>
                </div>
                <div style="text-align:right;">
                    <span style="font-weight:bold; color: ${act.cor}; font-size:1.1rem;">${valorDireita}</span>
                    <br><small style="opacity:0.4; font-size:0.75rem;">Valor Total</small>
                </div>
            `;
        } else {
            subTexto = act.desc;
            item.innerHTML = `
                <div>
                    <strong><i class="fa-solid ${act.icone}"></i> ${act.classe}</strong> - <small>${subTexto}</small>
                    <br><span style="font-size:0.85rem; opacity:0.7;">KM: ${act.km} | Data: ${act.date.split('-').reverse().join('/')}</span>
                </div>
                <span style="font-weight:bold; color: ${act.cor}; font-size:1.1rem;">${valorDireita}</span>
            `;
        }
        timeline.appendChild(item);
    });

    renderHeatmap(todasAtividades);
}

// HISTÓRICO DE LEMBRETES EDITÁVEIS
function renderReminders() {
    const list = document.getElementById('reminders-list');
    if (!list) return;
    list.innerHTML = '';

    customReminders.forEach((rem, idx) => {
        const item = document.createElement('div');
        item.className = 'reminder-item';
        item.innerHTML = `
            <input type="checkbox" ${rem.done ? 'checked' : ''} onchange="toggleReminder(${idx})">
            <span style="flex:1; font-size:0.9rem; ${rem.done ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${rem.text}</span>
            <i class="fa-solid fa-trash" onclick="deleteReminder(${idx})" style="cursor:pointer; opacity:0.5; font-size:0.85rem; color:#ff4757;"></i>
        `;
        list.appendChild(item);
    });
}

function addCustomReminder() {
    const input = document.getElementById('new-reminder-text');
    if (!input || !input.value.trim()) return;
    customReminders.push({ text: input.value.trim(), done: false });
    localStorage.setItem(STORAGE_PREFIX + 'reminders', JSON.stringify(customReminders));
    input.value = '';
    renderReminders();
}

function toggleReminder(idx) {
    customReminders[idx].done = !customReminders[idx].done;
    localStorage.setItem(STORAGE_PREFIX + 'reminders', JSON.stringify(customReminders));
    renderReminders();
}

function deleteReminder(idx) {
    customReminders.splice(idx, 1);
    localStorage.setItem(STORAGE_PREFIX + 'reminders', JSON.stringify(customReminders));
    renderReminders();
}

// SIMULADOR INTELIGENTE
// SIMULADOR INTELIGENTE DE VIAGENS ATUALIZADO
function runTripSimulation() {
    const kmViagem = parseFloat(document.getElementById('sim-km').value);
    const precoInformado = parseFloat(document.getElementById('sim-fuel-price').value);

    // Validações de entrada
    if (!kmViagem || kmViagem <= 0) { 
        alert("Por favor, insira uma quilometragem válida."); 
        return; 
    }
    if (!precoInformado || precoInformado <= 0) { 
        alert("Por favor, informe o preço do combustível para realizar a projeção."); 
        return; 
    }

    // Define consumo médio padrão (fallback) caso o histórico esteja vazio ou com menos de 2 registros
    let consumoMedio = 30; // Média padrão estável para motos de 250cc
    if (fuelRecords.length > 1) {
        const ordenados = [...fuelRecords].sort((a, b) => a.km - b.km);
        const deltaKm = ordenados[ordenados.length - 1].km - ordenados[0].km;
        const totalLiters = ordenados.slice(0, -1).reduce((sum, r) => sum + r.liters, 0);
        if (totalLiters > 0) {
            consumoMedio = deltaKm / totalLiters;
        }
    }

    // Cálculos da simulação baseados no input do usuário
    const litrosNecessarios = kmViagem / consumoMedio;
    const custoTotalEstimado = litrosNecessarios * precoInformado;
    const custoPorKm = custoTotalEstimado / kmViagem;

    // Exibição dos resultados estilizados
    const resultadoDiv = document.getElementById('simulation-result');
    if (resultadoDiv) {
        resultadoDiv.style.display = 'block';
        resultadoDiv.innerHTML = `
            <h4 style="margin-top: 0; color: #00f5d4;"><i class="fa-solid fa-calculator"></i> Projeção de Gastos Realizada:</h4>
            <p style="margin: 10px 0; font-size: 0.95rem; opacity: 0.8;">
                <em>Cálculo baseado na sua média real de <strong>${consumoMedio.toFixed(1)} km/L</strong>.</em>
            </p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 15px 0;">
            <ul style="list-style: none; padding-left: 0; margin-bottom: 0;">
                <li style="margin-bottom: 10px;">
                    <i class="fa-solid fa-droplet" style="color: #00bbf9; width: 24px;"></i> 
                    Você vai gastar aproximadamente <strong>${litrosNecessarios.toFixed(1)} litros</strong> de combustível.
                </li>
                <li style="margin-bottom: 10px;">
                    <i class="fa-solid fa-coins" style="color: #ffb703; width: 24px;"></i> 
                    O custo total da viagem será de <strong>R$ ${custoTotalEstimado.toFixed(2)}</strong> (calculado a R$ ${precoInformado.toFixed(2)}/L).
                </li>
                <li style="margin-bottom: 0;">
                    <i class="fa-solid fa-road" style="color: #ff85a1; width: 24px;"></i> 
                    Seu custo estimado a cada 1 KM rodado é de <strong>R$ ${custoPorKm.toFixed(2)}</strong>.
                </li>
            </ul>
        `;
    }
}

// MAPA DE CALOR DE 30 DIAS
function renderHeatmap(atividades) {
    const heatmapContainer = document.getElementById('heatmap');
    if (!heatmapContainer) return;
    heatmapContainer.innerHTML = '';

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const stringData = d.toISOString().split('T')[0];

        const actsDoDia = atividades.filter(a => a.date === stringData);
        const totalGastoNoDia = actsDoDia.reduce((sum, a) => sum + a.price, 0);

        const diaBloco = document.createElement('div');
        diaBloco.classList.add('heatmap-day');

        if (totalGastoNoDia > 0) {
            if (totalGastoNoDia < 50) diaBloco.style.background = 'rgba(0, 210, 255, 0.3)';
            else if (totalGastoNoDia < 200) diaBloco.style.background = 'rgba(0, 210, 255, 0.6)';
            else diaBloco.style.background = 'rgba(0, 245, 212, 1)';
        }

        diaBloco.setAttribute('data-info', `${stringData.split('-').reverse().join('/')}: R$ ${totalGastoNoDia.toFixed(2)}`);
        heatmapContainer.appendChild(diaBloco);
    }
}

function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = "background: rgba(13, 20, 38, 0.95); border-left: 4px solid #00f5d4; color: #fff; padding: 16px 24px; margin-top: 10px; border-radius: 6px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(10px); min-width: 280px; transition: all 0.3s;";
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function clearInputs(arrIds) {
    arrIds.forEach(id => { if (document.getElementById(id)) document.getElementById(id).value = ''; });
}

// --- CANVAS DE FUNDO ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let horizonY; let roadLines = [];

function initCanvas() {
    if (!canvas || !ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    horizonY = canvas.height * 0.58; roadLines = [];
    for (let i = 0; i < 8; i++) { roadLines.push((i / 8) * 100); }
    animateCanvas();
}

function animateCanvas() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#03050a'; ctx.fillRect(0, 0, canvas.width, horizonY);
    ctx.fillStyle = '#070913'; ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 2;
    for (let i = 0; i < roadLines.length; i++) {
        roadLines[i] += 0.3; if (roadLines[i] > 100) roadLines[i] = 0;
        let percent = roadLines[i] / 100;
        let y = horizonY + (canvas.height - horizonY) * (percent * percent);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', () => {
    if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; horizonY = canvas.height * 0.58; }
});