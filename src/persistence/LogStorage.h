#pragma once

#include "LogTypes.h"
#include "../eld/DutyStatus.h"
#include <string>
#include <vector>
#include <memory>
#include <mutex>

namespace DoweTruckElectronics
{
    namespace Persistence
    {
        class LogStorage
        {
        public:
            LogStorage(const std::string& base_directory);
            ~LogStorage();

            bool initialize();

            // Log entry management
            void add_log_entry(const LogEntry& entry);
            void add_violation(const ViolationLog& violation);
            void add_inspection(const InspectionLog& inspection);
            void add_fuel_stop(const FuelStopLog& fuel_stop);

            // Log retrieval
            std::vector<LogEntry> get_log_entries(const std::chrono::system_clock::time_point& date) const;
            std::vector<ViolationLog> get_violations(const std::chrono::system_clock::time_point& date) const;
            std::vector<InspectionLog> get_inspections(const std::chrono::system_clock::time_point& date) const;
            std::vector<FuelStopLog> get_fuel_stops(const std::chrono::system_clock::time_point& date) const;

            DailyLog get_daily_log(const std::chrono::system_clock::time_point& date) const;
            std::vector<DailyLog> get_logs_range(
                const std::chrono::system_clock::time_point& start,
                const std::chrono::system_clock::time_point& end) const;

            // Violation management
            void acknowledge_violation(const std::chrono::system_clock::time_point& timestamp);

            // Trip management
            void start_trip(const std::string& origin_city, const std::string& cargo_type);
            void end_trip(const std::string& destination_city, bool delivered);
            TripLog get_current_trip() const;

            // Storage management
            bool save_current_day();
            bool load_day(const std::chrono::system_clock::time_point& date);
            void clear_current_day();

        private:
            std::string get_log_filename(const std::chrono::system_clock::time_point& date) const;
            std::string get_log_directory() const;
            bool ensure_directory_exists(const std::string& path) const;
            bool write_json_file(const std::string& filename, const std::string& content) const;
            std::string read_json_file(const std::string& filename) const;

            void serialize_daily_log(const DailyLog& log, std::string& json) const;
            DailyLog deserialize_daily_log(const std::string& json) const;

        private:
            std::string m_base_directory;
            DailyLog m_current_log;
            TripLog m_current_trip;
            mutable std::mutex m_mutex;
        };
    }
}
