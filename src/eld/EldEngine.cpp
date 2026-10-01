#include "EldEngine.h"

namespace DoweTruckElectronics
{
    EldEngine::EldEngine()
    {
        m_hos.reset();
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
        // A real event/log system will be connected here next.
        //
        // Example:
        //
        // 10:32:14
        // ON DUTY -> DRIVING
        //
        // This will eventually create a permanent ELD log entry.
        (void)old_status;
        (void)new_status;
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
