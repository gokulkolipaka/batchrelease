// Batch Release Readiness Agent - Main Application Logic

// Sample data (in production, this would come from a backend API)
const sampleData = {
  batches: [
    {
      id: 1,
      batchNumber: "BTH-2024-001",
      productName: "Acetaminophen 500mg Tablets",
      batchSize: 100000,
      manufacturingDate: "2024-01-15",
      expiryDate: "2026-01-15",
      status: "Ready for Release",
      qualifiedPerson: "Dr. Sarah Johnson",
      manufacturingSite: "Plant A - New Jersey",
      complianceScore: 98,
      testResults: [
        {"testName": "Assay", "specification": "95.0-105.0%", "result": "99.8%", "status": "Pass"},
        {"testName": "Content Uniformity", "specification": "85.0-115.0%", "result": "102.1%", "status": "Pass"},
        {"testName": "Dissolution", "specification": "Q+5% in 30 min", "result": "98.2% in 28 min", "status": "Pass"},
        {"testName": "Friability", "specification": "NMT 1.0%", "result": "0.3%", "status": "Pass"},
        {"testName": "Hardness", "specification": "4-10 kp", "result": "6.8 kp", "status": "Pass"}
      ]
    },
    {
      id: 2,
      batchNumber: "BTH-2024-002",
      productName: "Ibuprofen 200mg Capsules",
      batchSize: 75000,
      manufacturingDate: "2024-01-20",
      expiryDate: "2026-01-20",
      status: "Testing",
      qualifiedPerson: "Dr. Michael Chen",
      manufacturingSite: "Plant B - California",
      complianceScore: 95,
      testResults: [
        {"testName": "Assay", "specification": "90.0-110.0%", "result": "96.5%", "status": "Pass"},
        {"testName": "Content Uniformity", "specification": "85.0-115.0%", "result": "Pending", "status": "Pending"},
        {"testName": "Dissolution", "specification": "Q+5% in 20 min", "result": "Pending", "status": "Pending"}
      ]
    },
    {
      id: 3,
      batchNumber: "BTH-2024-003",
      productName: "Vitamin C 1000mg Tablets",
      batchSize: 120000,
      manufacturingDate: "2024-01-25",
      expiryDate: "2026-01-25",
      status: "In Process",
      qualifiedPerson: "Dr. Lisa Wong",
      manufacturingSite: "Plant A - New Jersey",
      complianceScore: 85,
      testResults: []
    }
  ],
  auditTrail: [
    {
      id: 1,
      batchId: 1,
      action: "Batch Created",
      user: "System Admin",
      timestamp: "2024-01-15 08:30:00",
      details: "Batch BTH-2024-001 created in system"
    },
    {
      id: 2,
      batchId: 1,
      action: "Test Results Added",
      user: "Lab Analyst - John Smith",
      timestamp: "2024-01-18 14:15:00",
      details: "All QC test results uploaded and verified"
    },
    {
      id: 3,
      batchId: 1,
      action: "Status Changed",
      user: "QA Manager - Jane Doe",
      timestamp: "2024-01-19 10:45:00",
      details: "Status changed from 'Testing' to 'Ready for Release'"
    }
  ],
  companySettings: {
    companyName: "Pharma Solutions Inc.",
    logoUrl: "https://via.placeholder.com/150x80/0078D4/FFFFFF?text=PHARMA+LOGO"
  }
};

// Global state
let currentUser = null;
let currentBatch = null;
let filteredBatches = [...sampleData.batches];

// Wait for DOM to be fully loaded
window.addEventListener('load', function() {
    console.log('Window loaded, initializing application...');
    initializeApp();
});

// Backup initialization for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    // Add a small delay to ensure all elements are ready
    setTimeout(initializeApp, 100);
});

