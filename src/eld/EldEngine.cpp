#include "EldEngine.h"
#include "../persistence/LogTypes.h"
#include "../persistence/SqliteStorage.h"
#include "../shared/Logging.h"
#include <chrono>

namespace DoweTruckElectronics
{
    EldEngine::EldEngine()
        : m_status_change_time(std::chrono::system_clock::now())
        , m_status_distance(0.0)
    {
        m_hos.reset();
    }

    void EldEngine::set_log_storage(std::shared_ptr<Persistence::LogStorage> storage)
    {
        m_log_storage = storage;
    }

    void EldEngine::set_sqlite_storage(std::shared_ptr<Persistence::SqliteStorage> storage)
    {
        m_sqlite_storage = storage;
    }

    void EldEngine::update(const TelemetryState& telemetry)
    {
        if (!telemetry.connected || telemetry.paused)
            return;

        if (!m_manual_status)
            determine_automatic_status(telemetry);

        const bool driving =
            m_status == DutyStatus::Driving ||
            m_status == DutyStatus::YardMove ||
            m_status == DutyStatus::PersonalConveyance;

        const bool on_duty =
            driving ||
            m_status == DutyStatus::OnDuty;

        m_hos.update(
            telemetry.delta_seconds,
            driving,
            on_duty
        );

        // Track distance during current status
        if (driving)
        {
            m_status_distance += telemetry.speed_mps * telemetry.delta_seconds / 1000.0; // Convert to km
        }
    }

    void EldEngine::determine_automatic_status(
        const TelemetryState& telemetry)
    {
        const DutyStatus old_status = m_status;

        // Moving means driving.
        if (telemetry.speed_mps > 0.5)
        {
            m_status = DutyStatus::Driving;
        }
        // Engine running but stopped means On Duty.
        else if (telemetry.engine_running)
        {
            m_status = DutyStatus::OnDuty;
        }
        // Engine off and stationary means Off Duty.
        else
        {
            m_status = DutyStatus::OffDuty;
        }

        if (old_status != m_status)
            handle_status_change(old_status, m_status);
    }

    void EldEngine::handle_status_change(
        DutyStatus old_status,
        DutyStatus new_status)
    {
        // Calculate duration of previous status
        auto now = std::chrono::system_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::seconds>(
            now - m_status_change_time).count();

        // Create log entry for status change
        Persistence::LogEntry entry;
        entry.timestamp = now;
        entry.from_status = old_status;
        entry.to_status = new_status;
        entry.duration_seconds = static_cast<double>(duration);
        entry.distance_km = m_status_distance;
        entry.location = ""; // Would be filled from GPS
        entry.notes = "";

        // Log to JSON storage
        if (m_log_storage)
        {
            m_log_storage->add_log_entry(entry);
        }

        // Log to SQLite storage
        if (m_sqlite_storage)
        {
            m_sqlite_storage->add_log_entry(entry);
        }

        Logger::info(std::string("Status change: ") +
            DutyStatusName(old_status) + " -> " + DutyStatusName(new_status) +
            " (" + std::to_string(entry.duration_seconds) + "s, " +
            std::to_string(entry.distance_km) + " km)");

        // Reset tracking for new status
        m_status_change_time = std::chrono::system_clock::now();
        m_status_distance = 0.0;
    }

    void EldEngine::set_manual_status(DutyStatus status)
    {
        m_manual_status = true;

        const DutyStatus old_status = m_status;
        m_status = status;

        if (old_status != m_status)
            handle_status_change(old_status, m_status);
    }

    void EldEngine::clear_manual_status()
    {
        m_manual_status = false;
    }

    DutyStatus EldEngine::status() const
    {
        return m_status;
    }

    const HosClock& EldEngine::hos() const
    {
        return m_hos;
    }

    bool EldEngine::automatic_mode() const
    {
        return !m_manual_status;
    }
}
