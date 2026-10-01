#pragma once

#include "TelemetryState.h"
#include "../shared/Events.h"

namespace DoweTruckElectronics
{
    class ITelemetrySource
    {
    public:
        virtual ~ITelemetrySource() = default;

        virtual bool connect() = 0;
        virtual void disconnect() = 0;
        virtual bool is_connected() const = 0;

        virtual TelemetryState read_state() = 0;

        virtual TelemetryEvents& events() = 0;
    };
}
