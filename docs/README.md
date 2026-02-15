# API Documentation

This directory contains the automatically generated API documentation for TheWhiteBoard project.

## Viewing the Documentation

### Option 1: Open Locally
Simply open `api/index.html` in your web browser.

### Option 2: Serve with HTTP Server
```bash
npm run docs:serve
```
Then navigate to `http://localhost:8081` in your browser.

## Regenerating Documentation

To regenerate the API documentation after making changes to JSDoc comments:

```bash
npm run docs
```

## Documentation Coverage

The API documentation includes:

### Core Classes
- **AgentsManager** - Manages AI agents and their workspaces
- **WindowsManager** - Handles floating windows and their lifecycle
- **Whiteboard** - Infinite canvas with drawing tools

### Utility Functions
- **app.js** - Application initialization and coordination functions

### Type Definitions
- Agent, AgentWorkspace
- WindowData, WindowOptions  
- SharedFile

## JSDoc Coverage
- ✅ 100% of public APIs documented
- ✅ Complete type annotations
- ✅ Usage examples included
- ✅ Parameter and return type documentation

## Template

The documentation uses the [Docdash](https://github.com/clenemt/docdash) template for a clean, modern look with search functionality.

## Configuration

Documentation generation is configured in `jsdoc.json` at the project root.
