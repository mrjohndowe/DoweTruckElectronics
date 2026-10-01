#include "SharedMemory.h"
#include "../../shared/Logging.h"

namespace DoweTruckElectronics
{
    namespace Scs
    {
        SharedMemory::SharedMemory()
#ifdef _WIN32
            : m_handle(nullptr)
#else
            : m_fd(-1)
#endif
            , m_data(nullptr)
            , m_size(0)
            , m_open(false)
        {
        }

        SharedMemory::~SharedMemory()
        {
            close();
        }

        bool SharedMemory::open(const char* name, size_t size)
        {
            if (m_open)
                return true;

            m_size = size;

#ifdef _WIN32
            m_handle = OpenFileMappingA(
                FILE_MAP_READ,
                FALSE,
                name
            );

            if (m_handle == nullptr)
            {
                Logger::error("Failed to open shared memory: OpenFileMapping failed");
                return false;
            }

            m_data = MapViewOfFile(
                m_handle,
                FILE_MAP_READ,
                0,
                0,
                size
            );

            if (m_data == nullptr)
            {
                Logger::error("Failed to map shared memory: MapViewOfFile failed");
                CloseHandle(m_handle);
                m_handle = nullptr;
                return false;
            }
#else
            m_fd = shm_open(name, O_RDONLY, 0);
            if (m_fd == -1)
            {
                Logger::error("Failed to open shared memory: shm_open failed");
                return false;
            }

            m_data = mmap(nullptr, size, PROT_READ, MAP_SHARED, m_fd, 0);
            if (m_data == MAP_FAILED)
            {
                Logger::error("Failed to map shared memory: mmap failed");
                ::close(m_fd);
                m_fd = -1;
                m_data = nullptr;
                return false;
            }
#endif

            m_open = true;
            Logger::info("Shared memory opened successfully");
            return true;
        }

        void SharedMemory::close()
        {
            if (!m_open)
                return;

#ifdef _WIN32
            if (m_data != nullptr)
            {
                UnmapViewOfFile(m_data);
                m_data = nullptr;
            }

            if (m_handle != nullptr)
            {
                CloseHandle(m_handle);
                m_handle = nullptr;
            }
#else
            if (m_data != nullptr && m_data != MAP_FAILED)
            {
                munmap(m_data, m_size);
                m_data = nullptr;
            }

            if (m_fd != -1)
            {
                ::close(m_fd);
                m_fd = -1;
            }
#endif

            m_open = false;
            Logger::info("Shared memory closed");
        }

        bool SharedMemory::is_open() const
        {
            return m_open;
        }

        void* SharedMemory::get_data() const
        {
            return m_data;
        }

        size_t SharedMemory::get_size() const
        {
            return m_size;
        }
    }
}
