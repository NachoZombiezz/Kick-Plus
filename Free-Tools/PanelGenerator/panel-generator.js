// Panel Generator JavaScript

// Google Fonts API
const GOOGLE_API_KEY = 'AIzaSyCKNv8ZeEwFZIT6wBQAl6E5OqsXrklIh60';
const GOOGLE_FONTS_API = `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_API_KEY}&sort=popularity`;
let allFonts = [];
let selectedFont = 'Inter';
window.selectedFont = selectedFont;

// DOM Elements
let canvas, ctx;
let customWidthInput, customHeightInput, applyCustomSizeBtn;
let bgTypeSelect, bgColor1Input, bgColor2Input, gradientAngleInput, angleValueSpan, bgImageInput;
let mainTextInput, subTextInput, textColorInput, fontSizeInput, fontSizeValueSpan, textAlignSelect, textShadowCheckbox;
let borderEnabledCheckbox, borderColorInput, borderWidthInput, borderWidthValueSpan, borderRadiusInput, radiusValueSpan;
let downloadBtn, currentSizeSpan;
let fontSearchInput, fontDropdown;

// Canvas settings
let canvasWidth = 320;
let canvasHeight = 100;
let uploadedImage = null;

// Initialize
function init() {
    // Get DOM elements
    canvas = document.getElementById('previewCanvas');
    ctx = canvas.getContext('2d');
    
    customWidthInput = document.getElementById('customWidth');
    customHeightInput = document.getElementById('customHeight');
    applyCustomSizeBtn = document.getElementById('applyCustomSize');
    
    bgTypeSelect = document.getElementById('bgType');
    bgColor1Input = document.getElementById('bgColor1');
    bgColor2Input = document.getElementById('bgColor2');
    gradientAngleInput = document.getElementById('gradientAngle');
    angleValueSpan = document.getElementById('angleValue');
    bgImageInput = document.getElementById('bgImage');
    
    mainTextInput = document.getElementById('mainText');
    subTextInput = document.getElementById('subText');
    textColorInput = document.getElementById('textColor');
    fontSizeInput = document.getElementById('fontSize');
    fontSizeValueSpan = document.getElementById('fontSizeValue');
    textAlignSelect = document.getElementById('textAlign');
    textShadowCheckbox = document.getElementById('textShadow');
    
    borderEnabledCheckbox = document.getElementById('borderEnabled');
    borderColorInput = document.getElementById('borderColor');
    borderWidthInput = document.getElementById('borderWidth');
    borderWidthValueSpan = document.getElementById('borderWidthValue');
    borderRadiusInput = document.getElementById('borderRadius');
    radiusValueSpan = document.getElementById('radiusValue');
    
    downloadBtn = document.getElementById('downloadBtn');
    currentSizeSpan = document.getElementById('currentSize');
    fontSearchInput = document.getElementById('fontSearch');
    fontDropdown = document.getElementById('fontDropdown');
    
    fetchGoogleFonts();
    attachEventListeners();
    drawCanvas();
}

// Attach event listeners
function attachEventListeners() {
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            canvasWidth = parseInt(this.dataset.width);
            canvasHeight = parseInt(this.dataset.height);
            updateCanvasSize();
        });
    });
    
    // Custom size
    applyCustomSizeBtn.addEventListener('click', () => {
        const width = parseInt(customWidthInput.value);
        const height = parseInt(customHeightInput.value);
        
        if (width >= 100 && width <= 3840 && height >= 100 && height <= 2160) {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            canvasWidth = width;
            canvasHeight = height;
            updateCanvasSize();
        } else {
            alert('Width must be 100-3840px and height must be 100-2160px');
        }
    });
    
    // Background type
    bgTypeSelect.addEventListener('change', () => {
        const solidGroup = document.getElementById('solidColorGroup');
        const gradientGroup = document.getElementById('gradientGroup');
        const imageGroup = document.getElementById('imageGroup');
        
        solidGroup.style.display = 'none';
        gradientGroup.style.display = 'none';
        imageGroup.style.display = 'none';
        
        if (bgTypeSelect.value === 'solid') {
            solidGroup.style.display = 'flex';
        } else if (bgTypeSelect.value === 'gradient') {
            solidGroup.style.display = 'flex';
            gradientGroup.style.display = 'flex';
        } else if (bgTypeSelect.value === 'image') {
            imageGroup.style.display = 'flex';
        }
        
        drawCanvas();
    });
    
    // Background colors and gradient
    bgColor1Input.addEventListener('input', drawCanvas);
    bgColor2Input.addEventListener('input', drawCanvas);
    gradientAngleInput.addEventListener('input', () => {
        angleValueSpan.textContent = gradientAngleInput.value + '°';
        drawCanvas();
    });
    
    // Image upload
    bgImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    uploadedImage = img;
                    drawCanvas();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Text inputs
    mainTextInput.addEventListener('input', drawCanvas);
    subTextInput.addEventListener('input', drawCanvas);
    textColorInput.addEventListener('input', drawCanvas);
    fontSizeInput.addEventListener('input', () => {
        fontSizeValueSpan.textContent = fontSizeInput.value + 'px';
        drawCanvas();
    });
    textAlignSelect.addEventListener('change', drawCanvas);
    textShadowCheckbox.addEventListener('change', drawCanvas);
    
    // Font search
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
    
    // Border controls
    borderEnabledCheckbox.addEventListener('change', () => {
        const borderControls = document.getElementById('borderControls');
        borderControls.style.display = borderEnabledCheckbox.checked ? 'flex' : 'none';
        drawCanvas();
    });
    borderColorInput.addEventListener('input', drawCanvas);
    borderWidthInput.addEventListener('input', () => {
        borderWidthValueSpan.textContent = borderWidthInput.value + 'px';
        drawCanvas();
    });
    borderRadiusInput.addEventListener('input', () => {
        radiusValueSpan.textContent = borderRadiusInput.value + 'px';
        drawCanvas();
    });
    
    // Download button
    downloadBtn.addEventListener('click', downloadImage);
}

