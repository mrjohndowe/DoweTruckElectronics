#include "SqliteStorage.h"
#include <sqlite3.h>
#include <ctime>
#include <sstream>
#include <iomanip>
#include <stdexcept>
#include <cstring>

namespace DoweTruckElectronics
{
    namespace Persistence
    {
        SqliteStorage::SqliteStorage(const std::string& db_path)
            : m_db_path(db_path)
            , m_db(nullptr)
            , m_stmt_add_log_entry(nullptr)
            , m_stmt_add_violation(nullptr)
            , m_stmt_add_inspection(nullptr)
            , m_stmt_add_inspection_item(nullptr)
            , m_stmt_add_fuel_stop(nullptr)
            , m_stmt_start_trip(nullptr)
            , m_stmt_end_trip(nullptr)
            , m_stmt_get_log_entries(nullptr)
            , m_stmt_get_violations(nullptr)
            , m_stmt_get_inspections(nullptr)
            , m_stmt_get_inspection_items(nullptr)
            , m_stmt_get_fuel_stops(nullptr)
            , m_stmt_get_current_trip(nullptr)
            , m_stmt_acknowledge_violation(nullptr)
            , m_stmt_get_all_log_entries(nullptr)
            , m_stmt_get_all_violations(nullptr)
            , m_stmt_get_all_trips(nullptr)
            , m_stmt_get_total_driving_hours(nullptr)
            , m_stmt_get_total_distance(nullptr)
            , m_stmt_get_total_violations(nullptr)
        {
        }

        SqliteStorage::~SqliteStorage()
        {
            close();
        }

        bool SqliteStorage::initialize()
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            int result = sqlite3_open(m_db_path.c_str(), &m_db);
            if (result != SQLITE_OK)
            {
                return false;
            }

            // Enable foreign keys
            execute_sql("PRAGMA foreign_keys = ON;");

            // Create tables
            if (!create_tables())
            {
                close();
                return false;
            }

            // Prepare statements
            if (!prepare_statements())
            {
                close();
                return false;
            }

            return true;
        }

        bool SqliteStorage::close()
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            finalize_statements();

            if (m_db)
            {
                sqlite3_close(m_db);
                m_db = nullptr;
            }

