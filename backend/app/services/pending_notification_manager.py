from __future__ import annotations

import asyncio
from collections import defaultdict
from typing import DefaultDict, Set

from fastapi import WebSocket


class PendingNotificationManager:
    def __init__(self) -> None:
        self._connections: DefaultDict[str, Set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()
        self._loop: asyncio.AbstractEventLoop | None = None

    def set_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections[user_id].add(websocket)

    async def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            connections = self._connections.get(user_id)
            if not connections:
                return
            connections.discard(websocket)
            if not connections:
                self._connections.pop(user_id, None)

    async def notify_user(self, user_id: str, payload: dict) -> None:
        async with self._lock:
            connections = list(self._connections.get(user_id, set()))

        for websocket in connections:
            try:
                await websocket.send_json(payload)
            except Exception:
                await self.disconnect(user_id, websocket)

    def notify_user_nowait(self, user_id: str, payload: dict) -> None:
        if self._loop is None:
            return

        asyncio.run_coroutine_threadsafe(self.notify_user(user_id, payload), self._loop)


pending_notification_manager = PendingNotificationManager()
