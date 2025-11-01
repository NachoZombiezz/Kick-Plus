/**
 * The Look Up - JavaScript Functionality
 * Extracts streamer and viewer information from Kick.com API
 */

// Configuration and constants
const API_BASE_URL = 'https://kick.com/api/v2/channels/';
const BADGE_ORDER = ['staff', 'founder', 'verified', 'moderator', 'vip', 'og', 'broadcaster', 'subscriber', 'sub_gifter'];

// Global state
let streamerInfoArray = [];

// DOM elements
const elements = {
    getStreamerButton: document.getElementById('get-streamer'),
    lookUpModule: document.querySelector('.look-up-module'),
    resultsContainer: document.querySelector('.results-container'),
    streamerCardModule: document.querySelector('.streamer-card-module'),
    viewerCardModule: document.querySelector('.viewer-card-module'),
    moduleSeparator: document.querySelector('.module-separator'),
    kicknameInput: document.getElementById('kickname'),
    viewernameInput: document.getElementById('viewername'),
    themeButtons: document.querySelectorAll('.theme-btn'),
    resultsCloseBtn: document.querySelector('.results-close-btn'),
    
    // Streamer elements
    streamerPfp: document.getElementById('pfp-kick'),
    streamerName: document.getElementById('streamer-name'),
    streamerStaff: document.getElementById('streamer-staff'),
    streamerVerified: document.getElementById('streamer-verified'),
    streamerCreationDate: document.getElementById('streamer-creation-date'),
    streamerAge: document.getElementById('streamer-age'),
    streamerFollowerCount: document.getElementById('streamer-follower-count'),
    streamerLiveStatus: document.getElementById('streamer-live-status'),
    streamerBio: document.getElementById('streamer-bio'),
    streamerId: document.getElementById('streamer-id'),
    streamerUserId: document.getElementById('streamer-user-id'),
    streamerChatroomId: document.getElementById('streamer-chatroom-id'),
    devInfoToggleBtn: document.getElementById('dev-info-toggle'),
    devInfoContainer: document.getElementById('dev-info-container'),
    
    // Social links
    streamerSocials: document.querySelector('.streamer-socials'),
    streamerTwitter: document.getElementById('streamer-twitter'),
    streamerInstagram: document.getElementById('streamer-instagram'),
    streamerYoutube: document.getElementById('streamer-youtube'),
    streamerDiscord: document.getElementById('streamer-discord'),
    streamerFacebook: document.getElementById('streamer-facebook'),
    streamerTiktok: document.getElementById('streamer-tiktok'),
    
    // Viewer elements
    viewerPfp: document.getElementById('pfp-kick-viewer'),
    viewerName: document.getElementById('viewer-name'),
    viewerStaff: document.getElementById('viewer-staff'),
    viewerVerified: document.getElementById('viewer-verified'),
    viewerCreationDate: document.getElementById('viewer-creation-date'),
    viewerAge: document.getElementById('viewer-age'),
    viewerFollows: document.getElementById('viewer-follows'),
    subscriber: document.getElementById('subscriber'),
    subLength: document.getElementById('sub-length'),
    giftedSubs: document.getElementById('gifted-subs'),
    banned: document.getElementById('banned'),
    viewerBadges: document.querySelector('.viewer-badges'),
    
    // Live stream elements
    liveStreamSection: document.getElementById('live-stream-section'),
    streamTitle: document.getElementById('stream-title'),
    streamViewers: document.getElementById('stream-viewers'),
    streamDuration: document.getElementById('stream-duration'),
    streamEmbed: document.getElementById('stream-embed'),
    watchOnKick: document.getElementById('watch-on-kick'),
    toggleLiveStream: document.getElementById('toggle-live-stream')
};

/**
 * Utility Functions
 */

// Theme Management (themes are managed in settings page)
function initializeTheme() {
    const savedTheme = localStorage.getItem('lookupTheme') || 'green';
    document.body.className = `theme-${savedTheme}`;
}

// Listen for theme changes from other tabs/windows
window.addEventListener('storage', function(e) {
    if (e.key === 'lookupThemeChange') {
        const currentTheme = localStorage.getItem('lookupTheme') || 'green';
        document.body.className = `theme-${currentTheme}`;
    }
});

