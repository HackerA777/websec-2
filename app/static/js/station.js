window.addEventListener('load', () => {
    update_favorite_list(false);
    load();
});

function update_favorite_list(flag){
    let l = document.getElementById('favorite_list');
    if (flag) {
        l.innerHTML = "";
        l.innerHTML += '<option disabled selected>Избранные остановки</option>';
    }
    let keys = Object.keys(localStorage);
    for (const i in keys) {
        l.innerHTML += '<option value="' + localStorage.getItem(keys[i]) + '">' + keys[i] + '</option>';
    }
}

function add_favorite(){
    let r = document.getElementById('title');
    let d = document.getElementById('direction');
    let key = r.text + ' ' + d.textContent;
    let value = window.location.pathname.toString() +
        window.location.search.toString();
    localStorage.setItem(key, value);
    let t = document.createElement('a');
    t.id = "favorite";
    t.className = "b-text_station";
    t.style = "padding-right: 12px; right: 0; position: absolute; font-size: 80%";
    t.onclick = remove_favorite;
    t.innerHTML = 'Удалить из избранное';
    document.getElementById('favorite').remove();
    r.after(t);
    update_favorite_list(true);
}

function remove_favorite(){
    let r = document.getElementById('title');
    let d = document.getElementById('direction');
    let key = r.text + ' ' + d.textContent;
    localStorage.removeItem(key);
    let t = document.createElement('a');
    t.id = "favorite";
    t.className = "b-text_station";
    t.style = "padding-right: 12px; right: 0; position: absolute; font-size: 80%";
    t.onclick = add_favorite;
    t.innerHTML = 'Добавить в избранное';
    document.getElementById('favorite').remove();
    r.after(t);
    update_favorite_list(true);
}

function show_bus_station(){
    let element = document.getElementById("tab");
    element.style.display = "";
    let rc = document.getElementById('routes_from_station_div');
    rc.style.display = "none";
}

function show_routes_station(){
    let element = document.getElementById("tab");
    element.style.display = "none";
    let rc = document.getElementById('routes_from_station_div');
    rc.style.display = "";
    rc.innerHTML = "";
    show_routes_from_station();
}

async function load(){
    let response = await fetch('/api/station'+window.location.search.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    let result = await response.json();
    let d = document.getElementById('info_of_station');
    if (result['message']){
                d.innerHTML += '<a class="b-text">' + result['message'] + '</a>';
                return -1;
    }
    result = result['result'];

    let favorite = localStorage.getItem(result[0]['title'] + ' ' +
        result[0]['adjacentStreet'] + ' ' + result[0]['direction'])??null;
    if (favorite)
        d.innerHTML += '<a id="favorite" class="b-text_station" style="padding-right: 12px; ' +
        'right: 0; position: absolute; font-size: 80%" onclick="remove_favorite()">' +
        'Удалить из избранного</a>';
    else
        d.innerHTML += '<a id="favorite" class="b-text_station" style="padding-right: 12px; ' +
        'right: 0; position: absolute; font-size: 80%" onclick="add_favorite()">' +
        'Добавить в избранное</a>';
    d.innerHTML += '<br><a class="b-text_station" id="title">' + result[0]['title'] + '</a>';
    d.innerHTML += '<p class="b-text_station" style="font-size: 75%" id="direction">' + result[0]['adjacentStreet'] + ' ' + result[0]['direction'] + '</p>';
    d.innerHTML += '<div class="choice-bar">' +
        '                    <button class="station_button" onclick="show_bus_station()">Прибывающий транспорт</button>\n' +
        '                    <button class="station_button" onclick="show_routes_station()">Проходящие маршруты</button>\n' +
        '                </div>' +
        '<div id="routes_from_station_div" class="show_route" style="display: none"></div>';
    d.innerHTML += '<table id="tab">' +
                '<thead><tr><td width="9%">Время, мин</td><td width="50%">Маршрут, модель ТС и госномер</td>' +
        '<td>Текущее положение</td></tr></thead>';
    let t = document.getElementById("tab");
    let arrival = result[1]['arrival'];
    for(let i=0; i<arrival.length; i++) {
        t.innerHTML += '<tbody class="tbody"><tr><td class="b-text_station">' + arrival[i]['time'] +
            '</td><td><a class="b-text_station" href="/route?id=' + arrival[i]['KR_ID'] + '" style="font-size: 80%; color: black">'
            + arrival[i]['number'] + ': '
            + result[2][arrival[i]['KR_ID']]['from'] + ' -> ' + result[2][arrival[i]['KR_ID']]['to'] +'</a>' +
            '<p class="b-text_station" style="font-size: 70%">' + (arrival[i]['modelTitle']??'') + ' | ' + (arrival[i]['stateNumber']??'') + '</p>' +
            '</td><td><a class="b-text_station" style="font-size: 85%">' + Math.round(arrival[i]['remainingLength']) + ' м до ' + arrival[i]['nextStopName'] + '</a></td></tr>';
    }
    t.innerHTML += '</tbody>';
    d.innerHTML += '<p class="b-text_station" style="font-size: 90%" >' +
        '<a href="https://yandex.ru/maps/51/samara/?ll=' + result[0]['longitude'] + '%2C' + result[0]['latitude'] +
        '&mode=search&sll=' + result[0]['longitude'] + '%2C' + result[0]['latitude'] +
        '&text=' + result[0]['latitude'] + '%2C' + result[0]['longitude'] + '&z=16">' + 'Остановка на Яндекс карте' + '</a></p>';
    let _map = document.getElementById('map');

    var map_init = L.map(_map, {
            center: [result[0]['latitude'], result[0]['longitude']],
            zoom: 16
        });
        var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map_init);
        var marker = new L.Marker([result[0]['latitude'], result[0]['longitude']]);
        marker.addTo(map_init)
        L.Control.geocoder().addTo(map_init);
        if (!navigator.geolocation) {
            console.log("Your browser doesn't support geolocation feature!")
        }
}

