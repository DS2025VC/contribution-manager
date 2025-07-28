// Admin Panel for Contribution Manager - Simplified v3.0 (no merge logic)
console.log('🚀 ADMIN SCRIPT LOADING v3.0 (Simplified)...');

class AdminManager {
    constructor() {
        console.log('🏗️ AdminManager constructor called');
        this.currentAdmin = this.loadAdmin();
        this.teamData = this.loadTeamData();
        this.currentSection = 'teamOverview';
        this.init();
        console.log('✅ AdminManager initialized');
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

        // Export buttons
        document.getElementById('exportTeamPPTBtn').addEventListener('click', () => {
            console.log('🔥 EXPORT TEAM PPT BUTTON CLICKED!');
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
        this.currentAdmin = adminName;
    }

    checkAdminIdentification() {
        if (!this.currentAdmin) {
            this.showAdminModal();
        } else {
            this.showAdminWelcome();
            this.loadAndDisplayData();
        }
    }

    showAdminModal() {
        document.getElementById('adminModal').style.display = 'block';
        document.getElementById('adminNameInput').focus();
    }

    hideAdminModal() {
        document.getElementById('adminModal').style.display = 'none';
    }

    showAdminWelcome() {
        const teamName = localStorage.getItem('adminTeam');
        document.getElementById('adminName').textContent = this.currentAdmin + (teamName ? ` (${teamName})` : '');
        document.getElementById('adminWelcome').style.display = 'flex';
    }

    setAdmin() {
        const adminName = document.getElementById('adminNameInput').value.trim();
        const teamName = document.getElementById('teamNameInput').value.trim();
        
        if (adminName) {
            this.saveAdmin(adminName, teamName);
            this.hideAdminModal();
            this.showAdminWelcome();
            this.loadAndDisplayData();
            this.showNotification(`Welcome, ${adminName}! Admin panel loaded successfully.`, 'success');
        }
    }

    changeAdmin() {
        if (confirm('Are you sure you want to change the admin user?')) {
            document.getElementById('adminWelcome').style.display = 'none';
            document.getElementById('adminNameInput').value = '';
            document.getElementById('teamNameInput').value = '';
            this.showAdminModal();
        }
    }

    loadTeamData() {
        const teamData = {};
        
        // Scan localStorage for all user contribution data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('contributions_') && !key.includes('admin')) {
                try {
                    const userName = key.replace('contributions_', '').replace(/_/g, ' ');
                    const contributionsData = JSON.parse(localStorage.getItem(key));
                    
                    if (Array.isArray(contributionsData) && contributionsData.length > 0) {
                        teamData[userName] = contributionsData.map(contrib => ({
                            ...contrib,
                            userName: userName,
                            team: contrib.team || userName
                        }));
                    } else if (contributionsData.length === 0) {
                        // Include users with no contributions
                        teamData[userName] = [];
                    }
                } catch (error) {
                    console.error('Error loading data for user:', key, error);
                }
            }
        }

        console.log('Loaded team data:', Object.keys(teamData).length, 'users');
        return teamData;
    }

    loadAndDisplayData() {
        this.teamData = this.loadTeamData();
        this.renderTeamOverview();
        this.renderAllContributions();
        this.populateUserFilter();
        this.renderUserManagement();
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        
        // Add active class to corresponding nav button
        const btnId = sectionName.replace('Section', 'Btn');
        document.getElementById(btnId).classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        switch(sectionName) {
            case 'teamOverviewSection':
                this.renderTeamOverview();
                break;
            case 'contributionsViewSection':
                this.renderAllContributions();
                break;
            case 'userManagementSection':
                this.renderUserManagement();
                break;
        }
    }