// Get URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Show alert and focus input
function showAlertAndFocus(input, message) {
    alert(message);
    input.focus();
}

// Check if input is empty
function isEmptyInput(input, errorMessage) {
    if (input.value.trim() === '') {
        showAlertAndFocus(input, errorMessage);
        return true;
    }
    return false;
}

// Calculate account age
function calculateAccountAge(dateString) {
    if (!dateString || dateString === 'Wed Dec 31 1969 19:00:00 GMT-0500 (Eastern Standard Time)') {
        return '0y 0m 0d';
    }
    
    const accountDate = new Date(dateString);
    if (isNaN(accountDate.getTime())) {
        console.warn('Invalid date string:', dateString);
        return '0y 0m 0d';
    }
    
    const now = new Date();
    let years = now.getFullYear() - accountDate.getFullYear();
    let months = now.getMonth() - accountDate.getMonth();
    let days = now.getDate() - accountDate.getDate();
    
    if (days < 0) {
        months -= 1;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    
    return `${years}y ${months}m ${days}d`;
}

// Format date
function formatDate(dateString) {
    if (!dateString) {
        console.warn('No date string provided');
        return 'NA';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'NA';
    }
    
    const options = {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    };
    
    return date.toLocaleDateString(undefined, options);
}

// Get badge image URL - uses PNG files for all badges
function getBadgeImageUrl(badgeType, subGiftCount = 0) {
    if (badgeType === 'sub_gifter') {
        if (subGiftCount >= 200) return '../assets/subGifter200.png';
        if (subGiftCount >= 100) return '../assets/subGifter100.png';
        if (subGiftCount >= 50) return '../assets/subGifter50.png';
        if (subGiftCount >= 25) return '../assets/subGifter25.png';
        return '../assets/subGifter.png';
    }
    
    // Map badge types to PNG files
    const badgeMap = {
        'verified': '../assets/verified.png',
        'staff': '../assets/staff.png', // Now using PNG version
        'broadcaster': '../assets/broadcaster.png',
        'founder': '../assets/founder.png',
        'moderator': '../assets/moderator.png',
        'og': '../assets/og.png',
        'sidekick': '../assets/sidekick.png',
        'subscriber': '../assets/subscriber.png',
        'vip': '../assets/vip.png'
    };
    
    return badgeMap[badgeType] || `../assets/${badgeType}.png`;
}

/**
 * Extract profile picture from v2 API response with enhanced field checking
 */
function extractV2ProfilePicture(data) {
    // Priority list for v2 API profile picture fields
    const profilePicFields = [
        // Direct v2 response fields
        () => data.profile_image,
        () => data.profile_picture, 
        () => data.avatar,
        () => data.image,
        
        // User nested fields (common in v2)
        () => data.user?.profile_image,
        () => data.user?.profile_picture,
        () => data.user?.avatar,
        () => data.user?.image,
        
        // Channel nested fields (v2 channels specific)
        () => data.channel?.profile_image,
        () => data.channel?.profile_picture,
        () => data.channel?.avatar,
        () => data.channel?.image,
        
        // Owner/Streamer nested fields
        () => data.owner?.profile_image,
        () => data.owner?.profile_picture,
        () => data.owner?.avatar,
        () => data.streamer?.profile_image,
        () => data.streamer?.profile_picture,
        () => data.streamer?.avatar,
        
        // Media nested fields
        () => data.media?.profile_image,
        () => data.media?.profile_picture,
        () => data.media?.avatar,
        () => data.user?.media?.profile_image,
        () => data.user?.media?.profile_picture,
        () => data.user?.media?.avatar,
        
        // Images object variations
        () => data.images?.original,
        () => data.images?.large,
        () => data.images?.medium,
        () => data.images?.profile,
        () => data.user?.images?.original,
        () => data.user?.images?.profile,
        
        // Legacy fallbacks
        () => data.user?.profile_pic,
        () => data.profile_pic,
        () => data.thumbnail,
        () => data.user?.thumbnail
    ];
    
    for (let i = 0; i < profilePicFields.length; i++) {
        try {
            const profilePic = profilePicFields[i]();
            if (profilePic && typeof profilePic === 'string' && profilePic.trim() !== '') {
                // Validate and normalize the URL
                const normalizedUrl = normalizeProfilePicUrl(profilePic);
                if (normalizedUrl) {
                    return normalizedUrl;
                }
            }
        } catch (error) {
            // Continue to next field if error occurs
            continue;
        }
    }
    
    return null;
}

/**
 * Normalize and validate profile picture URLs
 */
function normalizeProfilePicUrl(url) {
    if (!url || typeof url !== 'string') return null;
    
    const trimmedUrl = url.trim();
    
    // Check if it's a valid URL
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
    }
    
    // Check if it's a relative path that needs kick.com domain
    if (trimmedUrl.startsWith('/')) {
        return `https://kick.com${trimmedUrl}`;
    }
    
    // If it looks like a path without domain, try kick.com
    if (trimmedUrl.includes('/') && !trimmedUrl.includes('.')) {
        return `https://kick.com/${trimmedUrl}`;
    }
    
    return trimmedUrl;
}

