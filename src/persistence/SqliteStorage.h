#pragma once

#include "LogTypes.h"
#include <string>
#include <vector>
#include <memory>
#include <mutex>

// Forward declaration for sqlite3
struct sqlite3;
struct sqlite3_stmt;

namespace DoweTruckElectronics
{
    namespace Persistence
    {
        class SqliteStorage
        {
        public:
            SqliteStorage(const std::string& db_path);
            ~SqliteStorage();

            bool initialize();
            bool close();

            // Log entry management
            bool add_log_entry(const LogEntry& entry);
            bool add_violation(const ViolationLog& violation);
            bool add_inspection(const InspectionLog& inspection);
            bool add_fuel_stop(const FuelStopLog& fuel_stop);

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
            bool acknowledge_violation(const std::chrono::system_clock::time_point& timestamp);

            // Trip management
            bool start_trip(const std::string& origin_city, const std::string& cargo_type);
            bool end_trip(const std::string& destination_city, bool delivered);
            TripLog get_current_trip() const;

            // Query methods
            std::vector<LogEntry> get_all_log_entries() const;
            std::vector<ViolationLog> get_all_violations() const;
            std::vector<TripLog> get_all_trips() const;

            // Statistics
            double get_total_driving_hours() const;
            double get_total_distance_km() const;
            int get_total_violations() const;

            // Maintenance
            bool vacuum();
            bool check_integrity();

        private:
            bool create_tables();
            bool prepare_statements();
            void finalize_statements();

            // Helper methods
            std::string time_to_string(const std::chrono::system_clock::time_point& tp) const;
            std::chrono::system_clock::time_point string_to_time(const std::string& str) const;
            std::string duty_status_to_string(DutyStatus status) const;
            DutyStatus string_to_duty_status(const std::string& str) const;
            std::string violation_type_to_string(ViolationType type) const;
            ViolationType string_to_violation_type(const std::string& str) const;
            std::string inspection_type_to_string(InspectionType type) const;
            InspectionType string_to_inspection_type(const std::string& str) const;

            // Statement execution helpers
            bool execute_sql(const std::string& sql) const;
            bool execute_sql(sqlite3_stmt* stmt) const;

        private:
            std::string m_db_path;
            sqlite3* m_db;
            mutable std::mutex m_mutex;

            // Prepared statements
            sqlite3_stmt* m_stmt_add_log_entry;
            sqlite3_stmt* m_stmt_add_violation;
            sqlite3_stmt* m_stmt_add_inspection;
            sqlite3_stmt* m_stmt_add_inspection_item;
            sqlite3_stmt* m_stmt_add_fuel_stop;
            sqlite3_stmt* m_stmt_start_trip;
            sqlite3_stmt* m_stmt_end_trip;
            sqlite3_stmt* m_stmt_get_log_entries;
            sqlite3_stmt* m_stmt_get_violations;
            sqlite3_stmt* m_stmt_get_inspections;
            sqlite3_stmt* m_stmt_get_inspection_items;
            sqlite3_stmt* m_stmt_get_fuel_stops;
            sqlite3_stmt* m_stmt_get_current_trip;
            sqlite3_stmt* m_stmt_acknowledge_violation;
            sqlite3_stmt* m_stmt_get_all_log_entries;
            sqlite3_stmt* m_stmt_get_all_violations;
            sqlite3_stmt* m_stmt_get_all_trips;
            sqlite3_stmt* m_stmt_get_total_driving_hours;
            sqlite3_stmt* m_stmt_get_total_distance;
            sqlite3_stmt* m_stmt_get_total_violations;
        };
    }
}
