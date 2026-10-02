# Testing Guide for DoweTruckElectronics

This guide provides step-by-step instructions for testing the DoweTruckElectronics system both in simulation mode and with live American Truck Simulator (ATS) data.

## Quick Start (Simulation Mode)

The fastest way to test the system is in simulation mode, which doesn't require ATS to be running.

### Steps

1. **Build the application** (if not already built):
   ```bash
   cd build
   cmake --build .
   ```

2. **Run the application**:
   ```bash
   # Windows
   .\Debug\DoweTruckElectronics.exe

   # Linux/macOS
   ./DoweTruckElectronics
   ```

3. **Observe the output**:
   - The application will run for 30 seconds
   - You'll see real-time status updates
   - Radar alerts will be simulated periodically
   - Logs will be saved to the `logs/` directory

4. **Check the logs**:
   ```bash
   # View the generated JSON log
   cat logs/$(date +%Y-%m-%d).json

   # Or on Windows
   type logs\YYYY-MM-DD.json
   ```

### Expected Output

```
[INFO] Starting Dowe Truck Electronics System
[INFO] JSON log storage initialized
[INFO] Telemetry connected (or disconnected if simulation)
[INFO] Running for 30 seconds...
Speed: 0.0 m/s | Status: OFF_DUTY | Drive Remaining: 11.0 h | Shift Remaining: 14.0 h | Radar Alerts: 0
Speed: 15.0 m/s | Status: DRIVING | Drive Remaining: 10.9 h | Shift Remaining: 13.9 h | Radar Alerts: 1
[INFO] RADAR ALERT: Ka band detected
...
[INFO] Saving JSON logs...
[INFO] Logs saved successfully
[INFO] Shutdown complete
```

## Testing with Live ATS Data

For full in-game testing, you'll need American Truck Simulator (ATS) or Euro Truck Simulator 2 (ETS2) with the SCS Telemetry Plugin installed.

### Prerequisites

1. **Install the SCS Telemetry Plugin** (see `SCS_PLUGIN_GUIDE.md`)
2. **Build the application** (see `BUILD_INSTRUCTIONS.md`)
3. **Have ATS/ETS2 installed and working**

### Steps

1. **Start ATS/ETS2**:
   - Launch the game through Steam
   - Load your profile
   - Enter the game world (not just the menu)

2. **Run DoweTruckElectronics**:
   ```bash
   # Windows
   .\build\Debug\DoweTruckElectronics.exe

   # Linux/macOS
   ./build/DoweTruckElectronics
   ```

3. **Verify connection**:
   - Look for "Telemetry connected" in the console
   - If you see "Telemetry disconnected", the plugin may not be installed correctly

4. **Test ELD functionality**:
   - Start driving in the game
   - Watch the status change from OFF_DUTY to DRIVING
   - Stop the truck and watch status change to ON_DUTY
   - Turn off the engine and watch status change to OFF_DUTY
   - Monitor HOS clocks decreasing

5. **Test radar functionality**:
   - Drive at speed (>5 m/s)
   - Watch for simulated radar alerts
   - Observe bogey counter updates
   - Check signal strength meter

6. **Test manual status override**:
   - (Future feature) Press keys to manually change duty status
   - Verify status changes are logged

7. **Exit the game** and **stop the application**:
   - The application will run for 30 seconds automatically
   - Or press Ctrl+C to exit early

8. **Check the logs**:
   ```bash
   # View the generated JSON log
   cat logs/$(date +%Y-%m-%d).json

   # Or on Windows
   type logs\YYYY-MM-DD.json
   ```

### Expected Behavior with Live Data

When connected to ATS:
- **Speed**: Matches in-game speed (converted to m/s)
- **Status**: Automatically changes based on truck state
- **HOS Clocks**: Decrease based on real time in-game
- **Distance**: Tracked accurately based on game telemetry
- **Logs**: All status changes are recorded with accurate timestamps

## Testing ATS Mod Integration

After building the C++ application, you can test the ATS mod for in-game accessories.

### Prerequisites

1. **Build the application** (completed)
2. **Create 3D models** (see `scs_mod/model/modeling_guide.md`)
3. **Create textures** (see SCS Texture Tools documentation)

### Steps

1. **Prepare the mod**:
   - Create the 3D models for ELD and radar
   - Create textures for materials
   - Replace placeholder files in `scs_mod/`

2. **Install the mod**:
   ```bash
   # Copy the mod to your ATS mods folder
   cp -r scs_mod ~/Library/Application\ Support/American\ Truck\ Simulator/mod/dowe_truck_electronics

   # Or on Windows
   xcopy /E /I scs_mod "Documents\American Truck Simulator\mod\dowe_truck_electronics"
   ```

3. **Enable the mod**:
   - Start ATS
   - Go to Mod Manager
   - Enable "Dowe Truck Electronics"
   - Start the game

4. **Purchase accessories**:
   - Go to a truck accessory shop
   - Look for "Dowe ELD" and "Dowe Radar" accessories
   - Purchase and install them on your truck

5. **Test in-game**:
   - Start driving
   - Verify the ELD tablet appears in the cab
   - Verify the radar detector appears in the cab
   - Check animations (boot sequence, screen brightness)
   - Run the external application and verify it connects

## Testing Specific Features

### ELD Hours of Service (HOS)

1. **Start the application** with the game running
2. **Drive for 10 minutes** in-game
3. **Check the console output**:
   - Drive Remaining should decrease by ~0.17 hours
   - Shift Remaining should decrease by ~0.17 hours
4. **Stop for 5 minutes**:
   - On Duty time should increase
   - Driving clock should pause
5. **Take a 30-minute break**:
   - Check if break timer resets (if implemented)

