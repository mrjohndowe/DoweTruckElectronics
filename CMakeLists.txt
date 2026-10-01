cmake_minimum_required(VERSION 3.24)
project(DoweTruckElectronics VERSION 0.0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(Threads REQUIRED)

# Platform-specific libraries
if(UNIX AND NOT APPLE)
    # Linux needs librt for shared memory (shm_open)
    find_library(LIBRT rt)
    if(LIBRT)
        set(PLATFORM_LIBS ${LIBRT})
    else()
        set(PLATFORM_LIBS "")
    endif()
elseif(APPLE)
    # macOS shared memory is in libc
    set(PLATFORM_LIBS "")
else()
    # Windows shared memory is in kernel32 (no extra linking needed)
    set(PLATFORM_LIBS "")
endif()

add_executable(DoweTruckElectronics
    src/main.cpp
    src/eld/EldEngine.cpp
    src/eld/HosClock.cpp
    src/telemetry/TelemetryManager.cpp
    src/telemetry/adapter/ScsTelemetryAdapter.cpp
    src/telemetry/scs/SharedMemory.cpp
    src/telemetry/scs/ScsTelemetryParser.cpp
    src/radar/RadarSettings.cpp
    src/radar/RadarEngine.cpp
)

target_include_directories(
    DoweTruckElectronics
    PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(
    DoweTruckElectronics
    PRIVATE Threads::Threads ${PLATFORM_LIBS}
)
