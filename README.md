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

### Phase 4: SCS SDK Integration ✅
- SCS telemetry data structure definitions
- Cross-platform shared memory connection (Windows/macOS/Linux)
- SCS telemetry parser with validation
- Mapping of SCS data to internal TelemetryState
- Automatic fallback to simulation mode when ATS is not running
- Support for both ATS and ETS2 telemetry

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

## SCS SDK Integration

This project integrates with the SCS Telemetry SDK to read real-time data from American Truck Simulator and Euro Truck Simulator 2.

### Prerequisites

To use real ATS/ETS2 telemetry, you need to install the SCS telemetry plugin:

1. Download the [scs-sdk-plugin](https://github.com/truckermudgeon/scs-sdk-plugin/releases)
2. Extract the plugin files
3. Copy the plugin to your game's `plugins` folder:

**Windows:**
```
C:\Program Files (x86)\Steam\steamapps\common\American Truck Simulator\bin\win_x64\plugins\
```

**macOS:**
```
/Applications/American Truck Simulator.app/Contents/MacOS/plugins/
```

**Linux:**
```
~/.steam/steam/steamapps/common/American\ Truck\ Simulator/bin/linux_x64/plugins/
```

### How It Works

- The SCS plugin writes telemetry data to shared memory (`Local\SCSTelemetry` on Windows, `/SCSTelemetry` on Unix)
- Our application reads this shared memory in real-time
- The data is parsed and mapped to our internal `TelemetryState` structure
- If ATS is not running or the plugin is not installed, the system automatically falls back to simulation mode

**Note:** The adapter defaults to simulation mode. To use real telemetry, ensure ATS/ETS2 is running with the SCS plugin installed before starting the application.

### Telemetry Data Mapped

- Speed (km/h → m/s conversion)
- Engine state (on/off)
- Parking brake status
- Odometer (km)
- Trailer connection status
- Navigation route distance
- Game pause state
- Rest stop/sleep detection

## License

TBD
