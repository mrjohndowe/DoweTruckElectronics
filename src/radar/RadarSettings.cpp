#include "RadarSettings.h"

namespace DoweTruckElectronics
{
    namespace Radar
    {
        RadarSettingsManager::RadarSettingsManager()
        {
        }

        const RadarSettings& RadarSettingsManager::get_settings() const
        {
            return m_settings;
        }

        void RadarSettingsManager::set_settings(const RadarSettings& settings)
        {
            m_settings = settings;
            notify_settings_changed();
        }

        void RadarSettingsManager::set_sensitivity(SensitivityMode mode)
        {
            m_settings.sensitivity = mode;
            notify_settings_changed();
        }

        void RadarSettingsManager::set_voice_enabled(bool enabled)
        {
            m_settings.voice_enabled = enabled;
            notify_settings_changed();
        }

        void RadarSettingsManager::set_auto_mute(bool enabled)
        {
            m_settings.auto_mute = enabled;
            notify_settings_changed();
        }

        void RadarSettingsManager::set_auto_dim(bool enabled)
        {
            m_settings.auto_dim = enabled;
            notify_settings_changed();
        }

        void RadarSettingsManager::set_band_enabled(RadarBand band, bool enabled)
        {
            switch (band)
            {
            case RadarBand::X:
                m_settings.x_band_enabled = enabled;
                break;
            case RadarBand::K:
                m_settings.k_band_enabled = enabled;
                break;
            case RadarBand::Ka:
                m_settings.ka_band_enabled = enabled;
                break;
            case RadarBand::Laser:
                m_settings.laser_enabled = enabled;
                break;
            case RadarBand::POP:
                m_settings.pop_enabled = enabled;
                break;
            case RadarBand::MRCD:
                m_settings.mrcd_enabled = enabled;
                break;
            default:
                break;
            }
            notify_settings_changed();
        }

        void RadarSettingsManager::set_volume(double volume)
        {
            m_settings.volume = volume;
            notify_settings_changed();
        }

        void RadarSettingsManager::set_brightness(double brightness)
        {
            m_settings.brightness = brightness;
            notify_settings_changed();
        }

        bool RadarSettingsManager::is_band_enabled(RadarBand band) const
        {
            switch (band)
            {
            case RadarBand::X:
                return m_settings.x_band_enabled;
            case RadarBand::K:
                return m_settings.k_band_enabled;
            case RadarBand::Ka:
                return m_settings.ka_band_enabled;
            case RadarBand::Laser:
                return m_settings.laser_enabled;
            case RadarBand::POP:
                return m_settings.pop_enabled;
            case RadarBand::MRCD:
                return m_settings.mrcd_enabled;
            default:
                return false;
            }
        }

        Events::Event<RadarSettings>& RadarSettingsManager::settings_changed()
        {
            return m_settings_changed;
        }

        void RadarSettingsManager::notify_settings_changed()
        {
            m_settings_changed.emit(m_settings);
        }
    }
}
