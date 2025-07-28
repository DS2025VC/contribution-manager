// Admin Panel for Contribution Manager - Updated v2.1 with merge fixes
console.log('🚀 ADMIN SCRIPT LOADING v2.1...');

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

        document.getElementById('testMergeBtn').addEventListener('click', () => {
            this.testMergeLogic();
        });

        document.getElementById('testSimpleBtn').addEventListener('click', () => {
            this.testFallbackLogic();
        });

        document.getElementById('testForceBtn').addEventListener('click', () => {
            this.testForceMerge();
        });

        document.getElementById('debugSimilarityBtn').addEventListener('click', () => {
            this.debugHCSCSimilarity();
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
                            <button class="btn btn-primary btn-small" onclick="adminManager.exportUserPPT('${userName}', true, document.getElementById('includeMergedContribs').checked)">
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
            
            // Check if merging is enabled
            const mergeCheckbox = document.getElementById('includeMergedContribs');
            console.log('Merge checkbox element:', mergeCheckbox);
            const shouldMerge = mergeCheckbox ? mergeCheckbox.checked : true; // Default to true if not found
            console.log('Should merge contributions:', shouldMerge);
            console.log('All contributions before processing:', allContributions.length, allContributions);
            
            // Process contributions with merging if enabled
            let processedContributions = allContributions;
            if (shouldMerge) {
                console.log('🤖 Starting AI-powered merge process...');
                this.showNotification('🤖 AI is analyzing similar contributions...', 'info');
                processedContributions = await this.mergeSimilarContributions(allContributions);
                console.log(`🎉 AI merged ${allContributions.length} contributions into ${processedContributions.length}`);
                console.log('Processed contributions after AI merge:', processedContributions);
                this.showNotification(`🎉 AI successfully merged ${allContributions.length}→${processedContributions.length} contributions!`, 'success');
            } else {
                console.log('Merge disabled, using original contributions');
            }
            
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
                    const teamMembers = contribution.isMerged ? 
                        contribution.team : 
                        (contribution.userName || contribution.team || 'Unknown');
                    
                    tableData.push([
                        (index + 1).toString(),
                        contribution.category,
                        contribution.description,
                        teamMembers
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

        const shouldMerge = document.getElementById('includeMergedContribs').checked;

        for (const userName of users) {
            await this.exportUserPPT(userName, false, shouldMerge);
        }

        this.showNotification(`Successfully exported individual reports for all ${users.length} team members!`, 'success');
    }

    async exportUserPPT(userName, showNotification = true, shouldMerge = false) {
        const userContributions = this.teamData[userName] || [];
        
        if (userContributions.length === 0) {
            if (showNotification) {
                this.showNotification(`${userName} has no contributions to export!`, 'warning');
            }
            return;
        }

        try {
            const pptx = new PptxGenJS();
            
            // Process contributions with merging if enabled
            let processedContributions = userContributions;
            if (shouldMerge) {
                processedContributions = await this.mergeSimilarContributions(userContributions);
            }
            
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
                    const teamMembers = contribution.isMerged ? 
                        contribution.team : 
                        (contribution.team || userName);
                    
                    tableData.push([
                        (index + 1).toString(),
                        contribution.category,
                        contribution.description,
                        teamMembers
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

    // Contribution merging functions
    async mergeSimilarContributions(contributions) {
        console.log('🤖 AI-powered mergeSimilarContributions called with:', contributions.length, 'contributions');
        const merged = [];
        const processed = new Set();

        for (let i = 0; i < contributions.length; i++) {
            if (processed.has(i)) continue;

            const current = contributions[i];
            const similar = [current];
            processed.add(i);

            console.log(`Processing contribution ${i}:`, current.category, '-', current.description.substring(0, 50) + '...');

            // Find similar contributions using AI
            for (let j = i + 1; j < contributions.length; j++) {
                if (processed.has(j)) continue;

                const other = contributions[j];
                console.log(`  🤖 AI Comparing with ${j}:`, other.category, '-', other.description.substring(0, 50) + '...');
                
                const isSimilar = await this.areSimilarContributions(current, other);
                console.log(`  Result: Similar = ${isSimilar}`);
                
                if (isSimilar) {
                    similar.push(other);
                    processed.add(j);
                    console.log(`    ✅ Added to similar group! Now has ${similar.length} items`);
                }
            }

            // Merge if multiple similar contributions found
            if (similar.length > 1) {
                console.log(`🔀 Merging ${similar.length} similar contributions`);
                const mergedContrib = this.mergeContributions(similar);
                merged.push(mergedContrib);
                console.log('✅ Merged result:', mergedContrib);
            } else {
                merged.push(current);
            }
        }

        console.log('🎉 Final AI-merged result:', merged.length, 'contributions');
        return merged;
    }

    async areSimilarContributions(contrib1, contrib2) {
        // Check if contributions are similar based on:
        // 1. Same category
        // 2. AI-powered semantic similarity
        
        console.log('    🤖 AI Checking similarity between:');
        console.log('      1:', contrib1.category, '|', contrib1.description);
        console.log('      2:', contrib2.category, '|', contrib2.description);
        
        if (contrib1.category !== contrib2.category) {
            console.log('    Different categories, not similar');
            return false;
        }

        // Simple exact/substring checks first (fast)
        const desc1 = contrib1.description.toLowerCase().trim();
        const desc2 = contrib2.description.toLowerCase().trim();
        
        if (desc1 === desc2) {
            console.log('    ✅ Exact description match!');
            return true;
        }

        if (desc1.includes(desc2) || desc2.includes(desc1)) {
            console.log('    ✅ One description contains the other!');
            return true;
        }

        // Use AI semantic similarity with fallback
        try {
            const aiSimilarity = await this.calculateAISimilarity(contrib1.description, contrib2.description);
            console.log('    🤖 AI Similarity score:', aiSimilarity, '(threshold: 0.5)');
            
            const isAISimilar = aiSimilarity >= 0.5;
            if (isAISimilar) {
                console.log('    ✅ AI DETECTED SIMILAR ACTIVITIES!');
                return true;
            } else {
                console.log('    ❌ AI says not similar enough, trying fallback...');
                return this.enhancedFallbackSimilarity(desc1, desc2);
            }
            
        } catch (error) {
            console.log('    ⚠️ AI similarity failed, falling back to enhanced keyword matching:', error.message);
            return this.enhancedFallbackSimilarity(desc1, desc2);
        }
    }

    async calculateAISimilarity(text1, text2) {
        // Using free Hugging Face Inference API for semantic similarity
        const API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
        
        console.log('    🤖 Calling Hugging Face API...');
        console.log('    🤖 Text1:', text1);
        console.log('    🤖 Text2:', text2);
        
        try {
            const response = await fetch(API_URL, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: {
                        source_sentence: text1,
                        sentences: [text2]
                    }
                }),
            });

            console.log('    🤖 API Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('    🤖 API Error response:', errorText);
                throw new Error(`Hugging Face API request failed: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            console.log('    🤖 Raw API result:', result);
            
            let similarity = 0;
            if (Array.isArray(result) && result.length > 0) {
                similarity = result[0];
            } else if (typeof result === 'number') {
                similarity = result;
            } else {
                console.log('    🤖 Unexpected API response format, falling back to cosine similarity');
                return this.calculateSimpleSemanticSimilarity(text1, text2);
            }
            
            console.log('    🤖 Extracted similarity:', similarity);
            return similarity;
            
        } catch (error) {
            console.log('    🤖 Hugging Face API failed:', error.message);
            console.log('    🤖 Trying cosine similarity fallback...');
            
            // Alternative: Simple cosine similarity with basic embeddings
            return this.calculateSimpleSemanticSimilarity(text1, text2);
        }
    }

    calculateSimpleSemanticSimilarity(text1, text2) {
        // Enhanced semantic similarity using word vectors approach
        const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        
        console.log('    📊 Cosine similarity words1:', words1);
        console.log('    📊 Cosine similarity words2:', words2);
        
        // Create word frequency vectors
        const allWords = [...new Set([...words1, ...words2])];
        const vector1 = allWords.map(word => words1.filter(w => w === word).length);
        const vector2 = allWords.map(word => words2.filter(w => w === word).length);
        
        // Calculate cosine similarity
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
        
        if (magnitude1 === 0 || magnitude2 === 0) return 0;
        
        const similarity = dotProduct / (magnitude1 * magnitude2);
        console.log('    📊 Cosine similarity result:', similarity);
        
        return similarity;
    }

    enhancedFallbackSimilarity(desc1, desc2) {
        // Enhanced fallback with multiple similarity checks
        console.log('    🔄 Enhanced fallback analysis...');
        console.log('    🔄 Input desc1:', desc1);
        console.log('    🔄 Input desc2:', desc2);
        
        const words1 = desc1.split(/\s+/).filter(w => w.length > 2);
        const words2 = desc2.split(/\s+/).filter(w => w.length > 2);
        
        console.log('    🔄 Fallback words1:', words1);
        console.log('    🔄 Fallback words2:', words2);
        
        if (words1.length === 0 || words2.length === 0) return false;
        
        const commonWords = words1.filter(word => words2.includes(word));
        const keywordSimilarity = commonWords.length / Math.min(words1.length, words2.length);
        
        console.log('    🔄 Common words:', commonWords);
        console.log('    🔄 Common words count:', commonWords.length);
        console.log('    🔄 Keyword similarity:', keywordSimilarity);
        
        // PROJECT/CLIENT-SPECIFIC SIMILARITY LOGIC
        let isSimilar = false;
        let reasons = [];
        

        
        // FIRST: Extract potential client/project names (usually after "for" or company acronyms)
        const extractClients = (text) => {
            const words = text.split(/\s+/);
            const clients = [];
            
            // Look for patterns like "for HCSC", "for Optum", etc.
            for (let i = 0; i < words.length - 1; i++) {
                if (words[i].toLowerCase() === 'for' && words[i + 1].length > 2) {
                    clients.push(words[i + 1].toLowerCase());
                }
            }
            
            // Look for common company patterns (all caps, or known patterns)
            words.forEach(word => {
                const isAllCaps = word === word.toUpperCase() && word.match(/[A-Z]/);
                const isKnownCompany = ['azure', 'optum', 'microsoft', 'amazon', 'google', 'hcsc'].includes(word.toLowerCase());
                
                if (word.length >= 3 && (isAllCaps || isKnownCompany)) {
                    clients.push(word.toLowerCase());
                }
            });
            
            return [...new Set(clients)]; // Remove duplicates
        };
        
        const clients1 = extractClients(desc1);
        const clients2 = extractClients(desc2);
        const sharedClients = clients1.filter(client => clients2.includes(client));
        
        console.log('    🔍 Shared clients:', sharedClients);
        
        // Exact match check (for identical descriptions)
        const clean1 = desc1.trim().toLowerCase();
        const clean2 = desc2.trim().toLowerCase();
        
        if (clean1 === clean2) {
            console.log('    ✅ EXACT MATCH DETECTED!');
            isSimilar = true;
            reasons.push('exact match');
        }
        // SECOND: Check for same client/project
        else if (sharedClients.length > 0) {
            console.log('    ✅ SAME CLIENT/PROJECT DETECTED:', sharedClients);
            isSimilar = true;
            reasons.push(`same client: ${sharedClients.join(', ')}`);
        }
        // THIRD: Check for very high similarity (like Azure test case)
        else if (keywordSimilarity >= 0.6 && commonWords.length >= 4) {
            console.log('    ✅ VERY HIGH KEYWORD OVERLAP');
            isSimilar = true;
            reasons.push('very high overlap');
        }
        // FOURTH: Check for specific project types with shared technical terms
        else {
            // Filter out generic words for more precise matching
            const genericWords = ['rfp', 'for', 'proposal', 'project', 'including', 'technical', 'and', 'the', 'with'];
            const meaningfulCommon = commonWords.filter(word => 
                word.length > 3 && !genericWords.includes(word.toLowerCase())
            );
            
            console.log('    🔍 Meaningful common words:', meaningfulCommon);
            
            if (meaningfulCommon.length >= 2) {
                console.log('    ✅ SHARED MEANINGFUL TERMS:', meaningfulCommon);
                isSimilar = true;
                reasons.push('meaningful terms');
            }
        }
        
        console.log('    🔄 Similarity reasons:', reasons);
        console.log('    🔄 Enhanced fallback result:', isSimilar);
        return isSimilar;
    }

    fallbackKeywordSimilarity(desc1, desc2) {
        // Simple fallback to keyword matching if AI fails
        const words1 = desc1.split(/\s+/).filter(w => w.length > 3);
        const words2 = desc2.split(/\s+/).filter(w => w.length > 3);
        
        if (words1.length === 0 || words2.length === 0) return false;
        
        const commonWords = words1.filter(word => words2.includes(word));
        const similarity = commonWords.length / Math.min(words1.length, words2.length);
        
        console.log('    🔄 Keyword fallback similarity:', similarity);
        return similarity >= 0.5 && commonWords.length >= 2;
    }

    mergeContributions(contributions) {
        console.log('    mergeContributions called with:', contributions.length, 'contributions');
        
        // Combine team members from all contributors
        const teamMembers = [...new Set(contributions.map(c => c.userName || c.team).filter(Boolean))];
        const combinedTeam = teamMembers.join(', ');
        
        console.log('    Team members found:', teamMembers);
        console.log('    Combined team string:', combinedTeam);

        // Use the most detailed description
        const longestDescription = contributions.reduce((longest, current) => 
            current.description.length > longest.description.length ? current : longest
        );
        
        console.log('    Using longest description from:', longestDescription.userName || longestDescription.team);

        const result = {
            ...longestDescription,
            team: combinedTeam,
            userName: combinedTeam, // For consistency
            isMerged: true,
            contributorCount: contributions.length,
            originalContributions: contributions
        };
        
        console.log('    Merge result:', result);
        return result;
    }

    async testMergeLogic() {
        console.log('=== 🤖 TESTING AI MERGE LOGIC ===');
        this.showNotification('🧪 Testing AI merge logic...', 'info');
        
        // Create test data that matches user's real scenario
        const testContributions = [
            {
                category: 'RFP',
                description: 'RFP for HCSC',
                userName: 'User1',
                team: 'User1'
            },
            {
                category: 'RFP', 
                description: 'RFP for HCSC',
                userName: 'User2',
                team: 'User2'
            },
            {
                category: 'RFP',
                description: 'RFP for Optum',
                userName: 'User2',
                team: 'User2'
            },
            {
                category: 'PoV',
                description: 'Different project entirely',
                userName: 'User3',
                team: 'User3'
            }
        ];
        
        console.log('🧪 Test contributions (should merge HCSC only - 4→3):', testContributions);
        
        try {
            const merged = await this.mergeSimilarContributions(testContributions);
            console.log('🎉 AI Merged result:', merged);
            console.log('🔍 Detailed merged results:');
            merged.forEach((item, index) => {
                console.log(`  ${index + 1}. [${item.category}] ${item.description} | Team: ${item.team || item.userName}`);
            });
            
            const success = merged.length === 3;
            
            if (!success) {
                console.log('❌ TEST FAILED ANALYSIS:');
                console.log(`Expected: 3 items (HCSC RFPs merged, Optum separate, PoV separate)`);
                console.log(`Got: ${merged.length} items`);
                console.log('This suggests the HCSC RFPs are NOT being merged correctly');
            }
            
            this.showNotification(
                `🤖 AI Merge Test: Expected 4→3 (merge HCSC RFPs), got ${testContributions.length}→${merged.length}. ${success ? '✅ SUCCESS!' : '⚠️ NEEDS TUNING'}`, 
                success ? 'success' : 'warning'
            );
        } catch (error) {
            console.error('❌ AI merge test failed:', error);
            this.showNotification('❌ AI merge test failed: ' + error.message, 'error');
        }
    }

    testFallbackLogic() {
        console.log('=== 🔧 TESTING FALLBACK LOGIC ===');
        this.showNotification('🔧 Testing client-specific merge logic...', 'info');
        
        // Create test data that matches user's real scenario
        const test1 = "RFP for HCSC";
        const test2 = "RFP for HCSC"; 
        const test3 = "RFP for Optum";
        
        console.log('🧪 Testing client-specific similarity detection:');
        console.log('Test 1 vs 2 (same client, should merge):', test1, 'vs', test2);
        console.log('Test 1 vs 3 (different client, should NOT merge):', test1, 'vs', test3);
        
        const similar12 = this.enhancedFallbackSimilarity(test1.toLowerCase(), test2.toLowerCase());
        const similar13 = this.enhancedFallbackSimilarity(test1.toLowerCase(), test3.toLowerCase());
        
        console.log('🔧 FINAL Results:');
        console.log('✅ HCSC vs HCSC similar:', similar12, '(SHOULD BE TRUE)');
        console.log('❌ HCSC vs Optum similar:', similar13, '(SHOULD BE FALSE)');
        
        // Also test the Azure case to make sure it still works
        const azure1 = "Developed comprehensive proposal for Azure cloud migration project";
        const azure2 = "Reviewed and refined Azure cloud migration proposal";
        const azureSimilar = this.enhancedFallbackSimilarity(azure1.toLowerCase(), azure2.toLowerCase());
        console.log('✅ Azure test still works:', azureSimilar, '(SHOULD BE TRUE)');
        
        if (similar12 && !similar13 && azureSimilar) {
            this.showNotification('✅ Client-specific logic working correctly!', 'success');
        } else if (similar12 && similar13) {
            this.showNotification('⚠️ Logic merging different clients incorrectly', 'warning');
        } else if (!similar12) {
            this.showNotification('⚠️ Logic not merging same client correctly', 'warning');  
        } else {
            this.showNotification('⚠️ Logic needs adjustment', 'warning');
        }
    }

    async testForceMerge() {
        console.log('=== 🔨 TESTING FORCE MERGE ===');
        this.showNotification('🔨 Testing with identical contributions (should definitely merge)...', 'info');
        
        // Create test data with IDENTICAL descriptions that MUST merge
        const testContributions = [
            {
                category: 'RFP',
                description: 'RFP for HCSC',
                userName: 'User1',
                team: 'User1'
            },
            {
                category: 'RFP', 
                description: 'RFP for HCSC',  // IDENTICAL
                userName: 'User2',
                team: 'User2'
            },
            {
                category: 'PoV',
                description: 'Different project entirely',
                userName: 'User3',
                team: 'User3'
            }
        ];
        
        console.log('🔨 Force test contributions (identical descriptions):', testContributions);
        
        try {
            const merged = await this.mergeSimilarContributions(testContributions);
            console.log('🔨 Force merged result:', merged);
            
            const success = merged.length === 2; // 3→2 (identical RFPs merged)
            console.log(`🔨 Force test: ${success ? 'SUCCESS' : 'FAILED'} - Expected 3→2, got ${testContributions.length}→${merged.length}`);
            
            if (success) {
                this.showNotification('✅ Basic merge logic works! Issue is with similarity detection.', 'success');
            } else {
                this.showNotification('❌ Basic merge logic broken! Check merge function.', 'error');
            }
        } catch (error) {
            console.error('❌ Force merge test failed:', error);
            this.showNotification('❌ Force merge test failed: ' + error.message, 'error');
        }
    }

    async debugHCSCSimilarity() {
        console.log('=== 🔍 DEBUG HCSC SIMILARITY ===');
        this.showNotification('🔍 Debugging HCSC similarity detection...', 'info');
        
        const hcsc1 = "RFP for HCSC";
        const hcsc2 = "RFP for HCSC";
        const optum = "RFP for Optum";
        
        console.log('🔍 Testing exact strings:');
        console.log('String 1:', JSON.stringify(hcsc1));
        console.log('String 2:', JSON.stringify(hcsc2));
        console.log('String 3:', JSON.stringify(optum));
        
        console.log('🔍 Direct similarity tests:');
        
        try {
            console.log('--- Testing HCSC vs HCSC (should be true) ---');
            const similar12 = await this.areSimilarContributions(
                {category: 'RFP', description: hcsc1},
                {category: 'RFP', description: hcsc2}
            );
            console.log('Result HCSC vs HCSC:', similar12);
            
            console.log('--- Testing HCSC vs Optum (should be false) ---');
            const similar13 = await this.areSimilarContributions(
                {category: 'RFP', description: hcsc1},
                {category: 'RFP', description: optum}
            );
            console.log('Result HCSC vs Optum:', similar13);
            
            if (similar12 && !similar13) {
                this.showNotification('✅ Direct similarity test PASSED!', 'success');
                console.log('✅ Direct similarity working - issue might be in merge algorithm');
            } else {
                this.showNotification(`❌ Direct similarity test FAILED! HCSC:${similar12}, Optum:${similar13}`, 'error');
            }
            
        } catch (error) {
            console.error('❌ Debug similarity test failed:', error);
            this.showNotification('❌ Debug test failed: ' + error.message, 'error');
        }
    }
}

// Initialize the admin manager
console.log('🔧 About to create AdminManager instance...');
const adminManager = new AdminManager();
console.log('🎉 AdminManager created successfully!', adminManager); 