// ==UserScript==
// @name         Dutchycorp PTC AutoCompleter (iOS Optimized)
// @version      6.1
// @description  Auto-completes Dutchycorp PTC wall tasks with stealth on iOS-compatible userscript browsers
// @author       Darknessownsu (Upgraded by Dr. Elara Jinx)
// @match        https://autofaucet.dutchycorp.space/ptc/wall.php
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ⛔️ Anti-bot fingerprint cloaking
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'platform', { get: () => 'iPhone' });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 4 });
    Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1'
    });

    // 🧠 Memory persistence
    let learnedDurations = JSON.parse(localStorage.getItem('learnedDurations') || '[]');
    function saveMemory() {
        localStorage.setItem('learnedDurations', JSON.stringify(learnedDurations));
    }

    function jitterSleep(ms) {
        const jitter = Math.floor(Math.random() * 500 + 200);
        return new Promise(res => setTimeout(res, ms + jitter));
    }

    function simulateClick(el) {
        if (!el) return;
        el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        el.click();
    }

    function getAvgWatchTime() {
        if (!learnedDurations.length) return 7;
        return Math.ceil(learnedDurations.reduce((a, b) => a + b, 0) / learnedDurations.length);
    }

    // Minimal UI Toast
    function toast(msg) {
        const el = document.createElement('div');
        el.textContent = msg;
        Object.assign(el.style, {
            position: 'fixed', bottom: '12px', left: '50%',
            transform: 'translateX(-50%)', background: '#111',
            color: '#0ff', padding: '8px 14px', borderRadius: '5px',
            fontSize: '13px', zIndex: '9999', opacity: '0.95'
        });
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }

    async function completePTC() {
        const buttons = [...document.querySelectorAll('button')]
            .filter(b => b.querySelector('i.fa-eye') && !b.closest('h4'));

        const total = buttons.length;
        if (!total) return toast('No PTC tasks found.');

        let completed = 0;
        const progress = document.createElement('progress');
        Object.assign(progress.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '5px', zIndex: '9999'
        });
        document.body.appendChild(progress);

        for (const btn of buttons) {
            btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await jitterSleep(1000);

            simulateClick(btn);
            await jitterSleep(1000);

            const timerText = document.querySelector('.timer')?.innerText || '';
            const sec = parseInt(timerText.match(/\d+/)?.[0] || getAvgWatchTime());
            if (sec > 45) {
                toast('Task skipped — suspicious duration.');
                continue;
            }

            learnedDurations.push(sec);
            saveMemory();

            await jitterSleep(sec * 1000);

            const focus = document.querySelector('span.link-color');
            if (focus?.innerText.includes('Wait Focus')) {
                simulateClick(focus);
                await jitterSleep(sec * 1000);
            }

            const form = document.getElementById('userForm');
            if (form) form.submit();

            completed++;
            progress.value = completed / total;

            toast(`Task ${completed} of ${total} done.`);
            await jitterSleep(1200);

            location.href = '/ptc/wall.php';
            return;
        }

        toast('All tasks complete.');
    }

    // 🕵️‍♀️ Idle human simulation for iOS
    setInterval(() => {
        window.dispatchEvent(new Event('touchstart'));
        window.dispatchEvent(new Event('scroll'));
    }, 8000);

    // 🧪 Auto-start
    window.addEventListener('load', () => {
        setTimeout(completePTC, 1500);
    });
})();