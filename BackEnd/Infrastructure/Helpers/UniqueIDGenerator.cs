using Application.IHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Helpers
{
    public class UniqueIDGenerator : IUniqueIDGenerator
    {
        private static readonly DateTimeOffset _epoch = new DateTimeOffset(2020, 1, 1, 0, 0, 0, TimeSpan.Zero);

        private const long _generatorId = 1;

        // Bit structure
        private const int GeneratorIdBits = 4;
        private const int SequenceBits = 8;
        private const int MaxSequence = (1 << SequenceBits) - 1; // 255

        // Bit shifts
        private const int GeneratorIdShift = SequenceBits; // 8
        private const int TimestampShift = SequenceBits + GeneratorIdBits; // 12

        // State for the generator
        private static readonly object _lock = new object();
        private static long _lastTimestamp = -1L;
        private static int _sequence = 0;
        public long CreateUnique53BitId()
        {
            lock (_lock)
            {
                long timestamp = (long)(DateTimeOffset.UtcNow - _epoch).TotalMilliseconds;

                if (timestamp < _lastTimestamp)
                {
                    // This can happen if the system clock is adjusted backwards.
                    throw new InvalidOperationException("Clock moved backwards. Refusing to generate ID to prevent collisions.");
                }

                if (_lastTimestamp == timestamp)
                {
                    // We are in the same millisecond, so increment the sequence
                    _sequence = (_sequence + 1) & MaxSequence;
                    if (_sequence == 0)
                    {
                        // Sequence has overflowed (we've generated 256 IDs in this millisecond)
                        // We must wait for the next millisecond to ensure uniqueness.

                        // Inlined WaitNextMillis()
                        long newTimestamp = (long)(DateTimeOffset.UtcNow - _epoch).TotalMilliseconds;
                        while (newTimestamp <= _lastTimestamp)
                        {
                            // Simple spin-wait.
                            System.Threading.Thread.SpinWait(1000);
                            newTimestamp = (long)(DateTimeOffset.UtcNow - _epoch).TotalMilliseconds;
                        }
                        timestamp = newTimestamp;
                    }
                }
                else
                {
                    // This is a new millisecond, reset the sequence
                    _sequence = 0;
                }

                _lastTimestamp = timestamp;

                // Combine the three parts into a 53-bit ID
                // (41 bits) | (4 bits) | (8 bits)
                return (timestamp << TimestampShift)
                     | (_generatorId << GeneratorIdShift)
                     | _sequence;
            }
        }

    }
}
