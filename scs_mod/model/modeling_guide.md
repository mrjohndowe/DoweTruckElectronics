# 3D Modeling Guide for Dowe Truck Electronics

This guide provides step-by-step instructions for creating the 3D models for the Fleet Guard ELD tablet and Road Sentry radar detector using Blender with SCS Tools.

## Design Source and Runtime Boundary

**Important:** The modeling instructions in this guide are based on the UI mockup designs in `ui-mockups/src/App.tsx` and `ui-mockups/src/index.css`. The React/Tailwind website is a demo/preview tool for design validation, not the final in-game product.

**What the model should contain:**
- Physical form factor and geometry (housing, screen, buttons, bracket)
- Static branding (Fleet Guard icon, Road Sentry labels)
- Material properties (colors, roughness, metalness, emissive)
- Display screen geometry (as a mesh, not the actual UI content)
- LED indicator geometry (as emissive surfaces)
- Animation nodes/bones for power, brightness, button states

**What should remain software-driven:**
- Dynamic text values (speed, frequency, driver info, HOS data, location)
- Real-time telemetry data (all values from the external application)
- Screen content (UI layouts, tabs, data displays)
- Alert text and status messages
- Navigation state (which tab is active)

The external C++ application will control these dynamic values through the ATS telemetry system or through in-game UI overlays. The .pmd model provides the physical hardware appearance, while the software provides the runtime data.

## Updated Design References

Refer to the updated model specifications for detailed design information:
- **Fleet Guard ELD**: `scs_mod/model/eld/model_specifications.md` - Updated with tablet design, top bar, sidebar navigation, Fleet Guard icon
- **Road Sentry Radar**: `scs_mod/model/radar/model_specifications.md` - Updated with modern housing, ridge, display layout, night mode

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

## Modeling the Fleet Guard ELD Tablet

