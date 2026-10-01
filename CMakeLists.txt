cmake_minimum_required(VERSION 3.24)
project(DoweTruckElectronics VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(DoweTruckElectronics
    src/main.cpp
    src/eld/EldEngine.cpp
    src/eld/HosClock.cpp
)

target_include_directories(
    DoweTruckElectronics
    PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src
)
