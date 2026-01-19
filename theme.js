/* =====================================================
   ABYSS-HUB – LOGICA APPLICATIVA INTEGRATA
   ===================================================== */


// --- 1. TEMA (DARK/LIGHT MODE) ---
const initTheme = () => {
    const toggle = document.getElementById("theme-toggle");
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "dark";

    html.setAttribute("data-theme", savedTheme);
    if (toggle) toggle.textContent = savedTheme === "dark" ? "🌙" : "☀️";

    toggle?.addEventListener("click", () => {
        const current = html.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        toggle.textContent = next === "dark" ? "🌙" : "☀️";
    });
};
// --- GESTIONE SOS E GPS ---
const initSOS = () => {
    const sosBtn = document.querySelector(".sos-button");
    const sosModal = document.getElementById("sosModal");
    const cancelSOS = document.getElementById("cancelSOS");
    const confirmSOS = document.getElementById("confirmSOS");
    const sosCoords = document.getElementById("sosCoords");

    // --- AGGIUNTA: Riferimenti al Widget Navigazione ---
    const latDisplay = document.getElementById("lat-display");
    const lonDisplay = document.getElementById("lon-display");
    const sigBars = document.querySelectorAll(".sig-bar");

    if (navigator.geolocation) {
        // --- MODIFICA FONDAMENTALE: watchPosition aggiorna i dati in tempo reale ---
        navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude, accuracy } = pos.coords;

            // 1. Aggiorna il widget Navigazione (se gli elementi esistono)
            if (latDisplay) latDisplay.textContent = `${latitude.toFixed(4)} ${latitude >= 0 ? 'N' : 'S'}`;
            if (lonDisplay) lonDisplay.textContent = `${longitude.toFixed(4)} ${longitude >= 0 ? 'E' : 'W'}`;

            // 2. Aggiorna le coordinate nel modulo SOS (per averle già pronte se servissero)
            if (sosCoords) sosCoords.textContent = `📍 ${latitude.toFixed(5)} • ${longitude.toFixed(5)}`;

            // 3. Gestione barre del segnale (opzionale)
            if (sigBars.length > 0) {
                sigBars.forEach(bar => bar.classList.remove("active"));
                sigBars[0].classList.add("active"); // Fix presente
                if (accuracy < 80) sigBars[1].classList.add("active");
                if (accuracy < 40) sigBars[2].classList.add("active");
                if (accuracy < 15) sigBars[3].classList.add("active"); // Ottimo segnale
            }
        }, (err) => {
            console.warn("Errore GPS:", err);
        }, {
            enableHighAccuracy: true, // Usa il chip GPS reale invece del WiFi
            maximumAge: 0
        });
    }

    // Gestione click tasti (rimane invariata per la logica modale)
    sosBtn?.addEventListener("click", () => {
        sosModal?.classList.add("show");
    });

    cancelSOS?.addEventListener("click", () => sosModal?.classList.remove("show"));
    confirmSOS?.addEventListener("click", () => {
        alert("🚨 SOS inviato alla Guardia Costiera");
        sosModal?.classList.remove("show");
    });
};


