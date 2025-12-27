# TheWhiteBoard

An ensemble-based agentic communication system where multiple agents exist in their own workspaces with a shared workspace and collaborative whiteboard for visual communication.

## Features

### 🎨 Unlimited Whiteboard
- **Infinite Canvas**: Pan and zoom across an unlimited drawing space
- **Drawing Tools**: Freehand drawing, shapes (rectangles, circles), text input, and eraser
- **WYSIWYG Editing**: Simple, intuitive interface for drawing and editing
- **Grid Background**: Visual reference grid for organization

### 🤖 Agent Management
- **Multiple Agents**: Create and manage multiple AI agents
- **Private Workspaces**: Each agent has its own isolated workspace
- **Agent Status**: Monitor agent activity and workspace information

### 📁 Shared Workspace
- **Common Files**: Shared file system accessible to all agents
- **Real-time Editing**: Edit shared files in floating windows
- **Persistent Storage**: Files are saved locally using localStorage

### 🪟 Floating Windows
- **Resizable**: Drag edges to resize windows
- **Movable**: Click and drag window headers to reposition
- **Minimize/Maximize**: Window controls for organization
- **Multiple Windows**: Open multiple windows simultaneously

### 📸 Screenshot Capability
- **Capture Board**: Take screenshots of the whiteboard for model consumption
- **Downloadable**: Screenshots are saved as PNG images
- **Visible Area**: Captures what's currently visible on screen

## Getting Started

### Installation
1. Clone this repository
2. Open `index.html` in a modern web browser
3. No server or build process required - it's pure HTML/CSS/JS!

### Usage

#### Creating Agents
1. Click the "Agents" button in the header
2. Enter an agent name in the input field
3. Click "Add Agent"
4. Each agent gets a private workspace automatically

#### Using the Whiteboard
1. Select a tool from the toolbar (draw, text, shapes, etc.)
2. Choose a color and brush size
3. Click and drag on the canvas to draw
4. Use pan tool or scroll wheel to navigate
5. Zoom in/out using the zoom buttons or scroll wheel

#### Managing Shared Files
1. Click the "Shared Files" button
2. Enter a file name and click "Add File"
3. Click on a file to open it in a floating window
4. Edit content directly in the window - changes are saved automatically

#### Working with Windows
- **Move**: Click and drag the window header
- **Resize**: Drag the bottom-right corner
- **Minimize**: Click the "-" button
- **Maximize**: Click the "□" button
- **Close**: Click the "×" button

#### Taking Screenshots
1. Click the camera icon in the toolbar
2. The current visible area is captured and downloaded
3. Screenshots can be used by models to read the board state

## Architecture

### Directory Structure
```
TheWhiteBoard/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── whiteboard.js   # Canvas and drawing logic
│   ├── agents.js       # Agent management system
│   ├── windows.js      # Floating window system
│   └── app.js          # Main application coordinator
├── shared_workspace/   # Shared files directory (placeholder)
└── agents/             # Agent workspaces directory (placeholder)
```

### Components

#### Whiteboard Class (`whiteboard.js`)
- Manages infinite canvas with pan/zoom
- Handles drawing tools (pen, shapes, text, eraser)
- Supports touch and mouse input
- Screenshot capture functionality

#### AgentsManager Class (`agents.js`)
- Creates and manages agent instances
- Maintains private workspaces for each agent
- Stores agent metadata and status
- Uses localStorage for persistence

#### WindowsManager Class (`windows.js`)
- Creates floating, resizable windows
- Handles window dragging and resizing
- Manages window z-index and focus
- Window minimize/maximize/close functionality

#### Main Application (`app.js`)
- Coordinates all components
- Handles UI interactions
- Manages toolbar and panels
- Implements shared file system

## Technical Details

### Technologies
- **HTML5 Canvas**: For the whiteboard drawing surface
- **Vanilla JavaScript**: No frameworks - pure JS for maximum compatibility
- **CSS3**: Modern styling with flexbox and grid
- **LocalStorage**: For data persistence

### Browser Compatibility
Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- CSS3 Flexbox
- LocalStorage API

### Data Persistence
- Agent data stored in `localStorage` under `whiteboard-agents`
- Agent workspaces stored as `workspace-{agentId}`
- Shared files stored under `whiteboard-shared-files`
- Canvas content is not persisted (by design - use screenshots)

## Use Cases

1. **Multi-Agent Collaboration**: Agents can communicate visually through the whiteboard
2. **Model Communication**: Take screenshots for AI models to read and interpret
3. **Visual Planning**: Use the whiteboard for brainstorming and planning
4. **Document Sharing**: Share files between agents in the common workspace
5. **Task Organization**: Use floating windows to organize different tasks

## Future Enhancements

Potential improvements:
- Canvas content persistence
- Real-time collaboration (WebSocket)
- Drawing layers
- Undo/redo functionality
- More drawing tools (arrows, highlighter, etc.)
- Export whiteboard to PDF
- Agent-to-agent messaging
- Collaborative editing indicators

## License

MIT License - Feel free to use and modify as needed.