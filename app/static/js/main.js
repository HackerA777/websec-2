window.addEventListener('load', () => {
    let l = document.getElementById('favorite_list');
    let keys = Object.keys(localStorage);
    for (const i in keys) {
        // console.log(localStorage.getItem(keys[i]));
        l.innerHTML += '<option value="' + localStorage.getItem(keys[i]) + '">' + keys[i] + '</option>';
    }
    load();
});

var map = null;

async function search_bus_station() {
    document.getElementById('result_search').innerHTML = "";
    let response = await fetch('/api/search_station?title='+document.getElementById('bus_station').value.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let result = await response.json();
    let d = document.getElementById('result_search');
    if (result['message']){
                d.innerHTML += '<p class="b-text">' + result['message'] + '</p>';
                return -1;
    }
    result = result['result'];
    let _map = document.getElementById('map');

    map.remove();

    map = L.map(_map, {
            center: [53.20007, 50.15],
            zoom: 10
        });
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    for(let i=0; i<result.length; i++) {
        d.innerHTML += '<a class="b-text" href="/station?id=' + result[i]['KS_ID'] + '">' +
            result[i]['title'] +'</a><a> (' + (result[i]['adjacentStreet']??'-') + ' ' + (result[i]['direction']??'-') + ')</a><p></p>';
        let marker = new L.Marker([result[i]['latitude'], result[i]['longitude']]);
        marker.on('click', function() {window.location='/station?id='+result[i]['KS_ID']});
        marker.title = result[i]['title'];
        marker.addTo(map)
    }
}

async function load(){
    let response = await fetch('/api/all_station', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let result = await response.json();
    let d = document.getElementById('result_search');
    if (result['message']){
                d.innerHTML += '<p class="b-text">' + result['message'] + '</p>';
                return -1;
    }
    result = result['result'];

    let _map = document.getElementById('map');

    map = L.map(_map, {
            center: [53.20007, 50.15],
            zoom: 10
        });
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    for (let i=0; i<result.length; i++){
        let marker = new L.Marker([result[i]['latitude'], result[i]['longitude']]);
        marker.on('click', function() {window.location=result[i]['url']});
        marker.title = result[i]['title'];
        marker.addTo(map)
    }
    // L.Control.geocoder().addTo(map);
    if (!navigator.geolocation) {
        console.log("Your browser doesn't support geolocation feature!")
    } else {
        navigator.geolocation.getCurrentPosition(getPosition)
    }
    var marker, circle, lat, long, accuracy;

    function getPosition(position) {
        // console.log(position)
        lat = position.coords.latitude
        long = position.coords.longitude
        accuracy = position.coords.accuracy

        if (marker) {
            map.removeLayer(marker)
        }

        if (circle) {
            map.removeLayer(circle)
        }

        marker = L.marker([lat, long])
        circle = L.circle([lat, long], { radius: accuracy })

        var featureGroup = L.featureGroup([marker, circle]).addTo(map)

        map.fitBounds(featureGroup.getBounds())
    }
}

