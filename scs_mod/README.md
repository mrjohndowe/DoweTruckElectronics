# Dowe Truck Electronics - ATS Mod

This directory contains the American Truck Simulator mod files for the Dowe Truck Electronics system.

## Directory Structure

```
scs_mod/
├── manifest.sii                    # Mod manifest and metadata
├── mod_icon.jpg                   # Mod icon (512x512 JPG)
├── def/
│   ├── company_accessory/         # Generic accessory definitions
│   │   ├── dowe_eld.sii          # ELD tablet accessory
│   │   └── dowe_radar.sii        # Radar detector accessory
│   └── vehicle/
│       ├── dowe_truck_compatibility.sii  # Compatibility reference
│       └── truck/                 # Truck-specific configurations
│           ├── kenworth.w900/accessory/
│           │   ├── dowe_eld.sii
│           │   └── dowe_radar.sii
│           ├── peterbilt.389/accessory/
│           │   ├── dowe_eld.sii
│           │   └── dowe_radar.sii
│           ├── freightliner.cascadia/accessory/
│           │   ├── dowe_eld.sii
│           │   └── dowe_radar.sii
│           └── volvo.vnl/accessory/
│               ├── dowe_eld.sii
│               └── dowe_radar.sii
├── material/model/                 # Material definitions
│   ├── eld/                      # ELD materials
│   │   ├── dowe_eld.mat          # ELD material
│   │   └── dowe_eld.tobj.txt     # Texture placeholder
│   └── radar/                    # Radar materials
│       ├── dowe_radar.mat        # Radar material
│       └── dowe_radar.tobj.txt   # Texture placeholder
└── model/                         # 3D models (to be created)
    ├── eld/                      # ELD models
    │   ├── dowe_eld.pmd.txt     # Model placeholder
    │   └── model_specifications.md
    └── radar/                    # Radar models
        ├── dowe_radar.pmd.txt   # Model placeholder
        └── model_specifications.md
```

## Installation

