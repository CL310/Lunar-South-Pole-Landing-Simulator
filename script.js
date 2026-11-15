// Landing Site Static Database
const landingStaticData = {
    site1: { name: "Peak near Cabeus B", coord: "83.6° S, 68.8° W", slope: "Largely exceeding 8°", comm: "Restricted", baseLight: 49, risk: "High", desc: "Offers access to PSRs, but steep slopes and low illumination (49%) make it risky for solar power." },
    site2: { name: "Haworth", coord: "87.5° S, 5.2° W", slope: "Roughly 6°", comm: "Moderate", baseLight: 42, risk: "Medium", desc: "Extremely close to the pole. Rough terrain, highly variable illumination, but excellent access to water ice." },
    site3: { name: "Malapert Massif", coord: "85.96° S, 3.28° W", slope: "~ 4° incline", comm: "Good visibility", baseLight: 85, risk: "Low", desc: "Massive mountain. High elevation provides near-continuous sunlight and clear Earth line-of-sight." },
    site4: { name: "Mons Mouton", coord: "84.79° S, 29.20° E", slope: "~ 3° incline", comm: "Good visibility", baseLight: 82, risk: "Low", desc: "Elevated plateau region. Flat terrain, good lighting, near shadowed craters that may hold water ice." },
    site8: { name: "Mons Mouton Plateau", coord: "84.27° S, 36.67° E", slope: "~ 5° incline", comm: "Good visibility", baseLight: 80, risk: "Low", desc: "A high, flat plateau adjacent to Mons Mouton. Excellent for surface mobility." },
    site9: { name: "Nobile Rim 1", coord: "85.4° S, 31.8° E", slope: "Roughly 8°", comm: "Moderate", baseLight: 65, risk: "Medium", desc: "A crater rim near Mons Mouton. Promising for accessing volatile-rich PSRs." },
    site10: { name: "Nobile Rim 2", coord: "85.5° S, 31.5° E", slope: "Roughly 8°", comm: "Moderate", baseLight: 62, risk: "Medium", desc: "Another rim segment of Nobile crater, offering alternate access to deep polar shadows." },
    site11: { name: "de Gerlache Rim 2", coord: "88.5° S, 87.1° W", slope: "~ 10° incline", comm: "Poor", baseLight: 55, risk: "High", desc: "A rim on the de Gerlache crater near the South Pole. Cold traps are accessible but illumination is low." },
    site12: { name: "Slater Plain", coord: "89.0° S, 120.0° E", slope: "Relatively flat", comm: "Poor", baseLight: 50, risk: "High", desc: "A relatively flat plain very close to the pole. Challenging illumination conditions." },
    site5: { name: "Shiv Shakti Point (Chandrayaan-3)", coord: "69.37° S, 32.31° E", slope: "Unknown terrain", comm: "Direct Earth link", baseLight: 85, risk: "Medium", desc: "Historic landing site of India's Chandrayaan-3. Southern high latitudes with rough terrain." },
    site6: { name: "Taurus-Littrow (Apollo 17)", coord: "20.19° N, 30.77° E", slope: "Valley terrain", comm: "Direct Earth link", baseLight: 95, risk: "Low", desc: "Deep lunar valley visited by the last Apollo mission. Excellent, predictable illumination." },
    site7: { name: "Mare Tranquillitatis (Apollo 11)", coord: "0.67° N, 23.47° E", slope: "Flat mare", comm: "Direct Earth link", baseLight: 99, risk: "Low", desc: "First human landing site. Flat basaltic plain near the equator. Perfect Earth visibility." },
    site13: { name: "Malapert A (IM-1 Target)", coord: "80.13° S, 1.44° E", slope: "~ 12° incline", comm: "Direct Earth link", baseLight: 78, risk: "Medium", desc: "Target for Intuitive Machines IM-1. East of Malapert A crater. Terrain obstruction is a concern." },
    site14: { name: "Nobile Crater (VIPER)", coord: "85.43° S, 31.73° E", slope: "~ 14° incline", comm: "VIPER region", baseLight: 70, risk: "Higher", desc: "Planned landing site for NASA's VIPER rover. Exploring water ice and volatiles on the western edge." }
};

window.landingStaticData = landingStaticData;

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const selectElem = document.getElementById('landing-select');
const dataPanel = document.getElementById('data-panel');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const peopleInput = document.getElementById('people-input');
const saveBtn = document.getElementById('save-btn');
const tip = document.getElementById('tip');

