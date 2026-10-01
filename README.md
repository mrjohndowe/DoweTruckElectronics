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
├── src/               # Source code
│   ├── telemetry/      # ATS telemetry connection
│   ├── eld/           # ELD engine and HOS logic
│   ├── radar/         # Radar detection engine
│   ├── persistence/   # Log storage and serialization
│   └── shared/        # Shared types and events
├── scs_mod/           # ATS mod files
│   ├── def/           # Mod definitions
│   ├── material/      # Material definitions
│   ├── model/         # 3D models
│   └── ui/            # UI assets
├── ui-mockups/        # HTML/CSS UI mockups
└── logs/              # Persistent log storage
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

### Phase 5: Radar Detection Engine ✅
- Multi-band radar detection (X, K, Ka, Laser, POP, MRCD)
- Directional detection (Front, Rear, Side)
- Signal strength meter with decay
- Sensitivity modes (Highway, Auto, City, No X)
- Configurable band filters
- Voice alert system with text-to-speech messages
- Auto-mute at low speeds
- Auto-dim based on ambient conditions
- Settings management with event notifications
- Bogey counter for multiple alerts
- Thread-safe signal processing

### Phase 6: Persistent Log Storage ✅
- Log entry structures for status changes, violations, inspections, fuel stops
- JSON serialization for all log types
- Daily log rotation with automatic file management
- Log storage manager with thread-safe operations
- ELD engine integration for automatic logging
- Daily log retrieval and date range queries
- Trip management with start/end tracking
- Violation acknowledgment system
- Inspection checklist logging
- Fuel stop tracking with cost calculation

### Phase 7: ATS Mod Integration ✅
- ATS mod manifest with metadata and compatibility
- ELD accessory definition with mount positions
- Radar detector accessory definition with animations
- Material definitions for ELD and radar devices
- Animation definitions for screen brightness, alerts, direction arrows
- UI definitions for ELD and radar displays
- Truck compatibility configurations for all SCS stock trucks
- Mod directory structure following SCS conventions
- Installation and usage documentation

### Next Steps
- Create 3D models for ELD tablet and radar detector
- Create textures for materials
- Create actual mod icon image
- Test mod in American Truck Simulator
- Finalize UI integration with external application

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

## Radar Detection System

The radar detection engine provides comprehensive multi-band radar detection with configurable sensitivity and directional alerts.

### Supported Bands

- **X Band**: 10.5 GHz (older police radar, high false alarm rate)
- **K Band**: 24.1 GHz (common police radar)
- **Ka Band**: 34.7 GHz (modern police radar, most common)
- **Laser**: 904 nm (LIDAR speed detection)
- **POP Mode**: Instant-on radar detection
- **MRCD**: Photo radar detection (photo enforcement)

### Sensitivity Modes

- **Highway**: Maximum sensitivity for highway driving
- **Auto**: Automatically adjusts sensitivity based on speed
- **City**: Reduced sensitivity for urban environments
- **No X**: Medium sensitivity with X band disabled

### Features

- **Directional Detection**: Front, Rear, and Side arrow indicators
- **Signal Strength**: 7-level signal meter with real-time updates
- **Bogey Counter**: Tracks multiple radar sources simultaneously
- **Voice Alerts**: Text-to-speech announcements for detected bands
- **Auto-Mute**: Automatically mutes alerts at low speeds
- **Auto-Dim**: Reduces display brightness at night
- **Band Filters**: Enable/disable individual radar bands
- **Volume Control**: Adjustable alert volume
- **Brightness Control**: Adjustable display brightness

### Usage

The radar engine is integrated with the main application and will:
- Simulate random radar signals when in simulation mode
- Process real radar data when integrated with ATS
- Display alerts through the UI mockup
- Emit voice alerts when enabled
- Track bogey count and signal strength

## Persistent Log Storage

The persistent log storage system saves all ELD data to disk for compliance and inspection purposes.

### Log Types

- **Log Entries**: Duty status changes with timestamps, duration, and distance
- **Violations**: HOS violations with severity and acknowledgment tracking
- **Inspections**: Pre-trip, post-trip, and DVIR inspections with checklist items
- **Fuel Stops**: Fuel purchases with location, cost, and odometer data
- **Trips**: Complete trip records with origin, destination, cargo, and delivery status

### Storage Format

- **JSON Format**: All logs are stored as human-readable JSON files
- **Daily Rotation**: Each day's logs are stored in a separate file (YYYY-MM-DD.json)
- **Directory Structure**: Logs are stored in `./logs/` subdirectory
- **Automatic Saving**: Logs are saved automatically on shutdown

### Features

- **Automatic Logging**: ELD engine automatically logs all status changes
- **Thread-Safe**: All storage operations are mutex-protected
- **Query by Date**: Retrieve logs for specific dates or date ranges
- **Violation Tracking**: Track and acknowledge HOS violations
- **Trip Management**: Start and end trips with cargo tracking
- **Inspection Checklists**: Complete inspection logging with item details
- **Fuel Tracking**: Comprehensive fuel stop logging with cost calculation

### File Structure

```
logs/
├── 2026-10-01.json
├── 2026-10-02.json
└── 2026-10-03.json
```

Each daily log file contains:
- Daily totals (driving hours, on-duty hours, off-duty hours, sleeper berth hours, distance)
- All status change entries
- Any violations that occurred
- Inspection records
- Fuel stop records

### Usage

The log storage system is automatically integrated with the ELD engine:
- Status changes are automatically logged with timestamps and duration
- Logs are saved to `./logs/` directory as JSON files
- Daily rotation ensures manageable file sizes
- Logs are saved automatically on application shutdown
- Logs can be queried by date or date range programmatically

## ATS Mod Integration

The ATS mod files provide the in-game truck interior accessories for the ELD tablet and radar detector.

### Mod Structure

```
scs_mod/
├── manifest.sii                    # Mod manifest
├── mod_icon.jpg                   # Mod icon
├── def/
│   ├── company_accessory/         # Accessory definitions
│   ├── vehicle/                   # Vehicle configurations
│   └── ui/                        # UI definitions
├── material/model/                 # Material definitions
├── model/                         # 3D models
└── ui/                            # UI assets
```

### Features

- **ELD Tablet Accessory**: Installable ELD tablet with multiple mount positions
- **Radar Detector Accessory**: Installable radar detector with animations
- **Multiple Mount Positions**: Windshield, dashboard, and overhead mounting
- **Animated Displays**: Boot animations, screen brightness, alert animations
- **UI Screens**: In-game UI templates for ELD and radar displays
- **Truck Compatibility**: Supports all SCS stock trucks (Kenworth, Peterbilt, Freightliner, Volvo, International, Mack, Western Star)
- **Material Definitions**: PBR materials with emissive displays

### Installation

1. Copy the `scs_mod` directory to your ATS mods folder
2. Rename to `dowe_truck_electronics`
3. Enable in ATS Mod Manager
4. Purchase accessories from truck accessory shop

### Required Assets

The following assets need to be created for full functionality:
- 3D models (.pmd files) for ELD tablet and radar detector
- Textures (.tobj files) for materials
- Mod icon (512x512 JPG)

See `scs_mod/README.md` for detailed instructions.

### Integration

The mod works with the external DoweTruckElectronics application:
1. Install SCS telemetry plugin in ATS
2. Run the external application
3. The application reads telemetry and processes ELD/radar data
4. The mod displays the devices in the truck interior
5. Both systems work together for complete functionality

## License

TBD
