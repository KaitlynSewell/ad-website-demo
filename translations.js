var translations = {
    en: {
        'site-title': 'Anerobic Digestion Pathways',
        'nav-home': 'Home',
        'nav-about': 'About',
        'nav-funding': 'Funding Information',
        'nav-how': 'How does this website work?',
        'nav-what': 'What is anaerobic digestion?',
        'nav-contact': 'Contact',
        'nav-settings': 'Settings',
        'nav-sources': 'Sources',
        'settings-heading': 'Settings',
        'settings-theme': 'Theme',
        'settings-light': 'Light',
        'settings-dark': 'Dark',
        'settings-language': 'Language',
        'sources-heading': 'Sources',
        'sources-maps': 'Maps',
        'about-digestion-heading': 'What is Anaerobic Digestion?',
        'about-website-heading': 'How Does This Website Work?',
        'funding-heading': 'Funding Information',
        'advcalc-heading': 'Advanced Calculator',
        'advcalc-inputs': 'Inputs',
        'advcalc-results': 'Results',
        'btn-calculate': 'Calculate',
        'btn-advanced': 'Advanced Calculator',
        'btn-clear': 'Clear'
    },
    es: {
        'site-title': 'Vías de Digestión Anaeróbica',
        'nav-home': 'Inicio',
        'nav-about': 'Acerca de',
        'nav-funding': 'Información de Financiamiento',
        'nav-how': '¿Cómo funciona este sitio web?',
        'nav-what': '¿Qué es la digestión anaeróbica?',
        'nav-contact': 'Contacto',
        'nav-settings': 'Configuración',
        'nav-sources': 'Fuentes',
        'settings-heading': 'Configuración',
        'settings-theme': 'Tema',
        'settings-light': 'Claro',
        'settings-dark': 'Oscuro',
        'settings-language': 'Idioma',
        'sources-heading': 'Fuentes',
        'sources-maps': 'Mapas',
        'about-digestion-heading': '¿Qué es la Digestión Anaeróbica?',
        'about-website-heading': '¿Cómo Funciona Este Sitio Web?',
        'funding-heading': 'Información de Financiamiento',
        'advcalc-heading': 'Calculadora Avanzada',
        'advcalc-inputs': 'Entradas',
        'advcalc-results': 'Resultados',
        'btn-calculate': 'Calcular',
        'btn-advanced': 'Calculadora Avanzada',
        'btn-clear': 'Limpiar'
    },
    fr: {
        'site-title': 'Voies de Digestion Anaérobie',
        'nav-home': 'Accueil',
        'nav-about': 'À propos',
        'nav-funding': 'Informations de Financement',
        'nav-how': 'Comment fonctionne ce site web ?',
        'nav-what': 'Qu\'est-ce que la digestion anaérobie ?',
        'nav-contact': 'Contact',
        'nav-settings': 'Paramètres',
        'nav-sources': 'Sources',
        'settings-heading': 'Paramètres',
        'settings-theme': 'Thème',
        'settings-light': 'Clair',
        'settings-dark': 'Sombre',
        'settings-language': 'Langue',
        'sources-heading': 'Sources',
        'sources-maps': 'Cartes',
        'about-digestion-heading': 'Qu\'est-ce que la Digestion Anaérobie ?',
        'about-website-heading': 'Comment Fonctionne Ce Site Web ?',
        'funding-heading': 'Informations de Financement',
        'advcalc-heading': 'Calculateur Avancé',
        'advcalc-inputs': 'Entrées',
        'advcalc-results': 'Résultats',
        'btn-calculate': 'Calculer',
        'btn-advanced': 'Calculateur Avancé',
        'btn-clear': 'Effacer'
    },
    de: {
        'site-title': 'Anaerobe Vergärungswege',
        'nav-home': 'Startseite',
        'nav-about': 'Über',
        'nav-funding': 'Finanzierungsinformationen',
        'nav-how': 'Wie funktioniert diese Website?',
        'nav-what': 'Was ist anaerobe Vergärung?',
        'nav-contact': 'Kontakt',
        'nav-settings': 'Einstellungen',
        'nav-sources': 'Quellen',
        'settings-heading': 'Einstellungen',
        'settings-theme': 'Thema',
        'settings-light': 'Hell',
        'settings-dark': 'Dunkel',
        'settings-language': 'Sprache',
        'sources-heading': 'Quellen',
        'sources-maps': 'Karten',
        'about-digestion-heading': 'Was ist Anaerobe Vergärung?',
        'about-website-heading': 'Wie Funktioniert Diese Website?',
        'funding-heading': 'Finanzierungsinformationen',
        'advcalc-heading': 'Erweiterter Rechner',
        'advcalc-inputs': 'Eingaben',
        'advcalc-results': 'Ergebnisse',
        'btn-calculate': 'Berechnen',
        'btn-advanced': 'Erweiterter Rechner',
        'btn-clear': 'Löschen'
    }
};

function applyTranslations(lang) {
    var t = translations[lang] || translations['en'];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) {
            el.textContent = t[key];
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var lang = localStorage.getItem('language') || 'en';
    applyTranslations(lang);
});
