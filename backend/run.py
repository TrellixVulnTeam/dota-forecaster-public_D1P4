import os
import time
from aiohttp import web

from app.app import APPLICATION
from config.config import CONFIG


async def web_app():
    return APPLICATION


if __name__ == '__main__':
    web.run_app(APPLICATION, port=CONFIG['port'])
