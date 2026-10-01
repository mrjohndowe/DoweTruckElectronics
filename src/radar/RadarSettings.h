#pragma once

#include "RadarTypes.h"
#include "../shared/Events.h"

namespace DoweTruckElectronics
{
    namespace Radar
    {
        struct RadarSettings
        {
            SensitivityMode sensitivity;
            bool voice_enabled;
            bool auto_mute;
            bool auto_dim;
            bool x_band_enabled;
            bool k_band_enabled;
            bool ka_band_enabled;
            bool laser_enabled;
            bool pop_enabled;
            bool mrcd_enabled;
            double volume;
            double brightness;

            RadarSettings()
                : sensitivity(SensitivityMode::Auto)
                , voice_enabled(true)
                , auto_mute(false)
                , auto_dim(true)
                , x_band_enabled(true)
                , k_band_enabled(true)
                , ka_band_enabled(true)
                , laser_enabled(true)
                , pop_enabled(true)
                , mrcd_enabled(false)
                , volume(0.8)
                , brightness(0.8)
            {
            }
        };

        class RadarSettingsManager
        {
        public:
            RadarSettingsManager();
            ~RadarSettingsManager() = default;

            const RadarSettings& get_settings() const;
            void set_settings(const RadarSettings& settings);

            void set_sensitivity(SensitivityMode mode);
            void set_voice_enabled(bool enabled);
            void set_auto_mute(bool enabled);
            void set_auto_dim(bool enabled);
            void set_band_enabled(RadarBand band, bool enabled);
            void set_volume(double volume);
            void set_brightness(double brightness);

            bool is_band_enabled(RadarBand band) const;

            Events::Event<RadarSettings>& settings_changed();

        private:
            void notify_settings_changed();

        private:
            RadarSettings m_settings;
            Events::Event<RadarSettings> m_settings_changed;
        };
    }
}
