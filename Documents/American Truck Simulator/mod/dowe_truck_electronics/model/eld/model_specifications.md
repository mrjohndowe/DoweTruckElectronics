# Fleet Guard ELD Tablet Model Specifications

## Design Reference
This specification is based on the Fleet Guard ELD design from the UI mockup preview (`ui-mockups/src/App.tsx` and `ui-mockups/src/index.css`). The preview website is a design reference only - the actual in-game model should implement the physical form and appearance shown in that design.

**Important:** The React/Tailwind UI mockup is a demo/preview tool. The final in-game implementation will use SCS .pmd models with materials and animation. Dynamic values (driver info, HOS data, trip logs, etc.) should remain software-driven through the external application, not baked into the model.

## Overview
The Fleet Guard ELD is a tablet-style electronic logging device with a dark rugged housing, front glass display, physical buttons, and a sturdy mounting bracket. It features a touchscreen interface with multiple tabs for duty status, HOS, logs, violations, fuel, inspections, and settings.

## Dimensions (Scale Units)

### Overall Dimensions
- Width: 1180 units (max width in design, scaled for SCS)
- Height: 700 units (max height in design, scaled for SCS)
- Depth: 25 units
- Screen Width: 1100 units (display area width)
- Screen Height: 600 units (display area height)

### Components

