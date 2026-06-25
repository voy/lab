// ==UserScript==
// @name         clubkonzepte24 — class filter
// @match        *://*.clubkonzepte24.de/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

const CARD  = 'div.padding-right-kurs';
const TITLE = 'div.ng-binding';

function getTerms() {
    return GM_getValue('hidden_terms', '')
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
}

function filter() {
    const terms = getTerms();
    document.querySelectorAll(CARD).forEach(card => {
        const title = card.querySelector(TITLE);
        if (!title) return;
        const text = title.innerText.toLowerCase();
        const hide = terms.length > 0 && terms.some(t => text.includes(t));
        card.style.display = hide ? 'none' : '';
    });
}

GM_registerMenuCommand('Configure hidden terms…', () => {
    const current = GM_getValue('hidden_terms', '');
    const input = prompt(
        'Comma-separated terms to hide (e.g. kids,teens,junior)\nLeave empty to show everything:',
        current
    );
    if (input !== null) {
        GM_setValue('hidden_terms', input);
        filter();
    }
});

new MutationObserver(filter).observe(document.body, { childList: true, subtree: true });
