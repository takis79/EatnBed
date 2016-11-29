var map;
var service;
// center location used for map
var clocation;
// location used for calculating distance between user and places
var ulocation;
var infoWindow;
// marker of current location
var homemarker;

var places = [];
var markers = [];
var openClicked = false;
var locationGiven = false;
var loggedin = 0;
var counter = 0;

function getMapCenter() {

  // if at index, reset center of map to Glasgow city centre
  var page = document.URL.split('eatnbed/')[1];
  clocation = new google.maps.LatLng(55.863791, -4.251667);
  if (page == 'index.html') {
    $.cookie('clat', escape("55.863791"), {expires:1234});
    $.cookie('clng', escape("-4.251667"), {expires:1234});
  }
  // get previous center of map from cookies
  var lat = unescape($.cookie('clat'));
  var lng = unescape($.cookie('clng'));
  if (lat != 'undefined') clocation = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
  return clocation;
}

function initMap() {

  // initialise map, default Google Maps function
  map = new google.maps.Map(document.getElementById('map'), {

    center: getMapCenter(),
    zoom: 14,
styles: [
    {
        "stylers": [
            {
                "saturation": -100
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": 50
            },
            {
                "gamma": 0
            },
            {
                "hue": "#50a5d1"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#333333"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text",
        "stylers": [
            {
                "weight": 0.5
            },
            {
                "color": "#333333"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "labels.icon",
        "stylers": [
            {
                "gamma": 1
            },
            {
                "saturation": 50
            }
        ]
    }
]

  });
  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);

}

function indexLoad() {

  // radar search of amenities in Glasgow used in index page
  var request = {
    bounds: map.getBounds(),
    types: ['restaurant', 'meal_takeaway','lodging'],
  };
  service.radarSearch(request, callback);
}

// sort results stored in places list by rating
function sortByRating(list) {
  var sorted = list;
  for (var i=0; i < sorted.length -1 ; i++)
    for (var j=i+1; j < sorted.length; j++)
      if (sorted[i].rating<sorted[j].rating){
        var aux = sorted[i];
        sorted[i]=sorted[j];
        sorted[j]=aux;
      }
  return sorted;
}

// callback function used by Google Places search
function callback(results, status, pagination) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      store(place);
      if (locationGiven) {
        // if current location is set, show home marker
        infoWindow = new google.maps.InfoWindow();
        addHomeMarker(infoWindow, ulocation);
      }
      // show result in results page
      addResult(place);
      var marker = addMarker(place);
      markers.push(marker);

    }
    if (pagination.hasNextPage) pagination.nextPage();
  }
}

// callback function used by search for Near You option
function callbacknear(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    // results limited to 9 because of query limits
    for (var i = 0; i < 9; i++) {
      var place = results[i];
      service.getDetails(place, function(result, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          console.error(status);
          return;
        }
        store(result);
        addResult(result);
      });
      var marker = addMarker(place);
      markers.push(marker);
    }
  }
}

// save current map center to cookies
function saveMapCenter() {
  var center = map.getCenter();
  $.cookie('clat', escape(center.lat()), {expires:1234});
  $.cookie('clng', escape(center.lng()), {expires:1234});
}

// stores a place in the places list
function store(place) {
  if (!place.rating) place.rating = 0;
  // calculate distance between place and centre of Glasgow or current location
  place.distance = (google.maps.geometry.spherical.computeDistanceBetween(ulocation, place.geometry.location) / 1000).toFixed(2);
  places.push(place);
}

