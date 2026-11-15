const fs = require('fs');

const path = 'c:/Users/Administrator/Downloads/pfa (4)/pfa (3)/pfa/PFA html - Copie - Copie/translations.js';
const data = `
if (window.ui_translations) {
    if (window.ui_translations['fr']) {
        Object.assign(window.ui_translations['fr'], {
            'nav_home': 'Accueil',
            'nav_map': 'Carte',
            'nav_matches': 'Matchs',
            'nav_culture': 'Culture',
            'nav_activities': 'Activités',
            'nav_itineraries': 'Itinéraires',
            'nav_services': 'Services',
            'notifications_title': 'Notifications',
            'mark_all_read': 'Marquer tout comme lu'
        });
    }
    if (window.ui_translations['en']) {
        Object.assign(window.ui_translations['en'], {
            'nav_home': 'Home',
            'nav_map': 'Map',
            'nav_matches': 'Matches',
            'nav_culture': 'Culture',
            'nav_activities': 'Activities',
            'nav_itineraries': 'Itineraries',
            'nav_services': 'Services',
            'notifications_title': 'Notifications',
            'mark_all_read': 'Mark all as read'
        });
    }
    if (window.ui_translations['ar']) {
        Object.assign(window.ui_translations['ar'], {
            'nav_home': 'الرئيسية',
            'nav_map': 'الخريطة',
            'nav_matches': 'المباريات',
            'nav_culture': 'الثقافة',
            'nav_activities': 'الأنشطة',
            'nav_itineraries': 'المسارات',
            'nav_services': 'الخدمات',
            'notifications_title': 'الإشعارات',
            'mark_all_read': 'تحديد الكل كمقروء'
        });
    }
    if (window.ui_translations['es']) {
        Object.assign(window.ui_translations['es'], {
            'nav_home': 'Inicio',
            'nav_map': 'Mapa',
            'nav_matches': 'Partidos',
            'nav_culture': 'Cultura',
            'nav_activities': 'Actividades',
            'nav_itineraries': 'Itinerarios',
            'nav_services': 'Servicios',
            'notifications_title': 'Notificaciones',
            'mark_all_read': 'Marcar todo como leído'
        });
    }
}
`;
fs.appendFileSync(path, data, 'utf8');
console.log('Appended successfully');