function initializeApp() {
    console.log('Initializing application...');
    
    // Check if already initialized
    if (window.appInitialized) {
        console.log('App already initialized, skipping...');
        return;
    }
    
    try {
        setupEventListeners();
        updateCompanyBranding();
        renderBatchList();
        renderAuditTrail();
        setupSearch();
        showLogin();
        
        window.appInitialized = true;
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Login form - multiple approaches for reliability
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Login form found, adding event listeners');
        
        // Form submit event
        loginForm.addEventListener('submit', function(e) {
            console.log('Form submit event triggered');
            handleLogin(e);
        });
        
        // Button click event as backup
        const submitButton = loginForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                console.log('Submit button clicked');
                if (e.target.form) {
                    e.preventDefault();
                    handleLogin(e);
                }
            });
        }
        
        // Enter key on inputs
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) {
            usernameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin(e);
                }
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin(e);
                }
            });
        }
    } else {
        console.error('Login form not found!');
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const section = e.target.dataset.section;
            showSection(section);
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModals();
            }
        });
    });
    
    // Batch release buttons
    const releaseBatchBtn = document.getElementById('release-batch');
    const rejectBatchBtn = document.getElementById('reject-batch');
    
    if (releaseBatchBtn) {
        releaseBatchBtn.addEventListener('click', () => handleBatchDecision('release'));
    }
    
    if (rejectBatchBtn) {
        rejectBatchBtn.addEventListener('click', () => handleBatchDecision('reject'));
    }
    
    // Electronic signature
    const confirmSignatureBtn = document.getElementById('confirm-signature');
    if (confirmSignatureBtn) {
        confirmSignatureBtn.addEventListener('click', handleElectronicSignature);
    }
    
    // Settings
    const saveBrandingBtn = document.getElementById('save-branding');
    const companyNameInput = document.getElementById('company-name');
    const logoUploadInput = document.getElementById('logo-upload');
    
    if (saveBrandingBtn) {
        saveBrandingBtn.addEventListener('click', saveCompanyBranding);
    }
    
    if (companyNameInput) {
        companyNameInput.addEventListener('input', updateCompanyBranding);
    }
    
    if (logoUploadInput) {
        logoUploadInput.addEventListener('change', handleLogoUpload);
    }
    
    // Report generation
    document.querySelectorAll('.report-card').forEach(card => {
        const btn = card.querySelector('.btn');
        if (btn) {
            btn.addEventListener('click', function() {
                const reportType = card.dataset.report;
                generateReport(reportType);
            });
        }
    });
    
    // Search and filter
    const batchSearch = document.getElementById('batch-search');
    const statusFilter = document.getElementById('status-filter');
    
    if (batchSearch) {
        batchSearch.addEventListener('input', filterBatches);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterBatches);
    }
    
    console.log('Event listeners setup completed');
}

// Authentication functions
function handleLogin(e) {
    console.log('handleLogin called');
    
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    try {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (!usernameInput || !passwordInput) {
            console.error('Username or password input not found');
            alert('Login form elements not found. Please refresh the page.');
            return;
        }
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        console.log('Login attempt with username:', username);
        
        if (!username) {
            alert('Please enter a username');
            usernameInput.focus();
            return;
        }
        
        if (!password) {
            alert('Please enter a password');
            passwordInput.focus();
            return;
        }
        
        // Simulate authentication - any non-empty credentials work
        console.log('Authentication successful');
        
        currentUser = {
            name: 'Dr. Sarah Johnson',
            role: 'Qualified Person',
            username: username
        };
        
        showMainApp();
        addAuditEntry('User Login', currentUser.name, 'User successfully authenticated');
        
        console.log('Login completed successfully');
        
    } catch (error) {
        console.error('Error in handleLogin:', error);
        alert('An error occurred during login. Please try again.');
    }
}

function handleLogout() {
    if (currentUser) {
        addAuditEntry('User Logout', currentUser.name, 'User logged out of system');
    }
    
    currentUser = null;
    showLogin();
    
    // Reset form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.reset();
    }
}

function showLogin() {
    console.log('Showing login screen');
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    
    if (loginScreen) {
        loginScreen.classList.remove('hidden');
        console.log('Login screen shown');
    }
    if (mainApp) {
        mainApp.classList.add('hidden');
        console.log('Main app hidden');
    }
}

