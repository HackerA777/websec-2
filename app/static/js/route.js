window.addEventListener('load', () => {
    let l = document.getElementById('favorite_list');
    let keys = Object.keys(localStorage);
    for (const i in keys) {
        // console.log(localStorage.getItem(keys[i]));
        l.innerHTML += '<option value="' + localStorage.getItem(keys[i]) + '">' + keys[i] + '</option>';
    }
    load();
});

async function load(){
    let response = await fetch('/api/route'+window.location.search.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let result = await response.json();
    let d = document.getElementById('info_of_route');
    if (result['message']){
                d.innerHTML += '<a class="b-text">' + result['message'] + '</a>';
                return -1;
    }
    let _route = result['_route'];
    result = result['result'];
    d.innerHTML += '<a class="b-text_station">' + result['transportType']['title'] + ' №' + result['number'] + '</a><br>';
    d.innerHTML += '<a class="b-text_station" style="font-size: 75%">' + _route['from'] + ' -> ' + _route['to'] + '</a>';
    let stops = result['stop'];
    for(const stop in result['stop']) {
        d.innerHTML += '<p class="b-text_station" style="font-size: 75%"><a href="/station?id=' +
            stops[stop]['KS_ID'] + '">' + stops[stop]['title'] + '</a></p>';
    }
    d.innerHTML += '<p class="b-text_station" style="font-size: 90%" >' +
        '</p>';

    // render(
    //    <MapContainer center={[50, 100]} zoom={13} scrollWheelZoom={false}>
    //         <TileLayer
    //     attribution='copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    //            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    //         />
    //         <Marker position={[50, 100]}>
    //             <Popup>
    //                 Popup for any custom information.
    //             </Popup>
    //         </Marker>
    //     </MapContainer>)
}
