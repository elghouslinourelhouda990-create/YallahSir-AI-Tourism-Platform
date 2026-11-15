const API_URL_MATCHS = 'http://localhost:5000/api/matchs';

const getCountryCode = (countryName) => {
    if (!countryName) return "";
    const codes = {
        // EN & FR (base fallback)
        "Senegal": "SN", "Sénégal": "SN",
        "Netherlands": "NL", "Pays-Bas": "NL",
        "Argentina": "AR", "Argentine": "AR",
        "Mexico": "MX", "Mexique": "MX",
        "Spain": "ES", "Espagne": "ES",
        "Japan": "JP", "Japon": "JP",
        "Maroc": "MA", "Morocco": "MA",
        "Portugal": "PT",
        "Brésil": "BR", "Brazil": "BR",
        "France": "FR",
        "Arabie Saoudite": "SA", "Saudi Arabia": "SA",
        "Etats-Unis": "US", "USA": "US", "United States": "US",
        // AR
        "السنغال": "SN",
        "هولندا": "NL",
        "الأرجنتين": "AR",
        "المكسيك": "MX",
        "إسبانيا": "ES",
        "اليابان": "JP",
        "المغرب": "MA",
        "البرتغال": "PT",
        "البرازيل": "BR",
        "فرنسا": "FR",
        "السعودية": "SA", "المملكة العربية السعودية": "SA",
        "الولايات المتحدة": "US", "أمريكا": "US",
        // ES
        "Países Bajos": "NL",
        "México": "MX",
        "España": "ES",
        "Japón": "JP",
        "Marruecos": "MA",
        "Brasil": "BR",
        "Francia": "FR",
        "Arabia Saudita": "SA",
        "Estados Unidos": "US"
    };

    let trimmedName = countryName.trim();
    if (codes[trimmedName]) return codes[trimmedName];

    // Fallback: remove 'ال' if Arabic, then take 2 letters. Otherwise take first 2.
    if (/^[\u0600-\u06FF]/.test(trimmedName)) {
        if (trimmedName.startsWith("ال")) {
            return trimmedName.substring(2, 4).toUpperCase();
        }
        return trimmedName.substring(0, 2).toUpperCase();
    }
    return trimmedName.substring(0, 2).toUpperCase();
};

