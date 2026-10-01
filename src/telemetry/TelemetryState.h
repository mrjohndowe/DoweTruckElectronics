#pragma once

namespace DoweTruckElectronics
{
    struct TelemetryState
    {
        bool connected = false;
        bool engine_running = false;
        bool parking_brake = false;

        double speed_mps = 0.0;

        double odometer_km = 0.0;
        double engine_hours = 0.0;

        bool trailer_connected = false;

        // Game/session state
        bool paused = false;
        bool sleeping = false;

        // Used by navigation/trip systems later.
        double navigation_distance_km = 0.0;

        // Game time elapsed since the previous telemetry update.
        double delta_seconds = 0.0;
    };
}
