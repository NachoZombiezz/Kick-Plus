// Social Rotator JavaScript

// DOM Elements
let overlayColorInput, overlayBgInput, bgEnabledCheckbox, fontSearchInput;
let rotationTimingSlider, rotationTimingInput, overlayPreview, overlayUrlInput, handlesContainer;
let fontDropdown;

// Google Fonts
const GOOGLE_API_KEY = 'AIzaSyCKNv8ZeEwFZIT6wBQAl6E5OqsXrklIh60';
let allFonts = [];
let selectedFont = 'Roboto';
window.selectedFont = selectedFont;

// Brand colors for social platforms
const brandColors = {
    Facebook: '#1877F3',
    Instagram: '#E4405F',
    TikTok: '#FFFFFF',
    YouTube: '#FF0000',
    Discord: '#5865F2',
    X: '#FFFFFF',
    Kick: '#53FC19',
    Rumble: '#1ABF3F',
    Twitch: '#9146FF',
    Snapchat: '#FFFC00',
    Bluesky: '#1186DC',
    OnlyFans: '#00AFF0'
};

function getBrandColor(platform) {
    return brandColors[platform] || '#ffffff';
}

// Update preview in real-time
function updatePreview() {
    const color = overlayColorInput.value;
    const bg = overlayBgInput.value;
    const font = window.selectedFont || 'Roboto';
    const timing = rotationTimingInput.value;
    const bgEnabled = bgEnabledCheckbox.checked ? '1' : '0';
    
    // Load Google Font
    if (font) {
        const googleFontName = font.replace(/ /g, '+');
        let fontLink = document.getElementById('googleFontLink');
        if (!fontLink) {
            fontLink = document.createElement('link');
            fontLink.id = 'googleFontLink';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }
        fontLink.href = `https://fonts.googleapis.com/css?family=${googleFontName}:400,700&display=swap`;
    }
    
    // Collect handles
    const handleRows = handlesContainer.querySelectorAll('.handle-row');
    const handles = Array.from(handleRows).map(row => ({
        platform: row.querySelector('.platform').value,
        handle: row.querySelector('.handle').value,
        iconColor: row.querySelector('.icon-color').value
    }));
    
    const handlesParam = encodeURIComponent(JSON.stringify(handles));
    
    // Generate full URL path like Countdown Timer
    const baseUrl = window.location.href.replace('index.html', 'rotator-overlay.html');
    const url = `${baseUrl}?color=${encodeURIComponent(color)}&bg=${encodeURIComponent(bg)}&font=${encodeURIComponent(font)}&timing=${encodeURIComponent(timing)}&handles=${handlesParam}&bgEnabled=${bgEnabled}`;
    
    overlayPreview.src = url;
    overlayUrlInput.value = url;
}

