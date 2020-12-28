from aiohttp import web
import asyncio


async def test_connection(request):
    await asyncio.sleep(0.5)
    return web.json_response({"data": "Test connection successfully"}, status=200)
