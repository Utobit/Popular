navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // Reverse Geocoding을 통해 국가를 확인 (Google Maps 예시)
    var geocoder = new google.maps.Geocoder();
    var latlng = {lat: latitude, lng: longitude};

    geocoder.geocode({location: latlng}, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                var country = null;

                // 국가 정보 찾기
                for (var i = 0; i < results[0].address_components.length; i++) {
                    var component = results[0].address_components[i];

                    if (component.types.includes("country")) {
                        country = component.short_name;
                        break;
                    }
                }

                // 사용자가 한국에 있을 경우 EPSG:5179로 좌표계 변경
                if (country === "KR") {
                    convertToKoreanCoordinateSystem();
                } else {
                    loadMapboxMap(); // 기본 Mapbox 지도 로드
                }
            }
        }
    });
}

function error() {
    console.error("위치 정보를 가져오지 못했습니다.");
}

// 한국 좌표계로 변환 후 지도 설정
function convertToKoreanCoordinateSystem() {
    // EPSG:5179 좌표계를 정의
    proj4.defs("EPSG:5179", "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs");

    // 변환할 좌표 (WGS84 -> EPSG:5179)
    var koreanCoords = proj4('EPSG:4326', 'EPSG:5179', [longitude, latitude]);

    var map = new mapboxgl.Map({
        container: 'map',
        center: koreanCoords, // 변환된 한국 좌표
        zoom: 15.5,
        style: 'vworld-style-here', // VWorld 스타일 적용
        projection: 'EPSG:5179' // 한국 기준 좌표계 적용
    });
}

// 기본 Mapbox 지도 로드
function loadMapboxMap() {
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [126.9780, 37.5665],
        zoom: 15.5
    });
}
