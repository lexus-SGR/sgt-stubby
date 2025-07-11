const axios = require('axios');

const getWeather = async (city) => {
  const apiKey = '1536f6a7be04b8ad50d09f6228f6ff4e';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    console.log(`Hali ya hewa ya sasa ${data.name}, ${data.sys.country}:`);
    console.log(`  - Hali: ${data.weather[0].description}`);
    console.log(`  - Joto: ${data.main.temp}°C`);
    console.log(`  - Unyevu: ${data.main.humidity}%`);
    console.log(`  - Upepo: ${data.wind.speed} m/s`);
  } catch (error) {
    console.error('Hitilafu:', error.response?.data?.message || error.message);
  }
};

// Badilisha hapa kwa jiji unalotaka
getWeather('Dar es Salaam');