async function fetchAndRenderMatches() {
    const container = document.getElementById('matchesContainer');
    if (!container) return;

    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = localStorage.getItem('token');
        const API_BASE = window.API_BASE || 'http://localhost:5000';
        
        // 1. Fetch User Subscriptions if logged in
        window.userNotifications = [];
        if (token) {
            try {
                const subRes = await fetch(`${API_BASE}/api/notifier`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (subRes.ok) {
                    window.userNotifications = await subRes.json();
                }
            } catch (err) {
                console.error("Error fetching subscriptions:", err);
            }
        }

        const currentLang = localStorage.getItem('selectedLang') || 'fr';
        
        // 2. Fetch Lieux for stadium names
        let lieuxMap = {};
        try {
            const lieuxRes = await fetch(`${API_BASE}/api/lieux?lang=${currentLang}`);
            if (lieuxRes.ok) {
                const lieuxData = await lieuxRes.json();
                lieuxData.forEach(l => {
                    lieuxMap[l.id_lieu] = l;
                });
            }
        } catch (err) {
            console.error("Error fetching lieux:", err);
        }

        // 3. Fetch Matchs
        const response = await fetch(`${API_URL_MATCHS}?lang=${currentLang}`);
        const matchs = await response.json();

        if (response.ok) {
            let currentMatchesPage = 1;
            const itemsPerPageMatches = 6;
            window.allMatchesSource = matchs; // Store globally for filtering
            window.filteredMatches = matchs;

            window.renderMatches = (page = 1) => {
                currentMatchesPage = page;
                container.innerHTML = '';
                const data = window.filteredMatches || [];

                if (data.length === 0) {
                    container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #666; padding: 40px;" data-i18n="no_matches_found">Aucun match trouvé pour cette recherche.</p>`;
                    const paginationContainer = document.getElementById('matches-pagination');
                    if (paginationContainer) paginationContainer.innerHTML = '';
                    if (window.applyUITranslations) window.applyUITranslations(localStorage.getItem('selectedLang') || 'fr');
                    return;
                }

                // Pagination logic
                const startIndex = (page - 1) * itemsPerPageMatches;
                const endIndex = startIndex + itemsPerPageMatches;
                const paginatedData = data.slice(startIndex, endIndex);

                paginatedData.forEach((m, index) => {
                    // Match d'ouverture logic (simplified for filtered views or first page)
                    const isOpeningMatch = (index === 0 && page === 1 && !window.isFiltered);
                    const phaseKey = isOpeningMatch ? "opening_match_label" : "group_stage_label";
                    const phaseText = isOpeningMatch ? "Match d'ouverture" : "Phase de groupes";
                    const phaseClass = isOpeningMatch ? "" : "phase-group";

                    const dateParts = m.date_match.split('/');
                    let matchDate = new Date();
                    if (dateParts.length === 3) {
                        matchDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T20:00:00`);
                    }

                    const now = new Date();
                    const diffTime = Math.max(0, matchDate - now);
                    const diffDays  = Math.floor(diffTime / (1000*60*60*24));
                    const diffHours = Math.floor((diffTime / (1000*60*60)) % 24);
                    const diffMins  = Math.floor((diffTime / (1000*60)) % 60);
                    const diffSecs  = Math.floor((diffTime / 1000) % 60);
                    const pad = (n) => String(n).padStart(2,'0');

                    // Get real stadium name from lieuxMap
                    const lieuData = lieuxMap[m.id_lieu];
                    const stadiumName = lieuData ? (lieuData.nom_lieu || `Stade ${m.id_lieu}`) : `Stade ${m.id_lieu}`;
                    const city = lieuData ? (lieuData.ville_lieu || "") : "";
                    
                    const lieuText = `<a href="map.html?location=${m.id_lieu}" style="color: inherit; text-decoration: none; border-bottom: 1px dashed #666;">
                        <span>${stadiumName}${city ? `, ${city}` : ''}</span>
                    </a>`;

                    // Check if subscribed
                    const isSubscribed = window.userNotifications.some(sub => sub.id_match === m.id_match);
                    const bellIconClass = isSubscribed ? 'fa-solid fa-bell' : 'fa-regular fa-bell-slash';
                    const btnStyle = isSubscribed ? 'background: #fef3c7; color: #d97706;' : '';

                    let cardHTML = `
                    <div class="detailed-match-card" style="position: relative;" data-match-id="${m.id_match}">
                        <div class="card-top">
                            <span class="match-phase ${phaseClass}" data-i18n="${phaseKey}">${phaseText}</span>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                ${typeof generateActionButtons === 'function' ? generateActionButtons('Match', m.id_match, m.equipe_A + ' VS ' + m.equipe_B, 'position: relative;') : ''}
                            </div>
                        </div>
                        <div class="teams-medium">
                            <div class="team-medium">
                                <span class="team-code-medium">${getCountryCode(m.equipe_A)}</span>
                                <span class="team-name-medium" data-i18n="team_${(m.equipe_A||'').toLowerCase()}">${m.equipe_A}</span>
                            </div>
                            <div class="vs-medium">VS</div>
                            <div class="team-medium">
                                <span class="team-code-medium">${getCountryCode(m.equipe_B)}</span>
                                <span class="team-name-medium" data-i18n="team_${(m.equipe_B||'').toLowerCase()}">${m.equipe_B}</span>
                            </div>
                        </div>
                        <div class="match-time-info" data-target-date="${matchDate.toISOString()}">
                            <div class="time-block"><span class="time-val days-val">${pad(diffDays)}</span><span class="time-lbl" data-i18n="days_label">jours</span></div>
                            <div class="time-block"><span class="time-val hours-val">${pad(diffHours)}</span><span class="time-lbl" data-i18n="hours_label">h</span></div>
                            <div class="time-block"><span class="time-val mins-val">${pad(diffMins)}</span><span class="time-lbl" data-i18n="mins_label">min</span></div>
                            <div class="time-block"><span class="time-val secs-val">${pad(diffSecs)}</span><span class="time-lbl" data-i18n="secs_label">sec</span></div>
                        </div>
                        <div class="match-details-list">
                            <p><i class="fa-regular fa-calendar"></i> ${m.date_match}</p>
                            ${m.resultat_match ? `<p style="font-weight: 600; color: #e41e35;"><i class="fa-solid fa-futbol"></i> <span data-i18n="score_label">Score :</span> ${m.resultat_match}</p>` : `<p><i class="fa-regular fa-clock"></i> 20:00</p>`}
                            <p><i class="fa-solid fa-location-dot"></i> ${lieuText}</p>
                        </div>
                        <button class="btn-alert-me" style="${btnStyle}" data-match-id="${m.id_match}" data-teams="${m.equipe_A} VS ${m.equipe_B}"><i class="${bellIconClass}"></i> <span data-i18n="notify_btn">M'avertir</span></button>
                    </div>`;
                    container.innerHTML += cardHTML;
                });

                if (typeof renderPagination === 'function') {
                    renderPagination(data.length, itemsPerPageMatches, currentMatchesPage, 'matches-pagination', window.renderMatches);
                }

                // Apply translations to the newly created elements
                if (window.applyUITranslations) {
                    window.applyUITranslations(localStorage.getItem('selectedLang') || 'fr');
                }
            };

            window.renderMatches(1);

        } else {
            container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #ff0000;" data-i18n="error_loading_matches">Erreur lors du chargement des matchs.</p>`;
            if (window.applyUITranslations) window.applyUITranslations(localStorage.getItem('selectedLang') || 'fr');
        }

    } catch (error) {
        console.error("Fetch matchs error:", error);
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #ff0000;" data-i18n="error_server_connection">Erreur de connexion au serveur.</p>`;
        if (window.applyUITranslations) window.applyUITranslations(localStorage.getItem('selectedLang') || 'fr');
    }
}

window.filterMatches = function (query) {
    if (!window.allMatchesSource) return;
    const q = query.toLowerCase().trim();
    window.isFiltered = q.length > 0;
    
    const lang = (typeof window.getCurrentLang === 'function') ? window.getCurrentLang() : 'fr';
    const t = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : {};

    window.filteredMatches = window.allMatchesSource.filter(m => {
        const teamA_raw = m.equipe_A || "Équipe A";
        const teamB_raw = m.equipe_B || "Équipe B";
        
        const teamA = (t[`team_${teamA_raw.toLowerCase()}`] || teamA_raw).toLowerCase();
        const teamB = (t[`team_${teamB_raw.toLowerCase()}`] || teamB_raw).toLowerCase();
        
        const grp = (m.groupe_match || m.groupe || m.phase_match || m.phase || "").toLowerCase();
        const grpFull = grp ? "groupe " + grp.replace("groupe", "").trim() : "";

        return teamA.includes(q) || teamB.includes(q) || (m.date_match || "").toLowerCase().includes(q) || grp.includes(q) || grpFull.includes(q);
    });

    window.renderMatches(1);
};

// Automatically load matches when DOM is constructed
document.addEventListener('DOMContentLoaded', fetchAndRenderMatches);

// Event delegation for "Alert Me" button
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-alert-me');
    if (btn) {
        const matchId = btn.getAttribute('data-match-id');
        const teams = btn.getAttribute('data-teams') || 'Match';
        const token = localStorage.getItem('token');
        const API_BASE = window.API_BASE || 'http://localhost:5000';
        
        if (!token) {
            if (window.showToast) window.showToast('Veuillez vous connecter pour activer les alertes', 'error');
            return;
        }

        try {
            // Disable button during call
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.7';

            const res = await fetch(`${API_BASE}/api/notifier/toggle`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type: 'match', id: Number(matchId), title: teams })
            });

            if (res.ok) {
                const result = await res.json();
                const isActive = result.active;
                
                // Update UI state
                const icon = btn.querySelector('i');
                if (isActive) {
                    if (icon) icon.className = 'fa-solid fa-bell';
                    btn.style.background = '#fef3c7';
                    btn.style.color = '#d97706';
                } else {
                    if (icon) icon.className = 'fa-regular fa-bell-slash';
                    btn.style.background = '';
                    btn.style.color = '';
                }

                // Show toast via script.js global handler
                if (window.showToast) {
                    const lang = localStorage.getItem('selectedLang') || 'fr';
                    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : {};
                    const msg = isActive ? (T.notif_activated || 'Notification activée') : (T.notif_deactivated || 'Notification désactivée');
                    window.showToast(`${msg} : ${teams}`, 'success');
                }
                
                // Update local subscription list for future renders
                if (!window.userNotifications) window.userNotifications = [];
                if (isActive) {
                    window.userNotifications.push({ id_match: Number(matchId) });
                } else {
                    window.userNotifications = window.userNotifications.filter(sub => sub.id_match !== Number(matchId));
                }

            } else {
                const err = await res.json();
                if (window.showToast) window.showToast(err.message || 'Erreur lors de la mise à jour de l\'alerte', 'error');
            }
        } catch (err) {
            console.error("Toggle error:", err);
            if (window.showToast) window.showToast('Erreur de connexion', 'error');
        } finally {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        }
    }
});

