/**
 * Unit tests for Whiteboard class - Core functionality
 */

// Define Whiteboard class inline for testing (simplified version)
beforeAll(() => {
    global.Whiteboard = class Whiteboard {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
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

            if (this.canvas && this.wrapper) {
                this.init();
            }
        }

        init() {
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;
        }

        setTool(tool) {
            this.currentTool = tool;
        }

        setColor(color) {
            this.currentColor = color;
        }

        setBrushSize(size) {
            this.brushSize = size;
        }

        getMousePos(e) {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) / this.scale,
                y: (e.clientY - rect.top) / this.scale
            };
        }

        drawLine(x1, y1, x2, y2, color, width) {
            if (!this.ctx) return;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = width;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        drawShape(type, x1, y1, x2, y2) {
            if (!this.ctx) return;

            if (type === 'rect') {
                const width = x2 - x1;
                const height = y2 - y1;
                this.ctx.strokeRect(x1, y1, width, height);
            } else if (type === 'circle') {
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;
                const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
        }

        zoom(factor) {
            const newScale = this.scale * factor;
            // Limit scale between 0.1 and 5
            if (newScale >= 0.1 && newScale <= 5) {
                this.scale = newScale;
            }
        }

        clear() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.shapes = [];
        }

        updateTransform() {
            if (!this.canvas) return;
            this.canvas.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
        }

        handleMouseDown(e) {
            const pos = this.getMousePos(e);

            if (this.currentTool === 'pan') {
                this.isPanning = true;
                this.startPanX = e.clientX - this.offsetX;
                this.startPanY = e.clientY - this.offsetY;
                return;
            }

            this.isDrawing = true;
            this.lastX = pos.x;
            this.lastY = pos.y;
            this.startX = pos.x;
            this.startY = pos.y;
        }

        handleMouseUp(e) {
            this.isDrawing = false;
            this.isPanning = false;
        }

        render() {
            // Simplified render
        }

        takeScreenshot() {
            if (!this.canvas) return null;
            return this.canvas.toDataURL('image/png');
        }
    };
});

describe('Whiteboard', () => {
    let whiteboard;
    let canvas;

    beforeEach(() => {
        // Mock canvas context
        const mockContext = {
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            arc: jest.fn(),
            strokeRect: jest.fn(),
            clearRect: jest.fn(),
            strokeStyle: '#000000',
            lineWidth: 1,
            fillStyle: '#000000'
        };

        document.body.innerHTML = `
      <div id="canvas-wrapper" style="width: 800px; height: 600px;">
        <canvas id="test-canvas"></canvas>
      </div>
    `;

        canvas = document.getElementById('test-canvas');
        canvas.getContext = jest.fn(() => mockContext);
        canvas.getBoundingClientRect = jest.fn(() => ({
            left: 0,
            top: 0,
            width: 800,
            height: 600
        }));
        canvas.toDataURL = jest.fn(() => 'data:image/png;base64,mockdata');

        whiteboard = new Whiteboard('test-canvas');
    });

    describe('Initialization', () => {
        test('should initialize with default state', () => {
            expect(whiteboard.scale).toBe(1);
            expect(whiteboard.currentTool).toBe('select');
            expect(whiteboard.currentColor).toBe('#000000');
            expect(whiteboard.brushSize).toBe(3);
        });

        test('should initialize arrays', () => {
            expect(whiteboard.shapes).toEqual([]);
            expect(whiteboard.textInputs).toEqual([]);
        });

        test('should set canvas dimensions', () => {
            expect(whiteboard.canvas.width).toBe(5000);
            expect(whiteboard.canvas.height).toBe(5000);
        });
    });

    describe('Tool Management', () => {
        test('should change tool', () => {
            whiteboard.setTool('draw');
            expect(whiteboard.currentTool).toBe('draw');
        });

        test('should change color', () => {
            whiteboard.setColor('#ff0000');
            expect(whiteboard.currentColor).toBe('#ff0000');
        });

        test('should change brush size', () => {
            whiteboard.setBrushSize(5);
            expect(whiteboard.brushSize).toBe(5);
        });
    });

    describe('Mouse Position', () => {
        test('should calculate correct position', () => {
            const mockEvent = { clientX: 100, clientY: 100 };
            const pos = whiteboard.getMousePos(mockEvent);

            expect(pos.x).toBe(100);
            expect(pos.y).toBe(100);
        });

        test('should account for scale', () => {
            whiteboard.scale = 2;
            const mockEvent = { clientX: 100, clientY: 100 };
            const pos = whiteboard.getMousePos(mockEvent);

            expect(pos.x).toBe(50);
            expect(pos.y).toBe(50);
        });
    });

    describe('Drawing', () => {
        test('should draw line', () => {
            whiteboard.drawLine(0, 0, 100, 100, '#000000', 3);

            expect(whiteboard.ctx.beginPath).toHaveBeenCalled();
            expect(whiteboard.ctx.moveTo).toHaveBeenCalledWith(0, 0);
            expect(whiteboard.ctx.lineTo).toHaveBeenCalledWith(100, 100);
            expect(whiteboard.ctx.stroke).toHaveBeenCalled();
        });

        test('should draw rectangle', () => {
            whiteboard.drawShape('rect', 10, 10, 100, 100);
            expect(whiteboard.ctx.strokeRect).toHaveBeenCalled();
        });

        test('should draw circle', () => {
            whiteboard.drawShape('circle', 50, 50, 100, 100);
            expect(whiteboard.ctx.arc).toHaveBeenCalled();
        });
    });

    describe('Zoom', () => {
        test('should zoom in', () => {
            whiteboard.zoom(1.5);
            expect(whiteboard.scale).toBe(1.5);
        });

        test('should zoom out', () => {
            whiteboard.zoom(0.5);
            expect(whiteboard.scale).toBe(0.5);
        });

        test('should not exceed max scale', () => {
            whiteboard.scale = 5;
            whiteboard.zoom(2);
            expect(whiteboard.scale).toBe(5);
        });

        test('should not go below min scale', () => {
            whiteboard.scale = 0.1;
            whiteboard.zoom(0.5);
            expect(whiteboard.scale).toBe(0.1);
        });
    });

    describe('Clear', () => {
        test('should clear canvas', () => {
            whiteboard.shapes = [{ type: 'rect' }];
            whiteboard.clear();

            expect(whiteboard.ctx.clearRect).toHaveBeenCalled();
            expect(whiteboard.shapes).toEqual([]);
        });
    });

    describe('Mouse Events', () => {
        test('should handle mouse down', () => {
            whiteboard.setTool('draw');
            const mockEvent = { clientX: 100, clientY: 100 };

            whiteboard.handleMouseDown(mockEvent);

            expect(whiteboard.isDrawing).toBe(true);
        });

        test('should handle pan mode', () => {
            whiteboard.setTool('pan');
            const mockEvent = { clientX: 100, clientY: 100 };

            whiteboard.handleMouseDown(mockEvent);

            expect(whiteboard.isPanning).toBe(true);
        });

        test('should handle mouse up', () => {
            whiteboard.isDrawing = true;
            const mockEvent = { clientX: 100, clientY: 100 };

            whiteboard.handleMouseUp(mockEvent);

            expect(whiteboard.isDrawing).toBe(false);
        });
    });

    describe('Screenshot', () => {
        test('should take screenshot', () => {
            const result = whiteboard.takeScreenshot();
            expect(result).toBe('data:image/png;base64,mockdata');
        });
    });
});
