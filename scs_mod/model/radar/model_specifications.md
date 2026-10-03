# Road Sentry Radar Detector Model Specifications

## Design Reference
This specification is based on the Road Sentry radar detector design from the UI mockup preview (`ui-mockups/src/App.tsx` and `ui-mockups/src/index.css`). The preview website is a design reference only - the actual in-game model should implement the physical form and appearance shown in that design.

**Important:** The React/Tailwind UI mockup is a demo/preview tool. The final in-game implementation will use SCS .pmd models with materials and animation. Dynamic values (speed, frequency, signal strength, etc.) should remain software-driven through the external application, not baked into the model.

## Overview
The Road Sentry radar detector is a compact, modern device with a dark metallic housing, rounded profile, raised top ridge, front glass display, and physical control buttons. It features band-specific LEDs, directional arrows, signal strength indicators, and a night mode.

## Dimensions (Scale Units)

### Overall Dimensions
- Width: 760 units (max width in design, scaled for SCS)
- Height: 85 units (calculated from CSS layout)
- Depth: 30 units
- Screen Width: 720 units (display area width)
- Screen Height: 45 units (estimated display height)

### Components

#### Main Housing
- Rounded rectangular body with modern aesthetic
- Dark gradient background (#2c3337 → #141a1d → #0b0f11)
- Border: 1px solid #3d474c
- Border-radius: 23px top, 33px bottom (curved design)
- Padding: 31px (top/bottom), 41px (left/right), 24px (bottom)
- Thickness: 25 units
- Material: Dark metallic plastic with slight texture

#### Ridge at Top
- Raised ridge across top of device
- Height: 8 units
- Width: 75% of body width (570 units)
- Centered horizontally
- Gradient: linear-gradient(90deg, transparent, #536066, transparent)
- Adds visual interest and depth to the design

#### Brand Row
- Located below ridge
- Brand text: "DOWE ROAD SENTRY / R7 / ATS" (or "NIGHT DRIVE" at night)
- Mode buttons: HWY, AUTO, CITY (3 buttons in a row)
- Text hierarchy: "DOWE" (bold), "ROAD SENTRY", "R7", status
- Height: ~25 units
- Controls for sensitivity modes

#### Display Area
- Central OLED/LCD panel with glass cover
- Dark background (#02070b in night mode)
- Border: 1px solid (#42515a in night mode)
- Height: 245 units (from CSS container query)
- Glass bezel around display
- Shows:
  - Band indicator (X, K, Ka, Laser) with frequency
  - Signal strength meter (7-segment vertical bar)
  - Directional arrows (Left, Front, Right)
  - Alert count: "ALERT XX"
  - Status text: "CHP CRUISER", "SPEED TRAP", etc.
  - Speed display: current speed and limit
  - Speed-over indicator with limit difference
  - Grade/cruise/parked status

#### Primary Display Section
- Band indicator: Large band name (KA, K, X, LASER)
- Frequency display: "34.700 GHz / CHP AHEAD"
- Signal strength: 7-segment vertical bar (bars light up based on strength)
- Color-coded bands (X=green #67e889, K=yellow #ffb23e, Ka=red #ff554d, Laser=magenta #d766ff)

#### Directional Arrows
- Three arrows: Left, Front, Right
- Arranged horizontally in a row
- SVG arrow icons, rotate based on direction
- Active arrows light up with band color
- Inactive arrows dimmed

#### Band Strip
- Bottom strip showing all 4 bands
- Active band highlighted with color
- Inactive bands dimmed
- Shows band labels with small icons

#### Speed Display Row
- Speed: Current speed in MPH
- Limit: Speed limit with state abbreviation
- Note: Grade, cruise setting, or parked status
- Over indicator: "OVER +X" when over limit
- Border around entire section
- Visual hierarchy with small/strong/em tags

#### Controls (Bottom)
- 5 buttons in a row:
  1. MUTE (toggle)
  2. VOICE (toggle)
  3. DIM (cycles brightness: 100%, 58%, 25%)
  4. SENS (cycles sensitivity: high, medium, low)
  5. PWR (power toggle)
- Radial gradient background on buttons
- Active state: "MUTE ON", "VOICE ON", "PWR ON"
- Small labels below each button showing state
- Physical button geometry with slight elevation

#### Footer Row
- Three text elements:
  - Sensitivity level: "SENS / HIGH"
  - Location: "I-5 S / OR"
  - Audio status: "AUDIO / TONES + VOICE"
- Border-top separation
- Small font size, uppercase

#### Shadow (Optional)
- Bottom shadow for depth
- Blur effect: 28px blur, 55px height
- Adds 3D appearance to the device

#### Mounting Bracket
- Adjustable arm with ball joint
- Suction cup mount (windshield) or adhesive mount (dashboard)
- Bracket arm: 120 units long, 8 units thick
- Suction cup: 45 units diameter, 4 units thick
- Cable from bottom right

#### Cable
- Power cable from bottom right
- 4 units thick
- Curved downward 30 degrees
- Length: 40 units

## Materials

### Housing Plastic
- Color: Dark gradient #2c3337 → #141a1d → #0b0f11
- Roughness: 0.7
- Metalness: 0.0
- Reflectivity: 0.2
- Emissive: False

### Ridge
- Color: #536066 (gradient)
- Roughness: 0.5
- Metalness: 0.1
- Reflectivity: 0.3
- Emissive: False

### Display Glass
- Color: Transparent with slight tint
- Roughness: 0.1
- Metalness: 0.0
- Reflectivity: 0.9
- Emissive: False
- Transparent: True

### Display Panel (Behind Glass)
- Color: #02070b (night mode)
- Roughness: 0.3
- Metalness: 0.1
- Emissive: True
- Emissive Color: Varies by band (X=#67e889, K=#ffb23e, Ka=#ff554d, Laser=#d766ff)
- Emissive Intensity: 0.6-1.0 depending on brightness

### Buttons
- Color: Radial gradient from #51432f to #17191a 72%
- Roughness: 0.5
- Metalness: 0.2
- Reflectivity: 0.3
- Emissive: False
- Active states: Color changes (MUTE=#ff8177, VOICE=#95e4ff, PWR=#a4ffc0)

### LED Indicators (Separate Material Channels)
- X Band LED: Green (#67e889)
- K Band LED: Yellow (#ffb23e)
- Ka Band LED: Red (#ff554d)
- Laser LED: Magenta (#d766ff)
- Roughness: 0.2
- Metalness: 0.3
- Emissive: True
- Emissive Intensity: 1.0 when active, 0.2 when inactive

### Directional Arrows
- Color: White (#e5f6fb) when active
- Roughness: 0.3
- Metalness: 0.2
- Emissive: True
- Emissive Intensity: 0.8 when active, 0.1 when inactive

### Signal Strength Segments
- Color: Varies by band (match active band color)
- Roughness: 0.3
- Metalness: 0.2
- Emissive: True
- Emissive Intensity: 0.6-1.0 based on strength

### Text/Labels
- Brand: White (#e5f6fb in night mode)
- Display: White/light gray (#d6dde0)
- Labels: Gray (#8b9da4 in night mode)
- Accent colors: Yellow (#ffd79e), Green (#4eca70), Blue (#95e4ff)

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
- Front face: Display area, controls, brand row, ridge
- Back face: Model ID, serial number, ports
- Sides: Ventilation grilles, button sides
- Top/Bottom: Ridge area, control area, cable port

### Display Panel
- Segmented areas for each display element
- Band indicator area
- Signal strength meter (7 segments)
- Directional arrow area
- Speed display area
- Band strip area
- Footer text area

### Buttons
- Separate UV islands for each button
- Engraved label areas for button labels

## Poly Count Target
- Main housing: ~600 polygons
- Ridge: ~50 polygons
- Display panel: ~150 polygons
- Display glass: ~20 polygons
- Buttons: ~100 polygons (5 buttons)
- Directional arrows: ~30 polygons
- Signal strength meter: ~30 polygons
- Mounting bracket: ~150 polygons
- Total: ~1130 polygons (keep under 2000 for performance)

## LOD (Level of Detail)
- LOD0: Full detail (1130 polygons)
- LOD1: Simplified ridge, fewer button details, simplified display (700 polygons)
- LOD2: Basic shape, simplified display, no ridge detail (350 polygons)

## Pivot Points
- Main body: Center of device
- Mounting joint: At base of bracket arm
- Ball joint: Where bracket meets suction cup

## Naming Convention
- Object: `dowe_radar`
- Materials: `mat_dowe_radar_housing`, `mat_dowe_radar_ridge`, `mat_dowe_radar_display`, `mat_dowe_radar_glass`, `mat_dowe_radar_buttons`, `mat_dowe_radar_led_x`, `mat_dowe_radar_led_k`, `mat_dowe_radar_led_ka`, `mat_dowe_radar_led_laser`, `mat_dowe_radar_arrows`, `mat_dowe_radar_bracket`
- Bones: `bone_body`, `bone_bracket`, `bone_cup`

## Animation Requirements

The model should support the following animations (defined in SCS .pmd model using SCS animation system):

### Power State
- `power_on`: Display emissive fades in, LEDs power on sequentially
- `power_off`: Display emissive fades out, LEDs fade out

### Band Alerts
- `alert_x`: X LED activates, display shows X band color
- `alert_k`: K LED activates, display shows K band color
- `alert_ka`: Ka LED activates, display shows Ka band color
- `alert_laser`: Laser LED activates, display shows Laser color
- `alert_clear`: All LEDs deactivate, display returns to idle

### Directional Arrows
- `arrow_left`: Left arrow brightens
- `arrow_front`: Front arrow brightens
- `arrow_right`: Right arrow brightens
- `arrow_none`: All arrows dim

### Signal Strength
- `strength_0` through `strength_7`: Signal meter segments animate
- Each level activates additional segments

### Button States
- `mute_on`: Mute LED activates, button lights up
- `mute_off`: Mute LED deactivates
- `voice_on`: Voice LED activates
- `voice_off`: Voice LED deactivates
- `pwr_on`: Power LED activates
- `pwr_off`: Power LED deactivates

### Screen Brightness
- `bright_100`: Display emissive intensity 1.0
- `bright_58`: Display emissive intensity 0.58
- `bright_25`: Display emissive intensity 0.25

### Mode Buttons
- `mode_hwy`: HWY button active
- `mode_auto`: AUTO button active
- `mode_city`: CITY button active

## Night Mode Considerations
The design includes a night mode with different colors:
- Border: #51525a (vs #3d474c day)
- Display background: #02070b (vs #0b0f11 day)
- Text colors: Lighter for readability
- Button colors: Different gradients for visibility
- Ridge: #6c8290 (vs #536066 day)
- Shadows: Blue tinted (#536066 vs black)

Create both day and night texture variants or use a single texture with color grading in-game. The model should support emissive intensity changes for night mode.

## Dynamic Values (Software-Driven)
The following values should NOT be baked into the model but should be controlled by the external application:
- Speed display (current speed)
- Speed limit display
- Frequency display (exact GHz value)
- Alert count
- Location text (road name, state)
- Status text (CHP CRUISER, SPEED TRAP, etc.)
- Grade, cruise, or parked status
- Over indicator (+X over limit)
- Sensitivity level text
- Audio status text

These values should be displayed through in-game UI or texture swapping controlled by the external application, not static text on the model.

## Additional Notes
- The ridge adds important visual character - model it as a raised detail
- Rounded corners are significant - use subdivision or bevel modifier
- Mode buttons should be subtle but clickable
- Display should be slightly angled upward (15-20 degrees) for driver visibility
- Speed display row has a border - model as a recessed panel
- Footer text is important - ensure UV mapping for these areas
- Shadow can be baked into the texture or use real shadows if performance allows
- The design is more modern/sleek than traditional radar detectors
- Use separate material channels for each LED color to allow independent animation
- Ensure the glass display has proper reflectivity and transparency
- The model should be accurate to the mockup design but optimized for game performance
