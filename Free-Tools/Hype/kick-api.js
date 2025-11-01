// Kick API Integration for Real-Time Events

class KickEventListener {
    constructor(channelName) {
        this.channelName = channelName;
        this.channelId = null;
        this.chatroom = null;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isConnected = false;
    }

    async initialize() {
        try {
            // Get channel information from Kick API
            const channelData = await this.getChannelData();
            if (!channelData) {
                throw new Error('Channel not found');
            }

            this.channelId = channelData.id;
            this.chatroom = channelData.chatroom;

            console.log(`Channel ID: ${this.channelId}`);
            console.log(`Chatroom ID: ${this.chatroom.id}`);

            // Connect to Kick WebSocket
            await this.connectWebSocket();
            return true;
        } catch (error) {
            console.error('Failed to initialize:', error);
            return false;
        }
    }

    async getChannelData() {
        try {
            const response = await fetch(`https://kick.com/api/v2/channels/${this.channelName}`);
            if (!response.ok) {
                throw new Error('Channel not found');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching channel data:', error);
            return null;
        }
    }

    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            // Kick uses Pusher for WebSocket connections
            const pusherKey = 'eb1d5f283081a78b932c';
            const wsUrl = `wss://ws-us2.pusher.com/app/${pusherKey}?protocol=7&client=js&version=7.4.0&flash=false`;

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected to Kick');
                this.isConnected = true;
                this.reconnectAttempts = 0;

                // Subscribe to chatroom channel for chat events and gifts
                this.subscribeToChannel(`chatrooms.${this.chatroom.id}.v2`);
                
                // Subscribe to channel events for subscriptions and gifted subs
                this.subscribeToChannel(`channel.${this.channelId}`);
                
                // Additional subscription patterns that Kick uses
                this.subscribeToChannel(`App.Models.Channel.${this.channelId}`);

                console.log('Subscribed to all event channels');
                resolve();
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket closed');
                this.isConnected = false;
                this.attemptReconnect();
            };
        });
    }

    subscribeToChannel(channelName) {
        const subscribeMessage = {
            event: 'pusher:subscribe',
            data: {
                auth: '',
                channel: channelName
            }
        };
        this.ws.send(JSON.stringify(subscribeMessage));
        console.log(`Subscribed to: ${channelName}`);
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);

            // Handle different event types
            switch (message.event) {
                case 'pusher:connection_established':
                    console.log('Pusher connection established');
                    break;

                case 'pusher_internal:subscription_succeeded':
                    console.log('Subscription successful');
                    break;

                // Subscription event (when someone subscribes)
                case 'App\\Events\\SubscriptionEvent':
                    this.handleSubscription(JSON.parse(message.data));
                    break;

                // Gift subscription event (when someone gifts subs)
                case 'App\\Events\\GiftedSubscriptionsEvent':
                    this.handleGiftedSubscriptions(JSON.parse(message.data));
                    break;

                // Chat message event (used for detecting gifts and other events)
                case 'App\\Events\\ChatMessageEvent':
                    this.handleChatMessage(JSON.parse(message.data));
                    break;

                // Gift event (when someone sends Kick gifts/currency)
                case 'App\\Events\\GiftEvent':
                    this.handleGift(JSON.parse(message.data));
                    break;

                // User gifted event (alternative gift event)
                case 'App\\Events\\UserGiftedEvent':
                    this.handleGift(JSON.parse(message.data));
                    break;

                default:
                    // Log unknown events for debugging
                    if (message.event && !message.event.startsWith('pusher:')) {
                        console.log('Event:', message.event);
                        if (message.data) {
                            console.log('Data:', message.data);
                        }
                    }
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    handleSubscription(data) {
        console.log('Subscription event:', data);
        
        // Kick subscription event structure
        const event = {
            type: 'sub',
            username: data.username || data.subscriber?.username || data.user?.username || 'Anonymous',
            amount: 1,
            months: data.months || 1,
            timestamp: Date.now()
        };

        console.log('Processed subscription:', event);
        this.triggerHypeEvent(event);
    }

    handleGiftedSubscriptions(data) {
        console.log('Gifted subscriptions event:', data);
        
        // Kick gifted subscription event structure
        const event = {
            type: 'gift-sub',
            username: data.gifter_username || data.gifter?.username || data.username || 'Anonymous',
            amount: data.gifted_usernames?.length || data.quantity || data.count || 1,
            timestamp: Date.now()
        };

        console.log('Processed gift subscription:', event);
        this.triggerHypeEvent(event);
    }

    handleGift(data) {
        console.log('Gift event:', data);
        
        // Kick gift event structure
        const event = {
            type: 'gift',
            username: data.sender?.username || data.gifter_username || data.username || 'Anonymous',
            amount: data.amount || data.quantity || 1,
            giftName: data.gift?.name || data.gift_name || 'Kick Gift',
            timestamp: Date.now()
        };

        console.log('Processed gift:', event);
        this.triggerHypeEvent(event);
    }

    handleChatMessage(data) {
        // Some gifts may come through chat messages with metadata
        if (data.metadata) {
            // Check for gift metadata
            if (data.metadata.gift || data.type === 'gift') {
                const event = {
                    type: 'gift',
                    username: data.sender?.username || 'Anonymous',
                    amount: data.metadata.gift?.amount || 1,
                    giftName: data.metadata.gift?.name || 'Gift',
                    timestamp: Date.now()
                };

                console.log('Processed gift from chat:', event);
                this.triggerHypeEvent(event);
            }
        }
    }

    triggerHypeEvent(event) {
        console.log('🎉 Triggering hype event:', event);
        
        // Store event in localStorage for overlay to pick up
        localStorage.setItem('hypeEvent', JSON.stringify(event));

        // Also dispatch a custom event for real-time updates
        window.dispatchEvent(new CustomEvent('kickHypeEvent', { detail: event }));

        // Log to console for debugging
        const eventTypes = {
            'sub': 'Subscription',
            'gift-sub': 'Gift Subscription',
            'gift': 'Kick Gift'
        };
        
        const eventInfo = event.type === 'gift-sub' 
            ? `${event.username} gifted ${event.amount} sub${event.amount > 1 ? 's' : ''}!`
            : event.type === 'gift'
            ? `${event.username} sent ${event.amount} ${event.giftName || 'gift'}!`
            : `${event.username} subscribed!`;
            
        console.log(`🎉 ${eventTypes[event.type]}: ${eventInfo}`);
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            console.log(`Reconnecting in ${delay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connectWebSocket().catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, delay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }

    getConnectionStatus() {
        return {
            connected: this.isConnected,
            channelId: this.channelId,
            channelName: this.channelName
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KickEventListener;
}
