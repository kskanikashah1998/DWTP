const express = require("express")
const path = require("path")
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const axios = require('axios');
// const hbs = require("hbs")
const LogInData = require("./models/user")
const SignupData = require ("./models/register")
const Location = require ("./models/locationschema")
const connect = require('./mongo.js');
const generateReport = require("./power.js")
const cookieParser = require('cookie-parser');
const { Console } = require("console");
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const tempelatePath = path.join(__dirname, '../tempelates')
const publicPath = path.join(__dirname, '../public')
console.log(publicPath);

app.set('view engine', 'hbs')
app.set('views', tempelatePath)

app.use(express.static(publicPath))

// hbs.registerPartials(partialPath)

app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/createProject', (req, res) => {
  res.render('createProject')
})

app.get('/viewProjects', (req, res) => {
  res.render('viewProjects')
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the route for user signup
  app.post('/signup', async (req, res) => {
  const {name, email, phone,  password } = req.body;
  
  try {
    // Check if the user already exists
    const existingUser = await SignupData.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log(hashedPassword)
    // Create a new user
    const newUser = new SignupData({
      email,
      name,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();
     // Generate JWT token
     const token = jwt.sign({ email: savedUser.email }, 'your_secret_key');
     res.cookie('token', token, { httpOnly: true });
     // Return the token
     res.render('home')
  } catch (error) {
    console.error('Error registering user', error);
    res.status(500).json({ error: 'Error occurred' });
  }
  });
// Endpoint for user login
  app.post('/login', async (req, res) => {
  try {
    // Find the user by email
    const user = await SignupData.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'Email not found' });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    console.log(passwordMatch)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, 'your_secret_key');
    res.cookie('token', token)
    // Return the token
    res.render('home')
  } catch (error) {
    console.log('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  });

// Middleware to authenticate the JWT token
  const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, 'your_secret_key');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
  // Protected endpoint that requires authentication
  app.get('/protected', authenticateUser, (req, res) => {
  res.status(200).json({ message: 'Protected endpoint accessed successfully' });
  });

// Define the route for savinglocation
  app.post('/save', async (req, res) => {
  const { area, orientation, inclination, product, latitude, longitude, projectName, powerpeak } = req.body;
  console.log (area, orientation, inclination, product, latitude, longitude, projectName, powerpeak)
  // Create a new Location document
  
  const newlocation = new Location({
    area,
    orientation,
    inclination,
    product,
    latitude,
    longitude,
    projectName,
    powerpeak
  });

  const product1 = {name: projectName, powerPeak:20, area: area, email: "kskanikashah@gmail.com"}
  generateReport(latitude, longitude, product1)

  // Save the location to MongoDB
  try {
    // Save the location to MongoDB
    const savedLocation = await newlocation.save();
    console.log('Location saved to MongoDB:', savedLocation);
    res.status(201).json(savedLocation); 
   } catch (error) {
    console.error('Error saving location to MongoDB:', error);
    res.sendStatus(500);
  }
  });
  // fetchlocation
  app.get('/location', async (req, res) => {
    try {
      const locations = await Location.find({}, 'latitude longitude');
      console.log("GETTING DATA")
      console.log (locations)
      res.json(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });
  
// Define a route to retrieve project names

app.get('/projects', async (req, res) => {
  try {
    const projects = await Location.find({}, 'projectName');
    res.json(projects);
  } catch (error) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

//Delete Project
app.delete('/projects', async (req, res) => {
  try {
    const projectName = req.body.projectName;

    await Location.deleteMany({ projectName });
    res.send('Projects deleted');
  } catch (error) {
    console.error('Error deleting projects:', error);
    res.status(500).send('Error deleting projects');
  }
});



// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
  connect()
});