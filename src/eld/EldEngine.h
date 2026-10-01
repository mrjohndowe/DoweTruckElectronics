#pragma once

#include "DutyStatus.h"
#include "HosClock.h"
#include "../telemetry/TelemetryState.h"

namespace DoweTruckElectronics
{
    class EldEngine
    {
    public:
        EldEngine();

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
    };
}