            return true;
        }

        bool SqliteStorage::create_tables()
        {
            // Log entries table
            const char* create_log_entries = R"(
                CREATE TABLE IF NOT EXISTS log_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    from_status TEXT NOT NULL,
                    to_status TEXT NOT NULL,
                    duration_seconds REAL NOT NULL,
                    distance_km REAL NOT NULL,
                    location TEXT,
                    notes TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_entries(timestamp);
            )";
            if (!execute_sql(create_log_entries)) return false;

            // Violations table
            const char* create_violations = R"(
                CREATE TABLE IF NOT EXISTS violations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    type TEXT NOT NULL,
                    severity REAL NOT NULL,
                    description TEXT NOT NULL,
                    acknowledged INTEGER NOT NULL DEFAULT 0,
                    acknowledged_time TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_violations_timestamp ON violations(timestamp);
            )";
            if (!execute_sql(create_violations)) return false;

            // Inspections table
            const char* create_inspections = R"(
                CREATE TABLE IF NOT EXISTS inspections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    type TEXT NOT NULL,
                    truck_id TEXT,
                    trailer_id TEXT,
                    passed INTEGER NOT NULL,
                    driver_signature TEXT,
                    mechanic_signature TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_inspections_timestamp ON inspections(timestamp);
            )";
            if (!execute_sql(create_inspections)) return false;

            // Inspection items table
            const char* create_inspection_items = R"(
                CREATE TABLE IF NOT EXISTS inspection_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    inspection_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    passed INTEGER NOT NULL,
                    notes TEXT,
                    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
                );
                CREATE INDEX IF NOT EXISTS idx_inspection_items_inspection_id ON inspection_items(inspection_id);
            )";
            if (!execute_sql(create_inspection_items)) return false;

            // Fuel stops table
            const char* create_fuel_stops = R"(
                CREATE TABLE IF NOT EXISTS fuel_stops (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    location TEXT,
                    station_name TEXT,
                    gallons REAL NOT NULL,
                    price_per_gallon REAL NOT NULL,
                    total_cost REAL NOT NULL,
                    odometer_km REAL NOT NULL,
                    fuel_type TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_fuel_stops_timestamp ON fuel_stops(timestamp);
            )";
            if (!execute_sql(create_fuel_stops)) return false;

            // Trips table
            const char* create_trips = R"(
                CREATE TABLE IF NOT EXISTS trips (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    start_time TEXT NOT NULL,
                    end_time TEXT,
                    total_distance_km REAL,
                    fuel_consumed_liters REAL,
                    origin_city TEXT NOT NULL,
                    destination_city TEXT,
                    cargo_type TEXT NOT NULL,
                    violation_count INTEGER NOT NULL DEFAULT 0,
                    delivered INTEGER NOT NULL DEFAULT 0
                );
                CREATE INDEX IF NOT EXISTS idx_trips_start_time ON trips(start_time);
            )";
            if (!execute_sql(create_trips)) return false;

            return true;
        }

        bool SqliteStorage::prepare_statements()
        {
            int result;

            // Add log entry
            result = sqlite3_prepare_v2(m_db,
                "INSERT INTO log_entries (timestamp, from_status, to_status, duration_seconds, distance_km, location, notes) VALUES (?, ?, ?, ?, ?, ?, ?);",
                -1, &m_stmt_add_log_entry, nullptr);
            if (result != SQLITE_OK) return false;

            // Add violation
            result = sqlite3_prepare_v2(m_db,
                "INSERT INTO violations (timestamp, type, severity, description, acknowledged, acknowledged_time) VALUES (?, ?, ?, ?, 0, NULL);",
                -1, &m_stmt_add_violation, nullptr);
            if (result != SQLITE_OK) return false;

            // Add inspection
            result = sqlite3_prepare_v2(m_db,
                "INSERT INTO inspections (timestamp, type, truck_id, trailer_id, passed, driver_signature, mechanic_signature) VALUES (?, ?, ?, ?, ?, ?, ?);",
                -1, &m_stmt_add_inspection, nullptr);
            if (result != SQLITE_OK) return false;

            // Add inspection item
            result = sqlite3_prepare_v2(m_db,
                "INSERT INTO inspection_items (inspection_id, name, passed, notes) VALUES (?, ?, ?, ?);",
                -1, &m_stmt_add_inspection_item, nullptr);
            if (result != SQLITE_OK) return false;

            // Add fuel stop
            result = sqlite3_prepare_v2(m_db,
                "INSERT INTO fuel_stops (timestamp, location, station_name, gallons, price_per_gallon, total_cost, odometer_km, fuel_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
                -1, &m_stmt_add_fuel_stop, nullptr);
            if (result != SQLITE_OK) return false;

            // Start trip
            result = sqlite3_prepare_v2(m_db,
                "INSERT INTO trips (start_time, origin_city, cargo_type) VALUES (?, ?, ?);",
                -1, &m_stmt_start_trip, nullptr);
            if (result != SQLITE_OK) return false;

            // End trip
            result = sqlite3_prepare_v2(m_db,
                "UPDATE trips SET end_time = ?, destination_city = ?, delivered = ? WHERE end_time IS NULL;",
                -1, &m_stmt_end_trip, nullptr);
            if (result != SQLITE_OK) return false;

            // Get log entries by date
            result = sqlite3_prepare_v2(m_db,
                "SELECT timestamp, from_status, to_status, duration_seconds, distance_km, location, notes FROM log_entries WHERE date(timestamp) = date(?);",
                -1, &m_stmt_get_log_entries, nullptr);
            if (result != SQLITE_OK) return false;

            // Get violations by date
            result = sqlite3_prepare_v2(m_db,
                "SELECT timestamp, type, severity, description, acknowledged, acknowledged_time FROM violations WHERE date(timestamp) = date(?);",
                -1, &m_stmt_get_violations, nullptr);
            if (result != SQLITE_OK) return false;

            // Get inspections by date
            result = sqlite3_prepare_v2(m_db,
                "SELECT id, timestamp, type, truck_id, trailer_id, passed, driver_signature, mechanic_signature FROM inspections WHERE date(timestamp) = date(?);",
                -1, &m_stmt_get_inspections, nullptr);
            if (result != SQLITE_OK) return false;

            // Get inspection items
            result = sqlite3_prepare_v2(m_db,
                "SELECT name, passed, notes FROM inspection_items WHERE inspection_id = ?;",
                -1, &m_stmt_get_inspection_items, nullptr);
            if (result != SQLITE_OK) return false;

            // Get fuel stops by date
            result = sqlite3_prepare_v2(m_db,
                "SELECT timestamp, location, station_name, gallons, price_per_gallon, total_cost, odometer_km, fuel_type FROM fuel_stops WHERE date(timestamp) = date(?);",
                -1, &m_stmt_get_fuel_stops, nullptr);
            if (result != SQLITE_OK) return false;

            // Get current trip
            result = sqlite3_prepare_v2(m_db,
                "SELECT start_time, end_time, total_distance_km, fuel_consumed_liters, origin_city, destination_city, cargo_type, violation_count, delivered FROM trips WHERE end_time IS NULL LIMIT 1;",
                -1, &m_stmt_get_current_trip, nullptr);
            if (result != SQLITE_OK) return false;

            // Acknowledge violation
            result = sqlite3_prepare_v2(m_db,
                "UPDATE violations SET acknowledged = 1, acknowledged_time = ? WHERE timestamp = ?;",
                -1, &m_stmt_acknowledge_violation, nullptr);
            if (result != SQLITE_OK) return false;

            // Get all log entries
            result = sqlite3_prepare_v2(m_db,
                "SELECT timestamp, from_status, to_status, duration_seconds, distance_km, location, notes FROM log_entries ORDER BY timestamp;",
                -1, &m_stmt_get_all_log_entries, nullptr);
            if (result != SQLITE_OK) return false;

            // Get all violations
            result = sqlite3_prepare_v2(m_db,
                "SELECT timestamp, type, severity, description, acknowledged, acknowledged_time FROM violations ORDER BY timestamp;",
                -1, &m_stmt_get_all_violations, nullptr);
            if (result != SQLITE_OK) return false;

            // Get all trips
            result = sqlite3_prepare_v2(m_db,
                "SELECT start_time, end_time, total_distance_km, fuel_consumed_liters, origin_city, destination_city, cargo_type, violation_count, delivered FROM trips ORDER BY start_time;",
                -1, &m_stmt_get_all_trips, nullptr);
            if (result != SQLITE_OK) return false;

            // Get total driving hours
            result = sqlite3_prepare_v2(m_db,
                "SELECT SUM(duration_seconds) / 3600.0 FROM log_entries WHERE to_status = 'DRIVING';",
                -1, &m_stmt_get_total_driving_hours, nullptr);
            if (result != SQLITE_OK) return false;

            // Get total distance
            result = sqlite3_prepare_v2(m_db,
                "SELECT SUM(distance_km) FROM log_entries;",
                -1, &m_stmt_get_total_distance, nullptr);
            if (result != SQLITE_OK) return false;

            // Get total violations
            result = sqlite3_prepare_v2(m_db,
                "SELECT COUNT(*) FROM violations;",
                -1, &m_stmt_get_total_violations, nullptr);
            if (result != SQLITE_OK) return false;

            return true;
        }

        void SqliteStorage::finalize_statements()
        {
            sqlite3_finalize(m_stmt_add_log_entry);
            sqlite3_finalize(m_stmt_add_violation);
            sqlite3_finalize(m_stmt_add_inspection);
            sqlite3_finalize(m_stmt_add_inspection_item);
            sqlite3_finalize(m_stmt_add_fuel_stop);
            sqlite3_finalize(m_stmt_start_trip);
            sqlite3_finalize(m_stmt_end_trip);
            sqlite3_finalize(m_stmt_get_log_entries);
            sqlite3_finalize(m_stmt_get_violations);
            sqlite3_finalize(m_stmt_get_inspections);
            sqlite3_finalize(m_stmt_get_inspection_items);
            sqlite3_finalize(m_stmt_get_fuel_stops);
            sqlite3_finalize(m_stmt_get_current_trip);
            sqlite3_finalize(m_stmt_acknowledge_violation);
            sqlite3_finalize(m_stmt_get_all_log_entries);
            sqlite3_finalize(m_stmt_get_all_violations);
            sqlite3_finalize(m_stmt_get_all_trips);
            sqlite3_finalize(m_stmt_get_total_driving_hours);
            sqlite3_finalize(m_stmt_get_total_distance);
            sqlite3_finalize(m_stmt_get_total_violations);

            m_stmt_add_log_entry = nullptr;
            m_stmt_add_violation = nullptr;
            m_stmt_add_inspection = nullptr;
            m_stmt_add_inspection_item = nullptr;
            m_stmt_add_fuel_stop = nullptr;
            m_stmt_start_trip = nullptr;
            m_stmt_end_trip = nullptr;
            m_stmt_get_log_entries = nullptr;
            m_stmt_get_violations = nullptr;
            m_stmt_get_inspections = nullptr;
            m_stmt_get_inspection_items = nullptr;
            m_stmt_get_fuel_stops = nullptr;
            m_stmt_get_current_trip = nullptr;
            m_stmt_acknowledge_violation = nullptr;
            m_stmt_get_all_log_entries = nullptr;
            m_stmt_get_all_violations = nullptr;
            m_stmt_get_all_trips = nullptr;
            m_stmt_get_total_driving_hours = nullptr;
            m_stmt_get_total_distance = nullptr;
            m_stmt_get_total_violations = nullptr;
        }

        bool SqliteStorage::add_log_entry(const LogEntry& entry)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::string timestamp = time_to_string(entry.timestamp);
            std::string from_status = duty_status_to_string(entry.from_status);
            std::string to_status = duty_status_to_string(entry.to_status);

            sqlite3_bind_text(m_stmt_add_log_entry, 1, timestamp.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_log_entry, 2, from_status.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_log_entry, 3, to_status.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_double(m_stmt_add_log_entry, 4, entry.duration_seconds);
            sqlite3_bind_double(m_stmt_add_log_entry, 5, entry.distance_km);
            sqlite3_bind_text(m_stmt_add_log_entry, 6, entry.location.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_log_entry, 7, entry.notes.c_str(), -1, SQLITE_STATIC);

            bool result = execute_sql(m_stmt_add_log_entry);
            sqlite3_reset(m_stmt_add_log_entry);
            return result;
        }

        bool SqliteStorage::add_violation(const ViolationLog& violation)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::string timestamp = time_to_string(violation.timestamp);
            std::string type = violation_type_to_string(violation.type);

            sqlite3_bind_text(m_stmt_add_violation, 1, timestamp.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_violation, 2, type.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_double(m_stmt_add_violation, 3, violation.severity);
            sqlite3_bind_text(m_stmt_add_violation, 4, violation.description.c_str(), -1, SQLITE_STATIC);

            bool result = execute_sql(m_stmt_add_violation);
            sqlite3_reset(m_stmt_add_violation);
            return result;
        }

        bool SqliteStorage::add_inspection(const InspectionLog& inspection)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::string timestamp = time_to_string(inspection.timestamp);
            std::string type = inspection_type_to_string(inspection.type);

            sqlite3_bind_text(m_stmt_add_inspection, 1, timestamp.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_inspection, 2, type.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_inspection, 3, inspection.truck_id.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_inspection, 4, inspection.trailer_id.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_int(m_stmt_add_inspection, 5, inspection.passed ? 1 : 0);
            sqlite3_bind_text(m_stmt_add_inspection, 6, inspection.driver_signature.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_inspection, 7, inspection.mechanic_signature.c_str(), -1, SQLITE_STATIC);

            if (!execute_sql(m_stmt_add_inspection))
            {
                sqlite3_reset(m_stmt_add_inspection);
                return false;
            }

            sqlite3_int64 inspection_id = sqlite3_last_insert_rowid(m_db);
            sqlite3_reset(m_stmt_add_inspection);

            // Add inspection items
            for (const auto& item : inspection.items)
            {
                sqlite3_bind_int64(m_stmt_add_inspection_item, 1, inspection_id);
                sqlite3_bind_text(m_stmt_add_inspection_item, 2, item.name.c_str(), -1, SQLITE_STATIC);
                sqlite3_bind_int(m_stmt_add_inspection_item, 3, item.passed ? 1 : 0);
                sqlite3_bind_text(m_stmt_add_inspection_item, 4, item.notes.c_str(), -1, SQLITE_STATIC);

                if (!execute_sql(m_stmt_add_inspection_item))
                {
                    sqlite3_reset(m_stmt_add_inspection_item);
                    return false;
                }
                sqlite3_reset(m_stmt_add_inspection_item);
            }

            return true;
        }

        bool SqliteStorage::add_fuel_stop(const FuelStopLog& fuel_stop)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::string timestamp = time_to_string(fuel_stop.timestamp);

            sqlite3_bind_text(m_stmt_add_fuel_stop, 1, timestamp.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_fuel_stop, 2, fuel_stop.location.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_add_fuel_stop, 3, fuel_stop.station_name.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_double(m_stmt_add_fuel_stop, 4, fuel_stop.gallons);
            sqlite3_bind_double(m_stmt_add_fuel_stop, 5, fuel_stop.price_per_gallon);
            sqlite3_bind_double(m_stmt_add_fuel_stop, 6, fuel_stop.total_cost);
            sqlite3_bind_double(m_stmt_add_fuel_stop, 7, fuel_stop.odometer_km);
            sqlite3_bind_text(m_stmt_add_fuel_stop, 8, fuel_stop.fuel_type.c_str(), -1, SQLITE_STATIC);

            bool result = execute_sql(m_stmt_add_fuel_stop);
            sqlite3_reset(m_stmt_add_fuel_stop);
            return result;
        }

        std::vector<LogEntry> SqliteStorage::get_log_entries(const std::chrono::system_clock::time_point& date) const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::vector<LogEntry> entries;
            std::string date_str = time_to_string(date);

            sqlite3_bind_text(m_stmt_get_log_entries, 1, date_str.c_str(), -1, SQLITE_STATIC);

            while (sqlite3_step(m_stmt_get_log_entries) == SQLITE_ROW)
            {
                LogEntry entry;
                entry.timestamp = string_to_time(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_log_entries, 0)));
                entry.from_status = string_to_duty_status(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_log_entries, 1)));
                entry.to_status = string_to_duty_status(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_log_entries, 2)));
                entry.duration_seconds = sqlite3_column_double(m_stmt_get_log_entries, 3);
                entry.distance_km = sqlite3_column_double(m_stmt_get_log_entries, 4);

                const char* location = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_log_entries, 5));
                entry.location = location ? location : "";

                const char* notes = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_log_entries, 6));
                entry.notes = notes ? notes : "";

                entries.push_back(entry);
            }

            sqlite3_reset(m_stmt_get_log_entries);
            return entries;
        }

        std::vector<ViolationLog> SqliteStorage::get_violations(const std::chrono::system_clock::time_point& date) const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::vector<ViolationLog> violations;
            std::string date_str = time_to_string(date);

            sqlite3_bind_text(m_stmt_get_violations, 1, date_str.c_str(), -1, SQLITE_STATIC);

            while (sqlite3_step(m_stmt_get_violations) == SQLITE_ROW)
            {
                ViolationLog violation;
                violation.timestamp = string_to_time(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_violations, 0)));
                violation.type = string_to_violation_type(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_violations, 1)));
                violation.severity = sqlite3_column_double(m_stmt_get_violations, 2);

                const char* description = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_violations, 3));
                violation.description = description ? description : "";

                violation.acknowledged = sqlite3_column_int(m_stmt_get_violations, 4) != 0;

                const char* acknowledged_time = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_violations, 5));
                if (acknowledged_time)
                {
                    violation.acknowledged_time = string_to_time(acknowledged_time);
                }

                violations.push_back(violation);
            }

            sqlite3_reset(m_stmt_get_violations);
            return violations;
        }

        std::vector<InspectionLog> SqliteStorage::get_inspections(const std::chrono::system_clock::time_point& date) const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::vector<InspectionLog> inspections;
            std::string date_str = time_to_string(date);

            sqlite3_bind_text(m_stmt_get_inspections, 1, date_str.c_str(), -1, SQLITE_STATIC);

            while (sqlite3_step(m_stmt_get_inspections) == SQLITE_ROW)
            {
                InspectionLog inspection;
                inspection.timestamp = string_to_time(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_inspections, 1)));
                inspection.type = string_to_inspection_type(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_inspections, 2)));

                const char* truck_id = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_inspections, 3));
                inspection.truck_id = truck_id ? truck_id : "";

                const char* trailer_id = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_inspections, 4));
                inspection.trailer_id = trailer_id ? trailer_id : "";

                inspection.passed = sqlite3_column_int(m_stmt_get_inspections, 5) != 0;

                const char* driver_signature = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_inspections, 6));
                inspection.driver_signature = driver_signature ? driver_signature : "";

                const char* mechanic_signature = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_inspections, 7));
                inspection.mechanic_signature = mechanic_signature ? mechanic_signature : "";

                // Get inspection items
                sqlite3_int64 inspection_id = sqlite3_column_int64(m_stmt_get_inspections, 0);
                sqlite3_bind_int64(m_stmt_get_inspection_items, 1, inspection_id);

                while (sqlite3_step(m_stmt_get_inspection_items) == SQLITE_ROW)
                {
                    InspectionItem item;
                    const char* name = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_inspection_items, 0));
                    item.name = name ? name : "";
                    item.passed = sqlite3_column_int(m_stmt_get_inspection_items, 1) != 0;

                    const char* notes = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_inspection_items, 2));
                    item.notes = notes ? notes : "";

                    inspection.items.push_back(item);
                }

                sqlite3_reset(m_stmt_get_inspection_items);
                inspections.push_back(inspection);
            }

            sqlite3_reset(m_stmt_get_inspections);
            return inspections;
        }

        std::vector<FuelStopLog> SqliteStorage::get_fuel_stops(const std::chrono::system_clock::time_point& date) const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::vector<FuelStopLog> fuel_stops;
            std::string date_str = time_to_string(date);

            sqlite3_bind_text(m_stmt_get_fuel_stops, 1, date_str.c_str(), -1, SQLITE_STATIC);

            while (sqlite3_step(m_stmt_get_fuel_stops) == SQLITE_ROW)
            {
                FuelStopLog fuel_stop;
                fuel_stop.timestamp = string_to_time(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_fuel_stops, 0)));

                const char* location = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_fuel_stops, 1));
                fuel_stop.location = location ? location : "";

                const char* station_name = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_fuel_stops, 2));
                fuel_stop.station_name = station_name ? station_name : "";

                fuel_stop.gallons = sqlite3_column_double(m_stmt_get_fuel_stops, 3);
                fuel_stop.price_per_gallon = sqlite3_column_double(m_stmt_get_fuel_stops, 4);
                fuel_stop.total_cost = sqlite3_column_double(m_stmt_get_fuel_stops, 5);
                fuel_stop.odometer_km = sqlite3_column_double(m_stmt_get_fuel_stops, 6);

                const char* fuel_type = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_fuel_stops, 7));
                fuel_stop.fuel_type = fuel_type ? fuel_type : "";

                fuel_stops.push_back(fuel_stop);
            }

            sqlite3_reset(m_stmt_get_fuel_stops);
            return fuel_stops;
        }

        DailyLog SqliteStorage::get_daily_log(const std::chrono::system_clock::time_point& date) const
        {
            DailyLog log;
            log.date = date;
            log.entries = get_log_entries(date);
            log.violations = get_violations(date);
            log.inspections = get_inspections(date);
            log.fuel_stops = get_fuel_stops(date);

            // Calculate totals
            log.driving_hours = 0.0;
            log.on_duty_hours = 0.0;
            log.off_duty_hours = 0.0;
            log.sleeper_berth_hours = 0.0;
            log.total_distance_km = 0.0;

            for (const auto& entry : log.entries)
            {
                if (entry.to_status == DutyStatus::Driving)
                {
                    log.driving_hours += entry.duration_seconds / 3600.0;
                }
                else if (entry.to_status == DutyStatus::OnDuty)
                {
                    log.on_duty_hours += entry.duration_seconds / 3600.0;
                }
                else if (entry.to_status == DutyStatus::OffDuty)
                {
                    log.off_duty_hours += entry.duration_seconds / 3600.0;
                }
                else if (entry.to_status == DutyStatus::SleeperBerth)
                {
                    log.sleeper_berth_hours += entry.duration_seconds / 3600.0;
                }
                log.total_distance_km += entry.distance_km;
            }

            return log;
        }

        std::vector<DailyLog> SqliteStorage::get_logs_range(
            const std::chrono::system_clock::time_point& start,
            const std::chrono::system_clock::time_point& end) const
        {
            std::vector<DailyLog> logs;

            auto current = start;
            while (current <= end)
            {
                logs.push_back(get_daily_log(current));
                current += std::chrono::hours(24);
            }

            return logs;
        }

        bool SqliteStorage::acknowledge_violation(const std::chrono::system_clock::time_point& timestamp)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::string timestamp_str = time_to_string(timestamp);
            std::string now_str = time_to_string(std::chrono::system_clock::now());

            sqlite3_bind_text(m_stmt_acknowledge_violation, 1, now_str.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_acknowledge_violation, 2, timestamp_str.c_str(), -1, SQLITE_STATIC);

            bool result = execute_sql(m_stmt_acknowledge_violation);
            sqlite3_reset(m_stmt_acknowledge_violation);
            return result;
        }

        bool SqliteStorage::start_trip(const std::string& origin_city, const std::string& cargo_type)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::string now_str = time_to_string(std::chrono::system_clock::now());

            sqlite3_bind_text(m_stmt_start_trip, 1, now_str.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_start_trip, 2, origin_city.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_start_trip, 3, cargo_type.c_str(), -1, SQLITE_STATIC);

            bool result = execute_sql(m_stmt_start_trip);
            sqlite3_reset(m_stmt_start_trip);
            return result;
        }

        bool SqliteStorage::end_trip(const std::string& destination_city, bool delivered)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::string now_str = time_to_string(std::chrono::system_clock::now());

            sqlite3_bind_text(m_stmt_end_trip, 1, now_str.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(m_stmt_end_trip, 2, destination_city.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_int(m_stmt_end_trip, 3, delivered ? 1 : 0);

            bool result = execute_sql(m_stmt_end_trip);
            sqlite3_reset(m_stmt_end_trip);
            return result;
        }

        TripLog SqliteStorage::get_current_trip() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            TripLog trip;
            trip.start_time = std::chrono::system_clock::time_point();
            trip.end_time = std::chrono::system_clock::time_point();
            trip.total_distance_km = 0.0;
            trip.fuel_consumed_liters = 0.0;
            trip.violation_count = 0;
            trip.delivered = false;

            if (sqlite3_step(m_stmt_get_current_trip) == SQLITE_ROW)
            {
                trip.start_time = string_to_time(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_current_trip, 0)));

                const char* end_time = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_current_trip, 1));
                if (end_time)
                {
                    trip.end_time = string_to_time(end_time);
                }

                trip.total_distance_km = sqlite3_column_double(m_stmt_get_current_trip, 2);
                trip.fuel_consumed_liters = sqlite3_column_double(m_stmt_get_current_trip, 3);

                const char* origin_city = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_current_trip, 4));
                trip.origin_city = origin_city ? origin_city : "";

                const char* destination_city = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_current_trip, 5));
                trip.destination_city = destination_city ? destination_city : "";

                const char* cargo_type = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_current_trip, 6));
                trip.cargo_type = cargo_type ? cargo_type : "";

                trip.violation_count = sqlite3_column_int(m_stmt_get_current_trip, 7);
                trip.delivered = sqlite3_column_int(m_stmt_get_current_trip, 8) != 0;
            }

            sqlite3_reset(m_stmt_get_current_trip);
            return trip;
        }

        std::vector<LogEntry> SqliteStorage::get_all_log_entries() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::vector<LogEntry> entries;

            while (sqlite3_step(m_stmt_get_all_log_entries) == SQLITE_ROW)
            {
                LogEntry entry;
                entry.timestamp = string_to_time(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_log_entries, 0)));
                entry.from_status = string_to_duty_status(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_log_entries, 1)));
                entry.to_status = string_to_duty_status(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_log_entries, 2)));
                entry.duration_seconds = sqlite3_column_double(m_stmt_get_all_log_entries, 3);
                entry.distance_km = sqlite3_column_double(m_stmt_get_all_log_entries, 4);

                const char* location = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_log_entries, 5));
                entry.location = location ? location : "";

                const char* notes = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_log_entries, 6));
                entry.notes = notes ? notes : "";

                entries.push_back(entry);
            }

            sqlite3_reset(m_stmt_get_all_log_entries);
            return entries;
        }

        std::vector<ViolationLog> SqliteStorage::get_all_violations() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::vector<ViolationLog> violations;

            while (sqlite3_step(m_stmt_get_all_violations) == SQLITE_ROW)
            {
                ViolationLog violation;
                violation.timestamp = string_to_time(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_violations, 0)));
                violation.type = string_to_violation_type(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_violations, 1)));
                violation.severity = sqlite3_column_double(m_stmt_get_all_violations, 2);

                const char* description = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_violations, 3));
                violation.description = description ? description : "";

                violation.acknowledged = sqlite3_column_int(m_stmt_get_all_violations, 4) != 0;

                const char* acknowledged_time = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_violations, 5));
                if (acknowledged_time)
                {
                    violation.acknowledged_time = string_to_time(acknowledged_time);
                }

                violations.push_back(violation);
            }

            sqlite3_reset(m_stmt_get_all_violations);
            return violations;
        }

        std::vector<TripLog> SqliteStorage::get_all_trips() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            std::vector<TripLog> trips;

            while (sqlite3_step(m_stmt_get_all_trips) == SQLITE_ROW)
            {
                TripLog trip;
                trip.start_time = string_to_time(reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_trips, 0)));

                const char* end_time = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_trips, 1));
                if (end_time)
                {
                    trip.end_time = string_to_time(end_time);
                }

                trip.total_distance_km = sqlite3_column_double(m_stmt_get_all_trips, 2);
                trip.fuel_consumed_liters = sqlite3_column_double(m_stmt_get_all_trips, 3);

                const char* origin_city = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_trips, 4));
                trip.origin_city = origin_city ? origin_city : "";

                const char* destination_city = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_trips, 5));
                trip.destination_city = destination_city ? destination_city : "";

                const char* cargo_type = reinterpret_cast<const char*>(sqlite3_column_text(m_stmt_get_all_trips, 6));
                trip.cargo_type = cargo_type ? cargo_type : "";

                trip.violation_count = sqlite3_column_int(m_stmt_get_all_trips, 7);
                trip.delivered = sqlite3_column_int(m_stmt_get_all_trips, 8) != 0;

                trips.push_back(trip);
            }

            sqlite3_reset(m_stmt_get_all_trips);
            return trips;
        }

        double SqliteStorage::get_total_driving_hours() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            double total = 0.0;
            if (sqlite3_step(m_stmt_get_total_driving_hours) == SQLITE_ROW)
            {
                total = sqlite3_column_double(m_stmt_get_total_driving_hours, 0);
            }
            sqlite3_reset(m_stmt_get_total_driving_hours);
            return total;
        }

        double SqliteStorage::get_total_distance_km() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            double total = 0.0;
            if (sqlite3_step(m_stmt_get_total_distance) == SQLITE_ROW)
            {
                total = sqlite3_column_double(m_stmt_get_total_distance, 0);
            }
            sqlite3_reset(m_stmt_get_total_distance);
            return total;
        }

        int SqliteStorage::get_total_violations() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            int total = 0;
            if (sqlite3_step(m_stmt_get_total_violations) == SQLITE_ROW)
            {
                total = sqlite3_column_int(m_stmt_get_total_violations, 0);
            }
            sqlite3_reset(m_stmt_get_total_violations);
            return total;
        }

        bool SqliteStorage::vacuum()
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            return execute_sql("VACUUM;");
        }

        bool SqliteStorage::check_integrity()
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            return execute_sql("PRAGMA integrity_check;");
        }

        bool SqliteStorage::execute_sql(const std::string& sql) const
        {
            char* error_msg = nullptr;
            int result = sqlite3_exec(m_db, sql.c_str(), nullptr, nullptr, &error_msg);
            if (result != SQLITE_OK)
            {
                if (error_msg)
                {
                    sqlite3_free(error_msg);
                }
                return false;
            }
            return true;
        }

        bool SqliteStorage::execute_sql(sqlite3_stmt* stmt) const
        {
            int result = sqlite3_step(stmt);
            return result == SQLITE_DONE;
        }

        std::string SqliteStorage::time_to_string(const std::chrono::system_clock::time_point& tp) const
        {
            auto time_t = std::chrono::system_clock::to_time_t(tp);
            std::tm tm;
#ifdef _WIN32
            localtime_s(&tm, &time_t);
#else
            localtime_r(&time_t, &tm);
#endif
            std::ostringstream oss;
            oss << std::put_time(&tm, "%Y-%m-%d %H:%M:%S");
            return oss.str();
        }

        std::chrono::system_clock::time_point SqliteStorage::string_to_time(const std::string& str) const
        {
            std::tm tm = {};
            std::istringstream iss(str);
            iss >> std::get_time(&tm, "%Y-%m-%d %H:%M:%S");
            auto time_t = std::mktime(&tm);
            return std::chrono::system_clock::from_time_t(time_t);
        }

        std::string SqliteStorage::duty_status_to_string(DutyStatus status) const
        {
            switch (status)
            {
            case DutyStatus::OffDuty: return "OFF_DUTY";
            case DutyStatus::SleeperBerth: return "SLEEPER_BERTH";
            case DutyStatus::OnDuty: return "ON_DUTY";
            case DutyStatus::Driving: return "DRIVING";
            case DutyStatus::PersonalConveyance: return "PERSONAL_CONVEYANCE";
            case DutyStatus::YardMove: return "YARD_MOVE";
            default: return "UNKNOWN";
            }
        }

        DutyStatus SqliteStorage::string_to_duty_status(const std::string& str) const
        {
            if (str == "OFF_DUTY") return DutyStatus::OffDuty;
            if (str == "SLEEPER_BERTH") return DutyStatus::SleeperBerth;
            if (str == "ON_DUTY") return DutyStatus::OnDuty;
            if (str == "DRIVING") return DutyStatus::Driving;
            if (str == "PERSONAL_CONVEYANCE") return DutyStatus::PersonalConveyance;
            if (str == "YARD_MOVE") return DutyStatus::YardMove;
            return DutyStatus::OffDuty;
        }

        std::string SqliteStorage::violation_type_to_string(ViolationType type) const
        {
            return ViolationTypeName(type);
        }

        ViolationType SqliteStorage::string_to_violation_type(const std::string& str) const
        {
            if (str == "DRIVING TIME EXCEEDED") return ViolationType::DrivingTimeExceeded;
            if (str == "30-MINUTE BREAK MISSED") return ViolationType::ThirtyMinuteBreakMissed;
            if (str == "14-HOUR VIOLATION") return ViolationType::FourteenHourViolation;
            if (str == "CYCLE LIMIT VIOLATION") return ViolationType::CycleLimitViolation;
            return ViolationType::Unknown;
        }

        std::string SqliteStorage::inspection_type_to_string(InspectionType type) const
        {
            return InspectionTypeName(type);
        }

        InspectionType SqliteStorage::string_to_inspection_type(const std::string& str) const
        {
            if (str == "PRE-TRIP") return InspectionType::PreTrip;
            if (str == "POST-TRIP") return InspectionType::PostTrip;
            if (str == "DVIR") return InspectionType::DVIR;
            return InspectionType::PreTrip;
        }
    }
}
