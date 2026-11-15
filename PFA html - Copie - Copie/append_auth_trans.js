const fs = require('fs');

let text = fs.readFileSync('translations.js', 'utf8');

text += `
if (window.ui_translations) {
    if (window.ui_translations['fr']) {
        Object.assign(window.ui_translations['fr'], {
            'login_btn': 'Connexion',
            'signup_btn': "S\\'inscrire"
        });
    }
    if (window.ui_translations['en']) {
        Object.assign(window.ui_translations['en'], {
            'login_btn': 'Log in',
            'signup_btn': 'Sign up'
        });
    }
    if (window.ui_translations['ar']) {
        Object.assign(window.ui_translations['ar'], {
            'login_btn': 'تسجيل الدخول',
            'signup_btn': 'إنشاء حساب'
        });
    }
    if (window.ui_translations['es']) {
        Object.assign(window.ui_translations['es'], {
            'login_btn': 'Iniciar sesión',
            'signup_btn': 'Registrarse'
        });
    }
}
`;

fs.writeFileSync('translations.js', text, 'utf8');
console.log('Appended translations!');
