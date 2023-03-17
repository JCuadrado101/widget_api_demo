const express = require('express');
const app = express();

// Serve static files
app.use(express.static('public'));

// Handle GET requests to the root URL
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start the server
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
