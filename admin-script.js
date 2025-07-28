// Admin Panel for Contribution Manager - SIMPLE VERSION 4.0 - NO MERGE LOGIC
// Cache Buster: 2024-12-19-17:00:00 - Enhanced with Email-based User Management
console.log('🚀 ADMIN SCRIPT LOADING v4.0 (Enhanced User Management)...');

class AdminManager {
    constructor() {
        console.log('🏗️ AdminManager constructor called - ENHANCED VERSION');
        this.currentAdmin = this.loadAdmin();
        this.teamData = this.loadTeamData();
        this.userProfiles = this.loadAllUserProfiles();
        this.currentSection = 'teamOverview';
        this.init();
        console.log('✅ AdminManager initialized - ENHANCED VERSION');
    }

    init() {
        this.bindEvents();
        this.checkAdminIdentification();
    }

    bindEvents() {
        // Admin identification
        document.getElementById('adminForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.setAdmin();
        });

        document.getElementById('changeAdminBtn').addEventListener('click', () => {
            this.changeAdmin();
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionName = e.target.id.replace('Btn', 'Section');
                this.showSection(sectionName);
            });
        });

        // Export buttons - SIMPLE VERSIONS ONLY
        document.getElementById('exportTeamPPTBtn').addEventListener('click', () => {
            console.log('🔥 SIMPLE EXPORT TEAM PPT - NO MERGE LOGIC');
            this.exportTeamPowerPoint();
        });

        document.getElementById('exportSummaryBtn').addEventListener('click', () => {
            this.exportSummaryReport();
        });

        document.getElementById('exportIndividualBtn').addEventListener('click', () => {
            this.exportIndividualReports();
        });

        // User management
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.addUser();
        });

        document.getElementById('exportUserDataBtn').addEventListener('click', () => {
            this.exportAllUserData();
        });

        document.getElementById('importUserDataBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        document.getElementById('importFileInput').addEventListener('change', (e) => {
            this.handleUserDataImport(e);
        });

        // Filters
        document.getElementById('userFilter').addEventListener('change', () => {
            this.renderAllContributions();
        });

        document.getElementById('categoryFilterAdmin').addEventListener('change', () => {
            this.renderAllContributions();
        });

        document.getElementById('searchInputAdmin').addEventListener('input', () => {
            this.renderAllContributions();
        });

        // Modal close
        window.addEventListener('click', (e) => {
            const adminModal = document.getElementById('adminModal');
            if (e.target === adminModal && this.currentAdmin) {
                this.hideAdminModal();
            }
        });
    }

    loadAdmin() {
        return localStorage.getItem('currentAdmin') || null;
    }

    saveAdmin(adminName, teamName = '') {
        localStorage.setItem('currentAdmin', adminName);
        if (teamName) {
            localStorage.setItem('adminTeam', teamName);
        }
    }

    setAdmin() {
        const adminName = document.getElementById('adminName').value.trim();
        const teamName = document.getElementById('teamName').value.trim() || 'Team';
        
        if (adminName) {
            this.currentAdmin = adminName;
            this.saveAdmin(adminName, teamName);
            this.hideAdminModal();
            this.showAdminWelcome();
            this.loadAndDisplayData();
        }
    }

    changeAdmin() {
        this.currentAdmin = null;
        localStorage.removeItem('currentAdmin');
        localStorage.removeItem('adminTeam');
        this.showAdminModal();
        this.hideAdminWelcome();
    }

    checkAdminIdentification() {
        if (this.currentAdmin) {
            this.showAdminWelcome();
            this.loadAndDisplayData();
        } else {
            this.showAdminModal();
        }
    }

    showAdminModal() {
        document.getElementById('adminModal').style.display = 'flex';
    }

    hideAdminModal() {
        document.getElementById('adminModal').style.display = 'none';
    }

    showAdminWelcome() {
        const teamName = localStorage.getItem('adminTeam') || 'Team';
        document.getElementById('adminWelcome').style.display = 'block';
        document.getElementById('currentAdminName').textContent = `${this.currentAdmin} (${teamName})`;
    }

    hideAdminWelcome() {
        document.getElementById('adminWelcome').style.display = 'none';
    }

    loadTeamData() {
        console.log('🔍 Loading team data with enhanced profiles...');
        const teamData = {};
        
        // Scan localStorage for all user contribution data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('contributions_')) {
                // Extract email from key (contributions_email_domain_com format)
                const emailKey = key.replace('contributions_', '').replace(/_/g, '.');
                
                // Try to reconstruct email (this is a limitation of the storage format)
                // Better to scan for profile data instead
                try {
                    const contributions = JSON.parse(localStorage.getItem(key) || '[]');
                    if (contributions.length > 0) {
                        // Get user info from first contribution
                        const userEmail = contributions[0].userEmail;
                        const userName = contributions[0].userName;
                        
                        if (userEmail && userName) {
                            contributions.forEach(contribution => {
                                contribution.userName = userName;
                                contribution.userEmail = userEmail;
                                if (!contribution.team) {
                                    contribution.team = userName;
                                }
                            });
                            teamData[userEmail] = contributions;
                            console.log(`📊 Loaded ${contributions.length} contributions for ${userName} (${userEmail})`);
                        }
                    }
                } catch (error) {
                    console.error(`Error loading data for key ${key}:`, error);
                }
            }
        }
        
        console.log('✅ Team data loaded:', Object.keys(teamData).length, 'users');
        return teamData;
    }

    loadAllUserProfiles() {
        console.log('🔍 Loading all user profiles...');
        const profiles = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('profile_')) {
                try {
                    const profileData = JSON.parse(localStorage.getItem(key));
                    if (profileData && profileData.email) {
                        profiles[profileData.email] = profileData;
                        console.log(`👤 Loaded profile for ${profileData.fullName} (${profileData.email})`);
                    }
                } catch (error) {
                    console.error(`Error loading profile for key ${key}:`, error);
                }
            }
        }
        
        console.log('✅ User profiles loaded:', Object.keys(profiles).length, 'profiles');
        return profiles;
    }

    loadAndDisplayData() {
        this.teamData = this.loadTeamData();
        this.userProfiles = this.loadAllUserProfiles();
        this.renderTeamOverview();
        this.renderAllContributions();
        this.renderUserManagement();
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(sectionName).style.display = 'block';
        
        // Add active class to corresponding button
        const btnId = sectionName.replace('Section', 'Btn');
        document.getElementById(btnId).classList.add('active');
        
        this.currentSection = sectionName.replace('Section', '');
    }

    getAllContributions() {
        console.log('🔍 Getting all contributions - SIMPLE VERSION (no merge)');
        const allContributions = [];
        
        Object.values(this.teamData).forEach(userContributions => {
            allContributions.push(...userContributions);
        });
        
        console.log('📊 Total contributions found:', allContributions.length);
        return allContributions;
    }

    renderTeamOverview() {
        const userEmails = Object.keys(this.teamData);
        const totalContributions = this.getAllContributions().length;
        
        const stats = document.getElementById('teamStats');
        stats.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${userEmails.length}</div>
                <div class="stat-label">Team Members</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalContributions}</div>
                <div class="stat-label">Total Contributions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${userEmails.length > 0 ? Math.round(totalContributions / userEmails.length) : 0}</div>
                <div class="stat-label">Avg per Member</div>
            </div>
        `;

        const membersList = document.getElementById('teamMembersList');
        if (userEmails.length === 0) {
            membersList.innerHTML = '<div class="no-data">No team members found. Add team members in the User Management section.</div>';
            return;
        }

        membersList.innerHTML = userEmails.map(userEmail => {
            const userContributions = this.teamData[userEmail] || [];
            const categories = [...new Set(userContributions.map(c => c.category))];
            const profile = this.userProfiles[userEmail];
            const displayName = profile?.fullName || userContributions[0]?.userName || userEmail;
            
            return `
                <div class="member-card">
                    <h3>${displayName}</h3>
                    <p class="member-email">${userEmail}</p>
                    ${profile?.department ? `<p class="member-dept">${profile.department}</p>` : ''}
                    <div class="member-stats">
                        <span>${userContributions.length} contributions</span>
                        <span>${categories.length} categories</span>
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-primary btn-small" onclick="adminManager.exportUserPPT('${userEmail}', true)">
                            <i class="fas fa-file-powerpoint"></i> Export PPT
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAllContributions() {
        const allContributions = this.getAllContributions();
        
        // Apply filters
        const userFilter = document.getElementById('userFilter').value;
        const categoryFilter = document.getElementById('categoryFilterAdmin').value;
        const searchTerm = document.getElementById('searchInputAdmin').value.toLowerCase();
        
        let filteredContributions = allContributions;
        
        if (userFilter && userFilter !== 'all') {
            filteredContributions = filteredContributions.filter(c => c.userName === userFilter);
        }
        
        if (categoryFilter && categoryFilter !== 'all') {
            filteredContributions = filteredContributions.filter(c => c.category === categoryFilter);
        }
        
        if (searchTerm) {
            filteredContributions = filteredContributions.filter(c => 
                c.description.toLowerCase().includes(searchTerm) ||
                c.category.toLowerCase().includes(searchTerm)
            );
        }

        // Update filter options
        this.updateFilterOptions(allContributions);

        const container = document.getElementById('allContributionsList');
        
        if (filteredContributions.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-inbox"></i>
                    <p>No contributions match your filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredContributions.map((contribution, index) => `
            <div class="contribution-item">
                <div class="contribution-header">
                    <span class="contribution-category">${contribution.category}</span>
                    <span class="contribution-user">${contribution.userName}</span>
                </div>
                <div class="contribution-description">${contribution.description}</div>
            </div>
        `).join('');
    }

    updateFilterOptions(allContributions) {
        // Update user filter
        const userFilter = document.getElementById('userFilter');
        const users = [...new Set(allContributions.map(c => c.userName))].sort();
        userFilter.innerHTML = '<option value="all">All Users</option>' + 
            users.map(user => `<option value="${user}">${user}</option>`).join('');

        // Update category filter
        const categoryFilter = document.getElementById('categoryFilterAdmin');
        const categories = [...new Set(allContributions.map(c => c.category))].sort();
        categoryFilter.innerHTML = '<option value="all">All Categories</option>' + 
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    renderUserManagement() {
        const userEmails = Object.keys(this.teamData);
        const container = document.getElementById('usersTableContainer');
        
        if (userEmails.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-users"></i>
                    <p>No team members found.</p>
                    <button class="btn btn-primary" onclick="adminManager.addUser()">
                        <i class="fas fa-plus"></i> Add First Team Member
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="users-table-grid users-table-header">
                <div><strong>Name</strong></div>
                <div><strong>Email</strong></div>
                <div><strong>Contributions</strong></div>
                <div><strong>Actions</strong></div>
            </div>
        ` + userEmails.map(userEmail => {
                const userContributions = this.teamData[userEmail] || [];
                const profile = this.userProfiles[userEmail];
                const displayName = profile?.fullName || userContributions[0]?.userName || userEmail;
                
                return `
                    <div class="users-table-grid">
                        <div>
                            <strong>${displayName}</strong>
                            ${profile?.department ? `<br><small>${profile.department}</small>` : ''}
                        </div>
                        <div>${userEmail}</div>
                        <div>${userContributions.length}</div>
                        <div class="user-actions-cell">
                            <button class="btn btn-primary btn-small" onclick="adminManager.exportUserPPT('${userEmail}', true)">
                                <i class="fas fa-file-powerpoint"></i> PPT
                            </button>
                            <button class="btn btn-danger btn-small" onclick="adminManager.removeUser('${userEmail}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
    }

    // SIMPLE EXPORT FUNCTIONS - NO MERGE LOGIC
    async exportTeamPowerPoint() {
        console.log('🎯 SIMPLE exportTeamPowerPoint - NO MERGE LOGIC');
        
        const allContributions = this.getAllContributions();
        console.log('📊 All contributions (each will be separate row):', allContributions.length);
        
        if (allContributions.length === 0) {
            this.showNotification('No team contributions to export!', 'error');
            return;
        }

        try {
            this.showNotification('Generating simple PowerPoint presentation...', 'info');
            const pptx = new PptxGenJS();
            
            // Group contributions by category (but don't merge them)
            const groupedContributions = {};
            allContributions.forEach(contribution => {
                if (!groupedContributions[contribution.category]) {
                    groupedContributions[contribution.category] = [];
                }
                groupedContributions[contribution.category].push(contribution);
            });

            // Create one slide per category
            Object.keys(groupedContributions).forEach(category => {
                const slide = pptx.addSlide();
                
                slide.addText(`${category} - Team Contributions`, {
                    x: 0.5, y: 0.5, w: 9, h: 1,
                    fontSize: 24, bold: true, color: '2c3e50'
                });

                slide.addText(`Prepared by: ${this.currentAdmin}`, {
                    x: 6.5, y: 0.2, w: 3, h: 0.3,
                    fontSize: 10, color: '6c757d', align: 'right'
                });

                const tableData = [
                    ['No.', 'Activity', 'Description', 'Team Member']
                ];

                // Add each contribution as a separate row (NO MERGING)
                groupedContributions[category].forEach((contribution, index) => {
                    tableData.push([
                        (index + 1).toString(),
                        contribution.category,
                        contribution.description,
                        contribution.userName || contribution.team || 'Unknown'
                    ]);
                });

                slide.addTable(tableData, {
                    x: 0.5, y: 1.8, w: 9, h: 5,
                    fontSize: 11,
                    border: { pt: 1, color: 'e1e8ed' },
                    fill: { color: 'ffffff' },
                    color: '2c3e50',
                    colW: [0.8, 2.0, 4.2, 2.0],
                    rowH: 0.4
                });
            });

            const teamName = localStorage.getItem('adminTeam') || 'Team';
            const fileName = `${teamName}_All_Contributions_${new Date().toISOString().split('T')[0]}.pptx`;
            await pptx.writeFile({ fileName });
            
            this.showNotification('Team PowerPoint exported successfully! Each contribution is a separate row.', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting team PowerPoint. Please try again.', 'error');
        }
    }

    async exportIndividualReports() {
        const users = Object.keys(this.teamData);
        
        if (users.length === 0) {
            this.showNotification('No team members found to export!', 'error');
            return;
        }

        this.showNotification(`Generating individual reports for ${users.length} team members...`, 'info');

        for (const userEmail of users) {
            await this.exportUserPPT(userEmail, false);
        }

        this.showNotification(`Successfully exported individual reports for all ${users.length} team members!`, 'success');
    }

    async exportUserPPT(userEmail, showNotification = true) {
        const userContributions = this.teamData[userEmail] || [];
        
        if (userContributions.length === 0) {
            if (showNotification) {
                this.showNotification(`User ${userEmail} has no contributions to export!`, 'warning');
            }
            return;
        }

        try {
            const pptx = new PptxGenJS();
            const profile = this.userProfiles[userEmail];
            const displayName = profile?.fullName || userContributions[0]?.userName || userEmail;
            
            // Group by category (but don't merge contributions)
            const groupedContributions = {};
            userContributions.forEach(contribution => {
                if (!groupedContributions[contribution.category]) {
                    groupedContributions[contribution.category] = [];
                }
                groupedContributions[contribution.category].push(contribution);
            });

            // Create slides
            Object.keys(groupedContributions).forEach(category => {
                const slide = pptx.addSlide();
                
                slide.addText(`${category} - ${displayName}`, {
                    x: 0.5, y: 0.5, w: 9, h: 1,
                    fontSize: 24, bold: true, color: '2c3e50'
                });

                slide.addText(`Prepared by: ${this.currentAdmin}`, {
                    x: 6.5, y: 0.2, w: 3, h: 0.3,
                    fontSize: 10, color: '6c757d', align: 'right'
                });

                const tableData = [
                    ['No.', 'Activity', 'Description', 'Team']
                ];

                // Add each contribution as a separate row (NO MERGING)
                groupedContributions[category].forEach((contribution, index) => {
                    tableData.push([
                        (index + 1).toString(),
                        contribution.category,
                        contribution.description,
                        contribution.team || displayName
                    ]);
                });

                slide.addTable(tableData, {
                    x: 0.5, y: 1.8, w: 9, h: 5,
                    fontSize: 11,
                    border: { pt: 1, color: 'e1e8ed' },
                    fill: { color: 'ffffff' },
                    color: '2c3e50',
                    colW: [0.8, 2.0, 4.2, 2.0],
                    rowH: 0.4
                });
            });

            const fileName = `${displayName.replace(/[^a-zA-Z0-9]/g, '_')}_Contributions_${new Date().toISOString().split('T')[0]}.pptx`;
            await pptx.writeFile({ fileName });
            
            if (showNotification) {
                this.showNotification(`${displayName}'s PowerPoint exported successfully!`, 'success');
            }
        } catch (error) {
            console.error('Export error:', error);
            if (showNotification) {
                this.showNotification(`Error exporting ${userEmail}'s PowerPoint.`, 'error');
            }
        }
    }

    exportSummaryReport() {
        const allContributions = this.getAllContributions();
        const users = Object.keys(this.teamData);
        
        // Create summary data
        const categoryStats = {};
        allContributions.forEach(contribution => {
            if (!categoryStats[contribution.category]) {
                categoryStats[contribution.category] = 0;
            }
            categoryStats[contribution.category]++;
        });

        const csvContent = [
            ['Team Summary Report'],
            ['Generated by:', this.currentAdmin],
            ['Date:', new Date().toLocaleDateString()],
            [''],
            ['Team Statistics'],
            ['Total Members:', users.length],
            ['Total Contributions:', allContributions.length],
            ['Average per Member:', users.length > 0 ? Math.round(allContributions.length / users.length) : 0],
            [''],
            ['Contributions by Category'],
            ['Category', 'Count'],
            ...Object.entries(categoryStats),
            [''],
            ['Contributions by Member'],
            ['Member', 'Contributions', 'Categories'],
            ...users.map(user => [
                user,
                this.teamData[user].length,
                [...new Set(this.teamData[user].map(c => c.category))].length
            ])
        ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Team_Summary_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('Summary report exported successfully!', 'success');
    }

    addUser() {
        // Create a more sophisticated modal for adding users by email
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content profile-modal">
                <h2><i class="fas fa-user-plus"></i> Add Team Member</h2>
                <p>Add a team member by their email address. They will need to create their profile when they first access the system.</p>
                <form id="addUserForm">
                    <div class="form-group">
                        <label for="newUserEmail">Email Address *</label>
                        <input type="email" id="newUserEmail" required placeholder="Enter team member's email address">
                        <small>This email will be used to identify them in the system</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="newUserName">Full Name (optional)</label>
                        <input type="text" id="newUserName" placeholder="Enter their full name if known">
                        <small>They can update this when they create their profile</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="newUserDepartment">Department (optional)</label>
                        <input type="text" id="newUserDepartment" placeholder="e.g., Sales, Marketing, Engineering">
                    </div>
                    
                    <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Add Team Member
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        modal.querySelector('#addUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('newUserEmail').value.trim();
            const name = document.getElementById('newUserName').value.trim();
            const department = document.getElementById('newUserDepartment').value.trim();
            
            if (!email) {
                this.showNotification('Email address is required!', 'error');
                return;
            }
            
            // Check if user already exists
            const userKey = `contributions_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
            if (localStorage.getItem(userKey)) {
                this.showNotification('A user with this email already exists!', 'warning');
                return;
            }
            
            // Create empty contributions array for new user
            localStorage.setItem(userKey, JSON.stringify([]));
            
            // If name/department provided, create a basic profile
            if (name || department) {
                const profileKey = `profile_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const basicProfile = {
                    email: email,
                    fullName: name || '',
                    department: department || '',
                    role: '',
                    location: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdByAdmin: this.currentAdmin
                };
                localStorage.setItem(profileKey, JSON.stringify(basicProfile));
            }
            
            // Remove modal and refresh data
            modal.remove();
            this.loadAndDisplayData();
            this.showNotification(`Added ${name || email} to the team.`, 'success');
        });
        
        // Focus on email input
        setTimeout(() => {
            document.getElementById('newUserEmail').focus();
        }, 100);
    }

    removeUser(userEmail) {
        const profile = this.userProfiles[userEmail];
        const displayName = profile?.fullName || userEmail;
        
        if (confirm(`Are you sure you want to remove ${displayName} and all their contributions? This action cannot be undone.`)) {
            const userKey = `contributions_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const profileKey = `profile_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
            
            localStorage.removeItem(userKey);
            localStorage.removeItem(profileKey);
            
            this.loadAndDisplayData();
            this.showNotification(`Removed ${displayName} from the team.`, 'success');
        }
    }

    exportAllUserData() {
        const allData = {};
        Object.keys(this.teamData).forEach(userEmail => {
            allData[userEmail] = this.teamData[userEmail];
        });

        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `team_data_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('Team data exported successfully!', 'success');
    }

    handleUserDataImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                Object.keys(importedData).forEach(userEmail => {
                    const userKey = `contributions_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
                    const contributions = importedData[userEmail];
                    
                    contributions.forEach(contribution => {
                        contribution.userName = userEmail; // Assuming userEmail is the user's email
                        contribution.userEmail = userEmail; // Ensure userEmail is set
                        if (!contribution.team) {
                            contribution.team = userEmail;
                        }
                    });
                    
                    localStorage.setItem(userKey, JSON.stringify(contributions));
                });

                this.loadAndDisplayData();
                this.showNotification(`Successfully imported data for ${Object.keys(importedData).length} users!`, 'success');
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Error importing file. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the admin manager
console.log('🔧 Creating ENHANCED AdminManager instance (v4.0)...');
const adminManager = new AdminManager();
console.log('🎉 ENHANCED AdminManager created successfully!', adminManager); 