# DoweTruckElectronics

A comprehensive ELD (Electronic Logging Device) and radar detector system for American Truck Simulator.

## Project Overview

This project implements a fully functional truck electronics suite including:

- **ELD System**: FMCSA-compliant electronic logging device with automatic duty status detection, hours of service tracking, and violation monitoring
- **Radar Detector**: Multi-band radar detection with directional alerts, signal strength meter, and configurable sensitivity modes
- **ATS Integration**: Telemetry-based connection to American Truck Simulator for real-time truck state tracking
- **Dual Storage**: JSON files for human-readable logs and SQLite database for efficient querying and statistics

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
- React 19 + TypeScript + Vite + Tailwind CSS preview/demo implementation

**Note**: These are demo/preview mockups for design validation and testing. The final UI will be implemented in-game through the ATS mod system using SCS UI integration when the mod is installed in American Truck Simulator.

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
- Create 3D models for ELD tablet and radar detector (specifications provided)
- Create textures for materials
- Create actual mod icon image
- Test mod in American Truck Simulator with created models
- Add truck-specific configurations for additional trucks (T680, 579, etc.)
- Refine mount positions based on in-game testing

## Roadmap

For a detailed roadmap of planned features, milestones, and future enhancements, see [ROADMAP.md](ROADMAP.md).

### Quick Status Overview
- **Core Systems**: ✅ Complete (ELD, Radar, Telemetry, Persistence)
- **ATS Mod Definitions**: ✅ Complete (4 trucks supported)
- **3D Models**: ⏳ Specifications complete, models need creation
- **Textures**: ⏳ Placeholders exist, actual textures needed
- **In-Game Testing**: 🔄 Ready to test with SCS plugin
- **Production Release**: ⏳ Target Q1 2028

## Building

### Prerequisites
- C++17 compatible compiler (GCC 7+, Clang 5+, MSVC 2017+)
- CMake 3.24 or later
- SQLite3 development library (usually included with OS)
- Threads library (usually included with OS)

### Build Instructions

```bash
mkdir build
cd build
cmake ..
cmake --build .
```

### Installing SQLite3

**Ubuntu/Debian:**
```bash
sudo apt-get install libsqlite3-dev
```

**Fedora/RHEL:**
```bash
sudo dnf install sqlite-devel
```

**macOS:**
```bash
brew install sqlite
```

**Windows:**
SQLite3 is included with the CMake configuration on Windows. If needed, download from https://www.sqlite.org/

## Testing

Run the test harness to simulate ELD behavior:

```bash
./DoweTruckElectronics
```

This simulates a driving scenario, showing automatic duty status transitions and HOS clock updates.

## UI Mockups (Preview/Demo)

The UI mockups are demo/preview tools for design validation and testing purposes. They allow you to preview the ELD and radar device interfaces before implementing them in-game.

### Important Note
These mockups are **not** the final product. The actual in-game UI will be implemented through the ATS mod system using SCS UI integration when the mod is installed in American Truck Simulator.

### Preview Features
- **React 19.2.6** with TypeScript for type safety
- **Vite 7.3.6** for fast development
- **Tailwind CSS 4.1.17** for modern styling
- **Interactive Demos**: Live simulation of ELD and radar devices
- **Real-time Updates**: Dynamic status changes and alerts
- **Audio Support**: Voice alerts for radar detection
- **Responsive Design**: Works on desktop and mobile

### Running the Preview Demo

```bash
cd ui-mockups
npm install
npm run dev
```

The development server will start at http://localhost:5173

### Purpose
- Design validation for ELD and radar interfaces
- Feature demonstration and testing
- User experience preview
- Layout and navigation testing
- Animation and interaction feedback

### Previous HTML Files
The original HTML mockups have been archived as `.OLD` files for reference.

### Final Implementation
The actual in-game UI will be:
- Implemented through ATS mod UI definitions
- Integrated with the external application via SCS telemetry
- Displayed on the 3D models in the truck interior
- Controlled by the C++ application state
- Part of the complete ATS mod experience

## SCS SDK Integration

This project integrates with the SCS Telemetry SDK to read real-time data from American Truck Simulator and Euro Truck Simulator 2.

### Prerequisites

