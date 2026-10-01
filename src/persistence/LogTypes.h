#pragma once

#include "../eld/DutyStatus.h"
#include <string>
#include <chrono>
#include <vector>

namespace DoweTruckElectronics
{
    namespace Persistence
    {
        struct LogEntry
        {
            std::chrono::system_clock::time_point timestamp;
            DutyStatus from_status;
            DutyStatus to_status;
            double duration_seconds;
            double distance_km;
            std::string location;
            std::string notes;
        };

        struct TripLog
        {
            std::chrono::system_clock::time_point start_time;
            std::chrono::system_clock::time_point end_time;
            double total_distance_km;
            double fuel_consumed_liters;
            std::string origin_city;
            std::string destination_city;
            std::string cargo_type;
            int violation_count;
            bool delivered;
        };

        enum class ViolationType
        {
            DrivingTimeExceeded,
            ThirtyMinuteBreakMissed,
            FourteenHourViolation,
            CycleLimitViolation,
            Unknown
        };

        inline const char* ViolationTypeName(ViolationType type)
        {
            switch (type)
            {
            case ViolationType::DrivingTimeExceeded:
                return "DRIVING TIME EXCEEDED";
            case ViolationType::ThirtyMinuteBreakMissed:
                return "30-MINUTE BREAK MISSED";
            case ViolationType::FourteenHourViolation:
                return "14-HOUR VIOLATION";
            case ViolationType::CycleLimitViolation:
                return "CYCLE LIMIT VIOLATION";
            default:
                return "UNKNOWN";
            }
        }

        struct ViolationLog
        {
            std::chrono::system_clock::time_point timestamp;
            ViolationType type;
            double severity; // 0.0 to 1.0
            std::string description;
            bool acknowledged;
            std::chrono::system_clock::time_point acknowledged_time;
        };

        struct InspectionItem
        {
            std::string name;
            bool passed;
            std::string notes;
        };

        enum class InspectionType
        {
            PreTrip,
            PostTrip,
            DVIR
        };

        inline const char* InspectionTypeName(InspectionType type)
        {
            switch (type)
            {
            case InspectionType::PreTrip:
                return "PRE-TRIP";
            case InspectionType::PostTrip:
                return "POST-TRIP";
            case InspectionType::DVIR:
                return "DVIR";
            default:
                return "UNKNOWN";
            }
        }

        struct InspectionLog
        {
            std::chrono::system_clock::time_point timestamp;
            InspectionType type;
            std::string truck_id;
            std::string trailer_id;
            std::vector<InspectionItem> items;
            bool passed;
            std::string driver_signature;
            std::string mechanic_signature;
        };

        struct FuelStopLog
        {
            std::chrono::system_clock::time_point timestamp;
            std::string location;
            std::string station_name;
            double gallons;
            double price_per_gallon;
            double total_cost;
            double odometer_km;
            std::string fuel_type;
        };

        struct DailyLog
        {
            std::chrono::system_clock::time_point date;
            double driving_hours;
            double on_duty_hours;
            double off_duty_hours;
            double sleeper_berth_hours;
            double total_distance_km;
            std::vector<LogEntry> entries;
            std::vector<ViolationLog> violations;
            std::vector<InspectionLog> inspections;
            std::vector<FuelStopLog> fuel_stops;
        };
    }
}
