// Hype Tool JavaScript

let kickEventListener = null;
let connectionStatusInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    const channelNameInput = document.getElementById('channel-name');
    const barPositionSelect = document.getElementById('bar-position');
    const displayDurationInput = document.getElementById('display-duration');
    const enableSubsCheckbox = document.getElementById('enable-subs');
    const enableGiftSubsCheckbox = document.getElementById('enable-gift-subs');
    const enableGiftsCheckbox = document.getElementById('enable-gifts');
    const saveSettingsBtn = document.getElementById('save-settings');
    const testHypeBtn = document.getElementById('test-hype');
    const overlayUrlInput = document.getElementById('overlay-url');
    const copyUrlBtn = document.getElementById('copy-url');
    
    // Test buttons
    const testSubBtn = document.getElementById('test-sub');
    const testGiftSubBtn = document.getElementById('test-gift-sub');
    const testGiftBtn = document.getElementById('test-gift');

    // Load saved settings
    loadSettings();
    
    // Auto-connect if channel name is saved
    const savedSettings = localStorage.getItem('hypeSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.channelName) {
            connectToKick(settings.channelName);
        }
    }

    // Generate overlay URL
    const currentUrl = window.location.href;
    const overlayUrl = currentUrl.replace('index.html', 'overlay.html');
    overlayUrlInput.value = overlayUrl;

    // Save Settings
    saveSettingsBtn.addEventListener('click', async function() {
        const settings = {
            channelName: channelNameInput.value.trim(),
            barPosition: barPositionSelect.value,
            displayDuration: parseInt(displayDurationInput.value),
            enableSubs: enableSubsCheckbox.checked,
            enableGiftSubs: enableGiftSubsCheckbox.checked,
            enableGifts: enableGiftsCheckbox.checked
        };

        if (settings.channelName === '') {
            alert('Please enter your Kick channel name!');
            return;
        }

        localStorage.setItem('hypeSettings', JSON.stringify(settings));
        
        saveSettingsBtn.textContent = 'Connecting...';
        saveSettingsBtn.disabled = true;
        
        // Connect to Kick
        const connected = await connectToKick(settings.channelName);
        
        if (connected) {
            saveSettingsBtn.textContent = '✓ Connected & Saved!';
            saveSettingsBtn.style.background = '#45d614';
        } else {
            saveSettingsBtn.textContent = '✗ Connection Failed';
            saveSettingsBtn.style.background = '#ff4444';
        }
        
        setTimeout(() => {
            saveSettingsBtn.textContent = 'Save Settings';
            saveSettingsBtn.style.background = '';
            saveSettingsBtn.disabled = false;
        }, 3000);
    });

    // Test Buttons
    testSubBtn.addEventListener('click', function() {
        triggerTestEvent('sub', 'TestUser', 1);
    });

    testGiftSubBtn.addEventListener('click', function() {
        triggerTestEvent('gift-sub', 'TestGifter', 5);
    });

    testGiftBtn.addEventListener('click', function() {
        triggerTestEvent('gift', 'TestViewer', 100);
    });

    testHypeBtn.addEventListener('click', function() {
        const randomTests = ['sub', 'gift-sub', 'gift'];
        const randomType = randomTests[Math.floor(Math.random() * randomTests.length)];
        triggerTestEvent(randomType, 'RandomUser', Math.floor(Math.random() * 10) + 1);
    });

    // Copy URL Button
    copyUrlBtn.addEventListener('click', function() {
        overlayUrlInput.select();
        document.execCommand('copy');
        
        copyUrlBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyUrlBtn.textContent = 'Copy URL';
        }, 2000);
    });

    function loadSettings() {
        const savedSettings = localStorage.getItem('hypeSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            channelNameInput.value = settings.channelName || '';
            barPositionSelect.value = settings.barPosition || 'top';
            displayDurationInput.value = settings.displayDuration || 5;
            enableSubsCheckbox.checked = settings.enableSubs !== false;
            enableGiftSubsCheckbox.checked = settings.enableGiftSubs !== false;
            enableGiftsCheckbox.checked = settings.enableGifts !== false;
        }
    }

    async function connectToKick(channelName) {
        try {
            // Disconnect existing connection if any
            if (kickEventListener) {
                kickEventListener.disconnect();
            }

            // Create new event listener
            kickEventListener = new KickEventListener(channelName);
            
            // Initialize connection
            const success = await kickEventListener.initialize();
            
            if (success) {
                console.log('✓ Connected to Kick channel:', channelName);
                updateConnectionStatus(true);
                return true;
            } else {
                console.error('✗ Failed to connect to Kick channel');
                updateConnectionStatus(false);
                return false;
            }
        } catch (error) {
            console.error('Error connecting to Kick:', error);
            updateConnectionStatus(false);
            return false;
        }
    }

    function updateConnectionStatus(connected) {
        const statusIndicator = document.getElementById('connection-status');
        if (statusIndicator) {
            statusIndicator.textContent = connected ? '🟢 Connected' : '🔴 Disconnected';
            statusIndicator.style.color = connected ? '#45d614' : '#ff4444';
        }
    }

    function triggerTestEvent(type, username, amount) {
        const event = {
            type: type,
            username: username,
            amount: amount,
            timestamp: Date.now()
        };

        localStorage.setItem('hypeEvent', JSON.stringify(event));
        
        // Visual feedback
        const btn = event.type === 'sub' ? testSubBtn : 
                    event.type === 'gift-sub' ? testGiftSubBtn : testGiftBtn;
        const originalText = btn.textContent;
        btn.textContent = 'Triggered!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }
});
