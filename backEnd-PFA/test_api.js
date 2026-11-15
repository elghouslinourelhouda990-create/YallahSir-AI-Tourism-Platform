const http = require('http');

const data = JSON.stringify({
  lieux_choisis: []
});

// Since we don't have a token easily, maybe the request is returning 401?
// But 401 would trigger "Veuillez vous connecter" in itineraries.js ?
// Actually, itineraries.js doesn't check for response.ok = false properly, it says:
// if (response.ok) { ... renderRecoModalList(data, ...) } else { listContainer.innerHTML = '<p>Erreur lors du chargement des recommandations.</p>' }
