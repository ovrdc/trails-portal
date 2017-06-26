/*L.mapbox.accessToken = 'pk.eyJ1Ijoib3ZyZGMiLCJhIjoiRUtXeFFzZyJ9.ufnW36oCZo96m_L9QsAkYg';*/
/*set all initial global variables*/
var hillshade, trails, hiking, biking, mapSidebar, mapTrailsListSidebar, userLocation, userLocationSetting, userLocationCircle, userLocatiouserLocationCircle, topo;

/*Initialize Map*/

{% if page.centery %}/*{{page.centery}}*/{% endif %}

var map = L.map('map', {
  center: {% if page.MID_Y %}[{{page.MID_Y}},{{page.MID_X}}]{% else %}[39.0469,-83.1061]{% endif %},
  zoom: {% if page.zoom AND page.zoom != '' or page.zoom != nil %}{{page.zoom}}{% else %}10{% endif%},
  maxZoom: 20,
  minZoom: 8,
  scrollWheelZoom: true,
  sleep: false,
  zoomControl: false
});

L.hash(map);

{% if page.centery %}map.setView([{{page.centery}}, {{page.centerx}}, {{page.zoom}}]);{% endif %}

var mapZoom = new L.control.zoom({position: "topright"}).addTo(map);
var fs = L.control.fullscreen({position: "topright"}).addTo(map);

/* `fullscreenchange` Event that's fired when entering or exiting fullscreen.*/
/*map.on('fullscreenchange', function () {
    if (map.isFullscreen()) {
      document.getElementById("map").style.top = "0";
    } else {
      document.getElementById("map").style.top = "49px";
    }
});*/

/*check if sceen is mobile or small, then dont load the map and show load button instead*/

var mapDivWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

console.log(mapDivWidth);
var showMap = document.getElementById("map-show-button");
showMap.addEventListener('click', function() {
  document.getElementById("map").style.display = "block";
  document.getElementById("map-show-button").style.display = "none";
  buildMap();
  map.toggleFullscreen();
});

if (mapDivWidth > 768) {
  buildMap()
}
else {
  document.getElementById("map").style.display = "none"
  document.getElementById("map-show-button").style.display = "block"
}

