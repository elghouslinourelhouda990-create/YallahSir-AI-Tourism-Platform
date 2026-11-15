const Match = require('../models/matchModel');

// Helper to get translation
const getTranslatedMatch = (match, lang) => {
    const m = match.toObject ? match.toObject() : match;
    
    const translateField = (val, lang) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        return val[lang] || val['fr'] || Object.values(val)[0] || "";
    };

    return {
        ...m,
        equipe_A: translateField(m.equipe_A, lang),
        equipe_B: translateField(m.equipe_B, lang)
    };
};

// @desc    Get all matchs
// @route   GET /api/matchs
// @access  Public
const getMatchs = async (req, res) => {
    try {
        const lang = req.query.lang || 'fr';
        const matchs = await Match.find({});
        const translatedMatchs = matchs.map(m => getTranslatedMatch(m, lang));
        res.status(200).json(translatedMatchs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single match
// @route   GET /api/matchs/:id
// @access  Public
const getMatchById = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ message: 'Match non trouvé' });
        }
        res.status(200).json(match);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create match
// @route   POST /api/matchs
// @access  Private/Admin (theoretically)
const createMatch = async (req, res) => {
    const { id_match, equipe_A, equipe_B, date_match, resultat_match, id_lieu } = req.body;

    if (!id_match || !equipe_A || !equipe_B || !date_match || !id_lieu) {
        return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
    }

    try {
        const matchExists = await Match.findOne({ id_match });
        if (matchExists) {
            return res.status(400).json({ message: 'Ce match (id_match) existe déjà' });
        }

        const match = await Match.create({
            id_match,
            equipe_A,
            equipe_B,
            date_match,
            resultat_match: resultat_match || "",
            id_lieu
        });

        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update match
// @route   PUT /api/matchs/:id
// @access  Private/Admin
const updateMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ message: 'Match non trouvé' });
        }

        const updatedMatch = await Match.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedMatch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete match
// @route   DELETE /api/matchs/:id
// @access  Private/Admin
const deleteMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ message: 'Match non trouvé' });
        }

        await match.deleteOne();

        res.status(200).json({ message: 'Match supprimé avec succès', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMatchs,
    getMatchById,
    createMatch,
    updateMatch,
    deleteMatch
};