// --- FISHBOT
(function() {
  const chatBody = document.getElementById("chat-body");
  const chatOptions = document.getElementById("chat-options");
  const fishButton = document.getElementById("fish-button");
  const chatWindow = document.getElementById("chat-window");
  const closeChat = document.getElementById("close-chat");

  const database = {
    tecniche: {
      "Jigging": "🎯 **Jigging**: Usa esche pesanti in metallo. Condizioni: Mare un po' mosso con corrente. Pesci: Ricciole, Dentici.",
      "Bolentino": "⚓ **Bolentino**: Esca naturale (gambero/calamaro). Condizioni: Mare calmo, barca ancorata o in deriva. Pesci: Orate, Prai, Pagelli.",
      "Notturna": "🌙 **Pesca Notturna**: Esca coreano o sarda. Condizioni: Mare calmo e zone illuminate. Pesci: Spigole, Saraghi.",
      "Traina": "🚤 **Traina**: Esca viva o artificiale. Condizioni: Mare calmo/poco mosso a bassa velocità. Pesci: Palamite, Lampughe.",
      "Eging": "🦑 **Eging**: Usa totanare (Egi). Condizioni: Acqua limpida, meglio al tramonto. Pesci: Calamari, Seppie."
    },
    widgets: {
      "Meteo": "🌡️ **Meteo**: Indica temperatura e vento. Attento al vento: se soffia da terra il mare cala, se soffia dal largo il mare sale.",
      "Maree": "🌊 **Maree**: Il valore mostra l'altezza, il Coefficiente la forza della corrente. Più alto è il coeff, più il pesce mangia.",
      "Luna": "🌕 **Luna**: La luna piena attira i calamari, la luna nuova (buio totale) è il top per la spigola sottocosta."
    },
    supporto: {
      "GPS": "📍 **GPS**: Se non vedi le coordinate, controlla di aver attivato la localizzazione nelle impostazioni del tuo telefono/browser.",
      "Dati persi": "💾 **Dati**: Le tue catture sono salvate nella memoria locale del telefono."
    }
  };

  // --- FUNZIONE PER GENERARE IL CONSIGLIO REALE ---
  function generaConsiglioLive() {
    let suggerimento = "";
    const vento = parseFloat(currentMarineData.wind);
    
    if (vento > 18) {
        suggerimento = "⚠️ **ATTENZIONE**: Il vento a " + currentMarineData.city + " è molto forte (" + vento + " kt). Pesca da terra in zone riparate, evita la barca.";
    } else if (vento > 10) {
        suggerimento = "🎣 **BUONA BREZZA**: Con " + vento + " nodi da " + currentMarineData.desc + ", prova a spinning cercando le spigole dove l'acqua schiuma.";
    } else {
        suggerimento = "🌊 **MARE CALMO**: Condizioni ottimali a " + currentMarineData.city + ". Perfetto per eging (calamari) o bolentino di profondità.";
    }
    return `🤖 **LIVE INFO**: ${suggerimento} (Temp: ${currentMarineData.temp}°)`;
  }

  function mostraMenu(opzioni, tipo) {
    chatOptions.innerHTML = "";
    opzioni.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "menu-btn";
      btn.textContent = opt;
      btn.onclick = () => gestisciScelta(opt, tipo);
      chatOptions.appendChild(btn);
    });
  }

  function scriviMessaggio(testo, classe) {
    const msg = document.createElement("div");
    msg.className = classe;
    msg.innerHTML = testo;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function gestisciScelta(scelta, tipo) {
    scriviMessaggio(scelta, "user-msg");
    setTimeout(() => {
      if (tipo === "principale") {
        if (scelta === "Consiglio Live 📍") {
          scriviMessaggio(generaConsiglioLive(), "bot-msg");
          setTimeout(() => {
            scriviMessaggio("Vuoi sapere altro?", "bot-msg");
            mostraMenu(["Consiglio Live 📍", "Tecniche", "Widget", "Supporto"], "principale");
          }, 1500);
        } else if (scelta === "Tecniche") {
          scriviMessaggio("Quale tecnica ti interessa?", "bot-msg");
          mostraMenu(["Jigging", "Bolentino", "Notturna", "Traina", "Eging"], "tecniche");
        } else if (scelta === "Widget") {
          scriviMessaggio("Quale widget vuoi capire meglio?", "bot-msg");
          mostraMenu(["Meteo", "Maree", "Luna"], "widgets");
        } else if (scelta === "Supporto") {
          scriviMessaggio("Con cosa hai problemi?", "bot-msg");
          mostraMenu(["GPS", "Dati persi"], "supporto");
        }
      } else {
        scriviMessaggio(database[tipo][scelta], "bot-msg");
        setTimeout(() => {
          scriviMessaggio("Posso aiutarti con altro?", "bot-msg");
          mostraMenu(["Consiglio Live 📍", "Tecniche", "Widget", "Supporto"], "principale");
        }, 1500);
      }
    }, 400);
  }

  fishButton.onclick = () => {
    chatWindow.classList.toggle("hidden");
    if (!chatWindow.classList.contains("hidden") && chatBody.children.length === 0) {
      scriviMessaggio("Ciao! Sono il tuo assistente di pesca. Analizzo il meteo in tempo reale per te.", "bot-msg");
      mostraMenu(["Consiglio Live 📍", "Tecniche", "Widget", "Supporto"], "principale");
    }
  };

  if (closeChat) {
    closeChat.onclick = (e) => {
      e.stopPropagation(); 
      chatWindow.classList.add("hidden");
    };
  }
})();


