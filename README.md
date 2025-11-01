# Streamer Tools - Kick Plus

A comprehensive collection of free and premium tools designed for Kick streamers to enhance their streaming experience and grow their channels.

## 📋 Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Available Tools](#available-tools)
- [How It Works](#how-it-works)
- [Setup & Installation](#setup--installation)
- [Contributing](#contributing)

## 🎯 Overview

**Kick Plus** is a web-based platform offering streaming utilities and tools specifically tailored for Kick streamers. The platform includes both free and premium tools that help streamers create engaging content, manage their channels, and interact with their communities.

## 📁 Project Structure

```
Streamer Tools/
│
├── index.html                  # Main landing page
├── style.css                   # Global styles and theming
├── README.md                   # This file
│
├── assets/                     # Static assets
│   ├── Social Icons/          # Social media icons
│   └── Tool Icons/            # Tool-specific icons/logos
│       ├── SocialRotator.png
│       ├── LookUp.png
│       ├── SpinWheel.png
│       ├── CountDown.png
│       ├── PanelMagic.png
│       ├── UnifiedChat.png
│       ├── Hype.png
│       ├── Milestones.png
│       └── TextToSpeech.png
│
├── Free-Tools/                 # Free tools directory
│   ├── index.html             # Free tools listing page
│   │
│   ├── Social Rotator/        # Social media rotator tool
│   │   ├── index.html
│   │   ├── rotator-overlay.html
│   │   ├── rotator.css
│   │   └── rotator.js
│   │
│   ├── LookUp/                # Kick streamer lookup tool
│   │   ├── index.html
│   │   ├── look-up.js
│   │   ├── streamer-viewer.css
│   │   └── assets/
│   │
│   ├── SpinWheel/             # Customizable spin wheel
│   │   ├── index.html
│   │   ├── spin-wheel.css
│   │   └── spin-wheel.js
│   │
│   ├── CountdownTimer/        # Stream countdown timer
│   │   ├── index.html
│   │   ├── overlay.html
│   │   ├── countdown.css
│   │   └── countdown.js
│   │
│   ├── PanelGenerator/        # Panel & banner creator
│   │   ├── index.html
│   │   ├── panel-generator.css
│   │   └── panel-generator.js
│   │
│   ├── UnifiedChat/           # Multi-platform chat (Coming Soon)
│   │   ├── index.html
│   │   ├── overlay.html
│   │   ├── unified-chat.css
│   │   └── unified-chat.js
│   │
│   └── Hype/                  # Event notification bar (Coming Soon)
│       ├── index.html
│       ├── overlay.html
│       ├── hype.css
│       ├── hype.js
│       ├── kick-api.js
│       └── README.md
│
└── Premium-Tools/             # Premium tools directory
    └── index.html             # Premium tools listing page
```

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Styling with custom properties (CSS variables)
- **Vanilla JavaScript** - No frameworks, pure JS for maximum performance

### Design Features
- **Custom CSS Variables** - Consistent theming across all tools
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Animations** - Smooth transitions and fade-in effects
- **Gradient Backgrounds** - Modern visual aesthetics
- **Inter Font Family** - Google Fonts integration

### APIs & Integrations
- **Kick API** - Real-time channel data and events
- **Pusher WebSocket** - Live event streaming for Hype tool
- **Browser LocalStorage** - Settings persistence and cross-page communication

## 🎮 Available Tools

### ✅ Active Free Tools

#### 1. **Social Rotator**
- **Purpose**: Cycle through social media handles on stream
- **Features**: 
  - Customizable rotation speed
  - Multiple social platforms
  - OBS browser source overlay
  - Smooth transitions

#### 2. **LookUp**
- **Purpose**: Search Kick streamers and viewers
- **Features**:
  - Real-time Kick API integration
  - Streamer profile information
  - Viewer statistics
  - Channel details

#### 3. **Spin Wheel**
- **Purpose**: Interactive giveaway and decision wheel
- **Features**:
  - Custom wheel segments
  - Adjustable colors
  - Sound effects
  - Smooth spin animations

#### 4. **Countdown Timer**
- **Purpose**: Starting soon and event countdown
- **Features**:
  - Customizable timer duration
  - OBS overlay integration
  - Visual countdown display
  - Auto-start functionality

#### 5. **Panel Generator**
- **Purpose**: Create custom panels and banners
- **Features**:
  - Design custom graphics
  - Export for Kick profiles
  - Template system
  - Preview functionality

### 🚧 Coming Soon Tools

#### 6. **Unified Chat** (In Development)
- Combine Twitch and Kick chat in one view
- Multi-platform chat management
- Unified moderation tools

#### 7. **Hype** (In Development)
- Real-time subscription notifications
- Gift sub alerts
- Kick gifts display
- Animated notification bar
- Kick API integration via WebSocket

#### 8. **Milestones** (Planned)
- Track stream milestones
- Celebrate achievements
- Goal tracking system

#### 9. **Text To Speech** (Planned)
- Convert chat to speech
- Donation text-to-speech
- Customizable voices

## ⚙️ How It Works

### Architecture Overview

#### 1. **Multi-Page Structure**
The site uses a traditional multi-page architecture where each tool is a separate HTML page with its own CSS and JavaScript files. This provides:
- Easy maintenance
- Fast loading times
- Tool isolation
- Simple deployment

#### 2. **Global Styling System**
```css
/* style.css contains CSS variables for consistent theming */
:root {
    --primary-color: #53fc18;
    --bg-primary: #0f0f23;
    --text-primary: #ffffff;
    /* ... more variables */
}
```

#### 3. **Navigation System**
- Top navigation bar on every page
- Consistent header with "Kick Plus" branding
- Quick access to Home, Free Tools, and Premium Tools

#### 4. **Tool Card System**
Each tool is represented by a card with:
- Icon/logo
- Tool name
- Description
- Click-to-navigate functionality
- Hover effects and animations

### Page Types

#### A. Landing Pages (index.html files)
- **Main Index**: Homepage with overview and navigation
- **Free Tools Index**: Grid of free tool cards
- **Premium Tools Index**: Grid of premium offerings

#### B. Tool Control Pages
- Configuration interface for each tool
- Settings forms
- Preview sections
- URL generation for OBS integration

#### C. Overlay Pages
- Transparent HTML pages for OBS Browser Source
- Minimal UI, maximum compatibility
- Real-time updates via LocalStorage
- Examples: `overlay.html`, `rotator-overlay.html`

### Communication Patterns

#### 1. **LocalStorage Communication**
```javascript
// Control panel stores settings
localStorage.setItem('toolSettings', JSON.stringify(settings));

// Overlay reads settings
const settings = JSON.parse(localStorage.getItem('toolSettings'));
```

#### 2. **Polling Pattern**
Overlays check for updates at regular intervals:
```javascript
setInterval(checkForUpdates, 500); // Check every 500ms
```

#### 3. **WebSocket Integration** (Hype Tool)
Real-time events from Kick:
```javascript
// Connect to Kick via Pusher WebSocket
const ws = new WebSocket(kickWebSocketURL);
// Listen for subscription/gift events
```

## 🚀 Setup & Installation

### Basic Setup (Local Development)

1. **Clone or Download** the project
   ```bash
   git clone <repository-url>
   cd "Streamer Tools"
   ```

2. **Open in Browser**
   - Simply open `index.html` in any modern browser
   - No build process required
   - No dependencies to install

3. **For Development**
   - Use VS Code with Live Server extension
   - Or use any local HTTP server:
     ```bash
     # Python
     python -m http.server 8000
     
     # Node.js
     npx http-server
     ```

### OBS Integration

1. **Add Browser Source** in OBS
2. **Set URL** to the overlay file (e.g., `file:///path/to/overlay.html`)
3. **Configure Dimensions** as specified in tool documentation
4. **Adjust Position** in your scene

### Deployment

#### Static Hosting (Recommended)
Deploy to any static hosting service:
- **GitHub Pages** - Free hosting for GitHub repos
- **Netlify** - Drag & drop deployment
- **Vercel** - Zero-config deployment
- **Cloudflare Pages** - Fast global CDN

#### Steps:
1. Upload all files maintaining directory structure
2. Configure custom domain (optional)
3. Enable HTTPS
4. Update OBS sources to use web URLs

## 🎨 Design System

### Color Palette
- **Primary**: `#53fc18` (Kick Green)
- **Background**: `#0f0f23` (Dark Blue)
- **Text**: `#ffffff` (White)
- **Secondary Text**: `rgba(255, 255, 255, 0.7)`
- **Cards**: `rgba(255, 255, 255, 0.05)`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700, 800

### Spacing
- Small: `0.5rem`
- Medium: `1rem`
- Large: `2rem`
- XL: `3rem`

### Border Radius
- Small: `8px`
- Medium: `12px`
- Large: `16px`

## 🔧 Development Guidelines

### Adding a New Tool

1. **Create Tool Directory**
   ```
   Free-Tools/
   └── NewTool/
       ├── index.html
       ├── newtool.css
       └── newtool.js
   ```

2. **Use Template Structure**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <link rel="stylesheet" href="../../style.css">
       <link rel="stylesheet" href="newtool.css">
   </head>
   <body>
       <header class="top-bar">...</header>
       <main>...</main>
       <script src="newtool.js"></script>
   </body>
   </html>
   ```

3. **Add Tool Card** to `Free-Tools/index.html`
   ```html
   <div class="tool-card fade-in">
       <a href="NewTool/index.html" class="tool-card-link">
           <img src="../assets/Tool Icons/NewTool.png" alt="...">
           <p class="tool-description">Description here</p>
       </a>
   </div>
   ```

4. **Create Tool Icon** (recommended size: 256x256px)

### Code Style
- Use consistent indentation (4 spaces)
- Comment complex logic
- Use semantic HTML
- Follow CSS variable naming conventions
- Keep JavaScript modular

## 📝 Future Enhancements

### Planned Features
- [ ] User accounts and authentication
- [ ] Tool usage analytics
- [ ] Cloud storage for settings
- [ ] More API integrations (Twitch, YouTube)
- [ ] Mobile app versions
- [ ] Custom branding options
- [ ] Template marketplace
- [ ] Community tool submissions

### Premium Features (Roadmap)
- Advanced analytics dashboard
- Priority support
- Custom tool development
- Exclusive templates
- Ad-free experience
- API access

## 🤝 Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Guidelines
- Maintain consistent code style
- Update documentation
- Test in multiple browsers
- Optimize for performance
- Follow accessibility standards

## 📄 License

This project is proprietary software. All rights reserved.

## 💬 Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Contact via Kick
- Check documentation in tool-specific README files

## 🙏 Acknowledgments

- **Kick Platform** - For the streaming platform and API
- **Google Fonts** - For the Inter font family
- **Pusher** - For WebSocket infrastructure
- **Community** - For feedback and feature suggestions

---

**Built with ❤️ for the Kick streaming community**

*Last Updated: November 1, 2025*
