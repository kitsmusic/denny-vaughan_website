/**
 * Denny Vaughan Website - Social Media Sharing System
 * 
 * This file handles all social media sharing functionality for the Denny Vaughan memorial website.
 * It provides sharing capabilities for songs, instrumentals, and images across multiple platforms.
 * 
 * Key Features:
 * - Multi-platform social media sharing (Facebook, Twitter, LinkedIn, Pinterest)
 * - Email sharing functionality
 * - Copy link to clipboard
 * - Embed code generation
 * - Dynamic content sharing with proper metadata
 * - Responsive sharing buttons with hover effects
 * 
 * Supported Platforms:
 * - Facebook (Open Graph optimized)
 * - Twitter/X (Twitter Card optimized)
 * - LinkedIn (Professional sharing)
 * - Pinterest (Image sharing)
 * - Email (Direct email sharing)
 * - Copy Link (Clipboard functionality)
 * 
 * @author Denny Vaughan Memorial
 * @version 1.0
 * @since 2024
 */

/**
 * Social Media Sharing Class
 * 
 * This class manages all social media sharing functionality for the website.
 * It handles generating sharing data, opening share windows, and creating
 * embed codes for different types of content.
 * 
 * @class SocialSharing
 */
class SocialSharing {
    /**
     * Constructor
     * Initializes the social sharing system with default settings
     */
    constructor() {
        // Base URL for the website
        this.baseUrl = window.location.origin + window.location.pathname;
        
        // Default site title for sharing
        this.siteTitle = "Denny Vaughan: A Musical Legacy 1921-1972";
        
        // Default image for sharing (when no specific image is provided)
        this.defaultImage = "Denny Vaughan pics/denny_vaughan.jpg";
    }

    /**
     * Generate Sharing Data for Different Content Types
     * 
     * Creates optimized sharing data based on the type of content being shared.
     * Each content type gets specific metadata tailored for social media platforms.
     * 
     * @param {string} contentType - Type of content ('song', 'instrumental', 'image', or default)
     * @param {Object} contentData - Object containing content-specific information
     * @returns {Object} Optimized sharing data for social media platforms
     */
    generateSharingData(contentType, contentData) {
        // Base sharing data used for all content types
        const baseData = {
            url: this.baseUrl,
            title: this.siteTitle,
            description: "Experience the golden age of music through Denny Vaughan's timeless recordings",
            image: this.defaultImage
        };

        // Generate specific sharing data based on content type
        switch (contentType) {
            case 'song':
                return {
                    ...baseData,
                    title: `${contentData.title} - Performed by Denny Vaughan`,
                    description: `Listen to "${contentData.title}" performed by Denny Vaughan. ${contentData.composer ? `Composed by ${contentData.composer}.` : ''} ${contentData.lyricist ? `Lyrics by ${contentData.lyricist}.` : ''} From the Denny Vaughan collection.`,
                    url: `${this.baseUrl}?track=${encodeURIComponent(contentData.title)}&type=song`,
                    image: contentData.image || this.defaultImage
                };
            
            case 'instrumental':
                return {
                    ...baseData,
                    title: `${contentData.title} - Performed by Denny Vaughan`,
                    description: `Listen to "${contentData.title}" performed by Denny Vaughan. ${contentData.composer ? `Composed by ${contentData.composer}.` : ''} From the Denny Vaughan instrumental collection.`,
                    url: `${this.baseUrl}?track=${encodeURIComponent(contentData.title)}&type=instrumental`,
                    image: contentData.image || this.defaultImage
                };
            
            case 'image':
                return {
                    ...baseData,
                    title: `${contentData.caption} - Denny Vaughan`,
                    description: `${contentData.caption} from the Denny Vaughan collection. Experience the golden age of music through rare photographs and recordings.`,
                    url: `${this.baseUrl}?image=${encodeURIComponent(contentData.caption)}`,
                    image: contentData.src
                };
            
            default:
                return baseData;
        }
    }

