#pragma once

#include "DutyStatus.h"
#include "HosClock.h"
#include "../telemetry/TelemetryState.h"
#include <memory>
#include <chrono>

namespace DoweTruckElectronics
{
    namespace Persistence
    {
        class LogStorage;
    }

#ifdef ENABLE_SQLITE
    namespace Persistence
    {
        class SqliteStorage;
    }
#endif

    class EldEngine
    {
    public:
        EldEngine();
        ~EldEngine() = default;

        void set_log_storage(std::shared_ptr<Persistence::LogStorage> storage);
#ifdef ENABLE_SQLITE
        void set_sqlite_storage(std::shared_ptr<Persistence::SqliteStorage> storage);
#endif

        void update(const TelemetryState& telemetry);

        void set_manual_status(DutyStatus status);
        void clear_manual_status();

        DutyStatus status() const;

        const HosClock& hos() const;

        bool automatic_mode() const;

    private:
        void determine_automatic_status(
            const TelemetryState& telemetry
        );

        void handle_status_change(
            DutyStatus old_status,
            DutyStatus new_status
        );

    private:
        DutyStatus m_status = DutyStatus::OffDuty;

        bool m_manual_status = false;

        HosClock m_hos;

        std::shared_ptr<Persistence::LogStorage> m_log_storage;
#ifdef ENABLE_SQLITE
        std::shared_ptr<Persistence::SqliteStorage> m_sqlite_storage;
#endif
        std::chrono::system_clock::time_point m_status_change_time;
        double m_status_distance;
    };
}
