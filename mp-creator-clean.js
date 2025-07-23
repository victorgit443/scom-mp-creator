// MP Creator JavaScript - Clean Version
class MPCreator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.mpData = {
            basicInfo: {},
            selectedComponents: {
                discovery: null,
                monitors: [],
                rules: [],
                groups: [],
                tasks: [],
                views: []
            },
            configurations: {}
        };
        this.fragmentLibrary = {};
        
        this.loadFragmentLibrary();
        this.initializeEventListeners();
    }

    loadFragmentLibrary() {
        this.fragmentLibrary = {
            'registry-key': {
                name: 'Registry Key Discovery',
                template: 'Class.And.Discovery.Registry.KeyExists.mpx',
                fields: [
                    { id: 'uniqueId', label: 'Unique ID', type: 'text', required: true },
                    { id: 'regKeyPath', label: 'Registry Key Path', type: 'text', required: true, placeholder: 'SOFTWARE\\Microsoft\\CCM' },
                    { id: 'targetClass', label: 'Target Class', type: 'select', options: ['Windows!Microsoft.Windows.Server.OperatingSystem', 'Windows!Microsoft.Windows.Computer'] }
                ]
            },
            'service-monitor': {
                name: 'Service Monitor',
                template: 'Monitor.Service.WithAlert.mpx',
                fields: [
                    { id: 'uniqueId', label: 'Unique ID', type: 'text', required: true },
                    { id: 'serviceName', label: 'Service Name', type: 'text', required: true, placeholder: 'W3SVC' },
                    { id: 'targetClass', label: 'Target Class', type: 'text', required: true },
                    { id: 'alertPriority', label: 'Alert Priority', type: 'select', options: ['Low', 'Normal', 'High'] },
                    { id: 'alertSeverity', label: 'Alert Severity', type: 'select', options: ['Information', 'Warning', 'Error'] }
                ]
            }
        };
    }

    initializeEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.discovery-card')) {
                this.selectDiscoveryCard(e.target.closest('.discovery-card'));
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.component-card')) {
                this.handleComponentSelection(e.target);
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        }, true);
    }

    selectDiscoveryCard(card) {
        document.querySelectorAll('.discovery-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        const discoveryType = card.dataset.discovery;
        this.mpData.selectedComponents.discovery = discoveryType;
        
        const nextBtn = document.getElementById('next-discovery');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    handleComponentSelection(checkbox) {
        const componentType = checkbox.value;
        const card = checkbox.closest('.component-card');
        
        const step = document.querySelector('.form-step:not([style*="display: none"])');
        let category = 'other';
        
        if (step) {
            const stepId = step.id;
            switch (stepId) {
                case 'step-3':
                    category = 'monitors';
                    break;
                case 'step-4':
                    category = 'rules';
                    break;
                case 'step-5':
                    if (componentType.includes('group')) category = 'groups';
                    else if (componentType.includes('task')) category = 'tasks';
                    else if (componentType.includes('view')) category = 'views';
                    break;
            }
        }
        
        if (checkbox.checked) {
            if (!this.mpData.selectedComponents[category]) {
                this.mpData.selectedComponents[category] = [];
            }
            
            if (!this.mpData.selectedComponents[category].includes(componentType)) {
                this.mpData.selectedComponents[category].push(componentType);
            }
            
            card.classList.add('selected');
        } else {
            if (this.mpData.selectedComponents[category]) {
                const index = this.mpData.selectedComponents[category].indexOf(componentType);
                if (index > -1) {
                    this.mpData.selectedComponents[category].splice(index, 1);
                }
            }
            
            card.classList.remove('selected');
        }
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        const isRequired = field.hasAttribute('required');
        const value = field.value.trim();
        
        formGroup.classList.remove('error', 'success');
        
        const existingMessage = formGroup.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (isRequired && !value) {
            this.showFieldError(formGroup, 'This field is required');
            return false;
        }
        
        if (field.id === 'company-id') {
            if (value && !/^[A-Z][A-Z0-9]*$/.test(value)) {
                this.showFieldError(formGroup, 'Must start with a capital letter and contain only uppercase letters and numbers');
                return false;
            }
        }
        
        if (field.id === 'app-name') {
            if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
                this.showFieldError(formGroup, 'Only letters and numbers allowed, no spaces or special characters');
                return false;
            }
        }
        
        if (field.id && field.id.includes('-regKeyPath')) {
            if (value && !/^[A-Z]+\\[A-Za-z0-9\\_.]+$/.test(value)) {
                this.showFieldError(formGroup, 'Registry path must follow format: HIVE\\Path\\To\\Key (e.g., SOFTWARE\\Microsoft\\MyApp)');
                return false;
            }
        }
        
        if (value) {
            formGroup.classList.add('success');
        }
        
        return true;
    }

    showFieldError(formGroup, message) {
        formGroup.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
                
                if (this.currentStep === 6) {
                    this.generateConfigurationForms();
                }
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        
        if (this.currentStep === 1) {
            const requiredFields = currentStepElement.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });
            
            return isValid;
        }
        
        if (this.currentStep === 2) {
            return this.mpData.selectedComponents.discovery !== null;
        }
        
        return true;
    }

    saveCurrentStepData() {
        if (this.currentStep === 1) {
            this.mpData.basicInfo = {
                companyId: document.getElementById('company-id').value.trim().toUpperCase(),
                appName: document.getElementById('app-name').value.trim(),
                version: document.getElementById('mp-version').value.trim() || '1.0.0.0',
                description: document.getElementById('mp-description').value.trim()
            };
        }
    }

    updateStepDisplay() {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
            step.classList.toggle('completed', stepNumber < this.currentStep);
        });
        
        document.querySelectorAll('.form-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
        });

        this.scrollToCurrentStep();
    }

    scrollToCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (currentStepElement) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const progressBarHeight = document.querySelector('.progress-bar')?.offsetHeight || 0;
            const offset = headerHeight + progressBarHeight + 40;
            
            const targetPosition = currentStepElement.offsetTop - offset;
            
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        }
    }

    generateConfigurationForms() {
        const configContainer = document.getElementById('component-configs');
        if (!configContainer) return;
        
        configContainer.innerHTML = '';
        
        if (this.mpData.selectedComponents.discovery && this.mpData.selectedComponents.discovery !== 'skip') {
            const discoveryType = this.mpData.selectedComponents.discovery;
            const fragment = this.fragmentLibrary[discoveryType];
            if (fragment) {
                const panel = document.createElement('div');
                panel.className = 'config-panel';
                panel.innerHTML = `
                    <h3>
                        <div class="config-panel-icon">
                            <i class="fas fa-cog"></i>
                        </div>
                        Configure ${fragment.name}
                    </h3>
                    <div class="config-grid" id="config-${discoveryType}">
                        ${this.generateConfigFields(discoveryType, fragment.fields)}
                    </div>
                `;
                
                configContainer.appendChild(panel);
            }
        }
    }

    generateConfigFields(componentType, fields) {
        return fields.map(field => {
            const fieldId = `${componentType}-${field.id}`;
            const required = field.required ? 'required' : '';
            const value = field.value || '';
            const placeholder = field.placeholder || '';
            
            let input;
            switch (field.type) {
                case 'select':
                    const options = field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
                    input = `<select id="${fieldId}" ${required}><option value="">Select...</option>${options}</select>`;
                    break;
                case 'textarea':
                    input = `<textarea id="${fieldId}" placeholder="${placeholder}" ${required}>${value}</textarea>`;
                    break;
                case 'number':
                    input = `<input type="number" id="${fieldId}" placeholder="${placeholder}" value="${value}" ${required}>`;
                    break;
                default:
                    input = `<input type="text" id="${fieldId}" placeholder="${placeholder}" value="${value}" ${required}>`;
            }
            
            return `
                <div class="form-group">
                    <label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label>
                    ${input}
                </div>
            `;
        }).join('');
    }

    previewMP() {
        this.saveBasicInfo();
        const previewContent = this.generatePreviewStructure();
        this.showOutput(previewContent, 'Management Pack XML Preview');
    }

    saveBasicInfo() {
        const companyIdField = document.getElementById('company-id');
        const appNameField = document.getElementById('app-name');
        const versionField = document.getElementById('mp-version');
        const descriptionField = document.getElementById('mp-description');
        
        if (companyIdField && appNameField) {
            this.mpData.basicInfo = {
                companyId: companyIdField.value.trim().toUpperCase(),
                appName: appNameField.value.trim(),
                version: versionField ? versionField.value.trim() || '1.0.0.0' : '1.0.0.0',
                description: descriptionField ? descriptionField.value.trim() : ''
            };
        }
    }

    generatePreviewStructure() {
        const { companyId, appName, version, description } = this.mpData.basicInfo;
        
        if (!companyId || !appName) {
            return `<!-- Management Pack Preview -->
<!-- Please fill out Company ID and Application Name in Step 1 to see XML preview -->

Basic Information Needed:
- Company ID: ${companyId || 'Not provided'}
- Application Name: ${appName || 'Not provided'}

Selected Components:
${this.mpData.selectedComponents.discovery ? `- Discovery: ${this.mpData.selectedComponents.discovery}` : '- No discovery selected'}
${this.mpData.selectedComponents.monitors?.length > 0 ? `- Monitors: ${this.mpData.selectedComponents.monitors.join(', ')}` : ''}
${this.mpData.selectedComponents.rules?.length > 0 ? `- Rules: ${this.mpData.selectedComponents.rules.join(', ')}` : ''}

Once you complete Step 1, the preview will show the actual XML structure.`;
        }

        const hasComponents = this.mpData.selectedComponents.discovery || 
            (this.mpData.selectedComponents.monitors && this.mpData.selectedComponents.monitors.length > 0) ||
            (this.mpData.selectedComponents.rules && this.mpData.selectedComponents.rules.length > 0);

        if (!hasComponents) {
            const mpId = `${companyId}.${appName}`;
            return `<?xml version="1.0" encoding="utf-8"?>
<ManagementPack ContentReadable="true" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <Manifest>
    <Identity>
      <ID>${mpId}</ID>
      <Version>${version || '1.0.0.0'}</Version>
    </Identity>
    <Name>${mpId}</Name>
    ${description ? `<Description>${description}</Description>` : ''}
    <References>
      <Reference Alias="System">
        <ID>System.Library</ID>
        <Version>7.0.8560.0</Version>
        <PublicKeyToken>31bf3856ad364e35</PublicKeyToken>
      </Reference>
      <Reference Alias="Windows">
        <ID>Microsoft.Windows.Library</ID>
        <Version>7.0.8560.0</Version>
        <PublicKeyToken>31bf3856ad364e35</PublicKeyToken>
      </Reference>
    </References>
  </Manifest>
  
  <!-- 
  No components selected yet. 
  Please continue through the wizard to add:
  - Discovery (Step 2)
  - Monitors (Step 3) 
  - Rules (Step 4)
  - Groups, Tasks, Views (Step 5)
  -->
  
  <Monitoring>
    <!-- Components will be added here based on your selections -->
  </Monitoring>
  
</ManagementPack>`;
        }

        try {
            this.saveConfigurationData();
            return this.generateMPXML();
        } catch (error) {
            console.error('Error generating preview XML:', error);
            return `<!-- Error generating XML preview: ${error.message} -->
<!-- Please check your configuration and try again -->`;
        }
    }

    saveConfigurationData() {
        // Implementation for saving configuration data
    }

    generateMPXML() {
        const { companyId, appName, version, description } = this.mpData.basicInfo;
        const mpId = `${companyId}.${appName}`;
        
        return `<?xml version="1.0" encoding="utf-8"?>
<ManagementPack ContentReadable="true" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <Manifest>
    <Identity>
      <ID>${mpId}</ID>
      <Version>${version}</Version>
    </Identity>
    <Name>${mpId}</Name>
    ${description ? `<Description>${description}</Description>` : ''}
    <References>
      <Reference Alias="System">
        <ID>System.Library</ID>
        <Version>7.0.8560.0</Version>
        <PublicKeyToken>31bf3856ad364e35</PublicKeyToken>
      </Reference>
      <Reference Alias="Windows">
        <ID>Microsoft.Windows.Library</ID>
        <Version>7.0.8560.0</Version>
        <PublicKeyToken>31bf3856ad364e35</PublicKeyToken>
      </Reference>
    </References>
  </Manifest>
  
  <Monitoring>
    <!-- Monitoring components will be added here -->
  </Monitoring>
  
</ManagementPack>`;
    }

    showOutput(content, title) {
        const outputArea = document.getElementById('output-area');
        if (!outputArea) return;
        
        const outputHeader = outputArea.querySelector('.output-header h3');
        const outputCode = outputArea.querySelector('#mp-output code');
        
        if (outputHeader) {
            outputHeader.textContent = title;
        }
        if (outputCode) {
            outputCode.textContent = content;
        }
        if (outputArea) {
            outputArea.style.display = 'block';
            outputArea.scrollIntoView({ behavior: 'smooth' });
        }
    }

    generateMP() {
        this.saveBasicInfo();
        
        if (!this.mpData.basicInfo.companyId || !this.mpData.basicInfo.appName) {
            alert('Please fill out the Company ID and Application Name in step 1 before generating.');
            return;
        }

        try {
            this.saveConfigurationData();
            const mpXml = this.generateMPXML();
            
            if (mpXml && mpXml.trim()) {
                const filename = `${this.mpData.basicInfo.companyId}.${this.mpData.basicInfo.appName}.xml`;
                this.downloadFile(mpXml, filename, 'text/xml');
            } else {
                alert('Error generating Management Pack XML. Please check your selections.');
            }
        } catch (error) {
            console.error('Error generating MP:', error);
            alert('Error generating Management Pack: ' + error.message);
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    startOver() {
        if (confirm('Are you sure you want to start over? All your progress will be lost.')) {
            this.currentStep = 1;
            this.mpData = {
                basicInfo: {},
                selectedComponents: {
                    discovery: null,
                    monitors: [],
                    rules: [],
                    groups: [],
                    tasks: [],
                    views: []
                },
                configurations: {}
            };
            
            document.querySelectorAll('input, select, textarea').forEach(field => {
                field.value = '';
            });
            
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            document.querySelectorAll('.component-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            const outputArea = document.getElementById('output-area');
            if (outputArea) {
                outputArea.style.display = 'none';
            }
            
            this.updateStepDisplay();
        }
    }
}

// Global functions
let mpCreator;

function nextStep() {
    mpCreator.nextStep();
}

function prevStep() {
    mpCreator.prevStep();
}

function previewMP() {
    if (!mpCreator) {
        alert('MP Creator not initialized');
        return;
    }
    mpCreator.previewMP();
}

function generateMP() {
    if (!mpCreator) {
        alert('MP Creator not initialized');
        return;
    }
    mpCreator.generateMP();
}

function downloadPackage() {
    if (!mpCreator) {
        alert('MP Creator not initialized');
        return;
    }
    
    mpCreator.saveBasicInfo();
    
    if (!mpCreator.mpData.basicInfo.companyId || !mpCreator.mpData.basicInfo.appName) {
        alert('Please fill out the Company ID and Application Name in step 1 before downloading.');
        return;
    }

    try {
        mpCreator.saveConfigurationData();
        const mpXml = mpCreator.generateMPXML();
        const { companyId, appName } = mpCreator.mpData.basicInfo;
        
        if (!mpXml || !mpXml.trim()) {
            alert('Error generating Management Pack XML. Please check your selections.');
            return;
        }
        
        const deployScript = `# Management Pack Deployment Script
# Generated by SCOM MP Creator

$MPName = "${companyId}.${appName}"
$MPFile = "${companyId}.${appName}.xml"

# Import the Management Pack
try {
    Import-SCManagementPack -FullName $MPFile
    Write-Host "Management Pack imported successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error importing Management Pack: $($_.Exception.Message)" -ForegroundColor Red
}`;

        mpCreator.downloadFile(mpXml, `${companyId}.${appName}.xml`, 'text/xml');
        
        setTimeout(() => {
            mpCreator.downloadFile(deployScript, 'Deploy-MP.ps1', 'text/plain');
        }, 500);
        
    } catch (error) {
        console.error('Error downloading package:', error);
        alert('Error downloading package: ' + error.message);
    }
}

function copyToClipboard() {
    const output = document.querySelector('#mp-output code');
    if (output) {
        navigator.clipboard.writeText(output.textContent).then(() => {
            const button = event.target.closest('button');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
        });
    }
}

function startOver() {
    mpCreator.startOver();
}

// Initialize MP Creator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    mpCreator = new MPCreator();
});
