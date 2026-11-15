let hasAnsweredAtLeastOne = false;

// Fonction pour le bouton "Get Started"
function startOnboarding() {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('s-lang').style.display = 'flex';
}

// Fonctions pour les choix
function selectLang(card) {
    document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('sel'));
    card.classList.add('sel');
    document.getElementById('b-lang').disabled = false;
    hasAnsweredAtLeastOne = true;
}

const OB = {
  ar: {
    skip: 'تخطي &larr;',
    q:  ['أي فريق تدعم؟','ما نوع المباريات التي تفضلها؟','أين تفضل مشاهدة المباريات؟','ما الأنشطة التي تحبها أيام المباريات؟','ما نوع الفعاليات التي تهمك؟'],
    qs: ['اختر فريقك أو أكثر','اختر كل ما يعجبك','اختيار واحد فقط','اختر كل ما ينطبق عليك','اختر كل ما يهمك'],
    cont: ['متابعة &rarr;','متابعة &rarr;','متابعة &rarr;','متابعة &rarr;','إنهاء &larr;'],
    teams: { maroc:'المغرب', france:'فرنسا', bresil:'البرازيل', espagne:'إسبانيا', argentine:'الأرجنتين', portugal:'البرتغال', allemagne:'ألمانيا', angleterre:'إنجلترا', autre:'أخرى' },
    mt: { finales:'النهائيات', derbies:'الديربيات', groupes:'دور المجموعات', surprises:'مباريات مفاجئة' },
    wh: { stade:'في الملعب', stade_s:'عيش الأجواء مباشرة', cafe:'في مقهى أو مطعم', cafe_s:'أجواء مريحة واجتماعية', fanzone:'في الفان زون الرسمية', fanzone_s:'شاشة كبيرة وطاقة الجماهير', maison:'في المنزل', maison_s:'راحة وهدوء' },
    act: { gastro:'اكتشاف المطبخ المحلي', visite:'زيارة المدينة والثقافة', shop:'التسوق والتذكارات', soiree:'الاحتفال والسهرات' },
    ev:  { grands:'الفعاليات الرسمية الكبرى', grands_s:'حفلات الافتتاح والختام', fans:'تجمعات المشجعين', fans_s:'أجواء الحي والمشجعون', concerts:'حفلات موسيقية', concerts_s:'فنانون مغاربة ودوليون', culture:'معارض ثقافية', culture_s:'فن وتاريخ وتقاليد المغرب' }
  },
  fr: {
    skip: 'Passer &rarr;',
    q:  ['Quelle équipe supportes-tu ?','Quels types de matchs tu préfères ?','Où préfères-tu regarder les matchs ?','Quelles activités aimes-tu les jours de match ?',"Quel type d'événements t'intéresse ?"],
    qs: ['Choisis ta ou tes équipes favorites',"Sélectionne tout ce qui t'attire",'Un seul choix','Choisis tout ce qui te correspond','Sélectionne une ou plusieurs options'],
    cont: ['Continuer &rarr;','Continuer &rarr;','Continuer &rarr;','Continuer &rarr;','Terminer &rarr;'],
    teams: { maroc:'Maroc', france:'France', bresil:'Brésil', espagne:'Espagne', argentine:'Argentine', portugal:'Portugal', allemagne:'Allemagne', angleterre:'Angleterre', autre:'Autre' },
    mt: { finales:'Finales & demi-finales', derbies:'Derbies & rivalités', groupes:'Phase de groupes', surprises:'Matchs surprises' },
    wh: { stade:'Dans un stade', stade_s:"Vivre l'ambiance en direct", cafe:'Dans un café ou restaurant', cafe_s:'Convivial et décontracté', fanzone:'Fan zone officielle', fanzone_s:'Grand écran, foule, énergie', maison:'À la maison', maison_s:'Confort et tranquillité' },
    act: { gastro:'Gastronomie locale', visite:'Visiter la ville & culture', shop:'Shopping & souvenirs', soiree:'Fêter & ambiance nocturne' },
    ev:  { grands:'Grands événements officiels', grands_s:'Cérémonies, ouverture & finale', fans:'Rassemblements de fans locaux', fans_s:'Ambiance de quartier, supporters', concerts:'Concerts & spectacles live', concerts_s:'Artistes marocains & internationaux', culture:'Expositions culturelles', culture_s:'Art, histoire & traditions du Maroc' }
  },
  es: {
    skip: 'Saltar &rarr;',
    q:  ['¿A qué equipo apoyas?','¿Qué tipo de partidos prefieres?','¿Dónde prefieres ver los partidos?','¿Qué actividades te gustan los días de partido?','¿Qué tipo de eventos te interesan?'],
    qs: ['Elige tu equipo o equipos favoritos','Selecciona todo lo que te guste','Solo una opción','Elige todo lo que te corresponda','Selecciona una o más opciones'],
    cont: ['Continuar &rarr;','Continuar &rarr;','Continuar &rarr;','Continuar &rarr;','Finalizar &rarr;'],
    teams: { maroc:'Marruecos', france:'Francia', bresil:'Brasil', espagne:'España', argentine:'Argentina', portugal:'Portugal', allemagne:'Alemania', angleterre:'Inglaterra', autre:'Otro' },
    mt: { finales:'Finales y semifinales', derbies:'Derbis y rivalidades', groupes:'Fase de grupos', surprises:'Partidos sorpresa' },
    wh: { stade:'En el estadio', stade_s:'Vivir el ambiente en directo', cafe:'En un café o restaurante', cafe_s:'Ambiente distendido y social', fanzone:'Fan zone oficial', fanzone_s:'Pantalla grande, multitud, energía', maison:'En casa', maison_s:'Comodidad y tranquilidad' },
    act: { gastro:'Gastronomía local', visite:'Visitar la ciudad y la cultura', shop:'Compras y souvenirs', soiree:'Fiesta y vida nocturna' },
    ev:  { grands:'Grandes eventos oficiales', grands_s:'Ceremonias, apertura y final', fans:'Concentraciones de fans locales', fans_s:'Ambiente de barrio, aficionados', concerts:'Conciertos y espectáculos en vivo', concerts_s:'Artistas marroquíes e internacionales', culture:'Exposiciones y eventos culturales', culture_s:'Arte, historia y tradiciones de Marruecos' }
  },
  en: {
    skip: 'Skip &rarr;',
    q:  ['Which team do you support?','What type of matches do you enjoy?','Where do you prefer to watch matches?','What activities do you like on match days?','What kind of events interest you?'],
    qs: ['Pick your favorite team or teams','Select everything that appeals to you','Choose one option only','Pick everything that suits you','Select one or more options'],
    cont: ['Continue &rarr;','Continue &rarr;','Continue &rarr;','Continue &rarr;','Finish &rarr;'],
    teams: { maroc:'Morocco', france:'France', bresil:'Brazil', espagne:'Spain', argentine:'Argentina', portugal:'Portugal', allemagne:'Germany', angleterre:'England', autre:'Other' },
    mt: { finales:'Finals & semi-finals', derbies:'Derbies & rivalries', groupes:'Group stage', surprises:'Surprise matches' },
    wh: { stade:'At the stadium', stade_s:'Live the atmosphere in person', cafe:'At a café or restaurant', cafe_s:'Relaxed and social vibe', fanzone:'Official fan zone', fanzone_s:'Big screen, crowd, energy', maison:'At home', maison_s:'Comfort and peace' },
    act: { gastro:'Local food & gastronomy', visite:'Explore the city & culture', shop:'Shopping & souvenirs', soiree:'Party & nightlife' },
    ev:  { grands:'Big official events', grands_s:'Opening ceremony & final', fans:'Local fan gatherings', fans_s:'Neighborhood vibe & supporters', concerts:'Concerts & live shows', concerts_s:'Moroccan & international artists', culture:'Cultural exhibitions & events', culture_s:'Art, history & Moroccan traditions' }
  }
};

