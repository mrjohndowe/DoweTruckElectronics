# 3D Modeling Guide for Dowe Truck Electronics

This guide provides step-by-step instructions for creating the 3D models for the ELD tablet and radar detector using Blender with SCS Tools.

## Prerequisites

### Software Required
- **Blender 2.93+** (3.0+ recommended)
- **SCS Blender Tools Plugin** (latest version from SCS Software)
- **SCS Texture Tools** (for creating .tobj files)
- **GIMP or Photoshop** (for creating textures)

### Installation
1. Download Blender from https://www.blender.org/download/
2. Install SCS Blender Tools plugin from SCS Software website
3. Enable the plugin in Blender: Edit > Preferences > Add-ons > Install
4. Extract SCS Texture Tools for creating textures

## Getting Started

### Setting Up Blender
1. Open Blender
2. Delete default cube
3. Set units to Metric: Edit > Preferences > Units > Unit System > Metric
4. Enable SCS Tools add-on
5. Set viewport shading to Material Preview

### Understanding SCS Scale
- SCS uses a custom scale where 1 unit ≈ 1 cm
- Truck accessories are typically 200-300 units in size
- Keep poly count under 2000 for performance
- Use proper scaling when importing/exporting

## Modeling the ELD Tablet

### Step 1: Main Body
1. Add a Cube (Shift+A > Mesh > Cube)
2. Scale to (2.0, 1.2, 0.25) in meters
3. Add Bevel modifier (Width: 0.05, Segments: 3)
4. Apply bevel to create rounded corners
5. Adjust scale in object mode if needed

### Step 2: Screen Display
1. Add a Plane (Shift+A > Mesh > Plane)
2. Scale to (1.8, 1.0, 0.0)
3. Position at (0.0, 0.05, 0.11) (slightly in front of body)
4. Subdivide once for more geometry
5. UV unwrap the face (U > Unwrap)

### Step 3: Bezel
1. Add a Plane for bezel
2. Scale to (2.0, 1.2, 0.0)
3. Add Boolean modifier: Difference
4. Use screen plane as cutter to create bezel hole
5. Apply Boolean

### Step 4: Buttons
1. Add 3 Cubes for buttons
2. Scale each to (0.15, 0.15, 0.02)
3. Position on right side of body
4. Spacing: 0.05 units between buttons
5. Add slight bevel to buttons

### Step 5: Mounting Bracket
1. Add a Cylinder for bracket arm
2. Scale to (0.15, 1.5, 0.1)
3. Rotate 90 degrees on X-axis
4. Position at bottom center of body
5. Add ball joint: small sphere at end of arm

### Step 6: Suction Cup
1. Add a Cylinder for suction cup
2. Scale to (0.5, 0.05, 0.5)
3. Position at end of bracket arm
4. Add torus for rim (optional, for detail)

### Step 7: Cable
1. Add a Bezier Curve
2. Create curve for cable shape
3. Add Bevel modifier (Depth: 0.02, Resolution: 12)
4. Position at bottom right of body
5. Curve downward 30 degrees

### Step 8: Materials
1. Create materials for each part (body, screen, buttons, bracket)
2. Apply colors and roughness per specifications
3. Set screen material to emissive (for screen glow)
4. Name materials: mat_dowe_eld_body, mat_dowe_eld_screen, etc.

### Step 9: UV Mapping
1. Select screen face
2. U > Unwrap
3. Project from view
4. Adjust UVs if needed
5. Ensure screen area has proper UV coordinates

### Step 10: Pivot Points
1. Select main body mesh
2. Set origin to geometry (Right Click > Set Origin > Set Origin to Geometry)
3. Repeat for bracket and suction cup

### Step 11: Export
1. Select all meshes
2. File > Export > SCS .pmd
3. Name: dowe_eld.pmd
4. Save to scs_mod/model/eld/

## Modeling the Radar Detector

### Step 1: Main Housing
1. Add a Cube
2. Scale to (1.5, 0.8, 0.25)
3. Add Edge Split modifier (Edge Angle: 20)
4. Apply to create tapered top
5. Add Bevel modifier (Width: 0.03, Segments: 2)

### Step 2: Display Panel
1. Add a Plane
2. Scale to (1.3, 0.5, 0.0)
3. Position at front of housing
4. Subdivide for detail
5. UV unwrap

### Step 3: Band LEDs
1. Add 4 small Planes for LED indicators
2. Scale each to (0.1, 0.1, 0.01)
3. Position vertically on left side
4. Apply materials with emissive colors
5. Name: led_x, led_k, led_ka, led_laser

### Step 4: Directional Arrows
1. Add 3 Mesh objects for arrows
2. Create triangular shapes (use Extrude on Plane)
3. Scale each to (0.2, 0.2, 0.01)
4. Position horizontally in center
5. Rotate to point in correct direction
6. Apply emissive red material

### Step 5: Signal Strength Meter
1. Add 7 small Planes for segments
2. Scale each to (0.08, 0.04, 0.01)
3. Position vertically on right side
4. Apply emissive red material
5. Arrange from bottom to top