// add marker of the place to map
function addMarker(place) {
  console.log(place.icon);
  if(place.icon == "https://maps.gstatic.com/mapfiles/place_api/icons/lodging-71.png"){
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: {
      url: 'images/hotel.png',
      anchor: new google.maps.Point(8, 25),
      scaledSize: new google.maps.Size(41, 41)
    },
    place: {
      location: place.geometry.location,
      placeId: place.place_id
    }
  });
              }
  else{
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      icon: {
        url: 'images/marker.png',
        anchor: new google.maps.Point(8, 25),
        scaledSize: new google.maps.Size(41, 41)
      },
      place: {
        location: place.geometry.location,
        placeId: place.place_id
      }
    });
              }

  google.maps.event.addListener(marker, 'click', function() {
  service.getDetails(place, function(result, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      console.error(status);
      return;
    }
    // add details in infoWindow
    website = "<br/>";
    var address = "";
    if (result.formatted_address) address = result.formatted_address.split(', United Kingdom')[0];
    if (result.website) website = "| <a class='markerlink' href='" + result.website + "'>Visit website</a><br/>"
    var content = "";
    if (result.photos) content = "<div style='display:table-cell'><img style='margin: auto;display:block' src=" + result.photos[0].getUrl({"maxWidth": 200, "maxHeight": 100}); + "/></div>";
    infoWindow.setContent(
      content +
      "<div style ='display:table-cell'><a href='place.html?id=" + result.place_id + "' style='color:#008080;text-decoration:none;font-size:1.5em;font-weight:bold;'>" + result.name +
      "</a><br/><a class='markerlink' href='place.html?id=" + result.place_id + "'>Visit page</a> " + website + address + "</div>"
    );
    infoWindow.open(map, marker);
    });
  });
  return marker;
}

// add place to results
function addResult(place) {
  // opening hours
  openNow = null;
  if (place.opening_hours) openNow = place.opening_hours.open_now;
  var result = '<div class="result" data-id=' + place.place_id + '>';
  // photo
  if (place.photos)
    result += '<img class="restaurant-image" src="' + place.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100}) + '"/>';
  else
    result += '<img class="restaurant-image" src="images/restaurant.png"/>';
  if (openNow)
    result += '<div class="open">OPEN</div>';
  result += '<span class="title">' + place.name + '</span><div style="font-size: 1em" class="rating">'+ getIconRating(place.rating) +'</div>';
  result += '<div class="details">';
  // type
  var type = "";
  if (place.types) type = place.types[0];
  result += '<table><tr><td align="center">'
  result += getType(type);
  // address
  var address = "";
  if (place.formatted_address) address = place.formatted_address.split(', United Kingdom')[0];
  result += '</td></tr><tr><td align="center"><i class="fa fa-map-marker"></i></td><td> ' + address + '</td></tr>';
  // distance
  result += '<tr><td align="center"><i class="fa fa-road"></i></td><td> ' + place.distance + ' km from ';
  if (locationGiven) result += 'your current location</td></tr>'
  else result += 'City Centre</td></tr>';
  result += '</table>';
  result += '</div></div>';
  $('#results').append(result);
}

function getType(type) {
  switch (type) {
    case 'meal_takeaway':
      type = '<i class="fa fa-cutlery"></i></td><td> Restaurant and takeaway';
      break;
    case 'night_club':
      type = '<i class="fa fa-glass"></i></td><td> Night Club';
      break;
    case 'bar':
      type = '<i class="fa fa-glass"></i></td><td> Bar';
      break;
    case 'restaurant':
      type = '<i class="fa fa-cutlery"></i></td><td> Restaurant';
      break;
    case 'cafe':
      type = '<i class="fa fa-coffee"></i></td><td> Cafe';
      break;
    case 'lodging':
      type = '<i class="fa fa-bed"></i></td><td> Hotel';
      break;
    case 'spa':
      type = '<i class="fa fa-bullseye"></i></td><td> Spa';
      break;
    default:
      type = '<i class="fa fa-cutlery"></i></td><td> ' + type.charAt(0).toUpperCase() + type.slice(1);
  }
  return type;
}

// return given rating in stars
function getRating(rating) {
  // round rating
  var rate = Math.round(rating);
  var stars = "";
  if (rate == 0) return stars;
  for (var i = 0; i < rate; i++) stars += "★";
  for (var i = rate; i < 5; i++) stars += "☆";
  return stars;
}

