const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = 'mongodb://127.0.0.1:27017/pfa';

const migrations = [
    {
        id: 102,
        type: { fr: "Alerte de Match", en: "Match Alert", ar: "تنبيه المباراة", es: "Alerta de Partido" },
        content: { 
            fr: "Le match Maroc vs Costa Rica commence dans 1 heure!", 
            en: "The Morocco vs Costa Rica match starts in 1 hour!", 
            ar: "تبدأ مباراة المغرب ضد كوستاريكا خلال ساعة واحدة!", 
            es: "¡El partido Marruecos vs Costa Rica comienza en 1 hora!" 
        }
    },
    {
        id: 100,
        type: { fr: "Bienvenue au Système", en: "System Welcome", ar: "ترحيب بالنظام", es: "Bienvenida al Sistema" },
        content: { 
            fr: "Bienvenue dans l'application officielle de la Coupe du Monde 2030 !", 
            en: "Welcome to the official Morocco 2030 World Cup application!", 
            ar: "مرحبًا بك في تطبيق كأس العالم المغرب 2030 الرسمي!", 
            es: "¡Bienvenido a la aplicación oficial de la Copa del Mundo Marruecos 2030!" 
        }
    },
    {
        id: 101,
        type: { fr: "Retard de Transport", en: "Transport Delay", ar: "تأخير المواصلات", es: "Retraso en el Transporte" },
        content: { 
            fr: "Le Train vers Oujda a 15 min de retard.", 
            en: "The Train to Oujda is 15 minutes late.", 
            ar: "القطار المتجه إلى وجدة متأخر 15 دقيقة.", 
            es: "El tren hacia Oujda tiene 15 minutos de retraso." 
        }
    },
    {
        id: 103,
        type: { fr: "Promotion", en: "Promotion", ar: "عرض ترويجي", es: "Promoción" },
        content: { 
            fr: "Réduction de 20% sur le Bus vers Marrakech aujourd'hui.", 
            en: "20% discount on the Bus to Marrakech today.", 
            ar: "خصم 20% على الحافلة المتوجهة إلى مراكش اليوم.", 
            es: "20% de descuento en el autobús a Marrakech hoy." 
        }
    }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const db = mongoose.connection.db;
        
        for (let m of migrations) {
            await db.collection('notification').updateOne(
                { id_Notification: m.id },
                { 
                    $set: { 
                        type_Notification: m.type,
                        contenu_Notification: m.content
                    }
                }
            );
            console.log(`Updated notification ${m.id}`);
        }
        
        console.log('Migration complete!');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
