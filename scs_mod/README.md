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

The following assets need to be created before the mod is fully functional:

### 3D Models

**Design Reference**: The model specifications are based on the UI mockup designs in `ui-mockups/src/App.tsx` and `ui-mockups/src/index.css`. The React/Tailwind website is a demo/preview tool for design validation, not the final in-game product.

**Model Specifications**:
- **Fleet Guard ELD**: See `model/eld/model_specifications.md` for detailed specifications (updated with tablet design, top bar, sidebar navigation, Fleet Guard icon)
- **Road Sentry Radar**: See `model/radar/model_specifications.md` for detailed specifications (updated with modern housing, ridge, display layout, night mode)
- **Modeling Guide**: See `model/modeling_guide.md` for step-by-step Blender instructions (updated with new design references)

**Important Distinction**:
- The .pmd model provides the physical hardware appearance (geometry, materials, static branding)
- The external application provides runtime data (speed, frequency, driver info, HOS data, location, status)
- Dynamic values should NOT be baked into the model - they remain software-driven through telemetry or UI overlays

The .pmd files are currently placeholders with creation instructions. To create the models:
1. Install Blender with SCS Tools plugin
2. Follow the modeling guide for step-by-step instructions
3. Use the specifications for exact dimensions and details
4. Export as .pmd files
5. Replace the placeholder .pmd.txt files with actual .pmd files

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
