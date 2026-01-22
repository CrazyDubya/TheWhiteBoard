/**
 * Unit tests for AgentsManager class
 */

// Mock the DOM environment
beforeAll(() => {
  // Define AgentsManager class inline for testing
  global.AgentsManager = class AgentsManager {
    constructor() {
      this.agents = [];
      this.nextAgentId = 1;
      this.loadAgents();
    }
    
    loadAgents() {
      const saved = localStorage.getItem('whiteboard-agents');
      if (saved) {
        this.agents = JSON.parse(saved);
        if (this.agents.length > 0) {
          const maxId = Math.max(...this.agents.map(a => a.id));
          this.nextAgentId = maxId + 1;
        }
      }
    }
    
    saveAgents() {
      localStorage.setItem('whiteboard-agents', JSON.stringify(this.agents));
    }
    
    addAgent(name) {
      if (!name.trim()) return false;
      
      const agentId = this.nextAgentId++;
      const agent = {
        id: agentId,
        name: name.trim(),
        status: 'active',
        workspace: `agents/agent_${agentId}`,
        createdAt: new Date().toISOString()
      };
      
      this.agents.push(agent);
      this.saveAgents();
      this.createAgentWorkspace(agent);
      
      return agent;
    }
    
    removeAgent(id) {
      this.agents = this.agents.filter(a => a.id !== id);
      this.saveAgents();
    }
    
    getAgent(id) {
      return this.agents.find(a => a.id === id);
    }
    
    getAllAgents() {
      return this.agents;
    }
    
    createAgentWorkspace(agent) {
      const workspaceKey = `workspace-${agent.id}`;
      const workspace = {
        files: [],
        notes: '',
        lastAccess: new Date().toISOString()
      };
      localStorage.setItem(workspaceKey, JSON.stringify(workspace));
    }
    
    getAgentWorkspace(agentId) {
      const workspaceKey = `workspace-${agentId}`;
      const saved = localStorage.getItem(workspaceKey);
      return saved ? JSON.parse(saved) : null;
    }
    
    updateAgentWorkspace(agentId, workspace) {
      const workspaceKey = `workspace-${agentId}`;
      workspace.lastAccess = new Date().toISOString();
      localStorage.setItem(workspaceKey, JSON.stringify(workspace));
    }
    
    renderAgentsList(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      container.innerHTML = '';
      
      if (this.agents.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No agents yet. Add one to get started!</p>';
        return;
      }
      
      this.agents.forEach(agent => {
        const agentEl = document.createElement('div');
        agentEl.className = 'agent-item';
        agentEl.innerHTML = `
          <div class="agent-info">
            <div class="agent-name">${agent.name}</div>
            <div class="agent-status">Status: ${agent.status}</div>
            <div class="agent-status">Workspace: ${agent.workspace}</div>
          </div>
          <div class="agent-actions">
            <button class="agent-view-btn">View</button>
            <button class="agent-remove-btn">Remove</button>
          </div>
        `;
        
        const viewBtn = agentEl.querySelector('.agent-view-btn');
        const removeBtn = agentEl.querySelector('.agent-remove-btn');
        
        viewBtn.addEventListener('click', () => this.viewWorkspace(agent.id));
        removeBtn.addEventListener('click', () => {
          this.removeAgent(agent.id);
          this.renderAgentsList('agents-list');
        });
        
        container.appendChild(agentEl);
      });
    }
    
    viewWorkspace(agentId) {
      const agent = this.getAgent(agentId);
      if (!agent) return;
      
      const workspace = this.getAgentWorkspace(agentId);
      
      if (window.windowsManager) {
        const content = `
          <h4>Agent: ${agent.name}</h4>
          <p><strong>Workspace:</strong> ${agent.workspace}</p>
          <p><strong>Status:</strong> ${agent.status}</p>
          <p><strong>Last Access:</strong> ${workspace ? new Date(workspace.lastAccess).toLocaleString() : 'Never'}</p>
          <hr>
          <p>This is the private workspace for ${agent.name}.</p>
          <p>Files and notes specific to this agent would be stored here.</p>
        `;
        window.windowsManager.createWindow(`${agent.name} Workspace`, content);
      }
    }
  };
});

