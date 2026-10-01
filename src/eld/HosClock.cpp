#include "HosClock.h"

namespace DoweTruckElectronics
{
    void HosClock::reset()
    {
        m_driving_remaining = HoursToSeconds(11.0);
        m_shift_remaining = HoursToSeconds(14.0);
        m_cycle_remaining = HoursToSeconds(70.0);
        m_driving_since_break = 0.0;
    }

    void HosClock::update(
        double delta_seconds,
        bool driving,
        bool on_duty)
    {
        if (delta_seconds <= 0.0)
            return;

        if (driving)
        {
            m_driving_remaining -= delta_seconds;
            m_shift_remaining -= delta_seconds;
            m_cycle_remaining -= delta_seconds;
            m_driving_since_break += delta_seconds;
        }
        else if (on_duty)
        {
            m_shift_remaining -= delta_seconds;
            m_cycle_remaining -= delta_seconds;
        }
    }

    double HosClock::driving_remaining() const
    {
        return m_driving_remaining;
    }

    double HosClock::shift_remaining() const
    {
        return m_shift_remaining;
    }

    double HosClock::cycle_remaining() const
    {
        return m_cycle_remaining;
    }

    double HosClock::driving_since_break() const
    {
        return m_driving_since_break;
    }

    bool HosClock::break_required() const
    {
        return m_driving_since_break >= HoursToSeconds(8.0);
    }

    bool HosClock::driving_violation() const
    {
        return m_driving_remaining <= 0.0;
    }

    bool HosClock::shift_violation() const
    {
        return m_shift_remaining <= 0.0;
    }

    bool HosClock::cycle_violation() const
    {
        return m_cycle_remaining <= 0.0;
    }

    void HosClock::apply_break()
    {
        m_driving_since_break = 0.0;
    }

    void HosClock::apply_daily_reset()
    {
        m_driving_remaining = HoursToSeconds(11.0);
        m_shift_remaining = HoursToSeconds(14.0);
    }
}
