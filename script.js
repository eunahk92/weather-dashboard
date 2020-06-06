let todaysDate = moment().format('M/D/YYYY');
const apiKey = 'd109526d72640a57247ed0c59ef7c7a2';
let city = '';
let lat = '';
let lon = '';
let weatherStatus = '';
let icon = '';
let citiesArr = JSON.parse(localStorage.getItem('cities')) || [];

renderWeather = () => {
    $('.displaytemp, .city-name, .temp, .forecast, .misc-weather, .date').empty();

    let dailyURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    // ajax request to get daily weather info
    $.ajax({
        url: dailyURL, 
        method: 'GET'
    }).then(function(response) {
        console.log(response);
        // Save JSON city name 
        const { name } = response;
        // Create button if already not pre-existing
        if (citiesArr.indexOf(name) == -1) {
            citiesArr.push(name);
            renderButton(name);
            localStorage.setItem('last_searched', name);
        } else {
            renderButton(name);
        }
        // Convert temp
        let kToFarh = ((response.main.temp - 273.15) * 1.8 + 32).toFixed(0);
        // Convert sunrise to a time
        let sunriseTime = new Date(response.sys.sunrise * 1000).toLocaleTimeString([], {timeStyle: 'short'});
        // Convert sunset to a time
        let sunsetTime = new Date(response.sys.sunset * 1000).toLocaleTimeString([], {timeStyle: 'short'});
        // Save lat & lon coordinates
        const { lon, lat } = response.coord;

        // Save weather status description
        weatherStatus = response.weather[0].description;
        // Check weather conditions for icon display
        renderWeatherIcon(weatherStatus);

        let cityName = `<h4 class='mx-auto cityTitle'>${name} ${icon}</h4>`
        let date = `<h5 class='mx-auto'>${todaysDate}</h5>`
        let temperature = `<p class='mx-auto'>${kToFarh}°F</p>`
        let weatherInfo = `
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

        let uvURL = `https://api.openweathermap.org/data/2.5/uvi?&appid=${apiKey}&lat=${lat}&lon=${lon}`;
        // ajax request to get uv index info
        $.ajax({
            url: uvURL, 
            method: "GET"
        }).then(function(res) {
            let { value } = res;
            if (value <= 2) {
                let lowIndex = `
                    <button type="button" class="btn btn-sm btn-success">${value}</button>
                `
                $('.cityUVIndex').html(lowIndex);
            } else if (value >= 3 && value <= 5) {
                let moderateIndex = `
                    <button type="button" class="btn btn-sm btn-warning">${value}</button>
                `
                $('.cityUVIndex').html(moderateIndex);
            } else if (value >=6) {
                let highIndex = `
                    <button type="button" class="btn btn-sm btn-danger">${value}</button>
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
    }).then(function(res) {
        for (let f = 0; f < res.list.length; f++) {
            let forecastTime = res.list[f].dt_txt.substr(11, res.list.length - 1);
            if (forecastTime === '15:00:00') {
                let nextDate = res.list[f].dt_txt.substr(5,6);
                let kToFarh = ((res.list[f].main.temp- 273.15) * 1.8 + 32).toFixed(0);
                weatherStatus = res.list[f].weather[0].description;
                renderWeatherIcon(weatherStatus);
                $('.forecast').addClass('card');
                let forecast = `
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
                            <p class="row smText">humidity: ${res.list[f].main.humidity}% <br> 
                            pressure: ${res.list[f].main.pressure} hpa</p>
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
    for (let i = 0; i < citiesArr.length; i++) {
        let cityBtn = `
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
        for (let y = 0; y < citiesArr.length; y++) {
            city = citiesArr[y];
            renderButton(city);
        }
        city = localStorage.getItem('last_searched');
        renderWeather(city);
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