// --- 3. LOGICA MAPPA E MARKERS (UCD) ---
const initMap = () => {
    const mapElement = document.getElementById("map");
    if (!mapElement || typeof L === 'undefined') return;

    if (window.myMap) {
        window.myMap.remove();
    }

    // Inizializzazione mappa
    window.myMap = L.map("map").setView([41.7735, 12.2397], 9); 

    // Layer Mappa e Nautico
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(window.myMap);
    L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
        attribution: 'OpenSeaMap'
    }).addTo(window.myMap);

    setTimeout(() => {
        window.myMap.invalidateSize();
    }, 200);

    const spots = [
        { name: "Santa Marinella", lat: 42.0325, lng: 11.8472, info: "Surfcasting e spinning" },
        { name: "Ladispoli", lat: 41.9490, lng: 12.0784, info: "Ideale per l'orata" },
        { name: "Fiumicino", lat: 41.7735, lng: 12.2397, info: "Zona ricca di spigole" },
        { name: "Ostia", lat: 41.7311, lng: 12.2863, info: "Bolentino" },
        { name: "Anzio", lat: 41.4475, lng: 12.6275, info: "Ottimo spinning" }
    ];

    spots.forEach(spot => {
        L.marker([spot.lat, spot.lng])
         .addTo(window.myMap)
         .bindPopup(`氣 <strong>${spot.name}</strong><br>${spot.info}`);
    });

    // --- GESTIONE NUOVI SPOT ---
    window.myMap.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        const newMarker = L.marker([lat, lng], { draggable: true }).addTo(window.myMap);
        
        const popupCont = document.createElement('div');
        popupCont.style.textAlign = "center";
        popupCont.style.color = "#000";
        popupCont.innerHTML = `
            <b style="color:#d4af37;">Nuovo Spot</b><br>
            <small>${lat.toFixed(5)}, ${lng.toFixed(5)}</small><br>
            <div style="margin-top:8px; display:flex; gap:5px; justify-content:center;">
                <button class="save-btn" style="background:#d4af37; border:none; padding:5px 10px; cursor:pointer; font-weight:bold; border-radius:4px; color:#000;">💾 Diario</button>
                <button class="del-btn" style="background:#ff4444; border:none; padding:5px 10px; cursor:pointer; color:white; font-weight:bold; border-radius:4px;">🗑️</button>
            </div>
        `;

        popupCont.querySelector('.save-btn').onclick = () => window.copyCoords(lat, lng);
        popupCont.querySelector('.del-btn').onclick = () => window.myMap.removeLayer(newMarker);

        newMarker.bindPopup(popupCont).openPopup();
    });
}; // <--- QUESTA GRAFFA MANCAVA!

// --- 4. FUNZIONE DIARIO CON SCROLL MANUALE ---
window.copyCoords = (lat, lng) => {
    const coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const diaryInput = document.getElementById('diary-input');
    const diaryWidget = document.querySelector('.diary-widget') || document.querySelector('.widget.diary');

    if (diaryInput) {
        const timestamp = new Date().toLocaleTimeString();
        diaryInput.value += `[${timestamp}] Coordinate: ${coords}\n`;
        
        if (diaryWidget) {
            // Calcolo della posizione con un offset di 150px per portarlo ben in alto
            const yOffset = -150; 
            const y = diaryWidget.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });

            diaryInput.style.backgroundColor = "rgba(212, 175, 55, 0.1)";
            setTimeout(() => diaryInput.style.backgroundColor = "transparent", 800);
        }
    }
};

