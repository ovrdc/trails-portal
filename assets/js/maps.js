---
---
{% if page.permalink == "mapzen" %}{% else %}
{% include map-plugins/leaflet.js%}
{% endif %}
/*adding omnivore directly since its node module dependencies are insane*/
{% include map-plugins/leaflet-omnivore.min.js%}
{% include map-plugins/leaflet-hash.js%}
{% include map-plugins/Leaflet.VectorGrid.bundled.js %}
{% include map-plugins/Leaflet.Sleep.js %}
{% include map-plugins/L.Control.Sidebar.js%}
{% include map-plugins/easy-button.js%}
{% include map-plugins/L.Control.Locate.min.js%}
{% include map-plugins/Leaflet.fullscreen.min.js%}
