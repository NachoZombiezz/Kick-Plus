// Spin Wheel JavaScript

let options = [];
let spinning = false;
let currentRotation = 0;

// Color palette for wheel segments
const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
    '#6366f1', '#a855f7', '#f43f5e', '#eab308'
];

// Add option to the list
function addOption() {
    const input = document.getElementById('optionInput');
    const value = input.value.trim();
    
    if (value === '') {
        alert('Please enter an option!');
        return;
    }
    
    if (options.length >= 20) {
        alert('Maximum 20 options allowed!');
        return;
    }
    
    const color = colors[options.length % colors.length];
    options.push({ text: value, color: color });
    
    input.value = '';
    input.focus();
    
    updateOptionsList();
    drawWheel();
}

// Update the options list display
function updateOptionsList() {
    const container = document.getElementById('optionsList');
    
    if (options.length === 0) {
        container.innerHTML = '<div class="empty-state">No options added yet. Add some options to get started!</div>';
        return;
    }
    
    container.innerHTML = options.map((option, index) => `
        <div class="option-item">
            <div class="option-color" style="background-color: ${option.color}"></div>
            <span class="option-text">${option.text}</span>
            <button class="remove-option-btn" onclick="removeOption(${index})">Remove</button>
        </div>
    `).join('');
}

// Remove option from the list
function removeOption(index) {
    options.splice(index, 1);
    updateOptionsList();
    drawWheel();
}

// Clear all options
function clearOptions() {
    if (options.length === 0) return;
    
    if (confirm('Are you sure you want to clear all options?')) {
        options = [];
        updateOptionsList();
        drawWheel();
        hideResult();
    }
}

// Load example options
function loadExampleOptions() {
    options = [
        { text: 'Option 1', color: colors[0] },
        { text: 'Option 2', color: colors[1] },
        { text: 'Option 3', color: colors[2] },
        { text: 'Option 4', color: colors[3] },
        { text: 'Option 5', color: colors[4] },
        { text: 'Option 6', color: colors[5] }
    ];
    updateOptionsList();
    drawWheel();
    hideResult();
}

// Draw the wheel on canvas
function drawWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (options.length === 0) {
        // Draw empty wheel
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#1e1e30';
        ctx.fill();
        ctx.strokeStyle = '#2d2d44';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Add options to spin!', centerX, centerY);
        return;
    }
    
    const arcSize = (2 * Math.PI) / options.length;
    
    options.forEach((option, index) => {
        const startAngle = index * arcSize;
        const endAngle = startAngle + arcSize;
        
        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = option.color;
        ctx.fill();
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + arcSize / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw text at 70% of radius
        const textRadius = radius * 0.7;
        ctx.fillText(option.text, textRadius, 0);
        ctx.restore();
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e1e30';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.stroke();
}

// Spin the wheel
function spinWheel() {
    if (spinning) return;
    
    if (options.length === 0) {
        alert('Please add at least one option to spin!');
        return;
    }
    
    spinning = true;
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    hideResult();
    
    const canvas = document.getElementById('wheelCanvas');
    const arcSize = 360 / options.length;
    
    // Random spins between 5 and 8 full rotations plus random offset
    const minSpins = 5;
    const maxSpins = 8;
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const randomDegree = Math.random() * 360;
    const totalRotation = (spins * 360) + randomDegree;
    
    // Animate the spin
    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    const startRotation = currentRotation;
    
    function animate() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const rotation = startRotation + (totalRotation * easeOut);
        currentRotation = rotation % 360;
        
        canvas.style.transform = `rotate(${rotation}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Calculate winner - pointer is at top (12 o'clock position)
            // We need to account for rotation and find which segment is at the top
            const normalizedRotation = currentRotation % 360;
            const adjustedRotation = (270 - normalizedRotation + 360) % 360; // 270 = bottom adjusted to top
            const winningIndex = Math.floor(adjustedRotation / arcSize) % options.length;
            const winner = options[winningIndex];
            
            showResult(winner.text);
            spinning = false;
            spinBtn.disabled = false;
        }
    }
    
    animate();
}

// Show result
function showResult(text) {
    const resultText = document.getElementById('resultText');
    const removeBtn = document.getElementById('removeWinnerBtn');
    const resultDisplay = document.getElementById('resultDisplay');
    
    resultText.textContent = `🎉 Winner: ${text}`;
    removeBtn.style.display = 'block';
    resultDisplay.classList.add('show', 'winner');
    
    setTimeout(() => {
        resultDisplay.classList.remove('winner');
    }, 1000);
}

// Hide result
function hideResult() {
    const resultText = document.getElementById('resultText');
    const removeBtn = document.getElementById('removeWinnerBtn');
    const resultDisplay = document.getElementById('resultDisplay');
    
    resultDisplay.classList.remove('show', 'winner');
    resultText.textContent = '';
    removeBtn.style.display = 'none';
}

// Remove winner from options
function removeWinner() {
    const resultText = document.getElementById('resultText');
    const winnerText = resultText.textContent.replace('🎉 Winner: ', '');
    
    const winnerIndex = options.findIndex(option => option.text === winnerText);
    if (winnerIndex !== -1) {
        options.splice(winnerIndex, 1);
        updateOptionsList();
        drawWheel();
        hideResult();
    }
}

// Allow Enter key to add option
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('optionInput');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addOption();
        }
    });
    
    // Initialize
    updateOptionsList();
    drawWheel();
});