1. Copy the entire `scs_mod` directory to your ATS mods folder:
   - Windows: `Documents\American Truck Simulator\mod\`
   - Mac: `~/Library/Application Support/American Truck Simulator/mod/`
   - Linux: `~/.local/share/American Truck Simulator/mod/`

2. Rename the folder to `dowe_truck_electronics`

3. Enable the mod in the ATS Mod Manager

4. Start American Truck Simulator

5. Purchase the ELD and/or radar detector from the truck accessory shop

## Required Assets

The following assets need to be created before the mod is fully functional.

### 3D Models (YOU NEED TO CREATE THESE)

**Good news**: There's a beginner-friendly guide that shows you exactly what to do in Blender, step by step.

**Open this file**: `model/modeling_guide.md`

This guide tells you:
- Exactly which buttons to click
- What numbers to type in
- How to create the ELD tablet
- How to create the radar detector
- How to export the models

**No Blender experience needed** - the guide is written for complete beginners.

---

## Quick Start for Creating Models

### Step 1: Download Blender 3.6
1. Go to: https://www.blender.org/download/lts/3-6/
2. Download Blender 3.6 LTS
3. Click "Download Blender 3.6"
4. Install it

⚠️ **IMPORTANT**: You MUST use Blender 3.6 - do NOT use Blender 4.0 or newer! SCS Tools only works with Blender 3.6.

### Step 2: Install the SCS Plugin
1. Open Blender
2. Click **Edit** > **Preferences...**
3. Click **Add-ons** on the left
4. Click **Install...**
5. Download SCS Tools from: https://mods.scssoft.com/ (Tools > Blender Tools)
6. Select the downloaded file and click **Install Add-on**
7. Check the box next to "SCS Tools"

### Step 3: Follow the Guide
1. Open: `model/modeling_guide.md`
2. Read "Before You Start" section
3. Follow "PART 1" to create the ELD tablet
4. Follow "PART 2" to create the radar detector

### Step 4: Export Your Models
The guide will show you how to export as .pmd files.

### Step 5: Replace the Placeholders
- Put your new `dowe_eld.pmd` in: `model/eld/`
- Put your new `dowe_radar.pmd` in: `model/radar/`
- Delete the `.pmd.txt` files (they're just instructions)

---

## What the Models Should Look Like

### Fleet Guard ELD Tablet
- Tablet shape (like an iPad)
- Blue bar at top
- Navigation bar on left
- Screen in middle
- Mounting bracket

### Road Sentry Radar Detector
- Compact device
- Dark housing
- Glass display
- 5 buttons at bottom
- Signal bars and arrows
- Mounting bracket

---

## Important: What NOT to Put in the Model

Your 3D model should have the SHAPE and COLORS, but NOT the text.

❌ DON'T put in the model:
- Driver names
- Speed numbers
- HOS times
- Location text
- Any changing numbers

✅ DO put in the model:
- The physical shape
- The colors
- The button shapes
- The mounting bracket

The game software will handle the changing text and numbers automatically.

### Textures
- `material/model/eld/dowe_eld.tobj` - ELD diffuse texture
- `material/model/eld/dowe_eld_n.tobj` - ELD normal map
- `material/model/eld/dowe_eld_ao.tobj` - ELD ambient occlusion
- `material/model/radar/dowe_radar.tobj` - Radar diffuse texture
- `material/model/radar/dowe_radar_n.tobj` - Radar normal map
- `material/model/radar/dowe_radar_ao.tobj` - Radar ambient occlusion

The .tobj files are currently placeholders with creation instructions. Use SCS Texture Tools to convert DDS textures to .tobj format.

### Icons
- `mod_icon.jpg` - 512x512 pixel mod icon

The mod_icon.jpg is currently a placeholder. Create a 512x512 JPG image for the mod icon.

Use SCS Tools (Blender plugins, TOBJ editor) to create these assets.

## Truck Compatibility

The mod includes truck-specific configurations for the following SCS stock trucks:

### Currently Supported
- **Kenworth W900** - `def/vehicle/truck/kenworth.w900/accessory/`
- **Peterbilt 389** - `def/vehicle/truck/peterbilt.389/accessory/`
- **Freightliner Cascadia** - `def/vehicle/truck/freightliner.cascadia/accessory/`
- **Volvo VNL** - `def/vehicle/truck/volvo.vnl/accessory/`

### Additional Trucks (To Be Added)
- Kenworth T680
- Peterbilt 579
- International Lonestar
- International LT
- Mack Anthem
- Western Star 49X
- Western Star 5700XE

### Adding Support for Additional Trucks

To add support for a new truck:

1. Create the directory structure:
   ```
   def/vehicle/truck/[truck_name]/accessory/
   ```

2. Copy existing configuration files from a supported truck

3. Adjust the accessory names:
   ```sii
   accessory_slot_data: .dowe_eld.[truck_short_name]
   accessory_slot_data: .dowe_radar.[truck_short_name]
   ```

4. Verify and adjust slot names for the specific truck:
   - Check the truck's accessory slot definitions in base game files
   - Common slots: slot_11 (dashboard), slot_12 (windshield), slot_13 (overhead)
   - Slot names may vary by truck model

5. Adjust mount positions (offset and rotation):
   - Test in-game and refine positions
   - Ensure proper visibility and ergonomics
   - Match real-world mounting locations

6. Test the mod in ATS with the new truck

### Mount Positions

Each truck configuration includes three mount options:
- **Windshield** (slot_12): Top center of windshield
- **Dashboard** (slot_11): Center of dashboard
- **Overhead** (slot_13): Overhead console

Positions are approximate and should be adjusted based on actual truck interior layout.

## Integration with External Application

This mod works in conjunction with the external DoweTruckElectronics application:

1. Install the SCS telemetry plugin in ATS
2. Run the DoweTruckElectronics application
3. The application reads telemetry from ATS and processes ELD/radar data
4. The mod displays the devices in the truck interior
5. Both systems work together for complete functionality

## Recent Changes

### Mod Definition Refinements
- Removed inline animation definitions (animations should be in .pmd model files)
- Removed UI definition files (UI integration will be through external application)
- Created truck-specific accessory configurations for 4 major trucks
- Simplified accessory definitions to focus on model and material references
- Added detailed truck compatibility documentation

### Animation System
Animations are now handled through the SCS model system (.pmd files) rather than inline .sii definitions. This is the standard SCS approach for accessory animations.

### UI Integration
The in-game UI definitions have been removed. Display functionality will be provided by the external application through the SCS telemetry system.

## License

TBD
