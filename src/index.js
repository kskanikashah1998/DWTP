const express = require("express")
const path = require("path")
const app = express()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
// const hbs = require("hbs")
const LogInCollection = require("./mongo")
const port = process.env.PORT || 3001

app.use(express.json())

app.use(express.urlencoded({ extended: false }))

const tempelatePath = path.join(__dirname, '../tempelates')
const publicPath = path.join(__dirname, '../public')
console.log(publicPath);

app.set('view engine', 'hbs')
app.set('views', tempelatePath)

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
  

  
  
app.use(express.static(publicPath))





// hbs.registerPartials(partialPath)


app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/', (req, res) => {
    res.render('login')
})



/* app.get('/home', (req, res) => {
//     res.render('home')
// })

app.post('/signup', async (req, res) => {
    
    // const data = new LogInCollection({
    //     name: req.body.name,
    //     password: req.body.password
    // })
    // await data.save()

    const data = {
        name: req.body.name,
        password: req.body.password
    }

    const checking = await LogInCollection.findOne({ name: req.body.name })

   try{
    if (checking.name === req.body.name && checking.password===req.body.password) {
        res.send("user details already exists")
    }
    else{
        await LogInCollection.insertMany([data])
    }
   }
   catch{
    res.send("wrong inputs")
   }

    res.status(201).render("home", {
        naming: req.body.name
    })
})


app.post('/login', async (req, res) => {

    try {
        const check = await LogInCollection.findOne({ name: req.body.name })

        if (check.password === req.body.password) {
            res.status(201).render("home", { naming: `${req.body.password}+${req.body.name}` })
        }

        else {
            res.send("incorrect password")
        }


    } 
    
    catch (e) {

        res.send("wrong details")
        

    }


})*/



// This is a temporary storage for demonstration purposes
const users = [];

// Endpoint for user registration
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user in the temporary storage
    const user = { username, password: hashedPassword };
    users.push(user);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint for user login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user with the provided username
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected endpoint that requires authentication
app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Protected endpoint accessed successfully' });
  });
  
  // Middleware to authenticate the JWT token
  function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }
  
    jwt.verify(token, 'secret_key', (error, user) => {
      if (error) {
        return res.status(403).json({ message: 'Invalid token' });
      }
  
      req.user = user;
      next();
    });
  }

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// OpenWeatherMap API configuration
//const apiKey = 'afe7d4236e66ce7c963cc9364da76305';

