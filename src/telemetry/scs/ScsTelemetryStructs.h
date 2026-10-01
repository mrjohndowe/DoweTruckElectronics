#pragma once

#include <cstdint>

namespace DoweTruckElectronics
{
    namespace Scs
    {
        constexpr uint32_t PLUGIN_REVISION = 12;
        constexpr uint32_t GAME_UNKNOWN = 0;
        constexpr uint32_t GAME_ETS2 = 1;
        constexpr uint32_t GAME_ATS = 2;
        constexpr uint32_t STRING_SIZE = 64;
        constexpr uint32_t WHEEL_SIZE = 14;
        constexpr uint32_t SUBSTANCE_SIZE = 25;
        constexpr uint32_t MAX_TRAILER_COUNT = 10;
        constexpr uint32_t SHARED_MEMORY_SIZE = 32 * 1024;

        struct TrailerData
        {
            // Zone 1: Booleans
            struct
            {
                bool wheelSteerable[16];
                bool wheelSimulated[16];
                bool wheelPowered[16];
                bool wheelLiftable[16];
            } con_b;
            struct
            {
                bool wheelOnGround[16];
                bool attached;
            } com_b;
            char buffer_b[3];

            // Zone 2: Unsigned integers
            struct
            {
                uint32_t wheelSubstance[16];
            } com_ui;
            struct
            {
                uint32_t wheelCount;
            } con_ui;

            // Zone 3: Floats
            struct
            {
                float cargoDamage;
                float wearChassis;
                float wearWheels;
                float wearBody;
                float wheelSuspDeflection[16];
                float wheelVelocity[16];
                float wheelSteering[16];
                float wheelRotation[16];
                float wheelLift[16];
                float wheelLiftOffset[16];
            } com_f;
            struct
            {
                float wheelRadius[16];
            } con_f;

            // Zone 4: Float vectors
            struct
            {
                float linearVelocityX;
                float linearVelocityY;
                float linearVelocityZ;
                float angularVelocityX;
                float angularVelocityY;
                float angularVelocityZ;
                float linearAccelerationX;
                float linearAccelerationY;
                float linearAccelerationZ;
                float angularAccelerationX;
                float angularAccelerationY;
                float angularAccelerationZ;
            } com_fv;
            struct
            {
                float hookPositionX;
                float hookPositionY;
                float hookPositionZ;
                float wheelPositionX[16];
                float wheelPositionY[16];
                float wheelPositionZ[16];
            } con_fv;
            char buffer_fv[4];

            // Zone 5: Double placement
            struct
            {
                double worldX;
                double worldY;
                double worldZ;
                double rotationX;
                double rotationY;
                double rotationZ;
            } com_dp;

            // Zone 6: Strings
            struct
            {
                char id[STRING_SIZE];
                char cargoAccessoryId[STRING_SIZE];
                char bodyType[STRING_SIZE];
                char brandId[STRING_SIZE];
                char brand[STRING_SIZE];
                char name[STRING_SIZE];
                char chainType[STRING_SIZE];
                char licensePlate[STRING_SIZE];
                char licensePlateCountry[STRING_SIZE];
                char licensePlateCountryId[STRING_SIZE];
            } con_s;
        };

        struct TelemetryMap
        {
            // Zone 1: Control values
            bool sdkActive;
            char placeHolder[3];
            bool paused;
            char placeHolder2[3];
            uint64_t time;
            uint64_t simulatedTime;
            uint64_t renderTime;
            int64_t multiplayerTimeOffset;

            // Zone 2: Unsigned integers
            struct
            {
                uint32_t telemetry_plugin_revision;
                uint32_t version_major;
                uint32_t version_minor;
                uint32_t game;
                uint32_t telemetry_version_game_major;
                uint32_t telemetry_version_game_minor;
            } scs_values;

            struct
            {
                uint32_t time_abs;
            } common_ui;

            struct
            {
                uint32_t gears;
                uint32_t gears_reverse;
                uint32_t retarderStepCount;
                uint32_t truckWheelCount;
                uint32_t selectorCount;
                uint32_t time_abs_delivery;
                uint32_t maxTrailerCount;
                uint32_t unitCount;
                uint32_t plannedDistanceKm;
            } config_ui;

