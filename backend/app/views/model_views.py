from aiohttp import web
from PIL import Image
import io
import base64
import pickle
import pandas as pd
import numpy as np
from io import StringIO
import matplotlib.pyplot as plt
import seaborn as sns
import json
import xgboost

import plotly
import plotly.graph_objs as go
import plotly.express as px
from plotly.subplots import make_subplots

from scipy import interpolate
from scipy import ndimage
# import csv


def fig2img(fig):
    """Convert a Matplotlib figure to a PIL Image and return it"""
    buf = io.BytesIO()
    fig.savefig(buf)
    buf.seek(0)
    img = Image.open(buf)
    return img


def transform_image_to_base64_str(image: Image) -> str:
    buf = io.BytesIO()
    image.save(buf, format="png")
    bytes = buf.getvalue()
    return f'data:image/png;base64,{base64.b64encode(bytes).decode("utf-8")}'


def read_data_and_draw(filename=None, addition_data=None, only_start_flg=False):
    if not only_start_flg:
        with open('app/model/features_for_model.pkl', 'rb') as features_file:
            features_list = pickle.load(features_file)
        with open('app/model/best_model_dota2_xgb.pkl', 'rb') as model_file:
            model = pickle.load(model_file)
    else:
        features_list = [f'r{i}_hero_id' for i in range(1, 6)] + [f'd{i}_hero_id' for i in range(1, 6)]
        with open('app/model/best_model_dota2_logreg_start.pkl', 'rb') as model_file:
            model = pickle.load(model_file)

    if filename is not None:
        data = pd.read_csv(filename)[features_list]
    else:
        data = addition_data[features_list]

    prediction = model.predict_proba(data[features_list])

    data['Radiant_win'] = prediction[:, 0]
    data['Dire_win'] = prediction[:, 1]

    if not only_start_flg:
        x = data['game_time'].values
        y_r = data['Radiant_win'].values
        y_d = data['Dire_win'].values

        sigma = 7
        x_g1d = ndimage.gaussian_filter1d(x, sigma)
        y_g1d_r = ndimage.gaussian_filter1d(y_r, sigma)
        y_g1d_d = ndimage.gaussian_filter1d(y_d, sigma)

        fig, ax1 = plt.subplots(figsize=(15, 12))
        sns.lineplot(x, y_r, color='grey', linewidth=1, ax=ax1)
        sns.lineplot(x_g1d, y_g1d_r, color='red', linewidth=2, ax=ax1)
        ax1.set_title("Dynamic of radiant's win probability", fontsize=16)
        ax1.set_xlabel('Time', fontsize=16)
        ax1.set_ylabel('Probability', fontsize=16)
        ax1.tick_params(axis='both', which='major', labelsize=14)
        ax1.grid()

        plot_dire = plt.gcf()

        fig, ax2 = plt.subplots(figsize=(15, 12))
        sns.lineplot(x, y_d, color='grey', linewidth=1, ax=ax2)
        sns.lineplot(x_g1d, y_g1d_d, color='red', linewidth=2, ax=ax2)
        ax2.set_title("Dynamic of dire's win probability", fontsize=16)
        ax2.set_xlabel('Time', fontsize=16)
        ax2.set_ylabel('Probability', fontsize=16)
        ax2.tick_params(axis='both', which='major', labelsize=14)
        ax2.grid()
        plot_radiant = plt.gcf()

        return plot_dire, plot_radiant
    else:
        return {
            'radiant_proba': data.loc[0, 'Radiant_win'],
            'dire_proba': data.loc[0, 'Dire_win']}


async def draw_plot(request):
    data = await request.json()
    match_id = data.get('match_id', "45")

    dataset = pd.read_csv('app/data/result_all_matches_no_nulls.csv')
    plot_dire, plot_radiant = read_data_and_draw(filename=None,
                                                 addition_data=dataset[dataset['match_id'] == int(match_id)])

    img_dire, img_radiant = fig2img(plot_dire), fig2img(plot_radiant)  # pil.image

    return web.json_response(
        {
            "plot_dire": transform_image_to_base64_str(img_dire),
            "plot_radiant": transform_image_to_base64_str(img_radiant)
        })


async def predict_by_file(request):
    data = await request.json()
    file = data.get('file', "data:text/csv;base64,MTsyOzM7NDUK") # csv:
    decoded = base64.standard_b64decode(file.split(',')[1]).decode('utf-8')
    dataset = pd.read_csv(StringIO(decoded))

    plot_dire, plot_radiant = read_data_and_draw(filename=None,
                                                 addition_data=dataset)

    img_dire, img_radiant = fig2img(plot_dire), fig2img(plot_radiant)  # pil.image

    return web.json_response(
        {
            "plot_dire": transform_image_to_base64_str(img_dire),
            "plot_radiant": transform_image_to_base64_str(img_radiant)
        })


def make_start_moment(heroes_list):
    with open('app/model/features_for_model.pkl', 'rb') as features_file:
        features_list = pickle.load(features_file)

    match_start = pd.DataFrame(columns=features_list)

    match_start.loc[0] = [0 for _ in range(len(features_list))]

    for i, col in enumerate(
            ['r' + str(i) + '_hero_id' for i in range(1, 6)] + ['d' + str(i) + '_hero_id' for i in range(1, 6)]):
        match_start[col] = heroes_list[i]

    for col in ['d' + str(i) for i in range(1, 6)]:
        match_start[col + '_x'] = 186
        match_start[col + '_y'] = 186

    return match_start


async def match_start(request):
    data = await request.json()
    dire_heroes = data['dire_heroes']
    radiant_heroes = data['radiant_heroes']
    heroes = radiant_heroes + dire_heroes

    res = read_data_and_draw(filename=None, addition_data=make_start_moment(heroes), only_start_flg=True)
    return web.json_response(res)


