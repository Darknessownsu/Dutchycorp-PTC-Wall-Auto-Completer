// ==UserScript==
// @name         Dutchycorp PTC Wall Auto Completer
// @version      4.1.1
// @description  Auto completes PTC wall tasks on DutchyCorp AutoFaucet website
// @author       Darknessownsu
// @match        https://autofaucet.dutchycorp.space/ptc/wall.php
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const progressBarHeight = '5px';
    const progressBarColor = 'blue';
    const completionMessageDisplayDuration = 3000; // 3 seconds

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function simulateClick(element) {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(event);
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        toast.style.color = '#fff';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, completionMessageDisplayDuration);
    }

    async function completePTCWallTasks() {
        try {
            const buttons = document.querySelectorAll('button:contains("fa-eye"):not(.previously-watched)');
            const totalTasks = buttons.length;
            let completedTasks = 0;

            const progressBar = document.createElement('div');
            progressBar.style.position = 'fixed';
            progressBar.style.top = '0';
            progressBar.style.left = '0';
            progressBar.style.width = '0%';
            progressBar.style.height = progressBarHeight;
            progressBar.style.backgroundColor = progressBarColor;
            document.body.appendChild(progressBar);

            for (const button of buttons) {
                const previousAdvertsSection = button.closest('h4:contains("Previously Watched Adverts")');
                if (previousAdvertsSection) {
                    continue;
                }

                button.scrollIntoView();
                simulateClick(button);

                const stopwatch = button.nextElementSibling.innerText;
                const duration = parseInt(stopwatch.match(/\d+/)[0]) * 1000;
                await sleep(duration);

                const waitFocus = document.querySelector('span.link-color');
                if (waitFocus && waitFocus.innerText === 'Wait Focus..') {
                    waitFocus.scrollIntoView();
                    simulateClick(waitFocus);
                    await sleep(duration);
                } else {
                    const fallbackButton = document.createElement('button');
                    fallbackButton.innerHTML = '<script type="text/javascript"> function submitForm() { document.getElementById("userForm").submit(); } <\/script>';
                    document.body.appendChild(fallbackButton);
                    simulateClick(fallbackButton);
                }

                window.history.back();
                completedTasks++;

                const progressPercentage = (completedTasks / totalTasks) * 100;
                progressBar.style.width = `${progressPercentage}%`;

                await sleep(1000);
            }

            const completionMessage = `All ${totalTasks} PTC wall tasks completed. Script ended.`;
            showToast(completionMessage);
            console.log(completionMessage);
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }

    completePTCWallTasks();

    const manualButton = document.createElement('button');
    manualButton.innerHTML = 'Start Auto Complete';
    manualButton.onclick = completePTCWallTasks;
    document.body.appendChild(manualButton);

})();
