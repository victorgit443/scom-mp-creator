# SCOM Management Pack Creator

A professional web-based tool for creating System Center Operations Manager (SCOM) Management Packs with an intuitive step-by-step wizard interface.

## 🚀 Features

### Interactive MP Creator Wizard
- **6-Step Progressive Interface**: Guided workflow from basic info to final generation
- **Discovery Methods**: Registry keys, WMI queries, services, scripts, and more
- **Health Monitors**: Service, performance, event log, script, and port monitors
- **Data Collection Rules**: Performance counters, event alerts, and custom scripts
- **Advanced Components**: Groups, tasks, views, and recovery actions

### Professional UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Styling**: Professional gradients, animations, and card-based layouts
- **Smart Navigation**: Auto-scroll to steps, progress tracking, and validation
- **Component Cards**: Visual selection with hover effects and status indicators

### SCOM Integration
- **Fragment Library**: Based on Microsoft SCOM best practices and templates
- **Valid XML Generation**: Produces production-ready Management Pack XML
- **Deployment Support**: Includes PowerShell deployment scripts
- **Multiple Export Options**: Preview, download XML, or complete package

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Font Awesome for professional iconography
- **Architecture**: Object-oriented JavaScript with modular design

## 📁 Project Structure

```
SCOM MP Creator/
├── index.html              # Main landing page
├── creator.html             # Interactive MP Creator wizard
├── styles.css              # Main website styling
├── mp-creator.css          # Creator-specific styles
├── script.js               # Navigation and common functionality
├── mp-creator.js           # Core MP Creator logic
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server for local development (optional but recommended)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "SCOM MP Creator"
   ```

2. **Start local development server** (optional):
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

### Quick Start

1. **Visit the landing page** (`index.html`) to learn about SCOM MP services
2. **Click "Create MP"** to access the interactive wizard
3. **Follow the 6-step process**:
   - Step 1: Enter basic MP information
   - Step 2: Choose discovery method
   - Step 3: Select health monitors
   - Step 4: Configure data collection rules
   - Step 5: Add groups, tasks, and views
   - Step 6: Preview and generate your MP

## 📋 Usage Guide

### Step 1: Basic Information
- **Company ID**: Your organization identifier (e.g., "Contoso")
- **Application Name**: The application to monitor (e.g., "WebApp")
- **Version**: MP version (defaults to 1.0.0.0)
- **Description**: Optional MP description

### Step 2: Discovery Selection
Choose how SCOM will discover your application:
- **Registry Key**: Check for registry key existence
- **Registry Value**: Validate specific registry values
- **WMI Query**: Use WMI to discover components
- **Script Discovery**: Custom PowerShell logic
- **Service Discovery**: Discover based on Windows services
- **Skip Discovery**: Target existing SCOM classes

### Step 3: Health Monitors
Select monitors to track application health:
- **Service Monitor**: Monitor Windows service state
- **Performance Monitor**: Track performance counters
- **Event Log Monitor**: Monitor Windows Event Logs
- **Script Monitor**: Custom health check scripts
- **Port Monitor**: TCP port availability checks
- **Registry Monitor**: Monitor registry changes

### Step 4: Data Collection Rules
Configure data collection and alerting:
- **Performance Collection**: Collect performance data
- **Event Alerts**: Generate alerts from events
- **Script Alerts**: Custom alert conditions
- **SNMP Alerts**: SNMP trap-based alerts

### Step 5: Additional Components
Add organizational and operational components:
- **Groups**: Computer or instance groups
- **Tasks**: PowerShell tasks and recovery actions
- **Views**: State views and alert views

### Step 6: Generate Management Pack
- **Preview**: Review MP structure before generation
- **Generate**: Download XML file
- **Package**: Download XML + deployment scripts

## 🔧 Development

### Code Architecture

**MPCreator Class** (`mp-creator.js`):
- `constructor()`: Initialize wizard state and data structures
- `nextStep()`/`prevStep()`: Handle wizard navigation
- `selectDiscoveryCard()`: Manage discovery method selection
- `handleComponentSelection()`: Process component checkboxes
- `generateMPXML()`: Create SCOM-compatible XML
- `previewMP()`: Generate preview content
- `downloadFile()`: Handle file downloads

**Key Features**:
- **Fragment Library**: Template-based MP generation
- **Progressive Validation**: Step-by-step form validation
- **Auto-scroll**: Smooth navigation between steps
- **Error Handling**: Comprehensive error reporting
- **Responsive Design**: Mobile-friendly interface

### Customization

**Adding New Discovery Methods**:
1. Add entry to `fragmentLibrary` in `loadFragmentLibrary()`
2. Create discovery card in Step 2 HTML
3. Implement XML generation in `generateDiscovery()`

**Adding New Monitors**:
1. Add monitor template to fragment library
2. Create component card in Step 3
3. Implement generation logic in `generateMonitor()`

**Styling Customizations**:
- Modify `mp-creator.css` for wizard-specific styles
- Update `styles.css` for main website appearance
- Customize color scheme via CSS variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] **ZIP Package Export**: Complete deployment packages
- [ ] **Advanced Validation**: XML schema validation
- [ ] **Template Import**: Load existing MP templates
- [ ] **Dark Mode**: Theme switching support
- [ ] **Multi-language**: Internationalization support
- [ ] **Cloud Integration**: Azure DevOps integration

## 📊 Project Stats

- **Files**: 6 core files
- **Languages**: HTML, CSS, JavaScript
- **Features**: 20+ component types
- **Wizard Steps**: 6 progressive steps
- **Discovery Methods**: 6 options
- **Monitor Types**: 6 varieties
- **Rule Types**: 4 categories

---

**Built with ❤️ for the SCOM community**
