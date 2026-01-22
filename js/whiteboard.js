// Whiteboard Class
/**
 * Manages an infinite canvas whiteboard with drawing tools, pan, zoom, and screenshot capabilities.
 * Supports multiple drawing modes including freehand, shapes, text, and eraser.
 *
 * @class Whiteboard
 */
class Whiteboard {
    /**
     * Creates a Whiteboard instance attached to a canvas element.
     *
     * @constructor
     * @param {string} canvasId - The ID of the canvas element
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.wrapper = document.getElementById('canvas-wrapper');

        // Canvas state
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.canvasWidth = 5000;
        this.canvasHeight = 5000;

        // Drawing state
        this.isDrawing = false;
        this.currentTool = 'select';
        this.currentColor = '#000000';
        this.brushSize = 3;
        this.lastX = 0;
        this.lastY = 0;

        // Pan state
        this.isPanning = false;
        this.startPanX = 0;
        this.startPanY = 0;

        // Shapes state
        this.shapes = [];
        this.currentShape = null;
        this.startX = 0;
        this.startY = 0;

        // Text state
        this.textInputs = [];

        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        // Center the canvas
        this.centerCanvas();

        // Setup event listeners
        this.setupEventListeners();

        // Initial draw
        this.render();
    }

    centerCanvas() {
        const rect = this.wrapper.getBoundingClientRect();
        this.offsetX = (rect.width - this.canvasWidth) / 2;
        this.offsetY = (rect.height - this.canvasHeight) / 2;
        this.updateTransform();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Wheel event for zooming
        this.wrapper.addEventListener('wheel', (e) => this.handleWheel(e));

        // Window resize
        window.addEventListener('resize', () => this.updateTransform());
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / this.scale,
            y: (e.clientY - rect.top) / this.scale
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);

        if (this.currentTool === 'pan') {
            this.isPanning = true;
            this.startPanX = e.clientX - this.offsetX;
            this.startPanY = e.clientY - this.offsetY;
            this.wrapper.classList.add('panning');
            return;
        }

        this.isDrawing = true;
        this.lastX = pos.x;
        this.lastY = pos.y;
        this.startX = pos.x;
        this.startY = pos.y;

        if (this.currentTool === 'draw' || this.currentTool === 'eraser') {
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
        }

        if (this.currentTool === 'text') {
            this.addTextInput(pos.x, pos.y);
        }
    }

    handleMouseMove(e) {
        if (this.isPanning) {
            this.offsetX = e.clientX - this.startPanX;
            this.offsetY = e.clientY - this.startPanY;
            this.updateTransform();
            return;
        }

        if (!this.isDrawing) {
            return;
        }

        const pos = this.getMousePos(e);

        if (this.currentTool === 'draw') {
            this.drawLine(this.lastX, this.lastY, pos.x, pos.y, this.currentColor, this.brushSize);
            this.lastX = pos.x;
            this.lastY = pos.y;
        } else if (this.currentTool === 'eraser') {
            this.drawLine(this.lastX, this.lastY, pos.x, pos.y, '#ffffff', this.brushSize * 2);
            this.lastX = pos.x;
            this.lastY = pos.y;
        } else if (this.currentTool === 'rect' || this.currentTool === 'circle') {
            this.render();
            this.drawShape(this.currentTool, this.startX, this.startY, pos.x, pos.y);
        }
    }

    handleMouseUp(e) {
        if (this.isPanning) {
            this.isPanning = false;
            this.wrapper.classList.remove('panning');
            return;
        }

        if (this.isDrawing) {
            const pos = this.getMousePos(e);

            if (this.currentTool === 'rect' || this.currentTool === 'circle') {
                this.drawShape(this.currentTool, this.startX, this.startY, pos.x, pos.y);
            }
        }

        this.isDrawing = false;
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseDown(touch);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove(touch);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp(e);
    }

    handleWheel(e) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = this.scale * delta;

        if (newScale < 0.1 || newScale > 5) {
            return;
        }

        // Zoom towards mouse position
        const rect = this.wrapper.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.offsetX = mouseX - (mouseX - this.offsetX) * delta;
        this.offsetY = mouseY - (mouseY - this.offsetY) * delta;
        this.scale = newScale;

        this.updateTransform();
        this.updateZoomIndicator();
    }

    /**
     * Draws a line on the canvas between two points.
     *
     * @param {number} x1 - Starting X coordinate
     * @param {number} y1 - Starting Y coordinate
     * @param {number} x2 - Ending X coordinate
     * @param {number} y2 - Ending Y coordinate
     * @param {string} color - Line color (CSS color string)
     * @param {number} width - Line width in pixels
     * @returns {void}
     */
    drawLine(x1, y1, x2, y2, color, width) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    /**
     * Draws a shape on the canvas.
     * Supports rectangles and circles.
     *
     * @param {string} type - Type of shape ('rect' or 'circle')
     * @param {number} x1 - Starting X coordinate (or center X for circle)
     * @param {number} y1 - Starting Y coordinate (or center Y for circle)
     * @param {number} x2 - Ending X coordinate (used to calculate dimensions)
     * @param {number} y2 - Ending Y coordinate (used to calculate dimensions)
     * @returns {void}
     */
    drawShape(type, x1, y1, x2, y2) {
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;

        if (type === 'rect') {
            const width = x2 - x1;
            const height = y2 - y1;
            this.ctx.strokeRect(x1, y1, width, height);
        } else if (type === 'circle') {
            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            this.ctx.beginPath();
            this.ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
    }

    /**
     * Adds a text input box at the specified canvas position.
     * The text can be edited and finalized to become part of the canvas.
     *
     * @param {number} x - X coordinate on the canvas
     * @param {number} y - Y coordinate on the canvas
     * @returns {void}
     * @private
     */
    addTextInput(x, y) {
        const input = document.createElement('div');
        input.contentEditable = true;
        input.style.position = 'absolute';
        input.style.left = x * this.scale + this.offsetX + 'px';
        input.style.top = y * this.scale + this.offsetY + 'px';
        input.style.minWidth = '100px';
        input.style.minHeight = '20px';
        input.style.border = '1px dashed #3498db';
        input.style.padding = '5px';
        input.style.background = 'white';
        input.style.fontSize = '16px';
        input.style.outline = 'none';
        input.style.zIndex = '50';

        const finalize = () => {
            const text = input.textContent;
            if (text.trim()) {
                this.ctx.font = '16px Arial';
                this.ctx.fillStyle = this.currentColor;
                this.ctx.fillText(text, x, y);
            }
            input.remove();
        };

        input.addEventListener('blur', finalize);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finalize();
            }
        });

        this.wrapper.appendChild(input);
        input.focus();
    }

    updateTransform() {
        this.canvas.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
        this.canvas.style.transformOrigin = '0 0';
    }

    updateZoomIndicator() {
        const indicator = document.getElementById('zoom-indicator');
        if (indicator) {
            indicator.textContent = Math.round(this.scale * 100) + '%';
        }
    }

    /**
     * Sets the current drawing tool.
     * Updates the cursor style based on the selected tool.
     *
     * @param {string} tool - The tool to use ('select', 'pan', 'draw', 'text', 'rect', 'circle', 'eraser')
     * @returns {void}
     */
    setTool(tool) {
        this.currentTool = tool;

        // Update cursor
        if (tool === 'pan') {
            this.wrapper.style.cursor = 'grab';
        } else if (tool === 'draw') {
            this.wrapper.style.cursor = 'crosshair';
        } else if (tool === 'eraser') {
            this.wrapper.style.cursor = 'cell';
        } else {
            this.wrapper.style.cursor = 'default';
        }
    }

    /**
     * Sets the current drawing color.
     *
     * @param {string} color - The color to use (CSS color string)
     * @returns {void}
     */
    setColor(color) {
        this.currentColor = color;
    }

    /**
     * Sets the brush size for drawing operations.
     *
     * @param {number} size - The brush size in pixels
     * @returns {void}
     */
    setBrushSize(size) {
        this.brushSize = size;
    }

    /**
     * Zooms in on the canvas by 20%.
     * Maximum zoom level is 5x (500%).
     *
     * @returns {void}
     */
    zoomIn() {
        this.scale *= 1.2;
        if (this.scale > 5) {
            this.scale = 5;
        }
        this.updateTransform();
        this.updateZoomIndicator();
    }

    /**
     * Zooms out on the canvas by 20%.
     * Minimum zoom level is 0.1x (10%).
     *
     * @returns {void}
     */
    zoomOut() {
        this.scale *= 0.8;
        if (this.scale < 0.1) {
            this.scale = 0.1;
        }
        this.updateTransform();
        this.updateZoomIndicator();
    }

    /**
     * Resets the view to default zoom (100%) and centers the canvas.
     *
     * @returns {void}
     */
    resetView() {
        this.scale = 1;
        this.centerCanvas();
        this.updateZoomIndicator();
    }

    /**
     * Clears all content from the canvas.
     *
     * @returns {void}
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Renders the canvas content.
     * Reserved for future use: could re-render stored shapes or implement layers.
     * Currently, Canvas API handles all rendering directly during draw operations.
     *
     * @returns {void}
     */
    render() {
        // Reserved for future use: could re-render stored shapes or implement layers
        // Currently, Canvas API handles all rendering directly during draw operations
    }

    /**
     * Captures a screenshot of the visible canvas area.
     * Returns a data URL that can be downloaded or displayed.
     *
     * @returns {string} Data URL of the screenshot in PNG format
     */
    takeScreenshot() {
        // Create a temporary canvas for the screenshot
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Get visible area
        const rect = this.wrapper.getBoundingClientRect();
        tempCanvas.width = rect.width;
        tempCanvas.height = rect.height;

        // Draw the visible portion of the main canvas
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        tempCtx.drawImage(
            this.canvas,
            -this.offsetX / this.scale,
            -this.offsetY / this.scale,
            tempCanvas.width / this.scale,
            tempCanvas.height / this.scale,
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
        );

        // Convert to blob and download
        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `whiteboard-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });

        return tempCanvas.toDataURL();
    }
}
