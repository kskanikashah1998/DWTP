const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const axios = require('axios');
const app = express();
app.use(express.json());



// Route to retrieve available products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ message: 'Error retrieving products' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});




/* Populating the database with pre-defined products
const productsData = [
  {
    name: 'Product 1',
    company: 'Hanwha Q-Cells',
    powerPeak: 300,
    orientation: 'N',
    inclination: 30,
    area: 10,
    longitude: 51.5,
    latitude: -0.09,
  },
  {
    name: 'Product 2',
    company: 'First Solar',
    powerPeak: 250, 
    orientation: 'S',
    inclination: 20,
    area: 12,
    longitude: 51.51,
    latitude: -0.1,
  },
  // Add more products as needed
];

Product.insertMany(productsData)
  .then(() => {
    console.log('Products inserted successfully');
  })
  .catch((error) => {
    console.error('Error inserting products:', error);
  });
*/
app.post('/products/:productId/electricity-generation', async (req, res) => {
    try {
      const { productId } = req.params;
      const { longitude, latitude } = req.body;
  
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }


      /* Everythin about MAP*/
      // Initialize the map
      const map = L.map('mapContainer').setView([51.5, -0.09], 13);

      // Add the tile layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18,
      });
      tileLayer.addTo(map);

      
      // Attach the click event listener to the map
      map.on('click', onMapClick);
      
      function locationFactors(latitude, longitude) {
        // Calculate the location factors based on the latitude and longitude
        // You can perform your calculations and retrieve the relevant factors here
        // For example, you can make API calls to get weather data or perform other calculations
        
        // Example calculation:
        const orientation = calculateOrientation(latitude, longitude);
        const inclination = calculateInclination(latitude, longitude);
        const area = calculateArea(latitude, longitude);
      
        // Use the calculated factors as needed for further processing or display
        console.log('Orientation:', orientation);
        console.log('Inclination:', inclination);
        console.log('Area:', area);
      
        // You can update the UI or perform any other actions based on the location factors
      }
      
      function calculateInclination(latitude, longitude) {
        // Perform the necessary calculations to determine the inclination
        // Example formula: inclination = latitude * 0.5
       
        const inclination = latitude * 0.5; // Adjust the formula according to your requirements
      
        return inclination;
      }
      
      function calculateOrientation(latitude, longitude) {
        // Perform the necessary calculations to determine the orientation
        // Example formula: orientation = (longitude >= 0) ? 'E' : 'W'
      
        const orientation = (longitude >= 0) ? 'E' : 'W'; // Adjust the formula according to your requirements
      
        return orientation;
      }
      
      
      function calculateArea(latitude, longitude) {
        // Perform the calculation for the area factor based on the latitude and longitude
        // Return the calculated area value
      }
      
      function onMapClick(e) {
        const { latitude, longitude } = e.latlng;
        // Call the locationFactors function with the latitude and longitude
        locationFactors(latitude, longitude);
      }   
      
      /*async function locationFactors(latitude, longitude) {
        // Implement the logic to fetch location-specific factors
        // You can use an external service or API to obtain the factors based on latitude and longitude
      
        // Example implementation using an API
        const apiKey = 'afe7d4236e66ce7c963cc9364da76305';
        const apiUrl = `https://api.example.com/location-factors?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`;
      
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          return data;
        } catch (error) {
          throw new Error('Failed to fetch location factors');
        }
      }*/

    


// Usage example 


      /* Retrieve location-specific factors from a database or external API based on the provided longitude and latitude
      const locationFactors = await LocationFactors.findOne({ longitude, latitude });
  
      if (!locationFactors) {
        return res.status(404).json({ message: 'Location factors not found' });
      }*/
  
    

      function calculateElectricityGeneration(powerPeak, orientation, inclination, area, weatherData) {
        let totalElectricity = 0;
      
        for (const hour of weatherData.hourly) {
          const solarIrradiance = hour.solarIrradiance; // Replace with the actual solar irradiance data field
          const temperature = hour.temperature; // Replace with the actual temperature data field
      
          // Calculate electricity generation for the current hour
          const electricityGenerated = calculateElectricityForHour(powerPeak, orientation, inclination, area, solarIrradiance, temperature);
      
          // Accumulate the electricity generation for the day
          totalElectricity += electricityGenerated;
        }
      
        // Return the total electricity generated for the last 30 days
        return totalElectricity;
      }
      
        // Perform calculation using the factors and product information
        const electricityGeneration = calculateElectricityGeneration(
          product.powerOutput,
          locationFactors.solarIrradiance,
          product.orientation,
          product.inclination,
          product.area
        );
  
      return res.status(200).json({ electricityGeneration });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });


  async function getCoordinates(location) {
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`;
  
    try {
      const response = await axios.get(apiUrl);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      throw new Error('Failed to fetch coordinates');
    }
  }

 getCoordinates('New York City')
  .then(async coordinates => {
    console.log('Latitude:', coordinates.latitude);
    console.log('Longitude:', coordinates.longitude);
    await getWeatherData(coordinates.latitude, coordinates.longitude);
   
  })
  .catch(error => {
    console.error('Error:', error.message);
  });


  async function getWeatherData(latitude, longitude) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=afe7d4236e66ce7c963cc9364da76305`
      );
  
      const weatherData = response.data;
      console.log(weatherData)
  
      // Extract and process the weather data for each day
      /*const processedData = weatherData.hourly.map((hour) => {
        return {
          timestamp: hour.dt,
          temperature: hour.temp,
          // Add more relevant weather data fields as needed
        };
      });*/
  
      //return processedData;
    } catch (error) {
      console.log(error)
      throw new Error('Error retrieving weather data');
    }
  }