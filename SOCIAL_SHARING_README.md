# Social Media Sharing & Embed Functionality

## Overview

The Denny Vaughan website now includes comprehensive social media sharing functionality and embed options for all modals. This allows users to share Denny's music and images across social platforms while ensuring proper credits are maintained.

## Features

### Social Media Sharing
- **Facebook**: Share with custom description and image
- **Twitter/X**: Tweet with track information and credits
- **LinkedIn**: Professional sharing with detailed information
- **Pinterest**: Pin images with descriptions
- **Email**: Direct email sharing
- **Copy Link**: Copy direct links to clipboard

### Embed Functionality
- **Embeddable Player**: Full-featured audio player that works when embedded
- **Proper Credits**: Always includes "Performed by Denny Vaughan" and composer/lyricist information
- **Responsive Design**: Works on all device sizes
- **Direct Track Loading**: Can load specific tracks via URL parameters

## Implementation

### Files Added/Modified

1. **social-sharing.js** - Core sharing functionality
2. **embed-player.html** - Standalone embeddable player
3. **Updated HTML files**:
   - index.html (homepage gallery modals)
   - songs.html (song modals)
   - instrumentals.html (instrumental modals)
   - gallery.html (image modals)
4. **styles.css** - Added modal sharing styles

### How It Works

#### Social Sharing
1. When a modal opens, sharing buttons are automatically generated
2. Each share includes:
   - Track title with "Performed by Denny Vaughan"
   - Composer and lyricist credits
   - Direct link to the specific content
   - Appropriate image for visual platforms

#### Embed Player
1. **URL Structure**: `embed-player.html?track=TrackName&type=song|instrumental`
2. **Features**:
   - Full audio player with playlist selection
   - Track navigation (previous/next)
   - Progress bar with seek functionality
   - Time display
   - Proper credits section
   - Responsive design

## Usage Examples

### Sharing a Song
When users click on a song modal, they can:
- Share to Facebook: "Listen to 'Prisoner of Love' performed by Denny Vaughan. Composed by Russ Columbo & Clarence Gaskill. From the Denny Vaughan collection."
- Tweet: Includes track info and credits
- Get embed code: `<iframe src="embed-player.html?track=Prisoner%20of%20Love&type=song" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`

### Sharing an Image
When users click on a gallery image modal, they can:
- Share to Pinterest: Image with caption and credits
- Get embed code: `<a href="gallery.html?image=Denny%20Vaughan%20composing" target="_blank"><img src="Denny Vaughan pics/Denny Vaughan composing.jpg" alt="Denny Vaughan composing - Denny Vaughan" /></a>`

### Embedding the Player
Other websites can embed the player using:
```html
<iframe src="https://dennyvaughan.com/embed-player.html?track=Yonge%20Street%20Boogie&type=instrumental" 
        width="100%" height="600" frameborder="0" allowfullscreen 
        style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</iframe>
```

## Credits System

### Automatic Credit Inclusion
All sharing and embeds automatically include:
- **Performed by**: Denny Vaughan
- **Composer**: [Composer name from track data]
- **Lyricist**: [Lyricist name from track data] (for songs)
- **Source**: Denny Vaughan Collection

### Credit Display
Credits are prominently displayed in:
- Social media posts
- Embed player interface
- Share descriptions
- Modal information

## Technical Details

### Browser Compatibility
- Modern browsers with ES6+ support
- Fallback clipboard functionality for older browsers
- Responsive design for all screen sizes

### Security Considerations
- All sharing uses standard web APIs
- No external dependencies for core functionality
- Proper URL encoding for special characters

### Performance
- Lazy loading of sharing components
- Minimal impact on page load times
- Efficient event handling

## Future Enhancements

### Potential Additions
1. **Analytics**: Track sharing and embed usage
2. **More Platforms**: Instagram, TikTok, etc.
3. **Custom Embeds**: Different player styles
4. **Playlist Sharing**: Share entire playlists
5. **QR Codes**: Generate QR codes for mobile sharing

### API Integration
- Social media API integration for better sharing
- Analytics tracking
- User engagement metrics

## Maintenance

### Updating Track Information
To add new tracks or update composer information:
1. Update the track arrays in `embed-player.html`
2. Update the track data in respective HTML files
3. Ensure composer/lyricist information is accurate

### Adding New Sharing Platforms
1. Add new sharing method to `SocialSharing` class
2. Update the sharing buttons HTML template
3. Test across different browsers and devices

## Support

For technical support or questions about the sharing functionality:
- Check browser console for errors
- Verify all required files are loaded
- Ensure proper file paths for audio files
- Test on different devices and browsers

---

*This documentation covers the social sharing and embed functionality implemented for the Denny Vaughan website. The system ensures that Denny's legacy is properly credited while making his music accessible to a wider audience.*
