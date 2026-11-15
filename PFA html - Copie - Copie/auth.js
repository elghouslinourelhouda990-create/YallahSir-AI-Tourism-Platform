// l'adresse dyal serveur fin ghadi nsifto les info dyal user
const API_URL = 'http://localhost:5000/api/users';

/**
 * Handles the User Registration (Signup) process
 */
async function handleSignup(event) {
    event.preventDefault(); // kt7bs la page mn Actualiser bach data madi3ch 

    // Get form values
    const prenom = document.getElementById('prenom').value;
    const nom = document.getElementById('nom').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const country = document.getElementById('country').value;
    // Assuming 'langue_maternelle' needs to be provided, we'll assign a default or extract if added to form
    const langue_maternelle = "Français";

    // kntaekdo wach PaSs et PaSs confirmer b7al b7al
    if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas !");
        return;
    }

    try { //kansifto les info l serveur bl post
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nom_user: `${prenom} ${nom}`,
                email_user: email,
                Mot_de_passe: password,
                pays_user: country,
                langue_maternelle: langue_maternelle
            })
        });

        const data = await response.json(); //kn9raw response li ja mn serveur

        if (response.ok) {
            // Clear any previous session's recommendations
            localStorage.removeItem('userRecommendations');
            localStorage.removeItem('wc2030_prefs');
            localStorage.removeItem('wc2030_reco_lang');

            // Auto-login after registration
            if(data.token) localStorage.setItem('token', data.token);
            if(data) localStorage.setItem('userInfo', JSON.stringify(data));

            if (typeof window.showToast === 'function') {
                window.showToast('Compte créé avec succès ! Allons découvrir vos recommandations...', 'success');
            } else {
                alert('Compte créé avec succès !');
            }
            
            // Redirect to recommendation page for new users
            setTimeout(() => {
                window.location.href = 'recommendation.html';
            }, 1500);
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast(`Erreur : ${data.message}`, 'error');
            } else {
                alert(`Erreur : ${data.message}`);
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('Une erreur est survenue lors de la connexion au serveur.', 'error');
        } else {
            alert('Une erreur est survenue lors de la connexion au serveur.');
        }
    }
}

/**
 * Handles the User Login process
 */
async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email_user: email,
                Mot_de_passe: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save token and user info to LocalStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Show Toast, save redirect flag
            if (typeof window.showToast === 'function') {
                window.showToast('Connexion réussie ! Bonjour.', 'success');
            } else {
                alert('Connexion réussie !');
            }
            
            // Redirect to home page after a short delay so user sees the toast
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast(`Erreur : ${data.message}`, 'error');
            } else {
                alert(`Erreur : ${data.message}`);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('Une erreur est survenue lors de la connexion au serveur.', 'error');
        } else {
            alert('Une erreur est survenue lors de la connexion au serveur.');
        }
    }
}

/**
 * hna knchof wach token ba9i f navigateur
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

/**
 * Log out function
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    // Clear recommendation data
    localStorage.removeItem('userRecommendations');
    localStorage.removeItem('wc2030_prefs');
    localStorage.removeItem('wc2030_reco_lang');
    
    window.location.href = 'login.html';
}

// --- UI UPDATES FOR AUTHENTICATION ---

/**
 * Updates the Header UI based on login status
 */
function updateHeaderUI() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    const token = localStorage.getItem('token');

    if (token) {
        const userInfoRaw = localStorage.getItem('userInfo');
        let userInfo = {};
        try { userInfo = JSON.parse(userInfoRaw || '{}'); } catch(e) {}
        const userName = userInfo.nom_user || userInfo.name || 'Utilisateur';
        const userEmail = userInfo.email_user || userInfo.email || '';

        const lang = localStorage.getItem('selectedLang') || 'fr';
        const T = window.ui_translations ? (window.ui_translations[lang] || window.ui_translations['fr']) : {};

        authContainer.innerHTML = `
            <div class="profile-dropdown-container" id="profileDropdownContainer">
                <button class="profile-btn" id="profileBtn">
                    <div class="profile-icon">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="user-dropdown-menu" id="userDropdownMenu">
                    <div class="dropdown-user-info" style="text-align: center; padding: 15px 20px 10px;">
                        <div style="font-weight: 600; font-size: 1.05rem; color: #333;">${userName}</div>
                        ${userEmail ? `<div style="font-size: 0.85rem; color: #777; margin-top: 4px;">${userEmail}</div>` : ''}
                    </div>
                    <div class="user-dropdown-divider"></div>
                    <a href="#" onclick="openUserAvisModal(event)"><i class="fa-solid fa-star"></i> <span data-i18n="my_reviews">${T.my_reviews || 'Mes Avis'}</span></a>
                    <a href="#" onclick="openUserFavorisModal(event)"><i class="fa-solid fa-heart"></i> <span data-i18n="my_favorites">${T.my_favorites || 'Mes Favoris'}</span></a>
                    <a href="#" onclick="openUserHistoryModal(event)"><i class="fa-solid fa-clock-rotate-left"></i> <span data-i18n="search_history">${T.search_history || 'Historique de recherche'}</span></a>
                    <div class="user-dropdown-divider"></div>
                    <button class="logout-btn" onclick="logout()"><i class="fa-solid fa-power-off"></i> <span data-i18n="logout">${T.logout || 'Déconnexion'}</span></button>
                </div>
            </div>
        `;

        // Add toggle logic for dropdown
        const container = document.getElementById('profileDropdownContainer');
        const profileBtn = document.getElementById('profileBtn');

        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                container.classList.toggle('active');
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (container && !container.contains(e.target)) {
                    container.classList.remove('active');
                }
            });
        }
    } else {
        // User is not logged in
        authContainer.innerHTML = `
            <a href="login.html" class="btn-login" data-i18n="login_btn">Connexion</a>
            <a href="signup.html" class="btn-signup" data-i18n="signup_btn">S'inscrire</a>
        `;
    }

    // Show or hide recommendation elements based on login state
    const recoSection = document.getElementById('reco-section');
    const discoverRecoBtn = document.getElementById('discover-reco-btn');
    if (recoSection) recoSection.style.display = token ? 'block' : 'none';
    if (discoverRecoBtn) discoverRecoBtn.style.display = token ? 'block' : 'none';

    // Call translation if available to ensure new elements are translated
    if (typeof applyUITranslations === 'function') {
        const currentLang = localStorage.getItem('selectedLang') || 'fr';
        applyUITranslations(currentLang);
    }
}

// Automatically apply UI changes on pages that have authContainer
document.addEventListener('DOMContentLoaded', updateHeaderUI);
