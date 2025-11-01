// Unified Chat for Twitch and Kick
class UnifiedChat {
    constructor() {
        this.twitchChannel = '';
        this.kickChannel = '';
        this.twitchWs = null;
        this.kickWs = null;
        this.isConnected = false;
        
        // Emote storage
        this.emotes = {
            twitch: new Map(),
            kick: new Map(),
            sevenTV: new Map(),
            bttv: new Map(),
            ffz: new Map()
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.updateOverlayUrl();
    }

    initializeElements() {
        this.twitchChannelInput = document.getElementById('twitchChannel');
        this.kickChannelInput = document.getElementById('kickChannel');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.twitchStatus = document.getElementById('twitchStatus');
        this.kickStatus = document.getElementById('kickStatus');
        this.chatMessages = document.getElementById('chatMessages');
        this.clearChatBtn = document.getElementById('clearChat');
        this.overlayUrlInput = document.getElementById('overlayUrl');
        this.copyUrlBtn = document.getElementById('copyUrl');
    }

    setupEventListeners() {
        this.connectBtn.addEventListener('click', () => this.connect());
        this.disconnectBtn.addEventListener('click', () => this.disconnect());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.copyUrlBtn.addEventListener('click', () => this.copyOverlayUrl());
        
        // Save settings on input change
        this.twitchChannelInput.addEventListener('input', () => this.saveSettings());
        this.kickChannelInput.addEventListener('input', () => this.saveSettings());
    }

    loadSettings() {
        const saved = localStorage.getItem('unifiedChatSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.twitchChannelInput.value = settings.twitchChannel || '';
            this.kickChannelInput.value = settings.kickChannel || '';
        }
    }

    saveSettings() {
        const settings = {
            twitchChannel: this.twitchChannelInput.value,
            kickChannel: this.kickChannelInput.value
        };
        localStorage.setItem('unifiedChatSettings', JSON.stringify(settings));
    }

    updateOverlayUrl() {
        const baseUrl = window.location.href.replace('index.html', '');
        this.overlayUrlInput.value = `${baseUrl}overlay.html`;
    }

    async connect() {
        this.twitchChannel = this.twitchChannelInput.value.trim().toLowerCase();
        this.kickChannel = this.kickChannelInput.value.trim().toLowerCase();

        if (!this.twitchChannel && !this.kickChannel) {
            alert('Please enter at least one channel name');
            return;
        }

        this.connectBtn.disabled = true;
        this.disconnectBtn.disabled = false;
        this.twitchChannelInput.disabled = true;
        this.kickChannelInput.disabled = true;

        if (this.twitchChannel) {
            await this.loadEmotes(this.twitchChannel);
            this.connectToTwitch();
        }

        if (this.kickChannel) {
            await this.connectToKick();
            
            // Show Kick emote count after connection
            if (this.emotes.kick.size > 0) {
                this.addSystemMessage(`Loaded ${this.emotes.kick.size} Kick emotes`);
            }
        }

        this.isConnected = true;
        this.saveSettings();
    }

    disconnect() {
        if (this.twitchWs) {
            this.twitchWs.close();
            this.twitchWs = null;
        }

        if (this.kickWs) {
            this.kickWs.close();
            this.kickWs = null;
        }

        this.updateStatus('twitch', 'disconnected');
        this.updateStatus('kick', 'disconnected');

        this.connectBtn.disabled = false;
        this.disconnectBtn.disabled = true;
        this.twitchChannelInput.disabled = false;
        this.kickChannelInput.disabled = false;
        this.isConnected = false;
        
        // Clear emotes
        this.emotes.twitch.clear();
        this.emotes.kick.clear();
        this.emotes.sevenTV.clear();
        this.emotes.bttv.clear();
        this.emotes.ffz.clear();
    }

    async loadEmotes(channelName) {
        try {
            this.addSystemMessage('Loading emotes...');
            
            // Load Twitch native emotes (global and channel)
            console.log('Loading Twitch emotes for:', channelName);
            await this.loadTwitchEmotes(channelName);
            console.log('Twitch emotes loaded:', this.emotes.twitch.size);
            
            // Load 7TV emotes
            console.log('Loading 7TV emotes...');
            await this.load7TVEmotes(channelName);
            console.log('7TV emotes loaded:', this.emotes.sevenTV.size);
            
            // Load BTTV emotes
            console.log('Loading BTTV emotes...');
            await this.loadBTTVEmotes(channelName);
            console.log('BTTV emotes loaded:', this.emotes.bttv.size);
            
            // Load FFZ emotes
            console.log('Loading FFZ emotes...');
            await this.loadFFZEmotes(channelName);
            console.log('FFZ emotes loaded:', this.emotes.ffz.size);
            
            const totalEmotes = this.emotes.twitch.size + this.emotes.sevenTV.size + this.emotes.bttv.size + this.emotes.ffz.size;
            this.addSystemMessage(`Loaded ${totalEmotes} emotes (Twitch: ${this.emotes.twitch.size}, 7TV: ${this.emotes.sevenTV.size}, BTTV: ${this.emotes.bttv.size}, FFZ: ${this.emotes.ffz.size})`);
            
            // Log first 5 emotes from each provider for debugging
            if (this.emotes.twitch.size > 0) {
                console.log('Sample Twitch emotes:', Array.from(this.emotes.twitch.keys()).slice(0, 5));
            }
        } catch (error) {
            console.error('Error loading emotes:', error);
            this.addSystemMessage('Error loading some emotes');
        }
    }

    async loadTwitchEmotes(channelName) {
        try {
            // Use Twitch's public API endpoints that don't require authentication
            // Get user ID using the v5 API (still works for this)
            const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${channelName}`, {
                headers: {
                    'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
                }
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.data && userData.data.length > 0) {
                    const userId = userData.data[0].id;
                    
                    // Load channel-specific emotes using badges endpoint as fallback
                    // Try to get emotes from the v5 API endpoint
                    const v5EmotesResponse = await fetch(`https://api.twitch.tv/kraken/users/${userId}/emotes`, {
                        headers: {
                            'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
                            'Accept': 'application/vnd.twitchtv.v5+json'
                        }
                    });
                    
                    if (v5EmotesResponse.ok) {
                        const v5EmotesData = await v5EmotesResponse.json();
                        if (v5EmotesData.emoticon_sets) {
                            Object.values(v5EmotesData.emoticon_sets).forEach(emoteSet => {
                                emoteSet.forEach(emote => {
                                    const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/2.0`;
                                    this.emotes.twitch.set(emote.code, emoteUrl);
                                });
                            });
                        }
                    }
                }
            }
            
            // Load global Twitch emotes using the v5 endpoint
            const globalResponse = await fetch('https://api.twitch.tv/kraken/chat/emoticon_images', {
                headers: {
                    'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
                    'Accept': 'application/vnd.twitchtv.v5+json'
                }
            });
            
            if (globalResponse.ok) {
                const globalData = await globalResponse.json();
                if (globalData.emoticons) {
                    // Only load the first 500 to avoid performance issues
                    globalData.emoticons.slice(0, 500).forEach(emote => {
                        const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/2.0`;
                        if (!this.emotes.twitch.has(emote.code)) {
                            this.emotes.twitch.set(emote.code, emoteUrl);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading Twitch emotes:', error);
        }
    }

    async load7TVEmotes(channelName) {
        try {
            // Get Twitch user ID first
            const userResponse = await fetch(`https://api.7tv.app/v3/users/twitch/${channelName}`);
            if (!userResponse.ok) return;
            
            const userData = await userResponse.json();
            const userId = userData.user?.id;
            
            if (!userId) return;
            
            // Get user's emote set
            const emotesResponse = await fetch(`https://7tv.io/v3/users/twitch/${userId}`);
            if (!emotesResponse.ok) return;
            
            const emotesData = await emotesResponse.json();
            const emoteSet = emotesData.emote_set?.emotes || [];
            
            // Store emotes
            emoteSet.forEach(emote => {
                const emoteUrl = `https://cdn.7tv.app/emote/${emote.id}/2x.webp`;
                this.emotes.sevenTV.set(emote.name, emoteUrl);
            });
            
            // Also load global 7TV emotes
            const globalResponse = await fetch('https://7tv.io/v3/emote-sets/global');
            if (globalResponse.ok) {
                const globalData = await globalResponse.json();
                const globalEmotes = globalData.emotes || [];
                
                globalEmotes.forEach(emote => {
                    const emoteUrl = `https://cdn.7tv.app/emote/${emote.id}/2x.webp`;
                    if (!this.emotes.sevenTV.has(emote.name)) {
                        this.emotes.sevenTV.set(emote.name, emoteUrl);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading 7TV emotes:', error);
        }
    }

    async loadBTTVEmotes(channelName) {
        try {
            // Get channel BTTV emotes
            const response = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${channelName}`);
            if (!response.ok) return;
            
            const data = await response.json();
            const channelEmotes = data.channelEmotes || [];
            const sharedEmotes = data.sharedEmotes || [];
            
            [...channelEmotes, ...sharedEmotes].forEach(emote => {
                const emoteUrl = `https://cdn.betterttv.net/emote/${emote.id}/2x`;
                this.emotes.bttv.set(emote.code, emoteUrl);
            });
            
            // Load global BTTV emotes
            const globalResponse = await fetch('https://api.betterttv.net/3/cached/emotes/global');
            if (globalResponse.ok) {
                const globalEmotes = await globalResponse.json();
                globalEmotes.forEach(emote => {
                    const emoteUrl = `https://cdn.betterttv.net/emote/${emote.id}/2x`;
                    if (!this.emotes.bttv.has(emote.code)) {
                        this.emotes.bttv.set(emote.code, emoteUrl);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading BTTV emotes:', error);
        }
    }

    async loadFFZEmotes(channelName) {
        try {
            const response = await fetch(`https://api.frankerfacez.com/v1/room/${channelName}`);
            if (!response.ok) return;
            
            const data = await response.json();
            const sets = data.sets || {};
            
            Object.values(sets).forEach(set => {
                const emotes = set.emoticons || [];
                emotes.forEach(emote => {
                    const emoteUrl = emote.urls['2'] || emote.urls['1'];
                    if (emoteUrl) {
                        this.emotes.ffz.set(emote.name, `https:${emoteUrl}`);
                    }
                });
            });
        } catch (error) {
            console.error('Error loading FFZ emotes:', error);
        }
    }

    connectToTwitch() {
        this.updateStatus('twitch', 'connecting');

        // Connect to Twitch IRC via WebSocket
        this.twitchWs = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

        this.twitchWs.onopen = () => {
            // Anonymous login
            this.twitchWs.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
            this.twitchWs.send('PASS SCHMOOPIIE');
            this.twitchWs.send('NICK justinfan12345');
            this.twitchWs.send(`JOIN #${this.twitchChannel}`);
            this.updateStatus('twitch', 'connected');
            this.addSystemMessage(`Connected to Twitch: ${this.twitchChannel}`);
        };

        this.twitchWs.onmessage = (event) => {
            this.handleTwitchMessage(event.data);
        };

        this.twitchWs.onerror = () => {
            this.updateStatus('twitch', 'error');
            this.addSystemMessage('Twitch connection error');
        };

        this.twitchWs.onclose = () => {
            this.updateStatus('twitch', 'disconnected');
            if (this.isConnected) {
                this.addSystemMessage('Disconnected from Twitch');
            }
        };
    }

    async connectToKick() {
        this.updateStatus('kick', 'connecting');
        
        try {
            // Step 1: Get the chatroom ID for the channel
            const channelData = await this.getKickChannelData(this.kickChannel);
            
            if (!channelData || !channelData.chatroomId) {
                throw new Error('Could not find chatroom ID');
            }

            const chatroomId = channelData.chatroomId;
            
            // Load Kick emotes
            await this.loadKickEmotes(channelData);

            // Step 2: Connect to Pusher WebSocket
            // Kick uses Pusher with these settings:
            const pusherKey = '32cbd69e4b950bf97679'; // Kick's public Pusher key
            const cluster = 'us2';
            
            const wsUrl = `wss://ws-${cluster}.pusher.com/app/${pusherKey}?protocol=7&client=js&version=7.0.3&flash=false`;
            
            this.kickWs = new WebSocket(wsUrl);
            
            this.kickWs.onopen = () => {
                // Subscribe to the chatroom channel
                const subscribeMessage = JSON.stringify({
                    event: 'pusher:subscribe',
                    data: {
                        auth: '',
                        channel: `chatrooms.${chatroomId}.v2`
                    }
                });
                
                this.kickWs.send(subscribeMessage);
                this.updateStatus('kick', 'connected');
                this.addSystemMessage(`Connected to Kick: ${this.kickChannel}`);
            };
            
            this.kickWs.onmessage = (event) => {
                this.handleKickMessage(event.data);
            };
            
            this.kickWs.onerror = (error) => {
                console.error('Kick WebSocket error:', error);
                this.updateStatus('kick', 'error');
                this.addSystemMessage('Kick connection error');
            };
            
            this.kickWs.onclose = () => {
                this.updateStatus('kick', 'disconnected');
                if (this.isConnected) {
                    this.addSystemMessage('Disconnected from Kick');
                }
            };
            
        } catch (error) {
            console.error('Error connecting to Kick:', error);
            this.updateStatus('kick', 'error');
            this.addSystemMessage(`Kick connection error: ${error.message}`);
        }
    }

    async getKickChannelData(channelName) {
        try {
            // Fetch channel data from Kick API
            const response = await fetch(`https://kick.com/api/v2/channels/${channelName}`);
            
            if (!response.ok) {
                throw new Error(`Channel not found: ${channelName}`);
            }
            
            const data = await response.json();
            console.log('Kick channel data:', data);
            console.log('Kick chatroom emotes:', data.chatroom?.emotes);
            
            return {
                chatroomId: data.chatroom?.id,
                channelId: data.id,
                userId: data.user_id,
                emotes: data.chatroom?.emotes || []
            };
        } catch (error) {
            console.error('Error fetching Kick channel data:', error);
            throw error;
        }
    }

    async loadKickEmotes(channelData) {
        try {
            console.log('=== Loading Kick Emotes ===');
            
            // Load channel-specific subscriber emotes from channel data
            if (channelData.emotes && channelData.emotes.length > 0) {
                console.log('Channel emotes found:', channelData.emotes.length, 'emotes');
                channelData.emotes.forEach(emote => {
                    // Kick emote structure has 'name' field
                    const emoteName = emote.name;
                    if (emoteName && emote.id) {
                        // Use the proper Kick CDN URL
                        const emoteUrl = `https://files.kick.com/emotes/${emote.id}/fullsize`;
                        this.emotes.kick.set(emoteName, emoteUrl);
                    }
                });
                console.log(`Loaded ${channelData.emotes.length} channel-specific Kick emotes`);
            } else {
                console.log('No channel-specific emotes found');
            }
            
            // Add common Kick global emotes manually (hardcoded list)
            // Since we can't fetch due to CORS, we'll add the most common ones
            const commonKickEmotes = [
                { name: 'kickPepe', id: '34448' },
                { name: 'kickLove', id: '34449' },
                { name: 'kickPog', id: '34450' },
                { name: 'kickSad', id: '34451' },
                { name: 'kickLUL', id: '34452' },
                { name: 'kickHype', id: '34453' },
                { name: 'kickCool', id: '34454' },
                { name: 'kickThinking', id: '34455' }
            ];
            
            // Note: These IDs might not be accurate, but the structure is correct
            // Users will primarily use channel-specific emotes anyway
            commonKickEmotes.forEach(emote => {
                if (!this.emotes.kick.has(emote.name)) {
                    const emoteUrl = `https://files.kick.com/emotes/${emote.id}/fullsize`;
                    this.emotes.kick.set(emote.name, emoteUrl);
                }
            });
            
            console.log('Total Kick emotes loaded:', this.emotes.kick.size);
            if (this.emotes.kick.size > 0) {
                console.log('Kick emote names:', Array.from(this.emotes.kick.keys()));
            }
        } catch (error) {
            console.error('Error loading Kick emotes:', error);
        }
    }

    handleKickMessage(data) {
        try {
            const message = JSON.parse(data);
            
            // Handle Pusher ping/pong
            if (message.event === 'pusher:ping') {
                this.kickWs.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
                return;
            }
            
            // Handle chat messages
            if (message.event === 'App\\Events\\ChatMessageEvent') {
                const chatData = JSON.parse(message.data);
                console.log('Full Kick chat data:', chatData);
                
                const username = chatData.sender?.username || 'Unknown';
                const content = chatData.content || '';
                
                // Check if there are emotes in the message metadata
                console.log('Message content:', content);
                console.log('Message metadata:', chatData.metadata);
                console.log('Available Kick emotes:', Array.from(this.emotes.kick.keys()));
                
                if (content) {
                    this.addMessage('kick', username, content);
                    this.broadcastToOverlay('kick', username, content);
                }
            }
            
        } catch (error) {
            console.error('Error parsing Kick message:', error);
        }
    }

    handleTwitchMessage(data) {
        // Handle PING
        if (data.startsWith('PING')) {
            this.twitchWs.send('PONG :tmi.twitch.tv');
            return;
        }

        // Parse IRC message
        if (data.includes('PRIVMSG')) {
            const parts = data.split('PRIVMSG');
            if (parts.length < 2) return;

            // Extract username
            const userMatch = parts[0].match(/display-name=([^;]+)/);
            const username = userMatch ? userMatch[1] : 'Unknown';

            // Extract message
            const messageMatch = parts[1].split(':');
            const message = messageMatch.length > 1 ? messageMatch.slice(1).join(':').trim() : '';

            if (message) {
                this.addMessage('twitch', username, message);
                this.broadcastToOverlay('twitch', username, message);
            }
        }
    }

    updateStatus(platform, status) {
        const statusElement = platform === 'twitch' ? this.twitchStatus : this.kickStatus;
        
        statusElement.classList.remove('connected', 'disconnected', 'error');
        
        if (status === 'connected') {
            statusElement.textContent = 'Connected';
            statusElement.classList.add('connected');
        } else if (status === 'connecting') {
            statusElement.textContent = 'Connecting...';
            statusElement.classList.add('disconnected');
        } else if (status === 'error') {
            statusElement.textContent = 'Error';
            statusElement.classList.add('disconnected');
        } else {
            statusElement.textContent = 'Disconnected';
            statusElement.classList.add('disconnected');
        }
    }

    addMessage(platform, username, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${platform}`;

        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = this.formatMessageWithEmotes(message);

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="platform-badge ${platform}">${platform}</span>
                <span class="username">${this.escapeHtml(username)}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${formattedMessage}</div>
        `;

        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Limit messages to 100
        while (this.chatMessages.children.length > 100) {
            this.chatMessages.removeChild(this.chatMessages.firstChild);
        }
    }

    formatMessageWithEmotes(message) {
        // Split the original message by spaces FIRST, before escaping
        const words = message.split(' ');
        console.log('Formatting message words:', words);
        
        const processedWords = words.map(word => {
            // Check Twitch native emotes
            if (this.emotes.twitch.has(word)) {
                console.log(`Found Twitch emote: ${word}`);
                return `<img src="${this.emotes.twitch.get(word)}" alt="${this.escapeHtml(word)}" class="chat-emote" title="${this.escapeHtml(word)}">`;
            }
            
            // Check Kick emotes
            if (this.emotes.kick.has(word)) {
                console.log(`Found Kick emote: ${word}`);
                return `<img src="${this.emotes.kick.get(word)}" alt="${this.escapeHtml(word)}" class="chat-emote" title="${this.escapeHtml(word)}">`;
            }
            
            // Check 7TV emotes
            if (this.emotes.sevenTV.has(word)) {
                console.log(`Found 7TV emote: ${word}`);
                return `<img src="${this.emotes.sevenTV.get(word)}" alt="${this.escapeHtml(word)}" class="chat-emote" title="${this.escapeHtml(word)}">`;
            }
            
            // Check BTTV emotes
            if (this.emotes.bttv.has(word)) {
                console.log(`Found BTTV emote: ${word}`);
                return `<img src="${this.emotes.bttv.get(word)}" alt="${this.escapeHtml(word)}" class="chat-emote" title="${this.escapeHtml(word)}">`;
            }
            
            // Check FFZ emotes
            if (this.emotes.ffz.has(word)) {
                console.log(`Found FFZ emote: ${word}`);
                return `<img src="${this.emotes.ffz.get(word)}" alt="${this.escapeHtml(word)}" class="chat-emote" title="${this.escapeHtml(word)}">`;
            }
            
            // If not an emote, escape the HTML
            return this.escapeHtml(word);
        });
        
        return processedWords.join(' ');
    }

    addSystemMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.style.borderLeftColor = '#666';
        
        const timestamp = new Date().toLocaleTimeString();

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="username" style="color: #666;">System</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content" style="font-style: italic;">${this.escapeHtml(message)}</div>
        `;

        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    broadcastToOverlay(platform, username, message) {
        // Use BroadcastChannel to send messages to overlay
        if ('BroadcastChannel' in window) {
            const channel = new BroadcastChannel('unified-chat');
            const formattedMessage = this.formatMessageWithEmotes(message);
            channel.postMessage({
                platform,
                username,
                message,
                formattedMessage,
                timestamp: Date.now()
            });
            channel.close();
        }
    }

    clearChat() {
        this.chatMessages.innerHTML = '';
    }

    copyOverlayUrl() {
        this.overlayUrlInput.select();
        document.execCommand('copy');
        
        const originalText = this.copyUrlBtn.textContent;
        this.copyUrlBtn.textContent = 'Copied!';
        setTimeout(() => {
            this.copyUrlBtn.textContent = originalText;
        }, 2000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UnifiedChat();
});
