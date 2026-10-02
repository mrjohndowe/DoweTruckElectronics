# Build Instructions for DoweTruckElectronics

## Prerequisites

### Required
- **C++17 compatible compiler**
  - Windows: MSVC 2017+ (Visual Studio 2017 or later)
  - Linux: GCC 7+ or Clang 5+
  - macOS: Xcode 10+ or Clang 5+

- **CMake 3.24 or later**
  - Download from https://cmake.org/download/
  - Windows: Install with installer or use package manager
  - Linux: `sudo apt-get install cmake` (Ubuntu/Debian) or `sudo dnf install cmake` (Fedora)
  - macOS: `brew install cmake`

### Optional (for SQLite database support)
- **SQLite3 development library**
  - Windows: Included with the build (no separate installation needed)
  - Linux: `sudo apt-get install libsqlite3-dev` (Ubuntu/Debian) or `sudo dnf install sqlite-devel` (Fedora)
  - macOS: `brew install sqlite`

**Note**: SQLite3 is optional. The build will work without it, but database support will be disabled.

## Building

### Windows (Visual Studio)

```powershell
# Navigate to project directory
cd G:\.gitClones\DoweTruckElectronics

# Create build directory
mkdir build
cd build

# Configure with CMake
cmake ..

# Build
cmake --build . --config Debug

# Or for Release build
cmake --build . --config Release
```

The executable will be located at:
- Debug: `build\Debug\DoweTruckElectronics.exe`
- Release: `build\Release\DoweTruckElectronics.exe`

### Linux

```bash
# Navigate to project directory
cd /path/to/DoweTruckElectronics

# Create build directory
mkdir build
cd build

# Configure with CMake
cmake ..

# Build
cmake --build .

# Or with make (default generator)
make

# Or with ninja (if installed)
cmake -G Ninja ..
ninja
```

The executable will be located at: `build/DoweTruckElectronics`

### macOS

```bash
# Navigate to project directory
cd /path/to/DoweTruckElectronics

# Create build directory
mkdir build
cd build

# Configure with CMake
cmake ..

# Build
cmake --build .

# Or with make
make
```

The executable will be located at: `build/DoweTruckElectronics`

## Build Options

### Enable SQLite Database Support

By default, CMake will try to find SQLite3. If found, database support is enabled. If not found, the build continues without database support.

To force SQLite support to be enabled (will fail if not found):
```bash
cmake -DENABLE_SQLITE=ON ..
```

To force SQLite support to be disabled:
```bash
cmake -DENABLE_SQLITE=OFF ..
```

### Build Type

By default, CMake builds in Debug mode. To build in Release mode:
```bash
cmake -DCMAKE_BUILD_TYPE=Release ..
```

### Custom Install Prefix

To install to a custom directory:
```bash
cmake -DCMAKE_INSTALL_PREFIX=/custom/path ..
cmake --build .
cmake --install .
```

## Troubleshooting

### CMake not found
- Download and install CMake from https://cmake.org/download/
- Ensure CMake is in your PATH

### SQLite3 not found (Linux/macOS)
- Install SQLite3 development library:
  - Ubuntu/Debian: `sudo apt-get install libsqlite3-dev`
  - Fedora/RHEL: `sudo dnf install sqlite-devel`
  - macOS: `brew install sqlite`
- Or build without SQLite support (database features will be disabled)

### Compilation errors
- Ensure you have a C++17 compatible compiler
- Windows: Install Visual Studio 2017 or later with C++ support
- Linux: Install GCC 7+ or Clang 5+
- macOS: Install Xcode 10+ or Command Line Tools

### Build succeeds but executable won't run
- Ensure all dependencies are installed
- On Windows, ensure Visual C++ Redistributable is installed
- On Linux, ensure required shared libraries are available

## Clean Build

To start fresh with a clean build:
```bash
# Remove build directory
rm -rf build
# Or on Windows
rmdir /s /q build

# Recreate and build
mkdir build
cd build
cmake ..
cmake --build .
```

## Running the Application

After building, run the executable:

```bash
# Windows
.\Debug\DoweTruckElectronics.exe

# Linux/macOS
./DoweTruckElectronics
```

The application will:
1. Initialize telemetry (tries real ATS telemetry, falls back to simulation)
2. Initialize JSON log storage
3. Initialize SQLite storage (if available)
4. Run for 30 seconds with simulated radar alerts
5. Save logs on shutdown

## Installation

The application is currently designed to run from the build directory. For distribution:
1. Copy the executable to your desired location
2. Copy the `scs_mod` directory if using the ATS mod
3. Ensure the application has write access to create a `logs` directory

## Platform-Specific Notes

### Windows
- Uses MSVC compiler by default
- Shared memory APIs are built into Windows (no extra libraries needed)
- SQLite3 can be embedded (no separate installation needed)

### Linux
- Uses GCC by default
- Requires `librt` for shared memory (shm_open)
- Requires `libsqlite3-dev` for database support

### macOS
- Uses Clang by default
- Shared memory is in libc (no extra libraries needed)
- Requires SQLite3 via Homebrew for database support
