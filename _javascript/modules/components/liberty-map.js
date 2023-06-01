export function initLibertyMap() {
  const gatePoint = L.latLng(34.20911, -116.05383);

  let map;

  /* Size of map behaves erratically on a hidden div */

  /* This creates and resets the size of the map whenever the accordion is opened */
  $('#collapse-map').on('shown.bs.collapse', function () {
    if (!map) {
      initMap();
    } else {
      map.invalidateSize();
    }
  });

  function initMap() {
    map = L.map('liberty-map', { attributionControl: false }).setView(gatePoint, 5);

    L.control.attribution({ prefix: false }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy;<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.circle(gatePoint, {
      color: 'green',
      fillColor: 'green',
      fillOpacity: 0.1,
      radius: 1609.34 * 500
    }).addTo(map);
    L.circle(gatePoint, {
      color: 'orange',
      fillColor: 'orange',
      fillOpacity: 0.1,
      radius: 1609.34 * 350
    }).addTo(map);
    L.circle(gatePoint, {
      color: 'red',
      fillColor: 'red',
      fillOpacity: 0.1,
      radius: 1609.34 * 100
    }).addTo(map);
    L.circle(gatePoint, {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.1,
      radius: 1609.34 * 30
    }).addTo(map);
  }

  function prependClass(element, newClass) {
    const currentClassValue = $(element).attr('class') || '';
    $(element).attr('class', newClass + ' ' + currentClassValue);
  }

  function setPromptClass(element, newClass) {
    const promptElement = $(element);
    const classes = promptElement.attr('class').split(' ');

    $.each(classes, function (index, className) {
      if (className.startsWith('prompt-')) {
        promptElement.removeClass(className);
      }
    });

    prependClass(promptElement, newClass);
    return promptElement;
  }

  let marker;
  let line;
  function addressToLatLng() {
    $('#spinner-display').addClass('d-flex');
    $('#distance-display').hide();
    const address = $('#address').val();

    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + address)
      .then(response => response.json())
      .then(data => {
        if (data.length == 0) {
          setPromptClass('#distanceDisplay', 'prompt-danger').text('Address not found.');
          return;
        }

        const destPoint = L.latLng(data[0].lat, data[0].lon);

        /* Display visual stuff on map */
        if (marker) {
          map.removeLayer(marker);
        }
        if (line) {
          map.removeLayer(line);
        }
        marker = L.marker(destPoint).addTo(map);
        line = L.polyline([
          gatePoint, destPoint
        ], {
          color: 'black',
          dashArray: '10,10'
        }).addTo(map);
        map.flyToBounds([
          gatePoint, destPoint
        ], {
          animate: true,
          duration: 0.25
        });

        /* Calculate distance */
        const dist = Math.ceil(gatePoint.distanceTo(destPoint) / 1609);

        if (dist > 500) {
          setPromptClass('#distance-display', 'prompt-danger').html(`Distance: ${dist} miles.<br>Out of bounds.`);
          return;
        }

        /* Check if location is in Mexico */
        const locationArray = data[0].display_name.split(',');
        const country = locationArray[locationArray.length - 1].trim();

        if (country === 'Mexico') {
          setPromptClass('#distance-display', 'prompt-danger').html(`Distance: ${dist} miles.<br>Location is in Mexico.`);
          return;
        }

        /* Otherwise display liberty bound range */
        let libBoundRange;
        if (dist <= 30) {
          libBoundRange = "workday";
        } else if (dist <= 100) {
          libBoundRange = "48 hour";
        } else if (dist <= 350) {
          libBoundRange = "72 hour";
        } else if (dist <= 500) {
          libBoundRange = "96 hour";
        }

        setPromptClass('#distance-display', 'prompt-info').html(`Distance: ${dist} miles.<br>Within ${libBoundRange} limits.`);
      })
      .catch(error => {
        setPromptClass('#distance-display').addClass('prompt-danger').text(`Error: "${error}"`);
      })
      .finally(() => {
        $('#spinner-display').removeClass('d-flex');
        $('#distance-display').show();
      });
  }

  /* Opens accordion if link refers to the id */
  $(function () {
    var hash = window.location.hash;
    if (hash === '#liberty-limits-map') {
      $('#liberty-limits-map .accordion-button').click();
    }
  });
}