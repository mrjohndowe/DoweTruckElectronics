#pragma once

namespace DoweTruckElectronics
{
    class HosClock
    {
    public:
        void reset();

        void update(
            double delta_seconds,
            bool driving,
            bool on_duty
        );

        double driving_remaining() const;
        double shift_remaining() const;
        double cycle_remaining() const;

        double driving_since_break() const;

        bool break_required() const;
        bool driving_violation() const;
        bool shift_violation() const;
        bool cycle_violation() const;

        void apply_break();
        void apply_daily_reset();

    private:
        static constexpr double HoursToSeconds(double hours)
        {
            return hours * 3600.0;
        }

        // Initial US property-carrier style defaults.
        double m_driving_remaining = HoursToSeconds(11.0);
        double m_shift_remaining = HoursToSeconds(14.0);
        double m_cycle_remaining = HoursToSeconds(70.0);

        double m_driving_since_break = 0.0;
    };
}
