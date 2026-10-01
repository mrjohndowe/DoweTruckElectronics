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

### Next Steps
- ATS telemetry adapter implementation
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

# Future Expansion
Because I'd make this as a framework, future accessories become much easier:
- CB Radio
- Dash Camera
- Tablet GPS
- Backup Camera
- TPMS Monitor
- Electronic Scale Pass
- Weather Radio
- Fleet Messaging
- Qualcomm/Omnitracs terminal
- Weigh station integration
- Dash-mounted camera recorder

![https://r2.fivemanage.com/X1rQph0trZnLIa0o3A2Z7/Ca42af1cNGRV.jpg](https://r2.fivemanage.com/X1rQph0trZnLIa0o3A2Z7/Ca42af1cNGRV.jpg)
