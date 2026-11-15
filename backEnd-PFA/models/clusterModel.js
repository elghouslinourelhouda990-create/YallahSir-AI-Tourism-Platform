const mongoose = require('mongoose');

const clusterSchema = mongoose.Schema(
    {
        nom: {
            type: String,
            required: true
        },
        description: {
            type: String
        }
    },
    {
        timestamps: false,
        versionKey: false
    }
);

// Mongoose model with explicitly defined collection name to match Compass
const Cluster = mongoose.model('Cluster', clusterSchema, 'cluster');

module.exports = Cluster;
