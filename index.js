var vueInstance;
class Earthquake {
    constructor(mag, place, time, tz, lat, lon, depth) {
        this.mag = mag
        this.place = place
        this.time = time
        this.tz = tz
        this.lat = lat
        this.lon = lon
        this.depth = depth
    }
}

var earthquakeList = []
var filteredList = []

function filterEarthquakesForDate(fromDate, toDate, earthquakes) {
  filteredList = filteredList.filter((eq) => {
    //   console.log(`FROM: ${fromDate}, TO: ${toDate}, CURRENT: ${eq.time}`)
    //   console.log(`EARTHQUAKE IS IN BETWEEN? ${fromDate <= eq.time && eq.time <= toDate}`)
    return (fromDate <= eq.time) && (eq.time <= toDate)
  })
}

function filterEarthquakesForMagnitude(from, to, earthquakes) {
  var i = 0
  filteredList = filteredList.filter((eq) => {
    if (eq.mag >= from && eq.mag <= to) i++
    return eq.mag >= from && eq.mag <= to
  })
}


$(document).ready(function() {
    $('#datepicker-from').datepicker({
        defaultDate: new Date("01/01/2019"),
      onSelect: function () {
        var newFromDate = $('#datepicker-from').datepicker('getDate');
        var toDate = $('#datepicker-to').datepicker('getDate');
        updateFilterForDate(newFromDate.getTime(), toDate.getTime())
        updateEarthquakes(filteredList)
      }
    });
    $('#datepicker-to').datepicker({
        defaultDate: new Date("09/07/2019"),
        onSelect: function (newToDate) {
          var fromDate = $('#datepicker-from').datepicker('getDate');
          var newToDate = $('#datepicker-to').datepicker('getDate');
          updateFilterForDate(fromDate.getTime(), newToDate.getTime())
          updateEarthquakes(filteredList)
      }
    });
    $(".js-range-slider").ionRangeSlider({
      type: "double",
      min: 5,
      max: 10,
      step: 0.1,
      onChange: function (slider) {
        updateFilterForMagnitude(slider.from, slider.to)
        updateEarthquakes(filteredList)
      }
    });

    $.ajax({
        type: "GET",
        url: "http://localhost:8000/earthquakes",
        dataType: 'json',
        success: function(earthquakes){
            earthquakeList = earthquakes
            filteredList = earthquakes
            // Set earthquakes, then filter
            var fromDate = $('#datepicker-from').datepicker('getDate');
            var toDate = $('#datepicker-to').datepicker('getDate');
            var slider = $(".js-range-slider").data("ionRangeSlider").result;
            var x = filterEarthquakesForMagnitude(slider.from, slider.to)
            filterEarthquakesForDate(fromDate.getTime(), toDate.getTime())
            loadEarthquakes(filteredList);
        },
        error: function( xhr, status, errorThrown ) {
            /* Temp, for debugging. Remove/alter before push to production. */
            alert( "Something went wrong! Check the console for logs." );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    })

    $('#toggle-options').click(function() {
        toggleOptions();
    })

    $('#overlay').click(function() {
        toggleOptions();
    })

})

function updateFilterForMagnitude(from, to) {
  filteredList = earthquakeList.slice()
  var fromDate = $('#datepicker-from').datepicker('getDate');
  var toDate = $('#datepicker-to').datepicker('getDate');
  filterEarthquakesForDate(fromDate.getTime(), toDate.getTime())
  filterEarthquakesForMagnitude(from, to)
}

function updateFilterForDate(fromDate, toDate) {
  filteredList = earthquakeList.slice()
  filterEarthquakesForDate(fromDate, toDate)
  var slider = $(".js-range-slider").data("ionRangeSlider").result;
  filterEarthquakesForMagnitude(slider.from, slider.to)
}

function toggleOptions() {
    $('#options').toggle();
    $('#overlay').toggle();
}

function loadEarthquakes(earthquakes) {
    console.log(earthquakes)
    someMarkers = []
    for (var eq of earthquakes) {
        someMarkers.push({
            latLng: [eq.latitude, eq.longitude],
            name: eq.place,
            mag: eq.mag,
            time: eq.time
        })
    }

    $('#world-map').vectorMap({
        map: 'world_mill',
        markerStyle: {
            initial: {
                fill: '#f52222',
                stroke: '#2e2e2e'
            }
        },
        markers: someMarkers,
        onMarkerTipShow: function(event,label,index){
            var markers = $('#world-map').vectorMap('get', 'mapObject').markers;
            let current = markers[index].config
            var timeString = getStringForEpoch(current.time)
            label.html(
                '<b>'+current.name.charAt(0).toUpperCase() + current.name.slice(1) +'</b><br/>'
                + "Magnitude: " + current.mag +'<br/>' +
                "Date: " + timeString + '<br/>'
            );
        },
        onRegionTipShow: function(e, el, code){
            e.preventDefault();
        }
    });
    
}

function getStringForEpoch(epoch) {
    console.log(epoch)
    var date = new Date(epoch)

    var year = date.getYear() + 1900
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hours = date.getHours()
    var minutes = date.getMinutes()

    console.log(year)
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

function updateEarthquakes(earthquakes) {
    /*someMarkers = []
    for (var eq of earthquakes) {
        someMarkers.push({
            latLng: [eq.latitude, eq.longitude],
            name: eq.place,
            mag: eq.mag
        })
    }
    var x = $('#world-map').vectorMap('get', 'mapObject').markers
    console.log(x);*/
    $('#world-map').vectorMap('get', 'mapObject').remove()
    loadEarthquakes(earthquakes)
}
