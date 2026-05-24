const mapDiv = document.querySelector('.map');
if (mapDiv) {
  mapDiv.style.backgroundImage = 'none';
  mapDiv.style.minHeight = '300px';
  ymaps.ready(() => {
    const map = new ymaps.Map(mapDiv, {
      center: [45.041226, 38.980440],
      zoom: 17,
      controls: ['zoomControl', 'fullscreenControl']
    });
    const placemark = new ymaps.Placemark([45.041226, 38.980440], {
      balloonContent: 'Акромебель<br>Краснодар, Московская 144 корпус‑1'
    });
    map.geoObjects.add(placemark);
  });
}