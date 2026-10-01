#include <iostream>
#include <iomanip>
#include <thread>
#include <chrono>
#include <random>

#include "telemetry/TelemetryManager.h"
#include "telemetry/adapter/ScsTelemetryAdapter.h"
#include "eld/EldEngine.h"
#include "eld/DutyStatus.h"
#include "radar/RadarEngine.h"
#include "radar/RadarTypes.h"
#include "shared/Logging.h"

using namespace DoweTruckElectronics;

static void PrintState(
    const TelemetryState& telemetry,
    const EldEngine& eld,
    const Radar::RadarEngine& radar)
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
        << " h | "

        << "Radar Alerts: "
        << radar.get_bogey_count()
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

    // Create radar engine
    Radar::RadarEngine radar;

    // Subscribe to radar alerts
    radar.alert_triggered().subscribe(
        [](const Radar::RadarAlert& alert)
        {
            if (alert.has_voice_alert)
            {
                Logger::info(std::string("RADAR ALERT: ") + alert.voice_message);
            }
        }
    );

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

    // Setup radar simulation
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> band_dist(0, 3); // X, K, Ka, Laser
    std::uniform_real_distribution<> strength_dist(0.1, 1.0);
    std::uniform_int_distribution<> direction_dist(0, 2); // Front, Rear, Side

    // Run for 30 seconds
    for (int i = 0; i < 300; ++i)
    {
        TelemetryState telemetry = telemetry_manager.get_current_state();
        eld.update(telemetry);

        // Update radar with current speed
        radar.update(0.1, telemetry.speed_mps);

        // Simulate random radar signals
        if (i % 20 == 0 && telemetry.speed_mps > 5.0)
        {
            Radar::RadarSignal signal;
            signal.band = static_cast<Radar::RadarBand>(band_dist(gen));
            signal.direction = static_cast<Radar::RadarDirection>(direction_dist(gen));
            signal.frequency_ghz = (signal.band == Radar::RadarBand::X) ? 10.5 :
                                 (signal.band == Radar::RadarBand::K) ? 24.1 :
                                 (signal.band == Radar::RadarBand::Ka) ? 34.7 : 0.0;
            signal.strength = strength_dist(gen);
            signal.distance_km = strength_dist(gen) * 5.0;
            signal.is_active = true;

            radar.add_simulated_signal(signal);
        }

        if (i % 10 == 0)
            PrintState(telemetry, eld, radar);

        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    Logger::info("Stopping telemetry manager");
    telemetry_manager.stop();

    Logger::info("Shutdown complete");

    return 0;
}
