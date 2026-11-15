const API_URL_FAVORIS = 'http://localhost:5000/api/favoris';
const API_URL_AVIS = 'http://localhost:5000/api/avis';

// Utility to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Global variable to keep track of favoris logic on fast clicks
let isTogglingFavori = false;

// Global set to keep track of favoris state across the app
window.currentUserFavoris = new Set();

async function initUserFavoris() {
    const token = getAuthToken();
    if (!token) return;
    try {
        const res = await fetch(`${API_URL_FAVORIS}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            data.forEach(f => {
                const idVal = f.id_lieu || f.id_match || f.id_activite || f.id_service || f.id_itineraire;
                window.currentUserFavoris.add(`${f.type_favori.toLowerCase()}_${idVal}`);
            });
            updateAllFavorisButtonsUI();
        }
    } catch(err) {
        console.error("Erreur init favoris", err);
    }
}

function updateAllFavorisButtonsUI() {
    const buttons = document.querySelectorAll('.action-btn-circle, .reco-fav');
    buttons.forEach(btn => {
        const onclickStr = btn.getAttribute('onclick');
        if (onclickStr && onclickStr.includes('toggleFavori')) {
            const match = onclickStr.match(/toggleFavori\('([^']+)',\s*'([^']+)'/);
            if (match) {
                const type = match[1].toLowerCase();
                const id = match[2];
                if (window.currentUserFavoris.has(`${type}_${id}`)) {
                    btn.classList.add('active-favori');
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid');
                        icon.style.color = '#e74c3c';
                    }
                }
            }
        }
    });
}

// Call init directly
initUserFavoris();


// TOGGLE FAVORIS
async function toggleFavori(type, item_id, item_title, event, btnElement) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const token = getAuthToken();
    if (!token) {
        if(typeof window.showToast === 'function') window.showToast('Veuillez vous connecter pour ajouter aux favoris', 'error');
        else alert('Veuillez vous connecter pour ajouter aux favoris');
        return;
    }

    if(isTogglingFavori) return;
    isTogglingFavori = true;

    const isFavorited = btnElement.classList.contains('active-favori');
    const icon = btnElement.querySelector('i');
    
    // UI Optimistic update
    btnElement.classList.toggle('active-favori');
    if (icon) {
        if (!isFavorited) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.style.color = '#e74c3c';
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            icon.style.color = '';
        }
    }

    try {
        if (isFavorited) {
            // Delete - note backend uses /api/favoris/:type/:id
            const res = await fetch(`${API_URL_FAVORIS}/${type}/${item_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(!res.ok) throw new Error("Failed to delete favori");
            if(window.currentUserFavoris) window.currentUserFavoris.delete(`${type.toLowerCase()}_${item_id}`);
        } else {
            // Add
            const res = await fetch(API_URL_FAVORIS, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type_favori: type, item_id: item_id, item_title: item_title })
            });
            if(!res.ok) {
                const errData = await res.json();
                if(errData.message && errData.message.includes('déjà')) {
                    // It was already added, keep UI active
                    isTogglingFavori = false;
                    return; 
                }
                throw new Error("Failed to add favori");
            }
            if(window.currentUserFavoris) window.currentUserFavoris.add(`${type.toLowerCase()}_${item_id}`);
        }
    } catch (err) {
        console.error(err);
        if(typeof window.showToast === 'function') window.showToast('Erreur serveur: Vrifiez que le backend est lancé', 'error');
        // Revert UI on failure
        btnElement.classList.toggle('active-favori');
        if (icon) {
            if (isFavorited) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                icon.style.color = '#e74c3c';
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                icon.style.color = '';
            }
        }
    } finally {
        isTogglingFavori = false;
    }
}

// OPEN AVIS MODAL
function closeAvisModal() {
    const modal = document.getElementById('avis-global-modal');
    if(modal) modal.style.display = 'none';
}