async function show_routes_from_station(){
    let response = await fetch('/api/routes_from_station'+window.location.search.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let result = await response.json();
    let d = document.getElementById('info_of_station');
    if (result['message']){
                d.innerHTML += '<a class="b-text">' + result['message'] + '</a>';
                return -1;
    }
    let buses = ['busesMunicipal', 'busesCommercial', 'busesPrigorod',
                 'busesSeason', 'busesSpecial', 'busesIntercity'];
    result = result['result'];
    let keys = Object.keys(result);
    let rc = document.getElementById('routes_from_station_div');
    for (const key in keys) {
        if (result[keys[key]] != null){
            if (buses.find(element => element === keys[key])){
                if (!document.getElementById('buses_from_station'))
                    rc.innerHTML += '<div id="buses_from_station" style="padding-bottom: 5px; color: yellow"><label>Автобусы:</label><br></div>';
                let bfs = document.getElementById('buses_from_station');
                for (let i=0; i<result[keys[key]].length; i++){
                    bfs.innerHTML += '<a class="b-text_station_route" href="/route?id=' + result[keys[key]][i]['KR_ID'] + '" style="color: yellow">' +
                       result[keys[key]][i]['number'] + '</a><a>&emsp;</a>';
                }
            }
            else if(keys[key] === 'trams'){
                if (!document.getElementById('trams_from_station'))
                    rc.innerHTML += '<div id="trams_from_station" style="padding-bottom: 5px; color: crimson"><label>Трамваи:</label><br></div>';
                let tfs = document.getElementById('trams_from_station');
                for (let i=0; i<result[keys[key]].length; i++){
                    tfs.innerHTML += '<a class="b-text_station_route" style="padding-left: 10px; color: crimson" href="/route?id=' +
                        result[keys[key]][i]['KR_ID'] + '">' +
                       result[keys[key]][i]['number'] + '</a><a>&emsp;</a>';
                }
            }
            else if(keys[key] === 'trolleybuses'){
                if (!document.getElementById('trolleybuses_from_station'))
                    rc.innerHTML += '<div id="trolleybuses_from_station" style="padding-bottom: 5px; color: blue"><label>Троллейбусы:</label><br></div>';
                let tfs = document.getElementById('trolleybuses_from_station');
                for (let i=0; i<result[keys[key]].length; i++){
                    tfs.innerHTML += '<a class="b-text_station_route" href="/route?id=' + result[keys[key]][i]['KR_ID'] +
                        '" style="color: blue">' +
                       result[keys[key]][i]['number'] + '</a><a>&emsp;</a>';
                }
            }
            else if(keys[key] === 'metros'){
                if (!document.getElementById('metros_from_station'))
                    rc.innerHTML += '<div id="metros_from_station" style="padding-bottom: 5px; color: grey"><label>Метро:</label><br></div>';
                let mfs = document.getElementById('metros_from_station');
                for (let i=0; i<result[keys[key]].length; i++){
                    mfs.innerHTML += '<a class="b-text_station_route" href="/route?id=' + result[keys[key]][i]['KR_ID'] +
                        '" style="color: grey">' +
                       result[keys[key]][i]['number'] + '</a><a>&emsp;</a>';
                }
            }
            else if(keys[key] === 'electricTrains'){
                if (!document.getElementById('electricTrains_from_station'))
                    rc.innerHTML += '<div id="electricTrains_from_station" style="padding-bottom: 5px; color: green"><label>Электрички:</label><br></div>';
                let elfs = document.getElementById('electricTrains_from_station');
                for (let i=0; i<result[keys[key]].length; i++){
                    elfs.innerHTML += '<a class="b-text_station_route" href="/route?id=' + result[keys[key]][i]['KR_ID'] +
                        '" style="color: green">' +
                       result[keys[key]][i]['number'] + '</a><a>&emsp;</a>';
                }
            }
            else if(keys[key] === 'riverTransports'){
                if (!document.getElementById('riverTransports_from_station'))
                    rc.innerHTML += '<div id="riverTransports_from_station" style="padding-bottom: 5px; color: dodgerblue"><label>Водные трамваи:</label><br></div>';
                let rivfs = document.getElementById('riverTransports_from_station');
                for (let i=0; i<result[keys[key]].length; i++){
                    rivfs.innerHTML += '<a class="b-text_station_route" style="" href="/route?id=' + result[keys[key]][i]['KR_ID'] +
                        '" style="color: dodgerblue">' +
                       result[keys[key]][i]['number'] + '</a><a>&emsp;</a>';
                }
            }
        }
    }

}
