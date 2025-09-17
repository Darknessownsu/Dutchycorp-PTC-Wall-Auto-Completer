// ==UserScript==
// @name         Dutchycorp PTC Stealth AutoCompleter
// @version      5.9
// @description  Auto-completes PTC wall tasks silently, with stealth behaviors.
// @author       Darknessownsu
// @match        https://autofaucet.dutchycorp.space/ptc/wall.php
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Anti-bot fingerprint cloaking
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

    // Toast display
    const toast = msg => {
        const el = document.createElement('div');
        el.textContent = msg;
        Object.assign(el.style, {
            position: 'fixed', bottom: '20px', left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)', color: '#fff',
            padding: '10px 18px', borderRadius: '6px',
            fontSize: '13px', zIndex: '9999'
        });
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    };

    function jitterSleep(ms) {
        const jitter = Math.floor(Math.random() * 900 + 300);
        return new Promise(res => setTimeout(res, ms + jitter));
    }

    function simulateClick(el) {
        if (!el) return;
        if (Math.random() < 0.06) {
            const all = [...document.querySelectorAll('button')];
            const randomBtn = all[Math.floor(Math.random() * all.length)];
            if (randomBtn && randomBtn !== el) {
                randomBtn.click();
                console.log('[Misclick simulation triggered]');
                return;
            }
        }
        el.click();
    }

    let learnedDurations = [];

    function getAvgWatchTime() {
        if (!learnedDurations.length) return 7;
        return Math.ceil(learnedDurations.reduce((a, b) => a + b, 0) / learnedDurations.length);
    }

    async function completePTC() {
        const buttons = [...document.querySelectorAll('button')]
            .filter(b => b.querySelector('i.fa-eye') && !b.closest('h4'));

        const total = buttons.length;
        if (!total) return toast('No PTC tasks found.');

        let completed = 0;

        const bar = document.createElement('div');
        Object.assign(bar.style, {
            position: 'fixed', top: '0', left: '0',
            height: '4px', width: '0%',
            backgroundColor: '#0ff', zIndex: '9999',
            transition: 'width 0.4s ease'
        });
        document.body.appendChild(bar);

        for (const btn of buttons) {
            btn.scrollIntoView({ behavior: 'smooth' });
            await jitterSleep(1200);
            simulateClick(btn);
            await jitterSleep(1000);

            const timerText = document.querySelector('.timer')?.innerText || '';
            const sec = parseInt(timerText.match(/\d+/)?.[0] || getAvgWatchTime());
            if (sec > 45) {
                toast('Task skipped due to suspicious duration.');
                continue;
            }

            learnedDurations.push(sec);
            await jitterSleep(sec * 1000);

            const focus = document.querySelector('span.link-color');
            if (focus?.innerText.includes('Wait Focus')) {
                simulateClick(focus);
                await jitterSleep(sec * 1000);
            }

            const form = document.getElementById('userForm');
            if (form) form.submit();

            completed++;
            bar.style.width = `${(completed / total) * 100}%`;
            toast(`Task ${completed} of ${total} completed.`);
            await jitterSleep(800);

            location.href = '/ptc/wall.php';
            return;
        }

        toast('All tasks completed.');
    }

    // Auto-start on page load
    window.addEventListener('load', () => {
        setTimeout(completePTC, 1500);
    });

})();