const fileName = 'test.json';

var geocoder;
var map;
var zoom;
var jsonfile;
var markersArray;


function getGeolocation() {
    navigator.geolocation.getCurrentPosition(drawMap);
}

function drawMap(geoPos) {
    geolocate = new google.maps.LatLng(geoPos.coords.latitude, geoPos.coords.longitude);
    let mapProp = {
        center: geolocate,
        zoom: 13,
    };
    map = new google.maps.Map(document.getElementById('canvas'), mapProp);
    let infowindow = new google.maps.InfoWindow({
        map: map,
        position: geolocate,
        content: `Location from HTML5 Geolocation:
          <br>Latitude: ${geoPos.coords.latitude}
          <br>Longitude: ${geoPos.coords.longitude}`
    });

    loadDataMap(geoPos);
}

function loadDataMap(geolocate) {

    if (document.getElementById("script-params")) {
        jsonfile = document.getElementById("script-params").getAttribute("data");
    }

    // Load the stores GeoJSON onto the map.
    map.data.loadGeoJson(fileName, null, function (features) {
        var markers = features.map(function (feature) {
            var g = feature.getGeometry();
            var iconurl = 'img/icon.png';
            marker = new google.maps.Marker({
                position: g.get(0),
                icon: iconurl,
                name: feature.i.store_name,
                map: map
            });

            messageStore(marker, feature);
            return marker;
        });

        markersArray = markers;

        var markerCluster = new MarkerClusterer(map, markers, {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });

        find_closest_marker(geolocate);
    });


    // Define the custom marker icons, using the store's "category".
    map.data.setStyle(function (feature) {
        return {
            icon: {
                url: 'img/icon.png',
                scaledSize: new google.maps.Size(50, 50)
            },
            visible: false
        };
    });
}

function find_closest_marker(geolocate) {
    var distances = [];
    var closest = -1;

    var comparePoint = new google.maps.LatLng(geolocate.coords.latitude, geolocate.coords.longitude);

    for (i = 0; i < markersArray.length; i++) {
        var d = isWithinRadius(markersArray[i].position, geolocate.coords);

        distances[i] = d;
        if (closest == -1 || d < distances[closest]) {
            closest = i;
        }

    }
    console.log('Closest marker is: ' + markersArray[closest].name);
    document.getElementById('result').innerHTML = 'Closest marker is: ' + markersArray[closest].name;
}

/**
 * Search the location fill by the user
 */
function codeAddress() {
    var address = document.getElementById('SL_searchBox').value;

    if (address) {
        geocoder.geocode({
            'address': address
        }, function (results, status) {
            if (status == 'OK') {
                map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                map.setZoom(12);
                marker.setMap(null);

                // load stores in a selected radius
                loadStore(false, results[0].geometry.location);
            }
        });
    } else {
        map.setZoom(4);
        map.setCenter(new google.maps.LatLng(51.473739043616305, -94.88327521008102));
        //loadDataMap();
    }
}


/**
 * Display the store information on event click
 * 
 * @param {*} marker 
 * @param {*} feature 
 */
function messageStore(marker, feature) {

    const infoWindow = new google.maps.InfoWindow();
    infoWindow.setOptions({
        pixelOffset: new google.maps.Size(0, -30)
    });
    // Show the information for a store when its marker is clicked.
    marker.addListener('click', event => {
        const id = feature.getProperty('store_number');
        const name = feature.getProperty('store_name');
        const position = feature.getGeometry().get();
        const content = '<img class="gmapsImg" style="float:left" src="img/img.jpg"><div class="gmapsInfo"><h2>' + id + '</h2><p>' + name + '</p></div>';

        infoWindow.setContent(content);
        infoWindow.setPosition(position);
        infoWindow.open(map);
    });
}


/**
 * Center the map on the list click
 * 
 * @param {*} longitude 
 * @param {*} latitude 
 */
function centerMapPoint(longitude, latitude) {

    map.setCenter(new google.maps.LatLng(latitude, longitude));
    map.setZoom(13);
}

/**
 * Calcule the distance betwen the user search and the closest point
 * 
 * @param {*} location 
 * @param {*} locationSearch 
 * @param {*} radius 
 */
function isWithinRadius(location, locationSearch) {
    var locationLatLng = new google.maps.LatLng(location.lat(), location.lng());
    var userLatLng = new google.maps.LatLng(locationSearch.latitude, locationSearch.longitude);

    var distanceBetween = google.maps.geometry.spherical.computeDistanceBetween(locationLatLng, userLatLng);
    return convertMetersToKm(distanceBetween);
}

/**
 * Convert Km in Meters
 * 
 * @param {*} meters 
 */
function convertMetersToKm(meters) {

    var distanceKm = (meters / 1000);
    return distanceKm;
}