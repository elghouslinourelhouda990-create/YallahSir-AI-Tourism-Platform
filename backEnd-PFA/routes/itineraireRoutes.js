const express = require('express');
const router = express.Router();
const {
    creerItineraire,
    mesItineraires,
    ajouterLieu,
    retirerLieu,
    supprimerItineraire,
    recommanderLieuxCollaborative
} = require('../controllers/itineraireController');
const { protectRoute } = require('../middlewares/authMiddleware');

// All itinerary routes need authentication according to prompt
router.use(protectRoute);

router.route('/').post(creerItineraire);
router.route('/my-itineraires').get(mesItineraires);
router.route('/:id/add-lieu').put(ajouterLieu);
router.route('/:id/remove-lieu').delete(retirerLieu);
router.route('/:id').delete(supprimerItineraire);
router.route('/recommendations-collaborative').post(recommanderLieuxCollaborative);

module.exports = router;
