const ServicePratique = require('../models/servicePratiqueModel');

// Helper to get translation
const getTranslatedService = (service, lang) => {
    const s = service.toObject ? service.toObject() : service;
    
    const translateField = (val, lang) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        return val[lang] || val['fr'] || Object.values(val)[0] || "";
    };

    return {
        ...s,
        type_service_pratique: translateField(s.type_service_pratique, lang),
        description_service_pratique: translateField(s.description_service_pratique, lang),
        ville_service_pratique: translateField(s.ville_service_pratique, lang)
    };
};

// @desc    Get all services pratiques
// @route   GET /api/services
// @access  Public
const getServicePratiques = async (req, res) => {
    try {
        const lang = req.query.lang || 'fr';
        const servicePratiques = await ServicePratique.find({});
        const translatedServices = servicePratiques.map(s => getTranslatedService(s, lang));
        res.status(200).json(translatedServices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service pratique by id
// @route   GET /api/services/:id
// @access  Public
const getServicePratiqueById = async (req, res) => {
    try {
        const id = req.params.id;
        const lang = req.query.lang || 'fr';

        // Try searching by MongoDB ObjectId first, then fallback to your custom id_service_pratique
        let servicePratique;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            servicePratique = await ServicePratique.findById(id);
        } else {
            servicePratique = await ServicePratique.findOne({ id_service_pratique: Number(id) });
        }

        if (servicePratique) {
            res.status(200).json(getTranslatedService(servicePratique, lang));
        } else {
            res.status(404).json({ message: 'Service pratique non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a service pratique
// @route   POST /api/services
// @access  Private
const createServicePratique = async (req, res) => {
    try {
        const service = new ServicePratique(req.body);
        const createdService = await service.save();
        res.status(201).json(createdService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a service pratique
// @route   PUT /api/services/:id
// @access  Private
const updateServicePratique = async (req, res) => {
    try {
        const id = req.params.id;
        let service;
        let updatedService;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            service = await ServicePratique.findById(id);
            if (service) {
                updatedService = await ServicePratique.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            }
        } else {
            service = await ServicePratique.findOne({ id_service_pratique: Number(id) });
            if (service) {
                updatedService = await ServicePratique.findOneAndUpdate({ id_service_pratique: Number(id) }, req.body, { new: true, runValidators: true });
            }
        }

        if (updatedService) {
            res.status(200).json(updatedService);
        } else {
            res.status(404).json({ message: 'Service Pratique non trouvé' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a service pratique
// @route   DELETE /api/services/:id
// @access  Private
const deleteServicePratique = async (req, res) => {
    try {
        const id = req.params.id;
        let service;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            service = await ServicePratique.findById(id);
            if (service) {
                await ServicePratique.findByIdAndDelete(id);
            }
        } else {
            service = await ServicePratique.findOne({ id_service_pratique: Number(id) });
            if (service) {
                await ServicePratique.findOneAndDelete({ id_service_pratique: Number(id) });
            }
        }

        if (service) {
            res.status(200).json({ message: 'Service Pratique supprimé avec succès' });
        } else {
            res.status(404).json({ message: 'Service Pratique non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getServicePratiques,
    getServicePratiqueById,
    createServicePratique,
    updateServicePratique,
    deleteServicePratique
};
