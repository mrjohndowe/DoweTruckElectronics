# SCS Telemetry Plugin Installation Guide

This guide explains how to install the SCS Telemetry Plugin to use DoweTruckElectronics with live American Truck Simulator (ATS) or Euro Truck Simulator 2 (ETS2) data.

## What is the SCS Telemetry Plugin?

The SCS Telemetry Plugin is an official plugin from SCS Software that exposes game telemetry data (truck speed, engine state, odometer, etc.) through shared memory. This allows external applications to read real-time truck data.

## Download the Plugin

### Official Source
Download the latest version from the SCS Software modding wiki:
- https://modding.scssoft.com/wiki/Documentation_of_Tools_and_File_Formats/Telemetry

### Direct Download Links
- Windows: https://github.com/RenCloud/scs-telemetry/releases
- Linux/macOS: Available in the same repository

**Note**: As of this writing, the plugin is maintained by the community. Always download from trusted sources.

## Installation Instructions

### Windows

1. **Locate your ATS/ETS2 installation directory:**
   - Steam: Right-click the game in Steam > Properties > Local Files > Browse
   - Default paths:
     - ATS: `C:\Program Files (x86)\Steam\steamapps\common\American Truck Simulator\`
     - ETS2: `C:\Program Files (x86)\Steam\steamapps\common\Euro Truck Simulator 2\`

2. **Extract the plugin files:**
   - Extract the downloaded archive
   - Copy the plugin files to the game directory:
     - Windows: Copy `scs-telemetry.dll` to the game root directory
     - The plugin file should be in the same folder as `amtrucks.exe` (ATS) or `eurotrucks2.exe` (ETS2)

3. **Verify installation:**
   - The plugin file should be next to the game executable
   - No additional configuration is needed

### Linux

1. **Locate your ATS/ETS2 installation directory:**
   - Steam: Right-click the game in Steam > Properties > Local Files > Browse
   - Default paths:
     - ATS: `~/.steam/steam/steamapps/common/American Truck Simulator/`
     - ETS2: `~/.steam/steam/steamapps/common/Euro Truck Simulator 2/`

2. **Extract the plugin files:**
   - Extract the downloaded archive
   - Copy the plugin files to the game directory:
     - Linux: Copy `scs-telemetry.so` to the game root directory
     - The plugin file should be in the same folder as `amtrucks` (ATS) or `eurotrucks2` (ETS2)

3. **Set permissions:**
   ```bash
   chmod +x /path/to/game/scs-telemetry.so
   ```

4. **Verify installation:**
   - The plugin file should be next to the game executable
   - No additional configuration is needed

### macOS

1. **Locate your ATS/ETS2 installation directory:**
   - Steam: Right-click the game in Steam > Properties > Local Files > Browse
   - Default paths:
     - ATS: `~/Library/Application Support/Steam/steamapps/common/American Truck Simulator/`
     - ETS2: `~/Library/Application Support/Steam/steamapps/common/Euro Truck Simulator 2/`

2. **Extract the plugin files:**
   - Extract the downloaded archive
   - Copy the plugin files to the game directory:
     - macOS: Copy `scs-telemetry.dylib` to the game root directory
     - The plugin file should be in the same folder as the game executable

3. **Verify installation:**
   - The plugin file should be next to the game executable
   - No additional configuration is needed

## Verifying the Plugin

### Method 1: Check Shared Memory

The plugin creates a shared memory region that applications can read:

- **Windows**: Named shared memory `Local\SCSTelemetry`
- **Linux/macOS**: Shared memory `/SCSTelemetry`

You can verify the plugin is working by:
1. Starting the game
2. Running DoweTruckElectronics
3. Looking for "Telemetry connected" in the console output

### Method 2: Check Game Console

Some versions of the plugin write to the game console:
1. Start the game
2. Open the console (usually `~` key)
3. Look for telemetry-related messages

## Using with DoweTruckElectronics

### Basic Usage

1. **Start ATS/ETS2** with the plugin installed
2. **Load a save game** (telemetry is only available when in-game)
3. **Run DoweTruckElectronics**:
   ```bash
   # Windows
   .\build\Debug\DoweTruckElectronics.exe

   # Linux/macOS
   ./build/DoweTruckElectronics
   ```
4. **Check the console output**:
   - If connected: "Telemetry connected"
   - If not connected: "Telemetry disconnected" (falls back to simulation)

### Expected Behavior

- **Connected**: Real truck data (speed, engine state, odometer) is used
- **Not Connected**: Simulation mode is used (simulated driving patterns)
- **Game Paused**: Telemetry updates are paused
- **In Menu**: Telemetry is not available

## Troubleshooting

### Plugin Not Loading

**Symptoms**: "Telemetry disconnected" in DoweTruckElectronics

**Solutions**:
1. Verify the plugin file is in the correct directory
2. Check file permissions (Linux/macOS)
3. Ensure the game is running and in a loaded save
4. Try restarting the game
5. Check for antivirus interference (Windows)

### Shared Memory Access Denied

**Symptoms**: Connection errors in DoweTruckElectronics

**Solutions**:
1. Run DoweTruckElectronics with administrator privileges (Windows)
2. Check if another application is using the shared memory
3. Restart both the game and DoweTruckElectronics

### Wrong Game Version

**Symptoms**: Plugin fails to load or crashes

**Solutions**:
1. Ensure the plugin version matches your game version
2. Check the plugin documentation for supported game versions
3. Update the plugin if a newer version is available

### Game Crashes

**Symptoms**: Game crashes when plugin is loaded

**Solutions**:
1. Remove the plugin and verify the game works without it
2. Try a different version of the plugin
3. Check for conflicts with other mods
4. Verify game file integrity through Steam

## Plugin Configuration

The SCS Telemetry Plugin typically does not require configuration. However, some versions may have configuration files:

- **Windows**: `scs-telemetry.ini` in the game directory
- **Linux/macOS**: `.scs-telemetry.ini` in the game directory

Configuration options may include:
- Shared memory name
- Update frequency
- Debug logging

Refer to the plugin documentation for specific configuration options.

## Compatibility

### Game Versions
- American Truck Simulator (ATS): 1.48+
- Euro Truck Simulator 2 (ETS2): 1.48+

### Plugin Version
- Use the latest version compatible with your game version
- Check the plugin release notes for compatibility information

### Operating Systems
- Windows 10/11
- Linux (Ubuntu, Fedora, etc.)
- macOS 10.14+

## Additional Resources

- **SCS Modding Wiki**: https://modding.scssoft.com/
- **SCS Forum**: https://forum.scssoft.com/
- **Telemetry Documentation**: https://modding.scssoft.com/wiki/Documentation_of_Tools_and_File_Formats/Telemetry
- **GitHub Repository**: https://github.com/RenCloud/scs-telemetry

## Safety and Security

- **Download from trusted sources only**
- **Scan downloaded files with antivirus**
- **Check file hashes if provided**
- **Don't use modified or unofficial plugin versions**
- **Report security issues to the plugin maintainers**

## Fallback to Simulation

If the SCS Telemetry Plugin is not installed or cannot be used, DoweTruckElectronics will automatically fall back to simulation mode. This allows you to test the ELD and radar systems without the game.

### Simulation Mode Features
- Simulated driving patterns
- Simulated radar alerts
- All ELD functionality (HOS tracking, status changes)
- All radar functionality (band detection, alerts)
- JSON logging works normally
- SQLite logging works normally (if enabled)

### When to Use Simulation Mode
- Testing without the game
- Developing new features
- Quick verification of functionality
- When the plugin is not available

## Next Steps

After installing the plugin:
1. Install the ATS mod (see `scs_mod/README.md`)
2. Run DoweTruckElectronics with the game running
3. Verify telemetry connection
4. Test ELD and radar functionality in-game
5. Check logs in the `logs/` directory
