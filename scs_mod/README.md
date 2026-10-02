# Dowe Truck Electronics - ATS Mod

This directory contains the American Truck Simulator mod files for the Dowe Truck Electronics system.

## Directory Structure

```
scs_mod/
├── manifest.sii                    # Mod manifest and metadata
├── mod_icon.jpg                   # Mod icon (512x512 JPG)
├── def/
│   ├── company_accessory/         # Accessory definitions
│   │   ├── dowe_eld.sii          # ELD tablet accessory
│   │   └── dowe_radar.sii        # Radar detector accessory
│   ├── vehicle/                   # Vehicle-specific configurations
│   │   ├── dowe_animations.sii   # Animation definitions
│   │   └── dowe_truck_accessory_config.sii  # Accessory config template
│   └── ui/                        # UI definitions
│       ├── eld_screen.sii        # ELD display UI
│       └── radar_screen.sii       # Radar display UI
├── material/model/                 # Material definitions
│   ├── eld/                      # ELD materials
│   │   ├── dowe_eld.mat          # ELD material
│   │   └── dowe_eld.tobj.txt     # Texture placeholder
│   └── radar/                    # Radar materials
│       ├── dowe_radar.mat        # Radar material
│       └── dowe_radar.tobj.txt   # Texture placeholder
├── model/                         # 3D models (to be created)
│   ├── eld/                      # ELD models
│   └── radar/                    # Radar models
└── ui/                            # UI assets (to be created)
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

**Note**: Detailed specifications and modeling guides are provided for creating the models:

- **ELD Tablet**: See `model/eld/model_specifications.md` for detailed specifications
- **Radar Detector**: See `model/radar/model_specifications.md` for detailed specifications
- **Modeling Guide**: See `model/modeling_guide.md` for step-by-step Blender instructions

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

The mod is designed to work with all SCS stock trucks:
- Kenworth W900
- Kenworth T680
- Peterbilt 389
- Peterbilt 579
- Freightliner Cascadia
- Volvo VNL
- International Lonestar
- Mack Anthem
- Western Star 49X

Mod trucks can be supported by creating appropriate accessory configuration files.

## Integration with External Application

This mod works in conjunction with the external DoweTruckElectronics application:

1. Install the SCS telemetry plugin in ATS
2. Run the DoweTruckElectronics application
3. The application reads telemetry from ATS and processes ELD/radar data
4. The mod displays the devices in the truck interior
5. Both systems work together for complete functionality

## License

TBD
