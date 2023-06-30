const fs = require('fs');
const axios = require("axios");
const cron = require('node-cron');
const {createTransport} = require("nodemailer");

const product =
    {
        name: 'Product 1',
        company: 'Hanwha Q-Cells',
        powerPeak: 300,
        orientation: 'N',
        inclination: 30,
        area: 10,
    }
    // Add more product entries if needed

async function getCoordinates(location) {
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        } else {
            console.log("location not found")
        }
    } catch (error) {
        throw new Error('Failed to fetch coordinates');
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


async function createReport(city) {
    getCoordinates(city)
        .then(async coordinates => {
            const startTime = new Date()
            const endTime = new Date(startTime.getTime() - 30 * 24 * 60 * 60 * 1000)
            const irradianceData = await fetchSolarIrradiance(coordinates.latitude, coordinates.longitude, formatDate(endTime), formatDate(startTime));
            const powerGeneration = calculatePowerGeneration(product, irradianceData);
            generateCSVReport(product, powerGeneration, endTime);

        })
        .catch(error => {
            console.error('Error:', error.message);
        });
}



async function generateReport(longitude, latitude, product){
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() - 30 * 24 * 60 * 60 * 1000)
    const irradianceData = await fetchSolarIrradiance(latitude, longitude, formatDate(endTime), formatDate(startTime));
    const powerGeneration = calculatePowerGeneration(product, irradianceData);
    generateCSVReport(product, powerGeneration, endTime);
}



async function fetchSolarIrradiance(latitude, longitude, startTime, endTime) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=direct_radiation&start_date=${startTime}&end_date=${endTime}`;
    console.log(url)
    const response = await axios.get(url);
    return response.data;
}

function calculatePowerGeneration(product, irradianceData) {
    const hourlyRadiance = irradianceData.hourly.direct_radiation;
    console.log("Generating report...")
    console.log(product)

    return hourlyRadiance.map((radiance) => {
        return (radiance / 1000) * product.powerPeak * product.area;
    });
}

function generateCSVReport(product, powerGeneration, startTime) {
    let csvContent = 'Start Time,End Time,Hour,Power Generation KV\n';

    for (let i = 0; i < powerGeneration.length; i++) {
        const hour = i;
        const power = powerGeneration[i];
        const currentTime = new Date(startTime.getTime() + hour * 3600000);
        const nextTime = new Date(startTime.getTime() + (hour + 1) * 3600000);
        const startTimeString = currentTime.toISOString();
        const endTimeString = nextTime.toISOString();
        csvContent += `${startTimeString},${endTimeString},${hour},${power}\n`;
    }

    const filename = `${product.name}_Power_Generation_Report.csv`;
    fs.writeFileSync(filename, csvContent);
    console.log(`CSV report generated: ${filename}`);
    sendEmail(filename, product.email)
}

const cronSchedule = '0 0 1 */30 * *';

// Define the function to execute as the cron job
const cronJob = async () => {
    await createReport("New York")
};
// Schedule the cron job
cron.schedule(cronSchedule, cronJob);
console.log('Cron job scheduled to generate the report every 30 days.');

async function sendEmail(filename, userEmail) {
    try {
        const transport = createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true, //ssl
            auth: {
                user:"solarreportgenerator@zohomail.eu", 
                
                pass:"projectpassword123"
            }
        });

        const mailOptions = {
            from: 'solarreportgenerator@zohomail.eu',
            to: userEmail,
            subject: 'Power Generation Report',
            text: 'Please find the attached power generation report.',
            attachments: [
                {
                    filename: filename,
                    path: filename,
                },
            ],
        };

        const info = await transport.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = generateReport;