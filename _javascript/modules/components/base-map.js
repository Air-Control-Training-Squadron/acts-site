export function initBaseMap() {
  const map = L.map('base-map', { attributionControl: false }).setView([
    34.2392, -116.0587
  ], 17);

  L.control.attribution({ prefix: false }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy;<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  fetch(assets.mapGeoJsonUrl).then(response => response.json()).then(data => {
    /* highlight buildings */
    L.geoJSON(data, {
      style: function (feature) {
        switch (feature.properties.buildingType) {
          case "classroom":
            return { color: "#0588fa" };
          case "barracks":
            return { color: "#4bf218" };
          case "amenity":
            return { color: "#faf205" };
          case "office":
            return { color: "#4992d1" };
          case "medical":
            return { color: "#ff0000" };
          case "chowhall":
            return { color: "#fa9511" };
        }
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.buildingName || feature.properties.buildingNum);
      }
    }).addTo(map);

    /* create clickable links which zoom on map */
    $('.card-header .card-link').click(function (event) {
      event.preventDefault();

      $('html, body').animate({
        scrollTop: $('#map').offset().top - offset
      }, 100);

      var buildingId = $(this).data('building');

      $('#map').get(0).scrollIntoView({ behavior: 'smooth' });

      var buildingData = data.features.find(function (feature) {
        return feature.properties.buildingId === buildingId;
      });

      if (buildingData) {
        var buildingCoordinates = buildingData.geometry.coordinates[0];
        var buildingLatLngs = buildingCoordinates.map(function (coord) {
          return L.latLng(coord[1], coord[0]);
        });

        map.flyToBounds(buildingLatLngs);

        var mapHeight = $('#map').height();
        var viewportHeight = $(window).height();
        var offset = (viewportHeight - mapHeight) / 2;
      }
    });
  });

  /* Opening the correct tab based on hash */
  $(function () {
    var hash = window.location.hash;
    if (hash) {
      $('.nav-link').removeClass('active');
      $('.tab-pane').removeClass('active');
      $(hash + '-tab').addClass('active');
      $(hash).addClass('active');
    }
  });
}