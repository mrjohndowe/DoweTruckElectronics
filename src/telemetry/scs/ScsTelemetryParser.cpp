#include "ScsTelemetryParser.h"
#include "../../shared/Logging.h"
#include <cstring>

namespace DoweTruckElectronics
{
    namespace Scs
    {
        ScsTelemetryParser::ScsTelemetryParser()
            : m_telemetry_map(nullptr)
            , m_connected(false)
        {
        }

        ScsTelemetryParser::~ScsTelemetryParser()
        {
            disconnect();
        }

        bool ScsTelemetryParser::connect()
        {
            if (m_connected)
                return true;

#ifdef _WIN32
            const char* memory_name = "Local\\SCSTelemetry";
#else
            const char* memory_name = "/SCSTelemetry";
#endif

            if (!m_shared_memory.open(memory_name, SHARED_MEMORY_SIZE))
            {
                Logger::error("Failed to open SCS shared memory");
                return false;
            }

            m_telemetry_map = static_cast<const TelemetryMap*>(m_shared_memory.get_data());

            if (!validate_telemetry())
            {
                Logger::error("SCS telemetry validation failed");
                m_shared_memory.close();
                m_telemetry_map = nullptr;
                return false;
            }

            m_connected = true;
            Logger::info("SCS telemetry parser connected");
            return true;
        }

        void ScsTelemetryParser::disconnect()
        {
            if (!m_connected)
                return;

            m_shared_memory.close();
            m_telemetry_map = nullptr;
            m_connected = false;

            Logger::info("SCS telemetry parser disconnected");
        }

        bool ScsTelemetryParser::is_connected() const
        {
            return m_connected;
        }

        TelemetryState ScsTelemetryParser::read_state()
        {
            if (!m_connected || m_telemetry_map == nullptr)
                return TelemetryState{};

            return map_to_telemetry_state();
        }

        bool ScsTelemetryParser::validate_telemetry() const
        {
            if (m_telemetry_map == nullptr)
                return false;

            // Check if SDK is active
            if (!m_telemetry_map->sdkActive)
            {
                Logger::warning("SCS SDK not active");
                return false;
            }

            // Check plugin revision
            if (m_telemetry_map->scs_values.telemetry_plugin_revision != PLUGIN_REVISION)
            {
                Logger::warning("SCS telemetry plugin revision mismatch");
                return false;
            }

            // Check if game is ATS
            if (m_telemetry_map->scs_values.game != GAME_ATS &&
                m_telemetry_map->scs_values.game != GAME_ETS2)
            {
                Logger::warning("Unknown game type");
                return false;
            }

            return true;
        }

        TelemetryState ScsTelemetryParser::map_to_telemetry_state() const
        {
            TelemetryState state;
            state.connected = true;

            // Map control values
            state.paused = m_telemetry_map->paused;

            // Map truck state
            state.engine_running = m_telemetry_map->truck_b.engineEnabled;
            state.parking_brake = m_telemetry_map->truck_b.parkBrake;

            // Speed is in km/h in SCS, convert to m/s
            state.speed_mps = m_telemetry_map->truck_f.speed / 3.6;

            // Odometer is in km
            state.odometer_km = m_telemetry_map->truck_f.truckOdometer;

            // Estimate engine hours from odometer (rough approximation)
            // In a real implementation, this would be tracked separately
            state.engine_hours = state.odometer_km / 1000.0 * 50.0; // Rough estimate

            // Check if trailer is attached
            state.trailer_connected = m_telemetry_map->trailer.trailer[0].com_b.attached;

            // Navigation distance
            state.navigation_distance_km = m_telemetry_map->truck_f.routeDistance;

            // Sleep detection (rest stop)
            state.sleeping = m_telemetry_map->common_i.restStop != 0;

            // Delta time calculation would be done by the telemetry manager
            state.delta_seconds = 0.0;

            return state;
        }
    }
}