### Radar Detection

1. **Start the application** with the game running
2. **Drive at highway speed** (>20 m/s)
3. **Watch for radar alerts**:
   - Alerts should appear every 2 seconds (simulated)
   - Bogey counter should increase
   - Signal strength should vary
4. **Slow down** (<5 m/s):
   - Auto-mute should activate (if enabled)
   - Alerts should be suppressed
5. **Check the console**:
   - Voice alert messages should appear
   - Band information should be displayed

### Log Storage

1. **Run the application** for at least 10 seconds
2. **Stop the application**
3. **Check the logs directory**:
   ```bash
   ls logs/
   ```
4. **Verify JSON log exists**:
   ```bash
   cat logs/$(date +%Y-%m-%d).json
   ```
5. **Verify log content**:
   - Should contain status changes
   - Should have timestamps
   - Should have duration and distance
   - Should be valid JSON

### SQLite Database (if enabled)

1. **Build with SQLite support**:
   ```bash
   cmake -DENABLE_SQLITE=ON ..
   cmake --build .
   ```

2. **Run the application**

3. **Check the database**:
   ```bash
   sqlite3 logs/dowe_electronics.db
   .tables
   SELECT * FROM log_entries LIMIT 5;
   ```

4. **Verify database content**:
   - Tables should exist (log_entries, violations, etc.)
   - Data should be present
   - Queries should work

## Performance Testing

### CPU Usage

1. **Run the application** for 5 minutes
2. **Monitor CPU usage**:
   - Windows: Task Manager
   - Linux: `top` or `htop`
   - macOS: Activity Monitor
3. **Expected**: <5% CPU usage (idle simulation mode)

### Memory Usage

1. **Run the application** for 5 minutes
2. **Monitor memory usage**:
   - Windows: Task Manager
   - Linux: `top` or `htop`
   - macOS: Activity Monitor
3. **Expected**: <50 MB memory usage

### Log File Size

1. **Run the application** for 1 hour
2. **Check log file size**:
   ```bash
   ls -lh logs/$(date +%Y-%m-%d).json
   ```
3. **Expected**: <1 MB for 1 hour of normal driving

## Troubleshooting

### Application Won't Start

**Symptoms**: Executable fails to run

**Solutions**:
1. Check if build completed successfully
2. Verify C++ runtime is installed (Windows)
3. Check file permissions (Linux/macOS)
4. Try running from command line to see error messages

### Telemetry Not Connecting

**Symptoms**: "Telemetry disconnected" message

**Solutions**:
1. Verify SCS Telemetry Plugin is installed
2. Ensure ATS/ETS2 is running and in-game
3. Check if another application is using the shared memory
4. Try restarting the game
5. Check firewall/antivirus settings

### Logs Not Being Created

**Symptoms**: No files in `logs/` directory

**Solutions**:
1. Check if application has write permissions
2. Verify the `logs/` directory can be created
3. Check disk space
4. Run with administrator privileges (Windows)

### Radar Alerts Not Appearing

**Symptoms**: No radar alerts during simulation

**Solutions**:
1. Ensure you're driving at speed (>5 m/s)
2. Check if radar engine is initialized
3. Verify alert subscription is working
4. Check console for error messages

### HOS Clocks Not Updating

**Symptoms**: HOS values don't change

**Solutions**:
1. Verify ELD engine is receiving telemetry
2. Check if time delta is being calculated
3. Ensure status is DRIVING for driving clock
4. Check console for status change messages

## Test Checklist

Use this checklist to verify all features are working:

### Basic Functionality
- [ ] Application builds successfully
- [ ] Application runs without crashing
- [ ] Console output is readable
- [ ] Application exits cleanly

### Telemetry
- [ ] Telemetry connects when ATS is running
- [ ] Telemetry falls back to simulation when ATS is not running
- [ ] Speed values are reasonable
- [ ] Status changes based on truck state

### ELD
- [ ] Status changes automatically
- [ ] HOS clocks decrease when driving
- [ ] HOS clocks pause when stopped
- [ ] Status changes are logged
- [ ] Violations are detected (if triggered)

### Radar
- [ ] Radar alerts appear
- [ ] Bogey counter updates
- [ ] Signal strength varies
- [ ] Voice alerts appear in console
- [ ] Auto-mute works at low speed

### Persistence
- [ ] JSON logs are created
- [ ] JSON logs contain valid data
- [ ] Logs are saved on shutdown
- [ ] Daily rotation works (if tested over multiple days)
- [ ] SQLite database works (if enabled)

### Performance
- [ ] CPU usage is reasonable (<5%)
- [ ] Memory usage is reasonable (<50 MB)
- [ ] No memory leaks over extended runtime
- [ ] Application is responsive

## Continuous Testing

For ongoing development, consider:

1. **Automated Tests**: Add unit tests for HOS clock, radar signal processing, etc.
2. **Integration Tests**: Test the full pipeline from telemetry to logging
3. **Regression Tests**: Run after each code change
4. **Performance Tests**: Monitor resource usage over time
5. **User Testing**: Have real truckers test the system

## Reporting Issues

If you encounter issues during testing:

1. **Document the issue**:
   - What you were doing
   - What you expected to happen
   - What actually happened
   - Console output
   - Log files

2. **Check the documentation**:
   - README.md
   - BUILD_INSTRUCTIONS.md
   - SCS_PLUGIN_GUIDE.md

3. **Search for solutions**:
   - Check GitHub issues
   - Search SCS modding forums
   - Check CMake documentation

4. **Report the issue**:
   - Create a GitHub issue
   - Include all documentation
   - Include system information (OS, compiler, etc.)
