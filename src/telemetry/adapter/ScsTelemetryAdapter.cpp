#include "ScsTelemetryAdapter.h"
#include <cmath>
#include <random>
#include <mutex>

namespace DoweTruckElectronics
{
    ScsTelemetryAdapter::ScsTelemetryAdapter()
        : m_connected(false)
        , m_simulation_mode(false)
        , m_running(false)
        , m_scs_parser(std::make_unique<Scs::ScsTelemetryParser>())
    {
        m_last_update_time = std::chrono::steady_clock::now();
    }

    ScsTelemetryAdapter::~ScsTelemetryAdapter()
    {
        disconnect();
    }

    bool ScsTelemetryAdapter::connect()
    {
        if (m_connected)
            return true;

        if (m_simulation_mode)
        {
            m_connected = true;
            m_running = true;
            m_simulation_thread = std::thread(&ScsTelemetryAdapter::simulation_thread, this);
            Logger::info("SCS Telemetry Adapter connected (simulation mode)");
            m_events.connected_changed.emit(true);
            return true;
        }

        // Try to connect to real SCS telemetry
        if (m_scs_parser->connect())
        {
            m_connected = true;
            Logger::info("SCS Telemetry Adapter connected (real SDK mode)");
            m_events.connected_changed.emit(true);
            return true;
        }

        Logger::warning("Failed to connect to SCS telemetry, falling back to simulation mode");
        m_simulation_mode = true;
        m_connected = true;
        m_running = true;
        m_simulation_thread = std::thread(&ScsTelemetryAdapter::simulation_thread, this);
        m_events.connected_changed.emit(true);
        return true;
    }

    void ScsTelemetryAdapter::disconnect()
    {
        if (!m_connected)
            return;

        m_running = false;
        m_connected = false;

        if (m_simulation_thread.joinable())
            m_simulation_thread.join();

        if (m_scs_parser)
            m_scs_parser->disconnect();

        Logger::info("SCS Telemetry Adapter disconnected");
        m_events.connected_changed.emit(false);
    }

    bool ScsTelemetryAdapter::is_connected() const
    {
        return m_connected;
    }

    TelemetryState ScsTelemetryAdapter::read_state()
    {
        if (!m_connected)
            return TelemetryState{};

        if (m_simulation_mode)
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            return m_last_state;
        }

        // Read from real SCS telemetry
        if (m_scs_parser && m_scs_parser->is_connected())
        {
            return m_scs_parser->read_state();
        }

        // Fallback to simulation if parser fails
        std::lock_guard<std::mutex> lock(m_mutex);
        return m_last_state;
    }

    TelemetryEvents& ScsTelemetryAdapter::events()
    {
        return m_events;
    }

    void ScsTelemetryAdapter::enable_simulation_mode(bool enabled)
    {
        m_simulation_mode = enabled;
    }

    void ScsTelemetryAdapter::simulation_thread()
    {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_real_distribution<> speed_dist(0.0, 30.0);
        std::uniform_int_distribution<> engine_dist(0, 1);

        while (m_running)
        {
            auto now = std::chrono::steady_clock::now();
            auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(
                now - m_last_update_time).count() / 1000.0;

            {
                std::lock_guard<std::mutex> lock(m_mutex);
                m_last_state = simulate_telemetry();
                m_last_state.delta_seconds = elapsed;
                m_last_state.connected = true;
            }

            m_last_update_time = now;

            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    }

    TelemetryState ScsTelemetryAdapter::simulate_telemetry()
    {
        static TelemetryState sim_state;
        static bool engine_on = true;
        static double speed = 0.0;
        static double odometer = 0.0;
        static double engine_hours = 0.0;
        static int phase = 0;
        static int counter = 0;

        counter++;

        // Simulate driving phases
        switch (phase)
        {
        case 0: // Driving
            speed = 25.0 + (std::sin(counter * 0.1) * 5.0);
            engine_on = true;
            if (counter > 600) phase = 1; // After ~60 seconds
            break;

        case 1: // Stopped, engine running
            speed = 0.0;
            engine_on = true;
            if (counter > 700) phase = 2; // After ~10 seconds
            break;

        case 2: // Engine off
            speed = 0.0;
            engine_on = false;
            if (counter > 750) phase = 0; // After ~5 seconds, reset
            counter = 0;
            break;
        }

        odometer += speed * 0.1 / 3600.0; // Convert m/s to km/h, then to km per 100ms
        engine_hours += 0.1 / 3600.0; // 100ms in hours

        sim_state.speed_mps = speed;
        sim_state.engine_running = engine_on;
        sim_state.odometer_km = odometer;
        sim_state.engine_hours = engine_hours;
        sim_state.trailer_connected = true;
        sim_state.parking_brake = !engine_on;
        sim_state.paused = false;
        sim_state.sleeping = false;

        return sim_state;
    }
}