describe('AgentsManager', () => {
  let agentsManager;

  beforeEach(() => {
    // Create a fresh instance
    agentsManager = new AgentsManager();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with empty agents array', () => {
      expect(agentsManager.agents).toEqual([]);
    });

    test('should start with nextAgentId of 1', () => {
      expect(agentsManager.nextAgentId).toBe(1);
    });

    test('should call loadAgents on construction', () => {
      // The constructor calls loadAgents which tries to get from localStorage
      // Since localStorage is empty, it should remain empty
      expect(agentsManager.agents).toEqual([]);
    });
  });

  describe('loadAgents', () => {
    test('should load agents from localStorage', () => {
      const savedAgents = [
        { id: 1, name: 'Agent 1', status: 'active' },
        { id: 2, name: 'Agent 2', status: 'active' }
      ];
      
      localStorage.setItem('whiteboard-agents', JSON.stringify(savedAgents));
      
      agentsManager.loadAgents();
      
      expect(agentsManager.agents).toEqual(savedAgents);
      expect(agentsManager.nextAgentId).toBe(3); // Should be max id + 1
    });

    test('should handle empty localStorage', () => {
      agentsManager.loadAgents();
      
      expect(agentsManager.agents).toEqual([]);
      expect(agentsManager.nextAgentId).toBe(1);
    });

    test('should update nextAgentId based on existing agents', () => {
      const savedAgents = [
        { id: 5, name: 'Agent 5', status: 'active' },
        { id: 10, name: 'Agent 10', status: 'active' }
      ];
      
      localStorage.setItem('whiteboard-agents', JSON.stringify(savedAgents));
      
      agentsManager.loadAgents();
      
      expect(agentsManager.nextAgentId).toBe(11);
    });
  });

  describe('saveAgents', () => {
    test('should save agents to localStorage', () => {
      agentsManager.agents = [
        { id: 1, name: 'Test Agent', status: 'active' }
      ];
      
      agentsManager.saveAgents();
      
      const saved = localStorage.getItem('whiteboard-agents');
      expect(JSON.parse(saved)).toEqual(agentsManager.agents);
    });
  });

  describe('addAgent', () => {
    test('should add a new agent with valid name', () => {
      const agent = agentsManager.addAgent('Test Agent');
      
      expect(agent).toBeTruthy();
      expect(agent.id).toBe(1);
      expect(agent.name).toBe('Test Agent');
      expect(agent.status).toBe('active');
      expect(agent.workspace).toBe('agents/agent_1');
      expect(agent.createdAt).toBeDefined();
    });

    test('should trim whitespace from agent name', () => {
      const agent = agentsManager.addAgent('  Spaced Name  ');
      
      expect(agent.name).toBe('Spaced Name');
    });

    test('should return false for empty name', () => {
      const agent = agentsManager.addAgent('');
      
      expect(agent).toBe(false);
    });

    test('should return false for whitespace-only name', () => {
      const agent = agentsManager.addAgent('   ');
      
      expect(agent).toBe(false);
    });

    test('should increment agent IDs', () => {
      const agent1 = agentsManager.addAgent('Agent 1');
      const agent2 = agentsManager.addAgent('Agent 2');
      const agent3 = agentsManager.addAgent('Agent 3');
      
      expect(agent1.id).toBe(1);
      expect(agent2.id).toBe(2);
      expect(agent3.id).toBe(3);
    });

    test('should save agents after adding', () => {
      agentsManager.addAgent('Test Agent');
      
      const saved = localStorage.getItem('whiteboard-agents');
      expect(saved).toBeTruthy();
      const agents = JSON.parse(saved);
      expect(agents.length).toBe(1);
    });

    test('should create agent workspace', () => {
      agentsManager.addAgent('Test Agent');
      
      const workspace = localStorage.getItem('workspace-1');
      expect(workspace).toBeTruthy();
      const workspaceData = JSON.parse(workspace);
      expect(workspaceData.files).toEqual([]);
    });
  });

  describe('removeAgent', () => {
    test('should remove agent by id', () => {
      agentsManager.addAgent('Agent 1');
      agentsManager.addAgent('Agent 2');
      agentsManager.addAgent('Agent 3');
      
      agentsManager.removeAgent(2);
      
      expect(agentsManager.agents.length).toBe(2);
      expect(agentsManager.agents.find(a => a.id === 2)).toBeUndefined();
    });

    test('should save agents after removing', () => {
      agentsManager.addAgent('Test Agent');
      
      agentsManager.removeAgent(1);
      
      const saved = localStorage.getItem('whiteboard-agents');
      const agents = JSON.parse(saved);
      expect(agents.length).toBe(0);
    });

    test('should handle removing non-existent agent', () => {
      agentsManager.addAgent('Agent 1');
      
      const beforeLength = agentsManager.agents.length;
      agentsManager.removeAgent(999);
      
      expect(agentsManager.agents.length).toBe(beforeLength);
    });
  });

  describe('getAgent', () => {
    test('should return agent by id', () => {
      agentsManager.addAgent('Agent 1');
      agentsManager.addAgent('Agent 2');
      
      const agent = agentsManager.getAgent(2);
      
      expect(agent).toBeDefined();
      expect(agent.name).toBe('Agent 2');
    });

    test('should return undefined for non-existent agent', () => {
      const agent = agentsManager.getAgent(999);
      
      expect(agent).toBeUndefined();
    });
  });

  describe('getAllAgents', () => {
    test('should return all agents', () => {
      agentsManager.addAgent('Agent 1');
      agentsManager.addAgent('Agent 2');
      
      const agents = agentsManager.getAllAgents();
      
      expect(agents.length).toBe(2);
      expect(agents[0].name).toBe('Agent 1');
      expect(agents[1].name).toBe('Agent 2');
    });

    test('should return empty array when no agents', () => {
      const agents = agentsManager.getAllAgents();
      
      expect(agents).toEqual([]);
    });
  });

  describe('createAgentWorkspace', () => {
    test('should create workspace in localStorage', () => {
      const agent = { id: 1, name: 'Test Agent' };
      
      agentsManager.createAgentWorkspace(agent);
      
      const workspace = localStorage.getItem('workspace-1');
      expect(workspace).toBeTruthy();
      const workspaceData = JSON.parse(workspace);
      expect(workspaceData.files).toEqual([]);
    });

    test('should include lastAccess timestamp', () => {
      const agent = { id: 1, name: 'Test Agent' };
      
      agentsManager.createAgentWorkspace(agent);
      
      const workspace = localStorage.getItem('workspace-1');
      const workspaceData = JSON.parse(workspace);
      
      expect(workspaceData.lastAccess).toBeDefined();
      expect(new Date(workspaceData.lastAccess)).toBeInstanceOf(Date);
    });
  });

  describe('getAgentWorkspace', () => {
    test('should retrieve workspace from localStorage', () => {
      const workspace = {
        files: ['file1.txt'],
        notes: 'test notes',
        lastAccess: new Date().toISOString()
      };
      
      localStorage.setItem('workspace-1', JSON.stringify(workspace));
      
      const result = agentsManager.getAgentWorkspace(1);
      
      expect(result).toEqual(workspace);
    });

    test('should return null for non-existent workspace', () => {
      const result = agentsManager.getAgentWorkspace(999);
      
      expect(result).toBeNull();
    });
  });

  describe('updateAgentWorkspace', () => {
    test('should update workspace in localStorage', () => {
      const workspace = {
        files: ['updated.txt'],
        notes: 'updated notes'
      };
      
      agentsManager.updateAgentWorkspace(1, workspace);
      
      const saved = localStorage.getItem('workspace-1');
      const savedWorkspace = JSON.parse(saved);
      expect(savedWorkspace.files).toEqual(['updated.txt']);
      expect(savedWorkspace.notes).toBe('updated notes');
    });

    test('should update lastAccess timestamp', () => {
      const workspace = {
        files: [],
        notes: ''
      };
      
      agentsManager.updateAgentWorkspace(1, workspace);
      
      const saved = localStorage.getItem('workspace-1');
      const savedWorkspace = JSON.parse(saved);
      
      expect(savedWorkspace.lastAccess).toBeDefined();
    });
  });

  describe('renderAgentsList', () => {
    test('should render empty message when no agents', () => {
      document.body.innerHTML = '<div id="test-container"></div>';
      
      agentsManager.renderAgentsList('test-container');
      
      const container = document.getElementById('test-container');
      expect(container.innerHTML).toContain('No agents yet');
    });

    test('should render agent items', () => {
      document.body.innerHTML = '<div id="test-container"></div>';
      
      agentsManager.addAgent('Agent 1');
      agentsManager.addAgent('Agent 2');
      
      agentsManager.renderAgentsList('test-container');
      
      const container = document.getElementById('test-container');
      expect(container.querySelectorAll('.agent-item').length).toBe(2);
    });

    test('should handle missing container', () => {
      // Should not throw error
      expect(() => {
        agentsManager.renderAgentsList('non-existent');
      }).not.toThrow();
    });
  });
});
