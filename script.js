// Contribution Manager Application
class ContributionManager {
    constructor() {
        this.contributions = this.loadContributions();
        this.editingId = null;
        this.currentUser = this.loadUser();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderContributions();
        this.updateStatistics();
        this.setCurrentDate();
        this.checkUserIdentification();
        this.setupAutoSave();
        this.diagnostics();
    }

    bindEvents() {
        // Form submission
        document.getElementById('contributionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addContribution();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToPowerPoint();
        });

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllContributions();
        });

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => {
            this.renderContributions();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.renderContributions();
        });

        // Modal events
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            const editModal = document.getElementById('editModal');
            const userModal = document.getElementById('userModal');
            
            if (e.target === editModal) {
                this.closeModal();
            }
            // Don't allow closing user modal by clicking outside if no user is set
            if (e.target === userModal && this.currentUser) {
                this.hideUserModal();
            }
        });

        // User identification events
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.setUser();
        });

        document.getElementById('changeUserBtn').addEventListener('click', () => {
            this.changeUser();
        });
    }

    setCurrentDate() {
        // No date field to set
    }

    addContribution() {
        const formData = this.getFormData();
        
        if (this.editingId) {
            // Update existing contribution
            const index = this.contributions.findIndex(c => c.id === this.editingId);
            if (index !== -1) {
                this.contributions[index] = { ...formData, id: this.editingId };
            }
            this.editingId = null;
            this.closeModal();
        } else {
            // Add new contribution
            const contribution = {
                ...formData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            this.contributions.unshift(contribution);
        }

        this.saveContributions();
        this.renderContributions();
        this.updateStatistics();
        this.resetForm();
        this.showNotification('Contribution saved successfully!', 'success');
    }

    getFormData() {
        const teamInput = document.getElementById('team').value.trim();
        return {
            category: document.getElementById('category').value,
            description: document.getElementById('description').value.trim(),
            team: teamInput || (this.currentUser ? this.currentUser : '')
        };
    }

    editContribution(id) {
        const contribution = this.contributions.find(c => c.id === id);
        if (!contribution) return;

        this.editingId = id;
        this.populateEditForm(contribution);
        this.openModal();
    }

    populateEditForm(contribution) {
        const form = document.getElementById('editForm');
        form.innerHTML = `
            <div class="form-group">
                <label for="editCategory">Practice Work Category</label>
                <select id="editCategory" required>
                    <option value="">Select Category</option>
                    <option value="RFP" ${contribution.category === 'RFP' ? 'selected' : ''}>RFP (Request for Proposal)</option>
                    <option value="PoV" ${contribution.category === 'PoV' ? 'selected' : ''}>PoV (Proof of Value)</option>
                    <option value="Proposal" ${contribution.category === 'Proposal' ? 'selected' : ''}>Proposal</option>
                    <option value="Bid" ${contribution.category === 'Bid' ? 'selected' : ''}>Bid</option>
                    <option value="Strategy" ${contribution.category === 'Strategy' ? 'selected' : ''}>Strategy</option>
                    <option value="Research" ${contribution.category === 'Research' ? 'selected' : ''}>Research</option>
                    <option value="Other" ${contribution.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>

            <div class="form-group">
                <label for="editDescription">Description</label>
                <textarea id="editDescription" rows="4" required placeholder="Describe your contribution, role, and impact">${contribution.description}</textarea>
            </div>

            <div class="form-group">
                <label for="editTeam">Team (optional)</label>
                <input type="text" id="editTeam" placeholder="Leave empty to use your name, or enter team/colleagues" value="${(this.currentUser && contribution.team === this.currentUser) ? '' : contribution.team || ''}">
            </div>

            <button type="button" onclick="app.updateContribution()" class="btn btn-primary">
                <i class="fas fa-save"></i> Update Contribution
            </button>
        `;
    }

    updateContribution() {
        const teamInput = document.getElementById('editTeam').value.trim();
        const formData = {
            category: document.getElementById('editCategory').value,
            description: document.getElementById('editDescription').value.trim(),
            team: teamInput || (this.currentUser ? this.currentUser : '')
        };

        const index = this.contributions.findIndex(c => c.id === this.editingId);
        if (index !== -1) {
            this.contributions[index] = { ...formData, id: this.editingId, createdAt: this.contributions[index].createdAt };
        }

        this.editingId = null;
        this.closeModal();
        this.saveContributions();
        this.renderContributions();
        this.updateStatistics();
        this.showNotification('Contribution updated successfully!', 'success');
    }

    deleteContribution(id) {
        if (confirm('Are you sure you want to delete this contribution?')) {
            this.contributions = this.contributions.filter(c => c.id !== id);
            this.saveContributions();
            this.renderContributions();
            this.updateStatistics();
            this.showNotification('Contribution deleted successfully!', 'success');
        }
    }

    renderContributions() {
        const container = document.getElementById('contributionsList');
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        let filteredContributions = this.contributions.filter(contribution => {
            const matchesSearch = !searchTerm || 
                contribution.category.toLowerCase().includes(searchTerm) ||
                contribution.description.toLowerCase().includes(searchTerm) ||
                (contribution.team && contribution.team.toLowerCase().includes(searchTerm));

            const matchesCategory = !categoryFilter || contribution.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });

        if (filteredContributions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>${this.contributions.length === 0 ? 'No contributions added yet. Add your first contribution above!' : 'No contributions match your search criteria.'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredContributions.map(contribution => `
            <div class="contribution-item">
                <div class="contribution-header">
                    <div>
                        <div class="contribution-meta">
                            <span class="category-badge category-${contribution.category}">${contribution.category}</span>
                            ${contribution.team ? `
                                <div class="meta-item">
                                    <i class="fas fa-${contribution.team === this.currentUser ? 'user' : 'users'}"></i>
                                    <span>${contribution.team}</span>
                                    ${contribution.team === this.currentUser ? '<span class="auto-tag">(auto)</span>' : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="contribution-actions">
                        <button class="btn btn-edit" onclick="app.editContribution('${contribution.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete" onclick="app.deleteContribution('${contribution.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>

                <div class="contribution-description">${contribution.description}</div>
            </div>
        `).join('');
    }

    updateStatistics() {
        const uniqueCategories = [...new Set(this.contributions.map(c => c.category))];

        document.getElementById('totalContributions').textContent = this.contributions.length;
        document.getElementById('categoriesCount').textContent = uniqueCategories.length;
    }

    async exportToPowerPoint() {
        if (this.contributions.length === 0) {
            this.showNotification('No contributions to export!', 'error');
            return;
        }

        try {
            this.showNotification('Generating PowerPoint presentation...', 'info');

            const pptx = new PptxGenJS();
            
            // Group contributions by category
            const groupedContributions = {};
            this.contributions.forEach(contribution => {
                if (!groupedContributions[contribution.category]) {
                    groupedContributions[contribution.category] = [];
                }
                groupedContributions[contribution.category].push(contribution);
            });

            // Create one slide per category with table
            Object.keys(groupedContributions).forEach(category => {
                const slide = pptx.addSlide();
                
                // Category title
                slide.addText(category, {
                    x: 0.5, y: 0.5, w: 9, h: 1,
                    fontSize: 24, bold: true, color: '2c3e50'
                });

                // Add user name in top right corner
                if (this.currentUser) {
                    slide.addText(`Prepared by: ${this.currentUser}`, {
                        x: 6.5, y: 0.2, w: 3, h: 0.3,
                        fontSize: 10, color: '6c757d', align: 'right'
                    });
                }

                // Prepare table data
                const tableData = [
                    ['No.', 'Activity', 'Description', 'Team'] // Header row
                ];

                // Add contribution rows
                groupedContributions[category].forEach((contribution, index) => {
                    tableData.push([
                        (index + 1).toString(),
                        contribution.category || '-',
                        contribution.description || '-',
                        contribution.team || (this.currentUser ? this.currentUser : '-')
                    ]);
                });

                // Add table to slide
                slide.addTable(tableData, {
                    x: 0.5, y: 1.8, w: 9, h: 5,
                    fontSize: 11,
                    border: { pt: 1, color: 'e1e8ed' },
                    fill: { color: 'ffffff' },
                    color: '2c3e50',
                    colW: [0.8, 2.2, 4.0, 2.0], // Column widths
                    rowH: 0.4 // Row height
                });

                // Style header row
                slide.addTable([tableData[0]], {
                    x: 0.5, y: 1.8, w: 9, h: 0.4,
                    fontSize: 12,
                    bold: true,
                    border: { pt: 1, color: 'e1e8ed' },
                    fill: { color: 'f8f9fa' },
                    color: '2c3e50',
                    colW: [0.8, 2.2, 4.0, 2.0]
                });
            });

            // Save the presentation
            const userPart = this.currentUser ? `${this.currentUser.replace(/[^a-zA-Z0-9]/g, '_')}_` : '';
            const fileName = `${userPart}Contributions_${new Date().toISOString().split('T')[0]}.pptx`;
            await pptx.writeFile({ fileName });
            
            this.showNotification('PowerPoint presentation exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting to PowerPoint. Please try again.', 'error');
        }
    }

    clearAllContributions() {
        if (confirm('Are you sure you want to delete all contributions? This action cannot be undone.')) {
            this.contributions = [];
            this.saveContributions();
            this.renderContributions();
            this.updateStatistics();
            this.showNotification('All contributions cleared!', 'success');
        }
    }

    openModal() {
        document.getElementById('editModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingId = null;
    }

    resetForm() {
        document.getElementById('contributionForm').reset();
        this.setCurrentDate();
    }

    // Date formatting no longer needed

    saveContributions() {
        try {
            // Check if localStorage is available
            if (typeof(Storage) === "undefined") {
                console.warn('localStorage not supported - cannot save');
                this.showNotification('Cannot save data - browser storage not supported', 'error');
                return false;
            }

            const dataToSave = JSON.stringify(this.contributions);
            localStorage.setItem('contributions', dataToSave);
            console.log('Saved contributions to localStorage:', this.contributions.length, 'items,', dataToSave.length, 'characters');
            
            // Verify the save worked
            const verification = localStorage.getItem('contributions');
            if (verification === dataToSave) {
                console.log('Save verification successful');
                return true;
            } else {
                console.error('Save verification failed');
                this.showNotification('Data save verification failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error saving contributions:', error);
            if (error.name === 'QuotaExceededError') {
                this.showNotification('Storage quota exceeded. Cannot save more data.', 'error');
            } else {
                this.showNotification('Error saving data to storage', 'error');
            }
            return false;
        }
    }

    loadContributions() {
        try {
            // Check if localStorage is available
            if (typeof(Storage) === "undefined") {
                console.warn('localStorage not supported');
                this.showNotification('Browser storage not supported. Data will not persist.', 'warning');
                return [];
            }

            const saved = localStorage.getItem('contributions');
            console.log('Loading contributions from localStorage:', saved ? `${saved.length} characters` : 'no data');
            
            if (!saved) {
                console.log('No saved contributions found');
                return [];
            }

            const contributions = JSON.parse(saved);
            console.log('Loaded contributions:', contributions.length, 'items');
            
            // Ensure backward compatibility - if contributions don't have team field, preserve them
            const processedContributions = contributions.map(contribution => ({
                ...contribution,
                team: contribution.team || '' // Ensure team field exists, even if empty
            }));

            if (processedContributions.length > 0) {
                this.showNotification(`Loaded ${processedContributions.length} contributions from storage`, 'info');
            }

            return processedContributions;
        } catch (error) {
            console.error('Error loading contributions:', error);
            this.showNotification('Error loading saved data. Starting fresh.', 'error');
            return [];
        }
    }

    loadUser() {
        return localStorage.getItem('currentUser') || null;
    }

    saveUser(userName) {
        localStorage.setItem('currentUser', userName);
        this.currentUser = userName;
    }

    checkUserIdentification() {
        if (!this.currentUser) {
            this.showUserModal();
        } else {
            this.showUserWelcome();
        }
    }

    showUserModal() {
        // Try to detect Windows username (limited browser support)
        this.tryAutoDetectUser();
        document.getElementById('userModal').style.display = 'block';
        document.getElementById('userNameInput').focus();
    }

    tryAutoDetectUser() {
        // Try to get username from various sources
        let detectedName = '';
        
        // Try Windows environment variable (very limited support)
        try {
            detectedName = process?.env?.USERNAME || '';
        } catch (e) {
            // Not available in browser
        }
        
        // Try to extract from file system API if available
        if (!detectedName && 'showDirectoryPicker' in window) {
            // This is just a hint - we can't automatically access it
            detectedName = 'User';
        }
        
        // Pre-fill the input if we have a detected name
        if (detectedName && detectedName !== 'User') {
            document.getElementById('userNameInput').value = detectedName;
        }
    }

    hideUserModal() {
        document.getElementById('userModal').style.display = 'none';
    }

    showUserWelcome() {
        document.getElementById('userName').textContent = this.currentUser;
        document.getElementById('userWelcome').style.display = 'flex';
    }

    setUser() {
        const userName = document.getElementById('userNameInput').value.trim();
        if (userName) {
            this.saveUser(userName);
            this.hideUserModal();
            this.showUserWelcome();
            // Refresh the display now that we have user information
            this.renderContributions();
            this.showNotification(`Welcome, ${userName}! Your name will be automatically used in the Team field unless you specify otherwise.`, 'success');
        }
    }

    changeUser() {
        if (confirm('Are you sure you want to change the user? This will not affect your saved contributions.')) {
            document.getElementById('userWelcome').style.display = 'none';
            document.getElementById('userNameInput').value = this.currentUser;
            this.showUserModal();
        }
    }



    setupAutoSave() {
        // Auto-save every 30 seconds if there are unsaved changes
        setInterval(() => {
            if (this.contributions.length > 0) {
                this.saveContributions();
            }
        }, 30000);
        
        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveContributions();
        });
    }

    diagnostics() {
        console.log('=== Contribution Manager Diagnostics ===');
        console.log('localStorage available:', typeof(Storage) !== "undefined");
        console.log('Current contributions in memory:', this.contributions.length);
        
        try {
            const stored = localStorage.getItem('contributions');
            console.log('Stored data length:', stored ? stored.length : 0);
            console.log('Stored contributions count:', stored ? JSON.parse(stored).length : 0);
        } catch (e) {
            console.log('Error reading stored data:', e);
        }
        
        console.log('Current user:', this.currentUser);
        console.log('User in localStorage:', localStorage.getItem('currentUser'));
        console.log('==========================================');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
const app = new ContributionManager(); 