// --- 4. GESTIONE DIARIO E CATTURE (Corretta) ---
window.copyCoords = (lat, lng) => {
    const coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const diaryInput = document.getElementById('diary-input');
    const anchor = document.getElementById('scroll-anchor');

    if (diaryInput) {
        const timestamp = new Date().toLocaleTimeString();
        diaryInput.value += `[${timestamp}] Spot: ${coords}\n`;

        if (anchor) {
            // Puntiamo all'ancora che è posizionata più in alto del diario
            anchor.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } else {
            // Se non trovi l'ancora, usa il metodo standard ma con focus
            diaryInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Feedback visivo
        diaryInput.style.backgroundColor = "rgba(212, 175, 55, 0.2)";
        setTimeout(() => diaryInput.style.backgroundColor = "transparent", 800);
    }
};

const initDiary = () => {
    const logs = document.getElementById('diary-logs');
    const saveBtn = document.getElementById('save-diary-btn');
    const input = document.getElementById('diary-input');

    const render = () => {
        const saved = JSON.parse(localStorage.getItem('abyss_diary')) || [];
        if (logs) logs.innerHTML = saved.map((note, i) => `
            <div class="log-item" style="border-left:4px solid #d4af37; padding:10px; margin-bottom:10px; display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); color: #fff;">
                <span>${note}</span>
                <button onclick="deleteNote(${i})" style="color:#ff4444; background:none; border:none; cursor:pointer; font-size:1.2rem;">&times;</button>
            </div>
        `).join('');
    };

    window.deleteNote = (i) => {
        const saved = JSON.parse(localStorage.getItem('abyss_diary')) || [];
        saved.splice(i, 1);
        localStorage.setItem('abyss_diary', JSON.stringify(saved));
        render();
    };

    saveBtn?.addEventListener('click', () => {
        if (input?.value.trim()) {
            const saved = JSON.parse(localStorage.getItem('abyss_diary')) || [];
            saved.unshift(input.value);
            localStorage.setItem('abyss_diary', JSON.stringify(saved));
            input.value = "";
            render();
        }
    });
    render();
};

/* =====================================================
   5. DASHBOARD DINAMICA (Meteo e Maree)
   ===================================================== */


// 1. Variabile globale per il Bot
let currentMarineData = {
    temp: "--",
    wind: 0,
    desc: "caricamento...",
    city: "Ricerca posizione..."
};

const initDashboard = () => {
    // --- PARTE 1: METEO MARINO ---
    const fetchWeatherData = async (lat, lon) => {
        const API_KEY = "d75c8167d520bb65477817e62c7f096c"; // <--- INSERISCI QUI LA TUA CHIAVE
        
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it`;
            const response = await fetch(url);
            const data = await response.json();

            const windKt = (data.wind.speed * 1.94384).toFixed(1);
            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;
            const waveHeight = (windKt / 18).toFixed(1);

            currentMarineData = { temp, wind: windKt, desc, city: data.name };

            const windEl = document.getElementById('wind-speed');
            const waveEl = document.getElementById('wave-height');
            const tempEl = document.querySelector('.main-temp');
            const descEl = document.querySelector('.weather-desc');

            if (tempEl) tempEl.textContent = `${temp}°`;
            if (descEl) descEl.textContent = desc;
            if (windEl) {
                windEl.innerHTML = `${windKt} <small>kt</small>`;
                windEl.style.color = windKt > 18 ? "#ff4444" : "#00ff88";
                windEl.style.fontWeight = windKt > 18 ? "900" : "normal";
            }
            if (waveEl) waveEl.innerHTML = `${waveHeight} <small>m</small>`;

        } catch (error) {
            console.error("Errore meteo:", error);
        }
    };

    // Avvio GPS per Meteo
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherData(pos.coords.latitude, pos.coords.longitude),
            () => fetchWeatherData(41.8919, 12.5113)
        );
    }

    // --- PARTE 2: MAREE ---
    const valEl = document.getElementById('tide-val-number');
    const statusEl = document.getElementById('tide-status-text');
    const iconEl = document.getElementById('tide-dir-icon');
    const lowTideEl = document.getElementById('low-tide-time');
    const highTideEl = document.getElementById('high-tide-time');
    const coeffEl = document.getElementById('tide-coeff');

    const updateTides = () => {
        if (!valEl || !statusEl) return;

        const oraAttuale = new Date();
        const secondi = (oraAttuale.getHours() * 3600) + (oraAttuale.getMinutes() * 60) + oraAttuale.getSeconds();
        const periodoMarea = 44640; 
        const ampiezzaBase = 0.6;
        
        const giorno = oraAttuale.getDate();
        const coeff = Math.floor(70 + 40 * Math.sin((2 * Math.PI * giorno) / 30));
        if (coeffEl) coeffEl.textContent = coeff;

        const altezza = ampiezzaBase * Math.sin((2 * Math.PI * secondi) / periodoMarea);
        const inCrescita = ampiezzaBase * Math.sin((2 * Math.PI * (secondi + 1)) / periodoMarea) > altezza;

        valEl.textContent = (altezza >= 0 ? "+" : "") + altezza.toFixed(2);
        statusEl.textContent = inCrescita ? "In crescita" : "In calo";
        statusEl.style.color = inCrescita ? "#00ff88" : "#ff4444";
        
       if (iconEl) {
            // Se inCrescita è true -> ruota a 0° (su)
            // Se inCrescita è false -> ruota a 180° (giù)
            iconEl.style.transition = "transform 0.5s ease, color 0.5s ease"; // Rende il cambio fluido
            iconEl.style.transform = inCrescita ? "rotate(0deg)" : "rotate(180deg)";
            iconEl.style.color = inCrescita ? "#00ff88" : "#ff4444";
        }
        
        const formatTime = (sec) => {
            const h = Math.floor((sec % 86400) / 3600);
            const m = Math.floor((sec % 3600) / 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        if (highTideEl) highTideEl.textContent = formatTime(periodoMarea / 4);
        if (lowTideEl) lowTideEl.textContent = formatTime((periodoMarea * 3) / 4);
    };

    updateTides();
    setInterval(updateTides, 5000); // Aggiorna marea ogni 5 sec
};

// Caricamento unico
document.addEventListener('DOMContentLoaded', initDashboard);



    // Attività pesci dinamica
    const updateActivity = () => {
        const container = document.querySelector('.active-species');
        const hour = new Date().getHours();
        const species = (hour >= 20 || hour <= 5) ? ['Calamaro', 'Seppia'] : ['Spigola', 'Orata'];
        if (container) container.innerHTML = species.map(s => `<span class="tag">${s}</span>`).join('');
    };
    updateActivity();


 // LUNA

const drawMoon = () => {
    const moonIcon = document.getElementById('moon-main-icon');
    const moonName = document.getElementById('moon-phase-name');
    const moonIllum = document.getElementById('moon-illumination');
    const moonAdvice = document.getElementById('moon-advice');

    if (!moonIcon) return;

    const lp = 2551443; 
    const now = new Date();
    const newMoonRef = new Date(1970, 0, 7, 20, 35, 0);
    const phase = ((now.getTime() - newMoonRef.getTime()) / 1000 % lp) / lp;
    const illum = Math.round(Math.abs(phase - 0.5) * -200 + 100);

    let name, advice, iconClass;

    // Logica Fasi con Icone
    if (phase < 0.06 || phase > 0.94) {
        name = "Luna Nuova"; advice = "Buio: Top per la Spigola"; iconClass = "fa-circle"; 
        moonIcon.style.opacity = "0.3"; // Quasi invisibile
    } else if (phase < 0.25) {
        name = "Luna Crescente"; advice = "Buono per Bolentino"; iconClass = "fa-moon";
        moonIcon.style.opacity = "1";
    } else if (phase < 0.55 && phase > 0.45) {
        name = "Luna Piena"; advice = "Massima attività Calamari"; iconClass = "fa-solid fa-circle";
        moonIcon.classList.add("moon-full");
    } else {
        name = "Luna Calante"; advice = "Momento di attesa"; iconClass = "fa-moon";
        moonIcon.style.transform = "scaleX(-1)"; // Specchia l'icona per farla sembrare calante
        moonIcon.style.opacity = "1";
    }

    // Aggiornamento testuale
    moonName.innerText = name;
    moonIllum.innerText = illum + "%";
    if (moonAdvice) moonAdvice.innerText = advice;

    // Aggiornamento Icona
    moonIcon.className = `fas ${iconClass}`;
};

// Avvio
document.addEventListener("DOMContentLoaded", drawMoon);

// --- 6. CHECKLIST DI SICUREZZA ---
const initChecklist = () => {
    const listContainer = document.getElementById('checklist-main');
    const readyScreen = document.getElementById('ready-screen');
    
    document.addEventListener("change", (e) => {
        if (e.target.classList.contains('task-check')) {
            const all = document.querySelectorAll('.task-check');
            const checked = document.querySelectorAll('.task-check:checked');
            if (checked.length === all.length && listContainer && readyScreen) {
                listContainer.style.display = 'none';
                readyScreen.style.display = 'flex';
            }
        }
    });

    window.resetChecklist = () => {
        document.querySelectorAll('.task-check').forEach(c => c.checked = false);
        if (listContainer) listContainer.style.display = 'block';
        if (readyScreen) readyScreen.style.display = 'none';
    };
};

// --- 7. MODAL SYSTEM (Supporto/Privacy) ---
window.openModal = (id) => {
    const m = document.getElementById(id);
    if (m) { m.style.display = "flex"; document.body.style.overflow = "hidden"; }
};

window.closeModal = (id) => {
    const m = document.getElementById(id);
    if (m) { m.style.display = "none"; document.body.style.overflow = "auto"; }
};

// --- AVVIO GLOBALE ---
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSOS();
    initMap();
    initDiary();
    initDashboard();
    initChecklist();
    
    // Community Grid Scroll
    const container = document.querySelector('.community-grid');
    document.querySelector('.nav-btn.next')?.addEventListener('click', () => container?.scrollBy({ left: 300, behavior: 'smooth' }));
    document.querySelector('.nav-btn.prev')?.addEventListener('click', () => container?.scrollBy({ left: -300, behavior: 'smooth' }));
});




document.addEventListener('DOMContentLoaded', function() {
    const addBtn = document.querySelector('.btn-add-log');
    const logContainer = document.querySelector('.log-entries');

    // --- 1. FUNZIONE PER ELIMINARE ---
    function attivaEliminazione(riga) {
        if (!riga.querySelector('.delete-btn')) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = '×';
            delBtn.onclick = function() {
                if(confirm("Vuoi eliminare questa cattura?")) {
                    const pesce = riga.querySelector('.entry-fish').textContent.replace(/🐟|🦑/g, '').trim();
                    const peso = riga.querySelector('.entry-weight').textContent.trim();

                    // Rimuove dai nuovi salvati
                    let elenco = JSON.parse(localStorage.getItem('myFishLog')) || [];
                    elenco = elenco.filter(c => c.pesce !== pesce || c.peso !== peso);
                    localStorage.setItem('myFishLog', JSON.stringify(elenco));

                    // Segna come eliminata se era una riga fissa HTML
                    let eliminatiFissi = JSON.parse(localStorage.getItem('deletedFixedEntries')) || [];
                    eliminatiFissi.push(pesce + peso);
                    localStorage.setItem('deletedFixedEntries', JSON.stringify(eliminatiFissi));

                    riga.remove();
                }
            };
            riga.appendChild(delBtn);
        }

        // Controllo se la riga deve essere nascosta all'avvio
        const p = riga.querySelector('.entry-fish').textContent.replace(/🐟|🦑/g, '').trim();
        const w = riga.querySelector('.entry-weight').textContent.trim();
        let eliminatiFissi = JSON.parse(localStorage.getItem('deletedFixedEntries')) || [];
        if (eliminatiFissi.includes(p + w)) {
            riga.style.display = 'none';
        }
    }

    // --- 2. GESTIONE RIGHE ESISTENTI ---
    document.querySelectorAll('.entry').forEach(riga => attivaEliminazione(riga));

    // --- 3. CARICA SALVATI ---
    const salvate = JSON.parse(localStorage.getItem('myFishLog')) || [];
    salvate.forEach(data => aggiungiRigaHTML(data.pesce, data.peso));

    // --- 4. AGGIUNGI NUOVA CATTURA ---
    if (addBtn && logContainer) {
        addBtn.onclick = function() {
            const pesce = prompt("Che pesce hai catturato?");
            if (!pesce || pesce.trim() === "") return;
            const peso = prompt("Quanto pesava? (es: 1.2 kg)");
            if (!peso || peso.trim() === "") return;

            // Salva nel Storage
            const elenco = JSON.parse(localStorage.getItem('myFishLog')) || [];
            elenco.unshift({ pesce, peso });
            localStorage.setItem('myFishLog', JSON.stringify(elenco));

            aggiungiRigaHTML(pesce, peso);
        };
    }

    function aggiungiRigaHTML(pesce, peso) {
        const nuovaEntry = document.createElement('div');
        nuovaEntry.className = 'entry';

        let emoji = pesce.toLowerCase().includes("calamaro") || pesce.toLowerCase().includes("seppia") ? "🦑" : "🐟";

        nuovaEntry.innerHTML = `
            <span class="entry-fish">${emoji} ${pesce}</span>
            <span class="entry-weight">${peso}</span>
            <span class="entry-date">Oggi</span>
        `;
        attivaEliminazione(nuovaEntry);
        logContainer.prepend(nuovaEntry);
    }
});



// Community

document.addEventListener('DOMContentLoaded', function() {
    const reportBtn = document.getElementById('add-report-btn');
    const communityGrid = document.querySelector('.community-grid');

    if (reportBtn && communityGrid) {
        reportBtn.onclick = function() {
            // 1. Chiediamo i dettagli
            const localita = prompt("Località dello spot? (es. Santa Marinella)");
            if (!localita) return;

            const esca = prompt("Che esca hai usato? (es. Coreano, Bibi, Artificiale)");
            
            const stelle = prompt("Quante stelle dai allo spot? (da 1 a 5)");
            const numStelle = parseInt(stelle) || 5; // Default 5 se non inserito

            const commento = prompt("Scrivi la tua recensione:");
            if (!commento) return;

            // 2. Generiamo le stelline visive
            let starHtml = "";
            for (let i = 0; i < 5; i++) {
                starHtml += i < numStelle ? "★" : "☆";
            }

            // 3. Creiamo la card
            const newCard = document.createElement('article');
            newCard.className = 'spot-card';
            
            // Immagine casuale ma coerente con il mare
            const randomId = Math.floor(Math.random() * 1000);
            const imgUrl = `https://picsum.photos/seed/${randomId}/400/250?sea,fishing`;

            newCard.innerHTML = `
                <div class="spot-img-container">
                    <img src="${imgUrl}" alt="${localita}">
                    <span class="bait-badge">${esca || 'Esca non nota'}</span>
                </div>
                <div class="spot-content">
                    <div class="spot-author">
                        <img src="https://i.pravatar.cc/150?u=alex" class="author-avatar">
                        <div class="author-details">
                            <span class="author-name">Alex (Tu)</span>
                            <div class="rating" style="color: #fbbf24;">${starHtml}</div>
                        </div>
                    </div>
                    <h3>${localita}</h3>
                    <p class="spot-review">"${commento}"</p>
                </div>
            `;

            communityGrid.prepend(newCard);
            newCard.scrollIntoView({ behavior: 'smooth' });
        };
    }
});


