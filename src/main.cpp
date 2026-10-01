#include <iostream>
#include <iomanip>

#include "telemetry/TelemetryState.h"
#include "eld/EldEngine.h"
#include "eld/DutyStatus.h"

using namespace DoweTruckElectronics;

static void PrintState(
    const TelemetryState& telemetry,
    const EldEngine& eld)
{
    std::cout
        << "Speed: "
        << std::fixed
        << std::setprecision(1)
        << telemetry.speed_mps
        << " m/s | "

        << "Status: "
        << DutyStatusName(eld.status())
        << " | "

        << "Drive Remaining: "
        << eld.hos().driving_remaining() / 3600.0
        << " h | "

        << "Shift Remaining: "
        << eld.hos().shift_remaining() / 3600.0
        << " h"
        << '\n';
}

int main()
{
    TelemetryState telemetry;
    telemetry.connected = true;
    telemetry.engine_running = true;

    EldEngine eld;

    // Simulate 60 seconds of driving.
    telemetry.speed_mps = 25.0;

    for (int i = 0; i < 60; ++i)
    {
        telemetry.delta_seconds = 1.0;

        eld.update(telemetry);

        if (i % 10 == 0)
            PrintState(telemetry, eld);
    }

    // Truck stops.
    telemetry.speed_mps = 0.0;

    for (int i = 0; i < 10; ++i)
    {
        telemetry.delta_seconds = 1.0;

        eld.update(telemetry);

        PrintState(telemetry, eld);
    }

    // Engine shuts down.
    telemetry.engine_running = false;

    for (int i = 0; i < 5; ++i)
    {
        telemetry.delta_seconds = 1.0;

        eld.update(telemetry);

        PrintState(telemetry, eld);
    }

    return 0;
}
