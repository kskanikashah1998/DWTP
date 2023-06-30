async function getCoordinates(city) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=afe7d4236e66ce7c963cc9364da76305`
      );
  
      if (response.data.length === 0) {
        throw new Error('City not found');
      }
  
      const { lat, lon } = response.data[0];
      return { latitude: lat, longitude: lon };
    } catch (error) {
      throw new Error('Error retrieving coordinates');
    }
  }
  async function getWeatherData(latitude, longitude) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt={timestamp}&appid=YOUR_API_KEY`
      );
  
      const weatherData = response.data;
  
      // Extract and process the weather data for each day
      const processedData = weatherData.hourly.map((hour) => {
        return {
          timestamp: hour.dt,
          temperature: hour.temp,
          // Add more relevant weather data fields as needed
        };
      });  
  
      return processedData;
    } catch (error) {
      throw new Error('Error retrieving weather data');
    }
  }

  
  const city = 'YourCityName';

  getCoordinates(city)
    .then((coordinates) => {
      return getWeatherData(coordinates.latitude, coordinates.longitude);
    })
    .then((weatherData) => {
      console.log('Weather data for the last 30 days:', weatherData);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
  