def best_next_position(filename=None, hero='r1', team_name='Radiant', addition_data=None):
    with open('app/model/features_for_model.pkl', 'rb') as features_file:
        features_list = pickle.load(features_file)

    with open('app/model/best_model_dota2_xgb.pkl', 'rb') as model_file:
        model = pickle.load(model_file)

    if filename is not None:
        data = pd.read_csv(filename)[features_list]
    else:
        data = addition_data[features_list]

    variants_num = 200
    r_min = 10
    r_max = 100
    r_step = 10
    time_length = len(data['game_time']) - 1
    time_start = 0
    time_step = 10
    time_end = min(1000, time_length)

    x1_time_list = []
    y1_time_list = []
    x2_time_list = []
    y2_time_list = []
    x_list_time_list = []
    y_list_time_list = []
    pred_rad_time_list = []

    for moment in range(time_start, time_end, time_step):

        x1 = data.loc[moment, hero + '_x']
        y1 = data.loc[moment, hero + '_y']
        x1_time_list.append(x1)
        y1_time_list.append(y1)

        x2 = data.loc[moment + time_step, hero + '_x']
        y2 = data.loc[moment + time_step, hero + '_y']
        x2_time_list.append(x2)
        y2_time_list.append(y2)

        x_list = []
        y_list = []
        pred_rad = []
        new_variants_df = pd.DataFrame()
        for i in range(variants_num):
            new_variants_df = pd.concat([new_variants_df, data.loc[moment, :].to_frame().T])

        phi = np.linspace(0, 2 * np.pi, variants_num)

        for r in range(r_min, r_max, r_step):
            x = r * np.sin(phi) + x1
            y = r * np.cos(phi) + y1

            new_variants_df[hero + '_x'] = x
            new_variants_df[hero + '_y'] = y

            prediction = model.predict_proba(new_variants_df[features_list])
            new_variants_df['Radiant_win'] = prediction[:, 0]
            new_variants_df['Dire_win'] = prediction[:, 1]

            pred_rad.append(new_variants_df['Radiant_win'])
            x_list.append(x)
            y_list.append(y)

        x_list = np.array(x_list).ravel()
        y_list = np.array(y_list).ravel()
        pred_rad = np.array(pred_rad).ravel()
        x_list_time_list.append(x_list)
        y_list_time_list.append(y_list)
        pred_rad_time_list.append(pred_rad)

    # drawing
    num_steps = len(x1_time_list)

    trace_list = [go.Scatter(visible=True, x=x_list_time_list[0], y=y_list_time_list[0],
                             mode='markers', name='Posible positions',
                             marker=dict(color=pred_rad_time_list[0],
                                         colorbar=dict(yanchor='top', y=0.85, title="Probability"),
                                         colorscale=[[0, 'rgb(250, 250, 250)'], [1., 'rgb(0, 0, 0)'], ]
                                         ),
                             ),
                  go.Scatter(visible=True, x=[x1_time_list[0]], y=[y1_time_list[0]],
                             mode='markers', line=dict(color="#0000ff"), name='Current position'
                             ),
                  go.Scatter(visible=True, x=[x2_time_list[0]], y=[y2_time_list[0]],
                             mode='markers', name='Next position'
                             ),
                  ]

    for i in range(1, num_steps):
        trace_list.append(go.Scatter(visible=False, x=x_list_time_list[i], y=y_list_time_list[i],
                                     mode='markers', name='Posible positions',
                                     marker=dict(color=pred_rad_time_list[i],
                                                 colorbar=dict(yanchor='top', y=0.85, title="Probability"),
                                                 colorscale=[[0, 'rgb(250, 250, 250)'], [1., 'rgb(0, 0, 0)'], ]
                                                 )
                                     )
                          )
        trace_list.append(go.Scatter(visible=False, x=[x1_time_list[i]], y=[y1_time_list[i]],
                                     mode='markers', line=dict(color="#0000ff"), name='Current position'
                                     )
                          )
        trace_list.append(go.Scatter(visible=False, x=[x2_time_list[i]], y=[y2_time_list[i]],
                                     mode='markers', name='Next position'
                                     )
                          )

    fig = go.Figure(data=trace_list)

    fig.update_xaxes(range=[0, 186])
    fig.update_yaxes(range=[0, 186])

    steps = []
    for i in range(0, 3 * num_steps, 3):
        # Hide all traces
        step = dict(
            label='Time = ' + str(round(i * data.loc[1, 'game_time'])),
            method='restyle',
            args=['visible', [False] * len(fig.data)],
        )
        # Enable trace we want to see
        step['args'][1][i] = True
        step['args'][1][i + 1] = True
        step['args'][1][i + 2] = True

        # Add step to step list
        steps.append(step)

    sliders = [dict(
        steps=steps,
    )]

    fig.layout.sliders = sliders

    fig.update_layout(legend_orientation="v",
                      width=600,
                      height=600,
                      title="Probability distribution for the player's next position"
                      )
    fig.update_traces(hoverinfo="all", hovertemplate="x_coordinate: %{x}<br>y_coordinate: %{y}")
    return json.loads(json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder))


async def predict_opt_movements(request):
    data = await request.json()
    file = data.get('file', "data:text/csv;base64,MTsyOzM7NDUK")  # csv:
    decoded = base64.standard_b64decode(file.split(',')[1]).decode('utf-8')
    dataset = pd.read_csv(StringIO(decoded))
    hero_str = data.get('hero_prefix', "r") + str(data.get('hero_num', 1))

    return web.json_response(
        {
            "plotly_graph": best_next_position(filename=None, hero=hero_str, addition_data=dataset)
        })
