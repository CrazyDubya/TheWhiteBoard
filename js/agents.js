/**
 * @typedef {Object} Agent
 * @property {number} id - Unique identifier for the agent
 * @property {string} name - Display name of the agent
 * @property {string} status - Current status ('active' or 'inactive')
 * @property {string} workspace - Path to agent's workspace directory
 * @property {string} createdAt - ISO timestamp of agent creation
 */

/**
 * @typedef {Object} AgentWorkspace
 * @property {Array<string>} files - List of files in the workspace
 * @property {string} notes - Workspace notes
 * @property {string} lastAccess - ISO timestamp of last access
 */

/**
 * Manages the lifecycle and persistence of AI agents.
 * Each agent has its own workspace and can perform operations on the whiteboard.
 *
 * @class AgentsManager
 */
class AgentsManager {
    /**
     * Creates an instance of AgentsManager.
     * Automatically loads any previously saved agents from localStorage.
     *
     * @constructor
     */
    constructor() {
        /**
         * @type {Agent[]}
         * @private
         */
        this.agents = [];

        /**
         * @type {number}
         * @private
         */
        this.nextAgentId = 1;
        this.loadAgents();
    }

    /**
     * Loads agents from localStorage.
     * Updates nextAgentId to be one higher than the maximum existing agent ID.
     *
     * @private
     * @returns {void}
     */
    loadAgents() {
        const saved = localStorage.getItem('whiteboard-agents');
        if (saved) {
            this.agents = JSON.parse(saved);
            // Update nextAgentId to be higher than any existing agent ID
            if (this.agents.length > 0) {
                const maxId = Math.max(...this.agents.map((a) => a.id));
                this.nextAgentId = maxId + 1;
            }
        }
    }

    /**
     * Saves the current agents array to localStorage.
     *
     * @private
     * @returns {void}
     */
    saveAgents() {
        localStorage.setItem('whiteboard-agents', JSON.stringify(this.agents));
    }

    /**
     * Adds a new agent with the specified name.
     * Creates a workspace for the agent and persists to localStorage.
     *
     * @param {string} name - The name for the new agent (whitespace will be trimmed)
     * @returns {Agent|false} The created agent object, or false if name is empty/whitespace
     *
     * @example
     * const agent = agentsManager.addAgent('Assistant');
     * // Returns: { id: 1, name: 'Assistant', status: 'active', ... }
     */
    addAgent(name) {
        if (!name.trim()) {
            return false;
        }

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

    /**
     * Removes an agent by ID.
     * The agent's workspace is not automatically deleted.
     *
     * @param {number} id - The ID of the agent to remove
     * @returns {void}
     */
    removeAgent(id) {
        this.agents = this.agents.filter((a) => a.id !== id);
        this.saveAgents();
    }

    /**
     * Retrieves an agent by ID.
     *
     * @param {number} id - The ID of the agent to retrieve
     * @returns {Agent|undefined} The agent object, or undefined if not found
     */
    getAgent(id) {
        return this.agents.find((a) => a.id === id);
    }

    /**
     * Gets all agents.
     *
     * @returns {Agent[]} Array of all agent objects
     */
    getAllAgents() {
        return this.agents;
    }

    /**
     * Creates a new workspace for an agent in localStorage.
     * Initializes with empty files array and notes.
     *
     * @param {Agent} agent - The agent object for which to create a workspace
     * @returns {void}
     */
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

    /**
     * Retrieves an agent's workspace from localStorage.
     *
     * @param {number} agentId - The ID of the agent
     * @returns {AgentWorkspace|null} The workspace object, or null if not found
     */
    getAgentWorkspace(agentId) {
        const workspaceKey = `workspace-${agentId}`;
        const saved = localStorage.getItem(workspaceKey);
        return saved ? JSON.parse(saved) : null;
    }

    /**
     * Updates an agent's workspace in localStorage.
     * Automatically updates the lastAccess timestamp.
     *
     * @param {number} agentId - The ID of the agent
     * @param {AgentWorkspace} workspace - The workspace object to save
     * @returns {void}
     */
    updateAgentWorkspace(agentId, workspace) {
        const workspaceKey = `workspace-${agentId}`;
        workspace.lastAccess = new Date().toISOString();
        localStorage.setItem(workspaceKey, JSON.stringify(workspace));
    }

    /**
     * Renders the list of agents in the specified container.
     * Creates DOM elements for each agent with view and remove buttons.
     *
     * @param {string} containerId - The ID of the DOM container element
     * @returns {void}
     */
    renderAgentsList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        container.innerHTML = '';

        if (this.agents.length === 0) {
            container.innerHTML =
                '<p style="color: #7f8c8d; text-align: center;">No agents yet. Add one to get started!</p>';
            return;
        }

        this.agents.forEach((agent) => {
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

    /**
     * Opens a floating window displaying the agent's workspace information.
     * Requires windowsManager to be available in the global scope.
     *
     * @param {number} agentId - The ID of the agent whose workspace to view
     * @returns {void}
     */
    viewWorkspace(agentId) {
        const agent = this.getAgent(agentId);
        if (!agent) {
            return;
        }

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