// Generate fallback profile picture URL patterns
function generateFallbackProfilePic(username) {
    // Try common Kick.com profile picture patterns
    const patterns = [
        // v2 API specific patterns
        `https://files.kick.com/images/channels/${username}/profile_image`,
        `https://cdn.kick.com/channels/${username}/avatar.jpg`,
        `https://cdn.kick.com/channels/${username}/profile.jpg`,
        `https://files.kick.com/avatars/channels/${username}.jpg`,
        `https://files.kick.com/avatars/channels/${username}.png`,
        // Original patterns
        `https://files.kick.com/images/user/${username}/profile_image`,
        `https://files.kick.com/images/user/${username}/profile_pic`,
        `https://kick.com/images/user/${username}/profile_image`,
        `https://kick.com/images/user/${username}/avatar`,
        `https://cdn.kick.com/user/${username}/profile_image.jpg`,
        `https://cdn.kick.com/user/${username}/profile.jpg`,
        `https://cdn.kick.com/user/${username}/profile_image.png`,
        `https://cdn.kick.com/user/${username}/profile.png`,
        `https://files.kick.com/images/users/${username}/profile_image`,
        `https://files.kick.com/images/users/${username}/profile_pic`,
        `https://kick.com/api/user/${username}/avatar`,
        `https://kick.com/storage/user/${username}/profile.jpg`,
        `https://kick.com/storage/user/${username}/profile.png`,
        // Try with user ID patterns (common for some APIs)
        `https://kick.com/images/users/${username}/avatar.jpg`,
        `https://kick.com/images/users/${username}/avatar.png`,
        // Try different subdirectories
        `https://files.kick.com/avatars/${username}.jpg`,
        `https://files.kick.com/avatars/${username}.png`,
        `https://cdn.kick.com/avatars/${username}.jpg`,
        `https://cdn.kick.com/avatars/${username}.png`
    ];
    
    return patterns;
}

// Generate Gravatar URL as final fallback
function generateGravatarUrl(username) {
    // Create a simple hash from username for Gravatar
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        const char = username.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    const simpleHash = Math.abs(hash).toString(16);
    
    // Use a more generic placeholder service that doesn't require email
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=128&background=random&color=fff`;
}

/**
 * Try to fetch additional user data from alternative endpoints
 * Returns an object with profile_pic and created_at if found
 */
async function fetchAlternativeUserData(username) {
    const alternativeEndpoints = [
        `https://kick.com/api/v2/channels/${username}`, // v2 channels endpoint for created_at and profile info
        `https://kick.com/api/v1/users/${username}`,
        `https://kick.com/api/v2/users/${username}`,
        `https://kick.com/api/v1/user/${username}`,
        `https://kick.com/api/v2/user/${username}`,
        `https://kick.com/api/users/${username}`,
        `https://kick.com/api/user/${username}`
    ];
    
    for (const endpoint of alternativeEndpoints) {
        try {
            const response = await fetch(endpoint);
            if (response.ok) {
                const responseData = await response.json();
                
                // Handle different response structures
                let userData = responseData;
                if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                    userData = responseData.data[0]; // Get first user from data array
                } else if (responseData.data) {
                    userData = responseData.data; // Get user data from data object
                }
                
                // Check for profile picture using v2-enhanced extraction
                const profilePic = extractV2ProfilePicture(userData);
                
                // Check for created_at field - prioritize v2 channels endpoint format
                const createdAt = userData.created_at || // Direct field
                                userData.user?.created_at || // User level
                                userData.channel?.created_at || // Channel level
                                userData.chatroom?.created_at; // Chatroom level
                
                // Check for category information in alternative endpoints
                const category = userData.category || // Direct field
                               userData.livestream?.category || // Livestream category
                               userData.channel?.category || // Channel category
                               userData.current_livestream?.category || // Current stream category
                               null;
                
                const foundData = {};
                
                if (profilePic) {
                    foundData.profile_pic = profilePic;
                }
                
                if (createdAt) {
                    foundData.created_at = createdAt;
                }
                
                if (category) {
                    foundData.category = category;
                }
                
                // Return data if we found anything useful
                if (foundData.profile_pic || foundData.created_at || foundData.category) {
                    return foundData;
                }
            }
        } catch (error) {
            // Silently continue to next endpoint
        }
    }
    
    return null;
}

