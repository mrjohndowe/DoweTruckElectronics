#pragma once

#include <string>

namespace DoweTruckElectronics
{
    namespace Radar
    {
        enum class RadarBand
        {
            X,
            K,
            Ka,
            Laser,
            POP,
            MRCD,
            Unknown
        };

        enum class RadarDirection
        {
            Front,
            Rear,
            Side,
            Unknown
        };

        enum class SensitivityMode
        {
            Highway,
            Auto,
            City,
            NoX
        };

        inline const char* BandName(RadarBand band)
        {
            switch (band)
            {
            case RadarBand::X:
                return "X";
            case RadarBand::K:
                return "K";
            case RadarBand::Ka:
                return "KA";
            case RadarBand::Laser:
                return "LASER";
            case RadarBand::POP:
                return "POP";
            case RadarBand::MRCD:
                return "MRCD";
            default:
                return "UNKNOWN";
            }
        }

        inline const char* DirectionName(RadarDirection direction)
        {
            switch (direction)
            {
            case RadarDirection::Front:
                return "FRONT";
            case RadarDirection::Rear:
                return "REAR";
            case RadarDirection::Side:
                return "SIDE";
            default:
                return "UNKNOWN";
            }
        }

        inline const char* SensitivityModeName(SensitivityMode mode)
        {
            switch (mode)
            {
            case SensitivityMode::Highway:
                return "HIGHWAY";
            case SensitivityMode::Auto:
                return "AUTO";
            case SensitivityMode::City:
                return "CITY";
            case SensitivityMode::NoX:
                return "NO X";
            default:
                return "UNKNOWN";
            }
        }

        struct RadarSignal
        {
            RadarBand band;
            RadarDirection direction;
            double frequency_ghz;
            double strength; // 0.0 to 1.0
            double distance_km;
            bool is_active;
        };

        struct RadarAlert
        {
            RadarSignal signal;
            int bogey_count;
            bool is_muted;
            bool has_voice_alert;
            std::string voice_message;
        };
    }
}
