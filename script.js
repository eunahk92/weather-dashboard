let todaysDate = moment().format('M/D/YYYY');
let apiKey = '5cd5fd2d9b30522ba32d64386d6c6f6c';
var city = '';
var lat = '';
var long = '';
var weatherStatus = '';
var icon = '';
var citiesArr = JSON.parse(localStorage.getItem('cities')) || [];

renderWeather = () => {
    $('.displaytemp, .city-name, .temp, .forecast, .misc-weather, .date').empty();

    let dailyURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    // ajax request to get daily weather info
    $.ajax({
        url: dailyURL, 
        method: 'GET'
    }).then(function(response) {
        // Save JSON city name 
        city = response.name;
        // Create button if already not pre-existing
        if (citiesArr.indexOf(city) == -1) {
            citiesArr.push(city);
            renderButton(city);
        } else {
            renderButton(city);
        }
        // Convert temp
        var kToFarh = ((response.main.temp - 273.15) * 1.8 + 32).toFixed(0);
        // Convert sunrise to a time
        var sunriseTime = new Date(response.sys.sunrise * 1000).toLocaleTimeString([], {timeStyle: 'short'});
        // Convert sunset to a time
        var sunsetTime = new Date(response.sys.sunset * 1000).toLocaleTimeString([], {timeStyle: 'short'});
        // Save lat & long coordinates
        long = response.coord.lon;
        lat = response.coord.lat;

        // Save weather status description
        weatherStatus = response.weather[0].description;
        // Check weather conditions for icon display
        renderWeatherIcon(weatherStatus);

        var cityName = `<h4 class='mx-auto cityTitle'>${city} ${icon}</h4>`
        var date = `<h5 class='mx-auto'>${todaysDate}</h5>`
        var temperature = `<p class='mx-auto'>${kToFarh}°F</p>`
        var weatherInfo = `
            <table class='table-responsive mb-3'>
                <tr>
                    <td id='top-row'>Pressure</td>
                    <td id='top-row' class='text-right'>Humidity</td>
                </tr>
                <tr>
                    <td id='bottom-row'>${response.main.pressure} hpa</td>
                    <td id='bottom-row' class='text-right'>${response.main.humidity}%</td>
                </tr>
                <tr>
                    <td id='top-row'>Wind Speed</td>
                    <td id='top-row' class='text-right'>UV Index</td>
                </tr>
                <tr>
                    <td id='bottom-row'>${response.wind.speed} mph</td>
                    <td id='bottom-row' class='cityUVIndex text-right'></td>
                </tr>
                <tr>
                    <td id='top-row'>Sunrise</td>
                    <td id='top-row' class='text-right'>Sunset</td>
                </tr>
                <tr>
                    <td id='bottom-row'>${sunriseTime}</td>
                    <td id='bottom-row' class='text-right'>${sunsetTime}</td>
                </tr>
            </table>
        `
        $('.weather').addClass('border border-secondary rounded-lg');
        $('.temp').append(temperature);
        $('.city-name').append(cityName);
        $('.date').append(date);
        $('.misc-weather').append(weatherInfo);

        let uvURL = `http://api.openweathermap.org/data/2.5/uvi?&appid=${apiKey}&lat=${lat}&lon=${long}`;
        // ajax request to get uv index info
        $.ajax({
            url: uvURL, 
            method: "GET"
        }).then(function(uvResult) {
            var uvIndex = uvResult.value;
            if (uvIndex <= 2) {
                var lowIndex = `
                    <button type="button" class="btn btn-sm btn-success">${uvIndex}</button>
                `
                $('.cityUVIndex').html(lowIndex);
            } else if (uvIndex >= 3 && uvIndex <= 5) {
                var moderateIndex = `
                    <button type="button" class="btn btn-sm btn-warning">${uvIndex}</button>
                `
                $('.cityUVIndex').html(moderateIndex);
            } else if (uvIndex >=6) {
                var highIndex = `
                    <button type="button" class="btn btn-sm btn-danger">${uvIndex}</button>
                `
                $('.cityUVIndex').html(highIndex);
            }
        })
    });

    let forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    // ajax request to get 5 day forecast info
    $.ajax({
        url: forecastURL, 
        method: "GET"
    }).then(function(forecastResult) {
        for (var f = 0; f < forecastResult.list.length; f++) {
            let forecastTime = forecastResult.list[f].dt_txt.substr(11, forecastResult.list.length - 1);
            if (forecastTime === '15:00:00') {
                let nextDate = forecastResult.list[f].dt_txt.substr(5,6);
                var kToFarh = ((forecastResult.list[f].main.temp- 273.15) * 1.8 + 32).toFixed(0);
                weatherStatus = forecastResult.list[f].weather[0].description;
                renderWeatherIcon(weatherStatus);
                $('.forecast').addClass('card');
                var forecast = `
                    <div class="card-header d-flex flex-row" style="background: #ecf0f1">
                        <div class="col-3">
                            <span class="badge badge-dark p-2 align-self-center ">${nextDate}</span>
                        </div>
                        <div class="col-1">
                            <p class="text-center">${icon}</p>
                        </div>
                        <div class="col-3">
                        <p class="text-center ml-1">${kToFarh}°F</p>
                        </div>
                        <div class="col-5">
                            <p class="row smText">humidity: ${forecastResult.list[f].main.humidity}% <br> 
                            pressure: ${forecastResult.list[f].main.pressure} hpa</p>
                        </div>
                    </div>
                `
                $('.forecast').append(forecast);
            }
        }
    });
}

renderButton = (city) => {
    $('.citiesDiv').empty();
    for (var i = 0; i < citiesArr.length; i++) {
        var cityBtn = `
            <button type="button" class="btn btn-outline-primary btn-block" id="city">${citiesArr[i]}</button>
        `
        $('.citiesDiv').prepend(cityBtn);
        localStorage.setItem("cities", JSON.stringify(citiesArr));
    }        
}

renderWeatherIcon = (weatherStatus) => {
    if (weatherStatus.includes('clear')) {
        icon = `<i class="fas fa-sun ml-2"></i>`
    } else if (weatherStatus.includes('clouds')) {
        icon = `<i class="fas fa-cloud-sun ml-2"></i>`
    } else if (weatherStatus.includes('light rain')) {
        icon = `<i class="fas fa-cloud-sun-rain ml-2"></i>`
    } else if (weatherStatus.includes('moderate rain')) {
        icon = `<i class="fas fa-cloud-showers-heavy ml-2"></i>`
    } else if (weatherStatus.includes('heavy rain')) {
        icon = `<i class="fas fa-cloud-showers-heavy ml-2"></i>`
    }
}

renderLastSearched = () => {
    if (citiesArr.length != 0) {
        for (var y = 0; y < citiesArr.length; y++) {
            city = citiesArr[y];
            renderButton(city);
        }
        var lastSearchedCity = localStorage.getItem('last_searched');
        renderWeather(lastSearchedCity);
    }
}

// Event listener on search button
$('.searchBtn').on('click', function(e) {
    e.preventDefault();
    city = $('.searchBox').val().trim();
    $('.searchBox').val('');
    renderWeather();
})

// Grab city data name when a button is clicked on the document
$('.citiesDiv').on('click', '#city', function() {
    city = $(this).text();
    localStorage.setItem("last_searched", city);
    renderWeather();
});

renderLastSearched();