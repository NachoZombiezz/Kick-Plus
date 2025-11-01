// Countdown Timer JavaScript

let timeRemaining = 0;
let totalTime = 0;
let timerInterval = null;
let isRunning = false;

// Google Fonts
const GOOGLE_API_KEY = 'AIzaSyCKNv8ZeEwFZIT6wBQAl6E5OqsXrklIh60';
let allFonts = [];
let selectedFont = 'Inter';
window.selectedFont = selectedFont;

// DOM Elements
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const fontSearchInput = document.getElementById('fontSearch');
const fontDropdown = document.getElementById('fontDropdown');
const textColorInput = document.getElementById('textColor');
const bgColorInput = document.getElementById('bgColor');
const bgToggle = document.getElementById('bgToggle');
const fontSizeInput = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const overlayUrlInput = document.getElementById('overlayUrl');
const previewTimer = document.getElementById('previewTimer');
const previewDisplay = document.getElementById('previewDisplay');
const previewTopText = document.getElementById('previewTopText');
const previewBottomText = document.getElementById('previewBottomText');

// Google Fonts functions
function renderFontDropdown(filter = '') {
    fontDropdown.innerHTML = '';
    const filtered = allFonts.filter(f => f.family.toLowerCase().includes(filter.toLowerCase()));
    
    if (filtered.length === 0) {
        fontDropdown.innerHTML = '<div style="padding:8px;">No fonts found.</div>';
        return;
    }
    
    filtered.forEach(font => {
        const item = document.createElement('div');
        item.textContent = font.family;
        item.style.fontFamily = `'${font.family}', Arial, sans-serif`;
        
        if (font.family === selectedFont) {
            item.style.background = 'var(--bg-tertiary)';
        }
        
        item.addEventListener('mousedown', () => {
            selectedFont = font.family;
            window.selectedFont = font.family;
            fontSearchInput.value = font.family;
            fontDropdown.style.display = 'none';
            updatePreview();
            updateOverlayUrl();
        });
        
        fontDropdown.appendChild(item);
    });
}

async function fetchGoogleFonts() {
    const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_API_KEY}&sort=alpha`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.items) {
            allFonts = data.items;
            renderFontDropdown();
        }
    } catch (e) {
        fontDropdown.innerHTML = '<div style="padding:8px;">Could not load fonts.</div>';
    }
}

// Initialize
function init() {
    fetchGoogleFonts();
    updateOverlayUrl();
    updatePreview();
    calculateTotalTime();
}

// Calculate total time in seconds
function calculateTotalTime() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    totalTime = (hours * 3600) + (minutes * 60) + seconds;
    timeRemaining = totalTime;
}

// Update preview display
function updatePreview() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    
    const displayTime = 
        String(hours).padStart(2, '0') + ':' + 
        String(minutes).padStart(2, '0') + ':' + 
        String(seconds).padStart(2, '0');
    
    previewTimer.textContent = displayTime;
    previewTimer.style.color = textColorInput.value;
    previewTimer.style.fontSize = fontSizeInput.value + 'px';
    
    // Apply font
    const font = window.selectedFont || 'Inter';
    previewTimer.style.fontFamily = `'${font}', Arial, sans-serif`;
    previewTopText.style.fontFamily = `'${font}', Arial, sans-serif`;
    previewBottomText.style.fontFamily = `'${font}', Arial, sans-serif`;
    
    // Load Google Font
    if (font && font !== 'Inter') {
        const googleFontName = font.replace(/ /g, '+');
        let fontLink = document.getElementById('googleFontLink');
        if (!fontLink) {
            fontLink = document.createElement('link');
            fontLink.id = 'googleFontLink';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }
        fontLink.href = `https://fonts.googleapis.com/css?family=${googleFontName}:400,700,800&display=swap`;
    }
    
    // Update background color based on toggle
    if (bgToggle.checked) {
        previewDisplay.style.backgroundColor = bgColorInput.value;
    } else {
        previewDisplay.style.backgroundColor = 'transparent';
    }
    
    // Update custom text
    previewTopText.textContent = topTextInput.value;
    previewBottomText.textContent = bottomTextInput.value;
    previewTopText.style.color = textColorInput.value;
    previewBottomText.style.color = textColorInput.value;
}

