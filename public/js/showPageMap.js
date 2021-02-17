mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 7.5, // starting zoom
});

let popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
  `<h5>${campground.title}</h5><p>${campground.location}</p>`
);

new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(popup)
  .addTo(map);

map.addControl(new mapboxgl.NavigationControl());
