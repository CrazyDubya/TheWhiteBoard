// Main Application
let whiteboard;
let agentsManager;
let windowsManager;
let sharedFiles = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    whiteboard = new Whiteboard('whiteboard');
    agentsManager = new AgentsManager();
    windowsManager = new WindowsManager();
    
    // Setup toolbar
    setupToolbar();
    
    // Setup panels
    setupPanels();
    
    // Setup agents
    setupAgents();
    
    // Setup shared files
    setupSharedFiles();
    
    // Load initial state
    loadSharedFiles();
    agentsManager.renderAgentsList('agents-list');
    
    // Create welcome window
    createWelcomeWindow();
});

function setupToolbar() {
    // Tool buttons
    const tools = ['select', 'pan', 'draw', 'text', 'rect', 'circle', 'eraser'];
    tools.forEach(tool => {
        const btn = document.getElementById(`tool-${tool}`);
        if (btn) {
            btn.addEventListener('click', () => {
                // Remove active class from all tools
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked tool
                btn.classList.add('active');
                // Set tool
                whiteboard.setTool(tool);
            });
        }
    });
    
    // Color picker
    const colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('change', (e) => {
        whiteboard.setColor(e.target.value);
    });
    
    // Brush size
    const brushSize = document.getElementById('brush-size');
    const brushSizeDisplay = document.getElementById('brush-size-display');
    brushSize.addEventListener('input', (e) => {
        whiteboard.setBrushSize(parseInt(e.target.value));
        brushSizeDisplay.textContent = e.target.value + 'px';
    });
    
    // Clear button
    document.getElementById('btn-clear').addEventListener('click', () => {
        if (confirm('Clear the entire whiteboard?')) {
            whiteboard.clear();
        }
    });
    
    // Screenshot button
    document.getElementById('btn-screenshot').addEventListener('click', () => {
        whiteboard.takeScreenshot();
        showNotification('Screenshot saved!');
    });
    
    // Zoom buttons
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        whiteboard.zoomIn();
    });
    
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        whiteboard.zoomOut();
    });
    
    document.getElementById('btn-reset-view').addEventListener('click', () => {
        whiteboard.resetView();
    });
}

function setupPanels() {
    // Toggle agents panel
    document.getElementById('toggle-agents').addEventListener('click', () => {
        const panel = document.getElementById('agents-panel');
        panel.classList.toggle('open');
    });
    
    document.getElementById('close-agents').addEventListener('click', () => {
        document.getElementById('agents-panel').classList.remove('open');
    });
    
    // Toggle shared panel
    document.getElementById('toggle-shared').addEventListener('click', () => {
        const panel = document.getElementById('shared-panel');
        panel.classList.toggle('open');
    });
    
    document.getElementById('close-shared').addEventListener('click', () => {
        document.getElementById('shared-panel').classList.remove('open');
    });
}

function setupAgents() {
    document.getElementById('add-agent').addEventListener('click', () => {
        const input = document.getElementById('new-agent-name');
        const name = input.value.trim();
        
        if (!name) {
            alert('Please enter an agent name');
            return;
        }
        
        const agent = agentsManager.addAgent(name);
        if (agent) {
            input.value = '';
            agentsManager.renderAgentsList('agents-list');
            showNotification(`Agent "${name}" added successfully!`);
        }
    });
    
    // Allow Enter key to add agent
    document.getElementById('new-agent-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('add-agent').click();
        }
    });
}

function setupSharedFiles() {
    document.getElementById('add-file').addEventListener('click', () => {
        const input = document.getElementById('new-file-name');
        const name = input.value.trim();
        
        if (!name) {
            alert('Please enter a file name');
            return;
        }
        
        addSharedFile(name);
        input.value = '';
        renderSharedFiles();
        showNotification(`File "${name}" added to shared workspace!`);
    });
    
    // Allow Enter key to add file
    document.getElementById('new-file-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('add-file').click();
        }
    });
}

function addSharedFile(name) {
    const file = {
        id: Date.now(),
        name: name,
        content: '',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
    };
    
    sharedFiles.push(file);
    saveSharedFiles();
    return file;
}

function removeSharedFile(id) {
    sharedFiles = sharedFiles.filter(f => f.id !== id);
    saveSharedFiles();
    renderSharedFiles();
}

function openSharedFile(id) {
    const file = sharedFiles.find(f => f.id === id);
    if (!file) return;
    
    // Create a floating window with the file content
    const windowId = windowsManager.createWindow(file.name, file.content);
    
    // Save content when changed
    const windowEl = document.getElementById(`window-${windowId}`);
    const textarea = windowEl.querySelector('.window-textarea');
    
    textarea.addEventListener('input', () => {
        file.content = textarea.value;
        file.modifiedAt = new Date().toISOString();
        saveSharedFiles();
    });
}

function saveSharedFiles() {
    localStorage.setItem('whiteboard-shared-files', JSON.stringify(sharedFiles));
}

function loadSharedFiles() {
    const saved = localStorage.getItem('whiteboard-shared-files');
    if (saved) {
        sharedFiles = JSON.parse(saved);
        renderSharedFiles();
    }
}

function renderSharedFiles() {
    const container = document.getElementById('shared-files');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (sharedFiles.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No shared files yet. Add one to get started!</p>';
        return;
    }
    
    sharedFiles.forEach(file => {
        const fileEl = document.createElement('div');
        fileEl.className = 'file-item';
        fileEl.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-actions">
                <button onclick="removeSharedFile(${file.id})">Delete</button>
            </div>
        `;
        
        // Open file on click (but not on delete button)
        fileEl.querySelector('.file-name').addEventListener('click', () => {
            openSharedFile(file.id);
        });
        
        container.appendChild(fileEl);
    });
}

function createWelcomeWindow() {
    const welcomeContent = document.createElement('div');
    welcomeContent.innerHTML = `
        <h2>Welcome to The WhiteBoard!</h2>
        <p>This is an ensemble-based agentic communication system.</p>
        <h3>Features:</h3>
        <ul>
            <li><strong>Unlimited Whiteboard:</strong> Pan, zoom, and draw on an infinite canvas</li>
            <li><strong>Drawing Tools:</strong> Draw, add text, shapes, and more</li>
            <li><strong>Agent Workspaces:</strong> Each agent has its own private workspace</li>
            <li><strong>Shared Workspace:</strong> Common files accessible to all agents</li>
            <li><strong>Floating Windows:</strong> Organize content with resizable windows</li>
            <li><strong>Screenshots:</strong> Capture the board for model communication</li>
        </ul>
        <h3>Getting Started:</h3>
        <ol>
            <li>Add agents using the "Agents" panel</li>
            <li>Create shared files in the "Shared Files" panel</li>
            <li>Use the toolbar to draw and annotate the whiteboard</li>
            <li>Double-click to create new floating windows</li>
        </ol>
        <p style="margin-top: 20px; color: #7f8c8d; font-size: 12px;">
            You can close this window and create new ones anytime.
        </p>
    `;
    
    windowsManager.createWindow('Welcome', welcomeContent, { width: 500, height: 450 });
}

function showNotification(message) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '70px';
    notification.style.right = '20px';
    notification.style.background = '#27ae60';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.animation = 'slideIn 0.3s ease-out';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Expose managers to global scope for easy access
window.whiteboard = whiteboard;
window.agentsManager = agentsManager;
window.windowsManager = windowsManager;
