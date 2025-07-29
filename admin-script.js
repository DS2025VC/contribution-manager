// Practice Activity Tracker - Managers Panel - NO MERGE LOGIC
// Cache Buster: 2024-12-19-18:30:00 - Made Full Name Mandatory for Team Members
console.log('🚀 ADMIN SCRIPT LOADING v4.0 (Enhanced Email Capture)...');

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

        // Admin modal close button
        document.getElementById('adminModalClose').addEventListener('click', () => {
            // Only allow closing if admin is already set
            if (this.currentAdmin) {
                this.hideAdminModal();
            }
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
        const adminData = localStorage.getItem('currentAdmin');
        console.log('Loading admin data from localStorage:', adminData);
        
        if (adminData) {
            try {
                const parsed = JSON.parse(adminData);
                console.log('Parsed admin data:', parsed);
                
                // Ensure the admin object has the required email field
                if (parsed && parsed.email && parsed.name) {
                    return parsed;
                } else {
                    console.warn('Admin data missing required fields (email/name):', parsed);
                    return null;
                }
            } catch (error) {
                console.error('Error parsing admin data:', error);
                return null;
            }
        }
        return null;
    }

    saveAdmin(adminEmail, adminName) {
        const adminData = {
            email: adminEmail,
            name: adminName,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('currentAdmin', JSON.stringify(adminData));
    }

    setAdmin() {
        const adminEmail = document.getElementById('adminEmail').value.trim();
        const adminName = document.getElementById('adminName').value.trim();
        
        // Validation with feedback
        if (!adminEmail) {
            this.showNotification('Manager email is required!', 'error');
            document.getElementById('adminEmail').focus();
            return;
        }
        
        if (!adminName) {
            this.showNotification('Full name is required!', 'error');
            document.getElementById('adminName').focus();
            return;
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(adminEmail)) {
            this.showNotification('Please enter a valid email address!', 'error');
            document.getElementById('adminEmail').focus();
            return;
        }
        
        console.log('Admin data captured:', { email: adminEmail, name: adminName });
        
        this.currentAdmin = { email: adminEmail, name: adminName };
        this.saveAdmin(adminEmail, adminName);
        this.hideAdminModal();
        this.showAdminWelcome();
        this.loadAndDisplayData();
        
                    this.showNotification(`Welcome ${adminName}! Managers panel loaded successfully.`, 'success');
    }

    changeAdmin() {
        this.currentAdmin = null;
        localStorage.removeItem('currentAdmin');
        this.hideAdminWelcome();
        this.showAdminModal();
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
        // Focus on email input when modal opens
        setTimeout(() => {
            document.getElementById('adminEmail').focus();
        }, 100);
    }

    hideAdminModal() {
        document.getElementById('adminModal').style.display = 'none';
    }

    showAdminWelcome() {
        document.getElementById('adminWelcome').style.display = 'block';
        document.getElementById('currentAdminName').textContent = `${this.currentAdmin.name} (${this.currentAdmin.email})`;
        
        // Show debug info to confirm email capture
        document.getElementById('adminDebugInfo').style.display = 'block';
        document.getElementById('debugAdminEmail').textContent = this.currentAdmin.email;
        
        console.log('Admin welcome displayed with email:', this.currentAdmin.email);
    }

    hideAdminWelcome() {
        document.getElementById('adminWelcome').style.display = 'none';
        document.getElementById('adminDebugInfo').style.display = 'none';
    }

    loadTeamData() {
        console.log('🔍 Loading team data grouped by manager email...');
        const teamData = {};
        
        // First, load all user profiles to get manager emails
        const allProfiles = this.loadAllUserProfiles();
        
        // Scan localStorage for all user contribution data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('contributions_')) {
                try {
                    const contributions = JSON.parse(localStorage.getItem(key) || '[]');
                    
                    if (contributions.length > 0) {
                        // Get user info from first contribution
                        const userEmail = contributions[0].userEmail;
                        const userName = contributions[0].userName;
                        
                        if (userEmail && userName) {
                            // Get manager email from user's profile or contribution
                            const userProfile = allProfiles[userEmail];
                            
                            contributions.forEach(contribution => {
                                contribution.userName = userName;
                                contribution.userEmail = userEmail;
                                if (!contribution.team) {
                                    contribution.team = userName;
                                }
                                
                                // Get manager email (priority: contribution > profile > fallback)
                                const managerEmail = contribution.managerEmail || 
                                                   userProfile?.managerEmail || 
                                                   'unknown.manager@company.com';
                                
                                // Group by manager email instead of user email
                                if (!teamData[managerEmail]) {
                                    teamData[managerEmail] = [];
                                }
                                teamData[managerEmail].push(contribution);
                            });
                            
                            const managerEmail = contributions[0].managerEmail || 
                                               userProfile?.managerEmail || 
                                               'unknown.manager@company.com';
                            
                            console.log(`📊 Loaded ${contributions.length} contributions for ${userName} under manager ${managerEmail}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error loading data for key ${key}:`, error);
                }
            }
        }
        
        console.log('✅ Team data loaded:', Object.keys(teamData).length, 'managers');
        console.log('📊 Managers found:', Object.keys(teamData));
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
        const managerEmails = Object.keys(this.teamData);
        const totalContributions = this.getAllContributions().length;
        
        // Get unique team members across all managers
        const allTeamMembers = new Set();
        Object.values(this.teamData).forEach(contributions => {
            contributions.forEach(contrib => {
                if (contrib.userEmail) {
                    allTeamMembers.add(contrib.userEmail);
                }
            });
        });
        
        const stats = document.getElementById('teamStats');
        stats.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${managerEmails.length}</div>
                <div class="stat-label">Managers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${allTeamMembers.size}</div>
                <div class="stat-label">Team Members</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalContributions}</div>
                <div class="stat-label">Total Activities</div>
            </div>
        `;

        const membersList = document.getElementById('teamMembersList');
        if (managerEmails.length === 0) {
            membersList.innerHTML = '<div class="no-data">No managers found. Team members need to set their manager email in their profiles.</div>';
            return;
        }

        membersList.innerHTML = managerEmails.map(managerEmail => {
            const managerContributions = this.teamData[managerEmail] || [];
            const teamMembers = [...new Set(managerContributions.map(c => c.userEmail))];
            const categories = [...new Set(managerContributions.map(c => c.category))];
            
            return `
                <div class="member-card manager-card">
                    <h3><i class="fas fa-user-tie"></i> Manager</h3>
                    <p class="member-email">${managerEmail}</p>
                    <div class="manager-stats">
                        <span><strong>${teamMembers.length}</strong> team members</span>
                        <span><strong>${managerContributions.length}</strong> activities</span>
                        <span><strong>${categories.length}</strong> categories</span>
                    </div>
                    <div class="team-members-list">
                        <h4>Team Members:</h4>
                        ${teamMembers.map(userEmail => {
                            const userContribs = managerContributions.filter(c => c.userEmail === userEmail);
                            const userName = userContribs[0]?.userName || userEmail;
                            return `<div class="team-member-item">
                                ${userName} (${userContribs.length} activities)
                                <button class="btn btn-small btn-secondary" onclick="adminManager.exportUserPPT('${userEmail}', true)">
                                    <i class="fas fa-file-powerpoint"></i>
                                </button>
                            </div>`;
                        }).join('')}
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-primary" onclick="adminManager.exportManagerTeamPPT('${managerEmail}')">
                            <i class="fas fa-file-powerpoint"></i> Export Manager's Team PPT
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
        const searchTerm = document.getElementById('searchInputAdmin').value.toLowerCase();
        
        let filteredContributions = allContributions;
        
        if (userFilter && userFilter !== 'all') {
            filteredContributions = filteredContributions.filter(c => c.userName === userFilter);
        }
        
        if (searchTerm) {
            filteredContributions = filteredContributions.filter(c => 
                c.description.toLowerCase().includes(searchTerm) ||
                c.category.toLowerCase().includes(searchTerm) ||
                (c.managerEmail && c.managerEmail.toLowerCase().includes(searchTerm))
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


    }

    renderUserManagement() {
        // Extract user emails from all contributions (since teamData is now keyed by manager email)
        const allUserEmails = new Set();
        
        // Add users from contributions
        Object.values(this.teamData).forEach(contributions => {
            contributions.forEach(contrib => {
                if (contrib.userEmail) {
                    allUserEmails.add(contrib.userEmail);
                }
            });
        });
        
        // Add users from profiles
        Object.keys(this.userProfiles).forEach(email => allUserEmails.add(email));
        
        const userEmails = Array.from(allUserEmails);
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
                            ${profile?.role ? `<br><small>${profile.role}</small>` : ''}
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

    // SIMPLE EXPORT FUNCTIONS - GROUPED BY MANAGER
    async exportTeamPowerPoint() {
        console.log('🎯 exportTeamPowerPoint - GROUPED BY MANAGER');
        
        const allContributions = this.getAllContributions();
        console.log('📊 All contributions (grouped by manager):', allContributions.length);
        
        if (allContributions.length === 0) {
            this.showNotification('No team contributions to export!', 'error');
            return;
        }

        try {
            this.showNotification('Generating PowerPoint presentation grouped by manager...', 'info');
            const pptx = new PptxGenJS();
            
            // Group contributions by manager email first, then by category
            const managerGroups = {};
            allContributions.forEach(contribution => {
                const managerEmail = contribution.managerEmail || 'unknown.manager@company.com';
                
                if (!managerGroups[managerEmail]) {
                    managerGroups[managerEmail] = {};
                }
                
                if (!managerGroups[managerEmail][contribution.category]) {
                    managerGroups[managerEmail][contribution.category] = [];
                }
                
                managerGroups[managerEmail][contribution.category].push(contribution);
            });

            // Create slides for each manager with pagination
            Object.keys(managerGroups).sort().forEach(managerEmail => {
                const managerCategories = managerGroups[managerEmail];
                
                // Get all contributions for this manager (flatten categories)
                const allManagerContributions = Object.values(managerCategories).flat();
                const teamMembers = [...new Set(allManagerContributions.map(c => c.userName))];
                
                 // Split large tables across multiple slides
                 // Conservative pagination to prevent overflow
                const maxSlideHeight = 4.8; // More conservative space limit
                const rowHeight = 0.4; // Slightly larger to account for content wrapping
                const headerHeight = 0.8; // Section header + spacing
                const tableHeaderHeight = 0.4; // Table header
                const sectionSpacing = 1.0; // Generous spacing between sections
                const headerRow = ['No.', 'Category', 'Details', 'Team Member'];
                
                // Separate activities into RFP/Proposal/Bid and Others
                const rfpActivities = [];
                const otherActivities = [];
                
                allManagerContributions.forEach((contribution, index) => {
                    const activityText = `${contribution.category} ${contribution.description}`.toLowerCase();
                    const isRfpActivity = activityText.includes('rfp') || 
                                        activityText.includes('proposal') || 
                                        activityText.includes('bid');
                    

                    
                    const activityRow = [
                        '', // Will be numbered later
                        contribution.category,
                        contribution.description,
                        contribution.userName || contribution.team || 'Unknown'
                    ];
                    
                    if (isRfpActivity) {
                        rfpActivities.push(activityRow);
                    } else {
                        otherActivities.push(activityRow);
                    }
                });

                                          // Number the activities within each category and preserve category info
                  const numberedRfpRows = rfpActivities.map((row, index) => [
                      (index + 1).toString(),
                      row[1], row[2], row[3], 'RFP' // Add category marker
                  ]);
                  
                  const numberedOtherRows = otherActivities.map((row, index) => [
                      (rfpActivities.length + index + 1).toString(), // Continue numbering from where RFP left off
                      row[1], row[2], row[3], 'OTHER' // Add category marker
                  ]);

                  // Use priority-based chunking (no longer need combined array)

                                 // Priority-based chunking: RFP activities first, then OTHER activities to fill space
                 const chunks = [];
                 let rfpIndex = 0;
                 let otherIndex = 0;
                 
                 while (rfpIndex < numberedRfpRows.length || otherIndex < numberedOtherRows.length) {
                     let currentChunk = [];
                     
                     // First priority: Add RFP activities
                     while (rfpIndex < numberedRfpRows.length) {
                         const testChunk = [...currentChunk, numberedRfpRows[rfpIndex]];
                         const testRfpRows = testChunk.filter(row => row[4] === 'RFP');
                         const testOtherRows = testChunk.filter(row => row[4] === 'OTHER');
                         
                         let estimatedHeight = 0;
                         
                         // Calculate RFP section space
                         if (testRfpRows.length > 0) {
                             estimatedHeight += headerHeight;
                             estimatedHeight += tableHeaderHeight;
                             estimatedHeight += testRfpRows.length * rowHeight;
                             if (testOtherRows.length > 0) {
                                 estimatedHeight += sectionSpacing;
                             }
                         }
                         
                         // Calculate OTHER section space
                         if (testOtherRows.length > 0) {
                             estimatedHeight += headerHeight;
                             estimatedHeight += tableHeaderHeight;
                             estimatedHeight += testOtherRows.length * rowHeight;
                         }
                         
                         // If adding this RFP row would exceed space, break
                         if (estimatedHeight > maxSlideHeight && currentChunk.length > 0) {
                             break;
                         }
                         
                         // Add this RFP row
                         currentChunk.push(numberedRfpRows[rfpIndex]);
                         rfpIndex++;
                     }
                     
                     // Second priority: Fill remaining space with OTHER activities
                     while (otherIndex < numberedOtherRows.length) {
                         const testChunk = [...currentChunk, numberedOtherRows[otherIndex]];
                         const testRfpRows = testChunk.filter(row => row[4] === 'RFP');
                         const testOtherRows = testChunk.filter(row => row[4] === 'OTHER');
                         
                         let estimatedHeight = 0;
                         
                         // Calculate RFP section space
                         if (testRfpRows.length > 0) {
                             estimatedHeight += headerHeight;
                             estimatedHeight += tableHeaderHeight;
                             estimatedHeight += testRfpRows.length * rowHeight;
                             estimatedHeight += sectionSpacing;
                         }
                         
                         // Calculate OTHER section space
                         if (testOtherRows.length > 0) {
                             estimatedHeight += headerHeight;
                             estimatedHeight += tableHeaderHeight;
                             estimatedHeight += testOtherRows.length * rowHeight;
                         }
                         
                         // If adding this OTHER row would exceed space, break
                         if (estimatedHeight > maxSlideHeight && currentChunk.length > 0) {
                             break;
                         }
                         
                         // Add this OTHER row
                         currentChunk.push(numberedOtherRows[otherIndex]);
                         otherIndex++;
                     }
                     
                     // Add current chunk to chunks array
                     if (currentChunk.length > 0) {
                         chunks.push(currentChunk);
                     }
                 }
                
                                                // Debug logging for specific manager
                if (managerEmail === 'digvijay.singh2@cognizant.com') {
                    const managerName = managerEmail.split('.')[0];
                    const totalActivities = numberedRfpRows.length + numberedOtherRows.length;
                    console.log(`DEBUG: Manager ${managerName} (${managerEmail}) has ${totalActivities} total activities:`);
                    console.log(`DEBUG: - Pursuits & Proposals: ${numberedRfpRows.length}`);
                    console.log(`DEBUG: - Thought Leadership & Key Initiatives: ${numberedOtherRows.length}`);
                    console.log(`DEBUG: Creating ${chunks.length} slides with PRIORITY-BASED pagination (RFP first, then OTHER)`);
                    chunks.forEach((chunk, index) => {
                        const firstRowNum = index === 0 ? 1 : chunk[0][0]; // First column is row number
                        const lastRowNum = chunk[chunk.length - 1][0]; // Last row number
                        console.log(`DEBUG: Slide ${index + 1} will have ${chunk.length} rows (from row ${firstRowNum} to ${lastRowNum})`);

                        if (index > 0) {
                            console.log(`DEBUG: Slide ${index + 1} includes overlap with previous slide`);
                        }
                    });
                }

                // Track running row numbers across slides for this manager
                let rfpRowCounter = 0;
                let otherRowCounter = 0;

                // Create slides for each chunk
                chunks.forEach((chunk, chunkIndex) => {
                    const isFirstSlide = chunkIndex === 0;
                    const titleSuffix = isFirstSlide ? '' : ` (Continued ${chunkIndex + 1})`;
                    
                    if (!isFirstSlide) {
                        const additionalSlide = pptx.addSlide();
                        
                        const managerName = managerEmail.split('.')[0];
                        additionalSlide.addText(`Practice Updates - ${managerName}${titleSuffix}`, {
                            x: 0.5, y: 0.2, w: 9, h: 0.8,
                            fontSize: 24, bold: true, color: '2c3e50'
                                                });

                        // Split chunk into RFP and Other activities using preserved category info
                        const chunkRfpActivities = [];
                        const chunkOtherActivities = [];
                        
                        chunk.forEach((row) => {
                            const categoryMarker = row[4]; // Get the category marker we added
                            const displayRow = [row[0], row[1], row[2], row[3]]; // Remove category marker for display
                            

                            
                            if (categoryMarker === 'RFP') {
                                chunkRfpActivities.push(displayRow);
                            } else {
                                chunkOtherActivities.push(displayRow);
                            }
                        });
                        


                        let yPosition = 1.0;

                        // Only add sections that have content (no empty placeholders)
                        if (chunkRfpActivities.length > 0) {
                            additionalSlide.addText('Pursuits & Proposals:', {
                                x: 0.5, y: yPosition, w: 9, h: 0.3,
                                fontSize: 14, bold: true, color: '2c3e50'
                            });
                            yPosition += 0.4;

                            const numberedRfpChunk = chunkRfpActivities.map((row, index) => [
                                (rfpRowCounter + index + 1).toString(),
                                row[1], row[2], row[3]
                            ]);
                            rfpRowCounter += chunkRfpActivities.length;
                            
                            const rfpTableData = [headerRow, ...numberedRfpChunk];
                            additionalSlide.addTable(rfpTableData, {
                                x: 0.5, y: yPosition, w: 9, h: Math.min(2.5, chunkRfpActivities.length * 0.35 + 0.4),
                                fontSize: 10,
                                border: { pt: 1, color: 'e1e8ed' },
                                fill: { color: 'ffffff' },
                                color: '2c3e50',
                                colW: [0.8, 2.0, 4.2, 2.0],
                                rowH: 0.35
                            });
                            yPosition += Math.min(2.5, chunkRfpActivities.length * 0.35 + 0.4) + 0.8; // Increased spacing between sections
                        }

                        // Only add OTHER section if there are OTHER activities
                        if (chunkOtherActivities.length > 0) {
                            additionalSlide.addText('Thought Leadership & Key Initiatives:', {
                                x: 0.5, y: yPosition, w: 9, h: 0.3,
                                fontSize: 14, bold: true, color: '2c3e50'
                            });
                            yPosition += 0.4;

                            const numberedOtherChunk = chunkOtherActivities.map((row, index) => [
                                (otherRowCounter + index + 1).toString(),
                                row[1], row[2], row[3]
                            ]);
                            otherRowCounter += chunkOtherActivities.length;
                            
                            const otherTableData = [headerRow, ...numberedOtherChunk];
                            additionalSlide.addTable(otherTableData, {
                                x: 0.5, y: yPosition, w: 9, h: Math.min(2.5, chunkOtherActivities.length * 0.35 + 0.4),
                                fontSize: 10,
                                border: { pt: 1, color: 'e1e8ed' },
                                fill: { color: 'ffffff' },
                                color: '2c3e50',
                                colW: [0.8, 2.0, 4.2, 2.0],
                                rowH: 0.35
                            });
                        }
                    } else {
                        const slide = pptx.addSlide();
                        
                        const managerName = managerEmail.split('.')[0];
                        slide.addText(`Practice Updates - ${managerName}`, {
                            x: 0.5, y: 0.2, w: 9, h: 0.8,
                            fontSize: 24, bold: true, color: '2c3e50'
                        });

                        // Split chunk into RFP and Other activities using preserved category info
                        const chunkRfpActivities = [];
                        const chunkOtherActivities = [];
                        
                        chunk.forEach((row) => {
                            const categoryMarker = row[4]; // Get the category marker we added
                            const displayRow = [row[0], row[1], row[2], row[3]]; // Remove category marker for display
                            

                            
                            if (categoryMarker === 'RFP') {
                                chunkRfpActivities.push(displayRow);
                            } else {
                                chunkOtherActivities.push(displayRow);
                            }
                        });
                        


                        let yPosition = 1.0;

                        // Only show RFP section if this chunk has RFP activities
                        if (chunkRfpActivities.length > 0) {
                            slide.addText('Pursuits & Proposals:', {
                                x: 0.5, y: yPosition, w: 9, h: 0.3,
                                fontSize: 14, bold: true, color: '2c3e50'
                            });
                            yPosition += 0.4;

                            const numberedRfpChunk = chunkRfpActivities.map((row, index) => [
                                (rfpRowCounter + index + 1).toString(),
                                row[1], row[2], row[3]
                            ]);
                            rfpRowCounter += chunkRfpActivities.length;
                            
                            const rfpTableData = [headerRow, ...numberedRfpChunk];
                            slide.addTable(rfpTableData, {
                                x: 0.5, y: yPosition, w: 9, h: Math.min(2.5, chunkRfpActivities.length * 0.35 + 0.4),
                                fontSize: 10,
                                border: { pt: 1, color: 'e1e8ed' },
                                fill: { color: 'ffffff' },
                                color: '2c3e50',
                                colW: [0.8, 2.0, 4.2, 2.0],
                                rowH: 0.35
                            });
                            yPosition += Math.min(2.5, chunkRfpActivities.length * 0.35 + 0.4) + 0.8;
                        }

                        // Only show OTHER section if this chunk has OTHER activities
                        if (chunkOtherActivities.length > 0) {
                            slide.addText('Thought Leadership & Key Initiatives:', {
                                x: 0.5, y: yPosition, w: 9, h: 0.3,
                                fontSize: 14, bold: true, color: '2c3e50'
                            });
                            yPosition += 0.4;

                            const numberedOtherChunk = chunkOtherActivities.map((row, index) => [
                                (otherRowCounter + index + 1).toString(),
                                row[1], row[2], row[3]
                            ]);
                            otherRowCounter += chunkOtherActivities.length;
                            
                            const otherTableData = [headerRow, ...numberedOtherChunk];
                            slide.addTable(otherTableData, {
                                x: 0.5, y: yPosition, w: 9, h: Math.min(2.5, chunkOtherActivities.length * 0.35 + 0.4),
                                fontSize: 10,
                                border: { pt: 1, color: 'e1e8ed' },
                                fill: { color: 'ffffff' },
                                color: '2c3e50',
                                colW: [0.8, 2.0, 4.2, 2.0],
                                rowH: 0.35
                            });
                        }
                    }
                });
            });

            const teamName = localStorage.getItem('adminTeam') || 'Team';
            const fileName = `${teamName}_All_Contributions_${new Date().toISOString().split('T')[0]}.pptx`;
            await pptx.writeFile({ fileName });
            
            this.showNotification('Team PowerPoint exported successfully! Each contribution is a separate row.', 'success');
        } catch (error) {
            console.error('Export error:', error);
            console.error('Error details:', error.message, error.stack);
            this.showNotification('Error exporting team PowerPoint. Please try again.', 'error');
        }
    }



    async exportUserPPT(userEmail, showNotification = true) {
        // Find user's contributions across all managers
        let userContributions = [];
        Object.values(this.teamData).forEach(managerContributions => {
            userContributions.push(...managerContributions.filter(c => c.userEmail === userEmail));
        });
        
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
                    x: 0.5, y: 0.2, w: 9, h: 0.8,
                    fontSize: 24, bold: true, color: '2c3e50'
                });

                const tableData = [
                    ['No.', 'Name', 'Details', 'Team', 'Manager']
                ];

                // Add each contribution as a separate row (NO MERGING)
                groupedContributions[category].forEach((contribution, index) => {
                    tableData.push([
                        (index + 1).toString(),
                        contribution.category,
                        contribution.description,
                                            contribution.team || displayName,
                    contribution.managerEmail || '-'
                ]);
            });

            slide.addTable(tableData, {
                x: 0.5, y: 1.0, w: 9, h: 5.5,
                fontSize: 10,
                    border: { pt: 1, color: 'e1e8ed' },
                    fill: { color: 'ffffff' },
                    color: '2c3e50',
                    colW: [0.8, 2.0, 4.2, 2.0],
                    rowH: 0.35
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

    async exportManagerTeamPPT(managerEmail) {
        const managerContributions = this.teamData[managerEmail] || [];
        
        if (managerContributions.length === 0) {
            this.showNotification(`No activities found for manager ${managerEmail}!`, 'warning');
            return;
        }

        try {
            this.showNotification('Generating manager team PowerPoint presentation...', 'info');

            const pptx = new PptxGenJS();
            
                                             // Split large tables across multiple slides
                  // Conservative pagination to prevent overflow
                 const maxSlideHeight = 4.8; // More conservative space limit
                 const rowHeight = 0.4; // Slightly larger to account for content wrapping
                 const headerHeight = 0.8; // Section header + spacing
                 const tableHeaderHeight = 0.4; // Table header
                 const sectionSpacing = 1.0; // Generous spacing between sections
            const headerRow = ['No.', 'Category', 'Details', 'Team Member'];
            
                             // Separate activities into RFP/Proposal/Bid and Others
                 const rfpActivities = [];
                 const otherActivities = [];
                 
                 managerContributions.forEach((contribution, index) => {
                     const activityText = `${contribution.category} ${contribution.description}`.toLowerCase();
                     const isRfpActivity = activityText.includes('rfp') || 
                                         activityText.includes('proposal') || 
                                         activityText.includes('bid');
                     
                     const activityRow = [
                         '', // Will be numbered later
                         contribution.category,
                         contribution.description,
                         contribution.userName || contribution.team || 'Unknown'
                     ];
                     
                     if (isRfpActivity) {
                         rfpActivities.push(activityRow);
                     } else {
                         otherActivities.push(activityRow);
                     }
                 });

                 // Number the activities within each category and preserve category info
                 const numberedRfpRows = rfpActivities.map((row, index) => [
                     (index + 1).toString(),
                     row[1], row[2], row[3], 'RFP' // Add category marker
                 ]);
                 
                 const numberedOtherRows = otherActivities.map((row, index) => [
                     (rfpActivities.length + index + 1).toString(), // Continue numbering from where RFP left off
                     row[1], row[2], row[3], 'OTHER' // Add category marker
                 ]);

                 // Use priority-based chunking (no longer need combined array)

                                 // Priority-based chunking: RFP activities first, then OTHER activities to fill space
                const chunks = [];
                let rfpIndex = 0;
                let otherIndex = 0;
                
                while (rfpIndex < numberedRfpRows.length || otherIndex < numberedOtherRows.length) {
                    let currentChunk = [];
                    
                    // First priority: Add RFP activities
                    while (rfpIndex < numberedRfpRows.length) {
                        const testChunk = [...currentChunk, numberedRfpRows[rfpIndex]];
                        const testRfpRows = testChunk.filter(row => row[4] === 'RFP');
                        const testOtherRows = testChunk.filter(row => row[4] === 'OTHER');
                        
                        let estimatedHeight = 0;
                        
                        // Calculate RFP section space
                        if (testRfpRows.length > 0) {
                            estimatedHeight += headerHeight; // "Pursuits & Proposals" header
                            estimatedHeight += tableHeaderHeight; // Table header
                            estimatedHeight += testRfpRows.length * rowHeight; // Data rows
                            if (testOtherRows.length > 0) {
                                estimatedHeight += sectionSpacing; // Spacing between sections
                            }
                        }
                        
                        // Calculate OTHER section space
                        if (testOtherRows.length > 0) {
                            estimatedHeight += headerHeight; // "Thought Leadership" header
                            estimatedHeight += tableHeaderHeight; // Table header
                            estimatedHeight += testOtherRows.length * rowHeight; // Data rows
                        }
                        
                        // If adding this RFP row would exceed space, break
                        if (estimatedHeight > maxSlideHeight && currentChunk.length > 0) {
                            if (chunks.length === 1 && managerEmail === 'digvijay.singh2@cognizant.com') {
                                console.log(`DEBUG PRIORITY: Slide ${chunks.length + 1} - RFP limit reached at ${testRfpRows.length - 1} RFP rows`);
                            }
                            break;
                        }
                        
                        // Add this RFP row
                        currentChunk.push(numberedRfpRows[rfpIndex]);
                        rfpIndex++;
                    }
                    
                    // Second priority: Fill remaining space with OTHER activities
                    while (otherIndex < numberedOtherRows.length) {
                        const testChunk = [...currentChunk, numberedOtherRows[otherIndex]];
                        const testRfpRows = testChunk.filter(row => row[4] === 'RFP');
                        const testOtherRows = testChunk.filter(row => row[4] === 'OTHER');
                        
                        let estimatedHeight = 0;
                        
                        // Calculate RFP section space
                        if (testRfpRows.length > 0) {
                            estimatedHeight += headerHeight;
                            estimatedHeight += tableHeaderHeight;
                            estimatedHeight += testRfpRows.length * rowHeight;
                            estimatedHeight += sectionSpacing; // Space between sections
                        }
                        
                        // Calculate OTHER section space
                        if (testOtherRows.length > 0) {
                            estimatedHeight += headerHeight;
                            estimatedHeight += tableHeaderHeight;
                            estimatedHeight += testOtherRows.length * rowHeight;
                        }
                        
                        // If adding this OTHER row would exceed space, break
                        if (estimatedHeight > maxSlideHeight && currentChunk.length > 0) {
                            if (chunks.length === 1 && managerEmail === 'digvijay.singh2@cognizant.com') {
                                console.log(`DEBUG PRIORITY: Slide ${chunks.length + 1} - OTHER limit reached. Final: ${testRfpRows.length} RFP + ${testOtherRows.length - 1} OTHER`);
                            }
                            break;
                        }
                        
                        // Add this OTHER row
                        currentChunk.push(numberedOtherRows[otherIndex]);
                        otherIndex++;
                    }
                    
                    // Add current chunk to chunks array
                    if (currentChunk.length > 0) {
                        chunks.push(currentChunk);
                        
                        if (chunks.length === 1 && managerEmail === 'digvijay.singh2@cognizant.com') {
                            const rfpCount = currentChunk.filter(row => row[4] === 'RFP').length;
                            const otherCount = currentChunk.filter(row => row[4] === 'OTHER').length;
                            console.log(`DEBUG PRIORITY: Slide 1 final - ${rfpCount} RFP + ${otherCount} OTHER = ${currentChunk.length} total rows`);
                        }
                    }
                }

            // Create slides for each chunk
            chunks.forEach((chunk, chunkIndex) => {
                const slide = pptx.addSlide();
                const isFirstSlide = chunkIndex === 0;
                const titleSuffix = isFirstSlide ? '' : ` (Continued ${chunkIndex + 1})`;
                
                const managerName = managerEmail.split('.')[0];
                slide.addText(`Practice Updates - ${managerName}${titleSuffix}`, {
                    x: 0.5, y: 0.2, w: 9, h: 0.8,
                    fontSize: 24, bold: true, color: '2c3e50'
                });

                 // Split chunk into RFP and Other activities using preserved category info
                 const chunkRfpActivities = [];
                 const chunkOtherActivities = [];
                 
                 chunk.forEach((row) => {
                     const categoryMarker = row[4]; // Get the category marker we added
                     const displayRow = [row[0], row[1], row[2], row[3]]; // Remove category marker for display
                     
                     if (categoryMarker === 'RFP') {
                         chunkRfpActivities.push(displayRow);
                     } else {
                         chunkOtherActivities.push(displayRow);
                     }
                                         });
                        
                        let yPosition = 1.0;

                 // Add RFP/Proposal/Bid table if any exist
                 if (chunkRfpActivities.length > 0) {
                     slide.addText('Pursuits & Proposals:', {
                         x: 0.5, y: yPosition, w: 9, h: 0.3,
                         fontSize: 14, bold: true, color: '2c3e50'
                     });
                     yPosition += 0.4;

                     const numberedRfpChunk = chunkRfpActivities.map((row, index) => [
                         (index + 1).toString(),
                         row[1], row[2], row[3]
                     ]);
                     
                     const rfpTableData = [headerRow, ...numberedRfpChunk];
                     slide.addTable(rfpTableData, {
                         x: 0.5, y: yPosition, w: 9, h: Math.min(2.5, chunkRfpActivities.length * 0.35 + 0.4),
                         fontSize: 10,
                         border: { pt: 1, color: 'e1e8ed' },
                         fill: { color: 'ffffff' },
                         color: '2c3e50',
                         colW: [0.8, 2.0, 4.2, 2.0],
                         rowH: 0.35
                     });
                     yPosition += Math.min(2.5, chunkRfpActivities.length * 0.35 + 0.4) + 0.3;
                 }

                 // Add Other Activities table if any exist
                 if (chunkOtherActivities.length > 0) {
                     slide.addText('Thought Leadership & Key Initiatives:', {
                         x: 0.5, y: yPosition, w: 9, h: 0.3,
                         fontSize: 14, bold: true, color: '2c3e50'
                     });
                     yPosition += 0.4;

                     const numberedOtherChunk = chunkOtherActivities.map((row, index) => [
                         (index + 1).toString(),
                         row[1], row[2], row[3]
                     ]);
                     
                     const otherTableData = [headerRow, ...numberedOtherChunk];
                     slide.addTable(otherTableData, {
                         x: 0.5, y: yPosition, w: 9, h: Math.min(2.5, chunkOtherActivities.length * 0.35 + 0.4),
                         fontSize: 10,
                         border: { pt: 1, color: 'e1e8ed' },
                         fill: { color: 'ffffff' },
                         color: '2c3e50',
                         colW: [0.8, 2.0, 4.2, 2.0],
                         rowH: 0.35
                     });
                 }
            });

            const fileName = `Manager_${managerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_Team_Activities_${new Date().toISOString().split('T')[0]}.pptx`;
            await pptx.writeFile({ fileName });
            
            this.showNotification(`Manager's team PowerPoint exported successfully!`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            console.error('Error details:', error.message, error.stack);
            this.showNotification('Error exporting manager team PowerPoint.', 'error');
        }
    }

    addUser() {
        // Create a more sophisticated modal for adding users by email
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content profile-modal">
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                <h2><i class="fas fa-user-plus"></i> Add Team Member</h2>
                <p>Add a team member by their email address. They will need to create their profile when they first access the system.</p>
                <form id="addUserForm">
                    <div class="form-group">
                        <label for="newUserEmail">Email Address *</label>
                        <input type="email" id="newUserEmail" required placeholder="Enter team member's email address">
                        <small>This email will be used to identify them in the system</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="newUserName">Full Name *</label>
                        <input type="text" id="newUserName" required placeholder="Enter their full name">
                        <small>Full name is required for team member identification</small>
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
            
            if (!email) {
                this.showNotification('Email address is required!', 'error');
                document.getElementById('newUserEmail').focus();
                return;
            }
            
            if (!name) {
                this.showNotification('Full name is required!', 'error');
                document.getElementById('newUserName').focus();
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
            
            // Create a basic profile (name is now required)
            const profileKey = `profile_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const basicProfile = {
                email: email,
                fullName: name,
                role: '',
                location: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdByAdmin: this.currentAdmin.name
            };
            localStorage.setItem(profileKey, JSON.stringify(basicProfile));
            
            // Remove modal and refresh data
            modal.remove();
            this.loadAndDisplayData();
            
            // Show invitation modal
            this.showInvitationModal(email, name);
        });
        
        // Focus on email input
        setTimeout(() => {
            document.getElementById('newUserEmail').focus();
        }, 100);
    }

    showInvitationModal(email, name) {
        const appUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
        const displayName = name || email;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content profile-modal" style="max-width: 600px;">
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                <h2><i class="fas fa-envelope"></i> Team Member Added Successfully</h2>
                <p><strong>${displayName}</strong> has been added to your team. Please share the following information with them:</p>
                
                <div class="invitation-info">
                    <div class="info-section">
                        <h3><i class="fas fa-link"></i> Application URL</h3>
                        <div class="url-box">
                            <input type="text" id="appUrl" value="${appUrl}" readonly onclick="this.select()">
                            <button class="btn btn-primary btn-small" onclick="navigator.clipboard.writeText('${appUrl}'); this.textContent='Copied!'; setTimeout(() => this.innerHTML='<i class=\\'fas fa-copy\\'></i>', 2000)">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3><i class="fas fa-user"></i> Login Instructions</h3>
                        <div class="instructions">
                            <p>Ask <strong>${displayName}</strong> to:</p>
                            <ol>
                                <li>Visit the application URL above</li>
                                <li>Enter their email: <strong>${email}</strong></li>
                                <li>Complete their profile setup</li>
                                <li>Start adding their contributions</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3><i class="fas fa-envelope"></i> Email Template (Copy & Send)</h3>
                        <textarea id="emailTemplate" readonly onclick="this.select()" rows="8">Subject: Invitation to Contribution Manager

Hi ${displayName},

You've been added to our team's Contribution Manager system. Please follow these steps to get started:

1. Visit: ${appUrl}
2. Enter your email: ${email}
3. Complete your profile setup
4. Start tracking your contributions

If you have any questions, feel free to reach out!

Best regards,
${this.currentAdmin.name}
${this.currentAdmin.email}</textarea>
                        <button class="btn btn-primary btn-small" onclick="navigator.clipboard.writeText(document.getElementById('emailTemplate').value); this.textContent='Copied!'; setTimeout(() => this.innerHTML='<i class=\\'fas fa-copy\\'></i> Copy Email', 2000)">
                            <i class="fas fa-copy"></i> Copy Email
                        </button>
                    </div>
                </div>
                
                <div class="form-actions" style="justify-content: center; margin-top: 20px;">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-check"></i> Done
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        this.showNotification(`${displayName} added successfully! Share the invitation details with them.`, 'success');
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