function showMainApp() {
    console.log('Showing main application');
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    
    if (loginScreen) {
        loginScreen.classList.add('hidden');
        console.log('Login screen hidden');
    }
    if (mainApp) {
        mainApp.classList.remove('hidden');
        console.log('Main app shown');
    }
    
    showSection('dashboard');
}

// Navigation functions
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    // Update navigation
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });
    
    // Update sections
    sections.forEach(section => {
        const isActive = section.id === `${sectionName}-section`;
        section.classList.toggle('active', isActive);
        section.classList.toggle('hidden', !isActive);
    });
}

// Batch management functions
function renderBatchList() {
    const batchList = document.getElementById('batch-list');
    if (!batchList) return;
    
    batchList.innerHTML = '';
    
    filteredBatches.forEach(batch => {
        const batchCard = createBatchCard(batch);
        batchList.appendChild(batchCard);
    });
}

function createBatchCard(batch) {
    const card = document.createElement('div');
    card.className = 'batch-card';
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => openBatchDetail(batch.id));
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openBatchDetail(batch.id);
        }
    });
    
    const statusClass = getStatusClass(batch.status);
    
    card.innerHTML = `
        <div class="batch-header">
            <div class="batch-info">
                <h3>${batch.batchNumber}</h3>
                <p>${batch.productName}</p>
            </div>
            <div class="status ${statusClass}">${batch.status}</div>
        </div>
        <div class="batch-meta">
            <div class="meta-item">
                <span class="meta-label">Manufacturing Date</span>
                <span class="meta-value">${formatDate(batch.manufacturingDate)}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Batch Size</span>
                <span class="meta-value">${batch.batchSize.toLocaleString()} units</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Qualified Person</span>
                <span class="meta-value">${batch.qualifiedPerson}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Compliance Score</span>
                <span class="meta-value">${batch.complianceScore}%</span>
            </div>
        </div>
    `;
    
    return card;
}