    renderTeamOverview() {
        const users = Object.keys(this.teamData);
        const allContributions = this.getAllContributions();
        const categories = [...new Set(allContributions.map(c => c.category))];

        // Update statistics
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalTeamContributions').textContent = allContributions.length;
        document.getElementById('categoriesUsed').textContent = categories.length;

        // Render team members
        const membersList = document.getElementById('teamMembersList');
        if (users.length === 0) {
            membersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No team members found. Users will appear here once they start using the contribution manager.</p>
                </div>
            `;
            return;
        }

        membersList.innerHTML = users.map(userName => {
            const userContributions = this.teamData[userName] || [];
            const userCategories = [...new Set(userContributions.map(c => c.category))];
            const initials = userName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2);

            return `
                <div class="member-card">
                    <div class="member-header">
                        <div class="member-avatar">${initials}</div>
                        <div class="member-info">
                            <h4>${userName}</h4>
                            <p>Team Member</p>
                        </div>
                    </div>
                    <div class="member-stats">
                        <div class="member-stat">
                            <strong>${userContributions.length}</strong>
                            <span>Contributions</span>
                        </div>
                        <div class="member-stat">
                            <strong>${userCategories.length}</strong>
                            <span>Categories</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getAllContributions() {
        console.log('getAllContributions called');
        console.log('teamData keys:', Object.keys(this.teamData));
        
        const allContributions = [];
        Object.entries(this.teamData).forEach(([userName, userContributions]) => {
            console.log(`User ${userName} has ${userContributions.length} contributions`);
            if (userContributions.length > 0) {
                console.log('Sample contribution:', userContributions[0]);
            }
            allContributions.push(...userContributions);
        });
        
        console.log('Total contributions found:', allContributions.length);
        return allContributions;
    }

    populateUserFilter() {
        const userFilter = document.getElementById('userFilter');
        const users = Object.keys(this.teamData);
        
        userFilter.innerHTML = '<option value="">All Users</option>';
        users.forEach(userName => {
            userFilter.innerHTML += `<option value="${userName}">${userName}</option>`;
        });
    }

    renderAllContributions() {
        const container = document.getElementById('allContributionsList');
        const searchTerm = document.getElementById('searchInputAdmin').value.toLowerCase();
        const userFilter = document.getElementById('userFilter').value;
        const categoryFilter = document.getElementById('categoryFilterAdmin').value;

        let allContributions = this.getAllContributions();

        // Apply filters
        const filteredContributions = allContributions.filter(contribution => {
            const matchesSearch = !searchTerm || 
                contribution.category.toLowerCase().includes(searchTerm) ||
                contribution.description.toLowerCase().includes(searchTerm) ||
                contribution.userName.toLowerCase().includes(searchTerm) ||
                (contribution.team && contribution.team.toLowerCase().includes(searchTerm));

            const matchesUser = !userFilter || contribution.userName === userFilter;
            const matchesCategory = !categoryFilter || contribution.category === categoryFilter;

            return matchesSearch && matchesUser && matchesCategory;
        });

        if (filteredContributions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No contributions match your search criteria.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredContributions.map(contribution => `
            <div class="admin-contribution-item">
                <div class="admin-contribution-header">
                    <div>
                        <div class="admin-contribution-user">
                            <i class="fas fa-user"></i>
                            ${contribution.userName}
                        </div>
                        <div class="contribution-meta" style="margin-top: 10px;">
                            <span class="category-badge category-${contribution.category}">${contribution.category}</span>
                            ${contribution.team && contribution.team !== contribution.userName ? 
                                `<div class="meta-item" style="margin-top: 5px;">
                                    <i class="fas fa-users"></i>
                                    <span>${contribution.team}</span>
                                </div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="contribution-description">${contribution.description}</div>
            </div>
        `).join('');
    }

    renderUserManagement() {
        const container = document.getElementById('usersTableContainer');
        const users = Object.keys(this.teamData);

        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No team members found.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="users-table-grid header">
                <div>User Name</div>
                <div>Contributions</div>
                <div>Categories</div>
                <div>Actions</div>
            </div>
            ${users.map(userName => {
                const userContributions = this.teamData[userName] || [];
                const userCategories = [...new Set(userContributions.map(c => c.category))];
                
                return `
                    <div class="users-table-grid">
                        <div>${userName}</div>
                        <div>${userContributions.length}</div>
                        <div>${userCategories.length}</div>
                        <div class="user-actions-cell">
                            <button class="btn btn-primary btn-small" onclick="adminManager.exportUserPPT('${userName}', true)">
                                <i class="fas fa-file-powerpoint"></i> PPT
                            </button>
                            <button class="btn btn-danger btn-small" onclick="adminManager.removeUser('${userName}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    async exportTeamPowerPoint() {
        console.log('🎯 exportTeamPowerPoint function started!');
        
        const allContributions = this.getAllContributions();
        console.log('📊 All contributions retrieved:', allContributions);
        
        if (allContributions.length === 0) {
            console.log('❌ No contributions found');
            this.showNotification('No team contributions to export!', 'error');
            return;
        }

        try {
            this.showNotification('Generating team PowerPoint presentation...', 'info');

            const pptx = new PptxGenJS();
            
            // Use all contributions as-is (no merging)
            let processedContributions = allContributions;
            
            // Group contributions by category
            const groupedContributions = {};
            processedContributions.forEach(contribution => {
                if (!groupedContributions[contribution.category]) {
                    groupedContributions[contribution.category] = [];
                }
                groupedContributions[contribution.category].push(contribution);
            });

            // Create one slide per category
            Object.keys(groupedContributions).forEach(category => {
                const slide = pptx.addSlide();
                
                // Category title
                slide.addText(`${category} - Team Contributions`, {
                    x: 0.5, y: 0.5, w: 9, h: 1,
                    fontSize: 24, bold: true, color: '2c3e50'
                });

                // Add admin name in top right corner
                slide.addText(`Prepared by: ${this.currentAdmin}`, {
                    x: 6.5, y: 0.2, w: 3, h: 0.3,
                    fontSize: 10, color: '6c757d', align: 'right'
                });

                // Prepare table data
                const tableData = [
                    ['No.', 'Activity', 'Description', 'Team Member']
                ];

                // Add contribution rows
                groupedContributions[category].forEach((contribution, index) => {
                    tableData.push([
                        (index + 1).toString(),
                        contribution.category,
                        contribution.description,
                        contribution.userName || contribution.team || 'Unknown'
                    ]);
                });

                // Add table to slide
                slide.addTable(tableData, {
                    x: 0.5, y: 1.8, w: 9, h: 5,
                    fontSize: 11,
                    border: { pt: 1, color: 'e1e8ed' },
                    fill: { color: 'ffffff' },
                    color: '2c3e50',
                    colW: [0.8, 2.0, 4.2, 2.0],
                    rowH: 0.4
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
            const teamName = localStorage.getItem('adminTeam') || 'Team';
            const fileName = `${teamName}_All_Contributions_${new Date().toISOString().split('T')[0]}.pptx`;
            await pptx.writeFile({ fileName });
            
            this.showNotification('Team PowerPoint exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting team PowerPoint. Please try again.', 'error');
        }
    }

    exportSummaryReport() {
        const allContributions = this.getAllContributions();
        const users = Object.keys(this.teamData);
        
        // Create summary data
        const summary = {
            teamName: localStorage.getItem('adminTeam') || 'Team',
            generatedBy: this.currentAdmin,
            generatedOn: new Date().toISOString(),
            totalUsers: users.length,
            totalContributions: allContributions.length,
            categoryBreakdown: {},
            userBreakdown: {}
        };

        // Category breakdown
        allContributions.forEach(contrib => {
            if (!summary.categoryBreakdown[contrib.category]) {
                summary.categoryBreakdown[contrib.category] = 0;
            }
            summary.categoryBreakdown[contrib.category]++;
        });

        // User breakdown
        users.forEach(userName => {
            const userContribs = this.teamData[userName] || [];
            summary.userBreakdown[userName] = {
                totalContributions: userContribs.length,
                categories: [...new Set(userContribs.map(c => c.category))]
            };
        });

        // Export as JSON
        const dataStr = JSON.stringify(summary, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        const fileName = `${summary.teamName}_Summary_Report_${new Date().toISOString().split('T')[0]}.json`;
        link.download = fileName;
        link.click();
        
        this.showNotification('Summary report exported successfully!', 'success');
    }

    async exportIndividualReports() {
        const users = Object.keys(this.teamData);
        
        if (users.length === 0) {
            this.showNotification('No team members to export!', 'error');
            return;
        }

        this.showNotification(`Generating individual reports for ${users.length} team members...`, 'info');

        for (const userName of users) {
            await this.exportUserPPT(userName, false);
        }

        this.showNotification(`Successfully exported individual reports for all ${users.length} team members!`, 'success');
    }

    async exportUserPPT(userName, showNotification = true) {
        const userContributions = this.teamData[userName] || [];
        
        if (userContributions.length === 0) {
            if (showNotification) {
                this.showNotification(`${userName} has no contributions to export!`, 'warning');
            }
            return;
        }

        try {
            const pptx = new PptxGenJS();
            
            // Use all contributions as-is (no merging)
            let processedContributions = userContributions;
            
            // Group by category
            const groupedContributions = {};
            processedContributions.forEach(contribution => {
                if (!groupedContributions[contribution.category]) {
                    groupedContributions[contribution.category] = [];
                }
                groupedContributions[contribution.category].push(contribution);
            });

            // Create slides
            Object.keys(groupedContributions).forEach(category => {
                const slide = pptx.addSlide();
                
                slide.addText(`${category} - ${userName}`, {
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

                groupedContributions[category].forEach((contribution, index) => {
                    tableData.push([
                        (index + 1).toString(),
                        contribution.category,
                        contribution.description,
                        contribution.team || userName
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

            const fileName = `${userName.replace(/[^a-zA-Z0-9]/g, '_')}_Contributions_${new Date().toISOString().split('T')[0]}.pptx`;
            await pptx.writeFile({ fileName });
            
            if (showNotification) {
                this.showNotification(`${userName}'s PowerPoint exported successfully!`, 'success');
            }
        } catch (error) {
            console.error('Export error:', error);
            if (showNotification) {
                this.showNotification(`Error exporting ${userName}'s PowerPoint.`, 'error');
            }
        }
    }

    addUser() {
        const userName = prompt('Enter the new team member\'s name:');
        if (userName && userName.trim()) {
            const cleanUserName = userName.trim();
            const userKey = `contributions_${cleanUserName.replace(/[^a-zA-Z0-9]/g, '_')}`;
            
            // Create empty contributions array for new user
            localStorage.setItem(userKey, JSON.stringify([]));
            
            // Reload team data and refresh display
            this.loadAndDisplayData();
            this.showNotification(`Added ${cleanUserName} to the team.`, 'success');
        }
    }

    removeUser(userName) {
        if (confirm(`Are you sure you want to remove ${userName} and all their contributions? This action cannot be undone.`)) {
            const userKey = `contributions_${userName.replace(/[^a-zA-Z0-9]/g, '_')}`;
            localStorage.removeItem(userKey);
            
            // Reload team data and refresh display
            this.loadAndDisplayData();
            this.showNotification(`Removed ${userName} from the team.`, 'success');
        }
    }

    exportAllUserData() {
        const allData = {
            exportedBy: this.currentAdmin,
            exportedOn: new Date().toISOString(),
            teamName: localStorage.getItem('adminTeam') || 'Team',
            userData: this.teamData
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        const fileName = `Team_Data_Export_${new Date().toISOString().split('T')[0]}.json`;
        link.download = fileName;
        link.click();
        
        this.showNotification('All user data exported successfully!', 'success');
    }

    handleUserDataImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.userData && typeof importData.userData === 'object') {
                    // Import each user's data
                    Object.keys(importData.userData).forEach(userName => {
                        const userKey = `contributions_${userName.replace(/[^a-zA-Z0-9]/g, '_')}`;
                        localStorage.setItem(userKey, JSON.stringify(importData.userData[userName]));
                    });

                    this.loadAndDisplayData();
                    this.showNotification(`Successfully imported data for ${Object.keys(importData.userData).length} users!`, 'success');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Error importing user data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    showNotification(message, type = 'info') {
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

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

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

// Initialize the admin manager
console.log('🔧 About to create AdminManager instance...');
const adminManager = new AdminManager();
console.log('🎉 AdminManager created successfully!', adminManager); 