    /**
     * Share to Facebook
     * 
     * Opens Facebook's sharing dialog with optimized content for the platform.
     * Uses Facebook's sharer.php endpoint for maximum compatibility.
     * 
     * @param {Object} sharingData - The sharing data object containing URL, title, and description
     */
    shareToFacebook(sharingData) {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharingData.url)}&quote=${encodeURIComponent(sharingData.description)}`;
        this.openShareWindow(url, 'facebook-share');
    }

    /**
     * Share to Twitter/X
     * 
     * Opens Twitter's sharing dialog with optimized content for the platform.
     * Includes both text and URL in the tweet for maximum engagement.
     * 
     * @param {Object} sharingData - The sharing data object containing URL, title, and description
     */
    shareToTwitter(sharingData) {
        const text = `${sharingData.title} - ${sharingData.description}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(sharingData.url)}`;
        this.openShareWindow(url, 'twitter-share');
    }

    /**
     * Share to LinkedIn
     * 
     * Opens LinkedIn's sharing dialog optimized for professional networking.
     * Includes title, summary, and URL for professional sharing.
     * 
     * @param {Object} sharingData - The sharing data object containing URL, title, and description
     */
    shareToLinkedIn(sharingData) {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharingData.url)}&title=${encodeURIComponent(sharingData.title)}&summary=${encodeURIComponent(sharingData.description)}`;
        this.openShareWindow(url, 'linkedin-share');
    }

    /**
     * Share to Pinterest
     * 
     * Opens Pinterest's sharing dialog for image-based content.
     * Optimized for sharing photos and visual content.
     * 
     * @param {Object} sharingData - The sharing data object containing URL, image, and description
     */
    shareToPinterest(sharingData) {
        const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(sharingData.url)}&media=${encodeURIComponent(sharingData.image)}&description=${encodeURIComponent(sharingData.description)}`;
        this.openShareWindow(url, 'pinterest-share');
    }

    /**
     * Share via Email
     * 
     * Opens the user's default email client with pre-filled subject and body.
     * Provides a direct way to share content via email.
     * 
     * @param {Object} sharingData - The sharing data object containing title, description, and URL
     */
    shareViaEmail(sharingData) {
        const subject = encodeURIComponent(sharingData.title);
        const body = encodeURIComponent(`${sharingData.description}\n\nListen here: ${sharingData.url}`);
        const url = `mailto:?subject=${subject}&body=${body}`;
        window.location.href = url;
    }

    /**
     * Copy Link to Clipboard
     * 
     * Copies the sharing URL to the user's clipboard.
     * Uses modern Clipboard API with fallback for older browsers.
     * 
     * @param {Object} sharingData - The sharing data object containing the URL to copy
     * @returns {Promise} Promise that resolves when the link is copied
     */
    async copyLink(sharingData) {
        try {
            // Try modern Clipboard API first
            await navigator.clipboard.writeText(sharingData.url);
            this.showCopyNotification();
        } catch (err) {
            // Fallback for older browsers or when Clipboard API is not available
            const textArea = document.createElement('textarea');
            textArea.value = sharingData.url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopyNotification();
        }
    }

    /**
     * Generate Embed Code
     * 
     * Creates HTML embed code for sharing content on other websites.
     * Generates different embed codes based on content type.
     * 
     * @param {string} contentType - Type of content ('song', 'instrumental', or 'image')
     * @param {Object} contentData - Object containing content-specific information
     * @returns {string} HTML embed code for the content
     */
    generateEmbedCode(contentType, contentData) {
        const sharingData = this.generateSharingData(contentType, contentData);
        
        let embedCode = '';
        
        if (contentType === 'song' || contentType === 'instrumental') {
            // Generate iframe embed code for audio content
            const embedUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '/')}embed-player.html?track=${encodeURIComponent(contentData.title)}&type=${contentType}`;
            embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" allowfullscreen style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></iframe>`;
        } else if (contentType === 'image') {
            // Generate image embed code for photo content
            embedCode = `<a href="${sharingData.url}" target="_blank"><img src="${sharingData.image}" alt="${sharingData.title}" style="max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" /></a>`;
        }
        
        return embedCode;
    }

    /**
     * Open Share Window
     * 
     * Opens a popup window for social media sharing.
     * Centers the window on screen and sets appropriate dimensions.
     * 
     * @param {string} url - The URL to open in the share window
     * @param {string} name - The name for the popup window
     */
    openShareWindow(url, name) {
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(url, name, `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
    }

    /**
     * Show Copy Notification
     * 
     * Displays a temporary notification when content is copied to clipboard.
     * Uses CSS animations for smooth appearance and disappearance.
     */
    showCopyNotification() {
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = 'Link copied to clipboard!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--deep-gold);
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 2 seconds with fade-out animation
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    /**
     * Create Sharing Buttons for Modals
     * 
     * Generates the complete HTML for sharing buttons and embed code section.
     * Used in modal windows for sharing specific content.
     * 
     * @param {string} contentType - Type of content being shared
     * @param {Object} contentData - Object containing content-specific information
     * @returns {string} Complete HTML for sharing interface
     */
    createSharingButtons(contentType, contentData) {
        const sharingData = this.generateSharingData(contentType, contentData);
        
        return `
            <div class="social-sharing-container">
                <h4>Share this ${contentType}</h4>
                <div class="sharing-buttons">
                    <button class="share-btn facebook" onclick="socialSharing.shareToFacebook(${JSON.stringify(sharingData).replace(/"/g, '&quot;')})" title="Share on Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </button>
                    <button class="share-btn twitter" onclick="socialSharing.shareToTwitter(${JSON.stringify(sharingData).replace(/"/g, '&quot;')})" title="Share on Twitter">
                        <i class="fab fa-twitter"></i>
                    </button>
                    <button class="share-btn linkedin" onclick="socialSharing.shareToLinkedIn(${JSON.stringify(sharingData).replace(/"/g, '&quot;')})" title="Share on LinkedIn">
                        <i class="fab fa-linkedin-in"></i>
                    </button>
                    <button class="share-btn pinterest" onclick="socialSharing.shareToPinterest(${JSON.stringify(sharingData).replace(/"/g, '&quot;')})" title="Share on Pinterest">
                        <i class="fab fa-pinterest-p"></i>
                    </button>
                    <button class="share-btn email" onclick="socialSharing.shareViaEmail(${JSON.stringify(sharingData).replace(/"/g, '&quot;')})" title="Share via Email">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="share-btn copy" onclick="socialSharing.copyLink(${JSON.stringify(sharingData).replace(/"/g, '&quot;')})" title="Copy Link">
                        <i class="fas fa-link"></i>
                    </button>
                </div>
                <div class="embed-section">
                    <h5>Embed this ${contentType}</h5>
                    <div class="embed-code-container">
                        <textarea class="embed-code" readonly>${this.generateEmbedCode(contentType, contentData)}</textarea>
                        <button class="copy-embed-btn" onclick="socialSharing.copyEmbedCode(this)" title="Copy Embed Code">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <div class="credits-section">
                    <h5>Credits</h5>
                    <div class="credits-content">
                        <p><strong>Performed by:</strong> Denny Vaughan</p>
                        ${contentData.composer ? `<p><strong>Composer:</strong> ${contentData.composer}</p>` : ''}
                        ${contentData.lyricist ? `<p><strong>Lyricist:</strong> ${contentData.lyricist}</p>` : ''}
                        <p><strong>Source:</strong> Denny Vaughan Collection</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Copy Embed Code
     * 
     * Copies the embed code to the user's clipboard.
     * Used for the embed code section in sharing modals.
     * 
     * @param {HTMLElement} button - The button element that was clicked
     * @returns {Promise} Promise that resolves when the embed code is copied
     */
    async copyEmbedCode(button) {
        const textarea = button.parentNode.querySelector('.embed-code');
        try {
            // Try modern Clipboard API first
            await navigator.clipboard.writeText(textarea.value);
            this.showCopyNotification();
        } catch (err) {
            // Fallback for older browsers
            textarea.select();
            document.execCommand('copy');
            this.showCopyNotification();
        }
    }
}

// Initialize social sharing system
const socialSharing = new SocialSharing();

// ============================================================================
// CSS STYLES FOR SOCIAL SHARING
// ============================================================================

/**
 * Add CSS animations and styles for social sharing components
 * Includes animations for notifications and styling for sharing buttons
 */
const style = document.createElement('style');
style.textContent = `
    /* Slide-in animation for notifications */
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    /* Slide-out animation for notifications */
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* Social sharing container styling */
    .social-sharing-container {
        margin-top: 20px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 10px;
        border: 1px solid var(--deep-gold);
    }
    
    /* Social sharing container header */
    .social-sharing-container h4 {
        margin: 0 0 15px 0;
        color: var(--burgundy);
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    /* Sharing buttons container */
    .sharing-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    /* Individual sharing button styling */
    .share-btn {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    /* Hover effect for sharing buttons */
    .share-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    /* Platform-specific button colors */
    .share-btn.facebook { background: #1877f2; }
    .share-btn.twitter { background: #1da1f2; }
    .share-btn.linkedin { background: #0077b5; }
    .share-btn.pinterest { background: #e60023; }
    .share-btn.email { background: #ea4335; }
    .share-btn.copy { background: var(--deep-gold); }
    
    /* Embed section styling */
    .embed-section {
        margin-top: 20px;
    }
    
    /* Embed section header */
    .embed-section h5 {
        margin: 0 0 10px 0;
        color: var(--burgundy);
        font-size: 1rem;
    }
    
    /* Embed code container */
    .embed-code-container {
        position: relative;
    }
    
    /* Embed code textarea */
    .embed-code {
        width: 100%;
        height: 80px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        resize: vertical;
        background: #f8f9fa;
    }
    
    /* Copy embed button */
    .copy-embed-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        background: var(--deep-gold);
        color: white;
        border: none;
        border-radius: 3px;
        padding: 5px 8px;
        cursor: pointer;
        font-size: 12px;
    }
    
    /* Hover effect for copy embed button */
    .copy-embed-btn:hover {
        background: var(--burgundy);
    }
    
    /* Credits section styling */
    .credits-section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
    }
    
    /* Credits section header */
    .credits-section h5 {
        margin: 0 0 10px 0;
        color: var(--burgundy);
        font-size: 1rem;
    }
    
    /* Credits content styling */
    .credits-content p {
        margin: 5px 0;
        font-size: 0.9rem;
        color: #666;
    }
    
    /* Bold text in credits */
    .credits-content strong {
        color: var(--burgundy);
    }
`;

// Add the styles to the document head
document.head.appendChild(style);

// ============================================================================
// END OF SOCIAL SHARING SYSTEM
// ============================================================================
