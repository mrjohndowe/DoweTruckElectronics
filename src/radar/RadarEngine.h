#pragma once

#include "RadarTypes.h"
#include "RadarSettings.h"
#include "../shared/Events.h"
#include <vector>
#include <memory>
#include <mutex>

namespace DoweTruckElectronics
{
    namespace Radar
    {
        class RadarEngine
        {
        public:
            RadarEngine();
            ~RadarEngine() = default;

            void update(double delta_seconds, double speed_mps);
            void add_simulated_signal(const RadarSignal& signal);
            void clear_signals();

            std::vector<RadarAlert> get_active_alerts() const;
            int get_bogey_count() const;

            void mute();
            void unmute();
            bool is_muted() const;

            RadarSettingsManager& settings();
            const RadarSettingsManager& settings() const;

            Events::Event<RadarAlert>& alert_triggered();
            Events::Event<bool>& mute_changed();

        private:
            void process_signals();
            double calculate_sensitivity_threshold() const;
            void generate_alert(const RadarSignal& signal);
            std::string generate_voice_message(const RadarSignal& signal) const;
            RadarDirection estimate_direction(const RadarSignal& signal) const;

        private:
            std::vector<RadarSignal> m_signals;
            std::vector<RadarAlert> m_active_alerts;
            std::mutex m_mutex;

            bool m_muted;
            double m_current_speed;

            RadarSettingsManager m_settings;

            Events::Event<RadarAlert> m_alert_triggered;
            Events::Event<bool> m_mute_changed;
        };
    }
}
