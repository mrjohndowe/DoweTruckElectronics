#pragma once

#include <iostream>
#include <string>

namespace DoweTruckElectronics
{
    enum class LogLevel
    {
        Debug,
        Info,
        Warning,
        Error
    };

    class Logger
    {
    public:
        static void set_level(LogLevel level)
        {
            s_level = level;
        }

        static void log(LogLevel level, const std::string& message)
        {
            if (level < s_level)
                return;

            const char* level_str = "";
            switch (level)
            {
            case LogLevel::Debug:
                level_str = "[DEBUG]";
                break;
            case LogLevel::Info:
                level_str = "[INFO]";
                break;
            case LogLevel::Warning:
                level_str = "[WARN]";
                break;
            case LogLevel::Error:
                level_str = "[ERROR]";
                break;
            }

            std::cout << level_str << " " << message << std::endl;
        }

        static void debug(const std::string& message)
        {
            log(LogLevel::Debug, message);
        }

        static void info(const std::string& message)
        {
            log(LogLevel::Info, message);
        }

        static void warning(const std::string& message)
        {
            log(LogLevel::Warning, message);
        }

        static void error(const std::string& message)
        {
            log(LogLevel::Error, message);
        }

    private:
        static LogLevel s_level;
    };

    inline LogLevel Logger::s_level = LogLevel::Info;
}
