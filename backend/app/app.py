from aiohttp import web
from config.config import CONFIG

from app.views import basic, model_views


APPLICATION = web.Application()
APPLICATION['conf'] = CONFIG


APPLICATION.add_routes([
    web.get(f'{CONFIG["api_prefix"]}/test', basic.test_connection),
    web.post(f'{CONFIG["api_prefix"]}/model_view', model_views.draw_plot),
    web.post(f'{CONFIG["api_prefix"]}/hero_pick', model_views.match_start),
    web.post(f'{CONFIG["api_prefix"]}/custom_file', model_views.predict_by_file),
    web.post(f'{CONFIG["api_prefix"]}/optimal_movements', model_views.predict_opt_movements),
])
