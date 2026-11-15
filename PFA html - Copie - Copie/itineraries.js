const API_URL_ITIN = 'http://localhost:5000/api/itineraires';

// Helper to get current translation
function t(key) {
    var lang = localStorage.getItem('selectedLang') || 'fr';
    if (window.ui_translations && window.ui_translations[lang] && window.ui_translations[lang][key] !== undefined) {
        return window.ui_translations[lang][key];
    }
    if (window.ui_translations && window.ui_translations['fr'] && window.ui_translations['fr'][key] !== undefined) {
        return window.ui_translations['fr'][key];
    }
    return key;
}

// Helper function to get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// tempPlacesAdded must be at module level so handleSaveItinerary can access it
let tempPlacesAdded = [];

// Helper to format date
function formatDateString(dateString) {
    if (!dateString) return t('itin_not_planned') || 'Non planifié';
    const lang = localStorage.getItem('selectedLang') || 'fr';
    const localeMap = { fr: 'fr-FR', en: 'en-US', ar: 'ar-MA', es: 'es-ES' };
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(localeMap[lang] || 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Fetch and display itineraries
async function loadItineraries() {
    const container = document.getElementById('itinerariesContainer');
    if (!container) return;

    const token = getToken();

    if (!token) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; border: 1px dashed #ccc;">
                <i class="fa-solid fa-lock" style="font-size: 2rem; color: #ccc; margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px; color: #111827;">${t('itin_login_required')}</h3>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">${t('itin_login_required_desc')}</p>
                <a href="login.html" class="btn-login" style="display: inline-block; padding: 10px 20px; text-decoration: none;">${t('itin_login_btn')}</a>
            </div>
        `;
        return;
    }

    try {
        container.innerHTML = `<p style="text-align: center; padding: 20px;">${t('itin_loading')}</p>`;

        const currentLang = localStorage.getItem('selectedLang') || 'fr';
        const response = await fetch(`${API_URL_ITIN}/my-itineraires?lang=${currentLang}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            loadItineraries();
            return;
        }

        const data = await response.json();

        if (response.ok) {
            window.allItinerariesSource = data;
            window.renderItineraries = (list) => {
                container.innerHTML = '';
                if (list.length === 0) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; border: 1px dashed #ccc;">
                            <i class="fa-solid fa-map" style="font-size: 2rem; color: #ccc; margin-bottom: 15px;"></i>
                            <h3 style="margin-bottom: 10px; color: #111827;">${t('itin_none')}</h3>
                            <p style="color: #6b7280; font-size: 14px;">${t('itin_none_search')}</p>
                        </div>
                    `;
                    return;
                }

                list.forEach(itin => {
                    const dateCreationFormatted = formatDateString(itin.date_creation);
                    const nbLieux = itin.lieux_choisis ? itin.lieux_choisis.length : 0;
                    const badgeClass = nbLieux > 0 ? 'badge-complet' : 'badge-brouillon';
                    const statusClass = nbLieux > 0 ? 'status-complet' : 'status-brouillon';
                    const statusText = nbLieux > 0 ? t('itin_status_complete') : t('itin_status_draft');

                    let cardHTML = `
                    <div class="itin-card ${statusClass}" style="position: relative;">
                        <div class="itin-card-header" style="margin-top: 15px; display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h3 class="itin-card-title" style="margin: 0;">${itin.nom_itineraire}</h3>
                                <span class="itin-badge ${badgeClass}" style="margin-top: 5px; display: inline-block;">${statusText}</span>
                            </div>
                            ${typeof generateActionButtons === 'function' ? generateActionButtons('Itineraire', itin._id, itin.nom_itineraire, 'position: relative; margin-top: -5px;') : ''}
                        </div>
                        <div class="itin-meta">
                            <div><i class="fa-regular fa-calendar"></i> ${t('itin_created')} ${dateCreationFormatted}</div>
                            <div><i class="fa-solid fa-location-dot"></i> ${nbLieux} ${t('itin_places_count')}</div>
                        </div>
                        <div class="itin-card-footer">
                            <span class="itin-date">ID: ${itin._id.substring(itin._id.length - 6)}</span>
                            <div class="itin-actions">
                                <button class="btn-action-icon" onclick="deleteItinerary('${itin._id}')"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                    `;
                    container.innerHTML += cardHTML;
                });
            };
            window.renderItineraries(window.allItinerariesSource);
        } else {
            container.innerHTML = `<p style="color: red; padding: 20px;">Erreur : ${data.message}</p>`;
        }
    } catch (error) {
        console.error("Fetch itineraries error:", error);
        container.innerHTML = `<p style="color: red; padding: 20px;">${t('itin_server_error')}</p>`;
    }
}

window.filterItineraries = function (query) {
    if (!window.allItinerariesSource) return;
    const q = query.toLowerCase().trim();
    const filtered = window.allItinerariesSource.filter(itin =>
        (itin.nom_itineraire || "").toLowerCase().includes(q)
    );
    window.renderItineraries(filtered);
};

// Handle form submission
async function handleSaveItinerary(e) {
    if (e) e.preventDefault();

    const token = getToken();

    if (!token) {
        alert(t('itin_login_required'));
        window.location.href = 'login.html';
        return;
    }

    const nomInput = document.getElementById('itinNameInput');
    const nom = nomInput ? nomInput.value.trim() : '';

    if (!nom) {
        alert(t('itin_name_label') + ' ?');
        return;
    }

    const saveBtn = document.getElementById('saveItinBtn') || document.getElementById('btn-save-itinerary');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${t('itin_saving')}`;
    }

    const durationInput = document.getElementById('itinDurationInput');
    const budgetInput = document.getElementById('itinBudgetInput');
    const typeSelect = document.getElementById('itinTypeSelect');

    const duree = durationInput ? parseInt(durationInput.value) || 0 : 0;
    const budget = budgetInput ? parseInt(budgetInput.value) || 0 : 0;
    const type = typeSelect ? typeSelect.value : 'culture';
    const nombre_lieux = tempPlacesAdded.length;

    try {
        const response = await fetch(API_URL_ITIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nom_itineraire: nom,
                lieux_choisis: tempPlacesAdded.map(p => p.id),
                duree: duree,
                budget: budget,
                type: type,
                nombre_lieux: nombre_lieux
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(t('itin_saved_ok'));
            const dateInput = document.getElementById('itinDateInput');
            const descInput = document.getElementById('itinDescInput');
            if (nomInput) nomInput.value = '';
            if (dateInput) dateInput.value = '';
            if (descInput) descInput.value = '';
            if (durationInput) durationInput.value = '';
            if (budgetInput) budgetInput.value = '';
            if (typeSelect) typeSelect.selectedIndex = 0;
            tempPlacesAdded = [];
            if (typeof window.updatePlacesUI === 'function') window.updatePlacesUI();
            loadItineraries();
        } else {
            alert(`Erreur : ${data.message}`);
        }
    } catch (error) {
        console.error("Save itinerary error:", error);
        alert(t('itin_server_error'));
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${t('itin_save_btn')}`;
        }
    }
}

async function deleteItinerary(id) {
    if (!confirm(t('itin_delete_confirm'))) return;

    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL_ITIN}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadItineraries();
        } else {
            const data = await response.json();
            alert(`Erreur : ${data.message}`);
        }
    } catch (error) {
        console.error("Delete itinerary error:", error);
        alert(t('itin_server_error'));
    }
}


// Event Listeners on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    loadItineraries();

    // Hook up Save Button
    const saveBtn = document.getElementById('saveItinBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveItinerary);
    }

    // Fallback for new ID introduced previously if it exists
    const btnSaveItinerary = document.getElementById('btn-save-itinerary');
    if (btnSaveItinerary) {
        btnSaveItinerary.addEventListener('click', handleSaveItinerary);
    }

    const btnAddPlaceText = document.getElementById('btn-add-place-text');
    const newPlaceTextInput = document.getElementById('new-place-text-input');
    const selectedPlacesContainer = document.getElementById('selected-places-container');
    const placesCountSpan = document.getElementById('places-count');
    const btnRecoCollab = document.getElementById('btn-reco-collab');

    tempPlacesAdded = []; // reset on page load

    const clearAllItinFields = () => {
        const nomInput = document.getElementById('itinNameInput');
        const dateInput = document.getElementById('itinDateInput');
        const descInput = document.getElementById('itinDescInput');
        const durationInput = document.getElementById('itinDurationInput');
        const budgetInput = document.getElementById('itinBudgetInput');
        const typeSelect = document.getElementById('itinTypeSelect');
        if (nomInput) nomInput.value = '';
        if (dateInput) dateInput.value = '';
        if (descInput) descInput.value = '';
        if (durationInput) durationInput.value = '';
        if (budgetInput) budgetInput.value = '';
        if (typeSelect) typeSelect.selectedIndex = 0;
        tempPlacesAdded = [];
        if (typeof window.updatePlacesUI === 'function') window.updatePlacesUI();
    };

    window.clearAllItinFields = clearAllItinFields;

    const btnCancelItinerary = document.getElementById('btn-cancel-itinerary');
    if (btnCancelItinerary) {
        btnCancelItinerary.addEventListener('click', () => {
            clearAllItinFields();
        });
    }

    const updatePlacesUI = () => {
        if (!selectedPlacesContainer) return;

        if (placesCountSpan) placesCountSpan.textContent = tempPlacesAdded.length;
        
        const autoCountInput = document.getElementById('itinPlacesCountAuto');
        if (autoCountInput) autoCountInput.value = tempPlacesAdded.length;

        if (btnRecoCollab) {
            btnRecoCollab.disabled = false;
            btnRecoCollab.style.background = '#8e44ad';
            btnRecoCollab.style.color = 'white';
            btnRecoCollab.style.cursor = 'pointer';
        }

        selectedPlacesContainer.innerHTML = '';

        if (tempPlacesAdded.length === 0) {
            selectedPlacesContainer.innerHTML = `
                <div class="empty-places-placeholder">
                    <i class="fa-solid fa-map-pin"></i>
                    <p>${t('itin_no_place')}</p>
                </div>
            `;
            return;
        }

        tempPlacesAdded.forEach(place => {
            const item = document.createElement('div');
            item.className = 'itin-place-item';
            item.style.marginBottom = '10px';
            item.innerHTML = `
                <span><i class="fa-solid fa-location-dot pin"></i> ${place.name}</span>
                <i class="fa-solid fa-xmark remove" style="cursor:pointer"></i>
            `;
            item.querySelector('.remove').addEventListener('click', () => {
                tempPlacesAdded = tempPlacesAdded.filter(p => p.id !== place.id);
                updatePlacesUI();
            });
            selectedPlacesContainer.appendChild(item);
        });
    };
    window.updatePlacesUI = updatePlacesUI;

    if (btnAddPlaceText && newPlaceTextInput) {
        btnAddPlaceText.addEventListener('click', () => {
            const val = newPlaceTextInput.value.trim();
            if (val) {
                tempPlacesAdded.push({
                    id: Date.now(),
                    name: val
                });
                newPlaceTextInput.value = '';
                updatePlacesUI();
            }
        });

        newPlaceTextInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnAddPlaceText.click();
            }
        });
    }

    // Map Button Logic (Modal)
    const btnOpenPlacesModal = document.getElementById('btn-open-places-modal');
    const placesModal = document.getElementById('placesModal');
    const btnClosePlacesModal = document.querySelector('.close-modal-simple');

    if (btnOpenPlacesModal && placesModal) {
        btnOpenPlacesModal.addEventListener('click', (e) => {
            e.preventDefault();

            placesModal.classList.add('active');

            const listContainer = document.getElementById('available-places-list');
            const searchInput = document.querySelector('.modal-search-box input');
            let cacheLieux = [];

            if (listContainer) {
                listContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Chargement des lieux...</p>';
                const currentLang = localStorage.getItem('selectedLang') || 'fr';
                fetch(`http://localhost:5000/api/lieux?lang=${currentLang}`)
                    .then(res => res.json())
                    .then(data => {
                        cacheLieux = data;
                        renderPlacesModalList(data);
                    })
                    .catch(err => {
                        listContainer.innerHTML = '<p style="text-align:center; color:red; padding:20px;">Erreur de connexion</p>';
                    });
                
                // Add search listener
                if(searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const val = e.target.value.toLowerCase().trim();
                        const filtered = cacheLieux.filter(l => l.nom_lieu.toLowerCase().includes(val));
                        renderPlacesModalList(filtered);
                    });
                }
            }

            function renderPlacesModalList(data) {
                if(!listContainer) return;
                listContainer.innerHTML = '';
                if(data.length === 0) {
                    listContainer.innerHTML = '<p style="text-align:center; padding: 20px; color: #666;">Aucun lieu trouvé.</p>';
                    return;
                }
                data.forEach(lieu => {
                    const row = document.createElement('div');
                    row.className = 'place-item-row';
                    row.innerHTML = `
                        <div class="place-info">
                            <div class="place-thumb" style="display:flex;justify-content:center;align-items:center;font-size:1.2rem;color:#777;"><i class="fa-solid fa-map-pin"></i></div>
                            <div class="place-text">
                                <h4>${lieu.nom_lieu}</h4>
                            </div>
                        </div>
                        <button class="btn-add-place" title="Ajouter" type="button"><i class="fa-solid fa-plus"></i></button>
                    `;
                    row.querySelector('.btn-add-place').addEventListener('click', () => {
                        const exists = tempPlacesAdded.find(p => p.id === lieu.id_lieu);
                        if(!exists) {
                            tempPlacesAdded.push({ id: lieu.id_lieu, name: lieu.nom_lieu });
                            updatePlacesUI();
                        }
                    });
                    listContainer.appendChild(row);
                });
            }
        });

        if (btnClosePlacesModal) {
            btnClosePlacesModal.addEventListener('click', () => {
                placesModal.classList.remove('active');
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === placesModal) {
                placesModal.classList.remove('active');
            }
        });
    }

    // Reco Button Logic
    const recoModal = document.getElementById('recoModal');
    const btnCloseRecoModal = document.querySelector('.close-modal-reco');

    if (btnRecoCollab && recoModal) {
        btnRecoCollab.addEventListener('click', async (e) => {
            e.preventDefault();
            recoModal.classList.add('active');

            const listContainer = document.getElementById('recommended-places-list');
            if (listContainer) {
                listContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Chargement des recommandations...</p>';
                
                const token = getToken();
                if (!token) {
                    listContainer.innerHTML = '<p style="text-align:center; padding: 20px; color:red;">Veuillez vous connecter.</p>';
                    return;
                }

                try {
                    const nomI = document.getElementById('itinNameInput');
                    const descI = document.getElementById('itinDescInput');
                    const response = await fetch(`${API_URL_ITIN}/recommendations-collaborative`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            lieux_choisis: tempPlacesAdded.map(p => p.id),
                            nom: nomI ? nomI.value : '',
                            desc: descI ? descI.value : ''
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        renderRecoModalList(data, listContainer);
                    } else {
                        listContainer.innerHTML = '<p style="text-align:center; color:red; padding:20px;">Erreur lors du chargement des recommandations.</p>';
                    }
                } catch (error) {
                    console.error('Recommandation error:', error);
                    listContainer.innerHTML = '<p style="text-align:center; color:red; padding:20px;">Erreur serveur.</p>';
                }
            }
        });

        // clearAllItinFields has been moved up to scope so it can be shared

        if (btnCloseRecoModal) {
            btnCloseRecoModal.addEventListener('click', () => {
                recoModal.classList.remove('active');
                clearAllItinFields();
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === recoModal) {
                recoModal.classList.remove('active');
                clearAllItinFields();
            }
        });

        function renderRecoModalList(data, listContainer) {
            listContainer.innerHTML = '';
            if(!data || data.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center; padding: 20px; color: #666;">Aucune recommandation trouvée.</p>';
                return;
            }
            const lang = localStorage.getItem('selectedLang') || 'fr';
            const getTrans = (field) => {
                if(!field) return "";
                if(typeof field === 'string') return field;
                return field[lang] || field['fr'] || field['en'] || "";
            };

            data.forEach(lieu => {
                const nom = getTrans(lieu.nom_lieu);
                const desc = getTrans(lieu.description_lieu);
                const row = document.createElement('div');
                row.className = 'place-item-row';
                row.innerHTML = `
                    <div class="place-info" style="display: flex; align-items: center; gap: 10px;">
                        <div class="place-thumb" style="display:flex;justify-content:center;align-items:center;font-size:1.2rem;color:#ff9800;width:40px;height:40px;background:#fffaf0;border-radius:8px;"><i class="fa-solid fa-star"></i></div>
                        <div class="place-text">
                            <h4 style="margin:0; font-size:1rem; color:#1e293b;">${nom}</h4>
                            <span style="font-size:0.8rem;color:#64748b;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">${desc}</span>
                        </div>
                    </div>
                    <button class="btn-add-place" title="Ajouter" type="button" style="width: 35px; height: 35px; border-radius: 8px; border: none; background: #f1f5f9; color: #8e44ad; cursor: pointer;"><i class="fa-solid fa-plus"></i></button>
                `;
                row.querySelector('.btn-add-place').addEventListener('click', function() {
                    const exists = tempPlacesAdded.find(p => p.id === lieu.id_lieu);
                    if(!exists) {
                        tempPlacesAdded.push({ id: lieu.id_lieu, name: nom });
                        updatePlacesUI();
                        this.disabled = true;
                        this.innerHTML = '<i class="fa-solid fa-check"></i>';
                        this.style.background = '#10b981';
                        this.style.color = '#fff';
                    }
                });
                listContainer.appendChild(row);
            });
        }
    }

    // Clear UI state initially since HTML hardcodes 2 items
    updatePlacesUI();

    // RESTORE SAVED DRAFT IF SWITCHED LANGUAGE
    try {
        const savedDraftStr = sessionStorage.getItem('draftItinerary');
        if (savedDraftStr) {
            const draft = JSON.parse(savedDraftStr);
            const nomInput = document.getElementById('itinNameInput');
            const durationInput = document.getElementById('itinDurationInput');
            const budgetInput = document.getElementById('itinBudgetInput');
            const typeSelect = document.getElementById('itinTypeSelect');
            
            if (nomInput && draft.name) nomInput.value = draft.name;
            if (durationInput && draft.duration) durationInput.value = draft.duration;
            if (budgetInput && draft.budget) budgetInput.value = draft.budget;
            if (typeSelect && draft.type) typeSelect.value = draft.type;
            
            if (draft.places && Array.isArray(draft.places)) {
                tempPlacesAdded = draft.places;
                updatePlacesUI();
            }
            sessionStorage.removeItem('draftItinerary'); // Clear it
        }
    } catch(e) {
        console.error('Error restoring draft itinerary', e);
    }

});
