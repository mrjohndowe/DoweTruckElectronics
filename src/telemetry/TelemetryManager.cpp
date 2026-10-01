#include "TelemetryManager.h"

namespace DoweTruckElectronics
{
    TelemetryManager::TelemetryManager(std::unique_ptr<ITelemetrySource> source)
        : m_source(std::move(source))
        , m_running(false)
    {
    }

    TelemetryManager::~TelemetryManager()
    {
        stop();
    }

    bool TelemetryManager::start()
    {
        if (m_running)
            return true;

        if (!m_source->connect())
        {
            Logger::error("Failed to connect to telemetry source");
            return false;
        }

        m_running = true;
        m_last_data_time = std::chrono::steady_clock::now();
        m_update_thread = std::thread(&TelemetryManager::update_loop, this);

        Logger::info("Telemetry manager started");
        return true;
    }

    void TelemetryManager::stop()
    {
        if (!m_running)
            return;

        m_running = false;

        if (m_update_thread.joinable())
            m_update_thread.join();

        m_source->disconnect();

        Logger::info("Telemetry manager stopped");
    }

    bool TelemetryManager::is_running() const
    {
        return m_running;
    }

    TelemetryState TelemetryManager::get_current_state() const
    {
        std::lock_guard<std::mutex> lock(m_state_mutex);
        return m_current_state;
    }

    TelemetryEvents& TelemetryManager::events()
    {
        return m_source->events();
    }

    void TelemetryManager::update_loop()
    {
        while (m_running)
        {
            TelemetryState new_state = m_source->read_state();

            {
                std::lock_guard<std::mutex> lock(m_state_mutex);

                bool was_connected = m_current_state.connected;
                bool is_connected = new_state.connected;

                m_current_state = new_state;

                if (was_connected != is_connected)
                {
                    m_source->events().connected_changed.emit(is_connected);
                }

                if (is_connected)
                {
                    m_last_data_time = std::chrono::steady_clock::now();
                }
            }

            check_connection_watchdog();

            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    }

    void TelemetryManager::check_connection_watchdog()
    {
        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(
            now - m_last_data_time);

        if (elapsed > WATCHDOG_TIMEOUT && m_current_state.connected)
        {
            Logger::warning("Telemetry connection watchdog timeout");
            std::lock_guard<std::mutex> lock(m_state_mutex);
            m_current_state.connected = false;
            m_source->events().connected_changed.emit(false);
        }
    }
}