// Copy URL to clipboard
function copyOverlayUrl() {
    overlayUrlInput.select();
    overlayUrlInput.setSelectionRange(0, 99999);
    
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

// Add handle row
function addHandle() {
    const div = document.createElement('div');
    div.className = 'handle-row';
    div.innerHTML = `
        <select class='platform'>
            <option value='Bluesky'>Bluesky</option>
            <option value='Discord'>Discord</option>
            <option value='Facebook'>Facebook</option>
            <option value='Instagram'>Instagram</option>
            <option value='Kick'>Kick</option>
            <option value='OnlyFans'>OnlyFans</option>
            <option value='Rumble'>Rumble</option>
            <option value='Snapchat'>Snapchat</option>
            <option value='TikTok'>TikTok</option>
            <option value='Twitch'>Twitch</option>
            <option value='X'>X</option>
            <option value='YouTube'>YouTube</option>
        </select>
        <input type='text' class='handle' placeholder='@yourhandle'>
        <input type='color' class='icon-color' value='#ffffff' title='Icon Color'>
        <div class='icon-color-dropdown'>
            <select class='icon-color-mode'>
                <option value='brand' selected>Brand Color</option>
                <option value='custom'>Custom</option>
            </select>
        </div>
        <button type='button' class='remove-handle' onclick='removeHandle(this)'>Remove</button>
    `;
    handlesContainer.appendChild(div);
    attachHandleListeners(div);
}

// Remove handle row
function removeHandle(btn) {
    btn.parentElement.remove();
    updatePreview();
}

// Google Fonts dropdown functionality
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
        item.style.padding = '8px 12px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid #333';
        
        if (font.family === selectedFont) {
            item.style.background = '#444';
        }
        
        item.addEventListener('mousedown', () => {
            selectedFont = font.family;
            window.selectedFont = font.family;
            fontSearchInput.value = font.family;
            fontDropdown.style.display = 'none';
            renderFontDropdown(fontSearchInput.value);
            updatePreview();
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

// Update icon color dropdowns based on mode (brand/custom)
function updateIconColorDropdowns() {
    handlesContainer.querySelectorAll('.handle-row').forEach(row => {
        const platformSelect = row.querySelector('.platform');
        const colorInput = row.querySelector('.icon-color');
        const modeSelect = row.querySelector('.icon-color-mode');
        
        modeSelect.onchange = () => {
            if (modeSelect.value === 'brand') {
                colorInput.value = getBrandColor(platformSelect.value);
                colorInput.disabled = true;
            } else {
                colorInput.disabled = false;
            }
            updatePreview();
        };
        
        platformSelect.onchange = () => {
            if (modeSelect.value === 'brand') {
                colorInput.value = getBrandColor(platformSelect.value);
            }
            updatePreview();
        };
        
        // Initial state
        if (modeSelect.value === 'brand') {
            colorInput.value = getBrandColor(platformSelect.value);
            colorInput.disabled = true;
        }
    });
}

// Attach event listeners to handle row inputs
function attachHandleListeners(row) {
    const platformSelect = row.querySelector('.platform');
    const handleInput = row.querySelector('.handle');
    const colorInput = row.querySelector('.icon-color');
    const modeSelect = row.querySelector('.icon-color-mode');
    
    platformSelect.addEventListener('change', () => {
        if (modeSelect.value === 'brand') {
            colorInput.value = getBrandColor(platformSelect.value);
        }
        updatePreview();
    });
    
    handleInput.addEventListener('input', updatePreview);
    colorInput.addEventListener('input', updatePreview);
    
    modeSelect.addEventListener('change', () => {
        if (modeSelect.value === 'brand') {
            colorInput.value = getBrandColor(platformSelect.value);
            colorInput.disabled = true;
        } else {
            colorInput.disabled = false;
        }
        updatePreview();
    });
    
    // Set initial brand color
    if (modeSelect.value === 'brand') {
        colorInput.value = getBrandColor(platformSelect.value);
        colorInput.disabled = true;
    }
}

// Initialize - Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    overlayColorInput = document.getElementById('overlayColor');
    overlayBgInput = document.getElementById('overlayBg');
    bgEnabledCheckbox = document.getElementById('bgEnabled');
    fontSearchInput = document.getElementById('fontSearch');
    rotationTimingSlider = document.getElementById('rotationTimingSlider');
    rotationTimingInput = document.getElementById('rotationTiming');
    overlayPreview = document.getElementById('overlayPreview');
    overlayUrlInput = document.getElementById('overlayUrl');
    handlesContainer = document.getElementById('handles');
    fontDropdown = document.getElementById('fontDropdown');
    
    // Color inputs - live update
    overlayColorInput.addEventListener('input', updatePreview);
    overlayBgInput.addEventListener('input', updatePreview);
    bgEnabledCheckbox.addEventListener('change', updatePreview);
    
    // Timing inputs - sync slider and number input with live update
    rotationTimingSlider.addEventListener('input', function() {
        rotationTimingInput.value = rotationTimingSlider.value;
        updatePreview();
    });
    
    rotationTimingInput.addEventListener('input', function() {
        let val = Math.max(500, Math.min(25000, parseInt(rotationTimingInput.value, 10) || 3000));
        rotationTimingInput.value = val;
        rotationTimingSlider.value = val;
        updatePreview();
    });
    
    // Font search input
    fontSearchInput.addEventListener('input', e => {
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
    
    // Attach listeners to existing handle rows
    handlesContainer.querySelectorAll('.handle-row').forEach(row => {
        attachHandleListeners(row);
    });
    
    // Initialize icon color dropdowns
    updateIconColorDropdowns();
    
    // Fetch Google Fonts
    fetchGoogleFonts();
    
    // Initial preview
    updatePreview();
});
