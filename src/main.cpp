#include <iostream>
#include <iomanip>
#include <thread>
#include <chrono>

#include "telemetry/TelemetryManager.h"
#include "telemetry/adapter/ScsTelemetryAdapter.h"
#include "eld/EldEngine.h"
#include "eld/DutyStatus.h"
#include "shared/Logging.h"

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
    Logger::set_level(LogLevel::Info);

    Logger::info("Starting Dowe Truck Electronics System");

    // Create telemetry adapter (will try real SDK first, fallback to simulation)
    auto adapter = std::make_unique<ScsTelemetryAdapter>();

    // Create telemetry manager
    TelemetryManager telemetry_manager(std::move(adapter));

    // Create ELD engine
    EldEngine eld;

    // Subscribe to connection events
    telemetry_manager.events().connected_changed.subscribe(
        [](bool connected)
        {
            if (connected)
                Logger::info("Telemetry connected");
            else
                Logger::warning("Telemetry disconnected");
        }
    );

    // Start telemetry
    if (!telemetry_manager.start())
    {
        Logger::error("Failed to start telemetry manager");
        return 1;
    }

    Logger::info("Running for 30 seconds...");
    Logger::info("Press Ctrl+C to exit early");
    Logger::info("Note: Start ATS/ETS2 with SCS telemetry plugin for real data");

    // Run for 30 seconds
    for (int i = 0; i < 300; ++i)
    {
        TelemetryState telemetry = telemetry_manager.get_current_state();
        eld.update(telemetry);

        if (i % 10 == 0)
            PrintState(telemetry, eld);

        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    Logger::info("Stopping telemetry manager");
    telemetry_manager.stop();

    Logger::info("Shutdown complete");

    return 0;
}