function applyLanguage() {
    const sel = document.querySelector('.lang-grid .lang-card.sel');
    const lang = sel ? sel.getAttribute('data-lang') : 'fr';
    const t = OB[lang] || OB['fr'];

    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);

    const el = (id, text) => { const e = document.getElementById(id); if (e) e.innerHTML = text; };

    for (let i = 0; i < 5; i++) {
        el('q' + i + 't', t.q[i]);
        el('q' + i + 's', t.qs[i]);
        el('sk' + i, t.skip);
        el('b' + i, t.cont[i]);
    }

    el('tn-maroc', t.teams.maroc); el('tn-france', t.teams.france); el('tn-bresil', t.teams.bresil);
    el('tn-espagne', t.teams.espagne); el('tn-argentine', t.teams.argentine); el('tn-portugal', t.teams.portugal);
    el('tn-allemagne', t.teams.allemagne); el('tn-angleterre', t.teams.angleterre); el('tn-autre', t.teams.autre);

    el('mt-finales', t.mt.finales); el('mt-derbies', t.mt.derbies);
    el('mt-groupes', t.mt.groupes); el('mt-surprises', t.mt.surprises);

    el('wh-stade', t.wh.stade); el('wh-stade-s', t.wh.stade_s);
    el('wh-cafe', t.wh.cafe); el('wh-cafe-s', t.wh.cafe_s);
    el('wh-fanzone', t.wh.fanzone); el('wh-fanzone-s', t.wh.fanzone_s);
    el('wh-maison', t.wh.maison); el('wh-maison-s', t.wh.maison_s);

    el('act-gastro', t.act.gastro); el('act-visite', t.act.visite);
    el('act-shop', t.act.shop); el('act-soiree', t.act.soiree);

    el('ev-grands', t.ev.grands); el('ev-grands-s', t.ev.grands_s);
    el('ev-fans', t.ev.fans); el('ev-fans-s', t.ev.fans_s);
    el('ev-concerts', t.ev.concerts); el('ev-concerts-s', t.ev.concerts_s);
    el('ev-culture', t.ev.culture); el('ev-culture-s', t.ev.culture_s);

    goStep(0);
}

