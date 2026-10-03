# 3D Modeling Guide for Dowe Truck Electronics (Beginner-Friendly)

This guide shows you exactly how to create the 3D models for the Fleet Guard ELD tablet and Road Sentry radar detector using Blender. Every step is written out clearly - no previous Blender experience needed.

## ⚠️ CRITICAL: Use Blender 3.6 Only

**You MUST use Blender 3.6** - this is the only version that works with the latest SCS Tools plugin.

❌ **Do NOT use Blender 4.0, 4.1, 4.2, or any newer version** - they will NOT work with SCS Tools!

✅ **Download Blender 3.6 LTS here**: https://www.blender.org/download/lts/3-6/

This is a known limitation of the SCS Tools plugin. If you try to use a newer version of Blender, the SCS Tools plugin will not install or will not work correctly.

## Before You Start

### What You Need to Download

**IMPORTANT**: You must use Blender 3.6 - this is the only version that works with the latest SCS Tools plugin.

1. **Blender 3.6** (free 3D software)
   - Go to: https://www.blender.org/download/lts/3-6/
   - Download Blender 3.6 LTS (Long Term Support)
   - Click the big "Download Blender 3.6" button
   - Install it like any other program
   - Open Blender 3.6 when it's done installing

   ⚠️ **Do NOT use a newer version** (like 4.0, 4.1, 4.2, etc.) - they will NOT work with SCS Tools!

2. **SCS Blender Tools Plugin** (required for exporting to ATS)
   - Go to: https://mods.scssoft.com/
   - Click "Tools" in the top menu
   - Click "Blender Tools"
   - Download the latest version
   - Save it somewhere you can find it (like your Downloads folder)

### Install the SCS Plugin

1. Open Blender
2. In the top menu, click **Edit**
3. Click **Preferences...**
4. On the left side, click **Add-ons**
5. At the top, click **Install...**
6. Find the SCS Blender Tools file you downloaded (it ends in .zip)
7. Click it, then click **Install Add-on**
8. Find "SCS Tools" in the list and check the box next to it
9. Close the Preferences window

### Set Up Blender for SCS Models

