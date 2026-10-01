#pragma once

#include "ITelemetrySource.h"
#include "../shared/Events.h"
#include "../shared/Logging.h"
#include <memory>
#include <chrono>
#include <thread>
#include <atomic>
#include <mutex>

namespace DoweTruckElectronics
{
    class TelemetryManager
    {
    public:
        TelemetryManager(std::unique_ptr<ITelemetrySource> source);
        ~TelemetryManager();

        bool start();
        void stop();
        bool is_running() const;

        TelemetryState get_current_state() const;

        TelemetryEvents& events();

    private:
        void update_loop();
        void check_connection_watchdog();

    private:
        std::unique_ptr<ITelemetrySource> m_source;
        std::atomic<bool> m_running;

        mutable std::mutex m_state_mutex;
        TelemetryState m_current_state;

        std::thread m_update_thread;

        std::chrono::steady_clock::time_point m_last_data_time;
        static constexpr std::chrono::milliseconds WATCHDOG_TIMEOUT{5000};
    };
}