// Initialize default language
window.addEventListener('DOMContentLoaded', () => {
    // Populate Welcome screen with User Name
    try {
        const userInfoRaw = localStorage.getItem('userInfo');
        if (userInfoRaw) {
            const userInfo = JSON.parse(userInfoRaw);
            const userName = userInfo.nom_user || userInfo.name;
            if (userName) {
                const greetingEl = document.getElementById('splash-greeting');
                if (greetingEl) {
                    // Mettre en majuscules ou utiliser tel quel (ici on utilise tel quel ou majuscules comme dans le screenshot)
                    greetingEl.innerHTML = `Bienvenue ${userName.toUpperCase()} ! 🎉`;
                }
            }
        }
    } catch(e) {}

    // We do NOT call applyLanguage() here, we just pre-fill the texts so they are visible by default
    // We intentionally leave no card selected so the user is forced to choose one.
    const t = OB['fr'];
    const el = (id, text) => { const e = document.getElementById(id); if (e) e.innerHTML = text; };
    for (let i = 0; i < 5; i++) {
        el('q' + i + 't', t.q[i]); el('q' + i + 's', t.qs[i]); el('sk' + i, t.skip); el('b' + i, t.cont[i]);
    }
    el('tn-maroc', t.teams.maroc); el('tn-france', t.teams.france); el('tn-bresil', t.teams.bresil);
    el('tn-espagne', t.teams.espagne); el('tn-argentine', t.teams.argentine); el('tn-portugal', t.teams.portugal);
    el('tn-allemagne', t.teams.allemagne); el('tn-angleterre', t.teams.angleterre); el('tn-autre', t.teams.autre);
    el('mt-finales', t.mt.finales); el('mt-derbies', t.mt.derbies); el('mt-groupes', t.mt.groupes); el('mt-surprises', t.mt.surprises);
    el('wh-stade', t.wh.stade); el('wh-stade-s', t.wh.stade_s); el('wh-cafe', t.wh.cafe); el('wh-cafe-s', t.wh.cafe_s);
    el('wh-fanzone', t.wh.fanzone); el('wh-fanzone-s', t.wh.fanzone_s); el('wh-maison', t.wh.maison); el('wh-maison-s', t.wh.maison_s);
    el('act-gastro', t.act.gastro); el('act-visite', t.act.visite); el('act-shop', t.act.shop); el('act-soiree', t.act.soiree);
    el('ev-grands', t.ev.grands); el('ev-grands-s', t.ev.grands_s); el('ev-fans', t.ev.fans); el('ev-fans-s', t.ev.fans_s);
    el('ev-concerts', t.ev.concerts); el('ev-concerts-s', t.ev.concerts_s); el('ev-culture', t.ev.culture); el('ev-culture-s', t.ev.culture_s);
});