// Update overlay URL
function updateOverlayUrl() {
    const hours = hoursInput.value;
    const minutes = minutesInput.value;
    const seconds = secondsInput.value;
    const textColor = textColorInput.value.replace('#', '');
    const bgColor = bgToggle.checked ? bgColorInput.value.replace('#', '') : 'transparent';
    const fontSize = fontSizeInput.value;
    const font = encodeURIComponent(window.selectedFont || 'Inter');
    const topText = encodeURIComponent(topTextInput.value);
    const bottomText = encodeURIComponent(bottomTextInput.value);
    
    const baseUrl = window.location.href.replace('index.html', 'overlay.html');
    const url = `${baseUrl}?h=${hours}&m=${minutes}&s=${seconds}&tc=${textColor}&bg=${bgColor}&fs=${fontSize}&font=${font}&tt=${topText}&bt=${bottomText}&auto=1`;
    
    overlayUrlInput.value = url;
}

// Start timer
function startTimer() {
    if (isRunning) return;
    
    calculateTotalTime();
    
    if (totalTime === 0) {
        alert('Please set a time greater than 0!');
        return;
    }
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
        } else {
            finishTimer();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Reset timer
function resetTimer() {
    pauseTimer();
    calculateTotalTime();
    updateTimerDisplay();
    previewTimer.classList.remove('finished');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Finish timer
function finishTimer() {
    pauseTimer();
    previewTimer.textContent = 'STARTING NOW!';
    previewTimer.style.animation = 'flash 1s ease-in-out infinite';
}

// Update timer display
function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    const displayTime = 
        String(hours).padStart(2, '0') + ':' + 
        String(minutes).padStart(2, '0') + ':' + 
        String(seconds).padStart(2, '0');
    
    previewTimer.textContent = displayTime;
    previewTimer.style.animation = 'none';
}

// Copy URL to clipboard
function copyUrl() {
    overlayUrlInput.select();
    overlayUrlInput.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(overlayUrlInput.value).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = 'linear-gradient(135deg, var(--secondary-color), var(--secondary-hover))';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy URL. Please copy manually.');
    });
}

// Event Listeners
hoursInput.addEventListener('input', () => {
    if (!isRunning) {
        updatePreview();
        updateOverlayUrl();
    }
});

minutesInput.addEventListener('input', () => {
    if (!isRunning) {
        updatePreview();
        updateOverlayUrl();
    }
});

secondsInput.addEventListener('input', () => {
    if (!isRunning) {
        updatePreview();
        updateOverlayUrl();
    }
});

topTextInput.addEventListener('input', () => {
    updatePreview();
    updateOverlayUrl();
});

bottomTextInput.addEventListener('input', () => {
    updatePreview();
    updateOverlayUrl();
});

fontSearchInput.addEventListener('input', (e) => {
    renderFontDropdown(e.target.value);
    fontDropdown.style.display = 'block';
});

fontSearchInput.addEventListener('focus', () => {
    renderFontDropdown(fontSearchInput.value);
    fontDropdown.style.display = 'block';
});

fontSearchInput.addEventListener('blur', () => {
    setTimeout(() => fontDropdown.style.display = 'none', 150);
});

textColorInput.addEventListener('input', () => {
    updatePreview();
    updateOverlayUrl();
});

bgToggle.addEventListener('change', () => {
    bgColorInput.disabled = !bgToggle.checked;
    updatePreview();
    updateOverlayUrl();
});

bgColorInput.addEventListener('input', () => {
    updatePreview();
    updateOverlayUrl();
});

fontSizeInput.addEventListener('input', () => {
    fontSizeValue.textContent = fontSizeInput.value + 'px';
    updatePreview();
    updateOverlayUrl();
});

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Add flash animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);

// Initialize on load
init();
