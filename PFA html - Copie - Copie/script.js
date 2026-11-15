// Basic interactions
const API_BASE = 'http://localhost:5000';

const getCurrentLang = () => localStorage.getItem('selectedLang') || localStorage.getItem('selectedLanguage') || 'fr';

// Global helper to extract localized value from DB objects
window.getLocalizedValue = function(field, lang) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
        return field[lang] || field['fr'] || field['en'] || Object.values(field)[0] || '';
    }
    return '';
};

// Apply UI Translations
const applyUITranslations = (lang) => {
    console.log("Applying translations for:", lang);
    if (!window.ui_translations) {
        console.error("No ui_translations found on window");
        return;
    }
    const translations = window.ui_translations[lang] || window.ui_translations['fr'];
    
    try {
        document.querySelectorAll('[data-i18n], [data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const titleKey = el.getAttribute('data-i18n-title');
            
            if (key && translations[key] !== undefined) {
                if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.getAttribute('placeholder')) {
                    el.placeholder = translations[key];
                } else {
                    const icon = el.querySelector('i');
                    if (icon) {
                        const iconHtml = icon.outerHTML;
                        el.innerHTML = iconHtml + ' ' + translations[key];
                    } else {
                        el.innerText = translations[key];
                    }
                }
            }
            if (titleKey && translations[titleKey] !== undefined) {
                el.title = translations[titleKey];
            }
        });
    } catch (err) {
        console.error("Error during applyUITranslations loop:", err);
    }

    try {
        // Handle RTL for Arabic
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
            console.log("RTL applied");
        } else {
            document.documentElement.dir = 'ltr';
            document.body.classList.remove('rtl');
        }
    } catch (err) {
        console.error("Error applying RTL:", err);
    }
};

window.applyUITranslations = applyUITranslations;
window.getCurrentLang = getCurrentLang;

// Also run on window.load to catch pages with extra scripts (e.g. culture_data.js)
window.addEventListener('load', function() {
    applyUITranslations(getCurrentLang());
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - script.js active');
    
    // Splash Screen Logic
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 2500); // Show for 2.5 seconds
    }

    applyUITranslations(getCurrentLang());

    // Language Switcher Logic
    const langBtn = document.getElementById('langBtn');
    const langSwitcher = document.querySelector('.lang-switcher');
    const currentLangText = document.getElementById('currentLang');
    const langLinks = document.querySelectorAll('.lang-dropdown a');

    // Update UI based on stored language
    const updateLangUI = () => {
        const currentLang = getCurrentLang();
        langLinks.forEach(link => {
            if (link.getAttribute('data-lang') === currentLang) {
                link.classList.add('active');
                if (currentLangText) currentLangText.textContent = link.textContent;
            } else {
                link.classList.remove('active');
            }
        });
    };

    if (langBtn && langSwitcher) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langSwitcher.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!langSwitcher.contains(e.target)) {
                langSwitcher.classList.remove('active');
            }
        });

        langLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedLang = link.getAttribute('data-lang');
                localStorage.setItem('selectedLang', selectedLang);
                
                // SAVE ITINERARY STATE BEFORE RELOAD
                if (window.location.pathname.includes('itineraries.html') || window.location.pathname === '/' || window.location.pathname === '') {
                    const nomInput = document.getElementById('itinNameInput');
                    const durationInput = document.getElementById('itinDurationInput');
                    const budgetInput = document.getElementById('itinBudgetInput');
                    const typeSelect = document.getElementById('itinTypeSelect');
                    if (nomInput || (typeof tempPlacesAdded !== 'undefined' && tempPlacesAdded)) {
                        const itinState = {
                            name: nomInput ? nomInput.value : '',
                            duration: durationInput ? durationInput.value : '',
                            budget: budgetInput ? budgetInput.value : '',
                            type: typeSelect ? typeSelect.value : 'culture',
                            places: (typeof tempPlacesAdded !== 'undefined' && tempPlacesAdded) ? tempPlacesAdded : []
                        };
                        sessionStorage.setItem('draftItinerary', JSON.stringify(itinState));
                    }
                }

                // Update active class and text
                updateLangUI();
                langSwitcher.classList.remove('active');

                // Trigger data reload
                location.reload(); // Simplest way to refresh everything with new lang
            });
        });

        // Initialize UI
        updateLangUI();
    }

    // Navigation active state - Automatic detection
    const navItems = document.querySelectorAll('.navlinks .nav-links a, .nav-item');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        if (itemHref === currentPath || (currentPath === 'index.html' && itemHref === './')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }

        item.addEventListener('click', (e) => {
            // Only prevent default if it's a dummy link or anchor
            if (itemHref === '#' || itemHref.startsWith('#')) {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });


    // Category active state
    const categories = document.querySelectorAll('.category-card');
    categories.forEach(cat => {
        cat.addEventListener('click', () => {
            categories.forEach(c => c.classList.remove('active'));
            // Reset icon backgrounds for non-active
            // This is a simple toggle for demonstration
            cat.classList.add('active');
        });
    });

    // Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Notification Logic
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifList = document.querySelector('.notif-list');
    const notifBadge = document.querySelector('.notif-badge-indicator');

    if (notifBtn && notifDropdown && notifList) {

        let lastKnownNotifId = localStorage.getItem('lastKnownNotifId') || 0;

        // --- Dynamic Fetch from Backend ---
        const fetchNotifications = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const userId = userInfo._id || userInfo.id || '';
                const response = await fetch(`${API_BASE}/api/notifications?lang=${getCurrentLang()}${userId ? `&user_id=${userId}` : ''}`);
                const notifications = await response.json();

                notifList.innerHTML = ''; // Clear default hardcoded notification

                if (response.ok && notifications.length > 0) {

                    if (notifBadge) notifBadge.style.display = 'block';

                    // Check for new notification to show toast
                    const latestNotif = notifications[0]; // Assuming sorted newest first as per backend
                    if (latestNotif.id_Notification > lastKnownNotifId) {
                        // New notification arrived!
                        showToast(latestNotif.contenu_Notification, latestNotif.type_Notification);
                        lastKnownNotifId = latestNotif.id_Notification;
                        localStorage.setItem('lastKnownNotifId', lastKnownNotifId);
                    }

                    notifications.forEach(notif => {
                        // Calculate time ago
                        const notifDate = new Date(notif.date_envoi);
                        const now = new Date();
                        const diffMs = now - notifDate;
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMins / 60);
                        const diffDays = Math.floor(diffHours / 24);

                        const lang = getCurrentLang();
                        const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});

                        let timeString = T.notif_just_now || "A l'instant";
                        const ago = T.notif_ago ? T.notif_ago + ' ' : '';

                        if (diffDays > 0) {
                            timeString = `${ago}${diffDays} ${diffDays > 1 ? (T.notif_days || 'jours') : (T.notif_day || 'jour')}`;
                        } else if (diffHours > 0) {
                            timeString = `${ago}${diffHours} ${diffHours > 1 ? (T.notif_hours || 'heures') : (T.notif_hour || 'heure')}`;
                        } else if (diffMins > 0) {
                            timeString = `${ago}${diffMins} ${T.notif_min || 'min'}`;
                        }

                        // Determine Icon
                        let iconHtml = '<i class="fa-solid fa-bell"></i>';
                        let iconBg = 'bg-blue';
                        const type = notif.type_Notification ? notif.type_Notification.toLowerCase() : '';

                        if (type.includes('succes') || type.includes('success') || type.includes('bienvenue')) { iconHtml = '<i class="fa-solid fa-check"></i>'; iconBg = 'bg-green'; }
                        else if (type.includes('alerte') || type.includes('erreur')) { iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>'; iconBg = 'bg-red'; }
                        else if (type.includes('info')) { iconHtml = '<i class="fa-solid fa-info"></i>'; iconBg = 'bg-blue'; }

                        const notifElement = document.createElement('div');
                        notifElement.className = 'notif-item unread';
                        notifElement.innerHTML = `
                            <div class="notif-icon ${iconBg}">${iconHtml}</div>
                            <div class="notif-content">
                                <p>${notif.contenu_Notification}</p>
                                <span>${timeString}</span>
                            </div>
                        `;
                        notifList.appendChild(notifElement);
                    });
                } else {
                    const lang = getCurrentLang();
                    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});
                    notifList.innerHTML = `<div style="padding: 15px; text-align: center; color: #666; font-size: 0.9rem;">${T.notif_none || 'Aucune nouvelle notification'}</div>`;
                    if (notifBadge) notifBadge.style.display = 'none';
                }
            } catch (error) {
                console.error("Erreur de chargement des notifications:", error);
                notifList.innerHTML = '<div style="padding: 15px; text-align: center; color: red; font-size: 0.9rem;">Impossible de charger les notifications</div>';
            }
        };

        // Fetch on load
        fetchNotifications();

        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
                notifDropdown.classList.remove('active');
            }
        });

        // Mark as read behavior
        const markReadBtn = document.querySelector('.mark-read');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => {
                const items = notifList.querySelectorAll('.notif-item');
                items.forEach(item => item.classList.remove('unread'));
                if (notifBadge) notifBadge.style.display = 'none';
            });
        }

        notifBtn.addEventListener('click', () => {
            if (notifBadge) notifBadge.style.display = 'none';
        });
    }

    // --- HOMEPAGE SEARCH LOGIC ---
    const searchInput = document.getElementById('main-search-input');
    const searchResults = document.getElementById('search-results');
    const detailModal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    let searchableData = [];

    // Fetch searchable data
    const fetchSearchData = async () => {
        try {
            const fetchSafe = async (url) => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) return [];
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return await res.json();
                    }
                    return [];
                } catch (e) { return []; }
            };

            const [lieux, activities, services, matches] = await Promise.all([
                fetchSafe(`${API_BASE}/api/lieux?lang=${getCurrentLang()}`),
                fetchSafe(`${API_BASE}/api/activites?lang=${getCurrentLang()}`),
                fetchSafe(`${API_BASE}/api/services?lang=${getCurrentLang()}`),
                fetchSafe(`${API_BASE}/api/matchs?lang=${getCurrentLang()}`)
            ]);

            // Format data into a unified searchable format
            const getTranslation = (obj, field) => {
                if (!obj || !obj[field]) return "";
                const val = obj[field];
                const lang = getCurrentLang();
                
                // If it's an object, get the current language or fallback to fr
                if (typeof val === 'object' && val !== null) {
                    return val[lang] || val['fr'] || Object.values(val)[0] || "";
                }
                return String(val); // It's already a string or number
            };

            let cultureItems = [];
            if (typeof cultureData !== 'undefined') {
                Object.keys(cultureData).forEach(catKey => {
                    cultureData[catKey].items.forEach(item => {
                        const lang = getCurrentLang();
                        const t = window.ui_translations[lang] || {};
                        // Culture items fallback to title if not translated
                        const translatedTitle = t[`culture_item_${item.title.replace(/[\s'-]+/g, '_').toLowerCase()}_title`] || item.title;
                        cultureItems.push({
                            searchType: 'culture',
                            displayName: translatedTitle,
                            title: item.title,
                            description: item.description,
                            subtitle: item.subtitle,
                            categoryKey: catKey,
                            _id: item.title // using title as id for modal
                        });
                    });
                });
            }

            searchableData = [
                ...lieux.map(item => ({ ...item, searchType: 'lieu', displayName: getTranslation(item, 'nom_lieu'), displayType: getTranslation(item, 'type_lieu') || 'Lieu' })),
                ...activities.map(item => ({ ...item, searchType: 'activité', displayName: getTranslation(item, 'intitule_activite'), displayType: 'Activité' })),
                ...services.map(item => {
                    const type = (item.type_service_pratique || '').toLowerCase();
                    const isTrans = type.match(/(train|tram|bus|taxi|voiture|location|vol|avion|aéroport|aeroport|gare)/);
                    const extraKw = isTrans ? 'transport deplacement transports' : 'service pratique services';
                    return { ...item, searchType: 'service', displayName: getTranslation(item, 'type_service_pratique'), displayType: 'Service', description_service_pratique: (item.description_service_pratique || '') + ' ' + extraKw };
                }),
                ...cultureItems.map(item => ({ ...item, displayType: 'Culture' })),
                ...(matches || []).map((item, idx) => {
                    const eqA = (item.equipe_A || item.equipe1 || item.equipe_domicile || 'Équipe A');
                    const eqB = (item.equipe_B || item.equipe2 || item.equipe_exterieur || 'Équipe B');
                    const lang = getCurrentLang();
                    const t = window.ui_translations[lang] || {};
                    const teamA_trans = t[`team_${eqA.toLowerCase()}`] || eqA;
                    const teamB_trans = t[`team_${eqB.toLowerCase()}`] || eqB;
                    const grp = (item.groupe_match || item.groupe || item.phase_match || item.phase || "");
                    const grpFull = grp ? `groupe ${grp}` : "";
                    return { ...item, searchType: 'match', displayName: `${teamA_trans} VS ${teamB_trans}`, displayType: 'Match', nom_lieu: `${teamA_trans} VS ${teamB_trans}`, ville_lieu: `${item.stade || item.lieu || ''} ${grpFull}`, _id: item.id_match || item._id || idx }
                })
            ];
            console.log(`Search data loaded: ${searchableData.length} items`);
        } catch (err) {
            console.error("Erreur critique lors de la préparation de la recherche:", err);
        }
    };

    if (searchInput) {
        fetchSearchData();

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            const pagePath = window.location.pathname;

            // Page-specific direct filtering (without hiding the global dropdown!)
            if (pagePath.includes('matches.html') && typeof window.filterMatches === 'function') {
                window.filterMatches(query);
            }
            if (pagePath.includes('activities.html') && typeof window.filterActivities === 'function') {
                window.filterActivities(query);
            }
            if (pagePath.includes('itineraries.html') && typeof window.filterItineraries === 'function') {
                window.filterItineraries(query);
            }
            if (pagePath.includes('services.html') && typeof window.filterServices === 'function') {
                window.filterServices(query);
            }

            // Global search logic (Homepage or other pages)
            if (query.length < 2) {
                searchResults.classList.remove('active');
                return;
            }

            const queryWords = query.split(/\s+/).filter(w => w.length > 1);
            
            const filtered = searchableData.filter(item => {
                const lang = getCurrentLang();
                
                const getSearchString = (field) => {
                    const val = item[field];
                    if (!val) return "";
                    if (typeof val === 'object') {
                        return ((val[lang] || "") + " " + (val['fr'] || "") + " " + (val['en'] || "")).toLowerCase();
                    }
                    return String(val).toLowerCase();
                };

                const nameField = item.searchType === 'lieu' || item.searchType === 'match' ? 'nom_lieu' : (item.searchType === 'activité' ? 'intitule_activite' : 'type_service_pratique');
                const cityField = item.searchType === 'lieu' || item.searchType === 'match' ? 'ville_lieu' : (item.searchType === 'activité' ? 'ville_activite' : 'ville_service_pratique');
                const descField = item.searchType === 'lieu' ? 'description_lieu' : (item.searchType === 'activité' ? 'description_activite' : 'description_service_pratique');
                const typeField = item.searchType === 'lieu' ? 'type_lieu' : '';
                
                const haystack = (getSearchString(nameField) + " " + getSearchString(cityField) + " " + getSearchString(descField) + " " + getSearchString(typeField));
                
                // Match if the full query is found OR if all words are found (for better fuzzy)
                if (haystack.includes(query)) return true;
                return queryWords.every(word => haystack.includes(word));
            }).slice(0, 10);

            // Save the SEARCH QUERY to history if there are matches (as requested)
            if (filtered.length > 0) {
               saveSearchQueryToHistory(query);
            }

            renderSearchResults(filtered);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });
    }

    function renderSearchResults(results) {
        searchResults.innerHTML = '';
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
        } else {
            results.forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';

                // Determine icon and color based on type
                let iconClass = 'fa-map-marker-alt';
                let iconBg = 'bg-green';
                let typeKey = '';
                let displayType = item.displayType || item.searchType;

                if (item.searchType === 'activité') { iconClass = 'fa-star'; iconBg = 'bg-orange'; if (displayType === 'Activité' || displayType === 'activité') typeKey = 'act_badge'; }
                if (item.searchType === 'lieu') { if (displayType === 'Lieu' || displayType === 'lieu') typeKey = 'modal_location'; }
                if (item.searchType === 'service') { iconClass = 'fa-concierge-bell'; iconBg = 'bg-blue'; if (displayType === 'Service') typeKey = 'stat_services'; }
                if (item.searchType === 'culture') { iconClass = 'fa-landmark'; iconBg = 'bg-purple'; if (displayType === 'Culture') typeKey = 'culture_badge'; }
                if (item.searchType === 'match') { iconClass = 'fa-futbol'; iconBg = 'bg-red'; if (displayType === 'Match') typeKey = 'matches_title'; }

                resultItem.innerHTML = `
                    <div class="search-result-icon ${iconBg}"><i class="fa-solid ${iconClass}"></i></div>
                    <div class="search-result-info">
                        <span class="search-result-name">${item.displayName}</span>
                        <span class="search-result-category" ${typeKey ? `data-i18n="${typeKey}"` : ''}>${displayType}</span>
                    </div>
                `;

                resultItem.addEventListener('click', () => {
                    addToSearchHistory(item); // SAVE TO HISTORY
                    if (item.searchType === 'match') {
                        window.location.href = 'matches.html';
                        return;
                    }
                    if (typeof openDetailModal === 'function') openDetailModal(item);
                    searchResults.classList.remove('active');
                    searchInput.value = item.displayName;
                });

                searchResults.appendChild(resultItem);
            });
        }
        searchResults.classList.add('active');
        if (typeof applyUITranslations === 'function') {
            applyUITranslations(getCurrentLang());
        }
    }

    // --- SEARCH HISTORY STORAGE LOGIC -// Save a search query string to history
