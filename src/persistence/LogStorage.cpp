#include "LogStorage.h"
#include "JsonWriter.h"
#include "../eld/DutyStatus.h"
#include "../shared/Logging.h"
#include <fstream>
#include <filesystem>
#include <iomanip>
#include <sstream>

namespace DoweTruckElectronics
{
    namespace Persistence
    {
        LogStorage::LogStorage(const std::string& base_directory)
            : m_base_directory(base_directory)
        {
        }

        LogStorage::~LogStorage()
        {
            save_current_day();
        }

        bool LogStorage::initialize()
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            if (!ensure_directory_exists(m_base_directory))
            {
                Logger::error("Failed to create log directory: " + m_base_directory);
                return false;
            }

            // Initialize current log with today's date
            m_current_log.date = std::chrono::system_clock::now();
            m_current_log.driving_hours = 0.0;
            m_current_log.on_duty_hours = 0.0;
            m_current_log.off_duty_hours = 0.0;
            m_current_log.sleeper_berth_hours = 0.0;
            m_current_log.total_distance_km = 0.0;

            Logger::info("Log storage initialized: " + m_base_directory);
            return true;
        }

        void LogStorage::add_log_entry(const LogEntry& entry)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            m_current_log.entries.push_back(entry);

            // Update daily totals
            switch (entry.to_status)
            {
            case DutyStatus::Driving:
                m_current_log.driving_hours += entry.duration_seconds / 3600.0;
                break;
            case DutyStatus::OnDuty:
                m_current_log.on_duty_hours += entry.duration_seconds / 3600.0;
                break;
            case DutyStatus::OffDuty:
                m_current_log.off_duty_hours += entry.duration_seconds / 3600.0;
                break;
            case DutyStatus::SleeperBerth:
                m_current_log.sleeper_berth_hours += entry.duration_seconds / 3600.0;
                break;
            default:
                break;
            }