### Step 1: Main Body
1. Add a Cube (Shift+A > Mesh > Cube)
2. Scale to (11.8, 7.0, 0.25) in meters (based on design proportions)
3. Add Bevel modifier (Width: 0.05, Segments: 3)
4. Apply bevel to create rounded corners (radius 5 units)
5. Adjust scale in object mode if needed
6. Body color: Dark gray (#2a2a2a)

### Step 2: Screen Display Area
1. Add a Plane (Shift+A > Mesh > Plane)
2. Scale to (11.0, 6.0, 0.0) (screen width/height)
3. Position at (0.0, 0.05, 0.11) (slightly in front of body)
4. Subdivide once for more geometry
5. UV unwrap the face (U > Unwrap)
6. Screen background: Light gray (#f4f6f5) when on

### Step 3: Bezel
1. Add a Plane for bezel
2. Scale to (11.8, 7.0, 0.0)
3. Add Boolean modifier: Difference
4. Use screen plane as cutter to create bezel hole
5. Apply Boolean
6. Bezel width: 10 units
7. Bezel color: Dark gray (#10242e for sidebar area)

### Step 4: Top Bar (eld-topbar)
1. Add a Plane for top bar
2. Scale to (11.0, 0.7, 0.0)
3. Position at top of screen area
4. Color: Blue (#0879ad) - this is a key branding element
5. This area will contain Fleet Guard icon, route info, status

### Step 5: Fleet Guard Icon
1. Add a Plane or Cube for icon
2. Scale to (0.34, 0.34, 0.01)
3. Position in top bar left area
4. Color: White background with #0879ad text
5. Shape: Square with rounded corners
6. This is the Fleet Guard branding icon

### Step 6: Navigation Sidebar (eld-nav)
1. Add a Plane for sidebar
2. Scale to (1.54, 5.3, 0.0) (width x height below top bar)
3. Position on left side of screen area
4. Color: Dark blue-gray (#10242e)
5. This area contains navigation buttons

### Step 7: Navigation Button Areas
1. Create 9 small Planes for navigation buttons
2. Scale each to (1.54, 0.41, 0.0)
3. Position vertically in sidebar
4. Spacing: Small gap between buttons
5. These represent button areas ( Duty, Inspect, Info, HOS, Trip log, Fines, Fuel, ATS link, Settings)
6. Do not add actual button geometry - these are touch areas

### Step 8: Driver Section (eld-nav-driver)
1. Add a Plane for driver section
2. Scale to (1.54, 0.5, 0.0)
3. Position at bottom of sidebar
4. Contains avatar circle and driver info
5. Avatar: 27 x 27 unit circle

### Step 9: Content Area (eld-content)
1. The remaining screen area to the right of sidebar
2. This is where dynamic content will be displayed
3. No geometry needed - this is for software-driven UI
4. Just ensure UV mapping covers this area

### Step 10: Status Bar (eld-statusbar)
1. Add a Plane for status bar
2. Scale to (remaining width, 0.28, 0.0)
3. Position at bottom of screen area
4. Color: Light gray (#e8eceb)
5. Contains status indicator, connection status, timestamp

### Step 11: Physical Buttons (Optional)
1. Add 3 Cubes for buttons (if physical buttons are needed)
2. Scale each to (0.15, 0.15, 0.02)
3. Position on right side of body
4. Spacing: 0.05 units between buttons
5. Add slight bevel to buttons
6. Note: The design is primarily touchscreen, buttons are optional

### Step 12: Mounting Bracket
1. Add a Cylinder for bracket arm
2. Scale to (0.15, 1.5, 0.1)
3. Rotate 90 degrees on X-axis
4. Position at bottom center of body
5. Add ball joint: small sphere at end of arm

### Step 13: Suction Cup
1. Add a Cylinder for suction cup
2. Scale to (0.5, 0.05, 0.5)
3. Position at end of bracket arm
4. Add torus for rim (optional, for detail)

### Step 14: Cable
1. Add a Bezier Curve
2. Create curve for cable shape
3. Add Bevel modifier (Depth: 0.02, Resolution: 12)
4. Position at bottom of device
5. Curve downward 45 degrees
6. Length: 50 units

### Step 15: Materials
1. Create materials for each part:
   - mat_dowe_eld_body (dark gray plastic)
   - mat_dowe_eld_screen (light gray, emissive)
   - mat_dowe_eld_bezel (dark gray)
   - mat_dowe_eld_topbar (blue #0879ad, emissive)
   - mat_dowe_eld_sidebar (dark blue-gray)
   - mat_dowe_eld_buttons (dark gray with LED)
   - mat_dowe_eld_bracket (black)
2. Apply colors and roughness per specifications
3. Set screen material to emissive (for screen glow)
4. Set top bar to emissive blue
5. Name materials with dowe_eld prefix

### Step 16: UV Mapping
1. Select screen face
2. U > Unwrap
3. Project from view
4. Adjust UVs to ensure proper coverage of:
   - Top bar area
   - Sidebar area
   - Content area
   - Status bar area
5. Ensure Fleet Guard icon has proper UV for texture

### Step 17: Pivot Points
1. Select main body mesh
2. Set origin to geometry (Right Click > Set Origin > Set Origin to Geometry)
3. Repeat for bracket and suction cup

### Step 18: Export
1. Select all meshes
2. File > Export > SCS .pmd
3. Name: dowe_eld.pmd
4. Save to scs_mod/model/eld/

## Modeling the Road Sentry Radar Detector

### Step 1: Main Housing
1. Add a Cube (Shift+A > Mesh > Cube)
2. Scale to (7.6, 0.85, 0.3) in meters (based on design proportions)
3. Add Bevel modifier (Width: 0.05, Segments: 3)
4. Apply bevel to create rounded corners (23px top, 33px bottom)
5. Housing color: Dark gradient (#2c3337 → #141a1d → #0b0f11)
6. Add Border: 1px solid #3d474c (can be modeled as slight edge)

### Step 2: Ridge at Top
1. Add a Cube or extruded shape for ridge
2. Scale to (5.7, 0.08, 0.02) (75% of body width)
3. Position at top center of housing
4. Ridge color: #536066 (gradient)
5. This adds visual character to the design

### Step 3: Brand Row
1. Add a Plane for brand row area
2. Scale to (7.2, 0.25, 0.0)
3. Position below ridge
4. This area contains "DOWE ROAD SENTRY / R7 / ATS" text
5. Do not model actual text - this will be texture-based
6. Add 3 small cubes for mode buttons (HWY, AUTO, CITY)
7. Button size: ~0.1 x 0.1 units each
8. Spacing: Small gap between buttons

### Step 4: Display Glass
1. Add a Plane for glass cover
2. Scale to (7.2, 2.45, 0.0) (display area)
3. Position in center of housing
4. Glass material: Transparent with slight tint
5. Roughness: 0.1, Reflectivity: 0.9
6. Slightly recessed or flush with housing

### Step 5: Display Panel (Behind Glass)
1. Add a Plane for actual display
2. Scale to (7.0, 2.4, 0.0)
3. Position slightly behind glass
4. Display background: #02070b (night mode)
5. Emissive material for screen glow
6. Border: 1px solid #42515a

### Step 6: Band Indicator Area
1. Add a Plane for band indicator
2. Scale to (2.0, 0.5, 0.0)
3. Position in upper display area
4. This will show band name (KA, K, X, LASER) and frequency
5. No geometry for text - texture-based

### Step 7: Signal Strength Meter
1. Add 7 small Planes for signal segments
2. Scale each to (0.08, 0.15, 0.01)
3. Position vertically in display area
4. Apply emissive materials (color varies by band)
5. X=green (#67e889), K=yellow (#ffb23e), Ka=red (#ff554d), Laser=magenta (#d766ff)
6. Arrange from bottom to top

### Step 8: Directional Arrows
1. Add 3 Mesh objects for arrows
2. Create triangular shapes (use Extrude on Plane)
3. Scale each to (0.2, 0.2, 0.01)
4. Position horizontally in display area
5. Rotate to point in correct direction (left, front, right)
6. Apply emissive white material
7. Inactive arrows should be dimmed

### Step 9: Band Strip
1. Add a Plane for band strip
2. Scale to (7.0, 0.2, 0.0)
3. Position at bottom of display area
4. Shows all 4 bands (X, K, Ka, Laser)
5. Active band highlighted with color
6. No geometry for band labels - texture-based

### Step 10: Speed Display Row
1. Add a Plane for speed display
2. Scale to (7.0, 0.3, 0.0)
3. Position below band strip
4. Border around entire section
5. Shows speed, limit, grade/cruise/parked status
6. No geometry for text - texture-based

### Step 11: Control Buttons (Bottom)
1. Add 5 Cubes for buttons
2. Scale each to (0.12, 0.12, 0.02)
3. Position at bottom of housing
4. Spacing: 0.05 units between buttons
5. Button labels: MUTE, VOICE, DIM, SENS, PWR
6. Button color: Radial gradient from #51432f to #17191a
7. Add slight bevel to buttons
8. Active states have different colors (MUTE=#ff8177, VOICE=#95e4ff, PWR=#a4ffc0)

### Step 12: Footer Row
1. Add a Plane for footer area
2. Scale to (7.0, 0.15, 0.0)
3. Position below buttons
4. Border-top separation
5. Shows sensitivity, location, audio status
6. No geometry for text - texture-based

### Step 13: Shadow (Optional)
1. Add a Plane for shadow
2. Scale to (7.6, 0.55, 0.0)
3. Position at bottom of device
4. Can be baked into texture or use real shadows
5. Blur effect for depth

### Step 14: Mounting Bracket
1. Add a Cylinder for bracket arm
2. Scale to (0.12, 1.2, 0.08)
3. Rotate 90 degrees on X-axis
4. Position at bottom center of housing
5. Add ball joint: small sphere at end of arm

### Step 15: Suction Cup
1. Add a Cylinder for suction cup
2. Scale to (0.45, 0.04, 0.45)
3. Position at end of bracket arm
4. Add torus for rim (optional, for detail)

### Step 16: Cable
1. Add a Bezier Curve
2. Create curve for cable shape
3. Add Bevel modifier (Depth: 0.02, Resolution: 12)
4. Position at bottom right of housing
5. Curve downward 30 degrees
6. Length: 40 units

### Step 17: Materials
1. Create materials for each part:
   - mat_dowe_radar_housing (dark gradient plastic)
   - mat_dowe_radar_ridge (#536066 gradient)
   - mat_dowe_radar_display (dark background, emissive)
   - mat_dowe_radar_glass (transparent)
   - mat_dowe_radar_buttons (radial gradient)
   - mat_dowe_radar_led_x (green #67e889, emissive)
   - mat_dowe_radar_led_k (yellow #ffb23e, emissive)
   - mat_dowe_radar_led_ka (red #ff554d, emissive)
   - mat_dowe_radar_led_laser (magenta #d766ff, emissive)
   - mat_dowe_radar_arrows (white, emissive)
   - mat_dowe_radar_bracket (black)
2. Apply colors and roughness per specifications
3. Set display and LEDs to emissive
4. Set LED colors per band specifications
5. Name materials with dowe_radar prefix

### Step 18: UV Mapping
1. Select display face
2. U > Unwrap
3. Project from view
4. Adjust UVs to ensure proper coverage of:
   - Band indicator area
   - Signal strength meter
   - Directional arrow area
   - Band strip
   - Speed display row
   - Footer row
5. Ensure button labels have proper UV for texture

### Step 19: Pivot Points
1. Select main body mesh
2. Set origin to geometry (Right Click > Set Origin > Set Origin to Geometry)
3. Repeat for bracket and suction cup

### Step 20: Export
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

### Fleet Guard ELD Tablet
- [ ] Main body modeled (rounded corners, 11.8 x 7.0 x 0.25 units)
- [ ] Screen display area (11.0 x 6.0 units)
- [ ] Bezel around screen (10 units width)
- [ ] Top bar modeled (blue #0879ad, 0.7 units height)
- [ ] Fleet Guard icon (34 x 34 unit square with FG text)
- [ ] Navigation sidebar (1.54 units width, dark blue-gray)
- [ ] Navigation button areas (9 touch areas)
- [ ] Driver section at bottom of sidebar
- [ ] Content area (remaining screen space)
- [ ] Status bar at bottom (0.28 units height)
- [ ] Physical buttons (optional, 3 on right side)
- [ ] Mounting bracket with ball joint
- [ ] Suction cup mount
- [ ] Power cable
- [ ] Materials applied (body, screen, bezel, topbar, sidebar, buttons, bracket)
- [ ] UV mapped screen area (top bar, sidebar, content, status bar)
- [ ] Pivot points set
- [ ] LOD0, LOD1, LOD2 created
- [ ] Exported as dowe_eld.pmd
- [ ] Poly count under 2000

### Road Sentry Radar Detector
- [ ] Main housing modeled (7.6 x 0.85 x 0.3 units, rounded)
- [ ] Ridge at top (5.7 units width, 0.08 units height)
- [ ] Brand row with mode buttons (HWY, AUTO, CITY)
- [ ] Display glass (transparent, 7.2 x 2.45 units)
- [ ] Display panel behind glass (dark background)
- [ ] Band indicator area
- [ ] 7-segment signal strength meter (emissive)
- [ ] 3 directional arrows (left, front, right)
- [ ] Band strip (X, K, Ka, Laser)
- [ ] Speed display row with border
- [ ] 5 control buttons (MUTE, VOICE, DIM, SENS, PWR)
- [ ] Footer row (sensitivity, location, audio status)
- [ ] Shadow area (optional)
- [ ] Mounting bracket with ball joint
- [ ] Suction cup mount
- [ ] Power cable
- [ ] Materials applied (housing, ridge, display, glass, buttons, LEDs, bracket)
- [ ] LED colors correct (X=green #67e889, K=yellow #ffb23e, Ka=red #ff554d, Laser=magenta #d766ff)
- [ ] Separate material channels for each LED color
- [ ] UV mapped display area (band, strength, arrows, strip, speed, footer)
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
