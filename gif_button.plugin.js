/**
 * @name GifButton
 * @description A plugin that hides GIFs in Discord and adds a button to toggle their visibility.
 * @version 1.0.0
 * @author bora
 */

class GifBlocker {
    constructor() {
        this.config = {
            info: {
                name: "GifButton",
                authors: [
                    {
                        name: "bora_.",
                        discord_id: "315871450869530624",
                    }
                ],
                description: "Hides GIFs in Discord and adds a button to toggle their visibility."
            },
            defaultConfig: [
                {
                    type: "switch",
                    id: "enablePlugin",
                    name: "Enable Plugin",
                    note: "Enable or disable the GIF blocker.",
                    value: true // Default state
                }
            ]
        };

        // Load settings from local storage or use default config
        this.settings = this.loadSettings();

        // MutationObserver will be initialized when the plugin starts
        this.observer = null;
    }

    // Load settings from Discord's local storage
    loadSettings() {
        return BdApi.loadData(this.config.info.name, "settings") || this.config.defaultConfig;
    }

    // Save settings to Discord's local storage
    saveSettings() {
        BdApi.saveData(this.config.info.name, "settings", this.settings);
    }

    // Start the plugin and observe DOM changes if the plugin is enabled
    start() {
        if (this.settings[0].value) {
            this.initObserver();
        }
    }

    // Stop the plugin
    stop() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    // Initialize the MutationObserver to watch for GIFs in the Discord DOM
    initObserver() {
        const observerCallback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    this.hideDiscordGifs(); // call hideDiscordGifs whenever there's a DOM change
                }
            }
        };

        const observerOptions = {
            childList: true,
            subtree: true // Observe all child elements
        };

        // Start observing the body of the document for changes
        this.observer = new MutationObserver(observerCallback);
        this.observer.observe(document.body, observerOptions);

        // Hide GIFs initially when the plugin starts
        this.hideDiscordGifs(); 
    }


    hideDiscordGifs() {
        // Select all GIF images in Discord's message content
        const gifElements = document.querySelectorAll('div[class*="imageContent"] img[src*=".gif"], div[class*="imageContent"] video[src*=".mp4"]');

        gifElements.forEach((element) => {
            const gifContainer = element.closest('div[class*="imageContent"]');

            // Check if the "View GIF" button already exists
            let viewButton = gifContainer.querySelector('.view-gif-button');

            if (!viewButton) {
                // Create the "View GIF" button
                viewButton = document.createElement('button');
                viewButton.textContent = 'View GIF';
                viewButton.className = 'view-gif-button';

                // Style the button
                viewButton.style.display = 'block';
                viewButton.style.margin = '10px 0';
                viewButton.style.cursor = 'pointer';
                viewButton.style.backgroundColor = '#42464D';
                viewButton.style.color = '#FFFFFF';
                viewButton.style.border = 'none';
                viewButton.style.borderRadius = '5px';
                viewButton.style.padding = '15px';
                viewButton.style.fontSize = '16px';
                viewButton.style.width = '100%';
                viewButton.style.transition = 'background 0.3s';

                // Hover
                viewButton.onmouseover = () => {
                    viewButton.style.backgroundColor = '#5B5E66';
                };

                viewButton.onmouseout = () => {
                    viewButton.style.backgroundColor = '#42464D';
                };

                // Toggle visibility of the GIF on button click
                viewButton.onclick = () => {
                    const gifMedia = gifContainer.querySelector('img[src*=".gif"], video[src*=".mp4"]');
                    if (gifMedia.style.display === 'none') {
                        gifMedia.style.display = 'block';
                        viewButton.textContent = 'Hide GIF'; // Change button text to "Hide GIF"
                    } else {
                        gifMedia.style.display = 'none'; 
                        viewButton.textContent = 'View GIF'; // Change button text back to "View GIF"
                    }
                };

                // Initially hide the GIF 
                const gifMedia = gifContainer.querySelector('img[src*=".gif"], video[src*=".mp4"]');
                if (gifMedia) {
                    gifMedia.style.display = 'none';
                }

                
                gifContainer.appendChild(viewButton);
            }
        });
    }

    // Create the settings panel for enabling/disabling the plugin
    getSettingsPanel() {
        const panel = document.createElement('div');

        const enableSwitch = document.createElement('input');
        enableSwitch.type = 'checkbox';
        enableSwitch.checked = this.settings[0].value;

        // Toggle plugin enable/disable state when the switch is changed
        enableSwitch.addEventListener('change', () => {
            this.settings[0].value = enableSwitch.checked;
            this.saveSettings();
            if (enableSwitch.checked) {
                this.start(); // Restart the plugin if enabled
            } else {
                this.stop(); // Stop the plugin if disabled
            }
        });

        const label = document.createElement('label');
        label.textContent = "Enable Plugin";
        label.appendChild(enableSwitch);

        panel.appendChild(label);

        return panel;
    }
}

module.exports = GifBlocker;

