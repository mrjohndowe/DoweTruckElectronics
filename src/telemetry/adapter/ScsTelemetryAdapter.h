#pragma once

#include "../ITelemetrySource.h"
#include "../../shared/Events.h"
#include "../../shared/Logging.h"
#include <chrono>
#include <thread>
#include <atomic>
#include <mutex>

namespace DoweTruckElectronics
{
    class ScsTelemetryAdapter : public ITelemetrySource
    {
    public:
        ScsTelemetryAdapter();
        ~ScsTelemetryAdapter() override;

        bool connect() override;
        void disconnect() override;
        bool is_connected() const override;

        TelemetryState read_state() override;

        TelemetryEvents& events() override;

        void enable_simulation_mode(bool enabled);

    private:
        void simulation_thread();
        TelemetryState simulate_telemetry();

    private:
        std::atomic<bool> m_connected;
        std::atomic<bool> m_simulation_mode;
        std::atomic<bool> m_running;

        std::thread m_simulation_thread;

        mutable std::mutex m_mutex;
        TelemetryState m_last_state;
        TelemetryEvents m_events;

        std::chrono::steady_clock::time_point m_last_update_time;
    };
}
