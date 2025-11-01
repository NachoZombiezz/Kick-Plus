# Hype Tool - Real-Time Kick Event Integration

## Overview
The Hype Tool now connects to Kick's live API to display real-time notifications for:
- **Subscriptions** - When someone subscribes to your channel
- **Gift Subscriptions** - When someone gifts subs to other viewers
- **Kick Gifts** - When someone sends Kick's virtual currency

## How It Works

### 1. Kick API Connection
The tool connects to Kick's WebSocket service using Pusher protocol:
- Fetches your channel ID from Kick's API
- Establishes a WebSocket connection to receive real-time events
- Subscribes to your channel and chatroom events

### 2. Event Monitoring
The system listens for these specific Kick events:
- `App\Events\SubscriptionEvent` - New subscriptions
- `App\Events\GiftedSubscriptionsEvent` - Gift subscriptions
- `App\Events\ChatMessageEvent` - Chat messages (for gift detection)

### 3. Display System
When an event is detected:
- The event is stored in localStorage
- The overlay (running in OBS) picks up the event
- An animated bar slides in showing the event details
- The bar auto-hides after the configured duration

## Setup Instructions

### 1. Configure the Tool
1. Open the Hype Tool in your browser
2. Enter your **exact Kick channel name** (username)
3. Choose bar position (top or bottom)
4. Set display duration (3-15 seconds)
5. Enable/disable specific event types
6. Click "Save Settings"

### 2. Connection Status
- **🟢 Connected** - Successfully connected to Kick
- **🔴 Disconnected** - Not connected or connection failed

### 3. Add to OBS
1. Copy the OBS Browser Source URL
2. In OBS, add a new "Browser" source
3. Paste the URL
4. Set dimensions to: **1920 x 150**
5. Position at top or bottom of your scene
6. The source will remain transparent until an event occurs

### 4. Testing
Use the test buttons to preview how events will appear:
- **Test Sub** - Preview a subscription notification
- **Test Gift Sub** - Preview a gift subscription notification
- **Test Kick Gift** - Preview a Kick gift notification

## Technical Details

### API Endpoints Used
- Channel Info: `https://kick.com/api/v2/channels/{username}`
- WebSocket: `wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c`

### Connection Features
- Auto-reconnect on disconnect (up to 5 attempts)
- Exponential backoff for reconnection
- Real-time event processing
- No authentication required (public channel events)

### Event Data Structure
```javascript
{
    type: 'sub' | 'gift-sub' | 'gift',
    username: 'viewer_name',
    amount: 1,
    timestamp: 1234567890
}
```

## Troubleshooting

### Connection Issues
1. **Verify channel name** - Must be exact (case-sensitive)
2. **Check browser console** - Look for error messages
3. **Test manually** - Use test buttons to verify overlay works
4. **Refresh page** - Sometimes helps reset the connection

### Events Not Showing
1. **Check event toggles** - Make sure event types are enabled
2. **Verify OBS source** - Check that browser source URL is correct
3. **Test connection** - Use test buttons to verify system works
4. **Check console logs** - Look for incoming events

### Browser Compatibility
- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ⚠️ May have WebSocket issues
- OBS Browser: ✓ Full support

## Security & Privacy
- No login required
- Only monitors public channel events
- No personal data stored
- All data stays local (localStorage only)

## Future Enhancements
- Custom sounds for each event type
- More animation styles
- Custom colors and themes
- Event history/log
- Multiple channel support