### Step 6: Bogey Counter
1. Add a Plane for counter display
2. Scale to (0.2, 0.12, 0.01)
3. Position at top right
4. Apply emissive red material

### Step 7: Control Buttons
1. Add 4 Cubes for buttons
2. Scale each to (0.12, 0.12, 0.02)
3. Position at bottom
4. Spacing: 0.05 units
5. Add slight bevel
6. Add text engraving (subdivision + vertex painting)

### Step 8: Mounting Bracket
1. Similar to ELD bracket
2. Adjust dimensions for radar size
3. Position at bottom center

### Step 9: Materials
1. Create materials: housing, display, leds, buttons, bracket
2. Apply emissive to LEDs and display
3. Set LED colors per specifications
4. Name materials with dowe_radar prefix

### Step 10: Export
1. Select all meshes
2. File > Export > SCS .pmd
3. Name: dowe_radar.pmd
4. Save to scs_mod/model/radar/

## Creating LODs (Level of Detail)

### ELD LOD1
1. Duplicate main model
2. Simplify buttons (reduce from 3 to 1 or merge)
3. Remove bracket details
4. Reduce screen subdivisions
5. Target: ~600 polygons

### ELD LOD2
1. Duplicate main model
2. Simplify to basic box shape
3. Remove buttons and details
4. Basic screen only
5. Target: ~300 polygons

### Radar LOD1 & LOD2
1. Follow same process as ELD
2. Simplify display elements
3. Reduce LED detail
4. Target: 700 and 400 polygons

## Creating Textures

### Using SCS Texture Tools
1. Create textures in GIMP/Photoshop
2. Export as DDS (DirectDraw Surface)
3. Use SCS Texture Tools to convert to .tobj
4. Ensure proper compression (DXT5 for color, BC5 for normal maps)

### ELD Textures
- **Diffuse**: Dark gray plastic, screen area black
- **Normal**: Button details, bevels, recessed screen
- **AO**: Shadows between components

### Radar Textures
- **Diffuse**: Dark housing, display area, button labels
- **Normal**: LED details, arrow shapes, bevels
- **AO**: Shadows between display elements

## Testing in Blender

### Preview
1. Set viewport to Material Preview
2. Check emissive materials (screen glow)
3. Verify scale relative to default cube
4. Check pivot points

### Validation
1. Enable SCS Tools inspector
2. Check poly count
3. Verify material names
4. Ensure proper UV mapping

## Common Issues and Solutions

### Model Not Appearing in Game
- Check file is in correct directory
- Verify .pmd file was exported correctly
- Check material paths in .sii files
- Ensure model is compatible with game version

### Scale Issues
- Models appear too small/large
- Adjust scale in Blender before export
- Check SCS unit settings
- Compare with SCS default accessories

### Materials Not Loading
- Verify .mat file references
- Check .tobj files exist
- Ensure texture paths are correct
- Verify material is defined in .sii

## Final Checklist

### ELD Tablet
- [ ] Main body modeled (rounded corners)
- [ ] Screen display recessed
- [ ] Bezel around screen
- [ ] 3 buttons on right side
- [ ] Mounting bracket with ball joint
- [ ] Suction cup mount
- [ ] Power cable
- [ ] Materials applied (body, screen, buttons, bracket)
- [ ] UV mapped screen area
- [ ] Pivot points set
- [ ] LOD0, LOD1, LOD2 created
- [ ] Exported as dowe_eld.pmd
- [ ] Poly count under 2000

### Radar Detector
- [ ] Main housing with tapered top
- [ ] Display panel recessed
- [ ] 4 band LED indicators
- [ ] 3 directional arrows
- [ ] 7-segment signal strength meter
- [ ] Bogey counter display
- [ ] 4 control buttons
- [ ] Mounting bracket with ball joint
- [ ] Suction cup mount
- [ ] Power cable
- [ ] Materials applied (housing, display, leds, buttons, bracket)
- [ ] LED colors correct (X=green, K=yellow, Ka=red, Laser=magenta)
- [ ] UV mapped display area
- [ ] Pivot points set
- [ ] LOD0, LOD1, LOD2 created
- [ ] Exported as dowe_radar.pmd
- [ ] Poly count under 2000

## Resources

- SCS Software: https://www.scssoft.com/
- SCS Blender Tools: https://mods.scssoft.com/
- Blender: https://www.blender.org/
- SCS Modding Wiki: https://modding.scssoft.com/wiki
- SCS Forum: https://forum.scssoft.com/

## Tips for Better Models

1. **Keep it simple**: Lower poly count = better performance
2. **Use references**: Look at real devices for accuracy
3. **Test scale**: Compare with default accessories
4. **UV mapping**: Keep UVs clean and distortion-free
5. **Normals**: Use normal maps for detail, not geometry
6. **AO maps**: Add ambient occlusion for realism
7. **Iterate**: Test in-game, refine as needed

## Support

For issues or questions:
- Check SCS Modding Wiki
- Ask in SCS Forum
- Review SCS documentation
- Test with different truck models