/**
 * API Functions
 */

// Get streamer information
async function getStreamerInfo() {
    const streamerUsername = elements.kicknameInput.value.trim();
    
    try {
        // Check if already cached
        const cachedStreamer = streamerInfoArray.find(s => s.slug === streamerUsername);
        if (cachedStreamer) {
            updateStreamerCard(cachedStreamer);
            return;
        }
        
        // Add loading state
        elements.getStreamerButton.classList.add('loading');
        elements.getStreamerButton.textContent = 'Loading...';
        
        // Fetch from API
        const response = await fetch(`${API_BASE_URL}${streamerUsername}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Process streamer data
        const streamerData = {
            id: data.id,
            user_id: data.user_id,
            slug: data.slug,
            username: data.user?.username || data.slug, // Preserve case-sensitive username
            is_banned: data.is_banned,
            followers_count: data.followers_count,
            verified: data.verified,
            staff: data.staff || data.user?.staff || data.is_staff || data.user?.is_staff ||
                   data.role === 'staff' || data.user?.role === 'staff' ||
                   data.user_type === 'staff' || data.user?.user_type === 'staff' ||
                   (data.badges && data.badges.some(badge => badge.type === 'staff')) ||
                   (data.user?.badges && data.user.badges.some(badge => badge.type === 'staff')) || false,
            is_live: data.livestream?.is_live || false,
            livestream: data.livestream || null, // Include full livestream data
            bio: data.user?.bio?.trim() || '',
            instagram: data.user?.instagram || '',
            twitter: data.user?.twitter || '',
            youtube: data.user?.youtube || '',
            discord: data.user?.discord || '',
            facebook: data.user?.facebook || '',
            tiktok: data.user?.tiktok || '',
            profile_pic: extractV2ProfilePicture(data), // Use v2-specific extraction function
            chatroom_id: data.chatroom?.id || '',
            chatroom_created_at: data.chatroom?.created_at || '',
            created_at: data.created_at || // Try channel level first (v2 channels format)
                       data.user?.created_at || // Try user level
                       data.channel?.created_at || // Try nested channel
                       data.chatroom?.created_at || '' // Try chatroom as fallback
        };
        
        // If missing profile picture, created_at, or category, try alternative endpoints
        if (!streamerData.profile_pic || !streamerData.created_at || !streamerData.category) {
            const alternativeData = await fetchAlternativeUserData(streamerUsername);
            if (alternativeData) {
                if (alternativeData.profile_pic && !streamerData.profile_pic) {
                    streamerData.profile_pic = alternativeData.profile_pic;
                }
                if (alternativeData.created_at && !streamerData.created_at) {
                    streamerData.created_at = alternativeData.created_at;
                }
                if (alternativeData.category && !streamerData.category) {
                    streamerData.category = alternativeData.category;
                }
            }
        }
        
        // Check for staff badge by looking up the streamer as a viewer
        const hasStaffBadge = await checkStreamerStaffBadge(streamerUsername);
        streamerData.staff = hasStaffBadge;
        
        // Cache the data
        streamerInfoArray.push(streamerData);
        
        // Update UI
        updateStreamerCard(streamerData);
        
    } catch (error) {
        console.error('Error fetching streamer info:', error);
        showError('Failed to fetch streamer information. Please check the username and try again.');
    } finally {
        // Remove loading state
        elements.getStreamerButton.classList.remove('loading');
        elements.getStreamerButton.textContent = 'Search';
    }
}

// Get viewer information
async function getViewerInfo(viewerUsername) {
    if (!viewerUsername.trim()) return;
    
    const streamerUsername = elements.kicknameInput.value.trim();
    
    try {
        const response = await fetch(`${API_BASE_URL}${streamerUsername}/users/${viewerUsername}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Process badges and sort them
        const badges = data.badges || [];
        const sortedBadges = badges.sort((a, b) => 
            BADGE_ORDER.indexOf(a.type) - BADGE_ORDER.indexOf(b.type)
        );
        
        // Get gifted subs count
        let giftedSubsCount = 0;
        for (const badge of badges) {
            if (badge.type === 'sub_gifter') {
                giftedSubsCount = badge.count || 0;
                break;
            }
        }
        
        // Update viewer card
        updateViewerCard(data, sortedBadges, giftedSubsCount);
        
    } catch (error) {
        console.error('Error fetching viewer info:', error);
        showError('Failed to fetch viewer information. Please check the username and try again.');
    }
}

// Check if streamer has staff badge by looking them up as a viewer
async function checkStreamerStaffBadge(streamerUsername) {
    try {
        // Use a known large channel as the "host" to check the streamer as a viewer
        // We'll try a few different channels in case one doesn't work
        const hostChannels = ['xqc', 'trainwreckstv', 'amouranth', 'summit1g'];
        
        for (const hostChannel of hostChannels) {
            try {
                const response = await fetch(`${API_BASE_URL}${hostChannel}/users/${streamerUsername}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    // Check if they have a staff badge
                    const badges = data.badges || [];
                    const hasStaffBadge = badges.some(badge => badge.type === 'staff');
                    
                    return hasStaffBadge;
                }
            } catch (error) {
                continue;
            }
        }
        
        return false;
        
    } catch (error) {
        console.error('Error checking streamer staff badge:', error);
        return false;
    }
}

/**
 * UI Update Functions
 */

// Update streamer card
function updateStreamerCard(streamerData) {
    // Profile picture with enhanced debugging and fallback
    let profilePicUrl = streamerData.profile_pic;
    let attemptCount = 0;
    
    // Handle different possible profile picture formats
    if (profilePicUrl) {
        // If it's a relative URL, make it absolute
        if (profilePicUrl.startsWith('/')) {
            profilePicUrl = `https://kick.com${profilePicUrl}`;
        }
        // If it doesn't start with http, assume it's relative
        else if (!profilePicUrl.startsWith('http')) {
            profilePicUrl = `https://kick.com/${profilePicUrl}`;
        }
    } else {
        // Try fallback patterns for unverified users
        const fallbackUrls = generateFallbackProfilePic(streamerData.username);
        
        // Try the first fallback URL
        if (fallbackUrls.length > 0) {
            profilePicUrl = fallbackUrls[0];
        }
    }
    
    // Set profile picture with enhanced error handling
    elements.streamerPfp.src = profilePicUrl || '../assets/login_pfp.png';
    
    // Add error handler to try multiple fallback URLs
    elements.streamerPfp.onerror = function() {
        attemptCount++;
        
        if (!streamerData.profile_pic && attemptCount <= 14) {
            // Try next fallback URL for unverified users
            const fallbackUrls = generateFallbackProfilePic(streamerData.username);
            if (fallbackUrls[attemptCount - 1]) {
                this.src = fallbackUrls[attemptCount - 1];
                return;
            }
        }
        
        // Try Gravatar-style service as very last fallback before default
        if (attemptCount === 15) {
            const gravatarUrl = generateGravatarUrl(streamerData.username);
            this.src = gravatarUrl;
            return;
        }
        
        // Final fallback to default image
        this.src = '../assets/login_pfp.png';
        this.onerror = null; // Prevent infinite loop
    };
    
    // Basic info
    elements.streamerName.textContent = streamerData.username;
    
    // Verified badge
    if (elements.streamerVerified) {
        elements.streamerVerified.style.display = streamerData.verified ? 'inline' : 'none';
    }
    
    // Staff badge
    if (elements.streamerStaff) {
        elements.streamerStaff.style.display = streamerData.staff ? 'inline' : 'none';
    }
    
    elements.streamerCreationDate.textContent = formatDate(streamerData.created_at);
    
    // Calculate and display age
    const calculatedAge = calculateAccountAge(streamerData.created_at);
    elements.streamerAge.textContent = calculatedAge;
    
    elements.streamerFollowerCount.textContent = streamerData.followers_count?.toLocaleString() || '0';
    
    // Live status
    if (elements.streamerLiveStatus) {
        elements.streamerLiveStatus.textContent = streamerData.is_live ? 'Live' : 'Offline';
        elements.streamerLiveStatus.style.color = streamerData.is_live ? '#00ff00' : '#ff6b6b';
    }
    
    elements.streamerBio.textContent = streamerData.bio;
    
    // Social links
    if (streamerData.twitter) {
        elements.streamerTwitter.href = `https://twitter.com/${streamerData.twitter}`;
        elements.streamerTwitter.style.display = 'inline';
    } else {
        elements.streamerTwitter.style.display = 'none';
    }
    
    if (streamerData.instagram) {
        elements.streamerInstagram.href = `https://instagram.com/${streamerData.instagram}`;
        elements.streamerInstagram.style.display = 'inline';
    } else {
        elements.streamerInstagram.style.display = 'none';
    }
    
    if (streamerData.youtube) {
        elements.streamerYoutube.href = `https://youtube.com/${streamerData.youtube}`;
        elements.streamerYoutube.style.display = 'inline';
    } else {
        elements.streamerYoutube.style.display = 'none';
    }
    
    if (streamerData.discord) {
        elements.streamerDiscord.href = `https://discord.com/invite/${streamerData.discord}`;
        elements.streamerDiscord.style.display = 'inline';
    } else {
        elements.streamerDiscord.style.display = 'none';
    }
    
    if (streamerData.facebook) {
        elements.streamerFacebook.href = `https://facebook.com/${streamerData.facebook}`;
        elements.streamerFacebook.style.display = 'inline';
    } else {
        elements.streamerFacebook.style.display = 'none';
    }
    
    if (streamerData.tiktok) {
        elements.streamerTiktok.href = `https://tiktok.com/@${streamerData.tiktok}`;
        elements.streamerTiktok.style.display = 'inline';
    } else {
        elements.streamerTiktok.style.display = 'none';
    }
    
    // Hide entire social container if no social links exist
    const hasSocials = streamerData.twitter || streamerData.instagram || streamerData.youtube || 
                      streamerData.discord || streamerData.facebook || streamerData.tiktok;
    if (elements.streamerSocials) {
        elements.streamerSocials.style.display = hasSocials ? 'flex' : 'none';
    }
    
    // Live stream section
    updateLiveStreamSection(streamerData);
    
    // Developer info
    elements.streamerId.textContent = streamerData.id;
    elements.streamerUserId.textContent = streamerData.user_id;
    elements.streamerChatroomId.textContent = streamerData.chatroom_id;
}

// Update viewer card
function updateViewerCard(viewerData, sortedBadges, giftedSubsCount) {
    // Profile picture
    elements.viewerPfp.src = viewerData.profile_pic || '../assets/login_pfp.png';
    
    // Basic info
    elements.viewerName.textContent = viewerData.username;
    
    // Verified badge
    if (elements.viewerVerified) {
        const hasVerifiedBadge = viewerData.badges && viewerData.badges.some(badge => badge.type === 'verified');
        elements.viewerVerified.style.display = hasVerifiedBadge ? 'inline' : 'none';
    }
    
    // Staff badge
    if (elements.viewerStaff) {
        const hasStaffBadge = viewerData.badges && viewerData.badges.some(badge => badge.type === 'staff');
        elements.viewerStaff.style.display = hasStaffBadge ? 'inline' : 'none';
    }
    
    // Following info
    const isFollowing = !!viewerData.following_since;
    elements.viewerCreationDate.textContent = formatDate(viewerData.following_since);
    elements.viewerAge.textContent = calculateAccountAge(viewerData.following_since);
    elements.viewerFollows.textContent = isFollowing ? 'Yes' : 'No';
    elements.viewerFollows.className = isFollowing ? 'follow-status following' : 'follow-status not-following';
    
    // Subscription info
    const isSubscribed = viewerData.subscribed_for > 0;
    elements.subscriber.textContent = isSubscribed ? 'Yes' : 'No';
    elements.subscriber.className = isSubscribed ? 'sub-status subscribed' : 'sub-status not-subscribed';
    elements.subLength.textContent = `${viewerData.subscribed_for || 0} Months`;
    elements.giftedSubs.textContent = `${giftedSubsCount} Subs`;
    
    // Ban status
    const isBanned = !!viewerData.is_banned;
    elements.banned.textContent = isBanned ? 'Yes' : 'No';
    
    // Badges
    updateViewerBadges(sortedBadges, giftedSubsCount);
}

// Update live stream section
function updateLiveStreamSection(streamerData) {
    if (!elements.liveStreamSection) return;
    
    if (streamerData.is_live) {
        // Show the toggle button when streamer is live
        if (elements.toggleLiveStream) {
            elements.toggleLiveStream.style.display = 'flex';
            
            // Remove any existing click handlers
            elements.toggleLiveStream.onclick = null;
            
            // Add toggle functionality
            elements.toggleLiveStream.onclick = function() {
                const isHidden = elements.liveStreamSection.style.display === 'none' || 
                               elements.liveStreamSection.style.display === '';
                
                if (isHidden) {
                    // Show live stream section
                    elements.liveStreamSection.style.display = 'block';
                    elements.toggleLiveStream.querySelector('.toggle-text').textContent = 'Hide Live Stream';
                } else {
                    // Hide live stream section
                    elements.liveStreamSection.style.display = 'none';
                    elements.toggleLiveStream.querySelector('.toggle-text').textContent = 'Show Live Stream';
                }
            };
        }
        
        // Initially hide the live stream section (user must click button to show)
        elements.liveStreamSection.style.display = 'none';
        
        // Update stream info
        if (elements.streamTitle) {
            const streamTitle = streamerData.livestream?.session_title || 
                              streamerData.livestream?.title || 
                              streamerData.title ||
                              `${streamerData.username} is live!`;
            elements.streamTitle.textContent = streamTitle;
        }
        
        if (elements.streamViewers) {
            const viewerCount = streamerData.livestream?.viewer_count || 
                              streamerData.viewer_count || 
                              streamerData.viewers || 0;
            elements.streamViewers.textContent = `${viewerCount.toLocaleString()} viewers`;
        }
        
        if (elements.streamDuration) {
            const startTime = streamerData.livestream?.start_time || 
                            streamerData.livestream?.created_at || 
                            streamerData.start_time;
            if (startTime) {
                const duration = calculateStreamDuration(startTime);
                elements.streamDuration.textContent = duration;
            } else {
                elements.streamDuration.textContent = 'Live';
            }
        }
        
        // Set up stream embed
        if (elements.streamEmbed) {
            const embedUrl = `https://player.kick.com/${streamerData.username}`;
            elements.streamEmbed.src = embedUrl;
        }
        
        // Set up "Watch on Kick" button click handler
        if (elements.watchOnKick) {
            // Remove any existing click handlers
            elements.watchOnKick.onclick = null;
            
            // Add new click handler to open Kick.com in new tab
            elements.watchOnKick.onclick = function() {
                window.open(`https://kick.com/${streamerData.username}`, '_blank');
            };
        }
    } else {
        // Hide the toggle button and live stream section when not live
        if (elements.toggleLiveStream) {
            elements.toggleLiveStream.style.display = 'none';
        }
        elements.liveStreamSection.style.display = 'none';
    }
}

// Calculate stream duration
function calculateStreamDuration(startTime) {
    try {
        const start = new Date(startTime);
        const now = new Date();
        const diffMs = now - start;
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    } catch (error) {
        console.error('Error calculating stream duration:', error);
        return 'Live';
    }
}

// Update viewer badges
function updateViewerBadges(badges, giftedSubsCount) {
    // Clear existing badges except the text
    const badgeImages = elements.viewerBadges.querySelectorAll('img');
    badgeImages.forEach(img => img.remove());
    
    // Add new badges
    badges.forEach(badge => {
        const img = document.createElement('img');
        img.src = getBadgeImageUrl(badge.type, giftedSubsCount);
        img.alt = badge.type;
        img.title = badge.text || badge.type;
        elements.viewerBadges.appendChild(img);
    });
}

/**
 * UI Helper Functions
 */

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const inputSection = document.querySelector('.input-section');
    inputSection.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show/hide modules
function showResults() {
    elements.lookUpModule.style.display = 'flex';
    elements.resultsContainer.classList.add('show');
    
    setTimeout(() => {
        elements.lookUpModule.style.opacity = '1';
    }, 100);
}

function hideResults() {
    elements.lookUpModule.style.opacity = '0';
    elements.resultsContainer.classList.remove('show');
    
    setTimeout(() => {
        elements.lookUpModule.style.display = 'none';
    }, 300);
}

/**
 * Event Handlers
 */

// Handle search button click
function handleButtonClick() {
    // Validate input
    if (isEmptyInput(elements.kicknameInput, 'You must enter at least a Kick Streamer Username.')) {
        return;
    }
    
    const viewerUsername = elements.viewernameInput.value.trim();
    
    // Fetch data
    getStreamerInfo();
    
    if (viewerUsername) {
        getViewerInfo(viewerUsername);
        elements.viewerCardModule.style.display = 'flex';
        elements.moduleSeparator.style.display = 'block';
    } else {
        elements.viewerCardModule.style.display = 'none';
        elements.moduleSeparator.style.display = 'none';
    }
    
    // Show results
    showResults();
}

// Handle page load with URL parameters
function handlePageLoad() {
    // Initialize live stream components
    if (elements.liveStreamSection) {
        elements.liveStreamSection.style.display = 'none';
    }
    if (elements.toggleLiveStream) {
        elements.toggleLiveStream.style.display = 'none';
    }
    
    const streamerParam = getUrlParameter('streamer');
    const viewerParam = getUrlParameter('viewer');
    
    if (streamerParam) {
        elements.kicknameInput.value = streamerParam;
        getStreamerInfo();
        showResults();
    }
    
    if (viewerParam) {
        elements.viewernameInput.value = viewerParam;
        
        if (streamerParam) {
            getViewerInfo(viewerParam);
            elements.viewerCardModule.style.display = 'flex';
            elements.moduleSeparator.style.display = 'block';
        }
    } else {
        elements.viewerCardModule.style.display = 'none';
        elements.moduleSeparator.style.display = 'none';
    }
    
    if (!streamerParam && !viewerParam) {
        elements.lookUpModule.style.display = 'none';
    }
}

/**
 * Event Listeners
 */

// Search button
elements.getStreamerButton.addEventListener('click', handleButtonClick);

// Theme button selection
const themeButtons = document.querySelectorAll('.theme-btn');
themeButtons.forEach(button => {
    button.addEventListener('click', handleThemeSelection);
});

// Results close button
if (elements.resultsCloseBtn) {
    elements.resultsCloseBtn.addEventListener('click', hideResults);
}

// Developer info toggle button
if (elements.devInfoToggleBtn) {
    elements.devInfoToggleBtn.addEventListener('click', function() {
        const container = elements.devInfoContainer;
        const button = elements.devInfoToggleBtn;
        
        if (container.style.display === 'none' || container.style.display === '') {
            container.style.display = 'block';
            button.textContent = 'Hide Developer Info';
        } else {
            container.style.display = 'none';
            button.textContent = 'Show Developer Info';
        }
    });
}

// Enter key on inputs
elements.kicknameInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        handleButtonClick();
    }
});

elements.viewernameInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        handleButtonClick();
    }
});

// Page load
window.addEventListener('load', function() {
    initializeTheme();
    handlePageLoad();
});

/**
 * Public API
 */
window.TheLookUp = {
    getStreamerInfo,
    getViewerInfo,
    getLoggedStreamerInfo: () => streamerInfoArray,
    showResults,
    hideResults
};