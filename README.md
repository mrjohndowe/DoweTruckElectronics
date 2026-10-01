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

## License

TBD
