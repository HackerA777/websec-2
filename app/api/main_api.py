import json
import re
import flask
import requests
import xmltodict
import hashlib
from flask import Blueprint


api = Blueprint('api', __name__, template_folder='templates', url_prefix="/api")


@api.route("/search_station", methods=['GET'])
def search_station():
    get_param = str(flask.request.args.get('title'))
    if not get_param or get_param == 'None' or get_param == '':
        return json.dumps({'message': 'Введите название остановки'}), 422, {'Content-Type': 'application/json'}
    if len(get_param) < 3:
        return json.dumps({'message': 'Введите больше символов'}), 422, {'Content-Type': 'application/json'}
    stations = requests.api.request('GET', 'https://tosamara.ru/api/v2/classifiers/stopsFullDB.xml')
    stations = xmltodict.parse(stations.content)
    stations = stations['stops']['stop']
    result = []
    for station in stations:
        if re.findall(get_param.lower(), str(station['title']).lower()):
            result.append(station)
    if not result:
        return json.dumps({'message': 'Остановка не найдена'}), 404, {'Content-Type': 'application/json'}
    result = sorted(result, key=lambda d: d['title'])
    return json.dumps({'result': result}), 200, {'Content-Type': 'application/json'}


@api.route("/station", methods=['GET'])
def get_station():
    get_param = int(flask.request.args.get('id'))
    if not get_param:
        return json.dumps({'message': 'Неккоректное значение ID остановки'}), 422, {'Content-Type': 'application/json'}
    stations = requests.api.request('GET', 'https://tosamara.ru/api/v2/classifiers/stopsFullDB.xml')
    stations = xmltodict.parse(stations.content)
    stations = stations['stops']['stop']
    result = []
    for station in stations:
        if get_param == int(station['KS_ID']):
            message = 'KS_ID=' + str(get_param)
            auth_key = hashlib.sha1(bytes(str(get_param) + "just_f0r_tests", 'utf-8'))
            info = requests.api.request('GET', 'https://tosamara.ru/api/v2/json?method=getFirstArrivalToStop&' +
                                        message + '&os=web&clientid=test&authkey=' + auth_key.hexdigest())
            if info.status_code != 200:
                return json.dumps({'message': 'Неккоректный запрос!'}), 420, {'Content-Type': 'application/json'}
            info = json.loads(info.content.decode('utf-8'))
            result.append(station)
            result.append(info)
            routes = requests.api.request('GET',
                                          'https://tosamara.ru/api/v2/classifiers/routesAndStopsCorrespondence.xml')
            routes = xmltodict.parse(routes.content)
            routes = routes['routes']['route']
            info = info['arrival']
            _routes = {}
            for route in routes:
                for i in range(len(info)):
                    if int(route['KR_ID']) == int(info[i]['KR_ID']):
                        if _routes.__len__() != 0:
                                try:
                                    if _routes[route['KR_ID']]:
                                        continue
                                    else:
                                        _routes[route['KR_ID']] = {'from': route['stop'][0]['title'], 'to': route['direction']}
                                except BaseException:
                                    _routes[route['KR_ID']] = {'from': route['stop'][0]['title'], 'to': route['direction']}
                        else:
                            _routes[route['KR_ID']] = {'from': route['stop'][0]['title'], 'to': route['direction']}
            result.append(_routes)
            if not result:
                return json.dumps({'message': 'Остановка не найдена'}), 404, {'Content-Type': 'application/json'}
            return json.dumps({'result': result}), 200, {'Content-Type': 'application/json'}


@api.route("/routes_from_station", methods=['GET'])
def get_routes_from_station():
    get_param = int(flask.request.args.get('id'))
    if not get_param:
        return json.dumps({'message': 'Неккоректное значение ID остановки'}), 422, {'Content-Type': 'application/json'}
    stations = requests.api.request('GET', 'https://tosamara.ru/api/v2/classifiers/stopsFullDB.xml')
    stations = xmltodict.parse(stations.content)
    stations = stations['stops']['stop']
    for station in stations:
        if get_param == int(station['KS_ID']):
            routes = requests.api.request('GET',
                                          'https://tosamara.ru/api/v2/classifiers/routesAndStopsCorrespondence.xml')
            routes = xmltodict.parse(routes.content)
            routes = routes['routes']['route']
            _res = {'busesMunicipal': None, 'busesCommercial': None, 'busesPrigorod': None,
                 'busesSeason': None, 'busesSpecial': None, 'busesIntercity': None, 'trams': None,
                 'trolleybuses': None, 'metros': None, 'electricTrains': None, 'riverTransports': None}
            for key in _res.keys():
                tmp = station[key].split(', ') if station[key] else None
                if not tmp:
                    continue
                for i in range(len(tmp)):
                    for route in routes:
                        if tmp[i] == route['number']:
                            tmp[i] = route
                            continue
                _res[key] = tmp
            return json.dumps({'result': _res}), 200, {'Content-Type': 'application/json'}


@api.route('/route', methods=['GET'])
def route():
    get_param = int(flask.request.args.get('id'))
    if not get_param:
        return json.dumps({'message': 'Неккоректное значение ID остановки'}), 422, {
            'Content-Type': 'application/json'}
    routes = requests.api.request('GET',
                                  'https://tosamara.ru/api/v2/classifiers/routesAndStopsCorrespondence.xml')
    routes = xmltodict.parse(routes.content)
    routes = routes['routes']['route']
    for route in routes:
        if get_param == int(route['KR_ID']):
            _route = {'from': route['stop'][0]['title'], 'to': route['direction']}
            return json.dumps({'result': route, '_route': _route}), 200, {'Content-Type': 'application/json'}