// Update canvas size
function updateCanvasSize() {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    currentSizeSpan.textContent = `${canvasWidth} x ${canvasHeight}`;
    drawCanvas();
}

// Draw canvas
function drawCanvas() {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background
    drawBackground();
    
    // Draw border if enabled
    if (borderEnabledCheckbox.checked) {
        drawBorder();
    }
    
    // Draw text
    drawText();
}

// Draw background
function drawBackground() {
    const bgType = bgTypeSelect.value;
    const radius = parseInt(borderRadiusInput.value);
    
    // Create rounded rectangle path
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, canvasWidth, canvasHeight, radius);
    ctx.clip();
    
    if (bgType === 'solid') {
        ctx.fillStyle = bgColor1Input.value;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (bgType === 'gradient') {
        const angle = parseInt(gradientAngleInput.value) * (Math.PI / 180);
        const x1 = canvasWidth / 2 - Math.cos(angle) * canvasWidth / 2;
        const y1 = canvasHeight / 2 - Math.sin(angle) * canvasHeight / 2;
        const x2 = canvasWidth / 2 + Math.cos(angle) * canvasWidth / 2;
        const y2 = canvasHeight / 2 + Math.sin(angle) * canvasHeight / 2;
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, bgColor1Input.value);
        gradient.addColorStop(1, bgColor2Input.value);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (bgType === 'image' && uploadedImage) {
        ctx.drawImage(uploadedImage, 0, 0, canvasWidth, canvasHeight);
    } else {
        ctx.fillStyle = bgColor1Input.value;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    ctx.restore();
}

// Draw border
function drawBorder() {
    const borderWidth = parseInt(borderWidthInput.value);
    const radius = parseInt(borderRadiusInput.value);
    
    ctx.strokeStyle = borderColorInput.value;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.roundRect(borderWidth / 2, borderWidth / 2, canvasWidth - borderWidth, canvasHeight - borderWidth, radius);
    ctx.stroke();
}

// Draw text
function drawText() {
    const mainText = mainTextInput.value;
    const subText = subTextInput.value;
    const fontSize = parseInt(fontSizeInput.value);
    const textAlign = textAlignSelect.value;
    const textShadow = textShadowCheckbox.checked;
    const font = window.selectedFont || 'Inter';
    
    // Load Google Font if not Inter
    if (font !== 'Inter') {
        const existingLink = document.querySelector(`link[href*="${font.replace(/\s+/g, '+')}"]`);
        if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@400;500;600;700;800&display=swap`;
            document.head.appendChild(link);
        }
    }
    
    ctx.fillStyle = textColorInput.value;
    ctx.font = `bold ${fontSize}px '${font}', sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';
    
    // Text shadow
    if (textShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    // Calculate text position
    let x;
    if (textAlign === 'left') {
        x = 20;
    } else if (textAlign === 'right') {
        x = canvasWidth - 20;
    } else {
        x = canvasWidth / 2;
    }
    
    // Draw main text
    if (mainText) {
        const y = subText ? canvasHeight / 2 - fontSize / 3 : canvasHeight / 2;
        ctx.fillText(mainText, x, y);
    }
    
    // Draw subtitle
    if (subText) {
        const subFontSize = fontSize * 0.6;
        ctx.font = `600 ${subFontSize}px '${font}', sans-serif`;
        const y = canvasHeight / 2 + fontSize / 2;
        ctx.fillText(subText, x, y);
    }
}

// Download image
function downloadImage() {
    const link = document.createElement('a');
    link.download = `panel-${canvasWidth}x${canvasHeight}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Google Fonts Functions
function renderFontDropdown(filter = '') {
    fontDropdown.innerHTML = '';
    const filtered = filter 
        ? allFonts.filter(f => f.family.toLowerCase().includes(filter.toLowerCase()))
        : allFonts.slice(0, 50);
    
    filtered.forEach(font => {
        const div = document.createElement('div');
        div.textContent = font.family;
        div.style.fontFamily = `'${font.family}', sans-serif`;
        div.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectedFont = font.family;
            window.selectedFont = selectedFont;
            fontSearchInput.value = font.family;
            fontDropdown.style.display = 'none';
            drawCanvas();
        });
        fontDropdown.appendChild(div);
    });
}

async function fetchGoogleFonts() {
    try {
        const response = await fetch(GOOGLE_FONTS_API);
        const data = await response.json();
        allFonts = data.items || [];
        console.log(`Loaded ${allFonts.length} Google Fonts`);
    } catch (error) {
        console.error('Error fetching Google Fonts:', error);
        allFonts = [{ family: 'Inter' }, { family: 'Roboto' }, { family: 'Open Sans' }];
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
