//getting the elements from the HTML
const cityInput = document.querySelector(".searchInput");
const searchButton = document.querySelector(".searchButton");
const locationButton = document.querySelector(".currentLocationButton");
const mainCard = document.querySelector(".mainCard");
const recentCitiesDropdown = document.getElementById("recentCitiesDropdown");
const card1 = document.getElementById("card1");
const card2 = document.getElementById("card2");
const card3 = document.getElementById("card3");            
const card4 = document.getElementById("card4");
const card5 = document.getElementById("card5");

const API_KEY = "cbd3f854f023d9a77c840eeb0fb47765";  // Unique API key for OpenWeatherMap


// Function to get location coordinates
const getLocationCordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    fetch(GEOCODING_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Geocoding Data:", data); // Log the geocoding data
            if (!data || data.length === 0) {
                throw new Error("No weather data available for this location.");
            }

            const { lat, lon } = data[0];
            getWeatherDetails(cityName, lat, lon); // Call the weather details function
        })
        .catch(error => {
            console.error("Error fetching city coordinates:", error);
            alert("An error occurred while fetching city coordinates: " + error.message);
        });
        
}
// FUnction to get current location coordinates
const getCurrentLocationCorodinates = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const Reverse_GEOCODING_API= `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
            fetch(Reverse_GEOCODING_API)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => { 
                console.log("Geocoding Data:", data); // Log the geocoding data
                if (!data || data.length === 0) {
                    throw new Error("No weather data available for this location.");
                }
                const { name } = data[0];
            getWeatherDetails(name, lat, lon);}  )
           
        }, (error) => {
            console.error("Error getting location:", error);
            alert("Unable to retrieve your location. Please enter a city name.");
        });
    }else {
        alert("Geolocation is not supported by this browser.");
    }
};

// Function to get weather details
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Weather Data:", data); // Log the weather data
            if (!data || !data.main) {
                throw new Error("No weather data available for this location.");
            }
            const aqiText = getAQI(lat, lon).then(aqiText =>{  
            cityInput.value = ""; 
            saveCityTosessionStorage(cityName);   
            createWeatherCard(cityName, data,aqiText)});

        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("An error occurred while fetching weather data: " + error.message);
        });

    fetch(FORECAST_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Forecast Data:", data); // Log the forecast data
            if (!data || !data.list) {
                throw new Error("No forecast data available for this location.");
            }
         
            data.list.slice(0,15).forEach((weatherItem, index) => {
                if (index <5 ) { 

              // Limit to 5 cards
                    
                    console.log(weatherItem);
                    const date = new Date(weatherItem.dt * 1000);
                    const formattedDate = date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    });
                    const aqiText = getAQI(lat, lon).then(aqiText =>{  
                    createForecastCards(cityName, data, aqiText)});
                }
            });
        })
        .catch(error => {
            console.error("Error fetching weather forecast:", error);
            alert("An error occurred while fetching the weather forecast: " + error.message);
        });
};

// Function to get air quality index
const getAQI = (lat, lon) => {
    const AQI_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    return fetch(AQI_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            const aqi = data.list[0].main.aqi; // Get AQI value
            const aqiDescription = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
            const aqiText = aqiDescription[aqi - 1] || "Unknown";
            return aqiText;
          
        })
        .catch(error => {
            console.error("Error fetching air quality data:", error);
            return "Unavailable";
        });
};

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, aqiText) => {
    const tempCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
    const weatherIcon = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;
    
        mainCard.innerHTML = `
            <div class="details">
                <h2>${cityName}</h2>
                <h4>${weatherItem.dt_txt ? weatherItem.dt_txt.split(" ")[0] : "Today"}</h4>
                <h4>Wind Speed: ${weatherItem.wind.speed} M/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                <h4>Air Quality: ${aqiText}</h4>
            </div>

            <div class="icon">
                <img src="${weatherIcon}" alt="weather-icon">
                 
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;

    }
    // Function to get dates for the forecast cards
    const createForecastCards = (cityName, data, aqiText) => {
    const usedDates = new Set();
    let cardIndex = 1;

    for (let item of data.list) {
        const dateTime = item.dt_txt; 
        const [date, time] = dateTime.split(" ");

        if (time === "12:00:00" && !usedDates.has(date) && cardIndex <= 5) {
            usedDates.add(date);
            createForecastCard(cityName, item, aqiText, date, cardIndex);
            cardIndex++;
        }

        if (cardIndex > 5) break;
    }
};

// Function to create forecast card HTML
const createForecastCard = (cityName, weatherItem,aqiText,date, index) => {
    const tempCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
    const weatherIcon = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;
    let card;
    if (index == 1){
        card=card1;
    }
    else if (index == 2){
        card=card2;
    }
    else if (index == 3){
        card=card3;
    }
    else if (index == 4){
        card=card4;
    }
    else if (index == 5){
        card=card5;
    }

            card.innerHTML = `

                    <h3>${cityName} (${date})</h3>
                    <img src="${weatherIcon}" alt="weather-icon">
                    <h4>Desc: ${weatherItem.weather[0].description}</h4>
                    <h4>Temperature: ${tempCelsius}°C</h4>
                    <h4>Wind Speed: ${weatherItem.wind.speed} M/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                    <h4>Air Quality: ${aqiText}</h4>`

        }

// Function to save city to session storage

function saveCityTosessionStorage(city) {
    let cities = JSON.parse(sessionStorage.getItem("recentCities")) || [];
    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase()); // avoid duplicates
    cities.unshift(city); // add latest search to top
    if (cities.length > 5) cities = cities.slice(0, 5); // max 5 cities
    sessionStorage.setItem("recentCities", JSON.stringify(cities));
    populateDropdown();
}

// Function to populate the dropdown with recent cities
function populateDropdown() {
    const cities = JSON.parse(sessionStorage.getItem("recentCities")) || [];
    recentCitiesDropdown.innerHTML = `<option disabled selected>Select a recent city</option>`;
    if (cities.length === 0) {
        recentCitiesDropdown.style.display = "none";
    } else {
        recentCitiesDropdown.style.display = "block";
        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            recentCitiesDropdown.appendChild(option);
        });
    }
}



populateDropdown(); 


// Event listeners for buttons    
searchButton.addEventListener("click", getLocationCordinates);
locationButton.addEventListener("click", getCurrentLocationCorodinates);
recentCitiesDropdown.addEventListener("change", (e) => {
    const selectedCity = e.target.value;
    cityInput.value = selectedCity;
    getLocationCordinates();
});

