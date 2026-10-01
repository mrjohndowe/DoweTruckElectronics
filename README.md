# DoweTruckElectronics

A comprehensive ELD (Electronic Logging Device) and radar detector system for American Truck Simulator.

## Project Overview

This project implements a fully functional truck electronics suite including:

- **ELD System**: FMCSA-compliant electronic logging device with automatic duty status detection, hours of service tracking, and violation monitoring
- **Radar Detector**: Multi-band radar detection with directional alerts, signal strength meter, and configurable sensitivity modes
- **ATS Integration**: Telemetry-based connection to American Truck Simulator for real-time truck state tracking

## Architecture

```
DoweTruckElectronics/
├── core/              # Shared types and events
├── telemetry/         # ATS telemetry connection
├── eld/              # ELD engine and HOS logic
├── radar/            # Radar detection engine
├── devices/          # Device interfaces
└── scs_mod/          # ATS mod definitions
```

## Current Status

### Phase 1: Core ELD System ✅
- Telemetry state structure
- Duty status enumeration and state machine
- Hours of Service (HOS) clock implementation
- ELD engine with automatic status detection
- Test harness for simulating truck behavior

### Phase 2: ATS Telemetry Adapter ✅
- ITelemetrySource interface for pluggable telemetry sources
- SCS telemetry adapter with simulation mode
- Telemetry manager with connection watchdog
- Event system for state change notifications
- Shared logging infrastructure
- Thread-safe telemetry state updates
- Real-time telemetry processing loop

### Phase 3: UI Mockups ✅
- Interactive ELD tablet display mockup
- Radar detector display mockup
- Multiple screens and navigation
- Real-time animations and state changes
- Responsive HTML/CSS implementation

### Next Steps
- Persistent log storage
- Radar detection engine
- ATS mod integration (models, animations, UI)

## Building

```bash
mkdir build
cd build
cmake ..
cmake --build .
```

## Testing

Run the test harness to simulate ELD behavior:

```bash
./DoweTruckElectronics
```

This simulates a driving scenario, showing automatic duty status transitions and HOS clock updates.

## UI Mockups

Interactive HTML/CSS mockups are available for previewing the ELD and radar detector interfaces:

- **ELD Display**: Full-featured ELD tablet with Home, HOS, Duty Status, Logs, Inspection, Violations, Fuel, and Settings screens
- **Radar Detector**: Multi-band radar detector with directional alerts, signal strength, and sensitivity controls

To preview the mockups, open the HTML files in a web browser:

- `ui-mockups\eld-display.html` - ELD tablet interface
- `ui-mockups\radar-detector.html` - Radar detector interface

Simply double-click the files or open them in your preferred web browser.

The mockups include:
- Interactive navigation between screens
- Real-time status indicators
- Animated alerts and notifications
- Configurable settings toggles
- Responsive design for different display sizes

## License

TBD
