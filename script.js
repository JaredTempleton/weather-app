$().ready(function () { 

    //get history from local storage
    if (localStorage.getItem("pastWeather") === null) {
        var pastWeather = {cities: []};
        localStorage.setItem("pastWeather", JSON.stringify(pastWeather));
    }   else {
        pastWeather = JSON.parse(localStorage.getItem("pastWeather"));
    }

    //global elements/varables
    
    var cityList = $("#city-list");
    var forecastContainer = $("#forecast-container");
    var searchStorage = $("#search-storage");
    var searchBtn = $("search-Btn");
    var uvIndex;

    function localStorageSave(city) {
        if (pastWeather.cities.includes(city) === false) {
            pastWeather.cities.push(city);
            localStorage.setItem('pastWeather', JSON.stringify(pastWeather));
        }
    }

    //function to display recent searches
    function displayRecent() {
        cityList.empty();
        pastWeather.cities.forEach(element => {
            var currentCity = $("<div>").text(element);
            currentCity.addClass(["list-group-item", "list-group-item-action", "recent-city"]);
            currentCity.attr("data-city", element);
            cityList.append(currentCity);
            currentCity.on("click", function (e) {
                e.preventDefault();
                callAPI($(this).attr("data-city"));
            })
        });
    }

    function callAPI(city) {
        var apiKey = "87af09b480e9430c23e9eeb789a8fa4f";
        var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=imperial;"
        $.ajax({
            url: apiUrl,
            method: "GET"
        }).then(function (data) {
            $("#current-weather").empty();
            $("#current-weather").append($("<h2>").text(data.name));

            var icon = "https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png";
            var iconImg = $("<img>").attr("src", icon).css("display", "inline");
            iconImg.css("margin-left", "1rem");
            iconImg.attr("alt", data.weather[0].description);
            $('#current-weather').append(iconImg);

            $("#current-weather").append($("p").text("Temperature: " + data.main.temp + "°").addClass("card-text"))
            $("#current-weather").append($("p").text("Wind: " + data.wind.speed + "MPH").addClass("card-text"))
            $("#current-weather").append($("p").text("Humidity: " + data.main.humidity + "%").addClass("card-text"))

            var latitude = data.coord.lat;
            var longitude = data.coord.lon;
        })
        
    }

    function forecast(latitude,longitude) {
        var forecastApi = "https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly,alerts&appid=' + apiKey + '&units=imperial'";

        $ajax({
            url: forecastApi,
            method: "GET"
        }).then(function(data) {
            forecastContainer.empty();
            uvIndex = data.current.uvi;

            var uvColor = "";
            if(uvi < 3) {
                uvColor = "bg-success";
            } else if (uvIndex < 6) {
                uvColor = "bg-warning";
            } else {
                uvColor = "bg-danger";
            }

            for (let i = 1; i <6; i++) {
                let dayWeather = data.daily[i];
                var forecastBox = $("<div>");
                forecastBox.addClass(["card", "text-white", "bg-primary", "border-light", "mb-3"]);

                var forecastBoxParent = $("<div>").addClass("card-body");
                forecastBox.append(forecastBoxParent);

                $("<h3>").addClass("card-title").text(getDateEpoch(dayWeather.dt)).appendTo(forecastCardParent);
                var forecastIcon = "https://openweathermap.org/img/wn/" + dayWeather.weather[0].icon + "@2x.png";
                $("<img>").attr("src", forecastIcon).attr("alt", dayWeather.weather[0].description).css("width", "50%").appendTo(forecastCardBody);
                $("<p>").addClass("card-text").text("Temp: " + dayWeather.temp.day + "°").appendTo(forecastCardParent);
                $("<p>").addClass("card-text").text("Humidity: " + dayWeather.humidity + "%").appendTo(forecastCardParent);

                forecastBox.appendTo(forecastContainer);
            }

            var uvi = $("<p>").addClass("card-text").text("UV Index: ");
            uvi.appendTo($("#current-weather"));
            uvi.append($("<span>").text(uvIndex).addClass(["badge", bgColor]));

        })
    }

    searchBtn.on("click", function (e) {
        e.preventDefault();
        var city = searchStorage.val();
        localStorageSave(searchStorage.val());
        searchStorage.val("");
        recentCityList();
        callAPI(city);
    });
    recentCityList();
    

});
