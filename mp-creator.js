// MP Creator JavaScript
class MPCreator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6; // Updated to 6 steps
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

    // Load fragment templates (simulated - in production would load from server)
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
            'registry-value': {
                name: 'Registry Value Discovery',
                template: 'Class.And.Discovery.Registry.ValueExists.mpx',
                fields: [
                    { id: 'uniqueId', label: 'Unique ID', type: 'text', required: true },
                    { id: 'regKeyPath', label: 'Registry Key Path', type: 'text', required: true },
                    { id: 'regValueName', label: 'Value Name', type: 'text', required: true },
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
            },
            'performance-monitor': {
                name: 'Performance Monitor',
                template: 'Monitor.Performance.ConsecSamples.TwoState.mpx',
                fields: [
                    { id: 'uniqueId', label: 'Unique ID', type: 'text', required: true },
                    { id: 'objectName', label: 'Performance Object', type: 'text', required: true, placeholder: 'Processor' },
                    { id: 'counterName', label: 'Counter Name', type: 'text', required: true, placeholder: '% Processor Time' },
                    { id: 'instanceName', label: 'Instance Name', type: 'text', placeholder: '_Total' },
                    { id: 'threshold', label: 'Threshold', type: 'number', required: true },
                    { id: 'operator', label: 'Operator', type: 'select', options: ['Greater', 'Less', 'Equal', 'NotEqual'] },
                    { id: 'numSamples', label: 'Number of Samples', type: 'number', value: '3' }
                ]
            },
            'performance-collection': {
                name: 'Performance Collection Rule',
                template: 'Rule.Performance.Collection.Perfmon.mpx',
                fields: [
                    { id: 'uniqueId', label: 'Unique ID', type: 'text', required: true },
                    { id: 'objectName', label: 'Performance Object', type: 'text', required: true },
                    { id: 'counterName', label: 'Counter Name', type: 'text', required: true },
                    { id: 'instanceName', label: 'Instance Name', type: 'text', placeholder: '_Total' },
                    { id: 'frequencySeconds', label: 'Collection Frequency (seconds)', type: 'number', value: '300' },
                    { id: 'targetClass', label: 'Target Class', type: 'text', required: true }
                ]
            },
            'event-alert': {
                name: 'Event Log Alert Rule',
                template: 'Rule.AlertGenerating.EventLog.EventIdEquals.mpx',
                fields: [
                    { id: 'uniqueId', label: 'Unique ID', type: 'text', required: true },
                    { id: 'eventLog', label: 'Event Log', type: 'select', options: ['Application', 'System', 'Security'] },
                    { id: 'eventId', label: 'Event ID', type: 'number', required: true },
                    { id: 'eventSource', label: 'Event Source', type: 'text' },
                    { id: 'alertPriority', label: 'Alert Priority', type: 'select', options: ['Low', 'Normal', 'High'] },
                    { id: 'alertSeverity', label: 'Alert Severity', type: 'select', options: ['Information', 'Warning', 'Error'] }
                ]
            },
            'computer-group': {
                name: 'Computer Group',
                template: 'Class.Group.WindowsComputers.mpx',
                fields: [
                    { id: 'uniqueId', label: 'Unique ID', type: 'text', required: true },
                    { id: 'groupName', label: 'Group Display Name', type: 'text', required: true },
                    { id: 'groupDescription', label: 'Description', type: 'textarea' }
                ]
            },
            'powershell-task': {
                name: 'PowerShell Task',
                template: 'Task.Agent.PowerShell.WithParams.mpx',
                fields: [
                    { id: 'uniqueId', label: 'Unique ID', type: 'text', required: true },
                    { id: 'taskName', label: 'Task Display Name', type: 'text', required: true },
                    { id: 'scriptBody', label: 'PowerShell Script', type: 'textarea', required: true },
                    { id: 'parameters', label: 'Parameters', type: 'textarea', placeholder: 'One parameter per line' },
                    { id: 'timeoutSeconds', label: 'Timeout (seconds)', type: 'number', value: '300' }
                ]
            }
        };
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Discovery card selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.discovery-card')) {
                this.selectDiscoveryCard(e.target.closest('.discovery-card'));
            }
        });

        // Component selection handlers
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.component-card')) {
                this.handleComponentSelection(e.target);
            }
        });

        // Form validation
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        }, true);

        // Navigation handling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a.nav__link[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update active nav link
                    document.querySelectorAll('.nav__link').forEach(link => {
                        link.classList.remove('active');
                    });
                    e.target.classList.add('active');
                }
            }
        });
    }

    // Handle discovery card selection
    selectDiscoveryCard(card) {
        // Remove previous selection
        document.querySelectorAll('.discovery-card').forEach(c => c.classList.remove('selected'));
        
        // Select new card
        card.classList.add('selected');
        
        // Update selected discovery
        this.mpData.selectedComponents.discovery = card.dataset.discovery;
        
        // Enable next button
        const nextBtn = document.getElementById('next-discovery');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    // Handle discovery selection (radio buttons)
    handleDiscoverySelection(radio) {
        const componentType = radio.value;
        const card = radio.closest('.component-card');
        
        if (radio.checked) {
            // Clear any previously selected discovery types
            Object.keys(this.mpData.selectedComponents).forEach(key => {
                if (key.includes('registry-') || key.includes('wmi-') || key.includes('script-discovery') || key.includes('service-discovery')) {
                    delete this.mpData.selectedComponents[key];
                }
            });
            
            // Add the new selection
            this.mpData.selectedComponents[componentType] = {
                name: this.fragmentLibrary[componentType]?.name || componentType,
                template: this.fragmentLibrary[componentType]?.template || '',
                configuration: {}
            };
            card.classList.add('selected');
            
            // Remove selected class from other discovery cards if they exist
            document.querySelectorAll('[data-component="class-discovery"]').forEach(discoveryCard => {
                if (discoveryCard !== card) {
                    discoveryCard.classList.remove('selected');
                }
            });
        }
    }

    // Handle component selection
    handleComponentSelection(checkbox) {
        const componentType = checkbox.value;
        const card = checkbox.closest('.component-card');
        
        // Determine component category based on the step
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
                    // Determine subcategory for step 5
                    if (componentType.includes('group')) category = 'groups';
                    else if (componentType.includes('task')) category = 'tasks';
                    else if (componentType.includes('view')) category = 'views';
                    break;
            }
        }
        
        if (checkbox.checked) {
            // Add to appropriate category array
            if (!this.mpData.selectedComponents[category]) {
                this.mpData.selectedComponents[category] = [];
            }
            
            if (!this.mpData.selectedComponents[category].includes(componentType)) {
                this.mpData.selectedComponents[category].push(componentType);
            }
            
            card.classList.add('selected');
        } else {
            // Remove from category array
            if (this.mpData.selectedComponents[category]) {
                const index = this.mpData.selectedComponents[category].indexOf(componentType);
                if (index > -1) {
                    this.mpData.selectedComponents[category].splice(index, 1);
                }
            }
            
            card.classList.remove('selected');
        }
        
        console.log('Selected components:', this.mpData.selectedComponents);
    }

    // Validate form field
    validateField(field) {
        const formGroup = field.closest('.form-group');
        const isRequired = field.hasAttribute('required');
        const value = field.value.trim();
        
        // Remove existing validation classes
        formGroup.classList.remove('error', 'success');
        
        // Remove existing messages
        const existingMessage = formGroup.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (isRequired && !value) {
            this.showFieldError(formGroup, 'This field is required');
            return false;
        }
        
        // Field-specific validation
        if (field.id === 'company-id' || field.id === 'app-name') {
            if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
                this.showFieldError(formGroup, 'Only letters and numbers allowed, no spaces or special characters');
                return false;
            }
        }
        
        if (value) {
            formGroup.classList.add('success');
        }
        
        return true;
    }

    // Show field error
    showFieldError(formGroup, message) {
        formGroup.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }

    // Navigate to next step
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

    // Navigate to previous step
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    // Validate current step
    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        
        if (this.currentStep === 1) {
            // Validate basic info
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
            // Validate discovery selection
            return this.mpData.selectedComponents.discovery !== null;
        }
        
        // For other steps, no validation required (components are optional)
        return true;
    }

    // Save current step data
    saveCurrentStepData() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        
        if (this.currentStep === 1) {
            // Save basic info
            this.mpData.basicInfo = {
                companyId: document.getElementById('company-id').value.trim(),
                appName: document.getElementById('app-name').value.trim(),
                version: document.getElementById('mp-version').value.trim() || '1.0.0.0',
                description: document.getElementById('mp-description').value.trim()
            };
        }
    }

    // Update step display
    updateStepDisplay() {
        // Update progress bar
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
            step.classList.toggle('completed', stepNumber < this.currentStep);
        });
        
        // Update form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
        });

        // Auto-scroll to the current step
        this.scrollToCurrentStep();
    }

    // Scroll to the current step
    scrollToCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (currentStepElement) {
            // Calculate the offset to account for the fixed header
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const progressBarHeight = document.querySelector('.progress-bar')?.offsetHeight || 0;
            const offset = headerHeight + progressBarHeight + 40; // Extra 40px for breathing room
            
            const targetPosition = currentStepElement.offsetTop - offset;
            
            // Smooth scroll to the target position
            window.scrollTo({
                top: Math.max(0, targetPosition), // Ensure we don't scroll above the page
                behavior: 'smooth'
            });
        }
    }

    // Generate configuration forms based on selected components
    generateConfigurationForms() {
        const configContainer = document.getElementById('component-configs');
        configContainer.innerHTML = '';
        
        Object.entries(this.mpData.selectedComponents).forEach(([componentType, componentData]) => {
            const fragment = this.fragmentLibrary[componentType];
            if (!fragment) return;
            
            const panel = document.createElement('div');
            panel.className = 'config-panel';
            panel.innerHTML = `
                <h3>
                    <div class="config-panel-icon">
                        <i class="fas fa-cog"></i>
                    </div>
                    Configure ${fragment.name}
                </h3>
                <div class="config-grid" id="config-${componentType}">
                    ${this.generateConfigFields(componentType, fragment.fields)}
                </div>
            `;
            
            configContainer.appendChild(panel);
        });
    }

    // Generate configuration fields
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

    // Preview Management Pack
    previewMP() {
        console.log('previewMP method called');
        
        // Always save basic info first
        this.saveBasicInfo();
        
        console.log('Basic info after save:', this.mpData.basicInfo);
        
        // If no basic info, show a helpful message but still generate a preview
        if (!this.mpData.basicInfo.companyId || !this.mpData.basicInfo.appName) {
            console.log('Missing basic info - generating empty structure preview');
            const emptyPreview = `Management Pack Creator Preview
=====================================

Please fill out the basic information in Step 1:
- Company ID (required)
- Application Name (required)
- Version (optional, defaults to 1.0.0.0)
- Description (optional)

Then proceed through the wizard to select components:
- Step 2: Choose a discovery method
- Step 3: Select monitors for health tracking
- Step 4: Choose rules for data collection and alerts
- Step 5: Add groups, tasks, and views

Once you've made your selections, this preview will show the complete Management Pack structure.`;
            
            this.showOutput(emptyPreview, 'Management Pack Preview - Getting Started');
            return;
        }

        // Check if at least one component is selected
        const hasComponents = this.mpData.selectedComponents.discovery ||
                            (this.mpData.selectedComponents.monitors && this.mpData.selectedComponents.monitors.length > 0) ||
                            (this.mpData.selectedComponents.rules && this.mpData.selectedComponents.rules.length > 0) ||
                            (this.mpData.selectedComponents.groups && this.mpData.selectedComponents.groups.length > 0) ||
                            (this.mpData.selectedComponents.tasks && this.mpData.selectedComponents.tasks.length > 0) ||
                            (this.mpData.selectedComponents.views && this.mpData.selectedComponents.views.length > 0);

        console.log('Has components:', hasComponents);
        console.log('Selected components:', this.mpData.selectedComponents);

        if (!hasComponents) {
            console.log('Generating preview structure');
            // Show a preview of what would be generated with basic structure
            const previewContent = this.generatePreviewStructure();
            console.log('Preview content generated, calling showOutput');
            this.showOutput(previewContent, 'Management Pack Structure Preview');
        } else {
            console.log('Generating full XML');
            // Generate full XML
            try {
                this.saveConfigurationData();
                const mpXml = this.generateMPXML();
                this.showOutput(mpXml, 'Management Pack Preview');
            } catch (error) {
                console.error('Error generating XML:', error);
                const errorPreview = `Error generating Management Pack XML:
=====================================

${error.message}

Please check your component selections and try again.`;
                this.showOutput(errorPreview, 'Management Pack Preview - Error');
            }
        }
    }

    // Save basic info from form
    saveBasicInfo() {
        const companyIdField = document.getElementById('company-id');
        const appNameField = document.getElementById('app-name');
        const versionField = document.getElementById('mp-version');
        const descriptionField = document.getElementById('mp-description');
        
        if (companyIdField && appNameField) {
            this.mpData.basicInfo = {
                companyId: companyIdField.value.trim(),
                appName: appNameField.value.trim(),
                version: versionField ? versionField.value.trim() || '1.0.0.0' : '1.0.0.0',
                description: descriptionField ? descriptionField.value.trim() : ''
            };
        }
    }

    // Generate a preview structure when no components are selected
    generatePreviewStructure() {
        const { companyId, appName, version, description } = this.mpData.basicInfo;
        const mpId = `${companyId || 'YourCompany'}.${appName || 'YourApplication'}`;
        
        let preview = `Management Pack Structure for: ${mpId}
=====================================

Basic Information:
- ID: ${mpId}
- Version: ${version || '1.0.0.0'}
- Description: ${description || 'Auto-generated Management Pack'}

Selected Components:
`;

        if (this.mpData.selectedComponents.discovery) {
            preview += `- Discovery: ${this.mpData.selectedComponents.discovery}\n`;
        }
        
        if (this.mpData.selectedComponents.monitors.length > 0) {
            preview += `- Monitors: ${this.mpData.selectedComponents.monitors.join(', ')}\n`;
        }
        
        if (this.mpData.selectedComponents.rules.length > 0) {
            preview += `- Rules: ${this.mpData.selectedComponents.rules.join(', ')}\n`;
        }
        
        if (this.mpData.selectedComponents.groups.length > 0) {
            preview += `- Groups: ${this.mpData.selectedComponents.groups.join(', ')}\n`;
        }
        
        if (this.mpData.selectedComponents.tasks.length > 0) {
            preview += `- Tasks: ${this.mpData.selectedComponents.tasks.join(', ')}\n`;
        }
        
        if (this.mpData.selectedComponents.views.length > 0) {
            preview += `- Views: ${this.mpData.selectedComponents.views.join(', ')}\n`;
        }

        if (!this.mpData.selectedComponents.discovery && 
            this.mpData.selectedComponents.monitors.length === 0 &&
            this.mpData.selectedComponents.rules.length === 0 &&
            this.mpData.selectedComponents.groups.length === 0 &&
            this.mpData.selectedComponents.tasks.length === 0 &&
            this.mpData.selectedComponents.views.length === 0) {
            preview += `
No components selected yet.
Please go through the wizard steps to select:
1. A discovery method (Step 2)
2. Monitors for health tracking (Step 3)
3. Rules for data collection and alerts (Step 4)
4. Groups, tasks, and views (Step 5)

Once you've made your selections, the preview will show the complete XML structure.`;
        }

        return preview;
    }

    // Generate Management Pack
    generateMP() {
        // Always save basic info first
        this.saveBasicInfo();
        
        // Debug: Log current data
        console.log('Current MP Data:', this.mpData);
        
        // Check if basic info is filled out
        if (!this.mpData.basicInfo.companyId || !this.mpData.basicInfo.appName) {
            alert('Please fill out the Company ID and Application Name in step 1 before generating.');
            return;
        }

        try {
            this.saveConfigurationData();
            const mpXml = this.generateMPXML();
            
            console.log('Generated XML length:', mpXml ? mpXml.length : 'null');
            
            if (mpXml && mpXml.trim()) {
                const filename = `${this.mpData.basicInfo.companyId}.${this.mpData.basicInfo.appName}.xml`;
                console.log('Downloading file:', filename);
                this.downloadFile(mpXml, filename, 'text/xml');
            } else {
                alert('Error generating Management Pack XML. Please check your selections.');
            }
        } catch (error) {
            console.error('Error generating MP:', error);
            alert('Error generating Management Pack: ' + error.message);
        }
    }

    // Save configuration data from forms
    saveConfigurationData() {
        Object.keys(this.mpData.selectedComponents).forEach(componentType => {
            const fragment = this.fragmentLibrary[componentType];
            if (!fragment) return;
            
            const config = {};
            fragment.fields.forEach(field => {
                const fieldId = `${componentType}-${field.id}`;
                const element = document.getElementById(fieldId);
                if (element) {
                    config[field.id] = element.value;
                }
            });
            
            this.mpData.selectedComponents[componentType].configuration = config;
        });
    }

    // Generate complete MP XML
    generateMPXML() {
        const { companyId, appName, version, description } = this.mpData.basicInfo;
        const mpId = `${companyId}.${appName}`;
        
        let xml = `<?xml version="1.0" encoding="utf-8"?>
<ManagementPack ContentReadable="true" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <Manifest>
    <Identity>
      <ID>${mpId}</ID>
      <Version>${version}</Version>
    </Identity>
    <Name>${mpId}</Name>
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
      <Reference Alias="Health">
        <ID>System.Health.Library</ID>
        <Version>7.0.8560.0</Version>
        <PublicKeyToken>31bf3856ad364e35</PublicKeyToken>
      </Reference>
      <Reference Alias="SC">
        <ID>Microsoft.SystemCenter.Library</ID>
        <Version>7.0.8560.0</Version>
        <PublicKeyToken>31bf3856ad364e35</PublicKeyToken>
      </Reference>
      <Reference Alias="Performance">
        <ID>System.Performance.Library</ID>
        <Version>7.0.8560.0</Version>
        <PublicKeyToken>31bf3856ad364e35</PublicKeyToken>
      </Reference>
    </References>
  </Manifest>`;

        // Add TypeDefinitions if needed
        const hasClasses = Object.keys(this.mpData.selectedComponents).some(type => 
            type.includes('discovery') || type.includes('class')
        );
        
        if (hasClasses) {
            xml += '\n  <TypeDefinitions>\n    <EntityTypes>\n      <ClassTypes>';
            Object.entries(this.mpData.selectedComponents).forEach(([type, component]) => {
                if (type.includes('discovery') || type.includes('class')) {
                    xml += this.generateClassDefinition(type, component);
                }
            });
            xml += '\n      </ClassTypes>\n    </EntityTypes>\n  </TypeDefinitions>';
        }

        // Add Monitoring section
        xml += '\n  <Monitoring>';

        // Add Discoveries
        const discoveries = Object.entries(this.mpData.selectedComponents).filter(([type]) => 
            type.includes('discovery') || type.includes('class')
        );
        if (discoveries.length > 0) {
            xml += '\n    <Discoveries>';
            discoveries.forEach(([type, component]) => {
                xml += this.generateDiscovery(type, component);
            });
            xml += '\n    </Discoveries>';
        }

        // Add Monitors
        const monitors = Object.entries(this.mpData.selectedComponents).filter(([type]) => 
            type.includes('monitor')
        );
        if (monitors.length > 0) {
            xml += '\n    <Monitors>';
            monitors.forEach(([type, component]) => {
                xml += this.generateMonitor(type, component);
            });
            xml += '\n    </Monitors>';
        }

        // Add Rules
        const rules = Object.entries(this.mpData.selectedComponents).filter(([type]) => 
            type.includes('rule') || type.includes('collection') || type.includes('alert')
        );
        if (rules.length > 0) {
            xml += '\n    <Rules>';
            rules.forEach(([type, component]) => {
                xml += this.generateRule(type, component);
            });
            xml += '\n    </Rules>';
        }

        xml += '\n  </Monitoring>\n</ManagementPack>';

        return xml;
    }

    // Generate class definition
    generateClassDefinition(type, component) {
        const { companyId, appName } = this.mpData.basicInfo;
        const config = component.configuration;
        
        return `
        <ClassType ID="${companyId}.${appName}.${config.uniqueId || 'Component'}.Class" 
                   Base="Windows!Microsoft.Windows.LocalApplication" 
                   Accessibility="Public" 
                   Abstract="false" 
                   Hosted="true" 
                   Singleton="false">
        </ClassType>`;
    }

    // Generate discovery
    generateDiscovery(type, component) {
        const { companyId, appName } = this.mpData.basicInfo;
        const config = component.configuration;
        
        if (type === 'registry-key') {
            return `
      <Discovery ID="${companyId}.${appName}.${config.uniqueId}.Discovery" 
                 Target="${config.targetClass || 'Windows!Microsoft.Windows.Server.OperatingSystem'}" 
                 Enabled="true" 
                 ConfirmDelivery="false" 
                 Remotable="true" 
                 Priority="Normal">
        <Category>Discovery</Category>
        <DiscoveryTypes>
          <DiscoveryClass TypeID="${companyId}.${appName}.${config.uniqueId}.Class" />
        </DiscoveryTypes>
        <DataSource ID="DS" TypeID="Windows!Microsoft.Windows.FilteredRegistryDiscoveryProvider">
          <ComputerName>$Target/Host/Property[Type="Windows!Microsoft.Windows.Computer"]/PrincipalName$</ComputerName>
          <RegistryAttributeDefinitions>
            <RegistryAttributeDefinition>
              <AttributeName>${config.uniqueId}RegKeyExists</AttributeName>
              <Path>${config.regKeyPath}</Path>
              <PathType>0</PathType>
              <AttributeType>0</AttributeType>
            </RegistryAttributeDefinition>
          </RegistryAttributeDefinitions>
          <Frequency>86400</Frequency>
          <ClassId>$MPElement[Name="${companyId}.${appName}.${config.uniqueId}.Class"]$</ClassId>
          <InstanceSettings>
            <Settings>
              <Setting>
                <Name>$MPElement[Name="Windows!Microsoft.Windows.Computer"]/PrincipalName$</Name>
                <Value>$Target/Host/Property[Type="Windows!Microsoft.Windows.Computer"]/PrincipalName$</Value>
              </Setting>
              <Setting>
                <Name>$MPElement[Name="System!System.Entity"]/DisplayName$</Name>
                <Value>$Target/Host/Property[Type="Windows!Microsoft.Windows.Computer"]/PrincipalName$</Value>
              </Setting>
            </Settings>
          </InstanceSettings>
          <Expression>
            <SimpleExpression>
              <ValueExpression>
                <XPathQuery Type="Boolean">Values/${config.uniqueId}RegKeyExists</XPathQuery>
              </ValueExpression>
              <Operator>Equal</Operator>
              <ValueExpression>
                <Value Type="Boolean">true</Value>
              </ValueExpression>
            </SimpleExpression>
          </Expression>
        </DataSource>
      </Discovery>`;
        }
        
        return '';
    }

    // Generate monitor
    generateMonitor(type, component) {
        const { companyId, appName } = this.mpData.basicInfo;
        const config = component.configuration;
        
        if (type === 'service-monitor') {
            return `
      <UnitMonitor ID="${companyId}.${appName}.${config.uniqueId}.Service.Monitor" 
                   Accessibility="Public" 
                   Enabled="true" 
                   Target="${config.targetClass}" 
                   ParentMonitorID="Health!System.Health.AvailabilityState" 
                   Remotable="true" 
                   Priority="Normal" 
                   TypeID="Windows!Microsoft.Windows.CheckNTServiceStateMonitorType" 
                   ConfirmDelivery="false">
        <Category>AvailabilityHealth</Category>
        <AlertSettings AlertMessage="${companyId}.${appName}.${config.uniqueId}.Service.Monitor.AlertMessage">
          <AlertOnState>Warning</AlertOnState>
          <AutoResolve>true</AutoResolve>
          <AlertPriority>${config.alertPriority || 'Normal'}</AlertPriority>
          <AlertSeverity>${config.alertSeverity || 'Error'}</AlertSeverity>
          <AlertParameters>
            <AlertParameter1>$Data/Context/Property[@Name='Name']$</AlertParameter1>
            <AlertParameter2>$Target/Host/Property[Type="Windows!Microsoft.Windows.Computer"]/PrincipalName$</AlertParameter2>
          </AlertParameters>
        </AlertSettings>
        <OperationalStates>
          <OperationalState ID="Running" MonitorTypeStateID="Running" HealthState="Success" />
          <OperationalState ID="NotRunning" MonitorTypeStateID="NotRunning" HealthState="Warning" />
        </OperationalStates>
        <Configuration>
          <ComputerName />
          <ServiceName>${config.serviceName}</ServiceName>
          <CheckStartupType />
        </Configuration>
      </UnitMonitor>`;
        }
        
        return '';
    }

    // Generate rule
    generateRule(type, component) {
        const { companyId, appName } = this.mpData.basicInfo;
        const config = component.configuration;
        
        if (type === 'performance-collection') {
            return `
      <Rule ID="${companyId}.${appName}.${config.uniqueId}.PerformanceCollection.Rule" 
            Enabled="true" 
            Target="${config.targetClass}" 
            ConfirmDelivery="false" 
            Remotable="true" 
            Priority="Normal" 
            DiscardLevel="100">
        <Category>PerformanceCollection</Category>
        <DataSources>
          <DataSource ID="DS" TypeID="Performance!System.Performance.OptimizedDataProvider">
            <ComputerName>$Target/Host/Property[Type="Windows!Microsoft.Windows.Computer"]/NetworkName$</ComputerName>
            <CounterName>${config.counterName}</CounterName>
            <ObjectName>${config.objectName}</ObjectName>
            <InstanceName>${config.instanceName || ''}</InstanceName>
            <AllInstances>false</AllInstances>
            <Frequency>${config.frequencySeconds || '300'}</Frequency>
            <Tolerance>0</Tolerance>
            <ToleranceType>Absolute</ToleranceType>
            <MaximumSampleSeparation>1</MaximumSampleSeparation>
          </DataSource>
        </DataSources>
        <WriteActions>
          <WriteAction ID="CollectPerfData" TypeID="SC!Microsoft.SystemCenter.CollectPerformanceData" />
        </WriteActions>
      </Rule>`;
        }
        
        return '';
    }

    // Show output in the output area
    showOutput(content, title) {
        console.log('showOutput called with title:', title);
        console.log('Content length:', content ? content.length : 'null');
        
        const outputArea = document.getElementById('output-area');
        const outputHeader = outputArea.querySelector('.output-header h3');
        const outputCode = outputArea.querySelector('#mp-output code');
        
        console.log('Output area found:', !!outputArea);
        console.log('Output header found:', !!outputHeader);
        console.log('Output code found:', !!outputCode);
        
        if (outputHeader) {
            outputHeader.textContent = title;
        }
        if (outputCode) {
            outputCode.textContent = content;
        }
        if (outputArea) {
            outputArea.style.display = 'block';
            
            // Scroll to output
            outputArea.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Download file
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

    // Start over
    startOver() {
        if (confirm('Are you sure you want to start over? All your progress will be lost.')) {
            this.currentStep = 1;
            this.mpData = {
                basicInfo: {},
                selectedComponents: {},
                configurations: {}
            };
            
            // Reset form
            document.querySelectorAll('input, select, textarea').forEach(field => {
                field.value = '';
            });
            
            // Reset checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Reset component cards
            document.querySelectorAll('.component-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Hide output area
            document.getElementById('output-area').style.display = 'none';
            
            this.updateStepDisplay();
        }
    }
}

// Global functions for button handlers
let mpCreator;

function nextStep() {
    mpCreator.nextStep();
}

function prevStep() {
    mpCreator.prevStep();
}

function previewMP() {
    console.log('previewMP function called');
    if (!mpCreator) {
        alert('MP Creator not initialized');
        return;
    }
    mpCreator.previewMP();
}

function generateMP() {
    console.log('generateMP function called');
    if (!mpCreator) {
        alert('MP Creator not initialized');
        return;
    }
    mpCreator.generateMP();
}

function downloadPackage() {
    console.log('downloadPackage function called');
    if (!mpCreator) {
        alert('MP Creator not initialized');
        return;
    }
    
    // Always save basic info first
    mpCreator.saveBasicInfo();
    
    // Check if basic info is filled out
    if (!mpCreator.mpData.basicInfo.companyId || !mpCreator.mpData.basicInfo.appName) {
        alert('Please fill out the Company ID and Application Name in step 1 before downloading.');
        return;
    }

    try {
        // Generate a complete package with deployment scripts
        mpCreator.saveConfigurationData();
        const mpXml = mpCreator.generateMPXML();
        const { companyId, appName } = mpCreator.mpData.basicInfo;
        
        if (!mpXml || !mpXml.trim()) {
            alert('Error generating Management Pack XML. Please check your selections.');
            return;
        }
        
        // Create deployment script
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

        // Download both files
        mpCreator.downloadFile(mpXml, `${companyId}.${appName}.xml`, 'text/xml');
        
        // Small delay to ensure first download starts
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
            // Show feedback
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
