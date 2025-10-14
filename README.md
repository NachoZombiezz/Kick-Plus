# The Look Up

A clean, extracted web application that allows users to check the status of Kick streamers and their viewers. This application provides detailed information about streamers and their followers using the Kick.com API.

## Features

### Streamer Information
- Profile picture and username
- Account creation date and age
- Follower count
- Verification status
- Social media links (Twitter, Instagram, YouTube, Discord)
- Bio information
- Developer information (IDs, chatroom details)

### Viewer Information
- Profile picture and username
- Following status and follow date
- Follow age calculation
- Subscription status and length
- Gifted subscriptions count
- User badges (staff, moderator, VIP, etc.)
- Ban status

## Usage

1. **Basic Search**: Enter a Kick streamer username and click "Search" to get streamer information
2. **Viewer Lookup**: Optionally enter a viewer username to check their status in relation to the streamer
3. **URL Parameters**: Support for direct links with parameters:
   - `?streamer=username` - Pre-fill streamer field
   - `?viewer=username` - Pre-fill viewer field
   - `?streamer=username&viewer=username` - Pre-fill both fields

## File Structure

```
kick-look-up/
├── index.html          # Main HTML file
├── css/
│   ├── style.css       # Main styling
│   └── components.css  # Component-specific styles
├── js/
│   └── look-up.js      # Main JavaScript functionality
├── assets/
│   ├── login_pfp.png   # Default profile picture
│   ├── verified.svg    # Verified badge
│   ├── staff.svg       # Staff badge
│   ├── moderator.svg   # Moderator badge
│   ├── vip.svg         # VIP badge
│   ├── founder.svg     # Founder badge
│   ├── og.svg          # OG badge
│   ├── broadcaster.svg # Broadcaster badge
│   ├── subscriber.svg  # Subscriber badge
│   ├── sub_gifter-*.svg # Sub gifter badges (1, 25, 50, 100, 200)
│   ├── discordLogo.svg # Discord icon
│   ├── instagramLogo.svg # Instagram icon
│   ├── xLogo.svg       # X (Twitter) icon
│   └── ytLogo.svg      # YouTube icon
└── README.md           # This file
```

## API Endpoints Used

- **Streamer Info**: `https://kick.com/api/v2/channels/{username}`
- **Viewer Info**: `https://kick.com/api/v2/channels/{streamer}/users/{viewer}`

## Technical Details

### Dependencies
- No external libraries required
- Uses native JavaScript (ES6+)
- CSS Grid and Flexbox for layout
- CSS custom properties for theming

### Browser Support
- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- Mobile responsive design
- Progressive enhancement

### Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Caching**: Streamer data is cached to reduce API calls
- **URL Integration**: Shareable links with pre-filled data
- **Accessibility**: Keyboard navigation and screen reader friendly

## Styling

The application features a modern gradient design with:
- Dark overlay modal for results
- Card-based layout for information display
- Smooth animations and transitions
- Color-coded status indicators
- Responsive breakpoints for mobile devices

### Color Scheme
- Primary: `#00ff88` (Bright Green) and `#32cd32` (Lime Green)
- **Dark Mode**: Gradient from `#2c2c2c` (Dark Gray) to `#1a1a1a` (Very Dark Gray)
- **Light Mode**: Gradient from `#e8e8e8` (Light Gray) to `#d0d0d0` (Medium Gray)
- Text: White/Dark with various opacity levels based on theme
- Status indicators: Green (positive), Red (negative), Blue (neutral)

## Customization

### Adding New Badges
1. Create SVG file in `assets/` directory
2. Add badge type to `BADGE_ORDER` array in JavaScript
3. Update `getBadgeImageUrl()` function if needed

### Modifying Styles
- Main layout: Edit `css/style.css`
- Component styles: Edit `css/components.css`
- Color scheme: Update CSS custom properties

### Extending Functionality
- Add new API endpoints in the JavaScript file
- Implement additional data processing
- Add new UI components

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Grid | 57+ | 52+ | 10.1+ | 16+ |
| Fetch API | 42+ | 39+ | 10.1+ | 14+ |
| CSS Variables | 49+ | 31+ | 9.1+ | 15+ |
| ES6 Classes | 49+ | 45+ | 9+ | 13+ |

## Performance

- **Lazy Loading**: Images and assets loaded as needed
- **API Caching**: Reduces redundant network requests
- **Minification Ready**: Code structure supports minification
- **Progressive Enhancement**: Core functionality works without JavaScript

## Security Considerations

- **CORS**: Relies on Kick.com API CORS policy
- **Input Validation**: Basic client-side validation
- **XSS Prevention**: Uses textContent instead of innerHTML where possible
- **No Sensitive Data**: No API keys or personal information stored

## License

This is an extracted and cleaned version of the original The Look Up functionality. Use responsibly and in accordance with Kick.com's terms of service.

## Contributing

To contribute to this project:
1. Ensure changes maintain compatibility with the Kick.com API
2. Follow the existing code style and structure
3. Test on multiple browsers and devices
4. Update documentation as needed

## Troubleshooting

### Common Issues

1. **Streamer not found**: Verify the username is correct and the streamer exists
2. **Viewer data not loading**: Ensure the viewer has interacted with the streamer's channel
3. **Images not loading**: Check that asset files are in the correct directory
4. **CORS errors**: The Kick.com API must allow cross-origin requests

### Debug Mode

Open browser developer tools to see console logs with API responses and error details.