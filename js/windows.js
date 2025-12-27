// Windows Manager for floating windows
class WindowsManager {
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
        
        // Set unique ID using incrementing counter
        const windowId = this.nextWindowId++;
        windowEl.id = `window-${windowId}`;
        
        // Set initial position and size
        const defaultX = 100 + (this.windows.length * 30);
        const defaultY = 100 + (this.windows.length * 30);
        const defaultWidth = options.width || 400;
        const defaultHeight = options.height || 300;
        
        windowEl.style.left = (options.x || defaultX) + 'px';
        windowEl.style.top = (options.y || defaultY) + 'px';
        windowEl.style.width = defaultWidth + 'px';
        windowEl.style.height = defaultHeight + 'px';
        windowEl.style.zIndex = this.nextZIndex++;
        
        // Set title and content
        const titleEl = windowEl.querySelector('.window-title');
        const contentEl = windowEl.querySelector('.window-textarea');
        titleEl.textContent = title;
        
        if (typeof content === 'string') {
            contentEl.value = content;
        } else {
            contentEl.parentElement.innerHTML = '';
            contentEl.parentElement.appendChild(content);
        }
        
        // Add to container
        this.container.appendChild(windowEl);
        
        // Setup window controls
        this.setupWindowControls(windowEl, windowId);
        
        // Store window reference
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
    
    setupWindowControls(windowEl, windowId) {
        const header = windowEl.querySelector('.window-header');
        const minimizeBtn = windowEl.querySelector('.window-minimize');
        const maximizeBtn = windowEl.querySelector('.window-maximize');
        const closeBtn = windowEl.querySelector('.window-close');
        const resizeHandle = windowEl.querySelector('.window-resize-handle');
        
        // Dragging
        let isDragging = false;
        let dragStartX, dragStartY, windowStartX, windowStartY;
        
        header.addEventListener('mousedown', (e) => {
            if (e.target !== header && e.target.parentElement !== header) return;
            if (windowEl.classList.contains('maximized')) return;
            
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            windowStartX = windowEl.offsetLeft;
            windowStartY = windowEl.offsetTop;
            
            this.bringToFront(windowId);
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            
            windowEl.style.left = (windowStartX + dx) + 'px';
            windowEl.style.top = (windowStartY + dy) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Resizing
        let isResizing = false;
        let resizeStartX, resizeStartY, startWidth, startHeight;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            if (windowEl.classList.contains('maximized')) return;
            
            isResizing = true;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            startWidth = windowEl.offsetWidth;
            startHeight = windowEl.offsetHeight;
            
            this.bringToFront(windowId);
            
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const dx = e.clientX - resizeStartX;
            const dy = e.clientY - resizeStartY;
            
            windowEl.style.width = Math.max(200, startWidth + dx) + 'px';
            windowEl.style.height = Math.max(150, startHeight + dy) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
        
        // Window controls
        minimizeBtn.addEventListener('click', () => {
            this.toggleMinimize(windowId);
        });
        
        maximizeBtn.addEventListener('click', () => {
            this.toggleMaximize(windowId);
        });
        
        closeBtn.addEventListener('click', () => {
            this.closeWindow(windowId);
        });
        
        // Bring to front on click
        windowEl.addEventListener('mousedown', () => {
            this.bringToFront(windowId);
        });
    }
    
    bringToFront(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (!window) return;
        
        window.element.style.zIndex = this.nextZIndex++;
        this.activeWindow = windowId;
    }
    
    toggleMinimize(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (!window) return;
        
        window.isMinimized = !window.isMinimized;
        window.element.classList.toggle('minimized', window.isMinimized);
    }
    
    toggleMaximize(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (!window) return;
        
        if (!window.isMaximized) {
            // Save current bounds
            window.originalBounds = {
                left: window.element.style.left,
                top: window.element.style.top,
                width: window.element.style.width,
                height: window.element.style.height
            };
            
            window.element.classList.add('maximized');
            window.isMaximized = true;
        } else {
            // Restore original bounds
            if (window.originalBounds) {
                window.element.style.left = window.originalBounds.left;
                window.element.style.top = window.originalBounds.top;
                window.element.style.width = window.originalBounds.width;
                window.element.style.height = window.originalBounds.height;
            }
            
            window.element.classList.remove('maximized');
            window.isMaximized = false;
        }
    }
    
    closeWindow(windowId) {
        const index = this.windows.findIndex(w => w.id === windowId);
        if (index === -1) return;
        
        const window = this.windows[index];
        window.element.remove();
        this.windows.splice(index, 1);
    }
    
    closeAllWindows() {
        this.windows.forEach(window => {
            window.element.remove();
        });
        this.windows = [];
    }
}
