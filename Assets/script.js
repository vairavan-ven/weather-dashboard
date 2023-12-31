// Constants
const apiKey = 'a65efee56afab4436b808473b5d8cc64';
const localStorageKey = 'searchHistory';
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentWeatherData = document.getElementById('current-weather-data');
const forecastData = document.getElementById('forecast-data');
const searchHistoryList = document.getElementById('search-history-list');

// Event listener for form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
        cityInput.value = '';
    }
});

// Function to fetch and display weather data
async function getWeatherData(city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();

        // Display current weather data with today's date
        const cityName = data.name;
        const today = new Date().toLocaleDateString(); // Get the current date
        const icon = data.weather[0].icon;
        const temperature = data.main.temp;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;

        currentWeatherData.innerHTML = `
            <h2>${cityName} (${today})</h2>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
            <p>Temperature: ${temperature}°C</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
        `;

        // Fetch 5-day forecast using coordinates
        const latitude = data.coord.lat;
        const longitude = data.coord.lon;
        await getWeatherForecast(latitude, longitude);

        // Save the searched city to local storage
        const searchHistoryData = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        searchHistoryData.push(city);
        localStorage.setItem(localStorageKey, JSON.stringify(searchHistoryData));
        renderSearchHistory();
    } catch (error) {
        console.error(error);
        currentWeatherData.innerHTML = 'City not found';
        forecastData.innerHTML = '';
    }
}

// Function to fetch and display 5-day forecast
async function getWeatherForecast(latitude, longitude) {
    try {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available');
        }

        const forecastDataResponse = await forecastResponse.json();

        // Clear previous forecast data
        forecastData.innerHTML = '';

        const forecastList = forecastDataResponse.list;

        const forecastContainer = document.createElement('div');
        forecastContainer.classList.add('forecast-container');

        for (let i = 0; i < forecastList.length; i += 8) {
            const forecastItem = forecastList[i];
            const forecastDate = new Date(forecastItem.dt * 1000).toLocaleDateString();
            const forecastIcon = forecastItem.weather[0].icon;
            const forecastTemp = forecastItem.main.temp;
            const forecastWind = forecastItem.wind.speed;
            const forecastHumidity = forecastItem.main.humidity;

            const forecastCard = document.createElement('div');
            forecastCard.classList.add('forecast-card');
            forecastCard.innerHTML = `
                <p>${forecastDate}</p>
                <img src="https://openweathermap.org/img/wn/${forecastIcon}.png" alt="Weather Icon">
                <p>Temp: ${forecastTemp}°C</p>
                <p>Wind: ${forecastWind} m/s</p>
                <p>Humidity: ${forecastHumidity}%</p>
            `;

            forecastContainer.appendChild(forecastCard);
        }

        forecastData.appendChild(forecastContainer);
    } catch (error) {
        console.error(error);
        forecastData.innerHTML = 'Forecast data not available';
    }
}

// Function to render search history
function renderSearchHistory() {
    const searchHistoryData = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    searchHistoryList.innerHTML = '';

    searchHistoryData.forEach((city) => {
        const historyButton = document.createElement('button');
        historyButton.textContent = city;
        historyButton.addEventListener('click', () => {
            cityInput.value = city;
            getWeatherData(city); // Call getWeatherData with the selected city
        });
        searchHistoryList.appendChild(historyButton);
    });
    // Limit search history to 5 most recent searches
    if (searchHistoryData.length > 5) {
        const excess = searchHistoryData.length - 5;
        searchHistoryData.splice(0, excess);
        localStorage.setItem(localStorageKey, JSON.stringify(searchHistoryData));
    }
}



// Function to load the search history from local storage
function loadSearchHistoryFromLocalStorage() {
    const historyData = JSON.parse(localStorage.getItem(localStorageKey)) || [];

    searchHistoryList.innerHTML = ''; // Clear the search history list

    historyData.forEach(function (city) {
        addToSearchHistory(city);
    });

    // Show the search history by default
    searchHistoryList.style.display = 'block';
}

// Function to add a search to the search history
function addToSearchHistory(city) {
    const existingHistory = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    
    // Remove the oldest entry if the history exceeds 5 entries
    if (existingHistory.length >= 5) {
        existingHistory.shift();
    }
    
    existingHistory.push(city);
    localStorage.setItem(localStorageKey, JSON.stringify(existingHistory));

    renderSearchHistory(); // Update the displayed search history
}


function saveToLocalStorage(data) {
    const existingHistory = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    existingHistory.push(data);
    localStorage.setItem(localStorageKey, JSON.stringify(existingHistory));
}
