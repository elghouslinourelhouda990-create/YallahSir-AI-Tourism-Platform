const mongoose = require('mongoose');
const translatableSchema = require('./translatableSchema');

const servicePratiqueSchema = mongoose.Schema(
    {
        id_service_pratique: { type: Number },
        type_service_pratique: translatableSchema,
        description_service_pratique: translatableSchema,
        ville_service_pratique: translatableSchema,
        id_lieu: { type: Number },
        infos_complementaires: { type: Object }
    },
    {
        versionKey: false
    }
);

const ServicePratique = mongoose.model('ServicePratique', servicePratiqueSchema, 'servicePratique');

module.exports = ServicePratique;
