/**
 * Global Audio Player Component
 * 
 * This component manages a persistent audio player that works across all pages.
 * It maintains the current track, playback state, and user preferences.
 * 
 * Features:
 * - Persistent playback across page navigation
 * - Multiple playback modes (loop, random, single track)
 * - Local storage for state persistence
 * - Floating player button
 * - Progress tracking and seeking
 * 
 * @author Denny Vaughan Memorial
 * @version 1.0
 * @since 2024
 */

/**
 * Global Audio Player Class
 * 
 * This class manages a persistent audio player that works across all pages.
 * It maintains the current track, playback state, and user preferences.
 * 
 * Features:
 * - Persistent playback across page navigation
 * - Multiple playback modes (loop, random, single track)
 * - Local storage for state persistence
 * - Floating player button
 * - Progress tracking and seeking
 * 
 * @class GlobalAudioPlayer
 */
class GlobalAudioPlayer {
    constructor() {
        // Initialize audio element
        this.audio = new Audio();
        
        // Player state
        this.currentTrackIndex = -1;      // Current track being played
        this.isPlaying = false;           // Whether audio is currently playing
        this.playbackMode = 'none';       // Current playback mode
        this.playedTracks = [];           // Track history for random mode
        this.tracks = [];                 // Current playlist
        this.currentPlaylist = null;      // Name of current playlist
        this.isVisible = false;           // Whether player is visible
        this._lastStateSave = 0;          // Throttle for storage writes
        
        // Volume control
        this.volume = 0.7;               // Default volume (70%)
        this.isMuted = false;            // Mute state
        this.audio.volume = this.volume; // Set initial volume
        
        // Volume control
        this.volume = 0.7;               // Default volume (70%)
        this.isMuted = false;            // Mute state
        this.audio.volume = this.volume; // Set initial volume
        
        // Initialize the player
        this.createGlobalPlayer();
        this.createFloatingButton();
        this.initializeEventListeners();
        this.loadStateFromStorage();
    }

    /**
     * Create Global Audio Player UI
     * Builds the HTML structure for the global audio player
     * Includes controls, progress bar, and playback mode buttons
     */
    createGlobalPlayer() {
        // Only create if it doesn't already exist
        if (!document.getElementById('globalAudioPlayer')) {
            const playerHTML = `
                <div id="globalAudioPlayer" class="global-audio-player">
                    <button id="globalPlayerClose" class="global-player-close">
                        <i class="fas fa-times"></i>
                                    </button>
                    <div class="global-player-content">
                        <div class="global-player-info">
                            <div class="global-player-cover">
                                <i class="fas fa-music"></i>
                            </div>
                            <div class="global-player-details">
                                <div id="globalPlayerTitle" class="global-player-title">No track selected</div>
                                <div id="globalPlayerArtist" class="global-player-artist">Denny Vaughan</div>
                            </div>
                        </div>
                        <div class="global-player-controls">
                            <button id="globalPrevBtn" class="global-control-btn" title="Previous">
                                <i class="fas fa-step-backward"></i>
                            </button>
                            <button id="globalPlayPauseBtn" class="global-control-btn play-pause" title="Play/Pause">
                                <i class="fas fa-play"></i>
                            </button>
                            <button id="globalNextBtn" class="global-control-btn" title="Next">
                                <i class="fas fa-step-forward"></i>
                            </button>
                            <div class="global-playback-modes">
                                <button id="globalLoopBtn" class="global-mode-btn" title="Loop All Tracks" data-mode="loop">
                                    <i class="fas fa-redo"></i>
                                </button>
                                <button id="globalRandomBtn" class="global-mode-btn" title="Random Playback" data-mode="random">
                                    <i class="fas fa-random"></i>
                                </button>
                                <button id="globalSingleBtn" class="global-mode-btn" title="Repeat Single Track" data-mode="single">
                                    <i class="fas fa-redo-alt"></i>
                                </button>
                            </div>
                            <div class="global-volume-control">
                                <button id="globalMuteBtn" class="global-volume-btn" title="Volume">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                                <div class="global-volume-slider-container">
                                    <input type="range" id="globalVolumeSlider" class="global-volume-slider" 
                                           min="0" max="100" value="70" title="Volume Control" orient="vertical">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="globalPlayerReminder" class="global-player-reminder" style="display: none;">
                        <i class="fas fa-info-circle"></i>
                        <span>Click anywhere to resume music</span>
                    </div>
                    <div class="global-progress">
                        <div id="globalProgressBar" class="global-progress-bar"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', playerHTML);
        }
    }

    /**
     * Create Floating Music Button
     * Creates a floating button that appears when the player is minimized
     * Allows users to quickly access the player from anywhere on the page
     */
    createFloatingButton() {
        if (!document.getElementById('floatingMusicBtn')) {
            const buttonHTML = `
                <div id="floatingMusicBtn" class="floating-music-btn" style="display: none;">
                    <i class="fas fa-music"></i>
                    <div class="floating-music-tooltip">Open Music Player</div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', buttonHTML);
        }
    }

