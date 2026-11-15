/**
 * culture.js - Gestion de la page Culture
 * Logique d'interactivité multilingue pour les catégories culturelles
 */

// Utiliser API_BASE de script.js s'il existe, sinon fallback
const CULTURE_API = (typeof API_BASE !== 'undefined') ? API_BASE : 'http://localhost:5000';

// Données initiales depuis culture_data.js (fallback statique)
let allCultureData = {};

// =========================================================
// TRADUCTIONS DES CATEGORIES (FR / EN / AR / ES)
// =========================================================
const CAT_TRANSLATIONS = {
    histoire: {
        fr: { title: 'Histoire du Maroc',        description: 'Découvrez l\'héritage millénaire et les joyaux architecturaux.' },
        en: { title: 'History of Morocco',        description: 'Discover the millennial heritage and architectural jewels.' },
        ar: { title: 'تاريخ المغرب',              description: 'اكتشف الإرث الحضاري العريق والروائع المعمارية.' },
        es: { title: 'Historia de Marruecos',     description: 'Descubre el patrimonio milenario y las joyas arquitectónicas.' }
    },
    traditions: {
        fr: { title: 'Traditions et coutumes',   description: 'Plongez dans l\'art de vivre marocain.' },
        en: { title: 'Traditions and customs',   description: 'Dive into the Moroccan art of living.' },
        ar: { title: 'التقاليد والعادات',         description: 'انغمس في فن العيش المغربي.' },
        es: { title: 'Tradiciones y costumbres', description: 'Sumérgete en el arte de vivir marroquí.' }
    },
    gastronomie: {
        fr: { title: 'Gastronomie marocaine',    description: 'Un voyage culinaire à travers les épices et saveurs.' },
        en: { title: 'Moroccan gastronomy',      description: 'A culinary journey through spices and flavors.' },
        ar: { title: 'المطبخ المغربي',            description: 'رحلة طهي عبر البهارات والنكهات الأصيلة.' },
        es: { title: 'Gastronomía marroquí',     description: 'Un viaje culinario a través de especias y sabores.' }
    },
    artisanat: {
        fr: { title: 'Artisanat marocain',       description: 'Le savoir-faire exceptionnel des maîtres artisans.' },
        en: { title: 'Moroccan craftsmanship',   description: 'The exceptional know-how of master craftsmen.' },
        ar: { title: 'الصناعة التقليدية',         description: 'المهارة الاستثنائية لأساتذة الصناعة التقليدية.' },
        es: { title: 'Artesanía marroquí',       description: 'El excepcional saber hacer de los maestros artesanos.' }
    },
    festivals: {
        fr: { title: 'Festivals et événements',  description: 'Une scène culturelle vibrante mêlant musiques et traditions.' },
        en: { title: 'Festivals and events',     description: 'A vibrant cultural scene blending music and traditions.' },
        ar: { title: 'المهرجانات والفعاليات',     description: 'مشهد ثقافي نابض يجمع بين الموسيقى والتقاليد.' },
        es: { title: 'Festivales y eventos',     description: 'Una vibrante escena cultural que combina música y tradiciones.' }
    }
};

// Mapping singulier→pluriel et valeurs DB→clé JS (pour toutes les langues)
const CAT_KEY_ALIASES = {
    // Français
    'histoire': 'histoire', 'gastronomie': 'gastronomie', 'artisanat': 'artisanat',
    'tradition': 'traditions', 'traditions': 'traditions',
    'festival': 'festivals', 'festivals': 'festivals',
    // Anglais
    'history': 'histoire',
    'gastronomy': 'gastronomie', 'food': 'gastronomie', 'cuisine': 'gastronomie',
    'craft': 'artisanat', 'craftsmanship': 'artisanat',
    'tradition': 'traditions', 'customs': 'traditions',
    'festival': 'festivals', 'events': 'festivals',
    // Espagnol
    'historia': 'histoire',
    'gastronomia': 'gastronomie', 'gastronomía': 'gastronomie',
    'artesania': 'artisanat', 'artesanía': 'artisanat',
    'tradicion': 'traditions', 'tradición': 'traditions',
    // Arabe (valeurs possibles)
    'تاريخ': 'histoire', 'تقاليد': 'traditions', 'عادات': 'traditions',
    'مطبخ': 'gastronomie', 'صناعة تقليدية': 'artisanat', 'مهرجانات': 'festivals'
};

