#pragma once

#include <functional>
#include <vector>

namespace DoweTruckElectronics
{
    template<typename... Args>
    class Event
    {
    public:
        using Callback = std::function<void(Args...)>;

        void subscribe(Callback callback)
        {
            m_callbacks.push_back(std::move(callback));
        }

        void emit(Args... args) const
        {
            for (const auto& callback : m_callbacks)
            {
                if (callback)
                    callback(args...);
            }
        }

    private:
        std::vector<Callback> m_callbacks;
    };

    // Telemetry events
    struct TelemetryEvents
    {
        Event<bool> connected_changed;
        Event<bool> engine_running_changed;
        Event<bool> parking_brake_changed;
        Event<double> speed_changed;
        Event<bool> trailer_connected_changed;
        Event<bool> paused_changed;
        Event<bool> sleeping_changed;
    };
}