    /**
     * Initialize Event Listeners
     * Sets up all the event handlers for the audio player
     * Includes a small delay to ensure DOM elements are ready
     */
    initializeEventListeners() {
        setTimeout(() => {
            this.setupEventListeners();
        }, 100);
    }

    /**
     * Setup Event Listeners
     * Configures all the click handlers and audio event listeners
     * Handles player controls, progress bar interaction, and audio state changes
     */
    setupEventListeners() {
        // Global player control buttons
        const globalPlayPauseBtn = document.getElementById('globalPlayPauseBtn');
        const globalPrevBtn = document.getElementById('globalPrevBtn');
        const globalNextBtn = document.getElementById('globalNextBtn');
        const globalPlayerClose = document.getElementById('globalPlayerClose');
        
        if (globalPlayPauseBtn) {
            globalPlayPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        if (globalPrevBtn) {
            globalPrevBtn.addEventListener('click', () => this.playPrevious());
        }
        if (globalNextBtn) {
            globalNextBtn.addEventListener('click', () => this.playNext());
        }
        if (globalPlayerClose) {
            globalPlayerClose.addEventListener('click', () => this.hidePlayer());
        }

        // Playback mode buttons (loop, random, single track)
        const modeButtons = document.querySelectorAll('.global-mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.setPlaybackMode(mode);
            });
        });

        // Volume control
        const volumeSlider = document.getElementById('globalVolumeSlider');
        const muteBtn = document.getElementById('globalMuteBtn');
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }
        
        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                // On mobile, toggle volume slider visibility
                if (window.innerWidth <= 768) {
                    e.stopPropagation();
                    this.toggleVolumeSlider();
                } else {
                    this.toggleMute();
                }
            });
        }

        // Progress bar interaction (click to seek, drag to scrub)
        const progressBar = document.getElementById('globalProgressBar');
        const progressContainer = document.querySelector('.global-progress');
        
        if (progressContainer) {
            // Add a flag to prevent click events after touch interactions
            let touchInteraction = false;
            
            progressContainer.addEventListener('click', (e) => {
                // Prevent click if we just had a touch interaction
                if (touchInteraction) {
                    touchInteraction = false;
                    return;
                }
                this.seekToPosition(e);
            });
            
            progressContainer.addEventListener('mousedown', (e) => {
                // Only handle mouse events if not a touch device interaction
                if (e.pointerType !== 'touch') {
                    this.startDragging(e);
                }
            });
            
            // Touch support for mobile
            progressContainer.addEventListener('touchstart', (e) => {
                touchInteraction = true;
                this.startTouchDragging(e);
                // Reset the flag after a short delay
                setTimeout(() => { touchInteraction = false; }, 300);
            }, { passive: false });
        }

        // Floating music button
        const floatingMusicBtn = document.getElementById('floatingMusicBtn');
        if (floatingMusicBtn) {
            floatingMusicBtn.addEventListener('click', () => this.showPlayer());
        }

        // Audio event listeners
        this.audio.addEventListener('ended', () => { try{console.log('[Audio] ended');}catch(_){ } this.playNext(); });
        this.audio.addEventListener('timeupdate', () => {
            try{ if (this.isPlaying) console.debug('[Audio] timeupdate', { t: this.audio.currentTime.toFixed(2) }); }catch(_){ }
            this.updateProgress();
            // Save state periodically to preserve current time (throttled)
            if (this.isPlaying) this.saveStateToStorage(false);
        });
        this.audio.addEventListener('loadedmetadata', () => { 
            try{console.log('[Audio] loadedmetadata', { duration: this.audio.duration, readyState: this.audio.readyState });}catch(_){ } 
            this.updateDuration();
            // Force progress update after metadata is loaded
            setTimeout(() => this.updateProgress(), 100);
        });
        this.audio.addEventListener('canplay', () => {
            try{console.log('[Audio] canplay', { duration: this.audio.duration, currentTime: this.audio.currentTime });}catch(_){ }
            this.updateProgress();
        });
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            try{console.log('[Audio] play', { src: this.audio.src, t: this.audio.currentTime });}catch(_){ }
            this.updatePlayerDisplay();
            this.updateTrackButtonStates();
            this.saveStateToStorage();
        });
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            try{console.log('[Audio] pause', { src: this.audio.src, t: this.audio.currentTime });}catch(_){ }
            this.updatePlayerDisplay();
            this.updateTrackButtonStates();
            this.saveStateToStorage();
        });

        // Add click handlers for track items on any page
        this.addTrackClickHandlers();
        
        // Handle page visibility changes to preserve audio state
        document.addEventListener('visibilitychange', () => {
            try{console.log('[Page] visibilitychange', { hidden: document.hidden });}catch(_){ }
            if (document.hidden) {
                // Page is being hidden, save current state
                this.saveStateToStorage();
            }
        });
        
        // Save state before page unload
        window.addEventListener('beforeunload', () => {
            try{console.log('[Page] beforeunload: saving state');}catch(_){ }
            this.saveStateToStorage(true);
        });

        // Attempt to resume playback after PJAX content swaps
        document.addEventListener('pjax:before', (e) => {
            try{console.log('[PJAX] before', { url: e && e.detail && e.detail.url, playing: this.isPlaying, paused: this.audio.paused, t: this.audio.currentTime, src: this.audio.src });}catch(_){ }
        });
        document.addEventListener('pjax:load', () => {
            // Preserve state and avoid touching the audio source if it's already valid.
            this.saveStateToStorage();
            try{console.log('[PJAX] load: restoring audio state (non-destructive)', { playing: this.isPlaying, paused: this.audio.paused, t: this.audio.currentTime, src: this.audio.src });}catch(_){ }
            this.restoreAudioState();
            
            // Update button states after a short delay to ensure DOM elements are ready
            setTimeout(() => {
                this.updateTrackButtonStates();
            }, 100);

            // If we intended to keep playing, try to continue without reloading src
            if (this.isPlaying && this.currentTrackIndex >= 0 && this.audio.paused) {
                this.audio.play().then(() => {
                    try{console.log('[PJAX] resume: immediate OK');}catch(_){ }
                    const reminder = document.getElementById('globalPlayerReminder');
                    if (reminder) reminder.style.display = 'none';
                    this.updatePlayerDisplay();
                    this.updateTrackButtonStates();
                }).catch((err) => {
                    try{console.warn('[PJAX] resume: immediate blocked', err && (err.name+': '+err.message));}catch(_){ }
                    // Fallback: muted autoplay (allowed by most browsers), then unmute
                    const prevMuted = this.audio.muted;
                    this.audio.muted = true;
                    this.audio.play().then(() => {
                        try{console.log('[PJAX] resume: muted OK');}catch(_){ }
                        setTimeout(() => {
                            this.audio.muted = prevMuted;
                            this.updatePlayerDisplay();
                            this.updateTrackButtonStates();
                        }, 100);
                        const reminder = document.getElementById('globalPlayerReminder');
                        if (reminder) reminder.style.display = 'none';
                    }).catch((err2) => {
                        try{console.warn('[PJAX] resume: muted blocked', err2 && (err2.name+': '+err2.message));}catch(_){ }
                        // Show reminder and wait for a gesture to resume
                        const reminder = document.getElementById('globalPlayerReminder');
                        if (reminder) reminder.style.display = 'flex';
                        const resume = () => {
                            this.audio.play().then(() => { try{console.log('[PJAX] resume: user gesture OK');}catch(_){ } }).catch(() => {});
                            const r = document.getElementById('globalPlayerReminder');
                            if (r) r.style.display = 'none';
                            this.updatePlayerDisplay();
                            this.updateTrackButtonStates();
                        };
                        document.addEventListener('click', resume, { once: true });
                        document.addEventListener('keydown', resume, { once: true });
                    });
                });
            }
        });

        // Resume audio when user interacts with the page
        document.addEventListener('click', () => {
            if (this.isPlaying && this.currentTrackIndex >= 0 && this.audio.paused) {
                this.audio.play().catch(e => {
                    // Silently fail if autoplay is blocked
                });
                // Hide reminder after user interaction
                const reminder = document.getElementById('globalPlayerReminder');
                if (reminder) reminder.style.display = 'none';
                this.updateTrackButtonStates();
            }
        }, { once: true });
        
        // Also try to resume on keyboard interaction
        document.addEventListener('keydown', () => {
            if (this.isPlaying && this.currentTrackIndex >= 0 && this.audio.paused) {
                this.audio.play().catch(e => {
                    // Silently fail if autoplay is blocked
                });
                // Hide reminder after user interaction
                const reminder = document.getElementById('globalPlayerReminder');
                if (reminder) reminder.style.display = 'none';
                this.updateTrackButtonStates();
            }
        }, { once: true });
    }

    /**
     * Seek to Position in Audio
     * Handles clicking on the progress bar to jump to a specific time
     * @param {Event} e - Click event on progress bar
     */
    seekToPosition(e) {
        if (!this.audio.duration) return;
        
        const progressContainer = e.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const seekTime = (clickX / width) * this.audio.duration;
        
        this.audio.currentTime = seekTime;
    }

    /**
     * Start Dragging Progress Bar
     * Enables dragging the progress bar to scrub through the audio
     * @param {Event} e - Mouse down event on progress bar
     */
    startDragging(e) {
        if (!this.audio.duration) return;
        
        const progressContainer = e.currentTarget;
        let isDragging = true;
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const rect = progressContainer.getBoundingClientRect();
            const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const width = rect.width;
            const seekTime = (clickX / width) * this.audio.duration;
            
            this.audio.currentTime = seekTime;
        };
        
        const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Prevent text selection during drag
        e.preventDefault();
    }

    /**
     * Start Touch Dragging Progress Bar
     * Enables touch dragging the progress bar on mobile devices
     * @param {Event} e - Touch start event on progress bar
     */
    startTouchDragging(e) {
        if (!this.audio.duration) return;
        
        const progressContainer = e.currentTarget;
        let isDragging = true;
        let hasMoved = false; // Track if user actually dragged
        let lastUpdateTime = 0;
        const updateThrottle = 16; // ~60fps updates
        
        const handleTouchMove = (e) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevent scrolling during drag
            e.stopPropagation(); // Prevent event bubbling
            
            hasMoved = true; // Mark that user has dragged
            
            const touch = e.touches[0];
            if (!touch) return; // Safety check
            
            const rect = progressContainer.getBoundingClientRect();
            const touchX = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
            const width = rect.width;
            const seekTime = (touchX / width) * this.audio.duration;
            
            // Update progress bar visually immediately (no throttling for visual feedback)
            const progressBar = document.getElementById('globalProgressBar');
            if (progressBar) {
                progressBar.style.width = `${(touchX / width) * 100}%`;
            }
            
            // Throttle audio seeking for performance
            const now = Date.now();
            if (now - lastUpdateTime >= updateThrottle) {
                lastUpdateTime = now;
                this.audio.currentTime = seekTime;
            }
        };
        
        const handleTouchEnd = (e) => {
            isDragging = false;
            document.removeEventListener('touchmove', handleTouchMove, { passive: false });
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchcancel', handleTouchCancel);
            
            // If user didn't drag, treat as a tap to seek
            if (!hasMoved && e.changedTouches && e.changedTouches[0]) {
                const touch = e.changedTouches[0];
                const rect = progressContainer.getBoundingClientRect();
                const touchX = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                const width = rect.width;
                const seekTime = (touchX / width) * this.audio.duration;
                this.audio.currentTime = seekTime;
            }
        };
        
        const handleTouchCancel = () => {
            isDragging = false;
            document.removeEventListener('touchmove', handleTouchMove, { passive: false });
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchcancel', handleTouchCancel);
        };
        
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchCancel);
        
        // Prevent default touch behavior and event bubbling
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Add Track Click Handlers
     * Sets up click handlers for track items across all pages
     * Allows users to click on any track to play it
     */
    addTrackClickHandlers() {
        document.addEventListener('click', (e) => {
            const trackItem = e.target.closest('.track-item, .track-card, .song-card, .instrumental-card');
            if (trackItem) {
                e.preventDefault();
                const trackIndex = parseInt(trackItem.dataset.trackIndex);
                const playlistName = trackItem.dataset.playlist;
                
                if (!isNaN(trackIndex) && playlistName) {
                    this.playTrackFromPlaylist(trackIndex, playlistName);
                }
            }
        });
    }

    /**
     * Load State from Local Storage
     * Restores the player state from browser storage
     * Includes current track, playback state, and position
     */
    loadStateFromStorage() {
        const savedState = localStorage.getItem('globalAudioPlayerState');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Check if the stored state contains "Lover" from instrumentals (which was moved to songs)
            if (state.tracks && state.tracks.some(track => track.filename && track.filename.includes('Lover.mp3') && track.filename.includes('Instrumentals'))) {
                console.log('Clearing stored audio state containing Lover from instrumentals');
                localStorage.removeItem('globalAudioPlayerState');
                return;
            }
            
            this.currentTrackIndex = state.currentTrackIndex || -1;
            this.isPlaying = state.isPlaying || false;
            this.playbackMode = state.playbackMode || 'none';
            this.currentPlaylist = state.currentPlaylist || null;
            this.tracks = state.tracks || [];
            this.isVisible = state.isVisible || false;
            const savedCurrentTime = state.currentTime || 0;
            
            // Load volume settings
            if (state.volume !== undefined) {
                this.volume = state.volume;
                this.audio.volume = this.volume;
            }
            if (state.isMuted !== undefined) {
                this.isMuted = state.isMuted;
                this.audio.muted = this.isMuted;
            }
            
            if (this.currentTrackIndex >= 0 && this.tracks.length > 0) {
                this.loadTrack(this.currentTrackIndex);
                
                // Restore the audio position after the track is loaded
                this.audio.addEventListener('loadedmetadata', () => {
                    this.audio.currentTime = savedCurrentTime;
                }, { once: true });
                
                // Don't try to auto-play on page load - let user interaction trigger it
                if (this.isVisible) {
                    this.showPlayer();
                } else {
                    this.showFloatingButton();
                }
                this.updatePlayerDisplay();
                this.updateTrackButtonStates();
            }
        }
    }

    /**
     * Save State to Local Storage
     * Persists the current player state to browser storage
     * Allows the player to resume where it left off after page refresh
     */
    saveStateToStorage(force = false) {
        const state = {
            currentTrackIndex: this.currentTrackIndex,
            isPlaying: this.isPlaying,
            playbackMode: this.playbackMode,
            currentPlaylist: this.currentPlaylist,
            tracks: this.tracks,
            isVisible: this.isVisible,
            currentTime: this.audio.currentTime || 0,
            volume: this.volume,
            isMuted: this.isMuted
        };
        const now = Date.now();
        if (!force && (now - this._lastStateSave) < 1000) return; // throttle writes
        this._lastStateSave = now;
        try {
            localStorage.setItem('globalAudioPlayerState', JSON.stringify(state));
        } catch (e) {
            try{console.warn('[Audio] saveStateToStorage failed', e);}catch(_){ }
        }
    }

    /**
     * Clear Audio State
     * Clears the current audio state and stops playback
     * Useful for resetting the player when tracks are moved between playlists
     */
    clearAudioState() {
        this.audio.pause();
        this.audio.src = '';
        this.currentTrackIndex = -1;
        this.isPlaying = false;
        this.tracks = [];
        this.currentPlaylist = null;
        this.playedTracks = [];
        this.hidePlayer();
        this.showFloatingButton();
        this.updatePlayerDisplay();
        localStorage.removeItem('globalAudioPlayerState');
    }

    /**
     * Play Track from Playlist
     * Loads and plays a specific track from a named playlist
     * @param {number} trackIndex - Index of the track to play
     * @param {string} playlistName - Name of the playlist ('Songs' or 'Instrumentals')
     */
    playTrackFromPlaylist(trackIndex, playlistName) {
        // Load the appropriate playlist
        let tracks = [];
        if (playlistName === 'Songs') {
            tracks = this.getSongsPlaylist();
        } else if (playlistName === 'Instrumentals') {
            tracks = this.getInstrumentalsPlaylist();
        }
        
        if (tracks.length > 0) {
            this.setPlaylist(tracks, playlistName);
            this.playTrack(trackIndex);
        }
    }

    /**
     * Get Songs Playlist
     * Returns the complete list of vocal recordings
     * @returns {Array} Array of song objects with title and filename
     */
    getSongsPlaylist() {
        return [
            { title: "Prisoner of Love", filename: "Denny Vaughan - Songs/Prisoner of Love.mp3" },
            { title: "To Bed Early", filename: "Denny Vaughan - Songs/To Bed Early.mp3" },
            { title: "As Long As I Live", filename: "Denny Vaughan - Songs/As Long As I Live.mp3" },
            { title: "Cynthia's in Love", filename: "Denny Vaughan - Songs/Cynthia's in Love.mp3" },
            { title: "The Old Lamplighter", filename: "Denny Vaughan - Songs/The Old Lamplighter.mp3" },
            { title: "The Crystal Gazer", filename: "Denny Vaughan - Songs/The Crystal Gazer.mp3" },
            { title: "I Never Loved Anyone", filename: "Denny Vaughan - Songs/I Never Loved Anyone.mp3" },
            { title: "It's Magic", filename: "Denny Vaughan - Songs/Its Magic.mp3" },
            { title: "Begin the Beguine", filename: "Denny Vaughan - Songs/Begin the Beguine.mp3" },
            { title: "Blue Moon", filename: "Denny Vaughan - Songs/Blue Moon.mp3" },
            { title: "How Deep is the Ocean", filename: "Denny Vaughan - Songs/How Deep is the Ocean.mp3" },
            { title: "How High the Moon", filename: "Denny Vaughan - Songs/How High the Moon.mp3" },
            { title: "I Promise You", filename: "Denny Vaughan - Songs/I Promise You.mp3" },
            { title: "Night and Day", filename: "Denny Vaughan - Songs/Night and Day.mp3" },
            { title: "September in the Rain", filename: "Denny Vaughan - Songs/September in the Rain.mp3" },
            { title: "Autumn Leaves", filename: "Denny Vaughan - Songs/Autumn Leaves.mp3" },
            { title: "The Moon Has Turned to Silver", filename: "Denny Vaughan - Songs/The Moon Has Turned to Silver.mp3" },
            { title: "They Say Falling in Love", filename: "Denny Vaughan - Songs/They Say Falling in Love.mp3" },
            { title: "Walk Hand in Hand", filename: "Denny Vaughan - Songs/Walk Hand in Hand.mp3" },
            { title: "You and the Night and the Music", filename: "Denny Vaughan - Songs/You and the Night and the Music.mp3" },
            { title: "Lover", filename: "Denny Vaughan - Songs/Lover.mp3" },
            { title: "Mary Lou", filename: "Denny Vaughan - Songs/Mary Lou.mp3" },
            { title: "Make Mine Music", filename: "Denny Vaughan - Songs/Make Mine Music.mp3" },
            { title: "September Song", filename: "Denny Vaughan - Songs/September Song.mp3" },
            { title: "April in Paris", filename: "Denny Vaughan - Songs/B-sides/B - April in Paris - Vaughan, Denny.mp3" },
            { title: "Red Roses for a Blue Lady", filename: "Denny Vaughan - Songs/B-sides/C - Red Roses for a Blue Lady - Geraldo with Denny Vaughan vocals.mp3" }
        ];
    }

    /**
     * Get Instrumentals Playlist
     * Returns the complete list of instrumental recordings
     * @returns {Array} Array of instrumental objects with title and filename
     */
    getInstrumentalsPlaylist() {
        return [
            { title: "Yonge Street Boogie", filename: "Denny Vaughan - Instrumentals/Yonge Street Boogie.mp3.mp3" },
            { title: "Embraceable You", filename: "Denny Vaughan - Instrumentals/Embraceable You.mp3.mp3" },
            { title: "Is It Too Late", filename: "Denny Vaughan - Instrumentals/Is It Too Late.mp3" },
            { title: "Moonlight and Roses", filename: "Denny Vaughan - Instrumentals/Moonlight and Roses.mp3" },
            { title: "The Moon was Yellow", filename: "Denny Vaughan - Instrumentals/The Moon was Yellow.mp3" },
            { title: "Rose Room", filename: "Denny Vaughan - Instrumentals/Rose Room.mp3" },
            { title: "Moonglow", filename: "Denny Vaughan - Instrumentals/Moonglow.mp3" },
            { title: "An Affair to Remember", filename: "Denny Vaughan - Instrumentals/An Affair to Remember.mp3" },
            { title: "The Girl Next Door", filename: "Denny Vaughan - Instrumentals/The Girl Next Door.mp3" },
            { title: "Lonely Evening Time Instrumental", filename: "Denny Vaughan - Instrumentals/Lonely Evening Time Instrumental.mp3" },
            { title: "Lonely Seashore", filename: "Denny Vaughan - Instrumentals/Lonely Seashore.mp3" },
            { title: "Dawn to Dusk", filename: "Denny Vaughan - Instrumentals/Dawn to Dusk.mp3" },
            { title: "Rhapsody to a Lost Love", filename: "Denny Vaughan - Instrumentals/Rhapsody to a Lost Love.mp3" },
            { title: "Love Minus One Concerto Finale", filename: "Denny Vaughan - Instrumentals/Love Minus One Concerto Finale.mp3" },
            { title: "Between the Devil and the Deep Blue Sea", filename: "Denny Vaughan - Instrumentals/Between the Devil and the Deep Blue Sea.mp3" },
            { title: "Stairway to the Stars", filename: "Denny Vaughan - Instrumentals/Stairway to the Stars.mp3.mp3" },
            { title: "Tea for Two", filename: "Denny Vaughan - Instrumentals/Tea for Two.mp3.mp3" }
        ];
    }

    /**
     * Set Playlist
     * Loads a new playlist into the player
     * @param {Array} tracks - Array of track objects
     * @param {string} playlistName - Name of the playlist
     */
    setPlaylist(tracks, playlistName) {
        this.tracks = tracks;
        this.currentPlaylist = playlistName;
        this.playedTracks = [];
        this.saveStateToStorage(true);
    }

    /**
     * Play Track
     * Loads and plays a specific track by index
     * @param {number} index - Index of the track to play
     */
    playTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        
        // Use root-relative, URL-encoded path to ensure consistent resolution in production
        this.audio.src = '/' + encodeURI(track.filename);
        try{console.log('[Audio] playTrack set src', this.audio.src);}catch(_){ }
        this.audio.load();
        
        // Reset progress bar when loading new track
        const progressBar = document.getElementById('globalProgressBar');
        if (progressBar) {
            progressBar.style.width = '0%';
            try{console.log('[Progress] Reset progress bar to 0%');}catch(_){ }
        }
        
        this.isPlaying = true;
        this.audio.play().catch(e => {
            console.log('Play prevented, user needs to interact first');
        });
        
        this.showPlayer();
        this.updatePlayerDisplay();
        this.updateTrackButtonStates();
        this.saveStateToStorage(true);
        
        // Add to played tracks for random mode
        if (this.playbackMode === 'random') {
            this.playedTracks.push(index);
        }
    }

    /**
     * Toggle Play/Pause
     * Switches between play and pause states
     */
    togglePlayPause() {
        if (this.currentTrackIndex < 0) return;
        
        if (this.isPlaying && !this.audio.paused) {
            // Currently playing, pause it
            this.audio.pause();
            this.isPlaying = false;
        } else {
            // Currently paused, play it
            this.audio.play().catch(e => {
                console.log('Play prevented, user needs to interact first');
            });
            this.isPlaying = true;
        }
        
        this.updatePlayerDisplay();
        this.updateTrackButtonStates();
        this.saveStateToStorage();
    }

    /**
     * Play Previous Track
     * Moves to the previous track in the playlist
     */
    playPrevious() {
        if (this.tracks.length === 0) return;
        
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.playTrack(this.currentTrackIndex);
    }

    /**
     * Play Next Track
     * Moves to the next track based on current playback mode
     */
    playNext() {
        if (this.tracks.length === 0) return;
        
        if (this.playbackMode === 'single') {
            // Repeat the same track
            this.playTrack(this.currentTrackIndex);
        } else if (this.playbackMode === 'random') {
            // Play a random track that hasn't been played recently
            let availableTracks = this.tracks.map((_, index) => index).filter(index => 
                !this.playedTracks.slice(-Math.min(3, this.tracks.length - 1)).includes(index)
            );
            if (availableTracks.length === 0) {
                availableTracks = this.tracks.map((_, index) => index);
            }
            const randomIndex = availableTracks[Math.floor(Math.random() * availableTracks.length)];
            this.currentTrackIndex = randomIndex;
            this.playTrack(this.currentTrackIndex);
        } else if (this.playbackMode === 'loop') {
            // Loop through all tracks sequentially
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
            this.playTrack(this.currentTrackIndex);
        } else {
            // No playback mode selected - move to next track sequentially
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
            this.playTrack(this.currentTrackIndex);
        }
    }

    /**
     * Set Playback Mode
     * Changes the playback mode (loop, random, single track, or none)
     * @param {string} mode - The playback mode to set
     */
    setPlaybackMode(mode) {
        // If clicking the same mode, turn it off
        if (this.playbackMode === mode) {
            this.playbackMode = 'none';
        } else {
            this.playbackMode = mode;
        }
        
        // Update global player button states
        document.querySelectorAll('.global-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.playbackMode);
        });
        
        // Reset played tracks for random mode
        if (this.playbackMode === 'random') {
            this.playedTracks = [];
        }
        
        this.saveStateToStorage();
    }

    /**
     * Set Volume
     * Changes the audio volume and updates the UI
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        
        // Update volume slider
        const volumeSlider = document.getElementById('globalVolumeSlider');
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }
        
        // Update mute button icon
        this.updateMuteButton();
        
        // Save to storage
        this.saveStateToStorage();
    }

    /**
     * Toggle Mute
     * Switches between muted and unmuted states
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        
        // Update mute button icon
        this.updateMuteButton();
        
        // Save to storage
        this.saveStateToStorage();
    }

    /**
     * Update Mute Button
     * Updates the mute button icon based on current state
     */
    updateMuteButton() {
        const muteBtn = document.getElementById('globalMuteBtn');
        if (!muteBtn) return;
        
        if (this.isMuted) {
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            muteBtn.title = 'Unmute';
        } else if (this.volume === 0) {
            muteBtn.innerHTML = '<i class="fas fa-volume-off"></i>';
            muteBtn.title = 'Mute/Unmute';
        } else if (this.volume < 0.5) {
            muteBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
            muteBtn.title = 'Mute/Unmute';
        } else {
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            muteBtn.title = 'Mute/Unmute';
        }
    }

    /**
     * Load Track
     * Loads a track into the audio element without playing it
     * @param {number} index - Index of the track to load
     */
    loadTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        
        const track = this.tracks[index];
        // Use root-relative, URL-encoded path to avoid breakage on pretty URLs
        this.audio.src = '/' + encodeURI(track.filename);
        try{console.log('[Audio] loadTrack set src', this.audio.src);}catch(_){ }
        this.audio.load();
        
        // Reset progress bar when loading new track
        const progressBar = document.getElementById('globalProgressBar');
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }

    /**
     * Show Player
     * Makes the global audio player visible
     */
    showPlayer() {
        const player = document.getElementById('globalAudioPlayer');
        const floatingBtn = document.getElementById('floatingMusicBtn');
        if (player) {
            player.classList.add('show');
            this.isVisible = true;
            this.saveStateToStorage();
        }
        if (floatingBtn) {
            floatingBtn.style.display = 'none';
        }
    }

    /**
     * Hide Player
     * Hides the global audio player and shows the floating button
     */
    hidePlayer() {
        const player = document.getElementById('globalAudioPlayer');
        if (player) {
            player.classList.remove('show');
            this.isVisible = false;
            this.saveStateToStorage();
        }
        this.showFloatingButton();
    }

    /**
     * Show Floating Button
     * Displays the floating music button when player is minimized
     */
    showFloatingButton() {
        const floatingBtn = document.getElementById('floatingMusicBtn');
        if (floatingBtn && this.currentTrackIndex >= 0) {
            floatingBtn.style.display = 'flex';
        }
    }

    /**
     * Update Player Display
     * Updates the visual state of the player controls and information
     */
    updatePlayerDisplay() {
        const title = document.getElementById('globalPlayerTitle');
        const artist = document.getElementById('globalPlayerArtist');
        const playPauseBtn = document.getElementById('globalPlayPauseBtn');
        const reminder = document.getElementById('globalPlayerReminder');
        
        if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.tracks.length) {
            const track = this.tracks[this.currentTrackIndex];
            
            if (title) title.textContent = track.title;
            if (artist) artist.textContent = 'Denny Vaughan';
            
            if (playPauseBtn) {
                if (this.isPlaying && !this.audio.paused) {
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    playPauseBtn.title = 'Pause';
                    playPauseBtn.style.opacity = '1';
                    // Hide reminder when playing
                    if (reminder) reminder.style.display = 'none';
                } else {
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    // If it should be playing but is paused, show reminder
                    if (this.isPlaying && this.audio.paused) {
                        playPauseBtn.title = 'Click to resume (paused due to navigation)';
                        playPauseBtn.style.opacity = '0.7';
                        // Show reminder when paused due to navigation
                        if (reminder) reminder.style.display = 'flex';
                    } else {
                        playPauseBtn.title = 'Play/Pause';
                        playPauseBtn.style.opacity = '1';
                        // Hide reminder when not playing
                        if (reminder) reminder.style.display = 'none';
                    }
                }
            }
        }
        
        // Update volume controls
        this.updateMuteButton();
        
        // Update volume slider
        const volumeSlider = document.getElementById('globalVolumeSlider');
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }
    }

    /**
     * Update Progress Bar
     * Updates the visual progress bar based on current audio position
     */
    updateProgress() {
        const progressBar = document.getElementById('globalProgressBar');
        
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            
            if (progressBar && !isNaN(progress)) {
                const width = Math.max(0, Math.min(100, progress)) + '%';
                progressBar.style.width = width;
                // Debug logging
                try{console.debug('[Progress]', { currentTime: this.audio.currentTime, duration: this.audio.duration, progress: progress.toFixed(2) + '%', width: width });}catch(_){ }
                
                // Also log the actual DOM element state
                try{console.debug('[Progress] DOM Element', { 
                    element: progressBar, 
                    computedWidth: getComputedStyle(progressBar).width,
                    styleWidth: progressBar.style.width,
                    offsetWidth: progressBar.offsetWidth,
                    clientWidth: progressBar.clientWidth
                });}catch(_){ }
            }
        } else {
            // Debug when duration is not available
            try{console.debug('[Progress] No duration available', { duration: this.audio.duration, currentTime: this.audio.currentTime, readyState: this.audio.readyState });}catch(_){ }
        }
    }

    /**
     * Update Duration
     * Handles duration updates (currently handled by progress bar)
     */
    updateDuration() {
        // Duration is handled by the progress bar
    }

    /**
     * Toggle Volume Slider Visibility (Mobile)
     * Shows/hides the vertical volume slider on mobile devices
     */
    toggleVolumeSlider() {
        const sliderContainer = document.querySelector('.global-volume-slider-container');
        if (sliderContainer) {
            const isVisible = sliderContainer.classList.contains('show');
            if (isVisible) {
                sliderContainer.classList.remove('show');
            } else {
                sliderContainer.classList.add('show');
                // Hide slider after 3 seconds of inactivity
                setTimeout(() => {
                    if (!sliderContainer.matches(':hover')) {
                        sliderContainer.classList.remove('show');
                    }
                }, 3000);
            }
        }
    }

    /**
     * Update Track Button States
     * Updates the play/pause button states on songs and instrumentals pages
     */
    updateTrackButtonStates() {
        // Update all track icons on the current page
        const trackCards = document.querySelectorAll('.track-card, .track-item');
        
        trackCards.forEach((card, index) => {
            const trackIcon = card.querySelector('.track-icon i');
            const cardTrackIndex = parseInt(card.dataset.trackIndex);
            const cardPlaylist = card.dataset.playlist;
            
            if (trackIcon) {
                // Check if this is the currently playing track
                const isCurrentTrack = (
                    this.currentTrackIndex === cardTrackIndex && 
                    this.currentPlaylist === cardPlaylist &&
                    this.isPlaying && 
                    !this.audio.paused
                );
                
                if (isCurrentTrack) {
                    // Show pause button for currently playing track
                    trackIcon.className = 'fas fa-pause';
                    card.classList.add('playing');
                } else {
                    // Show play button for all other tracks
                    trackIcon.className = 'fas fa-play';
                    card.classList.remove('playing');
                }
            }
        });
    }

    /**
     * Get Instance (Static Method)
     * Returns the singleton instance of the global audio player
     * @returns {GlobalAudioPlayer} The global audio player instance
     */
    static getInstance() {
        if (!window.globalAudioPlayer) {
            window.globalAudioPlayer = new GlobalAudioPlayer();
        }
        return window.globalAudioPlayer;
    }

    /**
     * Restore Audio State
     * Restores the audio state after page navigation
     * Useful for maintaining playback across page changes
     */
    restoreAudioState() {
        if (this.currentTrackIndex < 0 || this.tracks.length === 0) return;

        // Non-destructive restore: do not reload src if it already exists.
        const hasSrc = (() => {
            try { return !!new URL(this.audio.src, window.location.href).pathname; } catch (_) { return false; }
        })();

        if (!hasSrc || this.audio.readyState === 0) {
            // Only load if the audio element has no source yet
            this.loadTrack(this.currentTrackIndex);
            try{console.log('[Audio] restore: loaded track (no prior src)');}catch(_){ }
        }

        // Restore the saved current time if available (without interrupting playback)
        const savedState = localStorage.getItem('globalAudioPlayerState');
        if (savedState) {
            const state = JSON.parse(savedState);
            const savedCurrentTime = state.currentTime || 0;
            const setTime = () => {
                const now = this.audio.currentTime || 0;
                const delta = Math.abs((savedCurrentTime || 0) - now);
                if (this.audio.paused || this.audio.readyState < 1) {
                    this.audio.currentTime = savedCurrentTime;
                    try{console.log('[Audio] restore: set currentTime (paused/not ready)', { savedCurrentTime, now, delta });}catch(_){ }
                } else {
                    try{console.log('[Audio] restore: skip currentTime (playing)', { savedCurrentTime, now, delta });}catch(_){ }
                }
            };
            if (this.audio.readyState >= 1) {
                setTime();
            } else {
                this.audio.addEventListener('loadedmetadata', setTime, { once: true });
            }
        }
    }
}

// Initialize global audio player when page loads
document.addEventListener('DOMContentLoaded', () => {
    GlobalAudioPlayer.getInstance();
});