function saveSearchQueryToHistory(query) {
    if (!query || query.length < 3) return;
    
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    // Check if this query is already in history as a string
    const exists = history.find(h => h.isQuery && h.text.toLowerCase() === query.toLowerCase());
    if (exists) return;

    const historyItem = {
        id: 'q-' + Date.now(),
        text: query,
        isQuery: true,
        date: new Date().toISOString()
    };

    history.unshift(historyItem);
    if (history.length > 10) history.pop();
    
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

// Add a clicked item to history
function addToSearchHistory(item) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    // Remove if already exists (to bump to top)
    history = history.filter(h => h.id !== item._id && h.id !== item.id_lieu && h.id !== item.id_activite && h.id !== item.id_service_pratique);
    
    const historyItem = {
        id: item._id || item.id_lieu || item.id_activite || item.id_service_pratique,
        type: item.searchType,
        text: item.displayName || item.text,
        isQuery: false,
        date: new Date().toISOString()
    };

    history.unshift(historyItem);
    if (history.length > 10) history.pop();
    
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

    // Helper to open modal directly from ID (for history)
    window.openDetailModalDirectly = async (type, id) => {
        // Find the full item data from searchableData if already loaded
        let item = searchableData.find(d => (d.id_lieu || d.id_activite || d.id_service || d._id) == id && d.searchType == type);
        
        if (!item) {
            // If not found in current searchableData, we might need to fetch it
            try {
                let url = '';
                if (type === 'lieu') url = `${API_BASE}/api/lieux/${id}`;
                if (type === 'activité') url = `${API_BASE}/api/activites/${id}`;
                if (type === 'service') url = `${API_BASE}/api/services/${id}`;
                
                if (url) {
                    const res = await fetch(`${url}?lang=${getCurrentLang()}`);
                    if (res.ok) {
                        item = await res.json();
                        item.searchType = type;
                        item.displayName = item.nom_lieu || item.nom_activite || item.type_service_pratique;
                    }
                }
            } catch(e) { console.error(e); }
        }

        if (item) {
            openDetailModal(item);
        }
    };

    function openDetailModal(item) {
        if (!detailModal || !modalBody) return;

        // Populate modal content
        const lang = getCurrentLang();
        const getVal = (val) => {
            if (!val) return "";
            if (typeof val === 'string') return val;
            return val[lang] || val['fr'] || "";
        };

        const name = item.displayName || getVal(item.nom_lieu || item.nom_activite || item.type_service_pratique);
        const type = item.searchType;
        const desc = getVal(item.description_lieu || item.description_activite || item.description_service_pratique) || "Aucune description disponible.";
        const ville = getVal(item.ville_lieu || item.ville_activite || item.ville_service_pratique) || "Ville non spécifiée";

        let tagColor = 'bg-green';
        if (type === 'activité') tagColor = 'bg-orange';
        if (type === 'service') tagColor = 'bg-blue';

        const tagKey = type === 'activité' ? 'activities' : (type === 'service' ? 'service_tag' : 'places');
        
        contentHtml = `
            <h2>${name}</h2>
            <span class="modal-category-tag ${tagColor}" data-i18n="${tagKey}">${type}</span>
            <div class="modal-description">${desc}</div>
            <div class="modal-detail-grid">
                <div class="modal-info-section">
                    <h3 data-i18n="information"><i class="fa-solid fa-circle-info"></i> Informations</h3>
                    <div class="modal-info-item">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>${ville}</span>
                    </div>
                    ${item.type_lieu ? `<div class="modal-info-item"><i class="fa-solid fa-tag"></i> <span>${getVal(item.type_lieu)}</span></div>` : ''}
                    ${item.prix_activite ? `<div class="modal-info-item"><i class="fa-solid fa-money-bill"></i> <span data-i18n="price">Prix</span>: <span>${item.prix_activite} MAD</span></div>` : ''}
                    ${item.duree_activite ? `<div class="modal-info-item"><i class="fa-solid fa-clock"></i> <span data-i18n="duration">Durée</span>: <span>${item.duree_activite}</span></div>` : ''}
                </div>
                ${item['photo url activite'] ? `<img src="${item['photo url activite']}" class="modal-image" alt="${name}">` : ''}
            </div>
        `;

        modalBody.innerHTML = contentHtml;
        if (typeof applyUITranslations === 'function') {
            applyUITranslations(getCurrentLang());
        }
        detailModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent page scroll
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            detailModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            detailModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });


    console.log('Morocco 2030 Website Loaded with Animations & Modal');

    // --- MAP PAGE LOGIC ---
    const mapElement = document.getElementById('map');
    if (mapElement) {
        console.log("Map element found, initializing Leaflet...");

        try {
            // Check if L is defined
            if (typeof L === 'undefined') {
                console.error("Leaflet (L) is not defined. Script might not be loaded.");
                return;
            }

            // Initialize Map
            const map = L.map('map').setView([31.7917, -7.0926], 6); // Centered on Morocco

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);

            // Fetch Data Points from API
            let locations = [];
            let markers = [];
            const kpiValue = document.getElementById('kpiValue');

            fetch(`http://localhost:5000/api/lieux?lang=${getCurrentLang()}`)
                .then(res => res.json())
                .then(data => {
                    let parsedLocations = [];
                    data.forEach(lieu => {
                        if (lieu.location) {
                            let lat, lng;
                            if (lieu.location.type === 'Point' && Array.isArray(lieu.location.coordinates)) {
                                lng = parseFloat(lieu.location.coordinates[0]);
                                lat = parseFloat(lieu.location.coordinates[1]);
                            } else if (lieu.location.type === 'Point' && typeof lieu.location.coordinates === 'string') {
                                // Handle string format: "lng lat" (e.g., "-7.6114 33.5731")
                                const parts = lieu.location.coordinates.trim().split(/\s+/);
                                if (parts.length === 2) {
                                    lng = parseFloat(parts[0]);
                                    lat = parseFloat(parts[1]);
                                }
                            } else if (lieu.location.lat !== undefined && lieu.location.lng !== undefined) {
                                lat = parseFloat(lieu.location.lat);
                                lng = parseFloat(lieu.location.lng);
                            }

                            if (lat !== undefined && lng !== undefined) {
                                // Normalize type for map filters (stadium, hotel, restaurant, attraction)
                                let normalizedType = 'attraction';
                                const _typeRaw = lieu.type_lieu || '';
                                const rawType = typeof _typeRaw === 'object' ? Object.values(_typeRaw).join(' ').toLowerCase() : String(_typeRaw).toLowerCase();
                                if (['stade','stadium','ملعب','estadio'].some(k => rawType.includes(k))) normalizedType = 'stadium';
                                else if (['hôtel','hotel','فندق','riad'].some(k => rawType.includes(k))) normalizedType = 'hotel';
                                else if (['restaurant','café','cafe','مطعم','restaurante'].some(k => rawType.includes(k))) normalizedType = 'restaurant';

                                parsedLocations.push({
                                    id: lieu.id_lieu,
                                    name: lieu.nom_lieu,
                                    type: normalizedType,
                                    originalType: lieu.type_lieu || 'Attraction',
                                    coords: [lat, lng]
                                });
                            }
                        }
                    });
                    locations = parsedLocations;

                    const urlParams = new URLSearchParams(window.location.search);
                    const targetLat = parseFloat(urlParams.get('lat'));
                    const targetLng = parseFloat(urlParams.get('lng'));
                    const targetName = decodeURIComponent(urlParams.get('name') || '');
                    const targetLocationId = urlParams.get('location');

                    renderMarkers('all');

                    // Priorité 1 : coordonnées GPS directes dans l'URL
                    if (!isNaN(targetLat) && !isNaN(targetLng)) {
                        map.setView([targetLat, targetLng], 15);
                        const highlightIcon = L.divIcon({
                            className: 'custom-marker',
                            html: '<div style="background-color:#e53e3e;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(229,62,62,0.7);"></div>',
                            iconSize: [22, 22],
                            iconAnchor: [11, 11]
                        });
                        setTimeout(() => {
                            L.marker([targetLat, targetLng], { icon: highlightIcon })
                                .bindPopup('<div class="map-popup"><h3 style="margin:0 0 5px 0;font-size:1.1rem;">' + targetName + '</h3></div>')
                                .addTo(map)
                                .openPopup();
                        }, 300);

                    // Priorité 2 : fallback par ID
                    } else if (targetLocationId) {
                        const targetLieu = locations.find(loc => String(loc.id) === String(targetLocationId));
                        if (targetLieu && targetLieu.coords) {
                            map.setView(targetLieu.coords, 15);
                            setTimeout(() => {
                                const targetMarkerObj = markers.find(m => String(m.id) === String(targetLocationId));
                                if (targetMarkerObj) targetMarkerObj.marker.openPopup();
                            }, 400);
                        }
                    }
                })
                .catch(err => console.error("Erreur de chargement des Lieux:", err));

            // Custom Icons
            const getIconColor = (type) => {
                const t = type ? type.toLowerCase() : '';
                if (t.includes('stade') || t.includes('stadium')) return '#9C27B0';
                if (t.includes('hôtel') || t.includes('hotel')) return '#2196F3';
                if (t.includes('restaurant')) return '#FF5722';
                if (t.includes('monument') || t.includes('historique') || t.includes('attraction')) return '#4CAF50';
                return '#333'; // default color
            };

            const createMarker = (loc) => {
                const color = getIconColor(loc.type);
                const markerHtml = `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`;

                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: markerHtml,
                    iconSize: [18, 18],
                    iconAnchor: [9, 9]
                });

                const marker = L.marker(loc.coords, { icon: icon })
                    .bindPopup(`
                        <div class="map-popup">
                            <h3 style="margin: 0 0 5px 0; font-size: 1.1rem;">${loc.name}</h3>
                            <p style="margin: 0 0 10px 0; color: ${color}; font-weight: 600; text-transform: capitalize;">${loc.originalType}</p>
                        </div>
                    `);

                return { marker, id: loc.id, type: loc.type };
            };

            // Global listener for translation of dynamic popups
            map.on('popupopen', () => {
                applyUITranslations(getCurrentLang());
            });

            // Render Markers
            const renderMarkers = (filter) => {
                // Clear existing
                markers.forEach(m => map.removeLayer(m.marker));
                markers = [];

                let count = 0;
                locations.forEach(loc => {
                    if (filter === 'all' || loc.type === filter) {
                        const m = createMarker(loc);
                        m.marker.addTo(map);
                        markers.push(m);
                        count++;
                    }
                });

                // Update KPI
                if (kpiValue) {
                    animateValue(kpiValue, parseInt(kpiValue.textContent) || 0, count, 500);
                }

                // Ensure markers are translated if needed
                applyUITranslations(getCurrentLang());
            }

            // Filter Logic
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderMarkers(btn.dataset.filter);
                });
            });

            // Initial Render
            renderMarkers('all');

        } catch (error) {
            console.error("Map initialization error:", error);
        }
    }

    // Number Animation Helper
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }


    // --- HOMEPAGE: Category filter + Load real matches + activities ---
    const homeMatchesGrid = document.getElementById('home-matches-grid');
    const homeDestGrid = document.getElementById('home-destinations-grid');
    const categoriesList = document.getElementById('categories-list');

    // All lieux fetched once for filtering
    let allLieux = [];

    // Render a lieu
    function renderLieuCard(lieu) {
        // Handle multilingual type_lieu object
        const type_raw = lieu.type_lieu || '';
        const type = typeof type_raw === 'object' ? (type_raw['fr'] || Object.values(type_raw)[0] || '') : String(type_raw);
        const ville = lieu.ville_lieu || '';
        const rawDesc = lieu.description_lieu || '';
        const rawName = lieu.nom_lieu || 'Lieu';
        const imgPath = lieu.image_lieu;

        // Attempt multilingual extraction (if DB returns object with lang keys)
        const _descLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : (localStorage.getItem('selectedLang') || 'fr');
        let desc = (typeof rawDesc === 'object') ? (rawDesc[_descLang] || rawDesc['fr'] || '') : rawDesc;
        let name = (typeof rawName === 'object') ? (rawName[_descLang] || rawName['fr'] || '') : rawName;

        // Short description translation dictionary (for plain French strings from DB)
        const descTrans = {
            'ar': {
                'Forteresse historique': 'قلعة تاريخية',
                'Forteresse historique de': 'قلعة تاريخية',
                'Place animée historique': 'ساحة تاريخية حيوية',
                'Grande mosquée emblématique': 'مسجد كبير بارز',
                'Mosquée emblématique': 'مسجد بارز',
                'Site historique': 'موقع تاريخي',
                'Monument historique': 'معلم تاريخي',
                'Hôtel de luxe': 'فندق فاخر',
                'Hôtel luxe': 'فندق فاخر',
                'Cours de surf avec moniteur': 'دروس التزلج على الأمواج مع مدرب',
                'Cours de surf': 'دروس التزلج على الأمواج',
                "Vivez l\'ambiance au stade": 'عيش الأجواء في الملعب',
                "Vivez l\'ambiance": 'عيش الأجواء',
                'Atelier de cuisine': 'ورشة الطبخ',
                'Balade en mer': 'نزهة بحرية',
                'Festival de musique': 'مهرجان موسيقي',
                'Marché traditionnel': 'سوق تقليدي',
                'Jardin botanique': 'حديقة نباتية',
                'Palais royal': 'القصر الملكي',
                'Médina historique': 'المدينة العتيقة التاريخية',
                'Kasbah historique': 'قصبة تاريخية',
                'Ancienne résidence': 'مقر قديم',
                'Mosquée du': 'مسجد',
                'Place centrale': 'الساحة المركزية',
                'Espace culturel': 'فضاء ثقافي',
                'Centre commercial': 'مركز تجاري',
                'Parc naturel': 'حديقة طبيعية',
                'Port de pêche': 'ميناء الصيد',
                'Plage de sable': 'شاطئ رملي',
                'Musée national': 'المتحف الوطني',
                'École islamique': 'مدرسة إسلامية',
                'Ancienne école': 'مدرسة قديمة',
            },
            'en': {
                'Forteresse historique': 'Historic Fortress',
                'Place animée historique': 'Historic Lively Square',
                'Grande mosquée emblématique': 'Iconic Grand Mosque',
                'Mosquée emblématique': 'Iconic Mosque',
                'Site historique': 'Historic Site',
                'Monument historique': 'Historic Monument',
                'Hôtel de luxe': 'Luxury Hotel',
                'Hôtel luxe': 'Luxury Hotel',
                'Cours de surf avec moniteur': 'Surf lessons with instructor',
                'Cours de surf': 'Surf lessons',
                "Vivez l\'ambiance au stade": 'Experience the stadium atmosphere',
                "Vivez l\'ambiance": 'Experience the atmosphere',
                'Atelier de cuisine': 'Cooking workshop',
                'Balade en mer': 'Sea trip',
                'Festival de musique': 'Music festival',
                'Marché traditionnel': 'Traditional market',
                'Jardin botanique': 'Botanical garden',
                'Palais royal': 'Royal Palace',
                'Médina historique': 'Historic Medina',
                'Kasbah historique': 'Historic Kasbah',
                'Ancienne résidence': 'Former residence',
                'Place centrale': 'Central square',
                'Espace culturel': 'Cultural space',
                'Parc naturel': 'Natural park',
                'Port de pêche': 'Fishing port',
                'Plage de sable': 'Sandy beach',
                'Musée national': 'National Museum',
                'École islamique': 'Islamic school',
                'Ancienne école': 'Ancient school',
            },
            'es': {
                'Forteresse historique': 'Fortaleza histórica',
                'Place animée historique': 'Plaza histórica animada',
                'Grande mosquée emblématique': 'Gran mezquita emblemática',
                'Mosquée emblématique': 'Mezquita emblemática',
                'Site historique': 'Sitio histórico',
                'Monument historique': 'Monumento histórico',
                'Hôtel de luxe': 'Hotel de lujo',
                'Hôtel luxe': 'Hotel de lujo',
                'Cours de surf avec moniteur': 'Clases de surf con instructor',
                'Cours de surf': 'Clases de surf',
                "Vivez l\'ambiance au stade": 'Vive el ambiente en el estadio',
                "Vivez l\'ambiance": 'Vive el ambiente',
                'Atelier de cuisine': 'Taller de cocina',
                'Balade en mer': 'Paseo en barco',
                'Festival de musique': 'Festival de música',
                'Marché traditionnel': 'Mercado tradicional',
                'Jardin botanique': 'Jardín botánico',
                'Palais royal': 'Palacio Real',
                'Médina historique': 'Medina histórica',
                'Kasbah historique': 'Kasbah histórica',
                'Ancienne résidence': 'Antigua residencia',
                'Place centrale': 'Plaza central',
                'Espace culturel': 'Espacio cultural',
                'Parc naturel': 'Parque natural',
                'Port de pêche': 'Puerto pesquero',
                'Plage de sable': 'Playa de arena',
                'Musée national': 'Museo nacional',
                'École islamique': 'Escuela islámica',
                'Ancienne école': 'Escuela antigua',
            }
        };

        // Translate desc if it's a plain French string
        if (_descLang !== 'fr' && typeof desc === 'string' && desc.length > 0) {
            const langDescMap = descTrans[_descLang];
            if (langDescMap) {
                // Try to find a matching key (full or starts-with)
                const matchKey = Object.keys(langDescMap).find(k => desc.startsWith(k) || desc === k);
                if (matchKey) desc = langDescMap[matchKey] + (desc.length > matchKey.length ? desc.substring(matchKey.length) : '');
            }
        }
        
        let bgImage = 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80';
        if (imgPath) {
            if (imgPath.startsWith('http')) {
                bgImage = imgPath;
            } else if (imgPath.startsWith('image')) {
                bgImage = imgPath.replace(/^image\//, 'images/');
            } else {
                bgImage = imgPath.startsWith('/') ? `${API_BASE}${imgPath}` : `${API_BASE}/${imgPath}`;
            }
        }

        // Tag color based on type
        const _lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : (localStorage.getItem('selectedLang') || 'fr');
        const typeTrans = {
            'ar': {
                'Stade': 'ملعب', 'Hôtel': 'فندق', 'Restaurant': 'مطعم',
                'Monument': 'معلم', 'Attraction': 'معلم سياحي',
                'Place historique': 'ساحة تاريخية', 'Site historique': 'موقع تاريخي',
                'Forteresse historique': 'قلعة تاريخية', 'Forteresse': 'قلعة',
                'Grande mosquée emblématique': 'مسجد كبير بارز', 'Mosquée': 'مسجد',
                'Musée': 'متحف', 'Jardin': 'حديقة', 'Médina': 'مدينة عتيقة',
                'Kasbah': 'قصبة', 'Palais': 'قصر', 'Riad': 'رياض'
            },
            'en': {
                'Stade': 'Stadium', 'Hôtel': 'Hotel', 'Restaurant': 'Restaurant',
                'Monument': 'Monument', 'Attraction': 'Attraction',
                'Place historique': 'Historic Square', 'Site historique': 'Historic Site',
                'Forteresse historique': 'Historic Fortress', 'Forteresse': 'Fortress',
                'Grande mosquée emblématique': 'Iconic Grand Mosque', 'Mosquée': 'Mosque',
                'Musée': 'Museum', 'Jardin': 'Garden', 'Médina': 'Medina',
                'Kasbah': 'Kasbah', 'Palais': 'Palace', 'Riad': 'Riad'
            },
            'es': {
                'Stade': 'Estadio', 'Hôtel': 'Hotel', 'Restaurant': 'Restaurante',
                'Monument': 'Monumento', 'Attraction': 'Atracción',
                'Place historique': 'Plaza histórica', 'Site historique': 'Sitio histórico',
                'Forteresse historique': 'Fortaleza histórica', 'Forteresse': 'Fortaleza',
                'Grande mosquée emblématique': 'Gran mezquita emblemática', 'Mosquée': 'Mezquita',
                'Musée': 'Museo', 'Jardin': 'Jardín', 'Médina': 'Medina',
                'Kasbah': 'Kasbah', 'Palais': 'Palacio', 'Riad': 'Riad'
            }
        };
        const translatedType = (typeTrans[_lang] && typeTrans[_lang][type]) ? typeTrans[_lang][type] : type;
        const tagColors = {
            'Stade': 'tag-purple', 'Hôtel': 'tag-blue', 'Restaurant': 'tag-red',
            'Monument': 'tag-green', 'Attraction': 'tag-green', 'Place historique': 'tag-green',
            'Site historique': 'tag-green', 'Forteresse historique': 'tag-green', 'Forteresse': 'tag-green'
        };
        const tagClass = tagColors[type] || 'tag-purple';

        return `
            <div class="destination-card" style="position: relative;">
                ${typeof generateActionButtons === 'function' ? generateActionButtons('Lieu', lieu.id_lieu || lieu._id, name) : ''}
                <div class="card-image" style="background-image: url('${bgImage}');">
                    <div class="rating"><i class="fa-solid fa-star"></i> ${translatedType}</div>
                </div>
                <div class="card-content">
                    <span class="tag ${tagClass}">${translatedType || 'Lieu'}</span>
                    <h3>${name}</h3>
                    <p class="location"><i class="fa-solid fa-location-dot"></i> ${ville}</p>
                    <p class="description">${desc.substring(0, 80)}${desc.length > 80 ? '...' : ''}</p>
                    <a href="activities.html" class="btn-explorer" data-i18n="explore_btn">Explorer <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>`;
    }

    // Helper: flatten multilingual type_lieu for keyword search
    function getTypeLower(t) {
        if (!t) return '';
        if (typeof t === 'string') return t.toLowerCase();
        if (typeof t === 'object') return Object.values(t).join(' ').toLowerCase();
        return '';
    }

    function renderDestinations(filter) {
        if (!homeDestGrid) return;

        // Normalize: index.html uses French values ("Stade", "Hôtel", "Restaurant", "Attraction")
        const filterNorm = {
            'all':'all','tout':'all',
            'Stade':'stadium','stade':'stadium','stadium':'stadium','estadio':'stadium',
            'Hôtel':'hotel','hôtel':'hotel','hotel':'hotel','riad':'hotel',
            'Restaurant':'restaurant','restaurant':'restaurant',
            'Attraction':'attraction','attraction':'attraction'
        };
        const f = filterNorm[filter] || 'all';

        const filtered = f === 'all'
            ? allLieux.filter(l => l.id_categorie !== 99).slice(0, 3)
            : allLieux.filter(l => {
                const s = getTypeLower(l.type_lieu);
                if (f === 'stadium'    && ['stade','stadium','ملعب','estadio'].some(k => s.includes(k))) return true;
                if (f === 'hotel'      && ['hôtel','hotel','فندق','riad'].some(k => s.includes(k))) return true;
                if (f === 'restaurant' && ['restaurant','café','cafe','مطعم','restaurante'].some(k => s.includes(k))) return true;
                if (f === 'attraction' && !['stade','stadium','ملعب','estadio','hôtel','hotel','فندق','riad','restaurant','café','cafe','مطعم','restaurante'].some(k => s.includes(k))) return true;
                return false;
            }).slice(0, 6);

        if (filtered.length === 0) {
            homeDestGrid.innerHTML = `<p style="text-align:center;padding:30px;color:#999;">Aucun résultat pour cette catégorie.</p>`;
            return;
        }
        homeDestGrid.innerHTML = filtered.map(renderLieuCard).join('');
        if (typeof applyUITranslations === 'function') {
            applyUITranslations(getCurrentLang());
        }
    }

    // Category click handlers
    if (categoriesList) {
        categoriesList.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                categoriesList.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const filter = card.dataset.filter || 'all';
                if (allLieux.length > 0) {
                    renderDestinations(filter);
                }
            });
        });
    }

    // Load lieux for category filtering
    if (homeDestGrid) {
        fetch(`http://localhost:5000/api/lieux?lang=${getCurrentLang()}`)
            .then(r => r.json())
            .then(data => {
                allLieux = data;
                renderDestinations('all'); // default: show first 3
            })
            .catch(() => {
                // Fallback: load activities if lieux fails
                fetch(`http://localhost:5000/api/activites?lang=${getCurrentLang()}`)
                    .then(r => r.json())
                    .then(data => {
                        homeDestGrid.innerHTML = '';
                        data.slice(0, 3).forEach(act => {
                            let bgImage = 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80';
                            if (act['photo url activite'] && act['photo url activite'].startsWith('http')) bgImage = act['photo url activite'];
                            const name = act.nom_activite || 'Activité';
                            const ville = act.ville_activite || '';
                            const desc = act.description_activite || '';
                            const prix = act.prix_activite ? act.prix_activite + ' MAD' : 'Gratuit';
                            homeDestGrid.innerHTML += `
                                <div class="destination-card">
                                    <div class="card-image" style="background-image: url('${bgImage}');">
                                        <div class="rating"><i class="fa-solid fa-star"></i> ${prix}</div>
                                    </div>
                                    <div class="card-content">
                                        <span class="tag tag-purple">activité</span>
                                        <h3>${name}</h3>
                                        <p class="location"><i class="fa-solid fa-location-dot"></i> ${ville}</p>
                                        <p class="description">${desc.substring(0, 80)}${desc.length > 80 ? '...' : ''}</p>
                                        <a href="activities.html" class="btn-explorer" data-i18n="explore_btn">Explorer <i class="fa-solid fa-arrow-right"></i></a>
                                    </div>
                                </div>`;
                        });
                        if (typeof applyUITranslations === 'function') {
                            applyUITranslations(getCurrentLang());
                        }
                    })
                    .catch(() => {
                        homeDestGrid.innerHTML = '<p style="text-align:center;color:#999;">Impossible de charger les données.</p>';
                    });
            });
    }

    function renderHomeMatch(match) {
        const lang = getCurrentLang();
        const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : (window.ui_translations && window.ui_translations['fr']) || {};
        const fallbackTeamA  = T.team_a || 'Équipe A';
        const fallbackTeamB  = T.team_b || 'Équipe B';
        const fallbackMatch  = T.match_label || 'Match';
        const fallbackStadium = T.stadium_label || 'Stade';

        const eq1_raw = match.equipe1 || match.equipe_domicile || match.equipe_A || fallbackTeamA;
        const eq2_raw = match.equipe2 || match.equipe_exterieur || match.equipe_B || fallbackTeamB;
        const eq1 = window.getLocalizedValue(eq1_raw, lang);
        const eq2 = window.getLocalizedValue(eq2_raw, lang);

        const getCountryCodeStr = (n) => {
            if (!n) return '';
            const codes = { "Senegal":"SN","Sénégal":"SN","السنغال":"SN","Netherlands":"NL","Pays-Bas":"NL","Países Bajos":"NL","هولندا":"NL","Argentina":"AR","Argentine":"AR","الأرجنتين":"AR","Mexico":"MX","Mexique":"MX","México":"MX","المكسيك":"MX","Spain":"ES","Espagne":"ES","España":"ES","إسبانيا":"ES","Japan":"JP","Japon":"JP","Japón":"JP","اليابان":"JP","Maroc":"MA","Morocco":"MA","Marruecos":"MA","المغرب":"MA","Portugal":"PT","البرتغال":"PT","Brésil":"BR","Brazil":"BR","Brasil":"BR","البرازيل":"BR","France":"FR","Francia":"FR","فرنسا":"FR","Arabie Saoudite":"SA","Saudi Arabia":"SA","Arabia Saudita":"SA","السعودية":"SA","Etats-Unis":"US","USA":"US","United States":"US","Estados Unidos":"US","الولايات المتحدة":"US","أمريكا":"US" };
            const t = n.trim();
            if (codes[t]) return codes[t];
            if (/^[\u0600-\u06FF]/.test(t)) return t.startsWith('ال') ? t.substring(2,4).toUpperCase() : t.substring(0,2).toUpperCase();
            return t.substring(0,2).toUpperCase();
        };

        const code1 = getCountryCodeStr(eq1);
        const code2 = getCountryCodeStr(eq2);
        const stade = window.getLocalizedValue(match.stade || match.lieu || fallbackStadium, lang);
        const phase = window.getLocalizedValue(match.phase || match.type_match || fallbackMatch, lang);

        // Live countdown
        const pad = (n) => String(n).padStart(2, '0');
        let matchDate = new Date('2030-06-15T20:00:00');
        if (match.date_match) {
            const dp = match.date_match.split('/');
            if (dp.length === 3) matchDate = new Date(`${dp[2]}-${dp[1]}-${dp[0]}T20:00:00`);
        } else if (match.date) { matchDate = new Date(match.date); }
        const diff0 = Math.max(0, matchDate - new Date());
        const d0 = Math.floor(diff0/(1000*60*60*24));
        const h0 = Math.floor((diff0/(1000*60*60))%24);
        const m0 = Math.floor((diff0/(1000*60))%60);
        const s0 = Math.floor((diff0/1000)%60);
        const dateLocale = lang==='ar'?'ar-MA':lang==='es'?'es-ES':lang==='en'?'en-GB':'fr-FR';
        const dateDisplay = matchDate.toLocaleDateString(dateLocale, {day:'2-digit',month:'long',year:'numeric'});

        homeMatchesGrid.innerHTML += `
            <div class="match-card" style="position: relative;">
                ${typeof generateActionButtons === 'function' ? generateActionButtons('Match', match.id_match, eq1 + ' VS ' + eq2) : ''}
                <div class="match-status">${phase}</div>
                <div class="teams">
                    <div class="team"><span class="team-code">${code1}</span><span class="team-name">${eq1}</span></div>
                    <div class="vs">VS</div>
                    <div class="team"><span class="team-code">${code2}</span><span class="team-name">${eq2}</span></div>
                </div>
                <div class="home-match-countdown" data-target-date="${matchDate.toISOString()}" style="display:flex;justify-content:center;gap:10px;margin:10px 0;">
                    <div style="text-align:center;"><span class="hm-days" style="font-size:1.4rem;font-weight:700;color:#e50027;">${pad(d0)}</span><br><span data-i18n="days_label" style="font-size:0.7rem;color:#888;">${T.days_label||'jours'}</span></div>
                    <div style="font-size:1.4rem;font-weight:700;color:#ccc;">:</div>
                    <div style="text-align:center;"><span class="hm-hours" style="font-size:1.4rem;font-weight:700;color:#e50027;">${pad(h0)}</span><br><span data-i18n="hours_label" style="font-size:0.7rem;color:#888;">${T.hours_label||'h'}</span></div>
                    <div style="font-size:1.4rem;font-weight:700;color:#ccc;">:</div>
                    <div style="text-align:center;"><span class="hm-mins" style="font-size:1.4rem;font-weight:700;color:#e50027;">${pad(m0)}</span><br><span data-i18n="mins_label" style="font-size:0.7rem;color:#888;">${T.mins_label||'min'}</span></div>
                    <div style="font-size:1.4rem;font-weight:700;color:#ccc;">:</div>
                    <div style="text-align:center;"><span class="hm-secs" style="font-size:1.4rem;font-weight:700;color:#e50027;">${pad(s0)}</span><br><span data-i18n="secs_label" style="font-size:0.7rem;color:#888;">${T.secs_label||'sec'}</span></div>
                </div>
                <div class="match-info">
                    <p><a href="map.html?location=${match.id_lieu}" style="color:inherit;text-decoration:none;border-bottom:1px dashed #666;">${stade}</a></p>
                    <p class="match-date">${dateDisplay}</p>
                </div>
            </div>
        `;
    }

    if (homeMatchesGrid) {
        fetch(`http://localhost:5000/api/matchs?lang=${getCurrentLang()}`)
            .then(r => r.json())
            .then(data => {
                homeMatchesGrid.innerHTML = '';
                const first3 = data.slice(0, 3);
                if (first3.length === 0) {
                    homeMatchesGrid.innerHTML = '<p style="text-align:center;color:#666;">Aucun match disponible.</p>';
                    return;
                }
                first3.forEach(match => renderHomeMatch(match));
                if (typeof applyUITranslations === 'function') applyUITranslations(getCurrentLang());
            })
            .catch(() => {
                homeMatchesGrid.innerHTML = '<p style="text-align:center;color:#999;">Impossible de charger les matchs.</p>';
            });
    }

    // --- HOME MATCH COUNTDOWN TICKER (1 sec) ---
    setInterval(() => {
        const padH = (n) => String(n).padStart(2,'0');
        document.querySelectorAll('.home-match-countdown[data-target-date]').forEach(el => {
            const diff = Math.max(0, new Date(el.getAttribute('data-target-date')) - new Date());
            const dEl = el.querySelector('.hm-days'),  hEl = el.querySelector('.hm-hours');
            const mEl = el.querySelector('.hm-mins'),  sEl = el.querySelector('.hm-secs');
            if (dEl) dEl.textContent = padH(Math.floor(diff/(1000*60*60*24)));
            if (hEl) hEl.textContent = padH(Math.floor((diff/(1000*60*60))%24));
            if (mEl) mEl.textContent = padH(Math.floor((diff/(1000*60))%60));
            if (sEl) sEl.textContent = padH(Math.floor((diff/1000)%60));
        });
    }, 1000);



    // --- ITINERARIES PAGE LOGIC ---
    const itinerariesDashboard = document.getElementById('itineraries-dashboard');
    const itineraryFormView = document.getElementById('itinerary-form-view');
    const btnCreateItinerary = document.getElementById('btn-create-itinerary');
    const btnCancelItinerary = document.getElementById('btn-cancel-itinerary');
    const btnSaveItinerary = document.getElementById('btn-save-itinerary');

    // Modal Elements
    const placesModal = document.getElementById('placesModal');
    const btnOpenPlacesModal = document.getElementById('btn-open-places-modal');
    const btnClosePlacesModal = document.querySelector('.close-modal-simple');

    // State
    let myItineraries = JSON.parse(localStorage.getItem('myItineraries')) || [];
    let tempPlaces = [];

    // Mock Data for Places Modal
    const availablePlaces = [
        { id: 1, name: "Grand Stade de Casablanca", type: "Stade", icon: "fa-futbol" },
        { id: 2, name: "Stade de Marrakech", type: "Stade", icon: "fa-futbol" },
        { id: 3, name: "Mosquée Hassan II", type: "Culture", icon: "fa-mosque" },
        { id: 4, name: "Jardin Majorelle", type: "Nature", icon: "fa-leaf" },
        { id: 5, name: "Royal Mansour", type: "Hôtel", icon: "fa-hotel" },
        { id: 6, name: "Le Dhow", type: "Restaurant", icon: "fa-utensils" },
        { id: 7, name: "Place Jemaa el-Fna", type: "Culture", icon: "fa-users" },
        { id: 8, name: "Tour Hassan", type: "Histoire", icon: "fa-landmark" }
    ];

    if (itinerariesDashboard) {
        console.log("Itineraries Dashboard found, initializing logic...");
        renderItinerariesList();

        // Show Create Form
        btnCreateItinerary.addEventListener('click', () => {
            itinerariesDashboard.classList.add('hidden');
            itineraryFormView.classList.remove('hidden');
            resetForm();
        });

        // Cancel Creation
        btnCancelItinerary.addEventListener('click', () => {
            itineraryFormView.classList.add('hidden');
            itinerariesDashboard.classList.remove('hidden');
            resetForm();
        });

        // Open Places Modal
        btnOpenPlacesModal.addEventListener('click', (e) => {
            e.preventDefault(); // prevent form submit if inside form tag (though here it's div)
            renderAvailablePlaces();
            placesModal.classList.add('active');
        });

        // Close Modal
        if (btnClosePlacesModal) {
            btnClosePlacesModal.addEventListener('click', () => {
                placesModal.classList.remove('active');
            });
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === placesModal) {
                placesModal.classList.remove('active');
            }
        });

        // Save Itinerary
        btnSaveItinerary.addEventListener('click', () => {
            const name = document.getElementById('itin-name').value;
            const date = document.getElementById('itin-date').value;

            if (!name || !date) {
                alert("Veuillez remplir le nom et la date.");
                return;
            }

            const newItinerary = {
                id: Date.now(),
                name: name,
                date: date,
                places: [...tempPlaces]
            };

            myItineraries.push(newItinerary);
            saveItineraries();
            renderItinerariesList();

            // Go back to dashboard
            itineraryFormView.classList.add('hidden');
            itinerariesDashboard.classList.remove('hidden');
            resetForm();
        });
    }

    function renderAvailablePlaces() {
        const listContainer = document.getElementById('available-places-list');
        listContainer.innerHTML = '';

        availablePlaces.forEach(place => {
            const isSelected = tempPlaces.some(p => p.id === place.id);
            if (isSelected) return; // Don't show if already added

            const row = document.createElement('div');
            row.className = 'place-item-row';
            row.innerHTML = `
                <div class="place-info">
                    <div class="place-thumb" style="display:flex;justify-content:center;align-items:center;font-size:1.2rem;color:#777;"><i class="fa-solid ${place.icon}"></i></div>
                    <div class="place-text">
                        <h4>${place.name}</h4>
                        <p>${place.type}</p>
                    </div>
                </div>
                <button class="btn-add-place" data-id="${place.id}"><i class="fa-solid fa-plus"></i></button>
            `;

            row.querySelector('.btn-add-place').addEventListener('click', () => {
                addPlaceToTemp(place);
                placesModal.classList.remove('active');
            });

            listContainer.appendChild(row);
        });
    }

    function addPlaceToTemp(place) {
        tempPlaces.push(place);
        renderSelectedPlaces();
    }

    function removePlaceFromTemp(placeId) {
        tempPlaces = tempPlaces.filter(p => p.id !== placeId);
        renderSelectedPlaces();
    }

    function renderSelectedPlaces() {
        const container = document.getElementById('selected-places-container');
        const countSpan = document.getElementById('places-count');

        countSpan.textContent = tempPlaces.length;
        container.innerHTML = '';

        if (tempPlaces.length === 0) {
            container.innerHTML = `
                <div class="empty-places-placeholder">
                    <i class="fa-solid fa-map-pin"></i>
                    <p>Aucun lieu ajouté</p>
                </div>
            `;
            return;
        }

        tempPlaces.forEach(place => {
            const item = document.createElement('div');
            item.className = 'selected-place-item';
            item.innerHTML = `
                <span class="place-name"><i class="fa-solid ${place.icon}" style="margin-right:8px;color:#777;"></i> ${place.name}</span>
                <span class="remove-place"><i class="fa-solid fa-trash"></i></span>
            `;
            item.querySelector('.remove-place').addEventListener('click', () => {
                removePlaceFromTemp(place.id);
            });
            container.appendChild(item);
        });
    }

    function renderItinerariesList() {
        const listContainer = document.getElementById('itineraries-list');
        listContainer.innerHTML = '';

        if (myItineraries.length === 0) {
            listContainer.className = 'empty-state-container';
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-route"></i>
                    <p>Aucun itinéraire créé</p>
                </div>
            `;
            return;
        }

        listContainer.className = ''; // Remove empty state styling flexbox
        listContainer.style.display = 'block';

        myItineraries.forEach(itin => {
            const card = document.createElement('div');
            card.style.background = 'white';
            card.style.padding = '20px';
            card.style.borderRadius = '16px';
            card.style.marginBottom = '15px';
            card.style.border = '1px solid #eee';
            card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';

            const placesCount = itin.places ? itin.places.length : 0;

            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <h3 style="margin:0;font-size:1.1rem;color:#333;">${itin.name}</h3>
                    <span style="font-size:0.85rem;color:#fff;background:#FF5722;padding:4px 10px;border-radius:20px;">${itin.date}</span>
                </div>
                <p style="color:#666;font-size:0.9rem;margin-bottom:0;"><i class="fa-solid fa-map-pin" style="margin-right:5px;color:#999;"></i> ${placesCount} lieux prévus</p>
                <div style="margin-top:15px;display:flex;gap:10px;">
                     <button class="btn-delete-itin" data-id="${itin.id}" style="background:#fee;color:#f44336;border:none;padding:5px 10px;border-radius:8px;cursor:pointer;font-size:0.8rem;">Supprimer</button>
                </div>
            `;

            card.querySelector('.btn-delete-itin').addEventListener('click', () => {
                if (confirm('Supprimer cet itinéraire ?')) {
                    myItineraries = myItineraries.filter(i => i.id !== itin.id);
                    saveItineraries();
                    renderItinerariesList();
                }
            });

            listContainer.appendChild(card);
        });
    }

    function resetForm() {
        document.getElementById('itin-name').value = '';
        document.getElementById('itin-date').value = '';
        tempPlaces = [];
        renderSelectedPlaces();
    }

    function saveItineraries() {
        localStorage.setItem('myItineraries', JSON.stringify(myItineraries));
    }

    // --- ACTIVITIES PAGE LOGIC (FETCH FROM BACKEND API) ---
    const activitiesGrid = document.getElementById('activities-grid');
    if (activitiesGrid) {
        console.log("Activites Grid found, fetching from API...");
        let sourceActivities = []; // Original data
        let allActivities = [];    // Filtered data for rendering
        let currentActPage = 1;
        const itemsPerPage = 6;
        let actLieuxCoords = {}; // Stocke les GPS des lieux : { id_lieu: { lat, lng, name } }

        // Helper: extract ALL language values from multilingual field
        const extractAllLang = (field) => {
            if (!field) return '';
            if (typeof field === 'string') return field.toLowerCase();
            if (typeof field === 'object') return Object.values(field).join(' ').toLowerCase();
            return String(field).toLowerCase();
        };

        // Group mapping for categories — works with plain strings OR {fr,en,ar,es} objects
        const getCategory = (act) => {
            const title = extractAllLang(act.intitule_activite);
            const desc  = extractAllLang(act.description_activite);
            const text = title + ' ' + desc;

            const bienEtreKw = ['spa','massage','bien-être','hammam','wellness','عافية','حمام','تدليك','سبا','رفاهية','استرخاء','bienestar'];
            const gastroKw   = ['cuisine','dîner','thé','gastronomie','cooking','dinner','tea','gastronomy','طبخ','عشاء','شاي','أكل','مطبخ','مأكولات','cocina','cena','gastronomía'];
            const aventureKw = ['surf','quad','parapente','karting','aventure','tyrolienne','adventure','zip','أمواج','رباعية','مظلي','كارتينج','مغامر','aventura'];
            const natureKw   = ['randonnée','zoo','parc','jardin','cascade','croisière','nature','chameau','cheval','désert','camping','excursion','balade','park','garden','camel','desert','تنزه','حديقة','شلال','صحراء','senderismo','parque','jardín','desierto','paseo'];
            const cultureKw  = ['visite','musée','palais','médina','culture','traditionnel','fantasia','mawazine','henné','atelier','visit','museum','palace','medina','traditional','pottery','workshop','زيارة','متحف','قصر','مدينة','ثقافة','ورشة','taller','museo'];

            if (bienEtreKw.some(kw => text.includes(kw))) return 'bien-être';
            if (gastroKw.some(kw => text.includes(kw)))   return 'gastronomie';
            if (aventureKw.some(kw => text.includes(kw))) return 'aventure';
            if (natureKw.some(kw => text.includes(kw)))   return 'nature';
            if (cultureKw.some(kw => text.includes(kw)))  return 'culture';
            return 'autre';
        };

        window.filterActivities = function (query) {
            const q = query.toLowerCase().trim();
            if (q === '') {
                // Return to category-only filter if search is cleared
                const activeBtn = document.querySelector('.new-filter-btn.active');
                const activeCat = activeBtn ? (activeBtn.dataset.filter || 'toutes') : 'toutes';
                if (activeCat === 'toutes') allActivities = [...sourceActivities];
                else allActivities = sourceActivities.filter(act => getCategory(act) === activeCat);
            } else {
                allActivities = sourceActivities.filter(act => {
                    const title = extractAllLang(act.intitule_activite);
                    const desc  = extractAllLang(act.description_activite);
                    return title.includes(q) || desc.includes(q);
                });
            }
            renderActivities(1);
        };

        const renderActivities = (page) => {
            const lang = (localStorage.getItem('selectedLang') || 'fr');
            const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : (window.ui_translations && window.ui_translations['fr']) || {};
            currentActPage = page;
            activitiesGrid.innerHTML = '';

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedData = allActivities.slice(start, end);

            if (allActivities.length === 0) {
                activitiesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">${T.act_none || 'Aucune activité trouvée pour cette catégorie.'}</p>`;
                return;
            }

            paginatedData.forEach(act => {
                const card = document.createElement('div');
                card.className = 'new-activity-card';

                let bgImage = 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80';
                const imgPath = act.photo_url_activite || act['photo url activite'] || act.image;
                if (imgPath) {
                    if (imgPath.startsWith('http')) {
                        bgImage = imgPath;
                    } else if (imgPath.startsWith('image')) {
                        bgImage = imgPath.replace(/^image\//, 'images/');
                    } else {
                        bgImage = imgPath.startsWith('/') ? `${API_BASE}${imgPath}` : `${API_BASE}/${imgPath}`;
                    }
                }

                const safeBgImage = bgImage ? bgImage.replace(/'/g, "\\'") : '';
                card.innerHTML = `
                    <div class="new-card-image" style="background-image: url('${safeBgImage}'); position: relative;">
                        <div class="new-card-badges">
                            <span class="badge-category"><i class="fa-solid fa-star"></i> ${T.act_badge || 'Activité'}</span>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                ${typeof generateActionButtons === 'function' ? generateActionButtons('Activite', act.id_activite || act.id_lieu || act._id || 1, act.intitule_activite, 'position: relative;') : ''}
                                <span class="badge-price">${act.prix_activite ? act.prix_activite + ' MAD' : (T.act_on_demand || 'Sur demande')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="new-card-content">
                        <div class="new-card-title">${window.getLocalizedValue(act.intitule_activite, lang) || (T.act_badge || 'Activité')}</div>
                        <div class="new-card-info">
                            <div><i class="fa-regular fa-clock"></i> ${window.getLocalizedValue(act.duree_activite, lang) || 'N/A'}</div>
                            <div><i class="fa-solid fa-map-pin"></i> ${T.act_place || 'Lieu n°'} ${act.id_lieu || 'N/A'}</div>
                        </div>
                        <div class="new-card-desc">${window.getLocalizedValue(act.description_activite, lang) || (T.act_no_desc || 'Aucune description disponible.')}</div>
                        <div class="new-card-actions">
                            <button class="action-btn btn-reserve" data-lieu="${act.id_lieu || ''}">${T.act_locate || 'Localiser sur la carte'}</button>
                            <button class="action-btn btn-more">${T.act_see_more || 'Voir plus'}</button>
                        </div>
                    </div>
                `;

                card.querySelector('.btn-reserve').addEventListener('click', () => {
                    const lieuInfo = actLieuxCoords[act.id_lieu];
                    if (lieuInfo) {
                        const nom = encodeURIComponent(act.intitule_activite || lieuInfo.name || '');
                        window.location.href = `map.html?lat=${lieuInfo.lat}&lng=${lieuInfo.lng}&name=${nom}`;
                    } else {
                        window.location.href = `map.html?location=${act.id_lieu || ''}`;
                    }
                });

                card.querySelector('.btn-more').addEventListener('click', () => {
                    openActivityModal(act);
                });

                activitiesGrid.appendChild(card);
            });

            if (typeof renderPagination === 'function') {
                renderPagination(allActivities.length, itemsPerPage, currentActPage, 'activities-pagination', renderActivities);
            }
        };

        // Filter Logic
        const filterBtns = document.querySelectorAll('.new-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const category = btn.dataset.filter || btn.textContent.trim().toLowerCase();
                if (category === 'toutes') {
                    allActivities = [...sourceActivities];
                } else {
                    allActivities = sourceActivities.filter(act => getCategory(act) === category);
                }
                renderActivities(1);
            });
        });

        // Charger les lieux pour avoir les coordonnées GPS, puis charger les activités
        fetch('http://localhost:5000/api/lieux')
            .then(res => res.json())
            .then(lieuxData => {
                lieuxData.forEach(lieu => {
                    if (lieu.location && lieu.location.coordinates) {
                        actLieuxCoords[lieu.id_lieu] = {
                            lat: lieu.location.coordinates[1],
                            lng: lieu.location.coordinates[0],
                            name: lieu.nom_lieu || ''
                        };
                    } else if (lieu.location && lieu.location.lat !== undefined) {
                        actLieuxCoords[lieu.id_lieu] = {
                            lat: lieu.location.lat,
                            lng: lieu.location.lng,
                            name: lieu.nom_lieu || ''
                        };
                    }
                });
                return fetch(`http://localhost:5000/api/activites?lang=${getCurrentLang()}`);
            })
            .then(res => res.json())
            .then(data => {
                sourceActivities = data;
                allActivities = [...sourceActivities];
                renderActivities(1);
            })
            .catch(err => {
                console.error('Erreur activités:', err);
                activitiesGrid.innerHTML = '<p style="grid-column: 1/-1; color: red; text-align: center;"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de charger les activités.</p>';
            });
    }

    // Modal behavior for Activity details
    function openActivityModal(act) {
        let modal = document.getElementById('activityModal');
        if (!modal) {
            // Create modal dynamically if it doesn't exist
            modal = document.createElement('div');
            modal.id = 'activityModal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content activity-modal">
                    <span class="close-modal">&times;</span>
                    <div class="modal-header">
                        <h2 id="modal-title"></h2>
                    </div>
                    <div class="modal-body">
                        <img id="modal-image" src="" alt="Activity Image" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">
                        <p><strong><i class="fa-regular fa-clock"></i> <span id="modal-dur-label">Durée</span>:</strong> <span id="modal-duration"></span></p>
                        <p><strong><i class="fa-solid fa-map-pin"></i> <span id="modal-loc-label">Lieu</span>:</strong> <span id="modal-location"></span></p>
                        <p><strong><i class="fa-solid fa-tag"></i> <span id="modal-price-label">Prix</span>:</strong> <span id="modal-price"></span></p>
                        <p><strong><span id="modal-desc-label">Description</span>:</strong></p>
                        <p id="modal-desc"></p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add event listeners to close modal
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        // Set data in modal
        const lang2 = (localStorage.getItem('selectedLang') || 'fr');
        const T2 = (window.ui_translations && window.ui_translations[lang2]) ? window.ui_translations[lang2] : (window.ui_translations && window.ui_translations['fr']) || {};

        document.getElementById('modal-title').textContent = window.getLocalizedValue(act.intitule_activite, lang2) || (T2.act_badge || 'Activité');
        // Translate modal labels dynamically
        const durLabel = document.getElementById('modal-dur-label');
        const locLabel = document.getElementById('modal-loc-label');
        const priceLabel = document.getElementById('modal-price-label');
        const descLabel = document.getElementById('modal-desc-label');
        if (durLabel) durLabel.textContent = T2.modal_duration || 'Durée';
        if (locLabel) locLabel.textContent = T2.modal_location || 'Lieu';
        if (priceLabel) priceLabel.textContent = T2.modal_price || 'Prix';
        if (descLabel) descLabel.textContent = T2.modal_description || 'Description';

        let bgImage = 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80';
        const imgPath = act.photo_url_activite || act['photo url activite'] || act.image;
        if (imgPath) {
            if (imgPath.startsWith('http')) {
                bgImage = imgPath;
            } else if (imgPath.startsWith('image')) {
                bgImage = imgPath.replace(/^image\//, 'images/');
            } else {
                bgImage = imgPath.startsWith('/') ? `${API_BASE}${imgPath}` : `${API_BASE}/${imgPath}`;
            }
        }
        document.getElementById('modal-image').src = bgImage;
        document.getElementById('modal-duration').textContent = window.getLocalizedValue(act.duree_activite, lang2) || 'N/A';
        document.getElementById('modal-location').textContent = (T2.act_place || 'Lieu n°') + ' ' + (act.id_lieu || 'N/A');
        document.getElementById('modal-price').textContent = act.prix_activite ? act.prix_activite + ' MAD' : (T2.act_on_demand || 'Sur demande');
        document.getElementById('modal-desc').textContent = window.getLocalizedValue(act.description_activite, lang2) || (T2.act_no_desc || 'Aucune description disponible.');

        // Show modal
        modal.classList.add('active');
    }

    // --- SERVICES PAGE LOGIC (FETCH FROM BACKEND API) ---
    const servicesGrid = document.getElementById('services-grid');
    if (servicesGrid) {
        console.log("Services Grid found, fetching from API...");

        // Fetch both services and lieux to map the names
        Promise.all([
            fetch(`http://localhost:5000/api/services?lang=${getCurrentLang()}`).then(res => res.json()),
            fetch(`http://localhost:5000/api/lieux?lang=${getCurrentLang()}`).then(res => res.json()).catch(() => []) // Catch error if lieux fails, return empty array
        ])
            .then(([servicesData, lieuxData]) => {
                // Create a lookup map for lieux
                const lieuxMap = {};
                lieuxData.forEach(lieu => {
                    lieuxMap[lieu.id_lieu] = lieu.nom_lieu;
                });

                let currentServicesPage = 1;
                const itemsPerPageServices = 6;
                window.allServicesSource = servicesData;
                window.filteredServices = servicesData;

                window.renderServices = (page = 1) => {
                    currentServicesPage = page;
                    const lang = localStorage.getItem('selectedLang') || 'fr';
                    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});

                    servicesGrid.innerHTML = '';
                    const list = window.filteredServices || [];

                    if (list.length === 0) {
                        servicesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">${T.services_none || 'Aucun service trouvé pour cette recherche.'}</p>`;
                        const paginationContainer = document.getElementById('services-pagination');
                        if (paginationContainer) paginationContainer.innerHTML = '';
                        return;
                    }

                    // Pagination logic
                    const startIndex = (page - 1) * itemsPerPageServices;
                    const endIndex = startIndex + itemsPerPageServices;
                    const paginatedList = list.slice(startIndex, endIndex);

                    paginatedList.forEach(service => {
                        const card = document.createElement('div');
                        card.className = 'service-card';

                        // Determine icon and color based on type
                        let iconHtml = '<i class="fa-solid fa-bell-concierge"></i>';
                        let iconClass = 'icon-dark';
                        const type = service.type_service_pratique ? service.type_service_pratique.toLowerCase() : '';

                        if (type.includes('train')) { iconHtml = '<i class="fa-solid fa-train"></i>'; iconClass = 'icon-red'; }
                        else if (type.includes('tram')) { iconHtml = '<i class="fa-solid fa-train-tram"></i>'; iconClass = 'icon-blue'; }
                        else if (type.includes('bus')) { iconHtml = '<i class="fa-solid fa-bus"></i>'; iconClass = 'icon-purple'; }
                        else if (type.includes('taxi')) { iconHtml = '<i class="fa-solid fa-taxi"></i>'; iconClass = 'icon-orange'; }
                        else if (type.includes('voiture') || type.includes('location')) { iconHtml = '<i class="fa-solid fa-car"></i>'; iconClass = 'icon-green'; }
                        else if (type.includes('vol') || type.includes('avion')) { iconHtml = '<i class="fa-solid fa-plane"></i>'; iconClass = 'icon-dark'; }
                        else if (type.includes('hopital') || type.includes('clinique') || type.includes('santé') || type.includes('urgence')) { iconHtml = '<i class="fa-solid fa-hospital"></i>'; iconClass = 'icon-red'; }
                        else if (type.includes('hôtel') || type.includes('hotel') || type.includes('riad')) { iconHtml = '<i class="fa-solid fa-hotel"></i>'; iconClass = 'icon-blue'; }
                        else if (type.includes('restaurant') || type.includes('café')) { iconHtml = '<i class="fa-solid fa-utensils"></i>'; iconClass = 'icon-orange'; }

                        // Get Location Name
                        const locationName = lieuxMap[service.id_lieu] ? lieuxMap[service.id_lieu] : (service.id_lieu ? `${T.services_loc_num || 'Lieu n°'} ${service.id_lieu}` : (T.services_not_spec || 'Non spécifié'));

                        // Generate Infos Complémentaires HTML
                        let infosHtml = '';
                        if (service.infos_complementaires && typeof service.infos_complementaires === 'object') {
                            infosHtml = '<div class="service-extra-infos" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #edf2f7; font-size: 0.85rem; color: #555;">';
                            for (const [key, value] of Object.entries(service.infos_complementaires)) {
                                const transKey = 'service_info_' + key;
                                const formattedKey = T[transKey] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                let displayValue = value;
                                if (typeof value === 'boolean') {
                                    displayValue = value ? `<span style="color: green; font-weight: 600;">${T.services_yes || 'Oui'}</span>` : `<span style="color: red; font-weight: 600;">${T.services_no || 'Non'}</span>`;
                                }
                                let iconInfo = '<i class="fa-solid fa-circle-info" style="color: #a0aec0; width: 16px;"></i>';
                                if (key.includes('horaire')) iconInfo = '<i class="fa-regular fa-clock" style="color: #a0aec0; width: 16px;"></i>';
                                if (key.includes('tel') || key.includes('phone')) iconInfo = '<i class="fa-solid fa-phone" style="color: #a0aec0; width: 16px;"></i>';
                                if (key.includes('urgence')) iconInfo = '<i class="fa-solid fa-truck-medical" style="color: #e53e3e; width: 16px;"></i>';

                                infosHtml += `<div style="display: flex; align-items: flex-start; margin-bottom: 6px; gap: 8px;">
                                        <div style="margin-top:2px;">${iconInfo}</div>
                                        <div><strong>${formattedKey}:</strong> ${displayValue}</div>
                                      </div>`;
                            }
                            infosHtml += '</div>';
                        }

                        // Construire l'URL carte AVANT le rendu HTML
                        let svcMapUrl = 'map.html';
                        if (service.id_lieu) {
                            const lieuGps = lieuxData.find(l => String(l.id_lieu) === String(service.id_lieu));
                            if (lieuGps && lieuGps.location && lieuGps.location.coordinates) {
                                const gpslat = lieuGps.location.coordinates[1];
                                const gpslng = lieuGps.location.coordinates[0];
                                const gpsnom = encodeURIComponent(lieuGps.nom_lieu || service.type_service_pratique || '');
                                svcMapUrl = `map.html?lat=${gpslat}&lng=${gpslng}&name=${gpsnom}`;
                            } else {
                                svcMapUrl = `map.html?location=${service.id_lieu}`;
                            }
                        }

                        card.innerHTML = `
                            ${typeof generateActionButtons === 'function' ? generateActionButtons('Service', service.id_service || service._id || 1, window.getLocalizedValue(service.type_service_pratique, lang)) : ''}
                            <div class="service-icon ${iconClass}">${iconHtml}</div>
                            <h3>${window.getLocalizedValue(service.type_service_pratique, lang) || (T.services_default_type || 'Service Pratique')}</h3>
                            <p class="desc">${window.getLocalizedValue(service.description_service_pratique, lang) || (T.services_no_desc || 'Aucune description disponible.')}</p>
                            <div class="pricing-box">
                                <div class="price-row">
                                    <span class="price-label"><i class="fa-solid fa-city"></i> ${T.services_city || 'Ville'}</span>
                                    <span class="price-value" style="font-weight: 600; color: #2b6cb0;">${window.getLocalizedValue(service.ville_service_pratique, lang) || (T.services_na || 'N/A')}</span>
                                </div>
                                <div class="price-row">
                                    <span class="price-label"><i class="fa-solid fa-map-pin"></i> ${T.services_place || 'Lieu'}</span>
                                    <span class="price-value" style="text-align: right; font-size: 0.9rem;">${locationName}</span>
                                </div>
                            </div>
                            ${infosHtml}
                            <button class="service-btn" style="margin-top: 15px;" onclick="window.location.href='${svcMapUrl}'"><i class="fa-solid fa-location-arrow"></i> ${T.services_map_btn || 'Voir sur la carte'}</button>
                        `;
                        servicesGrid.appendChild(card);
                    });

                    if (typeof renderPagination === 'function') {
                        renderPagination(list.length, itemsPerPageServices, currentServicesPage, 'services-pagination', window.renderServices);
                    }
                };

                window.filterServices = function (query) {
                    if (!window.allServicesSource) return;
                    const q = query.toLowerCase().trim();
                    
                    const isTransportQuery = q.includes('transport') || q.includes('déplace') || q.includes('deplace');
                    const isServiceQuery = q.includes('service') || q.includes('pratique');

                    window.filteredServices = window.allServicesSource.filter(s => {
                        const type = (s.type_service_pratique || "").toLowerCase();
                        const desc = (s.description_service_pratique || "").toLowerCase();
                        const ville = (s.ville_service_pratique || "").toLowerCase();
                        
                        const isTransportItem = type.match(/(train|tram|bus|taxi|voiture|location|vol|avion|aéroport|aeroport|gare)/);
                        
                        if (isTransportQuery && isTransportItem) return true;
                        if (isServiceQuery) return true;

                        return type.includes(q) || desc.includes(q) || ville.includes(q);
                    });
                    window.renderServices(1);
                };

                window.renderServices(1);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération des services :", err);
                servicesGrid.innerHTML = '<p style="grid-column: 1/-1; color: red; text-align: center;"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de se connecter au serveur Backend pour charger les services.</p>';
            });
    }

    // --- PAGINATION HELPER ---
    window.renderPagination = function (totalItems, itemsPerPage, currentPage, containerId, onPageChangeCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return;

        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) onPageChangeCallback(currentPage - 1);
        });
        container.appendChild(prevBtn);

        // Page Buttons
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                if (i !== currentPage) onPageChangeCallback(i);
            });
            container.appendChild(btn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) onPageChangeCallback(currentPage + 1);
        });
        container.appendChild(nextBtn);
    };

    // Check notifications periodically (e.g. every 10 seconds) to show popups if you keep page open
    if (notifBtn) {
        setInterval(fetchNotifications, 10000);
    }

});