            struct
            {
                uint32_t shifterSlot;
                uint32_t retarderBrake;
                uint32_t lightsAuxFront;
                uint32_t lightsAuxRoof;
                uint32_t truck_wheelSubstance[16];
                uint32_t hshifterPosition[32];
                uint32_t hshifterBitmask[32];
            } truck_ui;

            struct
            {
                uint32_t jobDeliveredDeliveryTime;
                uint32_t jobStartingTime;
                uint32_t jobFinishedTime;
            } gameplay_ui;
            char buffer_ui[48];

            // Zone 3: Integers
            struct
            {
                int32_t restStop;
            } common_i;

            struct
            {
                int32_t gear;
                int32_t gearDashboard;
                int32_t hshifterResulting[32];
            } truck_i;

            struct
            {
                int32_t jobDeliveredEarnedXp;
            } gameplay_i;
            char buffer_i[56];

            // Zone 4: Floats
            struct
            {
                float scale;
            } common_f;

            struct
            {
                float fuelCapacity;
                float fuelWarningFactor;
                float adblueCapacity;
                float adblueWarningFactor;
                float airPressureWarning;
                float airPressurEmergency;
                float oilPressureWarning;
                float waterTemperatureWarning;
                float batteryVoltageWarning;
                float engineRpmMax;
                float gearDifferential;
                float cargoMass;
                float truckWheelRadius[16];
                float gearRatiosForward[24];
                float gearRatiosReverse[8];
                float unitMass;
            } config_f;

            struct
            {
                float speed;
                float engineRpm;
                float userSteer;
                float userThrottle;
                float userBrake;
                float userClutch;
                float gameSteer;
                float gameThrottle;
                float gameBrake;
                float gameClutch;
                float cruiseControlSpeed;
                float airPressure;
                float brakeTemperature;
                float fuel;
                float fuelAvgConsumption;
                float fuelRange;
                float adblue;
                float oilPressure;
                float oilTemperature;
                float waterTemperature;
                float batteryVoltage;
                float lightsDashboard;
                float wearEngine;
                float wearTransmission;
                float wearCabin;
                float wearChassis;
                float wearWheels;
                float truckOdometer;
                float routeDistance;
                float routeTime;
                float speedLimit;
                float truck_wheelSuspDeflection[16];
                float truck_wheelVelocity[16];
                float truck_wheelSteering[16];
                float truck_wheelRotation[16];
                float truck_wheelLift[16];
                float truck_wheelLiftOffset[16];
            } truck_f;

            struct
            {
                float jobDeliveredCargoDamage;
                float jobDeliveredDistanceKm;
                float refuelAmount;
            } gameplay_f;

            struct
            {
                float cargoDamage;
            } job_f;
            char buffer_f[28];

            // Zone 5: Booleans
            struct
            {
                bool truckWheelSteerable[16];
                bool truckWheelSimulated[16];
                bool truckWheelPowered[16];
                bool truckWheelLiftable[16];
                bool isCargoLoaded;
                bool specialJob;
            } config_b;

            struct
            {
                bool parkBrake;
                bool motorBrake;
                bool airPressureWarning;
                bool airPressureEmergency;
                bool fuelWarning;
                bool adblueWarning;
                bool oilPressureWarning;
                bool waterTemperatureWarning;
                bool batteryVoltageWarning;
                bool electricEnabled;
                bool engineEnabled;
                bool wipers;
                bool blinkerLeftActive;
                bool blinkerRightActive;
                bool blinkerLeftOn;
                bool blinkerRightOn;
                bool lightsParking;
                bool lightsBeamLow;
                bool lightsBeamHigh;
                bool lightsBeacon;
                bool lightsBrake;
                bool lightsReverse;
                bool lightsHazard;
                bool cruiseControl;
                bool truck_wheelOnGround[16];
                bool shifterToggle[2];
                bool differentialLock;
                bool liftAxle;
                bool liftAxleIndicator;
                bool trailerLiftAxle;
                bool trailerLiftAxleIndicator;
            } truck_b;

            struct
            {
                bool jobDeliveredAutoparkUsed;
                bool jobDeliveredAutoloadUsed;
            } gameplay_b;
            char buffer_b[25];