1. Look at the right side of the Blender window - you'll see a panel with tabs
2. Click the tab that looks like a triangle or cone (this is the Scene Properties tab - it's next to the red material ball icon)
3. Scroll down until you see a section called "Units"
4. Under "Unit System", click the dropdown and select **Metric**
5. In the top-right corner of the 3D view, you'll see 4 circular buttons next to each other
6. Click the **third circle from the left** (this is Material Preview - it has a blue/gray circle inside)

**Note**: In older Blender versions, Units was in Preferences. In Blender 3.6, it's in the Scene Properties panel on the right.

### Delete the Default Cube

When Blender opens, there's a cube in the middle. We don't need it.

1. Click on the cube to select it (it will have an orange outline)
2. Press the **X** key on your keyboard
3. Click **Delete** in the popup

## Important: Design Reference

The models you're making are based on the design preview in the `ui-mockups` folder. That website is just a design demo - your 3D model will be the actual thing that appears in the game.

**Your model provides:**
- The physical shape (housing, screen, buttons)
- The colors and materials
- The branding (Fleet Guard icon, Road Sentry labels)

**The game software provides:**
- The changing numbers (speed, driver info, HOS data)
- The live status messages
- The real-time data

Don't try to put text like "John Doe" or "65 MPH" into your 3D model - the game will handle that.

---

# PART 1: Create the Fleet Guard ELD Tablet

## Step 1: Create the Main Body

1. In the 3D view, move your mouse to the center
2. Press **Shift + A** on your keyboard
3. Click **Mesh**
4. Click **Cube**
5. A cube appears in the center

Now we need to size it correctly:

6. Make sure the cube is selected (orange outline)
7. Press **N** on your keyboard to open the properties panel on the right
8. In the panel that appears, find "Dimensions"
9. Change the X value to: `11.8`
10. Change the Y value to: `7.0`
11. Change the Z value to: `0.25`
12. Press **N** again to close the panel

Now let's round the corners:

13. With the cube still selected, look at the bottom of the window for tabs - click the one that says **Modifiers** (blue wrench icon)
14. Click **Add Modifier**
15. Click **Bevel**
16. In the modifier settings:
    - Change "Width" to: `0.05`
    - Change "Segments" to: `3`
17. At the top of the modifier, click the **Apply** button (checkmark icon)

## Step 2: Create the Screen Display

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. A flat square appears

Size it for the screen:

5. Press **N** to open the properties panel
6. Change Dimensions:
   - X: `11.0`
   - Y: `6.0`
   - Z: `0.0`
7. Press **N** to close

Position it in front of the body:

8. Press **N** again
9. Find "Location"
10. Change Y to: `0.05`
11. Change Z to: `0.11`
12. Press **N** to close

Add more detail to the screen:

13. Right-click on the plane to select it
14. Press **Tab** to enter Edit Mode (you'll see the dots/vertices)
15. Press **Ctrl + 2** on your keyboard (this is the shortcut for Subdivide)
   - **Alternative**: Right-click in the 3D view, click "Subdivide" in the menu that appears
16. Press **Tab** to exit Edit Mode

## Step 3: Create the Bezel (Frame Around Screen)

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `11.8`
   - Y: `7.0`
   - Z: `0.0`
5. Press **N** to close

Cut a hole for the screen:

6. Make sure this new plane is selected
7. Go to the **Modifiers** tab
8. Click **Add Modifier**
9. Click **Boolean**
10. In the modifier settings:
    - Click the dropdown that says "Difference" - make sure it says "Difference"
    - Under "Object", click the dropdown and select the screen plane (probably called "Plane.001")
11. Click **Apply**

Now delete the screen plane (we'll make a new one):

12. Right-click the screen plane to select it
13. Press **X**
14. Click **Delete**

## Step 4: Create the Top Bar (Blue Branding Area)

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `11.0`
   - Y: `0.7`
   - Z: `0.0`
5. Press **N** to close

Position it at the top:

6. Press **N**
7. Under "Location", change:
   - Y: `0.05`
   - Z: `2.65` (this puts it at the top of the screen area)
8. Press **N** to close

## Step 5: Create the Fleet Guard Icon

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Cube**
4. Press **N** and set Dimensions:
   - X: `0.34`
   - Y: `0.34`
   - Z: `0.01`
5. Press **N** to close

Position it in the top bar:

6. Press **N**
7. Under "Location", change:
   - X: `-4.5` (to the left side)
   - Y: `0.06` (slightly in front of top bar)
   - Z: `2.65` (same height as top bar)
8. Press **N** to close

Round the corners:

9. Go to **Modifiers** tab
10. Click **Add Modifier**
11. Click **Bevel**
12. Set Width to: `0.02`
13. Set Segments to: `2`
14. Click **Apply**

## Step 6: Create the Navigation Sidebar

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `1.54`
   - Y: `5.3`
   - Z: `0.0`
5. Press **N** to close

Position it on the left:

6. Press **N**
7. Under "Location", change:
   - X: `-4.73` (left side of screen)
   - Y: `0.06`
   - Z: `0.3` (below the top bar)
8. Press **N** to close

## Step 7: Create Navigation Button Areas

We'll create 9 small rectangles for the buttons. You can duplicate the first one:

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `1.54`
   - Y: `0.41`
   - Z: `0.0`
5. Press **N** to close

Position the first button:

6. Press **N**
7. Under "Location", change:
   - X: `-4.73`
   - Y: `0.07`
   - Z: `2.0`
8. Press **N** to close

Duplicate for the other 8 buttons:

9. Right-click the button to select it
10. Press **Shift + D** (this duplicates it)
11. Press **G** then **Y** to move it down
12. Move your mouse down until it's below the first button
13. Click to place it
14. Repeat steps 9-13 until you have 9 buttons stacked vertically

## Step 8: Create the Driver Section

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `1.54`
   - Y: `0.5`
   - Z: `0.0`
5. Press **N** to close

Position at bottom of sidebar:

6. Press **N**
7. Under "Location", change:
   - X: `-4.73`
   - Y: `0.07`
   - Z: `-2.3`
8. Press **N** to close

Create the avatar circle:

9. Press **Shift + A**
10. Click **Mesh**
11. Click **Cylinder**
12. Press **N** and set Dimensions:
    - X: `0.27`
    - Y: `0.27`
    - Z: `0.01`
13. Under "Location", change:
    - X: `-4.73`
    - Y: `0.08`
    - Z: `-2.3`
14. Press **N** to close

## Step 9: Create the Status Bar

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `9.0` (width minus sidebar)
   - Y: `0.28`
   - Z: `0.0`
5. Press **N** to close

Position at bottom:

6. Press **N**
7. Under "Location", change:
   - X: `2.0` (to the right of sidebar)
   - Y: `0.07`
   - Z: `-2.9`
8. Press **N** to close

## Step 10: Create Physical Buttons (Optional)

If you want physical buttons on the side:

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Cube**
4. Press **N** and set Dimensions:
   - X: `0.15`
   - Y: `0.15`
   - Z: `0.02`
5. Press **N** to close

Position on right side:

6. Press **N**
7. Under "Location", change:
   - X: `5.8`
   - Y: `0.13`
   - Z: `1.0`
8. Press **N** to close

Round the button:

9. Go to **Modifiers** tab
10. Click **Add Modifier**
11. Click **Bevel**
12. Set Width to: `0.01`
13. Click **Apply**

Duplicate for 2 more buttons (repeat the duplicate process from step 7).

## Step 11: Create the Mounting Bracket

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Cylinder**
4. Press **N** and set Dimensions:
   - X: `0.15`
   - Y: `1.5`
   - Z: `0.1`
5. Press **N** to close

Rotate it:

6. Press **R** then **X** (rotates around X axis)
7. Type: `90` and press **Enter**

Position it:

8. Press **N**
9. Under "Location", change:
   - X: `0`
   - Y: `-0.13`
   - Z: `-3.5`
10. Press **N** to close

Add the ball joint:

11. Press **Shift + A**
12. Click **Mesh**
13. Click **UV Sphere**
14. Press **N** and set Dimensions:
    - X: `0.2`
    - Y: `0.2`
    - Z: `0.2`
15. Under "Location", change:
    - X: `0`
    - Y: `-0.88`
    - Z: `-3.5`
16. Press **N** to close

## Step 12: Create the Suction Cup

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Cylinder**
4. Press **N** and set Dimensions:
   - X: `0.5`
   - Y: `0.05`
   - Z: `0.5`
5. Press **N** to close

Position it:

6. Press **N**
7. Under "Location", change:
   - X: `0`
   - Y: `-1.63`
   - Z: `-3.5`
8. Press **N** to close

## Step 13: Create the Cable

1. Press **Shift + A**
2. Click **Curve**
3. Click **Bezier**
4. A curved line appears

Shape the cable:

5. Press **Tab** to enter Edit Mode
6. Right-click on the points and move them to shape a curve going down and to the right
7. Press **Tab** to exit Edit Mode

Give it thickness:

8. Go to **Modifiers** tab
9. Click **Add Modifier**
10. Click **Bevel**
11. Set "Depth" to: `0.02`
12. Set "Resolution" to: `12`

Position it:

13. Press **N**
14. Under "Location", change:
    - X: `3.0`
    - Y: `-0.13`
    - Z: `-3.5`
15. Press **N** to close

## Step 14: Apply Materials

Now we need to give everything colors. First, let's create the materials:

1. In the right panel, click the **Material Properties** tab (red circle icon)
2. Click **+ New** to create a new material
3. In the "Base Color" box, click the color and set it to: Dark Gray (#2a2a2a)
4. In the name box at the top, rename it to: `mat_dowe_eld_body`
5. Click the main body cube to select it
6. In the materials panel, click **Assign**

Create the screen material:

7. Click **+ New**
8. Set Base Color to: Light Gray (#f4f6f5)
9. Rename to: `mat_dowe_eld_screen`
10. Scroll down to "Emission"
11. Check the box next to "Emission"
12. Set Emission Color to: Blue (#0879ad)
13. Set Emission Strength to: `0.8`
14. Click the screen plane to select it
15. Click **Assign**

Create the bezel material:

16. Click **+ New**
17. Set Base Color to: Dark Gray (#10242e)
18. Rename to: `mat_dowe_eld_bezel`
19. Click the bezel plane to select it
20. Click **Assign**

Create the top bar material:

21. Click **+ New**
22. Set Base Color to: Blue (#0879ad)
23. Rename to: `mat_dowe_eld_topbar`
24. Scroll down to "Emission"
25. Check the box next to "Emission"
26. Set Emission Color to: Blue (#0879ad)
27. Set Emission Strength to: `0.6`
28. Click the top bar plane to select it
29. Click **Assign**

Create the sidebar material:

30. Click **+ New**
31. Set Base Color to: Dark Blue-Gray (#10242e)
32. Rename to: `mat_dowe_eld_sidebar`
33. Click the sidebar plane to select it
34. Click **Assign**

Create the Fleet Guard icon material:

35. Click **+ New**
36. Set Base Color to: White (#ffffff)
37. Rename to: `mat_dowe_eld_icon`
38. Click the icon cube to select it
39. Click **Assign**

Create the button material:

40. Click **+ New**
41. Set Base Color to: Dark Gray (#3a3a3a)
42. Rename to: `mat_dowe_eld_buttons`
43. Click all the physical buttons to select them (hold Shift while clicking)
44. Click **Assign**

Create the bracket material:

45. Click **+ New**
46. Set Base Color to: Black (#1a1a1a)
47. Rename to: `mat_dowe_eld_bracket`
48. Click the bracket arm and ball joint to select them
49. Click **Assign**

Create the suction cup material:

50. Click **+ New**
51. Set Base Color to: Gray (#666666)
52. Scroll down to "Transmission"
53. Set "Transmission" to: `0.5` (makes it semi-transparent)
54. Rename to: `mat_dowe_eld_suction`
55. Click the suction cup to select it
56. Click **Assign**

Create the cable material:

57. Click **+ New**
58. Set Base Color to: Black (#1a1a1a)
59. Rename to: `mat_dowe_eld_cable`
60. Click the cable to select it
61. Click **Assign**

## Step 15: UV Map the Screen

1. Right-click the screen plane to select it
2. Press **Tab** to enter Edit Mode
3. Press **A** to select all vertices
4. Press **U** on your keyboard
5. Click **Unwrap**
6. Press **Tab** to exit Edit Mode

## Step 16: Set Pivot Points

1. Right-click the main body cube to select it
2. In the top menu, click **Object**
3. Click **Set Origin**
4. Click **Origin to Geometry**

Repeat for the bracket:

5. Right-click the bracket arm to select it
6. Click **Object** > **Set Origin** > **Origin to Geometry**

Repeat for the suction cup:

7. Right-click the suction cup to select it
8. Click **Object** > **Set Origin** > **Origin to Geometry**

## Step 17: Export the Model

1. In the top menu, click **File**
2. Click **Export**
3. Click **SCS (.pmd)**
4. In the file browser:
   - Navigate to your project folder
   - Go to: `scs_mod/model/eld/`
   - In the "File Name" box, type: `dowe_eld.pmd`
5. Click the **Export SCS .pmd** button

## Step 18: Create LOD Versions (Optional but Recommended)

LOD = Level of Detail (simpler versions for far away)

### Create LOD1:

1. In the top menu, click **File**
2. Click **Save As...**
3. Name it: `dowe_eld_lod1.blend`
4. Click **Save**
5. Delete or simplify the physical buttons (keep 1 or merge them)
6. Simplify the bracket (remove the ball joint detail)
7. Follow Step 17 to export as: `dowe_eld_lod1.pmd`

### Create LOD2:

1. In the top menu, click **File**
2. Click **Save As...**
3. Name it: `dowe_eld_lod2.blend`
4. Click **Save**
5. Delete all buttons and details
6. Simplify to just the basic body shape
7. Follow Step 17 to export as: `dowe_eld_lod2.pmd`

---

# PART 2: Create the Road Sentry Radar Detector

## Step 1: Create the Main Housing

1. In Blender, press **Shift + A**
2. Click **Mesh**
3. Click **Cube**
4. Press **N** and set Dimensions:
   - X: `7.6`
   - Y: `0.85`
   - Z: `0.3`
5. Press **N** to close

Round the corners:

6. Go to **Modifiers** tab
7. Click **Add Modifier**
8. Click **Bevel**
9. Set Width to: `0.05`
10. Set Segments to: `3`
11. Click **Apply**

## Step 2: Create the Ridge at Top

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Cube**
4. Press **N** and set Dimensions:
   - X: `5.7`
   - Y: `0.08`
   - Z: `0.02`
5. Press **N** to close

Position it:

6. Press **N**
7. Under "Location", change:
   - X: `0`
   - Y: `0.17`
   - Z: `0.15`
8. Press **N** to close

## Step 3: Create the Brand Row

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `7.2`
   - Y: `0.25`
   - Z: `0.0`
5. Press **N** to close

Position it:

6. Press **N**
7. Under "Location", change:
   - X: `0`
   - Y: `0.13`
   - Z: `0.1`
8. Press **N** to close

Create mode buttons (3 small cubes):

9. Press **Shift + A**
10. Click **Mesh**
11. Click **Cube**
12. Press **N** and set Dimensions:
    - X: `0.1`
    - Y: `0.1`
    - Z: `0.02`
13. Press **N** to close

Position first button:

14. Press **N**
15. Under "Location", change:
    - X: `-0.15`
    - Y: `0.14`
    - Z: `0.1`
16. Press **N** to close

Duplicate for 2 more buttons:

17. Right-click the button
18. Press **Shift + D**
19. Press **G** then **X**
20. Move to the right and click
21. Repeat once more for the third button

## Step 4: Create the Display Glass

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `7.2`
   - Y: `2.45`
   - Z: `0.0`
5. Press **N** to close

Position it:

6. Press **N**
7. Under "Location", change:
   - X: `0`
   - Y: `0.13`
   - Z: `-0.1`
8. Press **N** to close

## Step 5: Create the Display Panel (Behind Glass)

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `7.0`
   - Y: `2.4`
   - Z: `0.0`
5. Press **N** to close

Position it:

6. Press **N**
7. Under "Location", change:
   - X: `0`
   - Y: `0.12`
   - Z: `-0.1`
8. Press **N** to close

## Step 6: Create Signal Strength Meter (7 Segments)

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `0.08`
   - Y: `0.15`
   - Z: `0.0`
5. Press **N** to close

Position first segment:

6. Press **N**
7. Under "Location", change:
   - X: `2.5`
   - Y: `0.14`
   - Z: `0.1`
8. Press **N** to close

Duplicate for 6 more segments:

9. Right-click the segment
10. Press **Shift + D**
11. Press **G** then **Z**
12. Move up and click
13. Repeat until you have 7 segments stacked vertically

## Step 7: Create Directional Arrows (3 Arrows)

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **Tab** to enter Edit Mode
5. Press **1** to select vertex mode
6. Right-click and delete 2 vertices to make a triangle
7. Press **Tab** to exit Edit Mode
8. Press **N** and set Dimensions:
   - X: `0.2`
   - Y: `0.2`
   - Z: `0.0`
9. Press **N** to close

Position left arrow:

10. Press **N**
11. Under "Location", change:
    - X: `-1.0`
    - Y: `0.14`
    - Z: `0.0`
12. Under "Rotation", change X to: `90`
13. Press **N** to close

Duplicate for front and right arrows:

14. Right-click the arrow
15. Press **Shift + D**
16. Press **G** then **X**
17. Move to center (X: 0) and click
18. Duplicate again
19. Move to right (X: 1.0)

## Step 8: Create the Band Strip

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `7.0`
   - Y: `0.2`
   - Z: `0.0`
5. Press **N** to close

Position it:

6. Press **N**
7. Under "Location", change:
   - X: `0`
   - Y: `0.14`
   - Z: `-1.0`
8. Press **N** to close

## Step 9: Create the Speed Display Row

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `7.0`
   - Y: `0.3`
   - Z: `0.0`
5. Press **N** to close

Position it:

6. Press **N**
7. Under "Location", change:
   - X: `0`
   - Y: `0.14`
   - Z: `-1.3`
8. Press **N** to close

## Step 10: Create Control Buttons (5 Buttons)

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Cube**
4. Press **N** and set Dimensions:
   - X: `0.12`
   - Y: `0.12`
   - Z: `0.02`
5. Press **N** to close

Position first button:

6. Press **N**
7. Under "Location", change:
   - X: `-0.2`
   - Y: `0.13`
   - Z: `-0.5`
8. Press **N** to close

Round it:

9. Go to **Modifiers** tab
10. Click **Add Modifier**
11. Click **Bevel**
12. Set Width to: `0.01`
13. Click **Apply**

Duplicate for 4 more buttons:

14. Right-click the button
15. Press **Shift + D**
16. Press **G** then **X**
17. Move to the right and click
18. Repeat until you have 5 buttons

## Step 11: Create the Footer Row

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Plane**
4. Press **N** and set Dimensions:
   - X: `7.0`
   - Y: `0.15`
   - Z: `0.0`
5. Press **N** to close

Position it:

6. Press **N**
7. Under "Location", change:
   - X: `0`
   - Y: `0.13`
   - Z: `-0.7`
8. Press **N** to close

## Step 12: Create the Mounting Bracket

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Cylinder**
4. Press **N** and set Dimensions:
   - X: `0.12`
   - Y: `1.2`
   - Z: `0.08`
5. Press **N** to close

Rotate it:

6. Press **R** then **X**
7. Type: `90` and press **Enter**

Position it:

8. Press **N**
9. Under "Location", change:
   - X: `0`
   - Y: `-0.15`
   - Z: `-0.43`
10. Press **N** to close

Add ball joint:

11. Press **Shift + A**
12. Click **Mesh**
13. Click **UV Sphere**
14. Press **N** and set Dimensions:
    - X: `0.15`
    - Y: `0.15`
    - Z: `0.15`
15. Under "Location", change:
    - X: `0`
    - Y: `-0.75`
    - Z: `-0.43`
16. Press **N** to close

## Step 13: Create the Suction Cup

1. Press **Shift + A**
2. Click **Mesh**
3. Click **Cylinder**
4. Press **N** and set Dimensions:
   - X: `0.45`
   - Y: `0.04`
   - Z: `0.45`
5. Press **N** to close

Position it:

6. Press **N**
7. Under "Location", change:
   - X: `0`
   - Y: `-1.33`
   - Z: `-0.43`
8. Press **N** to close

## Step 14: Create the Cable

1. Press **Shift + A**
2. Click **Curve**
3. Click **Bezier**
4. Press **Tab** to enter Edit Mode
5. Shape the curve going down and to the right
6. Press **Tab** to exit Edit Mode

Give it thickness:

7. Go to **Modifiers** tab
8. Click **Add Modifier**
9. Click **Bevel**
10. Set Depth to: `0.02`
11. Set Resolution to: `12`

Position it:

12. Press **N**
13. Under "Location", change:
    - X: `2.5`
    - Y: `-0.15`
    - Z: `-0.43`
14. Press **N** to close

## Step 15: Apply Materials

Create the housing material:

1. Click the **Material Properties** tab (red circle icon)
2. Click **+ New**
3. Set Base Color to: Dark Gray (#2c3337)
4. Rename to: `mat_dowe_radar_housing`
5. Click the main housing cube to select it
6. Click **Assign**

Create the ridge material:

7. Click **+ New**
8. Set Base Color to: Gray (#536066)
9. Rename to: `mat_dowe_radar_ridge`
10. Click the ridge cube to select it
11. Click **Assign**

Create the display glass material:

12. Click **+ New**
13. Set Base Color to: Light Gray (#cccccc)
14. Scroll down to "Transmission"
15. Set Transmission to: `0.3` (makes it slightly transparent)
16. Scroll down to "Roughness"
17. Set Roughness to: `0.1`
18. Rename to: `mat_dowe_radar_glass`
19. Click the display glass plane to select it
20. Click **Assign**

Create the display panel material:

21. Click **+ New**
22. Set Base Color to: Very Dark (#02070b)
23. Scroll down to "Emission"
24. Check the box next to "Emission"
25. Set Emission Color to: Red (#ff554d)
26. Set Emission Strength to: `0.6`
27. Rename to: `mat_dowe_radar_display`
28. Click the display panel to select it
29. Click **Assign**

Create the X band LED material (green):

30. Click **+ New`
31. Set Base Color to: Green (#67e889)
32. Scroll down to "Emission"
33. Check the box next to "Emission"
34. Set Emission Color to: Green (#67e889)
35. Set Emission Strength to: `1.0`
36. Rename to: `mat_dowe_radar_led_x`
37. This is for when X band is active - assign to the appropriate segment if needed

Create the K band LED material (yellow):

38. Click **+ New`
39. Set Base Color to: Yellow (#ffb23e)
40. Scroll down to "Emission"
41. Check the box next to "Emission"
42. Set Emission Color to: Yellow (#ffb23e)
43. Set Emission Strength to: `1.0`
44. Rename to: `mat_dowe_radar_led_k`

Create the Ka band LED material (red):

45. Click **+ New`
46. Set Base Color to: Red (#ff554d)
47. Scroll down to "Emission"
48. Check the box next to "Emission"
49. Set Emission Color to: Red (#ff554d)
50. Set Emission Strength to: `1.0`
51. Rename to: `mat_dowe_radar_led_ka`

Create the Laser LED material (magenta):

52. Click **+ New`
53. Set Base Color to: Magenta (#d766ff)
54. Scroll down to "Emission"
55. Check the box next to "Emission"
56. Set Emission Color to: Magenta (#d766ff)
57. Set Emission Strength to: `1.0`
58. Rename to: `mat_dowe_radar_led_laser`

Create the arrows material:

59. Click **+ New`
60. Set Base Color to: White (#e5f6fb)
61. Scroll down to "Emission"
62. Check the box next to "Emission"
63. Set Emission Color to: White (#e5f6fb)
64. Set Emission Strength to: `0.8`
65. Rename to: `mat_dowe_radar_arrows`
66. Click all 3 arrows to select them (hold Shift)
67. Click **Assign**

Create the buttons material:

68. Click **+ New`
69. Set Base Color to: Dark Brown (#51432f)
70. Rename to: `mat_dowe_radar_buttons`
71. Click all 5 control buttons to select them
72. Click **Assign**

Create the bracket material:

73. Click **+ New`
74. Set Base Color to: Black (#1a1a1a)
75. Rename to: `mat_dowe_radar_bracket`
76. Click the bracket arm and ball joint to select them
77. Click **Assign**

Create the suction cup material:

78. Click **+ New**
79. Set Base Color to: Gray (#666666)
80. Scroll down to "Transmission"
81. Set Transmission to: `0.5`
82. Rename to: `mat_dowe_radar_suction`
83. Click the suction cup to select it
84. Click **Assign**

Create the cable material:

85. Click **+ New`
86. Set Base Color to: Black (#1a1a1a)
87. Rename to: `mat_dowe_radar_cable`
88. Click the cable to select it
89. Click **Assign**

## Step 16: UV Map the Display

1. Right-click the display panel to select it
2. Press **Tab** to enter Edit Mode
3. Press **A** to select all
4. Press **U**
5. Click **Unwrap**
6. Press **Tab** to exit Edit Mode

## Step 17: Set Pivot Points

1. Right-click the main housing to select it
2. Click **Object** > **Set Origin** > **Origin to Geometry**

Repeat for bracket and suction cup.

## Step 18: Export the Model

1. Click **File** > **Export** > **SCS (.pmd)**
2. Navigate to: `scs_mod/model/radar/`
3. Name it: `dowe_radar.pmd`
4. Click **Export SCS .pmd**

## Step 19: Create LOD Versions (Optional)

Follow the same process as the ELD to create LOD1 and LOD2 versions, simplifying the model each time.

---

# Troubleshooting

## "I can't find the menu you mentioned"
- Make sure you're in the correct workspace (look at the tabs at the top)
- Some menus are only available in certain modes (Object Mode vs Edit Mode)
- Press **Tab** to switch between Object Mode and Edit Mode

## "My model looks wrong in the game"
- Check that you used the exact dimensions provided
- Make sure you applied all modifiers before exporting
- Verify the materials are assigned correctly
- Check that the pivot points are set correctly

## "I can't export to .pmd"
- Make sure the SCS Blender Tools plugin is installed and enabled
- **IMPORTANT**: Make sure you're using Blender 3.6 (NOT 4.0 or newer!)
- Try restarting Blender
- Check that the SCS Tools addon is checked in Preferences > Add-ons

## "SCS Tools won't install"
- Make sure you downloaded the correct version from mods.scssoft.com
- Make sure you're using Blender 3.6
- Try unzipping the download first, then install the .zip file inside

## "I'm using Blender 4.0/4.1/4.2 and it doesn't work"
- You need to uninstall Blender 4.x and install Blender 3.6 instead
- Go to: https://www.blender.org/download/lts/3-6/
- SCS Tools only works with Blender 3.6
- This is a known limitation of the SCS Tools plugin

## "The colors don't look right"
- Double-check the hex codes provided
- Make sure emission is enabled for screens and LEDs
- Check that materials are assigned to the correct objects

---

# Final Checklist

Before you're done, make sure you:

- [ ] Installed Blender and SCS Tools plugin
- [ ] Created the ELD tablet with all parts
- [ ] Created the radar detector with all parts
- [ ] Applied all materials with correct colors
- [ ] UV mapped the display areas
- [ ] Set pivot points correctly
- [ ] Exported both models as .pmd files
- [ ] (Optional) Created LOD versions
- [ ] Saved your Blender files for future editing

---

# Need Help?

- **SCS Modding Wiki**: https://modding.scssoft.com/wiki
- **SCS Forum**: https://forum.scssoft.com/
- **Blender Manual**: https://docs.blender.org/manual/en/latest/

Good luck with your modeling!
