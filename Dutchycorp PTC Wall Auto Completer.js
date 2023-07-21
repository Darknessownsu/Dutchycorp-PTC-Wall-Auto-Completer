// ==UserScript==
// @name         Dutchycorp PTC Wall Auto Completer
// @version      3.0
// @description  Auto completes PTC wall tasks on DutchyCorp AutoFaucet website
// @author       Darknessownsu
// @match        https://autofaucet.dutchycorp.space/ptc/wall.php
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Helper function to wait for a specified duration
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Helper function to simulate a click event
    function simulateClick(element) {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(event);
    }

    // Function to show a floating toast notification
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
        }, 3000); // Remove the toast after 3 seconds
    }

    // Main function to auto complete PTC wall tasks
    async function completePTCWallTasks() {
        const buttons = document.querySelectorAll('button:contains("fa-eye"):not(.previously-watched)');
        const totalTasks = buttons.length;
        let completedTasks = 0;

        // Initialize progress bar
        const progressBar = document.createElement('div');
        progressBar.style.width = '0%';
        progressBar.style.height = '10px';
        progressBar.style.backgroundColor = 'blue';
        document.body.appendChild(progressBar);

        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];

            // Check if button is under the "Previously Watched Adverts" section
            const previousAdvertsSection = button.closest('h4:contains("Previously Watched Adverts")');
            if (previousAdvertsSection) {
                continue; // Skip this button and proceed to the next one
            }

            // Scroll to the button to ensure it's in view
            button.scrollIntoView();

            // Click the button
            simulateClick(button);

            // Wait for the appropriate duration
            const stopwatch = button.nextElementSibling.innerText;
            const duration = parseInt(stopwatch.match(/\d+/)[0]) * 1000;
            await sleep(duration);

            // Check if "Wait Focus.." element is present
            const waitFocus = document.querySelector('span.link-color');
            if (waitFocus && waitFocus.innerText === 'Wait Focus..') {
                // Scroll to the "Wait Focus.." element
                waitFocus.scrollIntoView();

                // Click the "Wait Focus.." element
                simulateClick(waitFocus);

                // Wait for the duration specified by stopwatch
                await sleep(duration);
            } else {
                // Click the fallback button
                const fallbackButton = document.createElement('button');
                fallbackButton.innerHTML = '<script type="text/javascript"> function submitForm() { document.getElementById("userForm").submit(); } <\/script>';
                document.body.appendChild(fallbackButton);
                simulateClick(fallbackButton);
            }

            // Go back to the original PTC wall page
            window.history.back();
            completedTasks++;

            // Update progress bar
            const progressPercentage = (completedTasks / totalTasks) * 100;
            progressBar.style.width = `${progressPercentage}%`;

            // Add a short delay before proceeding to the next task (optional)
            // await sleep(1000);
        }

        // Display completion notification using the floating toast
        const completionMessage = `All ${totalTasks} PTC wall tasks completed. Script ended.`;
        showToast(completionMessage);
        console.log(completionMessage);
    }

    // Call the main function to start auto completing tasks
    completePTCWallTasks();

    // Add a button to manually trigger the script
    const manualButton = document.createElement('button');
    manualButton.innerHTML = 'Start Auto Complete';
    manualButton.onclick = completePTCWallTasks;
    document.body.appendChild(manualButton);

})();