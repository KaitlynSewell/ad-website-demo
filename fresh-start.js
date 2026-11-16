// Fresh start: when the site is opened again (a new tab, a restored tab, or coming back after leaving
// the site), clear the user's map selections and open the home page. Moving between the site's pages,
// opening one of its links in a new tab, and refreshing the page keep the selections.
// Load this first in <head>, before any script that reads saved selections.
(function () {
    var HOME = 'advanced-calculator-2.html';
    var GAP_MS = 30000;   // longer than this since the site's last page closed = a new visit
    // Saved selections. Settings-page preferences (theme, textSize, language) are kept. Only this site's
    // keys are removed: other sites on the same github.io address share this storage.
    var KEYS = ['legendState', 'powerplantTypes', 'prevPage'], PREFIX = 'ac2';
    var SESSION_KEYS = ['legendOpened'];

    function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

    function clearSelections() {
        try {
            var drop = [];
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && (k.indexOf(PREFIX) === 0 || KEYS.indexOf(k) !== -1)) drop.push(k);
            }
            drop.forEach(function (k) { localStorage.removeItem(k); });
        } catch (e) {}
        try { SESSION_KEYS.forEach(function (k) { sessionStorage.removeItem(k); }); } catch (e) {}
    }
    function onHome() {
        var page = location.pathname.split('/').pop();
        return page === '' || page === 'index.html' || page === HOME;
    }
    function fromThisSite() {
        try {
            var r = new URL(document.referrer);
            var base = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
            return r.origin === location.origin && r.pathname.indexOf(base) === 0;
        } catch (e) { return false; }
    }
    function stale() {
        var hid = Number(sget('adHiddenAt')) || 0;
        return hid > 0 && Date.now() - hid > GAP_MS;
    }
    // inMemory: the page came back from the browser's back/forward cache, so its old state is still showing
    function freshStart(inMemory) {
        clearSelections();
        sset('adVisit', '1');
        sset('adHiddenAt', '');
        if (!onHome()) location.replace(HOME);
        else if (inMemory) location.reload();
    }

    var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
    if (sget('adVisit') !== '1') {
        // First page in this tab: a fresh visit unless it was opened from one of the site's own links
        if (fromThisSite() && nav.type !== 'back_forward') sset('adVisit', '1');
        else freshStart(false);
    } else if (stale() && nav.type !== 'reload') {
        freshStart(false);   // tab restored or returned to the site after a while
    }

    window.addEventListener('pageshow', function (e) {
        if (e.persisted && stale()) freshStart(true);
    });
    window.addEventListener('pagehide', function () { sset('adHiddenAt', String(Date.now())); });
})();
