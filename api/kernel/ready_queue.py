"""
Ready Queue abstraction.

Wraps a Python list to provide a clean queue interface.
The ordering is maintained as FIFO — algorithm-specific selection
is handled by the SchedulerPolicy, not the queue itself.
"""


class ReadyQueue:
    """FIFO-ordered queue of process IDs."""

    def __init__(self):
        self._queue: list[int] = []

    def enqueue(self, pid: int):
        """Add a PID to the back of the queue."""
        if pid not in self._queue:
            self._queue.append(pid)

    def dequeue(self) -> int:
        """Remove and return the front PID. Returns -1 if empty."""
        if self._queue:
            return self._queue.pop(0)
        return -1

    def remove(self, pid: int):
        """Remove a specific PID from anywhere in the queue."""
        if pid in self._queue:
            self._queue.remove(pid)

    def peek(self) -> int:
        """Return the front PID without removing. Returns -1 if empty."""
        return self._queue[0] if self._queue else -1

    def clear(self):
        """Remove all PIDs."""
        self._queue.clear()

    def __len__(self) -> int:
        return len(self._queue)

    def __contains__(self, pid: int) -> bool:
        return pid in self._queue

    def __iter__(self):
        return iter(self._queue)

    def as_list(self) -> list[int]:
        """Return a copy of the internal list."""
        return list(self._queue)
