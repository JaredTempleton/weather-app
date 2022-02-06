$().ready(function () {

    if (localStorage.getItem('WeatherHistory') === null) {
        var weatherHistory = { cities: [] };
        localStorage.setItem('WeatherHistory', JSON.stringify(weatherHistory));
    } else {
        weatherHistory = JSON.parse(localStorage.getItem('WeatherHistory'));
    }

    var searchInput = $('#search-input');
    var searchBtn = $('#search-btn');
    var citiesList = $('#cities-list');
    var forecastContainer = $('#forecast-container');
    var uvi;


    function insertToLocal(city) {
        if (weatherHistory.cities.includes(city) === false) {
            weatherHistory.cities.push(city);
            localStorage.setItem('WeatherHistory', JSON.stringify(weatherHistory));
        }
    }
  
    function displayRecentCities() {
        citiesList.empty();
        weatherHistory.cities.forEach(element => {
            var currentCity = $('<div>').text(element);
            currentCity.addClass(['list-group-item', 'list-group-item-action', 'recent-city']);
            currentCity.attr('data-city', element);
            citiesList.append(currentCity);
            currentCity.on('click', function (e) {
                e.preventDefault();
                callAPI($(this).attr('data-city'));
            })
        });
    }
    
    function getFormatedDate(){
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        return `(${month}/${day}/${year})`;
    }

    function getDateEpoch(milliseconds) {
        var myDate = new Date(milliseconds * 1000);
        var day = myDate.getDate();
        var month = myDate.getMonth() + 1;
        var year = myDate.getFullYear();
        return `${month}/${day}/${year}`
    }

    function callAPI(city) {
        var apiKey = 'db8b5efe9618f33710cd0556eb302ced';
        var urlQuery = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=imperial';
        $.ajax({
            url: urlQuery,
            method: 'GET'
        }).then(function (data) {
            $('#current-weather').empty();
            $('#current-weather').append($('<h2>').text(data.name + ' ' + getFormatedDate()).addClass('card-title').css('display', 'inline') );
            
            var iconURL = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';
            
            var iconElement = $('<img>').attr('src', iconURL).css('display', 'inline');
            iconElement.css('margin-left', '1rem');
            iconElement.attr('alt', data.weather[0].description);
            $('#current-weather').append(iconElement);

            $('#current-weather').append($('<p>').text('Temperature: ' + data.main.temp + '°').addClass('card-text'));
            $('#current-weather').append($('<p>').text('Humidity: ' + data.main.humidity + '%').addClass('card-text'));
            $('#current-weather').append($('<p>').text('Wind Speed: ' + data.wind.speed + 'MPH').addClass('card-text'));

            var lat = data.coord.lat;
            var lon = data.coord.lon;

            getForecast(lat, lon)
        })
    }

    function getForecast(lat, lon) {
        var apiKey = '16265bff2120f2467d9ec41ab15065e7';
        var queryURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly,alerts&appid=' + apiKey + '&units=imperial';

        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (data) {
            forecastContainer.empty();
            uvi = data.current.uvi;

            var bgColor = '';
            if(uvi < 3) {
                bgColor = 'bg-success';
            } else if (uvi < 6) {
                bgColor = 'bg-warning';
            } else {
                bgColor = 'bg-danger';
            }

            
            for (let i = 1; i < 6; i++) {
                let dayData =  data.daily[i];
                var forecastCard = $('<div>');
                forecastCard.addClass(['card', 'text-white', 'bg-primary', 'border-light', 'mb-3']);

                var forecastCardBody = $('<div>').addClass('card-body');
                forecastCard.append(forecastCardBody);

                $('<h3>').addClass('card-title').text(getDateEpoch(dayData.dt)).appendTo(forecastCardBody);
                var forecastIconURL = 'https://openweathermap.org/img/wn/' + dayData.weather[0].icon + '@2x.png';
                $('<img>').attr('src', forecastIconURL).attr('alt', dayData.weather[0].description).css('width', '50%').appendTo(forecastCardBody);
                $('<p>').addClass('card-text').text('Temp: ' + dayData.temp.day + '°').appendTo(forecastCardBody);
                $('<p>').addClass('card-text').text('Humidity: ' + dayData.humidity + '%').appendTo(forecastCardBody);

                forecastCard.appendTo(forecastContainer);
            }
        
            var uvIndex =  $('<p>').addClass('card-text').text('UV index: ');
            uvIndex.appendTo($('#current-weather'));
            uvIndex.append($('<span>').text(uvi).addClass(['badge', bgColor]));

        });
    }


  
    searchBtn.on('click', function (e) {
        e.preventDefault();
        var city = searchInput.val();
        insertToLocal(searchInput.val());
        searchInput.val('');
        displayRecentCities();
        callAPI(city);
    });

    displayRecentCities();
});