#### Main Body
- Rectangular tablet shape with rounded corners (radius: 5 units)
- Dark gray/black plastic housing (#f4f6f5 background in day mode)
- Matte finish surface
- Thickness: 20 units
- Border: 1px solid #0a1115
- Box-shadow for depth (can be baked into texture)

#### Screen Display
- Central display area (tablet-screen class)
- Background: #f4f6f5 (day mode)
- Border: 1px solid #0a1115
- Border-radius: 5px
- Box-shadow inset for depth
- Slightly recessed (2 units) from bezel
- Screen border: 10 units on all sides

#### Top Bar (eld-topbar)
- Height: 70 units
- Background: #0879ad (blue)
- Grid layout: brand | route | status
- Padding: 0 24 units
- Color: white text

#### Brand Section (eld-top-brand)
- Fleet Guard icon: 34 x 34 units square with "FG" text
- Icon color: #0879ad on white background
- Brand text: "FLEET GUARD" (strong, 12px font)
- Subtitle: "FOR AMERICAN TRUCK SIMULATOR" (small, 6px font)

#### Route Section (eld-top-route)
- Border-left: 1px solid rgba(255, 255, 255, 0.25)
- Padding-left: 24 units
- Origin label: "ORIGIN" (span, 7px font)
- Destination: "Los Angeles, CA" (strong, 10px font)

#### Status Section (eld-top-status)
- ATS link chip with SVG icon
- Radar status chip with indicator dot
- Status indicators with icons

#### Navigation Sidebar (eld-nav)
- Width: 154 units
- Height: full content area
- Background: #10242e (dark blue-gray)
- Padding-top: 8 units
- Vertical layout

#### Navigation Buttons
- Height: 41 units each
- Gap: 11 units between icon and text
- Text labels: "Duty", "Inspect", "Info", "HOS", "Trip log", "Fines", "Fuel", "ATS link", "Settings"
- Hotkey spans: "1", "2", "3", etc. (8px monospace)
- Active state: White text, left border #e9ef28, background #163847
- Hover state: Lighter background

#### Driver Section (eld-nav-driver)
- Bottom of sidebar
- Avatar: 27 x 27 units circle with initials
- Driver name: "John Doe" (8px font)
- Driver ID: "D-12345" (small, 6px font)
- Sign-out button: "SIGN OUT" (7px font)

#### Content Area (eld-content)
- Main content area (right of sidebar)
- Background: #f4f6f5
- Overflow-y: auto (scrollable)
- Animation: screen-in (fade in, slide up)

#### Status Bar (eld-statusbar)
- Height: 28 units
- Bottom of screen
- Padding: 0 19 units 0 177 units (offset for sidebar)
- Border-top: 1px solid #d1d8d8
- Background: #e8eceb
- Status indicator with green dot
- Connection status text
- Timestamp on right

#### Bezel
- Surrounds the screen
- Dark gray plastic (#10242e for sidebar area)
- Matte finish
- Width: 10 units
- Rounded inner corners (radius: 5 units)

#### Physical Buttons
- Side buttons on right edge of device
- Optional: Power, Menu, Select (if physical buttons needed)
- Button size: 15 x 15 units
- Spacing: 5 units between buttons
- Slightly raised (2 units) from body
- Button color: Dark gray with LED indicators

#### Mounting Bracket
- Adjustable arm for windshield/dashboard/overhead mounting
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
- Color: Dark gray (#2a2a2a) for housing
- Roughness: 0.7
- Metalness: 0.0
- Reflectivity: 0.2

### Screen Panel
- Color: Light gray (#f4f6f5) when on, dark when off
- Roughness: 0.3
- Metalness: 0.1
- Emissive: True
- Emissive Color: Blue-gray (#0879ad for top bar)
- Emissive Intensity: 0.8 when on, 0.0 when off

### Bezel
- Color: Dark gray (#10242e for sidebar area)
- Roughness: 0.6
- Metalness: 0.0
- Reflectivity: 0.2

### Top Bar
- Color: Blue (#0879ad)
- Roughness: 0.4
- Metalness: 0.1
- Emissive: True
- Emissive Color: #0879ad
- Emissive Intensity: 0.6

### Sidebar
- Color: Dark blue-gray (#10242e)
- Roughness: 0.5
- Metalness: 0.0
- Reflectivity: 0.2

### Buttons
- Color: Dark gray (#3a3a3a)
- Roughness: 0.5
- Metalness: 0.0
- Reflectivity: 0.3
- LED: Green for power button when on (#4eca70)
- Active button highlight: Yellow (#e9ef28)

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

### Fleet Guard Icon
- Color: White background with #0879ad text
- Roughness: 0.3
- Metalness: 0.0
- Emissive: False

## UV Mapping

### Main Body
- Front face: Screen and bezel area
- Back face: Battery compartment, model ID, serial number
- Sides: Ports, ventilation, button areas
- Top/Bottom: Cable port, mounting points

### Screen Display
- Top bar area (70 units height)
- Sidebar area (154 units width)
- Content area (remaining space)
- Status bar area (28 units height at bottom)
- Proper UV coordinates for SCS UI system or texture swapping

### Navigation Sidebar
- Button areas for each navigation item
- Driver section at bottom
- Sign-out button area

### Buttons
- Separate UV islands for each button
- Engraved label areas for button labels

## Poly Count Target
- Main body: ~500 polygons
- Screen display: ~200 polygons
- Bezel: ~100 polygons
- Buttons: ~100 polygons
- Mounting bracket: ~200 polygons
- Total: ~1100 polygons (keep under 2000 for performance)

## LOD (Level of Detail)
- LOD0: Full detail (1100 polygons)
- LOD1: Simplified buttons, fewer bracket details, simplified screen geometry (700 polygons)
- LOD2: Basic shape, simplified screen (350 polygons)

## Pivot Points
- Main body: Center of device
- Mounting joint: At base of bracket arm
- Ball joint: Where bracket meets suction cup

## Naming Convention
- Object: `dowe_eld`
- Materials: `mat_dowe_eld_body`, `mat_dowe_eld_screen`, `mat_dowe_eld_bezel`, `mat_dowe_eld_topbar`, `mat_dowe_eld_sidebar`, `mat_dowe_eld_buttons`, `mat_dowe_eld_bracket`
- Bones: `bone_body`, `bone_bracket`, `bone_cup`

## Animation Requirements

The model should support the following animations (defined in SCS .pmd model using SCS animation system):

### Power State
- `power_on`: Screen emissive fades in, display brightens
- `power_off`: Screen emissive fades out, display goes dark
- `boot_sequence`: Quick flash or animation on power-up

### Screen Brightness
- `bright_100`: Display emissive intensity 1.0
- `bright_58`: Display emissive intensity 0.58
- `bright_25`: Display emissive intensity 0.25

### Button States
- `button_press`: Visual feedback when button is pressed (slight depression)
- `led_on`: LED indicators activate
- `led_off`: LED indicators deactivate

### Touch Feedback
- `touch_feedback`: Subtle ripple or highlight on screen touch (optional)

### Bracket Adjustment
- `bracket_tilt`: Rotate screen angle
- `bracket_rotate`: Rotate device around vertical axis
- `bracket_extend`: Extend/retract bracket arm

## Night Mode Considerations
The design includes a night mode with different colors:
- Screen background: Darker (#0c151b vs #f4f6f5 day)
- Text colors: Lighter for readability (white/light gray)
- Sidebar: Darker blue-gray
- Top bar: Slightly muted blue
- Status bar: Darker background
- Emissive intensity: Lower for reduced glare

Create both day and night texture variants or use a single texture with color grading in-game. The model should support emissive intensity changes for night mode.

## Dynamic Values (Software-Driven)
The following values should NOT be baked into the model but should be controlled by the external application:
- Driver name and ID
- Origin and destination
- Duty status (OFF DUTY, ON DUTY, DRIVING, SLEEPER BERTH)
- HOS clock values (driving hours, on-duty hours, etc.)
- Trip log data
- Violation information
- Fuel records
- Inspection status
- ATS link status
- Radar status (clear, alert, off)
- Connection status
- Timestamp
- Active navigation tab
- Content area data (screens for each tab)

These values should be displayed through in-game UI or texture swapping controlled by the external application, not static text on the model.

## Fleet Guard Icon
The Fleet Guard icon should be modeled as:
- A 34 x 34 unit square with rounded corners
- White background
- "FG" text in #0879ad color
- Font weight: 900
- Font size: 11px
- Centered within the icon

This icon appears in the top bar of the display.

## Additional Notes
- The tablet design is rectangular with slight rounded corners
- Top bar is a distinctive blue (#0879ad) - this is a key branding element
- Sidebar navigation is a key UI pattern - ensure geometry supports this layout
- Screen should be slightly angled upward (15 degrees) for driver visibility
- Mounting bracket should allow rotation and tilt
- Ensure normal map details for buttons and bevels
- Ambient occlusion map for realistic shadows
- Keep scale consistent with SCS truck accessories
- The design is tablet-like with a large screen area
- Status bar at bottom is important for connection and status indicators
- Physical buttons are optional - the design is primarily touchscreen
- The model should be accurate to the mockup design but optimized for game performance
