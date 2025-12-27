// Agents Manager
class AgentsManager {
    constructor() {
        this.agents = [];
        this.loadAgents();
    }
    
    loadAgents() {
        const saved = localStorage.getItem('whiteboard-agents');
        if (saved) {
            this.agents = JSON.parse(saved);
        }
    }
    
    saveAgents() {
        localStorage.setItem('whiteboard-agents', JSON.stringify(this.agents));
    }
    
    addAgent(name) {
        if (!name.trim()) return false;
        
        const agent = {
            id: Date.now(),
            name: name.trim(),
            status: 'active',
            workspace: `agents/agent_${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        
        this.agents.push(agent);
        this.saveAgents();
        
        // Create agent workspace directory (simulated in localStorage)
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
        // Create a workspace in localStorage for the agent
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
                    <button onclick="agentsManager.viewWorkspace(${agent.id})">View</button>
                    <button onclick="agentsManager.removeAgent(${agent.id}); agentsManager.renderAgentsList('agents-list')">Remove</button>
                </div>
            `;
            container.appendChild(agentEl);
        });
    }
    
    viewWorkspace(agentId) {
        const agent = this.getAgent(agentId);
        if (!agent) return;
        
        const workspace = this.getAgentWorkspace(agentId);
        
        // Create a floating window to show the workspace
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
}
