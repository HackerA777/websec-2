window.addEventListener('load', () => {
    let l = document.getElementById('favorite_list');
    let keys = Object.keys(localStorage);
    for (const i in keys) {
        console.log(localStorage.getItem(keys[i]));
        l.innerHTML += '<option value="' + localStorage.getItem(keys[i]) + '">' + keys[i] + '</option>';
    }
});


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
    for(let i=0; i<result.length; i++) {
        d.innerHTML += '<a class="b-text" href="/station?id=' + result[i]['KS_ID'] + '">' +
            result[i]['title'] +'</a><a> (' + (result[i]['adjacentStreet']??'-') + ' ' + (result[i]['direction']??'-') + ')</a><p></p>';
    }
}