// return given rating in star icons
function getIconRating(rating) {
  // round rating
  var rate = Math.round(rating);
  var stars = "";
  if (rate == 0) return stars;
  for (var i = 0; i < rate; i++) stars += '<i class="fa fa-star"></i>';
  for (var i = rate; i < 5; i++) stars += '<i class="fa fa-star-o"></i>';
  return stars;
}

// search for places with given query
function searchQuery(query, open) {
  places = [];
  $('.result').each(function () {
    $(this).remove();
  })
  // put query in results header
  $('#results-for').text("Results for " + query);
  var request = {
    bounds: map.getBounds(),
    query: query,
    types: ['restaurant', 'meal_takeaway','lodging'],
    openNow: open
  }
  service.textSearch(request, callback);
}

// use geolocation to get user's current location
function setLocation() {
  infoWindow = new google.maps.InfoWindow({map: map});
  if (locationGiven) infoWindow.close();
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      // put location in cookies
      infoWindow = new google.maps.InfoWindow({map: map});
      locationGiven = true;
      $.cookie('lat', escape(pos.lat), {expires:1234});
      $.cookie('lng', escape(pos.lng), {expires:1234});
      addHomeMarker(infoWindow, pos);
    }, function() {
      //handleLocationError(true, infoWindow, map.getCenter());
    });
  }
}

// adds home marker to map
function addHomeMarker(infoWindow, pos) {
  homemarker.setMap(null);
  infoWindow.setPosition(pos);
  infoWindow.setContent("<span style='font-weight:bold;color:#a6a6a6;font-size:1.5em;'>You are here.</span>");
  homemarker = new google.maps.Marker({
    map: map,
    position: pos,
    icon: {
      url: 'images/home.png',
      anchor: new google.maps.Point(8, 25),
        scaledSize: new google.maps.Size(41, 41)
    }
  });
  google.maps.event.addListener(homemarker, 'click', function() {
    infoWindow.setContent("<span style='font-weight:bold;color:#a6a6a6;font-size:1.5em;'>You are here.</span>");
    infoWindow.open(map, homemarker);
  });
}

// shows places near you within a 500 metre readius
function nearYou() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: clocation,
    zoom: 14,