function drawSimulation(siteKey, dateVal, timeVal) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#080612";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    for(let i=0; i<20; i++){ ctx.fillRect((i*137)%canvas.width, (i*93)%220, 2, 2); }

    let sunAngle = 0.5, lightScore = 50;
    
    if (siteKey && landingStaticData[siteKey]) {
        const site = landingStaticData[siteKey];
        lightScore = site.baseLight;
        
        if (dateVal && timeVal) {
            const timestamp = new Date(dateVal + 'T' + timeVal).getTime();
            const dayCycle = Math.sin(timestamp / 2540000000); 
            sunAngle = 0.5 + (dayCycle * 0.35); 
            const fluctuation = dayCycle * 5;
            lightScore = Math.min(99, Math.max(30, Math.round(site.baseLight + fluctuation)));
        }
    }

    const sunX = canvas.width / 2 + Math.cos(sunAngle * Math.PI) * 150;
    const sunY = 80 - Math.sin(sunAngle) * 40;
    const sunGradient = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 35);
    sunGradient.addColorStop(0, '#fef08a');
    sunGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height); ctx.lineTo(0, 150);
    ctx.bezierCurveTo(120, 130, 200, 170, 320, 140);
    ctx.bezierCurveTo(420, 110, 480, 160, canvas.width, 145);
    ctx.lineTo(canvas.width, canvas.height); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c084fc'; ctx.stroke();

    ctx.fillStyle = "#cbd5e1"; ctx.font = "13px 'Outfit', sans-serif";
    ctx.fillText(siteKey ? `Target: ${landingStaticData[siteKey].name}` : "Status: Waiting...", 20, 30);
    ctx.fillText(`Illumination: ${siteKey ? lightScore + '%' : '--'}`, 20, 50);
}

window.getCurrentSimData = function() {
    const siteKey = selectElem.value;
    if (!siteKey || !landingStaticData[siteKey]) return null;
    const site = landingStaticData[siteKey];
    
    let lightScore = site.baseLight;
    const dateVal = dateInput.value;
    const timeVal = timeInput.value;
    
    if (dateVal && timeVal) {
        const timestamp = new Date(dateVal + 'T' + timeVal).getTime();
        const dayCycle = Math.sin(timestamp / 2540000000); 
        const fluctuation = dayCycle * 5;
        lightScore = Math.min(99, Math.max(30, Math.round(site.baseLight + fluctuation)));
    }
    return { site, lightScore, date: dateVal, crew: peopleInput.value };
};

function updateAll() {
    const siteKey = selectElem.value;
    drawSimulation(siteKey, dateInput.value, timeInput.value);

    if (!siteKey) {
        dataPanel.innerHTML = "🔭 Please select a target landing site...";
        return;
    }

    const simData = window.getCurrentSimData();
    const site = simData.site;
    const lightScore = simData.lightScore;

    let recommendation = lightScore > 85 ? "🌟 [Recommended] Excellent lighting!" : "⚠️ Moderate illumination.";

    dataPanel.innerHTML = `
        📍 <strong>Coordinates:</strong> ${site.coord} <br>
        ⛰ <strong>Slope/Terrain:</strong> ${site.slope} <br>
        ☀️ <strong>Illumination:</strong> ${lightScore}% (${recommendation}) <br>
        📡 <strong>Communication:</strong> <span style="color:#00ffcc">Available</span> <br>
        🛡 <strong>Risk Assessment:</strong> ${site.risk} <br>
        
        <div style="margin-top: 10px; padding: 10px; background: rgba(255, 68, 68, 0.1); border-left: 4px solid #ff4444; border-radius: 4px; color: #ff4444; font-weight: bold; ${lightScore < 60 ? '' : 'display: none;'}">
            ⚠️ WARNING: Low illumination. Sunset risk for solar power!
        </div>
        
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(58, 159, 237, 0.3); font-size: 12px; color: #9cb3d4;">
            <strong>Site Info:</strong> ${site.desc}
        </div>
    `;
}

selectElem.addEventListener('change', updateAll);
dateInput.addEventListener('change', updateAll);
timeInput.addEventListener('change', updateAll);

window.addEventListener('DOMContentLoaded', () => {
    dateInput.value = new Date().toISOString().split('T')[0];
    timeInput.value = "12:00";
    selectElem.value = ""; 
    peopleInput.value = "2";
    localStorage.removeItem('lunarSimConfig');
    updateAll();
});

saveBtn.addEventListener('click', () => {
    const config = { site: selectElem.value, date: dateInput.value, time: timeInput.value, people: peopleInput.value };
    if (!config.site) { alert("Please select a landing site first!"); return; }
    localStorage.setItem('lunarSimConfig', JSON.stringify(config));
    tip.style.display = 'block';
    setTimeout(() => { tip.style.display = 'none'; }, 3000);
});

const startSimBtn = document.getElementById('start-sim-btn');
if(startSimBtn) {
    startSimBtn.addEventListener('click', () => { document.getElementById('tutorial-overlay').style.display = 'none'; });
}

const bgm = document.getElementById('bgm');
const bgmBtn = document.getElementById('bgm-btn');
if (bgm && bgmBtn) {
    bgm.volume = 0.3;
    bgmBtn.addEventListener('click', () => {
        if (bgm.paused) { bgm.play().then(() => { bgmBtn.textContent = '🔊 BGM: ON'; }).catch(()=>{}); }
        else { bgm.pause(); bgmBtn.textContent = '🎵 BGM: OFF'; }
    });
}