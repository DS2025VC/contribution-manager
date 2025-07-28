// Contribution Manager Application - Enhanced User Profile System
// Cache Buster: 2024-12-19-17:00:00 - Email-based User Identification

class ContributionManager {
    constructor() {
        this.contributions = []; // Start with empty array
        this.editingId = null;
        this.currentUser = this.loadUser();
        this.userProfile = this.loadUserProfile();
        this.init();
    }

    init() {
        this.bindEvents();
        this.setCurrentDate();
        this.checkUserIdentification(); // This will load contributions after user is identified
        this.setupAutoSave();
        this.diagnostics();
        
        // Ensure user welcome is displayed after DOM is fully loaded
        setTimeout(() => {
            if (this.currentUser && this.currentUser.trim()) {
                this.showUserWelcome();
            }
        }, 100);
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

        // Team export button
        document.getElementById('teamExportBtn').addEventListener('click', () => {
            this.startTeamExport();
        });

        // Team file input
        document.getElementById('teamFileInput').addEventListener('change', (e) => {
            this.handleTeamFiles(e);
        });

        // Export data button
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
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

        // User modal close button
        document.getElementById('userModalClose').addEventListener('click', () => {
            // Only allow closing if user is already set
            if (this.currentUser) {
                this.hideUserModal();
            }
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

        // Enhanced user profile events
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUserProfile();
        });

        document.getElementById('changeUserBtn').addEventListener('click', () => {
            this.changeUser();
        });

        document.getElementById('editProfileBtn').addEventListener('click', () => {
            this.editProfile();
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
        return {
            id: Date.now(),
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            team: document.getElementById('team').value || (this.userProfile?.fullName || this.currentUser),
            date: new Date().toLocaleDateString(),
            userName: this.userProfile?.fullName || this.currentUser,
            userEmail: this.currentUser
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
        const totalContributions = this.contributions.length;
        const categories = [...new Set(this.contributions.map(c => c.category))];
        
        document.getElementById('totalContributions').textContent = totalContributions;
        document.getElementById('totalCategories').textContent = categories.length;
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

            // Save user-specific contributions
            const userKey = this.getUserContributionsKey();
            const dataToSave = JSON.stringify(this.contributions);
            localStorage.setItem(userKey, dataToSave);
            console.log('Saved contributions for user:', this.currentUser, 'to key:', userKey);
            console.log('Saved data:', this.contributions.length, 'items,', dataToSave.length, 'characters');
            
            // Verify the save worked
            const verification = localStorage.getItem(userKey);
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

            // Load user-specific contributions
            const userKey = this.getUserContributionsKey();
            let saved = localStorage.getItem(userKey);
            
            // Migration: Check for old global contributions and migrate them to current user
            if (!saved && this.currentUser) {
                const oldGlobalData = localStorage.getItem('contributions');
                if (oldGlobalData) {
                    console.log('Migrating old global contributions to user-specific storage');
                    localStorage.setItem(userKey, oldGlobalData);
                    saved = oldGlobalData;
                    // Remove old global data to prevent confusion
                    localStorage.removeItem('contributions');
                    this.showNotification('Migrated your existing contributions to user-specific storage', 'info');
                }
            }
            
            console.log('Loading contributions for user:', this.currentUser, 'from key:', userKey);
            console.log('Data found:', saved ? `${saved.length} characters` : 'no data');
            
            if (!saved) {
                console.log('No saved contributions found for this user');
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
                this.showNotification(`Loaded ${processedContributions.length} contributions for ${this.currentUser}`, 'info');
            }

            return processedContributions;
        } catch (error) {
            console.error('Error loading contributions:', error);
            this.showNotification('Error loading saved data. Starting fresh.', 'error');
            return [];
        }
    }

    // Enhanced User Profile Management
    loadUser() {
        return localStorage.getItem('currentUserEmail') || null;
    }

    loadUserProfile() {
        const email = this.loadUser();
        if (!email) return null;
        
        const profileKey = `profile_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const profileData = localStorage.getItem(profileKey);
        
        if (profileData) {
            try {
                return JSON.parse(profileData);
            } catch (error) {
                console.error('Error loading user profile:', error);
                return null;
            }
        }
        return null;
    }

    saveUser(email) {
        localStorage.setItem('currentUserEmail', email);
        this.currentUser = email;
    }

    saveUserProfile(profileData) {
        const profileKey = `profile_${profileData.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        localStorage.setItem(profileKey, JSON.stringify(profileData));
        this.userProfile = profileData;
        
        // Also save the current user email for quick access
        this.saveUser(profileData.email);
    }

    getUserContributionsKey() {
        // Create a unique key for each user's contributions based on email
        if (!this.currentUser) {
            console.warn('getUserContributionsKey called without currentUser set');
            return 'contributions_anonymous';
        }
        const userKey = this.currentUser.replace(/[^a-zA-Z0-9]/g, '_');
        return `contributions_${userKey}`;
    }

    checkUserIdentification() {
        if (!this.currentUser || !this.userProfile) {
            this.showUserModal();
        } else {
            this.showUserWelcome();
            // Load user's contributions and update display
            this.contributions = this.loadContributions();
            this.renderContributions();
            this.updateStatistics();
        }
    }

    showUserModal(isEdit = false) {
        const modal = document.getElementById('userModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalSubtext = document.getElementById('modalSubtext');
        const submitBtnText = document.getElementById('submitBtnText');
        
        if (isEdit && this.userProfile) {
            // Edit mode - populate existing data
            modalTitle.textContent = 'Edit Profile';
            modalSubtext.textContent = 'Update your profile information:';
            submitBtnText.textContent = 'Update Profile';
            
            document.getElementById('userEmail').value = this.userProfile.email || '';
            document.getElementById('userFullName').value = this.userProfile.fullName || '';
            document.getElementById('userRole').value = this.userProfile.role || '';
            document.getElementById('userLocation').value = this.userProfile.location || '';
            
            // Disable email field in edit mode
            document.getElementById('userEmail').disabled = true;
        } else {
            // New user mode
            modalTitle.textContent = 'User Profile Setup';
            modalSubtext.textContent = 'Please create your profile to personalize your contribution manager:';
            submitBtnText.textContent = 'Create Profile & Continue';
            
            // Clear all fields
            document.getElementById('userEmail').value = '';
            document.getElementById('userFullName').value = '';
            document.getElementById('userRole').value = '';
            document.getElementById('userLocation').value = '';
            
            // Enable email field
            document.getElementById('userEmail').disabled = false;
        }
        
        modal.style.display = 'block';
        document.getElementById('userEmail').focus();
    }

    hideUserModal() {
        document.getElementById('userModal').style.display = 'none';
    }

    showUserWelcome() {
        const userNameElement = document.getElementById('userName');
        const userWelcomeElement = document.getElementById('userWelcome');
        
        if (userNameElement && userWelcomeElement && this.userProfile) {
            userNameElement.textContent = this.userProfile.fullName || this.currentUser;
            userWelcomeElement.style.display = 'flex';
        }
    }

    saveUserProfile() {
        const email = document.getElementById('userEmail').value.trim();
        const fullName = document.getElementById('userFullName').value.trim();
        const role = document.getElementById('userRole').value.trim();
        const location = document.getElementById('userLocation').value.trim();
        
        if (!email || !fullName) {
            this.showNotification('Email and Full Name are required!', 'error');
            return;
        }
        
        // Check if this is a new user (different email from current)
        const isNewUser = !this.currentUser || this.currentUser !== email;
        
        if (isNewUser && this.currentUser) {
            // Save current user's data before switching
            console.log('Saving current user data before switching:', this.currentUser, this.contributions.length, 'items');
            this.saveContributions();
        }
        
        // Create profile object
        const profileData = {
            email: email,
            fullName: fullName,
            role: role,
            location: location,
            createdAt: this.userProfile?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save profile
        this.saveUserProfile(profileData);
        
        if (isNewUser) {
            // Clear current contributions array and load new user's data
            this.contributions = [];
            this.contributions = this.loadContributions();
            console.log('Loaded contributions for user:', email, this.contributions.length, 'items');
        }
        
        this.hideUserModal();
        this.showUserWelcome();
        
        // Refresh the display
        this.renderContributions();
        this.updateStatistics();
        
        const message = isNewUser ? 
            `Welcome, ${fullName}! Your profile has been created.` :
            `Profile updated successfully, ${fullName}!`;
        
        this.showNotification(message, 'success');
    }

    editProfile() {
        this.showUserModal(true);
    }

    changeUser() {
        if (confirm('Are you sure you want to switch to a different user? Your current data will be saved.')) {
            // Save current user's data
            if (this.currentUser && this.contributions.length > 0) {
                this.saveContributions();
            }
            
            // Clear current session
            this.currentUser = null;
            this.userProfile = null;
            this.contributions = [];
            
            // Remove current user from localStorage
            localStorage.removeItem('currentUserEmail');
            
            // Hide welcome and show modal
            document.getElementById('userWelcome').style.display = 'none';
            this.showUserModal(false);
            
            // Clear display
            this.renderContributions();
            this.updateStatistics();
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
        console.log('Current user:', this.currentUser);
        console.log('Current contributions in memory:', this.contributions.length);
        
        if (this.currentUser) {
            const userKey = this.getUserContributionsKey();
            console.log('User storage key:', userKey);
            try {
                const stored = localStorage.getItem(userKey);
                console.log('User stored data length:', stored ? stored.length : 0);
                console.log('User stored contributions count:', stored ? JSON.parse(stored).length : 0);
            } catch (e) {
                console.log('Error reading user stored data:', e);
            }
        }
        
        // Check for old global data
        try {
            const oldGlobal = localStorage.getItem('contributions');
            console.log('Old global data exists:', !!oldGlobal);
            if (oldGlobal) {
                console.log('Old global data length:', oldGlobal.length);
            }
        } catch (e) {
            console.log('Error reading old global data:', e);
        }
        
        console.log('User in localStorage:', localStorage.getItem('currentUserEmail'));
        console.log('==========================================');
    }

    exportData() {
        try {
            const exportData = {
                user: this.currentUser,
                contributions: this.contributions,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            const userName = this.currentUser ? this.currentUser.replace(/[^a-zA-Z0-9]/g, '_') : 'user';
            const fileName = `${userName}_contributions_${new Date().toISOString().split('T')[0]}.json`;
            link.download = fileName;
            link.click();
            
            this.showNotification('Data exported successfully! Share this file with your team lead for merged reports.', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Error exporting data', 'error');
        }
    }

    startTeamExport() {
        if (this.contributions.length === 0) {
            this.showNotification('Add your contributions first before doing team export!', 'warning');
            return;
        }

        if (confirm('Team Export: Select JSON files from your team members (exported using "Export Data" button). This will merge similar contributions and create a consolidated PowerPoint. Continue?')) {
            document.getElementById('teamFileInput').click();
        }
    }

    async handleTeamFiles(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        try {
            this.showNotification('Processing team member files...', 'info');
            
            // Collect all contributions from all team members
            let allContributions = [...this.contributions]; // Start with current user's contributions
            
            // Process each team member file
            for (const file of files) {
                const fileData = await this.readFileAsJSON(file);
                if (fileData && fileData.contributions) {
                    // Add team member's contributions with their name
                    const memberContributions = fileData.contributions.map(contrib => ({
                        ...contrib,
                        originalUser: fileData.user || 'Unknown User',
                        team: contrib.team || fileData.user || 'Unknown User'
                    }));
                    allContributions = allContributions.concat(memberContributions);
                }
            }

            // Add original user info to current user's contributions
            allContributions = allContributions.map(contrib => ({
                ...contrib,
                originalUser: contrib.originalUser || this.currentUser || 'Current User',
                team: contrib.team || this.currentUser || 'Current User'
            }));

            console.log('All contributions before merge:', allContributions.length);

            // Merge similar contributions
            const mergedContributions = this.mergeSimilarContributions(allContributions);
            
            console.log('Contributions after merge:', mergedContributions.length);

            // Export merged PowerPoint
            await this.exportTeamToPowerPoint(mergedContributions);
            
        } catch (error) {
            console.error('Error processing team files:', error);
            this.showNotification('Error processing team member files', 'error');
        }
        
        // Reset file input
        event.target.value = '';
    }

    readFileAsJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    console.error('Error parsing file:', file.name, error);
                    resolve(null);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    mergeSimilarContributions(contributions) {
        const merged = [];
        const processed = new Set();

        for (let i = 0; i < contributions.length; i++) {
            if (processed.has(i)) continue;

            const current = contributions[i];
            const similar = [current];
            processed.add(i);

            // Find similar contributions
            for (let j = i + 1; j < contributions.length; j++) {
                if (processed.has(j)) continue;

                const other = contributions[j];
                if (this.areSimilarContributions(current, other)) {
                    similar.push(other);
                    processed.add(j);
                }
            }

            // Merge if multiple similar contributions found
            if (similar.length > 1) {
                const mergedContrib = this.mergeContributions(similar);
                merged.push(mergedContrib);
            } else {
                merged.push(current);
            }
        }

        return merged;
    }

    areSimilarContributions(contrib1, contrib2) {
        // Check if contributions are similar based on:
        // 1. Same category
        // 2. Similar description (using simple text similarity)
        
        if (contrib1.category !== contrib2.category) {
            return false;
        }

        // Simple text similarity check
        const desc1 = contrib1.description.toLowerCase().trim();
        const desc2 = contrib2.description.toLowerCase().trim();
        
        // Exact match
        if (desc1 === desc2) {
            return true;
        }

        // Check if one description contains the other (for variations)
        if (desc1.includes(desc2) || desc2.includes(desc1)) {
            return true;
        }

        // Check for significant word overlap (simple approach)
        const words1 = desc1.split(/\s+/).filter(w => w.length > 3);
        const words2 = desc2.split(/\s+/).filter(w => w.length > 3);
        
        if (words1.length === 0 || words2.length === 0) return false;
        
        const commonWords = words1.filter(word => words2.includes(word));
        const similarity = commonWords.length / Math.min(words1.length, words2.length);
        
        return similarity >= 0.6; // 60% word overlap threshold
    }

    mergeContributions(contributions) {
        // Combine team members
        const teamMembers = [...new Set(contributions.map(c => c.originalUser || c.team).filter(Boolean))];
        const combinedTeam = teamMembers.join(', ');

        // Use the most detailed description
        const longestDescription = contributions.reduce((longest, current) => 
            current.description.length > longest.description.length ? current : longest
        );

        return {
            ...longestDescription,
            team: combinedTeam,
            originalUser: combinedTeam,
            isMerged: true,
            contributorCount: contributions.length
        };
    }

    async exportTeamToPowerPoint(contributions) {
        try {
            this.showNotification('Generating team PowerPoint presentation...', 'info');

            const pptx = new PptxGenJS();
            
            // Group contributions by category
            const groupedContributions = {};
            contributions.forEach(contribution => {
                if (!groupedContributions[contribution.category]) {
                    groupedContributions[contribution.category] = [];
                }
                groupedContributions[contribution.category].push(contribution);
            });

            // Create one slide per category with table
            Object.keys(groupedContributions).forEach(category => {
                const slide = pptx.addSlide();
                
                // Category title
                slide.addText(`${category} - Team Contributions`, {
                    x: 0.5, y: 0.5, w: 9, h: 1,
                    fontSize: 24, bold: true, color: '2c3e50'
                });

                // Add user name in top right corner
                slide.addText(`Prepared by: ${this.currentUser || 'Team Lead'}`, {
                    x: 6.5, y: 0.2, w: 3, h: 0.3,
                    fontSize: 10, color: '6c757d', align: 'right'
                });

                // Prepare table data
                const tableData = [
                    ['No.', 'Activity', 'Description', 'Team'] // Header row
                ];

                // Add contribution rows
                groupedContributions[category].forEach((contribution, index) => {
                    const teamDisplay = contribution.isMerged ? 
                        `${contribution.team} (${contribution.contributorCount} members)` : 
                        contribution.team;

                    tableData.push([
                        (index + 1).toString(),
                        contribution.category || '-',
                        contribution.description || '-',
                        teamDisplay || '-'
                    ]);
                });

                // Add table to slide
                slide.addTable(tableData, {
                    x: 0.5, y: 1.8, w: 9, h: 5,
                    fontSize: 11,
                    border: { pt: 1, color: 'e1e8ed' },
                    fill: { color: 'ffffff' },
                    color: '2c3e50',
                    colW: [0.8, 2.0, 4.2, 2.0], // Adjusted column widths for team names
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
                    colW: [0.8, 2.0, 4.2, 2.0]
                });
            });

            // Save the presentation
            const fileName = `Team_Contributions_${new Date().toISOString().split('T')[0]}.pptx`;
            await pptx.writeFile({ fileName });
            
            this.showNotification(`Team PowerPoint exported successfully! Merged ${contributions.filter(c => c.isMerged).length} duplicate contributions.`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting team PowerPoint. Please try again.', 'error');
        }
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