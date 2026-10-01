#include "JsonWriter.h"
#include <iomanip>
#include <ctime>

namespace DoweTruckElectronics
{
    namespace Persistence
    {
        JsonWriter::JsonWriter()
            : m_needs_comma(false)
            , m_indent_level(0)
        {
        }

        void JsonWriter::start_object()
        {
            write_comma_if_needed();
            m_stream << "{\n";
            m_indent_level++;
            m_needs_comma = false;
        }

        void JsonWriter::end_object()
        {
            m_indent_level--;
            write_indent();
            m_stream << "}";
            m_needs_comma = true;
        }

        void JsonWriter::start_array()
        {
            write_comma_if_needed();
            m_stream << "[\n";
            m_indent_level++;
            m_needs_comma = false;
        }

        void JsonWriter::end_array()
        {
            m_indent_level--;
            write_indent();
            m_stream << "]";
            m_needs_comma = true;
        }

        void JsonWriter::write_key(const std::string& key)
        {
            write_comma_if_needed();
            write_indent();
            m_stream << "\"" << key << "\": ";
            m_needs_comma = false;
        }

        void JsonWriter::write_string(const std::string& value)
        {
            write_comma_if_needed();
            m_stream << "\"" << value << "\"";
            m_needs_comma = true;
        }

        void JsonWriter::write_number(double value)
        {
            write_comma_if_needed();
            m_stream << std::fixed << std::setprecision(2) << value;
            m_needs_comma = true;
        }

        void JsonWriter::write_bool(bool value)
        {
            write_comma_if_needed();
            m_stream << (value ? "true" : "false");
            m_needs_comma = true;
        }

        void JsonWriter::write_null()
        {
            write_comma_if_needed();
            m_stream << "null";
            m_needs_comma = true;
        }

        std::string JsonWriter::to_string() const
        {
            return m_stream.str();
        }

        void JsonWriter::write_indent()
        {
            for (int i = 0; i < m_indent_level; ++i)
            {
                m_stream << "  ";
            }
        }

        void JsonWriter::write_comma_if_needed()
        {
            if (m_needs_comma)
            {
                m_stream << ",\n";
            }
        }

        std::string time_to_string(const std::chrono::system_clock::time_point& time)
        {
            std::time_t tt = std::chrono::system_clock::to_time_t(time);
            std::tm tm = *std::localtime(&tt);
            std::ostringstream oss;
            oss << std::put_time(&tm, "%Y-%m-%d %H:%M:%S");
            return oss.str();
        }

        std::string duration_to_string(double seconds)
        {
            int hours = static_cast<int>(seconds / 3600);
            int minutes = static_cast<int>((seconds - hours * 3600) / 60);
            int secs = static_cast<int>(seconds - hours * 3600 - minutes * 60);

            std::ostringstream oss;
            oss << hours << "h " << minutes << "m " << secs << "s";
            return oss.str();
        }
    }
}