// --- GLOBAL TOAST SYSTEM ---
window.showToast = function (message, type = 'info') {
    // Determine CSS class and Icon based on type
    const normalizedType = type.toLowerCase();
    let toastClass = 'toast-info';
    let iconClass = 'fa-circle-info';
    let title = 'Information';

    if (normalizedType.includes('succes') || normalizedType.includes('success')) {
        toastClass = 'toast-success';
        iconClass = 'fa-circle-check';
        title = 'Succès';
    } else if (normalizedType.includes('alerte') || normalizedType.includes('erreur') || normalizedType.includes('error')) {
        toastClass = 'toast-error';
        iconClass = 'fa-triangle-exclamation';
        title = 'Erreur';
    }

    // Find or create container
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create Toast
    const toast = document.createElement('div');
    toast.className = `toast-message ${toastClass}`;

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${message}</div>
        </div>
        <div class="toast-close">
            <i class="fa-solid fa-xmark"></i>
        </div>
    `;

    container.appendChild(toast);

    // Auto-remove after 5 seconds
    const removeTimeout = setTimeout(() => {
        removeToast(toast);
    }, 5000);

    // Allow manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(removeTimeout);
        removeToast(toast);
    });
};

function removeToast(toastElement) {
    if (!toastElement) return;
    toastElement.classList.add('toast-hiding');
    // Wait for transition, then remove from DOM
    setTimeout(() => {
        if (toastElement.parentNode) {
            toastElement.parentNode.removeChild(toastElement);
        }
    }, 500); // matches CSS opacity duration
}

// Global Match Notification Handler
window.handleMatchNotification = function(teamA, teamB) {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : (localStorage.getItem('selectedLang') || 'fr');
    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});
    
    const msg = `${T.notif_match_msg || 'Le match approche !'} : ${teamA} vs ${teamB}`;
    
    // 1. Show Toast
    if (window.showToast) {
        window.showToast(msg, 'success');
    }

    // 2. Add to Notification Dropdown (if present in DOM)
    window.addLocalNotification(msg, 'info');
};

// Global Helper to add a notification to the dropdown list manually
window.addLocalNotification = function(content, type = 'info') {
    const notifList = document.querySelector('.notif-list');
    const notifBadge = document.querySelector('.notif-badge-indicator');
    
    if (!notifList) return;

    // Remove "no notifications" message if it exists
    if (notifList.innerHTML.includes('notif_none') || notifList.innerHTML.includes('Aucune nouvelle notification')) {
        notifList.innerHTML = '';
    }

    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : (localStorage.getItem('selectedLang') || 'fr');
    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});

    // Determine Icon
    let iconHtml = '<i class="fa-solid fa-bell"></i>';
    let iconBg = 'bg-blue';
    const lowerType = type.toLowerCase();
    if (lowerType.includes('succes') || lowerType.includes('success')) { iconHtml = '<i class="fa-solid fa-check"></i>'; iconBg = 'bg-green'; }
    else if (lowerType.includes('alerte') || lowerType.includes('erreur')) { iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>'; iconBg = 'bg-red'; }

    const notifElement = document.createElement('div');
    notifElement.className = 'notif-item unread';
    notifElement.innerHTML = `
        <div class="notif-icon ${iconBg}">${iconHtml}</div>
        <div class="notif-content">
            <p>${content}</p>
            <span>${T.notif_just_now || "A l'instant"}</span>
        </div>
    `;

    // Prepend to list
    notifList.insertBefore(notifElement, notifList.firstChild);

    // Show badge
    if (notifBadge) {
        notifBadge.style.display = 'block';
    }
};

/* --- Reveal on Scroll Animation Logic --- */
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal, .animate-on-scroll');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.classList.add('is-visible'); // Compatibility with old classes
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));
});


// --- Recommendations Logic ---
async function loadRecommendations() {
    const recoSection = document.getElementById('reco-section');
    const recoGrid = document.getElementById('reco-grid');
    
    if (!recoSection || !recoGrid) return;

    try {
        const currentLang = localStorage.getItem('selectedLang') || 'fr';
        const recoLang = localStorage.getItem('wc2030_reco_lang');
        const prefsStr = localStorage.getItem('wc2030_prefs');
        let storedRecos = localStorage.getItem('userRecommendations');

        // Récupérer l'ID utilisateur
        const userInfoRaw = localStorage.getItem('userInfo');
        let userId = null;
        if (userInfoRaw) {
            try {
                const userInfo = JSON.parse(userInfoRaw);
                userId = userInfo._id || userInfo.id;
            } catch(e) {}
        }

        // Si l'utilisateur est connecté, on charge les recommandations dynamiques (Clustering)
        if (userId) {
            try {
                const dynamicRes = await fetch(`http://localhost:5000/api/recommendations/dynamic?userId=${userId}&lang=${currentLang}`);
                if (dynamicRes.ok) {
                    const dynamicData = await dynamicRes.json();
                    if (dynamicData && dynamicData.length > 0) {
                        localStorage.setItem('userRecommendations', JSON.stringify(dynamicData));
                        storedRecos = JSON.stringify(dynamicData);
                        localStorage.setItem('wc2030_reco_lang', currentLang);
                    }
                }
            } catch(e) {
                console.error("Erreur chargement recommandations dynamiques", e);
            }
        } else if (prefsStr && currentLang !== recoLang) {
            // Logique de secours pour les utilisateurs non connectés (si langue changée)
            try {
                const res = await fetch(`http://localhost:5000/api/recommendations/get-recommendation?lang=${currentLang}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ choices: JSON.parse(prefsStr) })
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('userRecommendations', JSON.stringify(data));
                    localStorage.setItem('wc2030_reco_lang', currentLang);
                    storedRecos = JSON.stringify(data);
                }
            } catch(e) {
                console.error("Error refreshing recommendations for language", e);
            }
        }

        if (!storedRecos) {
            recoSection.style.display = 'none';
            return;
        }

        let recommendations = JSON.parse(storedRecos);
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            recoSection.style.display = 'none';
            return;
        }

        // Forcer l'affichage de 4 cartes maximum pour ne pas casser la grille
        recommendations = recommendations.slice(0, 4);

        recoSection.style.display = 'block';
        recoGrid.innerHTML = '';

        // Tag translation for recommendations
        const recoTagTrans = {
            'ar': {
                'Gastronomie': 'أكل وشرب', 'Activit\u00e9s': 'أنشطة', 'Activit\u00e9': 'نشاط',
                'Match': 'مباراة', 'Populaire': 'شائع', 'Culture': 'ثقافة',
                'H\u00f4tel': 'فندق', 'Service': 'خدمة', 'Lieu': 'مكان'
            },
            'en': {
                'Gastronomie': 'Gastronomy', 'Activit\u00e9s': 'Activities', 'Activit\u00e9': 'Activity',
                'Match': 'Match', 'Populaire': 'Popular', 'Culture': 'Culture',
                'H\u00f4tel': 'Hotel', 'Service': 'Service', 'Lieu': 'Place'
            },
            'es': {
                'Gastronomie': 'Gastronom\u00eda', 'Activit\u00e9s': 'Actividades', 'Activit\u00e9': 'Actividad',
                'Match': 'Partido', 'Populaire': 'Popular', 'Culture': 'Cultura',
                'H\u00f4tel': 'Hotel', 'Service': 'Servicio', 'Lieu': 'Lugar'
            }
        };

        recommendations.forEach(reco => {
            // Setup card color based on tag
            let tagBg = '#ff4d94';
            if(reco.tag === 'Match') tagBg = '#ff4d94';
            else if(reco.tag === 'Culture') tagBg = '#9b59b6';
            else if(reco.tag === 'Populaire') tagBg = '#e67e22';
            else if(reco.tag === 'Gastronomie') tagBg = '#27ae60';
            else if(reco.tag === 'Activit\u00e9s' || reco.tag === 'Activit\u00e9') tagBg = '#2980b9';

            const translatedTag = (recoTagTrans[currentLang] && recoTagTrans[currentLang][reco.tag]) ? recoTagTrans[currentLang][reco.tag] : reco.tag;

            // Localize title and description (multilingual object or plain string)
            const recoTitle = (typeof window.getLocalizedValue === 'function')
                ? (window.getLocalizedValue(reco.titre, currentLang) || reco.titre || '')
                : (reco.titre || '');
            const recoRawDesc = (typeof window.getLocalizedValue === 'function')
                ? (window.getLocalizedValue(reco.description, currentLang) || reco.description || '')
                : (reco.description || '');

            // Short description translation map for plain French strings
            const recoDescTrans = {
                'ar': {
                    'Cours de surf avec moniteur': 'دروس التزلج على الأمواج مع مدرب',
                    'Cours de surf': 'دروس التزلج على الأمواج',
                    "Vivez l\'ambiance au stade": 'عيش الأجواء في الملعب',
                    "Vivez l\'ambiance": 'عيش الأجواء',
                    'Hôtel luxe': 'فندق فاخر',
                    'Hôtel de luxe': 'فندق فاخر',
                    'Atelier de cuisine marocaine': 'ورشة المطبخ المغربي',
                    'Atelier de cuisine': 'ورشة الطبخ',
                    'Festival de musique': 'مهرجان موسيقي',
                    'Marché traditionnel': 'سوق تقليدي',
                    'Randonnée en montagne': 'تسلق الجبال',
                    'Balade en mer': 'نزهة بحرية',
                    'Dégustez les saveurs': 'تذوق النكهات',
                    'Gastronomie marocaine': 'المطبخ المغربي',
                    'Spa et bien-être': 'سبا والعافية',
                    'Match de football': 'مباراة كرة القدم',
                    'Cérémonie officielle': 'حفل رسمي',
                    'Nuit en riad': 'ليلة في الرياض',
                    'Traditions marocaines': 'التقاليد المغربية',
                    'Excursion dans le désert': 'رحلة في الصحراء',
                    'Balade à dos de chameau': 'نزهة على ظهر جمل',
                    'Shopping au souk': 'تسوق في السوق',
                    'Art et artisanat': 'الفن والحرف اليدوية',
                    'Découverte de la médina': 'استكشاف المدينة العتيقة',
                    'Concert de musique': 'حفلة موسيقية',
                    'Exposition culturelle': 'معرض ثقافي',
                },
                'en': {
                    'Cours de surf avec moniteur': 'Surf lessons with instructor',
                    'Cours de surf': 'Surf lessons',
                    "Vivez l\'ambiance au stade": 'Experience the stadium atmosphere',
                    "Vivez l\'ambiance": 'Experience the atmosphere',
                    'Hôtel luxe': 'Luxury hotel',
                    'Hôtel de luxe': 'Luxury hotel',
                    'Atelier de cuisine marocaine': 'Moroccan cooking workshop',
                    'Atelier de cuisine': 'Cooking workshop',
                    'Festival de musique': 'Music festival',
                    'Marché traditionnel': 'Traditional market',
                    'Randonnée en montagne': 'Mountain hiking',
                    'Balade en mer': 'Sea trip',
                    'Dégustez les saveurs': 'Taste the flavors',
                    'Gastronomie marocaine': 'Moroccan gastronomy',
                    'Spa et bien-être': 'Spa and wellness',
                    'Match de football': 'Football match',
                    'Cérémonie officielle': 'Official ceremony',
                    'Nuit en riad': 'Night in a riad',
                    'Traditions marocaines': 'Moroccan traditions',
                    'Excursion dans le désert': 'Desert excursion',
                    'Balade à dos de chameau': 'Camel ride',
                    'Shopping au souk': 'Shopping at the souk',
                    'Art et artisanat': 'Art and handicrafts',
                    'Découverte de la médina': 'Medina discovery',
                    'Concert de musique': 'Music concert',
                    'Exposition culturelle': 'Cultural exhibition',
                },
                'es': {
                    'Cours de surf avec moniteur': 'Clases de surf con instructor',
                    'Cours de surf': 'Clases de surf',
                    "Vivez l\'ambiance au stade": 'Vive el ambiente en el estadio',
                    "Vivez l\'ambiance": 'Vive el ambiente',
                    'Hôtel luxe': 'Hotel de lujo',
                    'Hôtel de luxe': 'Hotel de lujo',
                    'Atelier de cuisine marocaine': 'Taller de cocina marroquí',
                    'Atelier de cuisine': 'Taller de cocina',
                    'Festival de musique': 'Festival de música',
                    'Marché traditionnel': 'Mercado tradicional',
                    'Randonnée en montagne': 'Senderismo en montaña',
                    'Balade en mer': 'Paseo en barco',
                    'Dégustez les saveurs': 'Saboree los sabores',
                    'Gastronomie marocaine': 'Gastronomía marroquí',
                    'Spa et bien-être': 'Spa y bienestar',
                    'Match de football': 'Partido de fútbol',
                    'Cérémonie officielle': 'Ceremonia oficial',
                    'Nuit en riad': 'Noche en riad',
                    'Traditions marocaines': 'Tradiciones marroquíes',
                    'Excursion dans le désert': 'Excursión al desierto',
                    'Balade à dos de chameau': 'Paseo en camello',
                    'Shopping au souk': 'Compras en el zoco',
                    'Art et artisanat': 'Arte y artesанía',
                    'Découverte de la médina': 'Descubrimiento de la medina',
                    'Concert de musique': 'Concierto de música',
                    'Exposition culturelle': 'Exposición cultural',
                },
            };

            // Apply short description translation if still in French
            let recoDesc = recoRawDesc;
            if (currentLang !== 'fr' && typeof recoDesc === 'string') {
                const langDescMap = recoDescTrans[currentLang];
                if (langDescMap) {
                    const matchKey = Object.keys(langDescMap).find(k => recoDesc.startsWith(k) || recoDesc === k);
                    if (matchKey) recoDesc = langDescMap[matchKey];
                }
            }

            const card = document.createElement('div');
            card.className = 'reco-card';
            card.onclick = () => showRecoDetails(reco, recoTitle, recoDesc, translatedTag);

            const safeTitle = recoTitle ? recoTitle.replace(/'/g, "\\'") : '';

            // Normaliser l'URL de l'image : si c'est un chemin relatif du backend, ajouter le préfixe du serveur
            let recoImageUrl = reco.image || '';
            // Correction pour les chemins commençant par "image/" (singulier) -> "images/" (pluriel)
            if (recoImageUrl && recoImageUrl.startsWith('image/') && !recoImageUrl.startsWith('images/')) {
                recoImageUrl = recoImageUrl.replace('image/', 'images/');
            }
            if (recoImageUrl && recoImageUrl.startsWith('/') && !recoImageUrl.startsWith('//')) {
                recoImageUrl = 'http://localhost:5000' + recoImageUrl;
            }
            
            card.innerHTML = `
                <div class="reco-image-box">
                    <span class="reco-tag" style="background-color: ${tagBg}">${translatedTag}</span>
                    <button class="reco-fav" onclick="event.stopPropagation(); if(!'${reco.id}' || '${reco.id}' === 'undefined'){ if(typeof window.showToast === 'function') window.showToast('Veuillez refaire le questionnaire pour mettre à jour cette recommandation.', 'error'); else alert('Veuillez refaire le questionnaire pour mettre à jour cette recommandation.'); return;} if(typeof toggleFavori === 'function') toggleFavori('${reco.type}', '${reco.id}', '${safeTitle}', event, this);"><i class="fa-regular fa-heart"></i></button>
                    <img src="${recoImageUrl}" alt="${recoTitle}">
                </div>
                <div class="reco-content">
                    <div class="reco-title">${recoTitle}</div>
                    <div class="reco-desc">${recoDesc}</div>
                </div>
            `;
            recoGrid.appendChild(card);
        });

        // Mettre à jour l'état des boutons favoris après le rendu
        if (typeof updateAllFavorisButtonsUI === 'function') {
            updateAllFavorisButtonsUI();
        }

    } catch (e) {
        console.error('Error loading recommendations', e);
        recoSection.style.display = 'none';
    }
}

function showRecoDetails(reco, recoTitle, recoDesc, translatedTag) {
    recoTitle = recoTitle || reco.titre || '';
    recoDesc = recoDesc || reco.description || '';
    const currentLang2 = localStorage.getItem('selectedLang') || 'fr';
    translatedTag = translatedTag || reco.tag || '';

    // Normaliser l'URL de l'image
    let modalImageUrl = reco.image || '';
    if (modalImageUrl && modalImageUrl.startsWith('/') && !modalImageUrl.startsWith('//')) {
        modalImageUrl = 'http://localhost:5000' + modalImageUrl;
    }

    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = modal ? modal.querySelector('.close-modal') : null;

    if (modal && modalBody) {
        modalBody.innerHTML = `
            <div style="padding: 10px;">
                <img src="${modalImageUrl}" style="width:100%; border-radius:10px; margin-bottom:15px; height:200px; object-fit:cover;">
                <span style="display:inline-block; padding: 4px 10px; background:#ff4d94; color:#fff; border-radius:20px; font-size:12px; margin-bottom:10px;">${translatedTag}</span>
                <h2 style="margin-bottom: 10px; font-size: 1.5rem;">${recoTitle}</h2>
                <p style="color: #555; margin-bottom: 20px; font-size: 1rem; line-height: 1.5;">${recoDesc}</p>
                <button style="width:100%; padding:15px; background:linear-gradient(135deg, #e50027, #ff4d4d); color:white; border:none; border-radius:50px; font-size:1.1rem; cursor:pointer;" onclick="document.getElementById('detail-modal').style.display='none'">Fermer</button>
            </div>
        `;
        
        if (closeModalBtn) {
            closeModalBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        modal.style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', loadRecommendations);
