# ELD Tablet Model Specifications

## Overview
The ELD tablet is a sleek, modern electronic logging device mounted in the truck cab. It features a touchscreen display, physical buttons, and a sturdy mounting bracket.

## Dimensions (Scale Units)

### Overall Dimensions
- Width: 200 units
- Height: 120 units
- Depth: 25 units
- Screen Width: 180 units
- Screen Height: 100 units

### Components

#### Main Body
- Rectangular tablet shape with rounded corners (radius: 10 units)
- Dark gray/black plastic housing
- Matte finish surface
- Thickness: 20 units

#### Screen
- Central display area
- Black OLED/LCD panel
- Reflective surface for screen glow
- Slightly recessed (2 units) from bezel
- Screen border: 10 units on all sides

#### Bezel
- Surrounds the screen
- Dark gray plastic
- Matte finish
- Width: 10 units
- Rounded inner corners (radius: 5 units)

#### Buttons
- Physical buttons on right side of device
- 3 buttons (Power, Menu, Select)
- Button size: 15 x 15 units
- Spacing: 5 units between buttons
- Slightly raised (2 units) from body
- Button color: Dark gray with LED indicators

#### Mounting Bracket
- Adjustable arm for windshield/dashboard mounting
- Ball joint at base for adjustability
- Suction cup mount (windshield) or adhesive mount (dashboard)
- Bracket arm: 150 units long, 10 units thick
- Suction cup: 50 units diameter, 5 units thick

#### Cable
- Power/data cable from bottom of device
- 5 units thick
- Curved downward 45 degrees
- Length: 50 units (can be hidden behind dashboard)

## Materials

### Body Plastic
- Color: Dark gray (#2a2a2a)
- Roughness: 0.7
- Metalness: 0.0
- Reflectivity: 0.2

### Screen Panel
- Color: Black (#000000)
- Roughness: 0.3
- Metalness: 0.1
- Emissive: True
- Emissive Color: Blue-gray (#6688aa)
- Emissive Intensity: 0.8

### Bezel
- Color: Dark gray (#333333)
- Roughness: 0.6
- Metalness: 0.0
- Reflectivity: 0.2

### Buttons
- Color: Dark gray (#3a3a3a)
- Roughness: 0.5
- Metalness: 0.0
- Reflectivity: 0.3
- LED: Green for power button when on

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

### Main Body
- Front face: Screen and bezel area
- Back face: Battery compartment, model ID
- Sides: Ports, ventilation
- Top/Bottom: Button areas, cable port

### Screen
- Central area for UI display (textures applied in-game)
- Should have proper UV coordinates for SCS UI system

## Poly Count Target
- Main body: ~500 polygons
- Screen: ~100 polygons
- Buttons: ~150 polygons
- Mounting bracket: ~200 polygons
- Total: ~950 polygons (keep under 2000 for performance)

## LOD (Level of Detail)
- LOD0: Full detail (950 polygons)
- LOD1: Simplified buttons, fewer bracket details (600 polygons)
- LOD2: Basic shape, simplified screen (300 polygons)

## Pivot Points
- Main body: Center of device
- Mounting joint: At base of bracket arm
- Ball joint: Where bracket meets suction cup

## Naming Convention
- Object: `dowe_eld`
- Materials: `mat_dowe_eld_body`, `mat_dowe_eld_screen`, `mat_dowe_eld_buttons`, `mat_dowe_eld_bracket`
- Bones: `bone_body`, `bone_bracket`, `bone_cup`

## Additional Notes
- Screen should be slightly angled upward (15 degrees) for driver visibility
- Mounting bracket should allow rotation and tilt
- Ensure normal map details for buttons and bevels
- Ambient occlusion map for realistic shadows
- Keep scale consistent with SCS truck accessories