styles: [
    {
        "stylers": [
            {
                "saturation": -100
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": 50
            },
            {
                "gamma": 0
            },
            {
                "hue": "#50a5d1"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#333333"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text",
        "stylers": [
            {
                "weight": 0.5
            },
            {
                "color": "#333333"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "labels.icon",
        "stylers": [
            {
                "gamma": 1
            },
            {
                "saturation": 50
            }
        ]
    }
]

  });
  infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      clocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      locationGiven = true;
      infoWindow.setPosition(pos);
      infoWindow.setContent("<span style='font-weight:bold;color:#a6a6a6;font-size:1.5em;'>You are here.</span>");
      map.setCenter(pos);

      homemarker = new google.maps.Marker({
        map: map,
        position: pos,
        icon: {
          url: 'images/home.png',
          anchor: new google.maps.Point(8, 25),
scaledSize: new google.maps.Size(41, 41)        }
      });
      google.maps.event.addListener(homemarker, 'click', function() {
        infoWindow.setContent("<span style='font-weight:bold;color:#a6a6a6;font-size:1.5em;'>You are here.</span>");
        infoWindow.open(map, homemarker);
      });
      $('#results-for').text("Near You");
      var request = {
        types: ['restaurant', 'meal_takeaway','lodging'],
        location: pos,
        radius: 500,
      };
      service.radarSearch(request, callbacknear);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

// used by geolocation function
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

// callback function used by search in place page
function callbackid(place, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    map = new google.maps.Map(document.getElementById('map'), {
      // center map at current place's location
      center: place.geometry.location,
      zoom: 14,
styles: [
    {
        "stylers": [
            {
                "saturation": -100
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": 50
            },
            {
                "gamma": 0
            },
            {
                "hue": "#50a5d1"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#333333"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text",
        "stylers": [
            {
                "weight": 0.5
            },
            {
                "color": "#333333"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "labels.icon",
        "stylers": [
            {
                "gamma": 1
            },
            {
                "saturation": 50
            }
        ]
    }
]

    });

    var infoWindow = new google.maps.InfoWindow({
      content:"<a style='color:#2437c4;text-decoration:none;font-size:2em;font-weight:bold;'>" + place.name + "</a>"
    });

    // add marker at current place
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      icon: {
        url: 'images/selected.png',
        anchor: new google.maps.Point(10, 32),
      }
    });
    marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
    marker.addListener('click', function() {
      infoWindow.open(map, marker);
    });
    // add place details in page
    createPlaceView(place);
    searchQuery('restaurant', false);
  }
}

// create place details page
function createPlaceView(place) {
  // name
  $('#placeheader').text(place.name);
  // rating
  $('#placeheader').append('<div id="headerrating">'+ getIconRating(place.rating) +'</div>');
	// photo, if no photos are available, use default image
	var result = '<div style="height: 3em;"></div><div class="place-details">';
	if (place.photos)
		result += '<div id="imagecontainer"><img class="restaurant-image-large" src="' + place.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 300}) + '"/></div>';
	else
		result += '<div id="imagecontainer"><img class="restaurant-image-large" src="images/restaurant.png"/></div>';
  // address
  var address = place.formatted_address.split(', United Kingdom')[0];
   result+='<div class="details"><table align="center"><tr><td align="center"><i class="fa fa-map-marker"></i></td><td> ' + address + '</td></tr>';
  // type
  result += '<tr><td align="center">'
  var type = "";
  if (place.types) type = place.types[0];
  result += getType(type);
  // telephone
  var tel=place.formatted_phone_number;
  result+= '</td></tr><tr><td align="center"><i class="fa fa-phone"></i></td><td> ' + tel + '</td></tr>';
  // website
  var site=place.website;
  if (site)	result+= '<tr><td align="center"><i class="fa fa-globe"></i></td><td> <a style="text-decoration:none" href="'+ site + '">' + site + '</a></td></tr>';
  // price level
  var priceLevel=place.price_level;
  var formattedPriceLevel;
  if (priceLevel==0){
    formattedPriceLevel= 'Free';
  }else if (priceLevel==1){
    formattedPriceLevel= 'Inexpensive';
  }else if (priceLevel==2){
    formattedPriceLevel= 'Moderate';
  }else if (priceLevel==3){
    formattedPriceLevel= 'Expensive';
  }else if (priceLevel==4){
    formattedPriceLevel= 'Very Expensive';
  }else formattedPriceLevel= 'No details about pricing';
  result+= '<tr><td><i class="fa fa-gbp"></i></td><td> ' + formattedPriceLevel +'</td></tr>'
  var distance = place.distance = (google.maps.geometry.spherical.computeDistanceBetween(ulocation, place.geometry.location) / 1000).toFixed(2);
  result += '<tr><td align="center"><i class="fa fa-road"></i></td><td> ' + distance + ' km from ';
  if (locationGiven) result += 'your current location';
  else result += 'City Centre';
  result+=  '</td></tr></table></div>';
	// opening hours
  var hours = "";
	openNow = null;
  result += '<div class="placesection"><i class="fa fa-calendar"></i> Opening hours</div>';
  result += "<div class='details' align='center'>"
	if (place.opening_hours) openNow = place.opening_hours.open_now ? '<b>Open now!</b>' : '<b>Closed.</b>';
  if (openNow) {
    hours += openNow + "<br/>";
    for (i=0; i<7;i++){
      hours+= place.opening_hours.weekday_text[i]+ '<br/>';
    }
  } else {
    hours += 'Opening hours not available.' + '</div></div>';
  }
	result += hours + "</div>";
  // reviews
	var i=0;
	if (place.reviews){
		result+='<div class="placesection"><i class="fa fa-newspaper-o"></i> Reviews</div>';
		var reviews= place.reviews;
    result += '<div class="details">'
		$.each(reviews, function(key, value){
			if (i<6){
				result+='<div class="review"><i class="fa fa-user"></i> <b>'+ value.author_name+ '</b>' +'<br>'+value.text + '<br><b>Rating:</b> '+getRating(value.rating)+'</div>';
			}
			i++;
		})
	} else {
		result+='No reviews for this place.';
	}
  result += '</div>'
  // append result to page
  $('#place').append(result);
}

// show results in list in results page
function showResults(places) {
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    addResult(place);
  }
}