// --- MATCHES COUNTDOWN TICKER (1 sec) — same pattern as homepage ---
setInterval(() => {
    const padM = (n) => String(n).padStart(2, '0');
    document.querySelectorAll('.match-time-info[data-target-date]').forEach(el => {
        const diff = Math.max(0, new Date(el.getAttribute('data-target-date')) - new Date());
        const dEl = el.querySelector('.days-val');
        const hEl = el.querySelector('.hours-val');
        const mEl = el.querySelector('.mins-val');
        const sEl = el.querySelector('.secs-val');
        if (dEl) dEl.textContent = padM(Math.floor(diff / (1000*60*60*24)));
        if (hEl) hEl.textContent = padM(Math.floor((diff / (1000*60*60)) % 24));
        if (mEl) mEl.textContent = padM(Math.floor((diff / (1000*60)) % 60));
        if (sEl) sEl.textContent = padM(Math.floor((diff / 1000) % 60));
    });
}, 1000);

// --- HERO COUNTDOWN — Match d'ouverture MA vs PT : 11/06/2030 20:00 ---
(function heroCountdown() {
    const target = new Date('2030-06-11T20:00:00');
    const padH = (n) => String(n).padStart(2, '0');
    function tick() {
        const diff = Math.max(0, target - new Date());
        const dEl = document.getElementById('days');
        const hEl = document.getElementById('hours');
        const mEl = document.getElementById('minutes');
        const sEl = document.getElementById('seconds');
        if (dEl) dEl.textContent = padH(Math.floor(diff / (1000*60*60*24)));
        if (hEl) hEl.textContent = padH(Math.floor((diff / (1000*60*60)) % 24));
        if (mEl) mEl.textContent = padH(Math.floor((diff / (1000*60)) % 60));
        if (sEl) sEl.textContent = padH(Math.floor((diff / 1000) % 60));
    }
    tick();
    setInterval(tick, 1000);
})();
