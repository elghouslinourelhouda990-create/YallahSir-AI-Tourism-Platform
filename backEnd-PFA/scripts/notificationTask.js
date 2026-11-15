const Match = require('../models/matchModel');
const Activite = require('../models/activiteModel');
const Notification = require('../models/notificationModel');
const Notifier = require('../models/notifierModel');

/**
 * Checks for matches and activities happening soon and creates notifications.
 */
const runNotificationTask = async () => {
    try {
        console.log('Running background notification task...');
        const today = new Date();
        const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = `${String(tomorrow.getDate()).padStart(2, '0')}/${String(tomorrow.getMonth() + 1).padStart(2, '0')}/${tomorrow.getFullYear()}`;

        // 1. Check Matches for Today
        const matchesToday = await Match.find({ date_match: todayStr });
        for (const match of matchesToday) {
            // -- A. Global Notification --
            const globalNotifId = 1000000 + match.id_match; 
            const globalExists = await Notification.findOne({ id_Notification: globalNotifId });
            
            const matchTitleFr = `${match.equipe_A.fr} vs ${match.equipe_B.fr}`;
            const matchTitleEn = `${match.equipe_A.en} vs ${match.equipe_B.en}`;
            const matchTitleAr = `${match.equipe_A.ar} vs ${match.equipe_B.ar}`;
            const matchTitleEs = `${match.equipe_A.es} vs ${match.equipe_B.es}`;

            if (!globalExists) {
                await Notification.create({
                    id_Notification: globalNotifId,
                    user_id: null,
                    type_Notification: { fr: "Match Aujourd'hui", en: "Match Today", ar: "مباراة اليوم", es: "Partido hoy" },
                    contenu_Notification: {
                        fr: `Le match ${matchTitleFr} débute aujourd'hui !`,
                        en: `The match ${matchTitleEn} starts today!`,
                        ar: `تبدأ مباراة ${matchTitleAr} اليوم!`,
                        es: `¡El partido ${matchTitleEs} comienza hoy!`
                    }
                });
            }

            // -- B. Personalized Notifications (Notifier) --
            const subscribers = await Notifier.find({ id_match: match.id_match });
            for (const sub of subscribers) {
                const userNotifId = 3000000 + match.id_match + Number(sub.ID_USER.toString().substring(0, 5) || 0); // Composite ID
                const userExists = await Notification.findOne({ id_Notification: userNotifId, user_id: sub.ID_USER });
                if (!userExists) {
                    await Notification.create({
                        id_Notification: userNotifId,
                        user_id: sub.ID_USER,
                        type_Notification: { fr: "Rappel Match", en: "Match Reminder", ar: "تذكير بالمباراة", es: "Recordatorio de partido" },
                        contenu_Notification: {
                            fr: `Votre match suivi ${matchTitleFr} va bientôt commencer !`,
                            en: `Your followed match ${matchTitleEn} is about to start!`,
                            ar: `مباراتك المتابعة ${matchTitleAr} على وشك البدء!`,
                            es: `¡Tu partido seguido ${matchTitleEs} está por comenzar!`
                        }
                    });
                }
            }
        }

        // 2. Check Activities for Today or Tomorrow
        const activitiesSoon = await Activite.find({ 
            $or: [ { date_activite: todayStr }, { date_activite: tomorrowStr } ]
        });

        for (const act of activitiesSoon) {
            const isToday = act.date_activite === todayStr;
            const globalNotifId = 2000000 + act.id_activite + (isToday ? 0 : 500000);
            const globalExists = await Notification.findOne({ id_Notification: globalNotifId });

            const actTitleFr = act.intitule_activite.fr;
            const actTitleEn = act.intitule_activite.en;
            const actTitleAr = act.intitule_activite.ar;
            const actTitleEs = act.intitule_activite.es;

            if (!globalExists) {
                const timeLabel = isToday ? { fr: "aujourd'hui", en: "today", ar: "اليوم", es: "hoy" } 
                                          : { fr: "demain", en: "tomorrow", ar: "غداً", es: "mañana" };

                await Notification.create({
                    id_Notification: globalNotifId,
                    user_id: null,
                    type_Notification: { fr: "Activité Proche", en: "Activity Nearing", ar: "نشاط قريب", es: "Actividad próxima" },
                    contenu_Notification: {
                        fr: `L'activité "${actTitleFr}" approche (${timeLabel.fr}) !`,
                        en: `The activity "${actTitleEn}" is approaching (${timeLabel.en})!`,
                        ar: `النشاط "${actTitleAr}" يقترب (${timeLabel.ar})!`,
                        es: `¡La actividad "${actTitleEs}" se acerca (${timeLabel.es})!`
                    }
                });
            }

            // Personalized for Activities
            const subscribers = await Notifier.find({ id_activite: act.id_activite });
            for (const sub of subscribers) {
                const userNotifId = 4000000 + act.id_activite + (isToday ? 0 : 500000);
                const userExists = await Notification.findOne({ id_Notification: userNotifId, user_id: sub.ID_USER });
                if (!userExists) {
                    await Notification.create({
                        id_Notification: userNotifId,
                        user_id: sub.ID_USER,
                        type_Notification: { fr: "Rappel Activité", en: "Activity Reminder", ar: "تذكير بالنشاط", es: "Recordatorio de actividad" },
                        contenu_Notification: {
                            fr: `Votre activité suivie "${actTitleFr}" arrive bientôt !`,
                            en: `Your followed activity "${actTitleEn}" is coming soon!`,
                            ar: `نشاطك المتابع "${actTitleAr}" سيبدأ قريباً!`,
                            es: `¡Tu actividad seguida "${actTitleEs}" llegará pronto!`
                        }
                    });
                }
            }
        }

    } catch (error) {
        console.error('Error in notification task:', error);
    }
};

module.exports = runNotificationTask;

