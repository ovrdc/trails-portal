var basemap = L.Mapzen.BasemapStyles.Walkabout;
if (L.Browser.android) {
  var drag = true;
  /*basemap = L.Mapzen.BasemapStyles.BubbleWrap*/
}else{
  var drag = true;
  basemap = L.Mapzen.BasemapStyles.WalkaboutNoLabels;
}

var map,
  tangramLayer,
  x = false,
  key = L.Mapzen.apiKey = "mapzen-btYeCLJ",
  labels = L.Mapzen.BasemapStyles.Walkabout;

/*Build map function*/

function buildMap() {
  map = new L.Mapzen.map('map', {
    dragging: drag,
    scrollWheelZoom: true,
    zoomControl: false,
    sleep: false,
    tangramOptions: {
      scene: basemap
    }
  });
  var newZoomControl = new L.control.zoom({position: 'topright'}).addTo(map);
  /*why did I have to look through source code to find this??*/
  map.on('tangramloaded', function(e) {
    tangramLayer = e.tangramLayer;
  });
  var latlng = [39.098,-83.047];
  map.setView(latlng, 9);
  var geocoder = L.Mapzen.geocoder(key, {
    layers: ["locality", "street"],
    expanded: false,
    markers: false
  });
  /*function for poi popup*/

  function poiPopup(feature, poi) {
    var latlng = poi._latlng.lat + ',' + poi._latlng.lng;
    poi.bindPopup('<h4>' + poi.feature.properties.Title + '</h4>' +
    '<a href="https://www.google.com/maps/dir/?saddr=My+Location&daddr=' +
    latlng + '" target="_blank">Directions</a>');
    }

  /*function for creating the poi icon*/

  function createIcon(feature, latlng) {
    var type = feature.properties.symbol;
    /* POI Icons with customized Mapbox Maki Icons*/
    var icon = new L.ExtraMarkers.icon({
      icon: type,
      markerColor: '#333',
      svgBorderColor: '#333',
      prefix: 'maki',
      svg: true
    });
    return new L.marker(latlng, {
      icon: icon
    });
  }

  var pois = new L.geoJson(null, {
    pointToLayer: createIcon,
    onEachFeature: poiPopup
  });

  function getColor(t) {
    switch(t) {
      case "shared-path": return '#1b7837';
      case "walking": return '#1b7837';
      case "roadway": return '#1b7837';
      case "Hiking Trail": return 'saddlebrown';
      case "Backpacking Trail": return 'saddlebrown';
    }
  }

  function getDash(st) {
    if (st == "Extension") {
      return [5,7,2,7]
    }
    else return null
  }

  function getWeight(st) {
    if (st == "Extension") {
      return 5
    }
    else return 7
  }

  function trailsStyle(feature) {
    return {
      color: getColor(feature.properties.Type),
      weight: getWeight(feature.properties.subtype),
      opacity: 1,
      dashArray: getDash(feature.properties.subtype)
    }
  }

  var trails = L.geoJson(null, {
    style: trailsStyle,
    filter: function(feature) {
      if (feature.properties.Status == "Existing") {
        return true
      }
    },
    onEachFeature: function(feature, trail) {
      var p = feature.properties;
      var popup = '<h4>' + p.Name +
      '</h4>Type:' + p.maptype +
      '<hr /><br />Subtitle: ' + p.subtitle +
      '<br />Length: ' + Number(p["SUM_LengthMi"]).toFixed(4) + ' mi' +
      '<br />Popup: ' + p.popup +
      '<br />Notes: ' + p.Notes;
      trail.bindPopup(popup);
      trail.bindTooltip(p.Name, {sticky: true});
    }
  }).addTo(map);

  map.on('popupopen', function() {
    map.closeTooltip()
  });

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

  /*button for turning on the pois*/
  var poiLayerButton = L.easyButton({
    states: [{
      stateName: 'add',
      icon: 'fa-product-hunt fa-2x',
      title: 'Show Points of Interest',
      onClick: function(btn, map) {
        if (!map.hasLayer(pois)) {
          map.addLayer(pois)
        }
        btn.state('remove');
      }
    }, {
      stateName: 'remove',
      icon: 'fa-minus-circle fa-2x',
      title: 'Remove Points of Interest',
      onClick: function(btn, map) {
        if (map.hasLayer(pois)) {
          map.removeLayer(pois)
        }
        btn.state('add');
      }
    }]
  });

  poiLayerButton.addTo(map);

  map.createPane("highlight");
  map.getPane("highlight").style.zIndex=350;
  var newtrails = new L.geoJson(null, {
    style:{weight:9,color:"white", pane:"highlight", opacity: 0.6},
    filter: function(feature) {
      if (feature.properties.Status == "Existing") {
        return true
      }
    }
  }).addTo(map);

  /* Load map data and add to layers*/
  $.getJSON("/trails/data/ovrdc_trails_pois.geojson", function() {
    console.log('done loading poi data')
  })
  .done(function(data) {
    console.log('poi data ready');
    pois.addData(data);
    console.log(data);
  })
  .fail(function() {
    console.log('error loading poi data')
  });

  $.getJSON("/trails/data/ovrdc_trails_web.geojson", function(data) {
    console.log('done loading trail data')
  })
  .done(function(data) {
    console.log(data);
    trails.addData(data);
    newtrails.addData(data);
  })
  .fail(function() {
    console.log('error loading trail data')
  });
  map.createPane('parcelPane');
  map.getPane('parcelPane').style.zIndex = 550;
  var parkData = omnivore.topojson("/trails/data/ovrdc_parks_web_topo.json");
  parkData.on('ready', function(data) {
    var geojson = parkData.toGeoJSON();
    var parks = L.vectorGrid.slicer(geojson, {
      pane: "parcelPane",
      minZoom: 8,
      maxNativeZoom: 14,
      maxZoom: 22,
      rendererFactory: L.canvas.tile,
    	attribution: '© OVRDC',
      interactive: false,
      getFeatureId: function(feature) {
        return feature.properties.OBJECTID;
      },
    	vectorTileLayerStyles: {
        sliced: {
          fillColor: "green",
          color: "green",
          weight: 1,
          fillOpacity: 0.1,
          fill: true
        }
      }
    }).addTo(map);
  });


  /*change basemap to ortho on high zoom*/
  map.on('zoomend', function() {
    if (map.getZoom() > 15) {
      map.removeLayer(hillshade);
      esri.addTo(map);
      labels.addTo(map);
    }
    if (map.getZoom() < 16) {
      if (map.hasLayer(esri)) {
        map.removeLayer(esri);
        map.removeLayer(labels);
        hillshade.addTo(map);
      }
    }
  });

  /* Add Sidebar */

  /* Populate Sidebar on trail click */

  /* trail images and detail */

  /* Add share button */

  /* Add geolocation button */

  /* Add link back to homepage on overview map */

  /* Add trail outline when zoomed in for ortho view */
}
window.onload = function() {
  buildMap();
}