function openBatchDetail(batchId) {
    currentBatch = sampleData.batches.find(b => b.id === batchId);
    if (!currentBatch) return;
    
    // Populate modal
    const modalTitle = document.getElementById('modal-batch-title');
    const modalBatchNumber = document.getElementById('modal-batch-number');
    const modalProductName = document.getElementById('modal-product-name');
    const modalMfgDate = document.getElementById('modal-mfg-date');
    const modalBatchSize = document.getElementById('modal-batch-size');
    const modalQp = document.getElementById('modal-qp');
    const modalStatus = document.getElementById('modal-status');
    
    if (modalTitle) modalTitle.textContent = `${currentBatch.batchNumber} - Details`;
    if (modalBatchNumber) modalBatchNumber.textContent = currentBatch.batchNumber;
    if (modalProductName) modalProductName.textContent = currentBatch.productName;
    if (modalMfgDate) modalMfgDate.textContent = formatDate(currentBatch.manufacturingDate);
    if (modalBatchSize) modalBatchSize.textContent = `${currentBatch.batchSize.toLocaleString()} units`;
    if (modalQp) modalQp.textContent = currentBatch.qualifiedPerson;
    
    if (modalStatus) {
        modalStatus.textContent = currentBatch.status;
        modalStatus.className = `status ${getStatusClass(currentBatch.status)}`;
    }
    
    // Populate test results
    renderTestResults(currentBatch.testResults);
    
    // Show modal
    const modal = document.getElementById('batch-detail-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    // Add audit entry
    if (currentUser) {
        addAuditEntry('Batch Viewed', currentUser.name, `Batch ${currentBatch.batchNumber} details accessed`);
    }
}

function renderTestResults(testResults) {
    const container = document.getElementById('modal-test-results');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (testResults.length === 0) {
        container.innerHTML = '<p>No test results available yet.</p>';
        return;
    }
    
    // Add header
    const header = document.createElement('div');
    header.className = 'test-result-row test-result-header';
    header.innerHTML = `
        <span>Test Name</span>
        <span>Specification</span>
        <span>Result</span>
        <span>Status</span>
    `;
    container.appendChild(header);
    
    // Add test results
    testResults.forEach(test => {
        const row = document.createElement('div');
        row.className = 'test-result-row';
        
        const statusClass = test.status === 'Pass' ? 'status--success' : 
                          test.status === 'Pending' ? 'status--warning' : 'status--error';
        
        row.innerHTML = `
            <span>${test.testName}</span>
            <span>${test.specification}</span>
            <span>${test.result}</span>
            <span class="status ${statusClass}">${test.status}</span>
        `;
        container.appendChild(row);
    });
}

function handleBatchDecision(decision) {
    if (!currentBatch) return;
    
    const reason = decision === 'release' ? 'Batch Release Decision' : 'Batch Rejection Decision';
    showSignatureModal(reason, decision);
}

function showSignatureModal(reason, action) {
    const signatureReasonInput = document.getElementById('signature-reason');
    const signaturePasswordInput = document.getElementById('signature-password');
    const signatureModal = document.getElementById('signature-modal');
    
    if (signatureReasonInput) signatureReasonInput.value = reason;
    if (signaturePasswordInput) signaturePasswordInput.value = '';
    if (signatureModal) {
        signatureModal.setAttribute('data-action', action);
        signatureModal.classList.remove('hidden');
    }
}

function handleElectronicSignature() {
    const signaturePasswordInput = document.getElementById('signature-password');
    const signatureModal = document.getElementById('signature-modal');
    
    if (!signaturePasswordInput) return;
    
    const password = signaturePasswordInput.value;
    const action = signatureModal ? signatureModal.getAttribute('data-action') : '';
    
    if (!password) {
        alert('Password is required for electronic signature');
        return;
    }
    
    // Simulate password validation - any password works for demo
    const qpCommentsTextarea = document.getElementById('qp-comments');
    const comments = qpCommentsTextarea ? qpCommentsTextarea.value : '';
    const decision = action === 'release' ? 'Released' : 'Rejected';
    
    // Update batch status
    if (currentBatch) {
        currentBatch.status = decision;
        currentBatch.qpComments = comments;
        currentBatch.releaseDate = new Date().toISOString();
        
        // Add audit entries
        if (currentUser) {
            addAuditEntry('Electronic Signature', currentUser.name, `${action} decision signed electronically`);
            addAuditEntry('Batch Decision', currentUser.name, `Batch ${currentBatch.batchNumber} ${decision.toLowerCase()}`);
        }
        
        // Update UI
        renderBatchList();
        closeModals();
        
        // Show success message
        alert(`Batch ${currentBatch.batchNumber} has been ${decision.toLowerCase()} successfully!`);
    }
}

// Search and filter functions
function filterBatches() {
    const batchSearchInput = document.getElementById('batch-search');
    const statusFilterSelect = document.getElementById('status-filter');
    
    const searchTerm = batchSearchInput ? batchSearchInput.value.toLowerCase() : '';
    const statusFilter = statusFilterSelect ? statusFilterSelect.value : '';
    
    filteredBatches = sampleData.batches.filter(batch => {
        const matchesSearch = !searchTerm || 
            batch.batchNumber.toLowerCase().includes(searchTerm) ||
            batch.productName.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || batch.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderBatchList();
}

function setupSearch() {
    // Initialize search functionality
    filterBatches();
}

// Audit trail functions
function renderAuditTrail() {
    const container = document.getElementById('audit-trail-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleData.auditTrail.slice(0, 10).forEach(entry => {
        const auditEntry = document.createElement('div');
        auditEntry.className = 'audit-entry';
        auditEntry.innerHTML = `
            <div class="audit-action">${entry.action}</div>
            <div class="audit-meta">By: ${entry.user} | ${entry.timestamp}</div>
            <div class="audit-details">${entry.details}</div>
        `;
        container.appendChild(auditEntry);
    });
}

function addAuditEntry(action, user, details) {
    const newEntry = {
        id: sampleData.auditTrail.length + 1,
        batchId: currentBatch ? currentBatch.id : null,
        action: action,
        user: user,
        timestamp: new Date().toLocaleString(),
        details: details
    };
    
    sampleData.auditTrail.unshift(newEntry);
    renderAuditTrail();
}

// Company branding functions
function updateCompanyBranding() {
    const companyNameInput = document.getElementById('company-name');
    const companyName = (companyNameInput ? companyNameInput.value : '') || sampleData.companySettings.companyName;
    const logoUrl = sampleData.companySettings.logoUrl;
    
    // Update all company name elements
    const loginCompanyName = document.getElementById('login-company-name');
    const headerCompanyName = document.getElementById('header-company-name');
    
    if (loginCompanyName) loginCompanyName.textContent = companyName;
    if (headerCompanyName) headerCompanyName.textContent = companyName;
    
    // Update all logo elements
    const loginLogo = document.getElementById('login-logo');
    const headerLogo = document.getElementById('header-logo');
    const logoPreview = document.getElementById('logo-preview');
    
    if (loginLogo) loginLogo.src = logoUrl;
    if (headerLogo) headerLogo.src = logoUrl;
    if (logoPreview) logoPreview.src = logoUrl;
    
    // Update page title
    document.title = `Batch Release Readiness Agent - ${companyName}`;
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            sampleData.companySettings.logoUrl = e.target.result;
            updateCompanyBranding();
        };
        reader.readAsDataURL(file);
    }
}