// logs user in, used by register and login buttons
function submit() {
  $.cookie('loggedin', escape(1), {expires:1234});
  window.location.href = 'index.html';
}

$(document).ready(function() {
  // get search history from cookies
  var cookie=unescape($.cookie('history'));
  var history=cookie.split(',');

  // boolean variables for sidebar toggles
  var sidebar = false;
  var sortbar = false;
  var filtertoggle = true;
  var cuisinetoggle = false;
  var searchtoggle = false;

  var amenities = ['Restaurants', 'Take-away', 'Hotels', 'Bar', 'Spa'];

  // store user's current location
  var lat;
  var lng;

  $(window).load(function() {
    homemarker = new google.maps.Marker();
    // get user's current location from cookies
    lat = unescape($.cookie('lat'));
    lng = unescape($.cookie('lng'));
    if (lat != 'undefined') {
      ulocation = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
      locationGiven = true;
    } else {
      // if no current location set, set location to Glasgow city centre
      ulocation = new google.maps.LatLng(55.863791, -4.251667);
      locationGiven = false;
    }

    // check if user is logged in from cookies (1 for logged in, 0 otherwise)
    loggedin = unescape($.cookie('loggedin'));
    // if logged in, hide log in and registered icons and show profile and logout icons
    if (loggedin == 1) {
      $('.loggedin').css('display', 'block');
      $('.loggedout').css('display', 'none');
    }

    // if at index, go to indexLoad function
    var page = document.URL.split('eatnbed/')[1];
    if (page == 'index.html') return indexLoad();
    // boolean used if not at a place page
    var bool = true;
    // get query from URL
    var query = location.search.split('query=')[1];

    if (query != undefined)
      $('#search').val(decodeURI(query));
    if (query == undefined) {
      // if no query, check if url is for a place with a place id
      var id = location.search.split('id=')[1];
      // if a place id is given, get details of place with that id
      if (id != undefined) {
        var request = { placeId: id };
        service = new google.maps.places.PlacesService(map);
        service.getDetails(request, callbackid);
        // page is a place page
        var bool = false;
      }
      if (bool) {
        // check if at filter page
        var filter = location.search.split('filter=')[1];
        if (filter == undefined) {
          // if no filter, do default query
          initMap();
          searchQuery("restaurant", false);
        } else {
          if (filter == "near") nearYou();
          if (filter == "popular") {
            searchQuery("restaurant", false);
            $('#results-for').text("Most Popular");
          }
          if (filter == "open") {
            openClicked = true;
            searchQuery("restaurant", openClicked);
            $('#results-for').text("Open Now");
          }
        }
      }
    } else {
      // normal query, search with it
      initMap();
      query = decodeURI(query);
      searchQuery(query, false);
    }
  });

  // append cuisine filters at sidebar
  $(window).load(function() {
    for (i = 0; i < amenities.length; i++) {
      $('#cats').append('<div class="filter filter-cuisine" data-cuisineitem="' + amenities[i] + '">' + amenities[i] + '</div>');
    }
  });

  $('#sidebaricon').hover(function() {
    $(this).css("background-image", "url('images/sidebarselected.png')");
  },
  function() {
    $(this).css("background-image", "url('images/sidebar.png')");
  });

  $('.result').hover(function() {
    $(this).css("background-color", "blue");
  },
  function() {
    $(this).css("background-color", "black");
  });

  $(document).on("mouseenter", ".filter", function() {
    $(this).css("background-color", "#2437c4");
    $(this).css("color", "#ffffff");
  });

  $(document).on("mouseleave", ".filter", function() {
    $(this).css("background-color", "#ffffff");
    $(this).css("color", "#000000");
  });

  $(document).on("mouseenter", ".result", function() {
    $(this).css("background-color", "#726dff");
  });

  $(document).on("mouseleave", ".result", function() {
    $(this).css("background-color", "#fdfdfd");
  });

  $(document).on("click", ".result", function() {
    $(this).css("background-color", "#2437c4");
    var id = $(this).data('id');
    window.location.href = 'place.html?id=' + id;
  });

  $(document).on("mouseenter", ".sortoption", function() {
    $(this).css("background-color", "#2437c4");
    $(this).css("color", "#ffffff");
  });

  $(document).on("mouseleave", ".sortoption", function() {
    $(this).css("background-color", "#ffffff");
    $(this).css("color", "#000000");
  });

  // sort options
  $(document).on("click", ".sortoption", function() {
    var option = $(this).data('option');
    // hide results
    $('.result').each(function () {
      $(this).remove();
    });
    // copy places list
    var sorted = places.slice();
    switch (option) {
      case "name":
        // sort by name
        for (var i = 0; i < sorted.length -1 ; i++)
          for (var j = i+1; j < sorted.length; j++)
            if (sorted[i].name > sorted[j].name) {
              var aux = sorted[i];
              sorted[i] = sorted[j];
              sorted[j] = aux;
            }
        break;
      case "rating":
        // sort by rating
        sorted = sortByRating(sorted);
        break;
      case "proximity":
        // sort by proximity using place's distance value
        for (var i = 0; i < sorted.length -1 ; i++)
          for (var j = i+1; j < sorted.length; j++)
            if (sorted[i].distance > sorted[j].distance) {
              var aux = sorted[i];
              sorted[i] = sorted[j];
              sorted[j] = aux;
            }
        break;
      default:
        break;
    }
    // show shorted results
    showResults(sorted);
    // hide sort bar
    $('#sortbar').css("display", "none");
    $('#sortbox > img').attr("src", "images/expand.png");
    sortbar = false;
  });

  // toggle sidebar
  $('#sidebaricon').click(function() {
    if (sidebar) $('#sidebar').css("display", "none");
    else $('#sidebar').css("display", "table");
    sidebar = !sidebar;
  });

  // toggle sidebar filter menu
  $('#filtertoggle').click(function() {
    if (filtertoggle) $('#filtertoggle > img').attr("src", "images/expand.png");
    else $('#filtertoggle > img').attr("src", "images/shrink.png");
    filtertoggle = !filtertoggle;
    $('#filters').toggle();
  });

  // toggle sidebar cuisine menu
  $('#cuisinetoggle').click(function() {
    if (cuisinetoggle) $('#cuisinetoggle > img').attr("src", "images/expand.png");
    else $('#cuisinetoggle > img').attr("src", "images/shrink.png");
    cuisinetoggle = !cuisinetoggle;
    $('#cats').toggle();
  });

  // toggle sidebar recent searches menu
  $('#searchtoggle').click(function() {
    if (searchtoggle) $('#searchtoggle > img').attr("src", "images/expand.png");
    else $('#searchtoggle > img').attr("src", "images/shrink.png");
    searchtoggle = !searchtoggle;
    $('#searchhistory').toggle();
  });

  // search for cuisine name clicked on
  $(document).on('click', '.filter-cuisine', function () {
    var query = $(this).data('cuisineitem');
    saveMapCenter();
    window.location.href = 'results.html?query=' + query;
  });

  // Near You sidebar button
  $(document).on('click', '#nearyou', function () {
    window.location.href = 'results.html?filter=near';
  });

  // Most Popular sidebar button
  $(document).on('click', '#popular', function () {
    saveMapCenter();
    window.location.href = 'results.html?filter=popular';
  });

  // Open Now sidebar button
  $(document).on('click', '#opennow', function () {
    saveMapCenter();
    window.location.href = 'results.html?filter=open';
  });

  // sidebar search buttons
  $(document).on('click', '.filter-search', function () {
    var query = $(this).text();
    $('#search').val(query);
    saveMapCenter();
    initMap();
    searchQuery(query, false);
  });

  // change colour of marker for place result currently hovered on
  $(document).on({
    mouseenter: function () {
      var placeId = $(this).data('id');
      var marker;
      var icon = {
        url: 'images/selected.png',
        anchor: new google.maps.Point(8, 25),
scaledSize: new google.maps.Size(41, 41)      };
      markers.forEach(function (m) {
        if (m.getPlace().placeId == placeId) marker = m;
      });
      marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
      marker.setIcon(icon);
    },
    mouseleave: function () {
      var placeId = $(this).data('id');
      var marker;
      var icon = {
        url: 'images/marker.png',
        anchor: new google.maps.Point(8, 25),
scaledSize: new google.maps.Size(41, 41)      };
      markers.forEach(function (m) {
        if (m.getPlace().placeId == placeId) marker = m;
      });
      marker.setIcon(icon);
    }
  }, '.result');

  // search
  $('#search').keydown( function(e) {
	   var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
	   if (key == 13) {
		   var query = $(this).val();
			if (history.indexOf(query) == -1) {
        // search history has size 5 or more, remove first element
        if (history.length >= 5) history = history.slice(1);
        // add latest search to search history
        history.push(query);
      }
      // save search history in cookies
			$.cookie('history', escape(history.join(',')), {expires:1234});
      saveMapCenter();
      // search for query
			window.location.href = 'results.html?query=' + query;
	   }
   });

  $('#search').keyup(function(e){
    if(e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });

  // append recent searches to sidebar
  $(window).load(function() {
    for (i = 0; i < history.length; i++) {
  	  if (history[i] !== "undefined" ) {
  		  $('#searchhistory').append('<div class="filter filter-cuisine" data-cuisineitem="' + history[i] + '">' + history[i] + '</div>');
  	  }
    }
  });

  // toggle sort sidebar
  $('#sortbox').click(function() {
    if (sortbar) {
      $('#sortbar').css("display", "none");
      $('#sortbox > img').attr("src", "images/expand.png");
    }
    else {
      $('#sortbar').css("display", "table");
      $('#sortbox > img').attr("src", "images/shrink.png");
    }
    sortbar = !sortbar;
  });

  // change background colour of hovered icons in header
  $('.headericon').hover(function() {
    $(this).css("background-color", "#2437c4");
  }, function() {
    $(this).css("background-color", "");
  });

  // functions for header icons
  $('.headericon').click(function() {
    var val = $(this).attr('id');
    switch (val) {
      case 'login':
        $('#logincontainer').css('display', 'block');
        $('#registercontainer').css('display', 'none');
        break;
      case 'register':
        $('#logincontainer').css('display', 'none');
        $('#registercontainer').css('display', 'block');
        break;
      case 'profile':
        // go to profile page
        window.location.href = 'profile.html';
        break;
      case 'logout':
        $.cookie('loggedin', escape(0), {expires:1234});
        window.location.href = 'index.html';
        break;
      case 'location':
        setLocation();
        break;
      default:
        break;
    }
  });

  // hide log in or register forms
  $('.closebutton').click(function() {
    $(this).parent().parent().css('display', 'none');
  });
});

console.log(markers);
