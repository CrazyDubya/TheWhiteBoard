// Agents Manager
class AgentsManager {
    constructor() {
        this.agents = [];
        this.nextAgentId = 1;
        this.loadAgents();
    }
    
    loadAgents() {
        const saved = localStorage.getItem('whiteboard-agents');
        if (saved) {
            this.agents = JSON.parse(saved);
            // Update nextAgentId to be higher than any existing agent ID
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
                    <button class="agent-view-btn">View</button>
                    <button class="agent-remove-btn">Remove</button>
                </div>
            `;
            
            // Add event listeners
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