function saveCompanyBranding() {
    const companyNameInput = document.getElementById('company-name');
    const companyName = companyNameInput ? companyNameInput.value : '';
    
    if (companyName) {
        sampleData.companySettings.companyName = companyName;
        updateCompanyBranding();
        
        // Add audit entry
        if (currentUser) {
            addAuditEntry('Settings Updated', currentUser.name, 'Company branding settings modified');
        }
        
        alert('Company branding updated successfully!');
    }
}

// Report generation functions
function generateReport(reportType) {
    const reportWindow = window.open('', '_blank');
    let reportContent = '';
    
    switch (reportType) {
        case 'release-certificate':
            reportContent = generateReleaseCertificate();
            break;
        case 'batch-summary':
            reportContent = generateBatchSummary();
            break;
        case 'compliance-status':
            reportContent = generateComplianceReport();
            break;
        default:
            reportContent = generateBatchSummary();
    }
    
    if (reportWindow) {
        reportWindow.document.write(reportContent);
        reportWindow.document.close();
    }
    
    // Add audit entry
    if (currentUser) {
        addAuditEntry('Report Generated', currentUser.name, `${reportType} report generated`);
    }
}

function generateReleaseCertificate() {
    const batch = sampleData.batches.find(b => b.status === 'Released') || sampleData.batches[0];
    
    return `
        <html>
        <head>
            <title>Batch Release Certificate</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .content { margin: 20px 0; }
                .signature { margin-top: 50px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${sampleData.companySettings.companyName}</h1>
                <h2>Batch Release Certificate</h2>
                <p>21 CFR Part 11 Compliant Document</p>
            </div>
            <div class="content">
                <p><strong>Batch Number:</strong> ${batch.batchNumber}</p>
                <p><strong>Product Name:</strong> ${batch.productName}</p>
                <p><strong>Manufacturing Date:</strong> ${formatDate(batch.manufacturingDate)}</p>
                <p><strong>Batch Size:</strong> ${batch.batchSize.toLocaleString()} units</p>
                <p><strong>Manufacturing Site:</strong> ${batch.manufacturingSite}</p>
                
                <h3>Quality Test Results</h3>
                <table>
                    <tr><th>Test Name</th><th>Specification</th><th>Result</th><th>Status</th></tr>
                    ${batch.testResults.map(test => 
                        `<tr><td>${test.testName}</td><td>${test.specification}</td><td>${test.result}</td><td>${test.status}</td></tr>`
                    ).join('')}
                </table>
                
                <div class="signature">
                    <p><strong>Qualified Person:</strong> ${batch.qualifiedPerson}</p>
                    <p><strong>Release Decision:</strong> Approved for Release</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Electronic Signature:</strong> [Electronically Signed per 21 CFR Part 11]</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateBatchSummary() {
    return `
        <html>
        <head>
            <title>Batch Summary Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${sampleData.companySettings.companyName}</h1>
                <h2>Batch Summary Report</h2>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            <table>
                <tr>
                    <th>Batch Number</th>
                    <th>Product Name</th>
                    <th>Status</th>
                    <th>Manufacturing Date</th>
                    <th>Batch Size</th>
                    <th>Compliance Score</th>
                </tr>
                ${sampleData.batches.map(batch => 
                    `<tr>
                        <td>${batch.batchNumber}</td>
                        <td>${batch.productName}</td>
                        <td>${batch.status}</td>
                        <td>${formatDate(batch.manufacturingDate)}</td>
                        <td>${batch.batchSize.toLocaleString()}</td>
                        <td>${batch.complianceScore}%</td>
                    </tr>`
                ).join('')}
            </table>
        </body>
        </html>
    `;
}

function generateComplianceReport() {
    return `
        <html>
        <head>
            <title>21 CFR Part 11 Compliance Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .compliance-item { margin: 15px 0; padding: 10px; border: 1px solid #ddd; }
                .compliant { background-color: #d4edda; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${sampleData.companySettings.companyName}</h1>
                <h2>21 CFR Part 11 Compliance Status Report</h2>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="compliance-item compliant">
                <h3>✓ Electronic Records</h3>
                <p>All batch records are maintained electronically with proper controls.</p>
            </div>
            
            <div class="compliance-item compliant">
                <h3>✓ Electronic Signatures</h3>
                <p>Electronic signatures are implemented with proper authentication.</p>
            </div>
            
            <div class="compliance-item compliant">
                <h3>✓ Audit Trails</h3>
                <p>Complete audit trail is maintained for all system activities.</p>
            </div>
            
            <div class="compliance-item compliant">
                <h3>✓ System Validation</h3>
                <p>System has been validated according to FDA guidelines.</p>
            </div>
            
            <div class="compliance-item compliant">
                <h3>✓ Access Controls</h3>
                <p>Proper user authentication and authorization controls are in place.</p>
            </div>
            
            <div class="compliance-item compliant">
                <h3>✓ Data Integrity</h3>
                <p>Data integrity controls ensure ALCOA+ principles compliance.</p>
            </div>
        </body>
        </html>
    `;
}

// Utility functions
function getStatusClass(status) {
    switch (status) {
        case 'Ready for Release':
        case 'Released':
            return 'status--success';
        case 'Testing':
            return 'status--warning';
        case 'In Process':
            return 'status--info';
        case 'Rejected':
            return 'status--error';
        default:
            return 'status--info';
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    
    // Clear form data
    const qpCommentsTextarea = document.getElementById('qp-comments');
    const signaturePasswordInput = document.getElementById('signature-password');
    
    if (qpCommentsTextarea) qpCommentsTextarea.value = '';
    if (signaturePasswordInput) signaturePasswordInput.value = '';
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        closeModals();
    }
});

// Demo auto-refresh simulation
setInterval(() => {
    if (Math.random() > 0.98) { // 2% chance every interval
        const testingBatch = sampleData.batches.find(b => b.status === 'Testing');
        if (testingBatch && testingBatch.testResults.some(t => t.status === 'Pending')) {
            // Simulate test completion
            testingBatch.testResults.forEach(test => {
                if (test.status === 'Pending') {
                    test.result = '95.2%';
                    test.status = 'Pass';
                }
            });
            
            if (testingBatch.testResults.every(t => t.status === 'Pass')) {
                testingBatch.status = 'Ready for Release';
                if (currentUser) {
                    addAuditEntry('Status Changed', 'QC System', `Batch ${testingBatch.batchNumber} ready for release`);
                }
            }
            
            renderBatchList();
        }
    }
}, 15000); // Check every 15 seconds