function goStep(n) {
    document.querySelectorAll('.ob-screen').forEach(s => s.style.display = 'none');
    if (n === '-lang') {
        const screen = document.getElementById('s-lang');
        if (screen) screen.style.display = 'flex';
        return;
    }
    const screen = document.getElementById('s' + n);
    if (screen) screen.style.display = 'flex';
}

function toggleTeam(c) {
    c.classList.toggle('sel');
    document.getElementById('b0').disabled = false;
    hasAnsweredAtLeastOne = true;
}

function toggleOptCard(c, g, b) {
    c.classList.toggle('sel');
    document.getElementById(b).disabled = false;
    hasAnsweredAtLeastOne = true;
}

function pickOne(r, l, b) {
    document.querySelectorAll(`#${l} .opt-row`).forEach(el => el.classList.remove('sel'));
    r.classList.add('sel');
    document.getElementById(b).disabled = false;
    hasAnsweredAtLeastOne = true;
}

function toggleOptRow(r, l, b) {
    r.classList.toggle('sel');
    const btn = document.getElementById(b);
    if (btn) btn.disabled = false;
    hasAnsweredAtLeastOne = true;
}

// Fonction finale : Collecte des données, appels API et Redirection
async function finish() {
    // 1. Collecter les données directement depuis les éléments sélectionnés (classe 'sel')
    const getValues = (selector) => {
        return Array.from(document.querySelectorAll(selector))
                    .map(el => el.getAttribute('data-v') || el.getAttribute('data-lang'));
    };

    const chosenLang = getValues('.lang-grid .lang-card.sel')[0] || 'fr';
    const teams = getValues('#team-grid .team-card.sel');
    const matchTypes = getValues('#og1 .opt-card.sel');
    const watchWhere = getValues('#ol2 .opt-row.sel')[0] || null; // Choix unique
    const activities = getValues('#og3 .opt-card.sel');
    const eventTypes = getValues('#ol4 .opt-row.sel');

    const prefs = {
        teams: teams,
        matchTypes: matchTypes,
        watchWhere: watchWhere,
        activities: activities,
        eventTypes: eventTypes,
        lang: chosenLang
    };

    // Vérifier si l'utilisateur a tout passé (skipped) sans rien répondre
    if (!hasAnsweredAtLeastOne) {
        // Nettoyer les anciennes recommandations pour s'assurer que la section restera masquée
        localStorage.removeItem('userRecommendations');
        localStorage.removeItem('wc2030_prefs');
        localStorage.removeItem('wc2030_reco_lang');
        localStorage.setItem('onboarding_skipped', 'true');
        window.location.href = 'index.html';
        return;
    }
    localStorage.removeItem('onboarding_skipped');

    // UX : Indiquer le chargement sur le bouton
    const btn = document.getElementById('b4');
    let originalText = btn ? btn.textContent : 'Terminer';
    if (btn) {
        btn.textContent = "Chargement...";
        btn.disabled = true;
    }

    try {
        // Sauvegarde locale des préférences
        localStorage.setItem('wc2030_prefs', JSON.stringify(prefs));
        localStorage.setItem('wc2030_lang', chosenLang);
        
        // Appliquer la langue choisie pour tout le site web
        localStorage.setItem('selectedLang', chosenLang);
        localStorage.setItem('selectedLanguage', chosenLang);

        // 2. Envoi des données au backend principal et récupération des recommandations
        let userId = null;
        try {
            const userInfoRaw = localStorage.getItem('userInfo');
            if (userInfoRaw) {
                const userInfo = JSON.parse(userInfoRaw);
                userId = userInfo._id || userInfo.id;
            }
        } catch(e) {}

        const response = await fetch('http://localhost:5000/api/recommendations/get-recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choices: prefs, userId: userId })
        });

        const recommendations = await response.json();
        localStorage.setItem('userRecommendations', JSON.stringify(recommendations));

    } catch (error) {
        console.error("Erreur API :", error);
    } finally {
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
        // 4. Redirection immédiate vers la page d'accueil principale
        window.location.href = 'index.html';
    }
}
