#include "RadarEngine.h"
#include "../shared/Events.h"
#include "../shared/Logging.h"
#include <cmath>
#include <sstream>
#include <algorithm>

namespace DoweTruckElectronics
{
    namespace Radar
    {
        RadarEngine::RadarEngine()
            : m_muted(false)
            , m_current_speed(0.0)
        {
        }

        void RadarEngine::update(double delta_seconds, double speed_mps)
        {
            m_current_speed = speed_mps;

            std::lock_guard<std::mutex> lock(m_mutex);

            // Remove inactive signals
            m_signals.erase(
                std::remove_if(m_signals.begin(), m_signals.end(),
                    [](const RadarSignal& signal) { return !signal.is_active; }),
                m_signals.end());

            // Decay signal strength over time
            for (auto& signal : m_signals)
            {
                signal.strength *= 0.98; // Decay factor
                if (signal.strength < 0.01)
                    signal.is_active = false;
            }

            process_signals();
        }

        void RadarEngine::add_simulated_signal(const RadarSignal& signal)
        {
            std::lock_guard<std::mutex> lock(m_mutex);

            // Check if band is enabled
            if (!m_settings.is_band_enabled(signal.band))
                return;

            // Check sensitivity threshold
            double threshold = calculate_sensitivity_threshold();
            if (signal.strength < threshold)
                return;

            m_signals.push_back(signal);
        }

        void RadarEngine::clear_signals()
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            m_signals.clear();
            m_active_alerts.clear();
        }

        std::vector<RadarAlert> RadarEngine::get_active_alerts() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            return m_active_alerts;
        }

        int RadarEngine::get_bogey_count() const
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            return static_cast<int>(m_active_alerts.size());
        }

        void RadarEngine::mute()
        {
            m_muted = true;
            m_mute_changed.emit(true);
            Logger::info("Radar detector muted");
        }

        void RadarEngine::unmute()
        {
            m_muted = false;
            m_mute_changed.emit(false);
            Logger::info("Radar detector unmuted");
        }

        bool RadarEngine::is_muted() const
        {
            return m_muted;
        }

        RadarSettingsManager& RadarEngine::settings()
        {
            return m_settings;
        }

        const RadarSettingsManager& RadarEngine::settings() const
        {
            return m_settings;
        }

        DoweTruckElectronics::Event<RadarAlert>& RadarEngine::alert_triggered()
        {
            return m_alert_triggered;
        }

        DoweTruckElectronics::Event<bool>& RadarEngine::mute_changed()
        {
            return m_mute_changed;
        }

        void RadarEngine::process_signals()
        {
            m_active_alerts.clear();

            for (const auto& signal : m_signals)
            {
                if (!signal.is_active)
                    continue;

                // Apply sensitivity filter
                double threshold = calculate_sensitivity_threshold();
                if (signal.strength < threshold)
                    continue;

                // Apply auto-mute at low speeds
                if (m_settings.get_settings().auto_mute && m_current_speed < 5.0)
                    continue;

                // Estimate direction
                RadarDirection direction = estimate_direction(signal);

                // Create alert
                RadarAlert alert;
                alert.signal = signal;
                alert.signal.direction = direction;
                alert.bogey_count = static_cast<int>(m_signals.size());
                alert.is_muted = m_muted;
                alert.has_voice_alert = m_settings.get_settings().voice_enabled && !m_muted;
                alert.voice_message = generate_voice_message(signal);

                m_active_alerts.push_back(alert);

                // Emit alert event for new signals
                m_alert_triggered.emit(alert);
            }
        }

        double RadarEngine::calculate_sensitivity_threshold() const
        {
            const RadarSettings& settings = m_settings.get_settings();

            switch (settings.sensitivity)
            {
            case SensitivityMode::Highway:
                return 0.1; // High sensitivity
            case SensitivityMode::Auto:
                // Auto-adjust based on speed
                if (m_current_speed > 25.0)
                    return 0.1;
                else if (m_current_speed > 15.0)
                    return 0.2;
                else
                    return 0.3;
            case SensitivityMode::City:
                return 0.3; // Lower sensitivity for city
            case SensitivityMode::NoX:
                return 0.2; // Medium sensitivity, X band disabled in settings
            default:
                return 0.2;
            }
        }

        void RadarEngine::generate_alert(const RadarSignal& signal)
        {
            RadarAlert alert;
            alert.signal = signal;
            alert.bogey_count = static_cast<int>(m_signals.size());
            alert.is_muted = m_muted;
            alert.has_voice_alert = m_settings.get_settings().voice_enabled && !m_muted;
            alert.voice_message = generate_voice_message(signal);

            m_active_alerts.push_back(alert);
            m_alert_triggered.emit(alert);
        }

        std::string RadarEngine::generate_voice_message(const RadarSignal& signal) const
        {
            std::ostringstream oss;

            oss << BandName(signal.band) << " BAND";

            RadarDirection direction = estimate_direction(signal);
            if (direction != RadarDirection::Unknown)
            {
                oss << " " << DirectionName(direction);
            }

            return oss.str();
        }

        RadarDirection RadarEngine::estimate_direction(const RadarSignal& signal) const
        {
            // In a real implementation, this would use multiple antennas
            // For simulation, we'll use the signal's direction field
            return signal.direction;
        }
    }
}
