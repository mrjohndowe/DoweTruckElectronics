#pragma once

#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#else
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>
#endif

#include <cstdint>
#include <cstddef>

namespace DoweTruckElectronics
{
    namespace Scs
    {
        class SharedMemory
        {
        public:
            SharedMemory();
            ~SharedMemory();

            bool open(const char* name, size_t size);
            void close();
            bool is_open() const;

            void* get_data() const;
            size_t get_size() const;

        private:
#ifdef _WIN32
            HANDLE m_handle;
#else
            int m_fd;
#endif
            void* m_data;
            size_t m_size;
            bool m_open;
        };
    }
}