function buildMap() {

  /*add click handler to deal with multiple features*/
  /*link from here - https://stackoverflow.com/questions/38599872/get-all-features-of-all-layers-clicked-in-leaflet*/
  function clickHandler(e) {
    var clickBounds = L.latLngBounds(e.latlng, e.latlng);

    var intersectingFeatures = [];
    for (var l in map._layers) {
      var overlay = map._layers[l];
      if (overlay._layers) {
        for (var f in overlay._layers) {
          var feature = overlay._layers[f];
          var bounds;
          if (feature.getBounds) bounds = feature.getBounds();
          else if (feature._latlng) {
            bounds = L.latLngBounds(feature._latlng, feature._latlng);
          }
          if (bounds && clickBounds.intersects(bounds)) {
            intersectingFeatures.push(feature);
          }
        }
      }
    }
    // if at least one feature found, show it
    if (intersectingFeatures.length) {
      var html = "Multiple features found: " + intersectingFeatures.length + "<br/>" + intersectingFeatures.map(function(o) {
        return o.properties.type
      }).join('<br/>');

      map.openPopup(html, e.latlng, {
        offset: L.point(0, -24)
      });
    }
  }

  /*map.on("click", clickHandler);*/
  /*end click handler*/

  /*var fs = new L.control.fullscreen({position: "topright"});
  fs.addTo(map);*/

  /**********/
  /*Basemaps*/
  /**********/
  var hills = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    maxNativeZoom: 13
  });
  var stamen_hills = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.{ext}', {
  	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  	subdomains: 'abcd',
  	minZoom: 0,
  	maxZoom: 18,
  	ext: 'png'
  });
  var base = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
    maxNativeZoom: 18,
    attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    opacity: 0.7
  });
  var hillshadeHydda = new L.layerGroup([hills, base]).addTo(map);
  var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxNativeZoom: 18,
    maxZoom: 20
  });
  var labels = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/roads_and_labels/{z}/{x}/{y}.png', {
    maxNativeZoom: 18,
    maxZoom: 20,
    opacity: 0.9,
    attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  var ortho = new L.layerGroup([esri, labels], {});

  var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	  maxZoom: 20,
    maxNativeZoom: 17,
    minZoom: 9,
    opacity: 0.5,
    attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var thunderlandscape = new L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=7c352c8ff1244dd8b732e349e0b0fe8d', {
    attribution: '&copy; <a href="http://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    maxZoom: 22,
    opacity: 0.6
  });

  hillshade = hillshadeHydda;
  topo = OpenTopoMap;
  hillshade.addTo(map);
  /**********/
  /**********/

  /*Add outside counties first and build popup */

  var outsideCounties = new L.geoJSON(null, {
    style: function (feature) {
      if (feature.properties.NAME == "Outside OVRDC Region") {
        return {
          fillColor: "lightgray",
          weight: 1,
          color: "gray",
          opacity: 0.9,
          fillOpacity: 0.6
        }
      }
      if (feature.properties.NAME == "MORPC") {
        return {
          fillColor: "firebrick",
          weight: 1,
          color: "gray",
          opacity: 0.9,
          fillOpacity: 0.2
        }
      }
      if (feature.properties.NAME == "Miami Valley Trails | MVRPC") {
        return {
          fillColor: "skyblue",
          weight: 1,
          color: "gray",
          opacity: 0.9,
          fillOpacity: 0.2
        }
      }
    },
    onEachFeature: function(feature, layer) {
      if (feature.properties.website == "#") {
        layer.bindTooltip("Outside the Region", {sticky: true});
      }else{
        layer.bindPopup("<a href='" + feature.properties.website + "' target='_blank'>" + feature.properties.NAME + "</a>");
        layer.bindTooltip(feature.properties.NAME + " | Click for Link", {sticky: true});
      }
    }
  }).addTo(map);

  omnivore.topojson("/trails/outside_counties.topojson", null, outsideCounties);

  /**********/
  /*function for poi popup*/
  /**********/

  function poiPopup(feature, poi) {
    var latlng = poi._latlng.lat + ',' + poi._latlng.lng;
    poi.bindPopup('<h4>' + poi.feature.properties.name + '</h4>' +
    '<h5>' + poi.feature.properties.detail + '</h5>' +
    '<a href="https://www.google.com/maps/dir/?saddr=My+Location&daddr=' +
    latlng + '" target="_blank">Directions</a>');
  }
  /**********/
  /*function for creating the poi icon*/
  /**********/

  function createIcon(feature, latlng) {
    var type = feature.properties.symbol;
    /* POI Icons with customized Mapbox Maki Icons*/

    var icon = new L.ExtraMarkers.icon({
      icon: type,
      markerColor: '#333',
      svgBorderColor: '#fff',
      prefix: 'maki',
      shape: 'roundedSquare',
      svg: true,
      iconSize: [ 26, 26 ],
      iconAnchor: [ 7, 13 ],
      shadowAnchor: [ 0, 0 ],
      shadowSize: [ 0, 0 ],
    });
    return new L.marker(latlng, {
      icon: icon
    });
  }

  var pois = new L.geoJSON(null, {
    pointToLayer: createIcon,
    onEachFeature: poiPopup
  });/*
  var pois = new L.geoJSON(null, {
    pointToLayer: function(feature, latlng) {
      return new L.circleMarker(latlng, {radius: 12, opacity: 0, fillOpacity: 0})
    },
    onEachFeature: poiPopup
  });
  pois.addLayer(pois2);*/

  /**********/
  /**********/

  function getColor(t) {
    switch(t) {
      case "shared-path": return '#1b7837';
      case "walking": return '#1b7837';
      case "roadway": return '#1b7837';
      case "Hiking Trail": return '#936c39';
      case "Backpacking Trail": return '#936c39';
    }
  }

  function getDash(st) {
    if (st == "Extension" || st == "Hiking Trail") {
      return [10,10]
    }
    else return null
  }

  function getWeight(st) {
    if (st == "Extension" || st == "Hiking Trail") {
      return 3
    }
    else return 3
  }

  function trailsStyle(feature) {
    return {
      color: getColor(feature.properties.Type),
      weight: getWeight(feature.properties.subtype),
      opacity: 1,
      dashArray: getDash(feature.properties.subtype)
    }
  }
  /**********/
  /**********/

  var trailPopup = "";
  var trailDetailedPopup = "";

  /**********/
  /**********/

  function trailPopupFunction(feature, trail) {
    var p = feature.properties;
    trailPopup = '<h3>' + p.Name +
    '</h3><p>' + p.Description +
    '<hr /></p><img src="/trails/images/medium/' + p.img +'" style="width:100%;"</img>' +
    '<br /><br />Approximate Length: ' + Number(p["SUM_LENGTH"]).toFixed(0) + ' mi'+
    '<br />Need to add: Directions, gpx track load on open with elevation profile, nearby cities, points of interest button';

    trailDetailedPopup = '<h4>' + p.Name + '</h4>';
    for (var k in p) {
      var v = String(p[k]);
      trailDetailedPopup += '<strong>' + k + '</strong><br>' + v + '<br>' + '<hr style="margin:5px 0px;">';
    };
  /*  trail.bindPopup(trailPopup);*/
  }

  trails = L.geoJson(null).addTo(map);

  trails.on('click', function(e) {
    /*console.log(e.layer.feature);*/
    trailPopupFunction(e.layer.feature, null)
    mapSidebar.show();
    mapSidebar.setContent(trailPopup);
  });

  map.on('popupopen', function() {
    $("#moreInfo").click(function() {
      console.log('click');
      mapSidebar.show();
      mapSidebar.setContent(trailPopup)
    });
    map.closeTooltip()
  });

  hiking = L.geoJson(null, {
    style: trailsStyle,
    filter: function(feature) {
      if (feature.properties.maptype == "hiking" && feature.properties.Status == "Existing") {
        return true
      }
    },
    onEachFeature: function(feature, trail) {
      trail.bindTooltip(feature.properties.Name, {sticky: true});
      if (feature.properties.Name == "Buckeye Trail") {
        trail.setStyle({color: "steelblue", opacity: 0.6})
      }
    }
  });

  biking = L.geoJson(null, {
    style: trailsStyle,
    filter: function(feature) {
      if (feature.properties.maptype == "bikeway" && feature.properties.Status == "Existing") {
        return true
      }
    },
    onEachFeature: function(feature, trail) {
      trail.bindTooltip(feature.properties.Name, {sticky: true});
    }
  });

  trails.addLayer(hiking);
  trails.addLayer(biking);
  /**********/
  /**********/
  map.createPane("highlight");
  map.getPane("highlight").style.zIndex=350;
  var highlightStyle = {
    weight:7,color:"white", pane:"highlight", opacity: 0.8
  };
  var bikeHighlight = new L.geoJson(null, {
    style:highlightStyle,
    filter: function(feature) {
      if (feature.properties.Status == "Existing" && feature.properties.maptype == "bikeway") {
        return true
      }
    },
  }).addTo(map);
  var hikeHighlight = new L.geoJson(null, {
    style:highlightStyle,
    filter: function(feature) {
      if (feature.properties.Status == "Existing" && feature.properties.maptype == "hiking") {
        return true
      }
    },
  }).addTo(map);
  /**********/
  /**********/

  mapSidebar = L.control.sidebar('mapLeftSidebar', {
    closeButton: true,
    autoPan: true
  }).addTo(map);

  /********************/
  /*Add trails to right sidebar list from Mapbox store locator example*/
  /*******************/
  mapTrailsListSidebar = L.control.sidebar('mapRightSidebar', {
    closeButton: true,
    autoPan: true,
    position:'right'
  }).addTo(map);

  var trailsListDiv = document.getElementById('mapRightSidebar');

  function setActive(el) {
    var siblings = trailsListDiv.getElementsByTagName('div');
    for (var i = 0; i < siblings.length; i++) {
      siblings[i].className = siblings[i].className
      .replace(/active/, '').replace(/\s\s*$/, '');
    }

    el.className += ' active';
  }

  function populateTrailsList(trails, type) {
    /*console.log(trails);*/
    trails.eachLayer(function(trail) {
      var prop = trail.feature.properties;
      if (prop.subtype != "Extension") {
        if (type == 'bike') {
          var trailsList = document.getElementById('bike-list');
        }
        if (type == 'hike') {
          var trailsList = document.getElementById('hike-list');
        }
        var listing = trailsList.appendChild(document.createElement('div'));
        var link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.innerHTML = prop.Name;

        /*var listing = listings.appendChild(document.createElement('div'));
        listing.className = 'item';

        var link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.innerHTML = prop.address;

        if (prop.crossStreet) {
          link.innerHTML += ' <br /><small>' + prop.crossStreet + '</small>';
        }

        var details = listing.appendChild(document.createElement('div'));
        details.innerHTML = prop.city;*/
        link.onclick = function() {
          setActive(listing);

          // When a menu item is clicked, animate the map to center
          // its associated locale and open its popup.
          map.flyToBounds(trail.getBounds());
          trailPopupFunction(trail.feature, null)
          mapSidebar.show();
          mapSidebar.setContent(trailPopup);
          return false;
        };
      }
    });
  }

  /**********/
  /**********/

  /*make the map more friendly to scrolling*/
  /*map.on('click', function() {
    map.scrollWheelZoom.enable();
  });
  map.on('moveend', function() {
    map.scrollWheelZoom.enable();
  });
  map.on('zoomend', function() {
    map.scrollWheelZoom.enable();
  });
  map.on('mouseout', function() {
    map.scrollWheelZoom.disable();
  });*/

  /**********/
  /* Load map data and add to layers*/
  /**********/

  var poiData = omnivore.csv("/trails/ovrdc_trails_pois.csv", null, pois);

  var trailData = {};

  var omniTrailData = omnivore.topojson("/trails/ovrdc_trails_master_dissolve.json");
  omniTrailData.on('ready', function() {
    trailData = omniTrailData.toGeoJSON();
    hiking.addData(trailData);
    biking.addData(trailData);
    bikeHighlight.addData(trailData);
    hikeHighlight.addData(trailData);
    populateTrailsList(hiking, 'hike');
    populateTrailsList(biking, 'bike');
  });
  /**********/
  /**********/

  map.createPane('parcelPane');
  map.getPane('parcelPane').style.zIndex = 300;
  var parkData = omnivore.topojson("/trails/ovrdc_parks_web.topojson");
  parkData.on('ready', function(data) {
    var parksGeojson = parkData.toGeoJSON();
    var parks = L.vectorGrid.slicer(parksGeojson, {
      pane: "parcelPane",
      minZoom: 8,
      maxNativeZoom: 14,
      maxZoom: 22,
      rendererFactory: L.canvas.tile,
    	attribution: '© OVRDC',
      interactive: true,
      getFeatureId: function(feature) {
        return feature.properties.OBJECTID;
      },
    	vectorTileLayerStyles: {
        sliced: function(properties, zoom) {
          if (properties.Division == "Parks" ) {
            return {
              fillColor: "darkgreen",
              color: "darkgreen",
              weight: 2,
              opacity: 0.7,
              fillOpacity: 0.3,
              fill: true
            }
          }
          else  {
            return {
              fillColor: "darkseagreen",
              color: "darkseagreen",
              weight: 1,
              opacity: 0.5,
              fillOpacity: 0.1,
              fill: true
            }
          }
        }
      }
    }).addTo(map);
    parks.on('click', function(e) {
      var properties = e.layer.properties;
      L.popup()
        .setContent(properties.NAME)
        .setLatLng(e.latlng)
        .openOn(map);
    });
  });

  /**********/
  /**********/

  /**********/
  /**********/

  /**********/
  /*Easy Buttons*/
  /**********/

  /*button for turning on the pois*/
  var mapPoiToggle = L.easyButton({
    states: [{
      stateName: 'showPOI',
      icon: 'fa-star-o fa-2x',
      title: 'Show Points of Interest',
      onClick: function(btn, map) {
        if (!map.hasLayer(pois)) {
          map.addLayer(pois)
        }
        btn.state('hidePOI');
      }
    }, {
      stateName: 'hidePOI',
      icon: 'fa-star fa-2x',
      title: 'Remove Points of Interest',
      onClick: function(btn, map) {
        if (map.hasLayer(pois)) {
          map.removeLayer(pois)
        }
        btn.state('showPOI');
      }
    }]
  });

  var mapListToggle = L.easyButton({
    states: [{
      stateName: 'showList',
      icon: 'fa fa-th-list fa-2x',
      title: 'Toggle Trail List',
      onClick: function(btn, map) {
        if (mapTrailsListSidebar.isVisible()) {
          mapTrailsListSidebar.hide();
          var el = document.getElementsByClassName('fa fa-th-list');
          console.log(el);
          el[0].style.color = 'black';
        }
        else {
          mapTrailsListSidebar.show();
          var el = document.getElementsByClassName('fa fa-th-list');
          el[0].style.color = '#7fbf7b';
        }
      }
    }]
  });

  mapTrailsListSidebar.on('hidden', function() {
    var el = document.getElementsByClassName('fa fa-th-list');
    el[0].style.color = 'black';
  });

  var mapFilterControl = new L.control.layers(null, {
      "Bikeways": biking,
      "Hiking Trails": hiking
    }, {
      collapsed: false
    }
  );

  var mapFilter = L.easyButton({
    states: [{
      stateName: 'showFilter',
      icon: 'fa-filter fa-2x',
      title: 'View Map Filters',
      onClick: function(btn, map) {
        mapFilterControl.addTo(map);
        btn.state('removeFilter');
        var el = document.getElementsByClassName('fa fa-filter');
        el[0].style.color = '#7fbf7b';
        el[1].style.color = '#7fbf7b';
      }
    }, {
      stateName: 'removeFilter',
      icon: 'fa-filter fa-2x',
      title: 'Hide Map Filters Bikeways',
      onClick: function(btn, map) {
        map.removeControl(mapFilterControl);
        btn.state('showFilter');
      }
    }]
  });

  var lc = new L.Control.Locate();

  userLocationCircle = new L.circleMarker(null, {
    color: 'red',
    fillColor: 'red',
    radius: '10'
  });

  userLocationCircleFollow = new L.circleMarker(null, {
    color: 'blue',
    fillColor: 'blue',
    radius: 8
  });

  var setUserLocation;

  function setLocation() {
    setUserLocation = setInterval(function(){
      userLocationCircle.setLatLng(userLocation);
      console.log(1);
    }, 2000);
  }

  function clearLocation() {
    clearInterval(setUserLocation);
  }

  /*find users location on load and fill the userlocation variable with the latlng for later use*/
  map.locate({
    setview: false
  });

  map.on('locationfound', function(e) {
    userLocation = e.latlng;
    console.log(userLocation);
    if (userLocationSetting == 1) {
      userLocationCircleFollow.setLatLng(userLocation);
    }
    if (userLocationSetting == 2) {
      map.removeLayer(userLocationCircleFollow);
      userLocationCircle.setLatLng(userLocation);
      setLocation();
    }
  });

  map.on('locationerror', function() {
    alert('Location not found. Locate controls will not work.')
  });

  var mapUserLocation = L.easyButton({
    states: [{
      stateName: 'showLocation',
      icon: 'fa-location-arrow fa-2x',
      title: 'Zoom to My Location',
      onClick: function(btn, map) {
        userLocationSetting = 1;
        map.locate({
          setView: true,
          maxZoom: 14
        });
        userLocationCircleFollow.setLatLng(userLocation).addTo(map);
        btn.state('followLocation');
        var el = document.getElementsByClassName('fa-location-arrow');
        el[0].style.color = "#7fbf7b";
        el[1].style.color = "#7fbf7b";
      },
    },{
      stateName: 'hideLocation',
      icon: 'fa-location-arrow fa-2x',
      title: 'Stop Following My Location',
      onClick: function(btn, map) {
        map.removeLayer(userLocationCircle);
        clearLocation();
        btn.state('showLocation');
        userLocationSetting = 0;
      },
    },{
        stateName: 'followLocation',
        icon: 'fa-location-arrow fa-2x',
        title: 'Click to Follow My Location',
        onClick: function(btn, map) {
          /*console.log(btn);*/
          userLocationSetting = 2;
          map.locate({
            setView: true,
            maxZoom: 14,
            watch: true
          });
          userLocationCircle.setLatLng(userLocation).addTo(map);
          btn.state('hideLocation');
          var el = document.getElementsByClassName('fa-location-arrow');
          el[0].style.color = "firebrick";
          el[1].style.color = "firebrick";
        },
      }]
  });

  var mapHelp = L.easyButton('fa-question-circle fa-2x', function() {
    $("#mapHelpModal").modal("show");
  });

  $("#hideModal").click(function() {
    /*$("#mapHelpModal").hide().removeClass("show");*/
    $("#mapHelpModal").modal("hide");
  });
  $("#hideModal2").click(function() {
  /*  $("#mapHelpModal").hide().removeClass("show");*/
    $("#mapHelpModal").modal("hide");
  });

  var mapHelp = L.easyButton('fa-question-circle fa-2x', function() {
    $("#mapHelpModal").modal('show');
  });

  var bottomToolbar = L.easyBar([mapPoiToggle, mapListToggle, mapFilter, mapUserLocation, mapHelp], {
    id: 'mobile-toolbar',
    position: 'bottomleft'
  }).addTo(map);

  map.on('zoomend', function() {
    /**********/
    /**********/
    var currentZoom = map.getZoom();
    if (currentZoom < 11) {
      hiking.setStyle({weight:3});
      biking.setStyle({weight:3});
      bikeHighlight.setStyle({weight:5});
      hikeHighlight.setStyle({weight:5});
    }
    if (currentZoom > 12) {
      hiking.setStyle({weight:7});
      biking.setStyle({weight:9});
      bikeHighlight.setStyle({weight:13});
      hikeHighlight.setStyle({weight:13});
    }
    if (currentZoom > 12) {
      if (map.hasLayer(hillshade)) {
        map.removeLayer(hillshade);
        thunderlandscape.addTo(map);
      }
    }
    if (currentZoom < 13) {
      map.removeLayer(thunderlandscape);
      hillshade.addTo(map);
    }
    if (currentZoom > 15) {
      map.removeLayer(thunderlandscape);
      esri.addTo(map);
      labels.addTo(map);
    }
    if (currentZoom < 16) {
      if (map.hasLayer(esri)) {
        map.removeLayer(esri);
        map.removeLayer(labels);
        topo.addTo(map);
      }
    }
  });

  /**********/
  /*change basemap to ortho on high zoom*/
  /**********/

  map.on('zoomend', function() {

  });
  /**********/
  /**********/

  /* trail images and detail */

  /* Add share button */

  /*add location follow circle marker*/

  var mapLegend = L.control({position: "bottomright"});

  mapLegend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'map-legend'),
    types = ["Bikeways", "Hiking Trails", "Buckeye Trail", "Connectors", "Extensions"],
    colors = ["green", "brown", "steelblue", "green", "brown"],
    symbols = ["minus", "minus", "minus", "ellipsis-h", "ellipsis-h"];
    for (var i=0; i < 3; i++) {
      div.innerHTML += '<i class="fa fa-' + symbols[i] + ' fa-lg" style="color:' + colors[i] + ';"></i><span>' + types[i] + '</span>'
    }
    return div;
  };
  mapLegend.addTo(map);
}
