import { BrowserWindowConstructorOptions } from 'electron';
import { resolve } from 'path';

export const windowDevSettings: BrowserWindowConstructorOptions = {
  // === General Window Behavior ===
  width: 800, // Default window width in pixels
  height: 600, // Default window height in pixels
  x: 200, // X position (undefined = OS decides)
  y: 100, // Y position (undefined = OS decides)
  useContentSize: false, // Whether width/height are content size, not window size
  center: false, // Whether to center the window on screen
  minWidth: 600, // Minimum width
  minHeight: 400, // Minimum height
  maxWidth: 900, // Maximum width (undefined = no max)
  maxHeight: 700, // Maximum height
  resizable: true, // Can the user resize the window
  fullscreen: false, // Should start in full screen
  fullscreenable: true, // Can the window enter full screen
  kiosk: false, // Kiosk mode (full screen + locked)
  simpleFullscreen: false, // macOS only: use simple full screen (no animation)
  maximizable: true, // Can the window be maximized
  minimizable: true, // Can the window be minimized
  closable: true, // Can the window be closed

  // === Display and Appearance ===
  alwaysOnTop: false, // Keep window always on top
  skipTaskbar: false, // Don't show in taskbar
  title: 'Generic-UI', // Title of the window
  // icon: undefined, // Path to icon file (Windows, Linux)
  show: false, // Show window immediately
  frame: true, // Show OS window frame
  transparent: false, // Transparent background
  backgroundColor: '#FFFF', // Background color of the window
  hasShadow: true, // Has shadow (Windows, macOS)
  opacity: 1.0, // Window opacity (1.0 = opaque)

  // === User Interaction ===
  acceptFirstMouse: false, // macOS: click inside doesn't focus window
  disableAutoHideCursor: false, // Do not auto-hide cursor on inactivity
  autoHideMenuBar: false, // Hide menu bar until Alt is pressed (Windows/Linux)
  enableLargerThanScreen: false, // Allow the window to be larger than the screen
  zoomToPageWidth: false, // macOS: auto-zoom window to fit page width
  tabbingIdentifier: undefined, // macOS: group tabs across windows
  titleBarStyle: 'default', // macOS: 'default', 'hidden', etc.
  thickFrame: true, // Windows: resizable border/frame
  movable: true, // Can the window be moved
  modal: false, // Is this a modal window
  parent: undefined, // Optional parent window
  trafficLightPosition: undefined, // macOS: position of close/minimize/maximize buttons
  visualEffectState: 'followWindow', // macOS: visual effect mode for vibrancy

  // === Advanced Features ===
  paintWhenInitiallyHidden: true, // Windows: render before window is shown

  roundedCorners: true, // macOS: round corners of the window
  vibrancy: undefined, // macOS: vibrancy effect
  backgroundMaterial: undefined, // macOS: material type (if vibrancy enabled)

  // === Web Preferences ===
  webPreferences: {
    // Preload and Execution
    preload: resolve(__dirname, '../../out/preload/preload.js'), // Path to preload script
    sandbox: false, // Enable sandbox mode
    contextIsolation: true, // Isolate context of renderer
    nodeIntegration: false, // Enable Node.js in renderer
    nodeIntegrationInWorker: false, // Enable Node.js in web workers
    nodeIntegrationInSubFrames: false, // Node.js in subframes (discouraged)

    // Security and Access
    webSecurity: true, // Enforce same-origin policy (now safe with file URLs)
    allowRunningInsecureContent: false, // Allow insecure (http) resources
    disableBlinkFeatures: undefined, // Comma-separated Blink features to disable
    enableBlinkFeatures: undefined, // Comma-separated Blink features to enable

    // Performance and Behavior
    zoomFactor: 1.0, // Initial zoom factor
    spellcheck: true, // Enable spell check
    autoplayPolicy: 'user-gesture-required', // Autoplay policy
    defaultEncoding: 'UTF-8', // Default text encoding
    backgroundThrottling: true, // Throttle JS when in background
    offscreen: false, // Enable offscreen rendering
    webgl: true, // Enable WebGL

    // Features and UI
    devTools: true, // Enable dev tools
    enableWebSQL: false, // Deprecated WebSQL API
    webviewTag: false, // Enable <webview> tag (security risk)
    additionalArguments: [], // Additional CLI args passed to renderer
    safeDialogs: false, // Safe dialogs in renderer
    safeDialogsMessage: undefined, // Message shown when blocked

    // Drag and Resize
    enablePreferredSizeMode: false, // Auto-resize window to preferred size
    navigateOnDragDrop: true, // Allow drag-and-drop navigation
    disableHtmlFullscreenWindowResize: false, // Prevent window resize on HTML5 full screen
    accessibleTitle: undefined, // Title used by screen readers
    partition: undefined // Storage partition ID
  }
};
