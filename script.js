let todaysDate = moment().format('M/D/YYYY');
let apiKey = '5cd5fd2d9b30522ba32d64386d6c6f6c';
var citiesArr = [];
var city = '';
var lat = '';
var long = '';

// function displays weather info on user searched city
renderWeather = () => {
    $('.displaytemp, .city-name, .city-temp, .forecast, .misc-weather').empty();

    let dailyURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    // ajax request to get daily weather info
    $.ajax({
        url: dailyURL, 
        method: "GET"
    }).then(function(response) {
        // Convert temp
        var kToFarh = ((response.main.temp - 273.15) * 1.8 + 32).toFixed(0);
        // Convert sunrise to a time
        var sunriseTime = new Date(response.sys.sunrise * 1000);
        var sunriseHour = sunriseTime.getHours();
        var sunriseMins = sunriseTime.getMinutes();
        // Convert sunset to a time
        var sunsetTime = new Date(response.sys.sunset * 1000);
        var sunsetHour = sunsetTime.getHours();
        var sunsetMins = sunsetTime.getMinutes();
        // Save lat & long coordinates
        long = response.coord.lon;
        lat = response.coord.lat;

        city = response.name;
        if (citiesArr.indexOf(city) == -1) {
            citiesArr.push(city);
            renderCityBtn(city);
        }


        var cityName = `
            <h4 class='mx-auto'>${city} - ${todaysDate}</h4>
        `

        var temperature = `
            <p id='temp' class='mx-auto'>${kToFarh}°F</p>
        `

        var weatherInfo = `
            <table class='table-responsive'>
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
                    <td id='bottom-row'>${sunriseHour}:${sunriseMins}</td>
                    <td id='bottom-row' class='text-right'>${sunsetHour}:${sunsetMins}</td>
                </tr>
            </table>
        `
        $('.city-temp').append(temperature);
        $('.city-name').append(cityName);
        $('.misc-weather').append(weatherInfo);

        let uvURL = `http://api.openweathermap.org/data/2.5/uvi?&appid=${apiKey}&lat=${lat}&lon=${long}`;

        // ajax request to get uv index info
        $.ajax({
            url: uvURL, 
            method: "GET"
        }).then(function(result) {
            var uvIndex = result.value;

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
        console.log(forecastResult);
        forecastArr = [forecastResult.list[3],
                        forecastResult.list[10],
                        forecastResult.list[15],
                        forecastResult.list[20],
                        forecastResult.list[25]];
        // response.list[f].main.temp 
        for (var f = 0; f < forecastArr.length; f++) {
            var nextDate = moment().add(1, 'days').format('MM-DD');
            var kToFarh = ((forecastArr[f].main.temp- 273.15) * 1.8 + 32).toFixed(0);
            var forecast = `
            <div class="card border-secondary rounded-lg" style="width: 20%;">
                <div class="card-body">
                    <p class="card-text">${nextDate}</p>
                    <h5 class="card-title">${kToFarh}</h5>
                </div>
            </div>
            `
        $('.forecast').append(forecast)
        }
    });

}

// function creates list of cities searched by user and displays onto page on the side
renderCityBtn = () => {
    $('.citiesDiv').empty();
    for (var i = 0; i < citiesArr.length; i++) {
        var newCity = `
            <button type="button" class="btn btn-outline-primary btn-block" id="city" data-name="${citiesArr[i]}">${citiesArr[i]}</button>
        `
        $('.citiesDiv').prepend(newCity);
    }
    // renderWeather();
}

// Event listener on search button
$('.searchBtn').on('click', function(e) {
    e.preventDefault();

    city = $('.searchBox').val().trim();

    if (city != '') {
        if (citiesArr.indexOf(city) !== -1) {
            alert("Please enter a new city");
        } else {
            // renderCityBtn();
            renderWeather();
        }
    } else {
        return;
    }

    $('.searchBox').val('');
})

// Grab city data name when a button is clicked on the document
$(document).on('click', '#city', function() {
    city = $(this).attr('data-name');
    renderWeather();
});