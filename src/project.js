const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Get the form values
  const area = document.getElementById('area').value;
  const orientation = document.getElementById('orientation').value;
  const inclination = document.getElementById('inclination').value;
  const product = document.getElementById('product').value;
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;
  const projectName = document.getElementById('projectName').value;
  const powerpeak = document.getElementById('powerpeak').value;

  // Create the request body
  const requestBody = {
    area,
    orientation,
    inclination,
    product,
    latitude,
    longitude,
    projectName,
    powerpeak
  };

  // Send the POST request to the server
  fetch('/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
    .then((response) => {
      if (response.ok) {
        console.log('Location saved successfully');
        // Reset the form or perform any desired actions
      } else {
        console.error('Failed to save location');
      }
    })
    .catch((error) => {
      console.error('Error saving location:', error);
    });
});
