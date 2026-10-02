# Radar Detector Model Specifications

## Overview
The radar detector is a compact device with LED displays, directional arrows, and control buttons. It's designed to be mounted on the windshield or dashboard for maximum visibility.

## Dimensions (Scale Units)

### Overall Dimensions
- Width: 150 units
- Height: 80 units
- Depth: 30 units
- Display Width: 130 units
- Display Height: 50 units

### Components

#### Main Housing
- Rectangular body with tapered top
- Dark gray/black plastic case
- Matte finish surface
- Top section angled at 15 degrees for better viewing
- Thickness: 25 units at bottom, 20 units at top

#### Display Area
- Central LED display panel
- Dark background (black OLED)
- Multiple LED segments for band indicators
- Directional arrow indicators
- Signal strength meter (7-segment display)
- Bogey counter display
- Recessed 3 units from housing

#### Band Indicators (Left Side)
- 4 LED indicators: X, K, Ka, Laser
- Each LED: 10 x 10 units
- Spacing: 5 units between LEDs
- Arranged vertically
- Color-matched LEDs (X=green, K=yellow, Ka=red, Laser=magenta)

#### Directional Arrows (Center)
- 3 arrow indicators: Left, Front, Right
- Each arrow: 20 x 20 units
- Triangular shape pointing in respective direction
- Arranged horizontally
- Spacing: 10 units between arrows
- Bright when active, dim when inactive

#### Signal Strength Meter (Right Side)
- 7-segment vertical bar graph
- Each segment: 8 units wide, 4 units tall
- Spacing: 2 units between segments
- Arranged vertically
- Color: Red/amber when active
- Height varies based on signal strength

#### Bogey Counter (Top Right)
- Digital display showing number of alerts
- Size: 20 x 12 units
- Color: Red when alerts present
- Location: Top right of display

#### Control Buttons (Bottom)
- 4 buttons: Mute, Dim, Sensitivity, Power
- Button size: 12 x 12 units each
- Spacing: 5 units between buttons
- Arranged horizontally at bottom
- Slightly raised (2 units) from housing
- Button labels engraved (subtle recess)

#### Mounting Bracket
- Similar to ELD bracket
- Adjustable arm with ball joint
- Suction cup mount (windshield) or adhesive mount (dashboard)
- Bracket arm: 120 units long, 8 units thick
- Suction cup: 45 units diameter, 4 units thick

#### Cable
- Power cable from bottom right
- 4 units thick
- Curved downward 30 degrees
- Length: 40 units

## Materials

### Housing Plastic
- Color: Dark gray (#2a2a2a)
- Roughness: 0.7
- Metalness: 0.0
- Reflectivity: 0.2

### Display Panel
- Color: Black (#000000)
- Roughness: 0.3
- Metalness: 0.1
- Emissive: True
- Emissive Color: Red-orange (#ff6644)
- Emissive Intensity: 0.6

### LED Indicators
- X Band LED: Green (#00ff00)
- K Band LED: Yellow (#ffff00)
- Ka Band LED: Red (#ff0000)
- Laser LED: Magenta (#ff00ff)
- Roughness: 0.2
- Metalness: 0.3
- Emissive: True
- Emissive Intensity: 1.0 when active

### Directional Arrows
- Color: Red (#ff0000)
- Roughness: 0.3
- Metalness: 0.2
- Emissive: True
- Emissive Intensity: 0.8 when active

### Buttons
- Color: Dark gray (#3a3a3a)
- Roughness: 0.5
- Metalness: 0.0
- Reflectivity: 0.3
- Mute button LED: Orange when muted

### Mounting Bracket
- Color: Black (#1a1a1a)
- Roughness: 0.8
- Metalness: 0.2
- Reflectivity: 0.3

### Suction Cup
- Color: Semi-transparent gray (#666666)
- Roughness: 0.9
- Metalness: 0.0
- Reflectivity: 0.1
- Transparent: True

## UV Mapping

### Main Housing
- Front face: Display area, band indicators, arrows, buttons
- Back face: Model ID, serial number, ports
- Sides: Ventilation grilles
- Top/Bottom: Cable port, mounting points

### Display Panel
- Segmented areas for each LED and display element
- Proper UV coordinates for animated textures

## Poly Count Target
- Main housing: ~400 polygons
- Display panel: ~200 polygons
- LED indicators: ~150 polygons
- Directional arrows: ~100 polygons
- Buttons: ~100 polygons
- Mounting bracket: ~150 polygons
- Total: ~1100 polygons (keep under 2000 for performance)

## LOD (Level of Detail)
- LOD0: Full detail (1100 polygons)
- LOD1: Simplified display elements, fewer LED details (700 polygons)
- LOD2: Basic shape, simplified display (400 polygons)

## Pivot Points
- Main body: Center of device
- Mounting joint: At base of bracket arm
- Ball joint: Where bracket meets suction cup

## Naming Convention
- Object: `dowe_radar`
- Materials: `mat_dowe_radar_housing`, `mat_dowe_radar_display`, `mat_dowe_radar_leds`, `mat_dowe_radar_buttons`, `mat_dowe_radar_bracket`
- Bones: `bone_body`, `bone_bracket`, `bone_cup`

## Animation Requirements

The model should support the following animations (defined in SCS .sii files):
- Boot sequence (LEDs power on, display brightens)
- Alert animations (specific LEDs activate)
- Directional arrow animations (arrows brighten)
- Signal strength meter (segments animate)
- Mute indicator (mute LED activates)
- Screen dim/bright (display emissive intensity changes)

## Additional Notes
- Display should be angled upward (20 degrees) for driver visibility
- LEDs should be modeled as actual light-emitting surfaces for emissive materials
- Ensure normal map details for button engravings and display bezels
- Ambient occlusion map for realistic shadows between components
- Keep scale consistent with SCS truck accessories
- The display is not interactive in-game (animated by external application)