            // Zone 6: Float vectors
            struct
            {
                float cabinPositionX;
                float cabinPositionY;
                float cabinPositionZ;
                float headPositionX;
                float headPositionY;
                float headPositionZ;
                float truckHookPositionX;
                float truckHookPositionY;
                float truckHookPositionZ;
                float truckWheelPositionX[16];
                float truckWheelPositionY[16];
                float truckWheelPositionZ[16];
            } config_fv;
            struct
            {
                float lv_accelerationX;
                float lv_accelerationY;
                float lv_accelerationZ;
                float av_accelerationX;
                float av_accelerationY;
                float av_accelerationZ;
                float accelerationX;
                float accelerationY;
                float accelerationZ;
                float aa_accelerationX;
                float aa_accelerationY;
                float aa_accelerationZ;
                float cabinAVX;
                float cabinAVY;
                float cabinAVZ;
                float cabinAAX;
                float cabinAAY;
                float cabinAAZ;
            } truck_fv;
            char buffer_fv[60];

            // Zone 7: Float placement
            struct
            {
                float cabinOffsetX;
                float cabinOffsetY;
                float cabinOffsetZ;
                float cabinOffsetrotationX;
                float cabinOffsetrotationY;
                float cabinOffsetrotationZ;
                float headOffsetX;
                float headOffsetY;
                float headOffsetZ;
                float headOffsetrotationX;
                float headOffsetrotationY;
                float headOffsetrotationZ;
            } truck_fp;
            char buffer_fp[152];

            // Zone 8: Double placement
            struct
            {
                double coordinateX;
                double coordinateY;
                double coordinateZ;
                double rotationX;
                double rotationY;
                double rotationZ;
            } truck_dp;
            char buffer_dp[52];

            // Zone 9: Strings
            struct
            {
                char truckBrandId[STRING_SIZE];
                char truckBrand[STRING_SIZE];
                char truckId[STRING_SIZE];
                char truckName[STRING_SIZE];
                char cargoId[STRING_SIZE];
                char cargo[STRING_SIZE];
                char cityDstId[STRING_SIZE];
                char cityDst[STRING_SIZE];
                char compDstId[STRING_SIZE];
                char compDst[STRING_SIZE];
                char citySrcId[STRING_SIZE];
                char citySrc[STRING_SIZE];
                char compSrcId[STRING_SIZE];
                char compSrc[STRING_SIZE];
                char shifterType[16];
                char truckLicensePlate[STRING_SIZE];
                char truckLicensePlateCountryId[STRING_SIZE];
                char truckLicensePlateCountry[STRING_SIZE];
                char jobMarket[32];
            } config_s;
            struct
            {
                char fineOffence[32];
                char ferrySourceName[STRING_SIZE];
                char ferryTargetName[STRING_SIZE];
                char ferrySourceId[STRING_SIZE];
                char ferryTargetId[STRING_SIZE];
                char trainSourceName[STRING_SIZE];
                char trainTargetName[STRING_SIZE];
                char trainSourceId[STRING_SIZE];
                char trainTargetId[STRING_SIZE];
            } gameplay_s;
            char buffer_s[20];

            // Zone 10: Unsigned long long
            struct
            {
                uint64_t jobIncome;
            } config_ull;
            char buffer_ull[192];

            // Zone 11: Long long
            struct
            {
                int64_t jobCancelledPenalty;
                int64_t jobDeliveredRevenue;
                int64_t fineAmount;
                int64_t tollgatePayAmount;
                int64_t ferryPayAmount;
                int64_t trainPayAmount;
            } gameplay_ll;
            char buffer_ll[52];

            // Zone 12: Special events
            struct
            {
                bool onJob;
                bool jobFinished;
                bool jobCancelled;
                bool jobDelivered;
                bool fined;
                bool tollgate;
                bool ferry;
                bool train;
                bool refuel;
                bool refuelPayed;
            } special_b;
            char buffer_special[90];

            // Zone 13: Substances
            struct
            {
                char substance[SUBSTANCE_SIZE][STRING_SIZE];
            } substances;

            // Zone 14: Trailers
            struct
            {
                TrailerData trailer[MAX_TRAILER_COUNT];
            } trailer;
        };
    }
}