// =========================================================
// UTILITAIRE : EXTRAIRE VALEUR MULTILINGUE
// =========================================================
function getLocalizedValue(field, lang) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
        return field[lang] || field['fr'] || field['en'] || Object.values(field)[0] || '';
    }
    return '';
}

// =========================================================
// UTILITAIRE : NORMALISER CLE CATEGORIE
// =========================================================
function normalizeCatKey(rawKey) {
    if (!rawKey) return '';
    const k = rawKey.toLowerCase().trim();
    return CAT_KEY_ALIASES[k] || k;
}

// =========================================================
// INITIALISATION AU CHARGEMENT DU DOM
// =========================================================
document.addEventListener('DOMContentLoaded', () => {

    // 0) Forcer la visibilité des cartes (la classe 'reveal' les cache par défaut)
    document.querySelectorAll('.cat-card').forEach(card => {
        card.classList.add('active');
        card.classList.add('is-visible');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });

    // 1) Charger les données statiques comme fallback immédiat
    if (typeof cultureData !== 'undefined') {
        allCultureData = cultureData;
    }

    // 2) Attacher les événements directement sur les cartes
    attachCardEvents();

    // 3) Attacher l'événement sur le bouton Retour
    const btnBack = document.getElementById('btn-back-categories');
    if (btnBack) {
        btnBack.addEventListener('click', goBackToCategories);
    }

    // 4) Charger les données depuis l'API (en arrière-plan)
    fetchCultureData();
});

// =========================================================
// ATTACHER LES CLICKS DIRECTEMENT SUR LES CARTES
// =========================================================
function attachCardEvents() {
    const cards = document.querySelectorAll('.cat-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const categoryKey = this.getAttribute('data-category');
            if (categoryKey && allCultureData[categoryKey]) {
                openCategoryDetail(allCultureData[categoryKey], categoryKey);
            } else {
                console.warn('[Culture] Catégorie introuvable:', categoryKey, Object.keys(allCultureData));
            }
        });

        const link = card.querySelector('.topic-link');
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const parentCard = this.closest('.cat-card');
                if (parentCard) {
                    const categoryKey = parentCard.getAttribute('data-category');
                    if (categoryKey && allCultureData[categoryKey]) {
                        openCategoryDetail(allCultureData[categoryKey], categoryKey);
                    }
                }
            });
        }
    });
    console.log(`[Culture] ${cards.length} cartes trouvées, événements attachés.`);
}

