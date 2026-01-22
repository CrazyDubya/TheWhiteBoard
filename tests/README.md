# Tests

This directory contains the test suite for TheWhiteBoard project.

## Test Structure

```
tests/
├── setup.js           # Test setup and configuration
├── unit/              # Unit tests for individual classes
│   ├── agents.test.js      # AgentsManager class tests
│   ├── whiteboard.test.js  # Whiteboard class tests
│   └── windows.test.js     # WindowsManager class tests
└── integration/       # Integration tests (future)
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/agents.test.js
```

## Test Coverage

Current test coverage includes:

### AgentsManager (30 tests)

- ✅ Initialization and construction
- ✅ Agent creation, removal, and retrieval
- ✅ localStorage persistence (save/load)
- ✅ Workspace management
- ✅ Agent list rendering

### WindowsManager (18 tests)

- ✅ Window creation and initialization
- ✅ Window controls (minimize, maximize, close)
- ✅ Z-index management
- ✅ Multiple window handling

### Whiteboard (13 tests)

- ✅ Canvas initialization
- ✅ Tool management (draw, pan, text, shapes)
- ✅ Drawing operations (line, rectangle, circle)
- ✅ Zoom functionality
- ✅ Mouse event handling
- ✅ Screenshot capability

## Test Framework

- **Jest**: Test runner and assertion library
- **jsdom**: DOM implementation for testing browser code in Node.js
- **@testing-library/dom**: DOM testing utilities

## Writing Tests

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Group related tests in `describe` blocks
4. Clean up after tests (Jest does this automatically via setup.js)
5. Mock external dependencies appropriately

## Notes

- Tests use inline class definitions to avoid complex module loading
- localStorage is mocked in setup.js
- Canvas operations are mocked for testing
- DOM elements are created fresh for each test