function openAvisModal(type, item_id, title, event) {
    if(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const token = getAuthToken();
    if (!token) {
        if(typeof window.showToast === 'function') window.showToast('Veuillez vous connecter pour voir ou laisser des avis', 'error');
        else alert('Veuillez vous connecter pour voir ou laisser des avis');
        return;
    }

    let modal = document.getElementById('avis-global-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'avis-global-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    const lang = localStorage.getItem('selectedLang') || 'fr';
    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});

      modal.innerHTML = `
        <div class="modal-content-simple">
            <span class="close-modal-simple" onclick="closeAvisModal()" style="font-size: 2.2rem; color: #94a3b8; position: absolute; top: 25px; right: 30px; cursor: pointer; transition: all 0.2s;">&times;</span>
            <h2 style="margin-bottom: 35px; font-size: 1.8rem; color: #1e293b; font-weight: 800; padding: 0 10px;">${T.avis_modal_title || 'Avis'} : ${title || type}</h2>
            
            <div id="avis-modal-list" style="max-height: 450px; overflow-y: auto; margin-bottom: 35px; padding: 0 20px;">
                <p style="text-align: center; color: #94a3b8; padding: 30px;">${T.avis_modal_loading || 'Chargement des avis...'}</p>
            </div>
            
            <div class="avis-form-card" style="background: #f8fafc; padding: 35px; border-radius: 30px; border: 1px solid #f1f5f9; margin: 0 10px;">
                <h3 style="margin-bottom: 20px; font-size: 1.2rem; font-weight: 800; color: #334155;">${T.avis_modal_add || 'Ajouter un avis'}</h3>
                <div class="rating-stars" id="avis-star-selector" style="font-size: 2.2rem; cursor: pointer; margin-bottom: 20px; color: #e2e8f0; display: flex; gap: 12px;">
                    <i class="fa-regular fa-star" data-val="1"></i>
                    <i class="fa-regular fa-star" data-val="2"></i>
                    <i class="fa-regular fa-star" data-val="3"></i>
                    <i class="fa-regular fa-star" data-val="4"></i>
                    <i class="fa-regular fa-star" data-val="5"></i>
                </div>
                <input type="hidden" id="avis-selected-rating" value="0">
                <input type="hidden" id="avis-item-title" value="${title || ''}">
                <textarea id="avis-text-input" placeholder="${T.avis_modal_placeholder || 'Partagez votre avis avec nous...'}" rows="3" style="width:100%; padding:20px; border-radius:18px; border: 2px solid #e2e8f0; resize: vertical; font-family: inherit; font-size: 1.05rem; transition: border-color 0.2s;"></textarea>
                
                <div class="avis-upload-container">
                    <label class="btn-upload-photo">
                        <i class="fa-solid fa-camera"></i>
                        <span>${T.avis_modal_photo || 'Ajouter une photo'}</span>
                        <input type="file" id="avis-photo-input" accept="image/*" style="display:none;" onchange="handleAvisPhotoSelection(this)">
                    </label>
                    <div id="avis-photo-preview" class="avis-photo-preview"></div>
                    <input type="hidden" id="avis-photo-data" value="">
                </div>

                <button class="btn-primary" style="margin-top:25px;" onclick="submitAvis('${type}', '${item_id}')">${T.avis_modal_publish || "Publier l'avis"}</button>
            </div>
        </div>
    `;  
    modal.style.display = 'flex';

    // Interactive Stars setup
    const stars = modal.querySelectorAll('#avis-star-selector i');
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const val = parseInt(e.target.getAttribute('data-val'));
            document.getElementById('avis-selected-rating').value = val;
            stars.forEach((s, idx) => {
                if (idx < val) {
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid');
                    s.style.color = '#FFD700';
                } else {
                    s.classList.remove('fa-solid');
                    s.classList.add('fa-regular');
                    s.style.color = '';
                }
            });
        });
    });

    // Load avis from server
    loadAvisData(type, item_id);
}