            m_current_log.total_distance_km += entry.distance_km;
        }

        void LogStorage::add_violation(const ViolationLog& violation)
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            m_current_log.violations.push_back(violation);
        }

        void LogStorage::add_inspection(const InspectionLog& inspection)
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            m_current_log.inspections.push_back(inspection);
        }

        void LogStorage::add_fuel_stop(const FuelStopLog& fuel_stop)
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            m_current_log.fuel_stops.push_back(fuel_stop);
        }

        std::vector<LogEntry> LogStorage::get_log_entries(const std::chrono::system_clock::time_point& date) const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            DailyLog log = get_daily_log(date);
            return log.entries;
        }

        std::vector<ViolationLog> LogStorage::get_violations(const std::chrono::system_clock::time_point& date) const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            DailyLog log = get_daily_log(date);
            return log.violations;
        }

        std::vector<InspectionLog> LogStorage::get_inspections(const std::chrono::system_clock::time_point& date) const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            DailyLog log = get_daily_log(date);
            return log.inspections;
        }

        std::vector<FuelStopLog> LogStorage::get_fuel_stops(const std::chrono::system_clock::time_point& date) const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            DailyLog log = get_daily_log(date);
            return log.fuel_stops;
        }

        DailyLog LogStorage::get_daily_log(const std::chrono::system_clock::time_point& date) const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            // Check if requesting current day
            auto today = std::chrono::system_clock::now();
            auto today_date = std::chrono::system_clock::time_point(
                std::chrono::duration_cast<std::chrono::seconds>(
                    std::chrono::duration_cast<std::chrono::hours>(today.time_since_epoch())
                )
            );

            auto request_date = std::chrono::system_clock::time_point(
                std::chrono::duration_cast<std::chrono::seconds>(
                    std::chrono::duration_cast<std::chrono::hours>(date.time_since_epoch())
                )
            );

            if (request_date == today_date)
            {
                return m_current_log;
            }

            // Load from file
            std::string filename = get_log_filename(date);
            std::string json = read_json_file(filename);

            if (json.empty())
            {
                DailyLog empty_log;
                empty_log.date = date;
                return empty_log;
            }

            return deserialize_daily_log(json);
        }

        std::vector<DailyLog> LogStorage::get_logs_range(
            const std::chrono::system_clock::time_point& start,
            const std::chrono::system_clock::time_point& end) const
        {
            std::vector<DailyLog> logs;

            auto current = start;
            while (current <= end)
            {
                DailyLog log = get_daily_log(current);
                logs.push_back(log);

                // Move to next day
                current += std::chrono::hours(24);
            }

            return logs;
        }

        void LogStorage::acknowledge_violation(const std::chrono::system_clock::time_point& timestamp)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            for (auto& violation : m_current_log.violations)
            {
                if (violation.timestamp == timestamp)
                {
                    violation.acknowledged = true;
                    violation.acknowledged_time = std::chrono::system_clock::now();
                    break;
                }
            }
        }

        void LogStorage::start_trip(const std::string& origin_city, const std::string& cargo_type)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            m_current_trip.start_time = std::chrono::system_clock::now();
            m_current_trip.origin_city = origin_city;
            m_current_trip.cargo_type = cargo_type;
            m_current_trip.total_distance_km = 0.0;
            m_current_trip.fuel_consumed_liters = 0.0;
            m_current_trip.violation_count = 0;
            m_current_trip.delivered = false;

            Logger::info("Trip started: " + origin_city + " with " + cargo_type);
        }

        void LogStorage::end_trip(const std::string& destination_city, bool delivered)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            m_current_trip.end_time = std::chrono::system_clock::now();
            m_current_trip.destination_city = destination_city;
            m_current_trip.delivered = delivered;

            Logger::info("Trip ended: " + destination_city + (delivered ? " (delivered)" : " (not delivered)"));
        }

        TripLog LogStorage::get_current_trip() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            return m_current_trip;
        }

        bool LogStorage::save_current_day()
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::string json;
            serialize_daily_log(m_current_log, json);

            std::string filename = get_log_filename(m_current_log.date);
            return write_json_file(filename, json);
        }

        bool LogStorage::load_day(const std::chrono::system_clock::time_point& date)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::string filename = get_log_filename(date);
            std::string json = read_json_file(filename);

            if (json.empty())
            {
                Logger::warning("No log file found for date");
                return false;
            }

            m_current_log = deserialize_daily_log(json);
            Logger::info("Loaded log for date");
            return true;
        }

        void LogStorage::clear_current_day()
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            m_current_log.entries.clear();
            m_current_log.violations.clear();
            m_current_log.inspections.clear();
            m_current_log.fuel_stops.clear();
            m_current_log.driving_hours = 0.0;
            m_current_log.on_duty_hours = 0.0;
            m_current_log.off_duty_hours = 0.0;
            m_current_log.sleeper_berth_hours = 0.0;
            m_current_log.total_distance_km = 0.0;

            Logger::info("Current day log cleared");
        }

        std::string LogStorage::get_log_filename(const std::chrono::system_clock::time_point& date) const
        {
            std::time_t tt = std::chrono::system_clock::to_time_t(date);
            std::tm tm = *std::localtime(&tt);

            std::ostringstream oss;
            oss << get_log_directory() << "\\"
                << std::put_time(&tm, "%Y-%m-%d") << ".json";

            return oss.str();
        }

        std::string LogStorage::get_log_directory() const
        {
            return m_base_directory + "\\logs";
        }

        bool LogStorage::ensure_directory_exists(const std::string& path) const
        {
            try
            {
                if (!std::filesystem::exists(path))
                {
                    std::filesystem::create_directories(path);
                }
                return true;
            }
            catch (const std::exception& e)
            {
                Logger::error(std::string("Failed to create directory: ") + e.what());
                return false;
            }
        }

        bool LogStorage::write_json_file(const std::string& filename, const std::string& content) const
        {
            try
            {
                std::ofstream file(filename);
                if (!file.is_open())
                {
                    Logger::error("Failed to open file for writing: " + filename);
                    return false;
                }

                file << content;
                file.close();

                Logger::info("Saved log file: " + filename);
                return true;
            }
            catch (const std::exception& e)
            {
                Logger::error(std::string("Failed to write file: ") + e.what());
                return false;
            }
        }

        std::string LogStorage::read_json_file(const std::string& filename) const
        {
            try
            {
                std::ifstream file(filename);
                if (!file.is_open())
                {
                    return "";
                }

                std::stringstream buffer;
                buffer << file.rdbuf();
                file.close();

                return buffer.str();
            }
            catch (const std::exception& e)
            {
                Logger::error(std::string("Failed to read file: ") + e.what());
                return "";
            }
        }

        void LogStorage::serialize_daily_log(const DailyLog& log, std::string& json) const
        {
            JsonWriter writer;

            writer.start_object();
            writer.write_key("date");
            writer.write_string(time_to_string(log.date));

            writer.write_key("driving_hours");
            writer.write_number(log.driving_hours);

            writer.write_key("on_duty_hours");
            writer.write_number(log.on_duty_hours);

            writer.write_key("off_duty_hours");
            writer.write_number(log.off_duty_hours);

            writer.write_key("sleeper_berth_hours");
            writer.write_number(log.sleeper_berth_hours);

            writer.write_key("total_distance_km");
            writer.write_number(log.total_distance_km);

            writer.write_key("entries");
            writer.start_array();
            for (const auto& entry : log.entries)
            {
                writer.start_object();
                writer.write_key("timestamp");
                writer.write_string(time_to_string(entry.timestamp));
                writer.write_key("from_status");
                writer.write_string(DutyStatusName(entry.from_status));
                writer.write_key("to_status");
                writer.write_string(DutyStatusName(entry.to_status));
                writer.write_key("duration_seconds");
                writer.write_number(entry.duration_seconds);
                writer.write_key("distance_km");
                writer.write_number(entry.distance_km);
                writer.write_key("location");
                writer.write_string(entry.location);
                writer.write_key("notes");
                writer.write_string(entry.notes);
                writer.end_object();
            }
            writer.end_array();

            writer.write_key("violations");
            writer.start_array();
            for (const auto& violation : log.violations)
            {
                writer.start_object();
                writer.write_key("timestamp");
                writer.write_string(time_to_string(violation.timestamp));
                writer.write_key("type");
                writer.write_string(ViolationTypeName(violation.type));
                writer.write_key("severity");
                writer.write_number(violation.severity);
                writer.write_key("description");
                writer.write_string(violation.description);
                writer.write_key("acknowledged");
                writer.write_bool(violation.acknowledged);
                writer.write_key("acknowledged_time");
                if (violation.acknowledged)
                    writer.write_string(time_to_string(violation.acknowledged_time));
                else
                    writer.write_null();
                writer.end_object();
            }
            writer.end_array();

            writer.write_key("inspections");
            writer.start_array();
            for (const auto& inspection : log.inspections)
            {
                writer.start_object();
                writer.write_key("timestamp");
                writer.write_string(time_to_string(inspection.timestamp));
                writer.write_key("type");
                writer.write_string(InspectionTypeName(inspection.type));
                writer.write_key("truck_id");
                writer.write_string(inspection.truck_id);
                writer.write_key("trailer_id");
                writer.write_string(inspection.trailer_id);
                writer.write_key("passed");
                writer.write_bool(inspection.passed);
                writer.write_key("driver_signature");
                writer.write_string(inspection.driver_signature);
                writer.write_key("mechanic_signature");
                writer.write_string(inspection.mechanic_signature);
                writer.write_key("items");
                writer.start_array();
                for (const auto& item : inspection.items)
                {
                    writer.start_object();
                    writer.write_key("name");
                    writer.write_string(item.name);
                    writer.write_key("passed");
                    writer.write_bool(item.passed);
                    writer.write_key("notes");
                    writer.write_string(item.notes);
                    writer.end_object();
                }
                writer.end_array();
                writer.end_object();
            }
            writer.end_array();

            writer.write_key("fuel_stops");
            writer.start_array();
            for (const auto& fuel_stop : log.fuel_stops)
            {
                writer.start_object();
                writer.write_key("timestamp");
                writer.write_string(time_to_string(fuel_stop.timestamp));
                writer.write_key("location");
                writer.write_string(fuel_stop.location);
                writer.write_key("station_name");
                writer.write_string(fuel_stop.station_name);
                writer.write_key("gallons");
                writer.write_number(fuel_stop.gallons);
                writer.write_key("price_per_gallon");
                writer.write_number(fuel_stop.price_per_gallon);
                writer.write_key("total_cost");
                writer.write_number(fuel_stop.total_cost);
                writer.write_key("odometer_km");
                writer.write_number(fuel_stop.odometer_km);
                writer.write_key("fuel_type");
                writer.write_string(fuel_stop.fuel_type);
                writer.end_object();
            }
            writer.end_array();

            writer.end_object();

            json = writer.to_string();
        }

        DailyLog LogStorage::deserialize_daily_log(const std::string& json) const
        {
            // Simplified deserialization - in a real implementation,
            // this would use a proper JSON parser
            DailyLog log;
            log.date = std::chrono::system_clock::now();
            return log;
        }
    }
}
