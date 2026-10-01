#pragma once

#include "ScsTelemetryStructs.h"
#include "SharedMemory.h"
#include "../TelemetryState.h"

namespace DoweTruckElectronics
{
    namespace Scs
    {
        class ScsTelemetryParser
        {
        public:
            ScsTelemetryParser();
            ~ScsTelemetryParser();

            bool connect();
            void disconnect();
            bool is_connected() const;

            TelemetryState read_state();

        private:
            bool validate_telemetry() const;
            TelemetryState map_to_telemetry_state() const;

        private:
            SharedMemory m_shared_memory;
            const TelemetryMap* m_telemetry_map;
            bool m_connected;
        };
    }
}