To use real ATS/ETS2 telemetry, you need to install the SCS telemetry plugin:

1. Download the [scs-sdk-plugin](https://github.com/truckermudgeon/scs-sdk-plugin/releases)
2. Extract the plugin files
3. Copy the plugin to your game's `plugins` folder:

**Windows:**
```
Steam > steamapps > common > American Truck Simulator > bin > win_x64 > plugins > scs-telemetry.dll
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

The persistent log storage system saves all ELD data to disk for compliance and inspection purposes. The system supports dual storage: JSON files for human-readable logs and SQLite database for efficient querying and statistics.

### Log Types

- **Log Entries**: Duty status changes with timestamps, duration, and distance
- **Violations**: HOS violations with severity and acknowledgment tracking
- **Inspections**: Pre-trip, post-trip, and DVIR inspections with checklist items
- **Fuel Stops**: Fuel purchases with location, cost, and odometer data
- **Trips**: Complete trip records with origin, destination, cargo, and delivery status

### Storage Formats

#### JSON Storage
- **File Format**: JSON with pretty-printing
- **File Naming**: `YYYY-MM-DD.json` for daily rotation
- **Location**: `./logs/` directory (configurable)
- **Advantages**: Human-readable, easy to inspect, portable

#### SQLite Database
- **File Format**: SQLite database file
- **File Location**: `./logs/dowe_electronics.db`
- **Schema**: Normalized tables with indexes for efficient querying
- **Advantages**: Fast queries, aggregate statistics, complex filtering, ACID compliance

### Database Schema

The SQLite database includes the following tables:
- `log_entries` - Duty status changes with timestamps and metadata
- `violations` - HOS violations with acknowledgment tracking
- `inspections` - Inspection records with checklist items
- `inspection_items` - Individual inspection checklist items
- `fuel_stops` - Fuel purchase records
- `trips` - Trip records with origin, destination, and cargo

### Query Methods

#### SQLite-Specific Queries
- `get_all_log_entries()` - Retrieve all log entries
- `get_all_violations()` - Retrieve all violations
- `get_all_trips()` - Retrieve all trips
- `get_total_driving_hours()` - Calculate total driving hours
- `get_total_distance_km()` - Calculate total distance traveled
- `get_total_violations()` - Count total violations
- `vacuum()` - Optimize database size
- `check_integrity()` - Verify database integrity

#### JSON & SQLite (Both)
- `get_log_entries(date)` - Get log entries for a specific date
- `get_violations(date)` - Get violations for a specific date
- `get_inspections(date)` - Get inspections for a specific date
- `get_fuel_stops(date)` - Get fuel stops for a specific date
- `get_daily_log(date)` - Get complete daily log with all data
- `get_logs_range(start, end)` - Get logs for a date range
- `acknowledge_violation(timestamp)` - Mark violation as acknowledged
- `start_trip(origin, cargo)` - Start a new trip
- `end_trip(destination, delivered)` - End current trip
- `get_current_trip()` - Get active trip details

### Features

- **Dual Storage**: Both JSON and SQLite for flexibility
- **Automatic Logging**: ELD engine automatically logs all status changes to both storage backends
- **Thread-Safe**: All storage operations are mutex-protected
- **Daily Rotation**: JSON files are rotated daily
- **Date Querying**: Retrieve logs by date or date range
- **Violation Tracking**: Track and acknowledge HOS violations
- **Trip Management**: Start and end trips with cargo tracking
- **Inspection Checklists**: Complete inspection logging with item details
- **Fuel Tracking**: Comprehensive fuel stop logging with cost calculation
- **Statistics**: Built-in methods for totals and aggregations
- **Automatic Saving**: Logs saved on application shutdown
- **Daily Totals**: Automatic calculation of driving, on-duty, off-duty, and sleeper berth hours

### Dependencies

- **SQLite3**: Required for database storage (most systems include this)
- **CMake**: Automatically finds SQLite3 using `find_package(SQLite3 REQUIRED)`

### Usage

Both storage backends are initialized in the main application:
- JSON storage is always initialized (fallback if directory creation fails)
- SQLite storage is initialized (fallback if database creation fails)
- ELD engine logs to both storage backends simultaneously
- Application gracefully continues if either storage backend fails

### File Structure

```
logs/
├── 2026-10-01.json          # Daily JSON log
├── 2026-10-02.json
├── 2026-10-03.json
└── dowe_electronics.db      # SQLite database
```

Each daily JSON log file contains:
- Daily totals (driving hours, on-duty hours, off-duty hours, sleeper berth hours, distance)
- All status change entries
- Any violations that occurred
- Inspection records
- Fuel stop records

### Usage

The log storage system is automatically integrated with the ELD engine:
- Status changes are automatically logged with timestamps and duration
- Logs are saved to `./logs/` directory as JSON files
- SQLite database is stored as `./logs/dowe_electronics.db`
- Daily rotation ensures manageable JSON file sizes
- Logs are saved automatically on application shutdown
- Logs can be queried by date or date range programmatically
- SQLite provides efficient aggregate queries and statistics

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
- **Radar Detector Accessory**: Installable radar detector with LED indicators
- **Multiple Mount Positions**: Windshield, dashboard, and overhead mounting
- **Truck-Specific Configurations**: Customized for Kenworth W900, Peterbilt 389, Freightliner Cascadia, Volvo VNL
- **Material Definitions**: PBR materials with emissive displays
- **Extensible Design**: Easy to add support for additional trucks

### 3D Models (YOU NEED TO CREATE THESE)

The mod needs 3D models for the ELD tablet and radar detector.

**Good news**: There's a beginner-friendly guide that shows you exactly what to do.

**Open this file**: `scs_mod/model/modeling_guide.md`

This guide tells you:
- Exactly which buttons to click in Blender
- What numbers to type in
- How to create each part of the models
- How to export them

**No Blender experience needed** - it's written for complete beginners.

---

## Quick Start for Creating Models

### Step 1: Download Blender 3.6 (Free)
1. Go to: https://www.blender.org/download/lts/3-6/
2. Download Blender 3.6 LTS
3. Click "Download Blender 3.6"
4. Install it like any other program

⚠️ **IMPORTANT**: You MUST use Blender 3.6 - do NOT use Blender 4.0 or newer! SCS Tools only works with Blender 3.6.

### Step 2: Install the SCS Plugin
1. Open Blender
2. Click **Edit** > **Preferences...**
3. Click **Add-ons** on the left
4. Click **Install...**
5. Download SCS Tools from: https://mods.scssoft.com/ (click Tools > Blender Tools)
6. Select the downloaded file and click **Install Add-on**
7. Check the box next to "SCS Tools"

### Step 3: Follow the Beginner Guide
1. Open: `scs_mod/model/modeling_guide.md`
2. Read "Before You Start" section
3. Follow "PART 1" to create the ELD tablet
4. Follow "PART 2" to create the radar detector

### Step 4: Export Your Models
The guide will show you how to export as .pmd files.

### Step 5: Replace the Placeholders
- Put your new `dowe_eld.pmd` in: `scs_mod/model/eld/`
- Put your new `dowe_radar.pmd` in: `scs_mod/model/radar/`
- Delete the `.pmd.txt` files (they're just instructions)

---

## What the Models Should Look Like

### Fleet Guard ELD Tablet
- Tablet shape (like an iPad)
- Blue bar at top with "FLEET GUARD"
- Navigation bar on left side
- Screen in middle
- Mounting bracket with suction cup

### Road Sentry Radar Detector
- Compact device
- Dark metallic housing
- Glass display
- 5 buttons at bottom (MUTE, VOICE, DIM, SENS, PWR)
- Signal bars and arrows
- Mounting bracket with suction cup

---

## Important: What NOT to Put in the Model

Your 3D model should have the SHAPE and COLORS, but NOT the text.

❌ DON'T put in the model:
- Driver names (like "John Doe")
- Speed numbers (like "65 MPH")
- HOS times
- Location text
- Any changing numbers

✅ DO put in the model:
- The physical shape
- The colors
- The button shapes
- The mounting bracket

The game software will handle the changing text and numbers automatically.

---

## Additional Resources

If you want more detailed technical specifications:
- **ELD Specs**: `scs_mod/model/eld/model_specifications.md`
- **Radar Specs**: `scs_mod/model/radar/model_specifications.md`

But you don't need these if you're following the beginner guide - it has everything you need.

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
