#pragma once

namespace DoweTruckElectronics
{
    enum class DutyStatus
    {
        OffDuty,
        SleeperBerth,
        OnDuty,
        Driving,
        PersonalConveyance,
        YardMove
    };

    inline const char* DutyStatusName(DutyStatus status)
    {
        switch (status)
        {
        case DutyStatus::OffDuty:
            return "OFF DUTY";

        case DutyStatus::SleeperBerth:
            return "SLEEPER BERTH";

        case DutyStatus::OnDuty:
            return "ON DUTY";

        case DutyStatus::Driving:
            return "DRIVING";

        case DutyStatus::PersonalConveyance:
            return "PERSONAL CONVEYANCE";

        case DutyStatus::YardMove:
            return "YARD MOVE";
        }

        return "UNKNOWN";
    }
}