// =========================================================
// RECUPERATION DES DONNEES DEPUIS L'API
// =========================================================
async function fetchCultureData() {
    try {
        const response = await fetch(`${CULTURE_API}/api/culture`, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error(`Erreur API: ${response.status}`);

        const data = await response.json();
        if (!data || data.length === 0) {
            console.warn('[Culture] API retourne aucune donnée, fallback utilisé.');
            return;
        }

        console.log(`[Culture] ${data.length} items reçus depuis l'API.`);

        const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : (localStorage.getItem('selectedLang') || 'fr');

        // Initialiser la structure des catégories
        const categories = {};
        ['histoire', 'traditions', 'gastronomie', 'artisanat', 'festivals'].forEach(key => {
            const trans = CAT_TRANSLATIONS[key][lang] || CAT_TRANSLATIONS[key]['fr'];
            categories[key] = {
                title: trans.title,
                description: trans.description,
                icon: getCatIcon(key),
                color: getCatColor(key),
                items: []
            };
        });

        data.forEach(item => {
            // Déterminer la catégorie : toujours utiliser 'fr' comme référence pour le matching
            const catRaw = getLocalizedValue(item.categorie, 'fr');
            const catKey = normalizeCatKey(catRaw);

            if (!categories[catKey]) {
                console.warn(`[Culture] Catégorie inconnue: "${catRaw}" → "${catKey}"`);
                return;
            }

            const title       = getLocalizedValue(item.titre, lang);
            const description = getLocalizedValue(item.description, lang);
            const ville       = getLocalizedValue(item.ville, lang) || getLocalizedValue(item.ville, 'fr') || '';

            let imageUrl = '';
            if (item.image) {
                if (item.image.startsWith('http')) {
                    imageUrl = item.image;
                } else if (item.image.startsWith('image')) {
                    imageUrl = item.image.replace(/^image\//, 'images/');
                } else {
                    imageUrl = item.image.startsWith('/') ? `${CULTURE_API}${item.image}` : `${CULTURE_API}/images/culture/${item.image}`;
                }
            }

            categories[catKey].items.push({ title, subtitle: ville, image: imageUrl, description });
        });

        allCultureData = categories;
        console.log('[Culture] Données mises à jour depuis l\'API pour la langue:', lang);

    } catch (err) {
        console.warn('[Culture] Impossible de charger l\'API, fallback utilisé.', err.message);
    }
}

// =========================================================
// HELPERS D'ICONES ET COULEURS PAR CATEGORIE
// =========================================================
function getCatIcon(key) {
    const icons = {
        histoire:    '<i class="fa-solid fa-landmark-dome"></i>',
        traditions:  '<i class="fa-solid fa-handshake-angle"></i>',
        gastronomie: '<i class="fa-solid fa-utensils"></i>',
        artisanat:   '<i class="fa-solid fa-palette"></i>',
        festivals:   '<i class="fa-solid fa-music"></i>'
    };
    return icons[key] || '<i class="fa-solid fa-star"></i>';
}

function getCatColor(key) {
    const colors = {
        histoire:    '#FF6D00',
        traditions:  '#00C853',
        gastronomie: '#FFAB00',
        artisanat:   '#0091EA',
        festivals:   '#9C27B0'
    };
    return colors[key] || '#333';
}

// =========================================================
// OUVRIR LA VUE DETAIL D'UNE CATEGORIE
// =========================================================
function openCategoryDetail(data, categoryKey) {
    console.log('[Culture] Ouverture catégorie:', categoryKey, data);

    const categoriesSection = document.getElementById('categories-view');
    const detailViewSection = document.getElementById('detail-view');
    const itemsGrid         = document.getElementById('category-items-grid');
    const detailCatIcon     = document.getElementById('detail-cat-icon');
    const detailCatTitle    = document.getElementById('detail-cat-title');
    const detailCatDesc     = document.getElementById('detail-cat-desc');

    if (!categoriesSection || !detailViewSection || !itemsGrid) {
        console.error('[Culture] Éléments de la vue détail introuvables!');
        return;
    }

    if (detailCatIcon) {
        detailCatIcon.innerHTML = data.icon || '';
        detailCatIcon.style.color = data.color || '#333';
    }
    if (detailCatTitle) detailCatTitle.textContent = data.title || '';
    if (detailCatDesc)  detailCatDesc.textContent  = data.description || '';

    itemsGrid.innerHTML = '';

    const items = data.items || [];
    if (items.length === 0) {
        itemsGrid.innerHTML = '<p style="text-align:center; color:#6b7280; padding:40px;">Aucun élément disponible pour cette catégorie.</p>';
    } else {
        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'culture-item-card';
            card.style.animationDelay = `${index * 0.08}s`;

            const safeImage = item.image ? item.image.replace(/'/g, "\\'") : '';
            const imgStyle = item.image
                ? `background-image: url('${safeImage}'); background-size: cover; background-position: center;`
                : `background: linear-gradient(135deg, #f3f4f6, #e5e7eb);`;

            card.innerHTML = `
                <div class="culture-item-image" style="${imgStyle}">
                    <div class="culture-item-overlay"></div>
                </div>
                <div class="culture-item-content">
                    <span class="culture-item-subtitle" style="color: ${data.color || '#333'};">${item.subtitle || ''}</span>
                    <h3 class="culture-item-title">${item.title || ''}</h3>
                    <p class="culture-item-desc">${item.description || ''}</p>
                </div>
            `;
            itemsGrid.appendChild(card);
        });
    }

    categoriesSection.classList.add('hidden');
    detailViewSection.classList.remove('hidden');
    detailViewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =========================================================
// RETOUR AUX CATEGORIES
// =========================================================
function goBackToCategories() {
    const categoriesSection = document.getElementById('categories-view');
    const detailViewSection = document.getElementById('detail-view');

    if (detailViewSection) detailViewSection.classList.add('hidden');
    if (categoriesSection) {
        categoriesSection.classList.remove('hidden');
        categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
