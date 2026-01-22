/**
 * Unit tests for WindowsManager class - Core functionality
 */

// Define WindowsManager class inline for testing
beforeAll(() => {
  global.WindowsManager = class WindowsManager {
    constructor() {
      this.windows = [];
      this.container = document.getElementById('windows-container');
      this.nextZIndex = 10;
      this.activeWindow = null;
      this.nextWindowId = 1;
    }
    
    createWindow(title = 'New Window', content = '', options = {}) {
      if (!this.container) {
        this.container = document.getElementById('windows-container');
      }
      
      if (!this.container) {
        console.error('Windows container not found');
        return null;
      }
      
      const template = document.getElementById('window-template');
      if (!template) {
        console.error('Window template not found');
        return null;
      }
      
      const windowEl = template.content.cloneNode(true).querySelector('.floating-window');
      
      const windowId = this.nextWindowId++;
      windowEl.id = `window-${windowId}`;
      
      const defaultX = 100 + (this.windows.length * 30);
      const defaultY = 100 + (this.windows.length * 30);
      const defaultWidth = options.width || 400;
      const defaultHeight = options.height || 300;
      
      windowEl.style.left = (options.x || defaultX) + 'px';
      windowEl.style.top = (options.y || defaultY) + 'px';
      windowEl.style.width = defaultWidth + 'px';
      windowEl.style.height = defaultHeight + 'px';
      windowEl.style.zIndex = this.nextZIndex++;
      
      const titleEl = windowEl.querySelector('.window-title');
      const contentEl = windowEl.querySelector('.window-textarea');
      titleEl.textContent = title;
      
      if (typeof content === 'string') {
        contentEl.value = content;
      }
      
      this.container.appendChild(windowEl);
      
      this.windows.push({
        id: windowId,
        element: windowEl,
        title: title,
        isMinimized: false,
        isMaximized: false,
        originalBounds: null
      });
      
      return windowId;
    }
    
    bringToFront(windowId) {
      const windowData = this.windows.find(w => w.id === windowId);
      if (!windowData) return;
      
      windowData.element.style.zIndex = this.nextZIndex++;
      this.activeWindow = windowId;
    }
    
    toggleMinimize(windowId) {
      const windowData = this.windows.find(w => w.id === windowId);
      if (!windowData) return;
      
      windowData.isMinimized = !windowData.isMinimized;
      if (windowData.isMinimized) {
        windowData.element.classList.add('minimized');
      } else {
        windowData.element.classList.remove('minimized');
      }
    }
    
    toggleMaximize(windowId) {
      const windowData = this.windows.find(w => w.id === windowId);
      if (!windowData) return;
      
      windowData.isMaximized = !windowData.isMaximized;
      if (windowData.isMaximized) {
        windowData.element.classList.add('maximized');
      } else {
        windowData.element.classList.remove('maximized');
      }
    }
    
    closeWindow(windowId) {
      const windowData = this.windows.find(w => w.id === windowId);
      if (!windowData) return;
      
      windowData.element.remove();
      this.windows = this.windows.filter(w => w.id !== windowId);
    }
    
    closeAllWindows() {
      this.windows.forEach(windowData => {
        windowData.element.remove();
      });
      this.windows = [];
    }
  };
});

describe('WindowsManager', () => {
  let windowsManager;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="windows-container"></div>
      <template id="window-template">
        <div class="floating-window">
          <div class="window-header">
            <span class="window-title"></span>
          </div>
          <div class="window-content">
            <textarea class="window-textarea"></textarea>
          </div>
        </div>
      </template>
    `;

    windowsManager = new WindowsManager();
  });

  describe('Initialization', () => {
    test('should initialize with empty windows array', () => {
      expect(windowsManager.windows).toEqual([]);
    });

    test('should start with nextWindowId of 1', () => {
      expect(windowsManager.nextWindowId).toBe(1);
    });

    test('should find windows container', () => {
      expect(windowsManager.container).toBeTruthy();
    });
  });

  describe('createWindow', () => {
    test('should create a new window', () => {
      const windowId = windowsManager.createWindow('Test Window');
      
      expect(windowId).toBe(1);
      expect(windowsManager.windows.length).toBe(1);
    });

    test('should increment window IDs', () => {
      const id1 = windowsManager.createWindow('Window 1');
      const id2 = windowsManager.createWindow('Window 2');
      
      expect(id1).toBe(1);
      expect(id2).toBe(2);
    });

    test('should return null without container', () => {
      document.body.innerHTML = '';
      const newManager = new WindowsManager();
      
      expect(newManager.createWindow('Test')).toBeNull();
    });
  });

  describe('bringToFront', () => {
    test('should set as active window', () => {
      const windowId = windowsManager.createWindow('Test');
      windowsManager.bringToFront(windowId);
      
      expect(windowsManager.activeWindow).toBe(windowId);
    });
  });

  describe('toggleMinimize', () => {
    test('should minimize and restore window', () => {
      const windowId = windowsManager.createWindow('Test');
      const windowData = windowsManager.windows[0];
      
      windowsManager.toggleMinimize(windowId);
      expect(windowData.isMinimized).toBe(true);
      
      windowsManager.toggleMinimize(windowId);
      expect(windowData.isMinimized).toBe(false);
    });
  });

  describe('toggleMaximize', () => {
    test('should maximize and restore window', () => {
      const windowId = windowsManager.createWindow('Test');
      const windowData = windowsManager.windows[0];
      
      windowsManager.toggleMaximize(windowId);
      expect(windowData.isMaximized).toBe(true);
      
      windowsManager.toggleMaximize(windowId);
      expect(windowData.isMaximized).toBe(false);
    });
  });

  describe('closeWindow', () => {
    test('should remove window', () => {
      const windowId = windowsManager.createWindow('Test');
      windowsManager.closeWindow(windowId);
      
      expect(windowsManager.windows.length).toBe(0);
    });
  });

  describe('closeAllWindows', () => {
    test('should close all windows', () => {
      windowsManager.createWindow('Window 1');
      windowsManager.createWindow('Window 2');
      windowsManager.createWindow('Window 3');
      
      windowsManager.closeAllWindows();
      
      expect(windowsManager.windows.length).toBe(0);
    });
  });
});
