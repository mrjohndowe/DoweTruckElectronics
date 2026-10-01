#pragma once

#include <string>
#include <sstream>
#include <chrono>

namespace DoweTruckElectronics
{
    namespace Persistence
    {
        class JsonWriter
        {
        public:
            JsonWriter();
            ~JsonWriter() = default;

            void start_object();
            void end_object();
            void start_array();
            void end_array();

            void write_key(const std::string& key);
            void write_string(const std::string& value);
            void write_number(double value);
            void write_bool(bool value);
            void write_null();

            std::string to_string() const;

        private:
            std::ostringstream m_stream;
            bool m_needs_comma;
            int m_indent_level;

            void write_indent();
            void write_comma_if_needed();
        };

        // Helper functions for converting time to string
        std::string time_to_string(const std::chrono::system_clock::time_point& time);
        std::string duration_to_string(double seconds);
    }
}