function handleAvisPhotoSelection(input) {
    const previewContainer = document.getElementById('avis-photo-preview');
    const photoDataInput = document.getElementById('avis-photo-data');
    const file = input.files[0];

    if (!file) return;

    // Security: Validate type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert("Désolé, seuls les formats JPG, PNG et WEBP sont acceptés.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("L'image est trop volumineuse (max 5 Mo).");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        photoDataInput.value = base64;
        
        previewContainer.innerHTML = `
            <div class="preview-item">
                <img src="${base64}">
                <div class="preview-remove" onclick="removeAvisPhoto()">&times;</div>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function removeAvisPhoto() {
    document.getElementById('avis-photo-preview').innerHTML = '';
    document.getElementById('avis-photo-data').value = '';
    document.getElementById('avis-photo-input').value = '';
}

// --- EDIT AVIS LOGIC ---
function startEditAvis(id, currentNote, btn) {
    const item = document.getElementById(`avis-${id}`);
    if(!item) return;

    const currentText = btn.getAttribute('data-comment') || '';
    
    const lang = localStorage.getItem('selectedLang') || 'fr';
    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});
    
    item.innerHTML = `
        <div class="edit-avis-box">
            <div class="edit-stars" style="color: #facc15; margin-bottom: 10px; font-size: 1.1rem; cursor: pointer;">
                ${[1,2,3,4,5].map(v => `<i class="${v <= currentNote ? 'fa-solid' : 'fa-regular'} fa-star" data-val="${v}"></i>`).join('')}
            </div>
            <input type="hidden" class="edit-rating-val" value="${currentNote}">
            <textarea class="edit-text-val" style="width: 100%; border-radius: 8px; padding: 12px; font-family: inherit; resize: vertical;" rows="3">${currentText}</textarea>
            <div style="display: flex; gap: 10px; margin-top: 12px;">
                <button onclick="saveEditAvis('${id}')" class="btn-save-edit">${T.user_reviews_save || 'Enregistrer'}</button>
                <button onclick="loadAvisData('${item.closest('.modal').querySelector('#avis-modal-list').getAttribute('data-type')}', '${item.closest('.modal').querySelector('#avis-modal-list').getAttribute('data-id')}')" class="btn-cancel-edit">${T.user_reviews_cancel || 'Annuler'}</button>
            </div>
        </div>
    `;

    // Re-bind star clicks for edit
    const stars = item.querySelectorAll('.edit-stars i');
    stars.forEach(s => {
        s.addEventListener('click', () => {
            const val = parseInt(s.getAttribute('data-val'));
            item.querySelector('.edit-rating-val').value = val;
            stars.forEach((star, idx) => {
                if(idx < val) { star.classList.replace('fa-regular', 'fa-solid'); }
                else { star.classList.replace('fa-solid', 'fa-regular'); }
            });
        });
    });
}

async function saveEditAvis(id, isUserModal = false) {
    const prefix = isUserModal ? 'user-avis-' : 'avis-';
    const item = document.getElementById(`${prefix}${id}`);
    if (!item) return;
    const note = item.querySelector('.edit-rating-val').value;
    const text = item.querySelector('.edit-text-val').value;
    const token = getAuthToken();

    if(!text.trim()) {
        alert("Le commentaire ne peut pas être vide.");
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/avis/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ note_avis: parseInt(note), commentaire_avis: text })
        });

        if(res.ok) {
            if(typeof window.showToast === 'function') window.showToast('Avis mis à jour!', 'success');
            
            // Refresh the correct list
            const globalModal = document.getElementById('avis-global-modal');
            const userModal = document.getElementById('user-profile-modal');
            
            if(globalModal && globalModal.style.display !== 'none') {
                const list = document.getElementById('avis-modal-list');
                loadAvisData(list.getAttribute('data-type'), list.getAttribute('data-id'));
            } 
            
            if(userModal && userModal.style.display !== 'none') {
                loadUserAvis();
            }
        } else {
            alert("Erreur lors de la modification.");
        }
    } catch(e) {
        console.error(e);
        alert("Erreur réseau.");
    }
}
// -----------------------

// --- LOAD AVIS FOR MODAL ---
async function loadAvisData(type, item_id) {
    const listContainer = document.getElementById('avis-modal-list');
    if(!listContainer) return;

    listContainer.setAttribute('data-type', type);
    listContainer.setAttribute('data-id', item_id);

    try {
        const lang = localStorage.getItem('selectedLang') || 'fr';
        const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});
        const res = await fetch(`${API_URL_AVIS}/${type}/${item_id}?lang=${currentLang}`);
        if(res.ok) {
            const data = await res.json();
            if(data.length === 0) {
                listContainer.innerHTML = `<p style='color: #666; font-style: italic;'>${T.avis_modal_empty || 'Aucun avis pour le moment. Soyez le premier !'}</p>`;
            } else {
                const avg = data.reduce((sum, a) => sum + a.note_avis, 0) / data.length;
                const formattedAvg = avg.toFixed(1).replace('.0', '');
                const avgHtml = `
                    <div class="avg-rating-box">
                        <span>Note globale :</span>
                        <div class="avg-rating-value">
                            <i class="fa-solid fa-star"></i>
                            ${formattedAvg} / 5
                        </div>
                    </div>
                `;

                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const currentUserId = userInfo._id || userInfo.id;

                listContainer.innerHTML = avgHtml + data.map(a => {
                    const isMyAvis = currentUserId && (String(a.ID_USER) === String(currentUserId));
                    return `
                    <div class="avis-item" id="avis-${a._id}">
                        <div class="avis-stars">
                            ${Array(5).fill(0).map((_, i) => `<i class="${i < a.note_avis ? 'fa-solid' : 'fa-regular'} fa-star"></i>`).join('')}
                        </div>
                        <p class="avis-text">${a.commentaire_avis}</p>
                        ${a.photos_url_avis ? `
                            <div style="margin: 10px 0;">
                                <img src="${a.photos_url_avis}" class="avis-img-display" onclick="window.open(this.src)" title="Agrandir la photo">
                            </div>
                        ` : ''}
                        <div class="avis-meta">
                            <span>${new Date(a.date_avis).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Publié par <b>${a.user_name || 'un utilisateur'}</b></span>
                        </div>
                        ${isMyAvis ? `
                        <button onclick="startEditAvis('${a._id}', ${a.note_avis}, this)" data-comment="${a.commentaire_avis.replace(/"/g, '&quot;')}" style="position: absolute; right: 0; top: 20px; background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 1.10rem;" title="Modifier mon avis">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        ` : ''}
                    </div>
                `}).join('');
            }
        } else {
            listContainer.innerHTML = "<p style='color:red;'>Erreur lors du chargement des avis.</p>";
        }
    } catch(err) {
        listContainer.innerHTML = "<p style='color:red;'>Erreur de connexion au serveur backend.</p>";
    }
}

async function submitAvis(type, item_id) {
    const note = document.getElementById('avis-selected-rating').value;
    const text = document.getElementById('avis-text-input').value;
    const photo = document.getElementById('avis-photo-data').value;
    const titleRaw = document.getElementById('avis-item-title') ? document.getElementById('avis-item-title').value : '';
    const token = getAuthToken();

    if(!note || note === "0") {
        alert("Veuillez sélectionner une note avec les étoiles.");
        return;
    }
    if(!text.trim()) {
        alert("Veuillez écrire un commentaire.");
        return;
    }

    try {
        const res = await fetch(API_URL_AVIS, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                note_avis: parseInt(note),
                commentaire_avis: text,
                type_avis: type,
                item_id: item_id,
                item_title: titleRaw,
                photos_url_avis: photo
            })
        });

        if(res.ok) {
            if(typeof window.showToast === 'function') window.showToast('Avis publié avec succès!', 'success');
            loadAvisData(type, item_id);
            // Reset form
            const stars = document.querySelectorAll('#avis-star-selector i');
            stars.forEach(s => {
                s.classList.remove('fa-solid');
                s.classList.add('fa-regular');
                s.style.color = '';
            });
            document.getElementById('avis-selected-rating').value = "0";
            document.getElementById('avis-text-input').value = "";
            if (document.getElementById('avis-photo-data')) removeAvisPhoto();
        } else {
            const errData = await res.json();
            alert(`Erreur: ${errData.message}`);
        }
    } catch(err) {
        console.error(err);
        alert("Une erreur de connexion au serveur est survenue");
    }
}

// Global utility helper to generate the UI overlay for cards
function generateActionButtons(type, itemId, itemTitle, cssOverride = '') {
    // We pass itemTitle to populate the modal title
    const safeTitle = (itemTitle || '').toString().replace(/'/g, "\\'").replace(/"/g, "&quot;");
    // Use CSS variables for position so CSS can easily override them in RTL
    const styleString = cssOverride || 'position: absolute; top: 12px; right: 12px; z-index: 10;';
    const isFav = window.currentUserFavoris && window.currentUserFavoris.has(`${type.toLowerCase()}_${itemId}`);
    const btnClass = isFav ? 'action-btn-circle active-favori' : 'action-btn-circle';
    const iconClass = isFav ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
    const iconColor = isFav ? '#e74c3c' : '#4b5563';
    return `
        <div class="card-actions-overlay disable-selection" style="${styleString} display: flex; gap: 8px; align-items: center;">
            <button class="action-btn-circle" onclick="openAvisModal('${type}', '${itemId}', '${safeTitle}', event)" data-i18n-title="tooltip_avis" title="Lire / Ajouter un avis" style="background: rgba(255,255,255,0.95); border: none; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.15); transition: all 0.2s;">
                <i class="fa-regular fa-comment-dots" style="font-size: 1.1rem; color: #4b5563;"></i>
            </button>
            <button class="${btnClass}" onclick="toggleFavori('${type}', '${itemId}', '${safeTitle}', event, this)" data-i18n-title="tooltip_favori" title="Ajouter aux favoris" style="background: rgba(255,255,255,0.95); border: none; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.15); transition: all 0.2s;">
                <i class="${iconClass}" style="font-size: 1.1rem; color: ${iconColor};"></i>
            </button>
        </div>
    `;
}

// OPEN USER FAVORIS MODAL (Mes Favoris)
function openUserFavorisModal(event) {
    if(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const token = getAuthToken();
    if (!token) return;

    let modal = document.getElementById('user-profile-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'user-profile-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const lang = localStorage.getItem('selectedLang') || 'fr';
    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; padding: 30px;">
            <span class="close-modal" onclick="document.getElementById('user-profile-modal').style.display='none'" style="cursor:pointer; float:right; font-size: 24px;">&times;</span>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                <h2 style="margin: 0;"><i class="fa-solid fa-heart" style="color:#e74c3c;"></i> ${T.user_favorites_title || 'Mes Favoris'}</h2>
                <button id="btn-recommend-favoris" onclick="loadRecommendedFavoris()" style="display: none; background: linear-gradient(135deg, #0f766e, #064e3b); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; font-size: 0.9rem; align-items: center; gap: 6px;"><i class="fa-solid fa-lightbulb" style="color:#fcd34d;"></i> <span data-i18n="recommended_foryou">${T.recommended_foryou || 'RECOMMANDÉ POUR VOUS'}</span> <i class="fa-solid fa-chevron-right" style="font-size:0.8em;"></i></button>
            </div>
            <div id="user-favoris-list" style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                <p style="text-align: center; color: #94a3b8; padding: 20px;">${T.user_favorites_loading || 'Chargement de vos favoris...'}</p>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    loadUserFavoris();
    
    // Close dropdown
    const container = document.getElementById('profileDropdownContainer');
    if (container) container.classList.remove('active');
}

async function loadUserFavoris() {
    const listContainer = document.getElementById('user-favoris-list');
    if(!listContainer) return;
    try {
        const token = getAuthToken();
        const currentLang = localStorage.getItem('selectedLang') || 'fr';
        const res = await fetch(`${API_URL_FAVORIS}/user?lang=${currentLang}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const T = (window.ui_translations && window.ui_translations[currentLang]) ? window.ui_translations[currentLang] : ((window.ui_translations && window.ui_translations['fr']) || {});
        
        if(res.ok) {
            const data = await res.json();
            if(data.length === 0) {
                listContainer.innerHTML = `<p style='color: #666; text-align: center; padding: 20px;'>${T.user_favorites_empty || "Vous n'avez pas encore ajouté de favoris."}</p>`;
                const btnRec = document.getElementById('btn-recommend-favoris');
                if (btnRec) btnRec.style.display = 'none';
            } else {
                const btnRec = document.getElementById('btn-recommend-favoris');
                if (btnRec) btnRec.style.display = 'flex';
                
                listContainer.innerHTML = data.map(f => `
                    <div style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="display:inline-block; padding: 3px 8px; background: #e2e8f0; border-radius: 4px; font-size: 0.8rem; margin-bottom: 5px;">${f.type_favori}</span>
                            <h4 style="margin: 0; font-size: 1.1rem;">${f.item_title || 'Élément n°' + (f.id_lieu || f.id_match || f.id_activite || f.id_service || f.id_itineraire || 'inconnu')}</h4>
                            <small style="color: #888;">${T.user_favorites_added_on || 'Ajouté le'} ${new Date(f.date_ajout).toLocaleDateString()}</small>
                        </div>
                        <button onclick="deleteUserFavori('${f.type_favori}', ${f.id_lieu || f.id_match || f.id_activite || f.id_service || f.id_itineraire})" style="background: #fee2e2; color: #ef4444; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
    } catch(err) {
        listContainer.innerHTML = "<p style='color:red;'>Erreur de connexion au serveur.</p>";
    }
}

async function deleteUserFavori(type, id) {
    if(!confirm('Retirer de vos favoris ?')) return;
    try {
        const token = getAuthToken();
        await fetch(`${API_URL_FAVORIS}/${type}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadUserFavoris();
    } catch(err) {
        console.error(err);
    }
}

async function loadRecommendedFavoris() {
    const listContainer = document.getElementById('user-favoris-list');
    if(!listContainer) return;
    
    const currentLang = localStorage.getItem('selectedLang') || 'fr';
    const T = (window.ui_translations && window.ui_translations[currentLang]) ? window.ui_translations[currentLang] : ((window.ui_translations && window.ui_translations['fr']) || {});
    
    listContainer.innerHTML = `<p style="text-align: center; color: #94a3b8; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> ${T.loading_reco || 'Chargement des recommandations...'}</p>`;
    
    // Hide the recommend button while viewing recommendations
    const btnRec = document.getElementById('btn-recommend-favoris');
    if (btnRec) btnRec.style.display = 'none';
    
    try {
        const token = getAuthToken();
        const currentLang = localStorage.getItem('selectedLang') || 'fr';
        const res = await fetch(`${API_URL_FAVORIS}/recommendations?lang=${currentLang}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(res.ok) {
            const data = await res.json();
            if(data.length === 0) {
                listContainer.innerHTML = `
                    <div style="text-align: center; padding: 30px 20px;">
                        <i class="fa-regular fa-face-frown-open" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 15px;"></i>
                        <p style='color: #64748b; margin-bottom: 20px;'>${T.no_reco_found || 'Aucune recommandation disponible pour le moment basé sur vos favoris.'}</p>
                        <button onclick="loadUserFavoris()" style="background: #f1f5f9; color: #475569; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.2s;"><i class="fa-solid fa-arrow-left" style="margin-right: 5px;"></i> ${T.back_to_fav || 'Retour à mes favoris'}</button>
                    </div>`;
            } else {
                listContainer.innerHTML = `
                    <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <button onclick="loadUserFavoris()" style="background: #f1f5f9; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #475569; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'"><i class="fa-solid fa-arrow-left"></i> ${T.back_btn || 'Retour'}</button>
                        <h3 style="margin: 0; font-size: 1.05rem; color: #0f766e;"><i class="fa-solid fa-users" style="margin-right: 5px;"></i> ${T.suggestions_others || "Suggestions d'autres utilisateurs"}</h3>
                    </div>
                ` + data.map(f => {
                    const idVal = f.id_lieu || f.id_match || f.id_activite || f.id_service || f.id_itineraire;
                    const safeTitle = (f.item_title || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");
                    const isFav = window.currentUserFavoris && window.currentUserFavoris.has(`${f.type_favori.toLowerCase()}_${idVal}`);
                    const btnClass = isFav ? 'action-btn-circle active-favori' : 'action-btn-circle';
                    const iconClass = isFav ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
                    const iconColor = isFav ? '#e74c3c' : '#4b5563';
                    
                    return `
                    <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                        <div>
                            <span style="display:inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">${f.type_favori}</span>
                            <h4 style="margin: 0; font-size: 1.1rem; color: #1e293b;">${f.item_title || 'Élément n°' + idVal}</h4>
                        </div>
                        <button class="${btnClass}" onclick="toggleFavori('${f.type_favori}', '${idVal}', '${safeTitle}', event, this)" title="Ajouter aux favoris" style="background: white; border: 1px solid #e2e8f0; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: all 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                            <i class="${iconClass}" style="font-size: 1.1rem; color: ${iconColor};"></i>
                        </button>
                    </div>
                `;}).join('');
            }
        }
    } catch(err) {
        listContainer.innerHTML = `<p style='color:red; text-align: center;'>${T.error_server || "Erreur de connexion au serveur."}</p>`;
    }
}

// OPEN USER AVIS MODAL (Mes Avis)
function openUserAvisModal(event) {
    if(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const token = getAuthToken();
    if (!token) return;

    let modal = document.getElementById('user-profile-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'user-profile-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const lang = localStorage.getItem('selectedLang') || 'fr';
    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 650px;">
            <span class="close-modal-simple" onclick="document.getElementById('user-profile-modal').style.display='none'">&times;</span>
            <h2 style="margin-bottom: 25px; font-size: 1.6rem; text-align: center;"><i class="fa-solid fa-star" style="color:#FFD700; margin-right: 10px;"></i> ${T.user_reviews_title || 'Mes Avis'}</h2>
            <div id="user-avis-list" style="max-height: 450px; overflow-y: auto; padding: 0 20px;">
                <p style="text-align: center; padding: 20px; color: #94a3b8;">${T.user_reviews_loading || 'Chargement de vos avis...'}</p>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    loadUserAvis();
    
    // Close dropdown
    const container = document.getElementById('profileDropdownContainer');
    if (container) container.classList.remove('active');
}

async function loadUserAvis() {
    const listContainer = document.getElementById('user-avis-list');
    if(!listContainer) return;
    try {
        const token = getAuthToken();
        const currentLang = localStorage.getItem('selectedLang') || 'fr';
        const res = await fetch(`${API_URL_AVIS}/user?lang=${currentLang}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const T = (window.ui_translations && window.ui_translations[currentLang]) ? window.ui_translations[currentLang] : ((window.ui_translations && window.ui_translations['fr']) || {});

        if(res.ok) {
            const data = await res.json();
            if(data.length === 0) {
                listContainer.innerHTML = `<p style='color: #666; text-align: center; padding: 20px;'>${T.user_reviews_empty || "Vous n'avez pas encore publié d'avis."}</p>`;
            } else {
                listContainer.innerHTML = data.map(a => `
                    <div class="user-avis-card" id="user-avis-${a._id}">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; align-items: flex-start;">
                            <div style="flex-grow: 1;">
                                <span style="display:inline-block; padding: 4px 10px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                                    ${a.type_avis} • ${a.item_title || 'Élément sans nom'}
                                </span>
                                <div class="avis-stars">
                                    ${Array(5).fill(0).map((_, i) => `<i class="${i < a.note_avis ? 'fa-solid' : 'fa-regular'} fa-star"></i>`).join('')}
                                </div>
                            </div>
                             <div style="display: flex; gap: 10px;">
                                <button onclick="startEditUserAvis('${a._id}', ${a.note_avis}, this)" data-comment="${a.commentaire_avis.replace(/"/g, '&quot;')}" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 10px; border-radius: 10px; cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="Modifier">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button onclick="deleteUserAvis('${a._id}')" style="background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; padding: 10px; border-radius: 10px; cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="Supprimer">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p class="avis-text">${a.commentaire_avis}</p>
                        <div class="avis-meta">
                            <i class="fa-regular fa-clock"></i>
                            <span>${T.user_reviews_published_on || 'Publié le'} ${new Date(a.date_avis).toLocaleDateString()}</span>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            listContainer.innerHTML = "<p style='color: red;'>Erreur de chargement.</p>";
        }
    } catch(e) {
        console.error(e);
        listContainer.innerHTML = "<p style='color:red;'>Erreur de connexion au serveur.</p>";
    }
}

// Special wrapper for editing in "Mes Avis" list
function startEditUserAvis(id, currentNote, btn) {
    const item = document.getElementById(`user-avis-${id}`);
    if(!item) return;

    const currentText = btn.getAttribute('data-comment') || '';
    const lang = localStorage.getItem('selectedLang') || 'fr';
    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});

    item.innerHTML = `
        <div class="edit-avis-box">
            <div class="edit-stars" style="color: #facc15; margin-bottom: 10px; font-size: 1.1rem; cursor: pointer;">
                ${[1,2,3,4,5].map(v => `<i class="${v <= currentNote ? 'fa-solid' : 'fa-regular'} fa-star" data-val="${v}"></i>`).join('')}
            </div>
            <input type="hidden" class="edit-rating-val" value="${currentNote}">
            <textarea class="edit-text-val" style="width: 100%; border-radius: 8px; padding: 12px; font-family: inherit; font-size: 0.95rem; resize: vertical;" rows="3">${currentText}</textarea>
            <div style="display: flex; gap: 10px; margin-top: 12px;">
                <button onclick="saveEditAvis('${id}', true)" class="btn-save-edit">${T.user_reviews_save || 'Sauvegarder'}</button>
                <button onclick="loadUserAvis()" class="btn-cancel-edit">${T.user_reviews_cancel || 'Annuler'}</button>
            </div>
        </div>
    `;

    const stars = item.querySelectorAll('.edit-stars i');
    stars.forEach(s => {
        s.addEventListener('click', () => {
            const val = parseInt(s.getAttribute('data-val'));
            item.querySelector('.edit-rating-val').value = val;
            stars.forEach((star, idx) => {
                if(idx < val) { star.classList.replace('fa-regular', 'fa-solid'); }
                else { star.classList.replace('fa-solid', 'fa-regular'); }
            });
        });
    });
}

async function deleteUserAvis(id) {
    if(!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    try {
        const token = getAuthToken();
        await fetch(`${API_URL_AVIS}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadUserAvis();
    } catch(err) {
        console.error(err);
    }
}

// --- SEARCH HISTORY MODAL ---
function openUserHistoryModal(event) {
    if(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    let modal = document.getElementById('user-profile-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'user-profile-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const lang = localStorage.getItem('selectedLang') || 'fr';
    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; padding: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; font-size: 1.5rem;"><i class="fa-solid fa-clock-rotate-left" style="color:#64748b; margin-right: 10px;"></i> ${T.user_history_title || 'Historique'}</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button class="btn-clear-history" onclick="clearUserHistory()" style="background: #f1f5f9; border: none; padding: 8px 15px; border-radius: 8px; color: #64748b; cursor: pointer; font-weight: 500; font-size: 0.9rem;">${T.user_history_clear || 'Effacer tout'}</button>
                    <span class="close-modal-simple" onclick="document.getElementById('user-profile-modal').style.display='none'" style="cursor:pointer; font-size: 24px; color: #94a3b8; line-height: 1;">&times;</span>
                </div>
            </div>
            <div id="user-history-list" style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
                <!-- History items injected here -->
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    loadUserHistory();
    
    // Close dropdown
    const container = document.getElementById('profileDropdownContainer');
    if (container) container.classList.remove('active');
}

function loadUserHistory() {
    const listContainer = document.getElementById('user-history-list');
    if(!listContainer) return;

    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const lang = localStorage.getItem('selectedLang') || 'fr';
    const T = (window.ui_translations && window.ui_translations[lang]) ? window.ui_translations[lang] : ((window.ui_translations && window.ui_translations['fr']) || {});

    if (history.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
            <i class="fa-solid fa-search" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.3;"></i>
            <p>${T.user_history_empty || 'Votre historique est vide'}</p>
        </div>`;
        return;
    }

    listContainer.innerHTML = history.map(item => {
        let iconHtml = '<i class="fa-solid fa-map-marker-alt"></i>';
        let iconBg = 'bg-green';
        let typeText = item.type || (item.isQuery ? 'Recherche' : 'Lieu');

        if (item.isQuery) {
            iconHtml = '<i class="fa-solid fa-search"></i>';
            iconBg = 'bg-gray';
        } else if (item.type === 'activité') {
            iconHtml = '<i class="fa-solid fa-star"></i>';
            iconBg = 'bg-orange';
        } else if (item.type === 'service') {
            iconHtml = '<i class="fa-solid fa-concierge-bell"></i>';
            iconBg = 'bg-blue';
        }

        const dateStr = item.date ? new Date(item.date).toLocaleDateString() : '';

        return `
            <div class="history-item" onclick="handleHistoryItemClick(${item.isQuery}, '${item.type || ''}', '${item.id}', '${(item.text || '').replace(/'/g, "\\'")}')">
                <div class="history-icon ${iconBg}">${iconHtml}</div>
                <div class="history-info">
                    <span class="history-name">${item.text || 'Sans titre'}</span>
                    <span class="history-meta">${typeText} ${dateStr ? '• ' + dateStr : ''}</span>
                </div>
                <i class="fa-solid fa-chevron-right" style="color: #cbd5e1; font-size: 0.8rem;"></i>
            </div>
        `;
    }).join('');
}

function clearUserHistory() {
    if (confirm('Voulez-vous vraiment effacer tout votre historique de recherche ?')) {
        localStorage.removeItem('searchHistory');
        loadUserHistory();
    }
}

// Global helper to handle clicks from history items
window.handleHistoryItemClick = function(isQuery, type, id, text) {
    if (isQuery) {
        // Find search input and trigger search
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            searchInput.value = text;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.focus();
            // Scroll to search if needed
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else if (typeof window.openDetailModalDirectly === 'function') {
        window.openDetailModalDirectly(type, id);
    } else {
        // Fallback: navigate to the appropriate page with a query param
        let page = 'index.html';
        if (type === 'activité') page = 'activities.html';
        if (type === 'lieu') page = 'index.html';
        if (type === 'service') page = 'services.html';
        window.location.href = `${page}?id=${id}`;
    }
    
    const profileModal = document.getElementById('user-profile-modal');
    if (profileModal) profileModal.style.display = 'none';
};

