const sql = require('mssql');
const express = require('express');
const app = express();
const port = process.env.PORT || 80;
const Joi = require('joi');


const config = {
  server: 'widgetdataserver.database.windows.net',
  database: 'LargeDataTest',
  user: 'widgetadmin@widgetdataserver',
  password: 'SolidWorks1',
  encrypt: true
}

////////////////////////////////////////

function calculateCoordinatesWithinRadius(centerLat, centerLng, radius) {
  // convert radius from miles to meters
  const radiusMeters = radius * 1609.34;

  // earth's radius in meters
  const earthRadius = 6371000;

  // convert center point to radians
  const centerLatRad = toRadians(centerLat);
  const centerLngRad = toRadians(centerLng);

  // calculate latitudes and longitudes for all points within radius
  const coordinates = [];
  for (let bearing = 0; bearing < 360; bearing++) {
    // convert bearing to radians
    const bearingRad = toRadians(bearing);

    // calculate latitudes and longitudes for point along bearing
    const latRad = Math.asin(Math.sin(centerLatRad) * Math.cos(radiusMeters / earthRadius) + 
                             Math.cos(centerLatRad) * Math.sin(radiusMeters / earthRadius) * 
                             Math.cos(bearingRad));
    const lngRad = centerLngRad + Math.atan2(Math.sin(bearingRad) * Math.sin(radiusMeters / earthRadius) * 
                                             Math.cos(centerLatRad), Math.cos(radiusMeters / earthRadius) - 
                                             Math.sin(centerLatRad) * Math.sin(latRad));

    // convert latitudes and longitudes back to degrees
    const lat = toDegrees(latRad);
    const lng = toDegrees(lngRad);

    // add point to array of coordinates
    coordinates.push([lat, lng]);
  }

  return coordinates;
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

  function findMinMaxLatAndLng(coordinates) {
    let minLat = coordinates[0][0];
    let maxLat = coordinates[0][0];
    let minLng = coordinates[0][1];
    let maxLng = coordinates[0][1];

    for (let i = 1; i < coordinates.length; i++) {
      const lat = coordinates[i][0];
      const lng = coordinates[i][1];

      if (lat < minLat) {
        minLat = lat;
      }
      if (lat > maxLat) {
        maxLat = lat;
      }
      if (lng < minLng) {
        minLng = lng;
      }
      if (lng > maxLng) {
        maxLng = lng;
      }
    }

    return { minLat, maxLat, minLng, maxLng };
  }

///////////////////////////////////////////

const pool = new sql.ConnectionPool(config);


app.get('/atms', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  pool.connect(err => {
    if (err) {
      console.error('Error connecting to Azure SQL database', err)
    } else {
      const request = new sql.Request(pool)
      request.query('SELECT * FROM dbo.widget', (err, result) => {
        if (err) {
          console.error('Error executing query', err)
        } else {
  
          const output = {
            meta: {
              updated: new Date().toISOString()
            },
            data: result.recordset.map(record => ({
              id: record.id,
              type: record.type,
              Access: record.Access,
              DisplayOnWeb: record.DisplayOnWeb,
              attributes: {
                creditUnion: record.attributescreditUnion,
                transactionTypes: record.attributestransactionTypes,
                name: record.attributesname,
                address1: record.attributesaddress1,
                City: record.attributesCity,
                State: record.attributesState,
                zipcode: record.attributeszipcode,
                locationDescription: record.attributeslocationDescription,
                latitude: record.attributeslatitude,
                longitude: record.attributeslongitude
              }
            }))
          }

          res.json(output);
          // console.log(output)
        }
      })
    }
  })

})

app.get('/atms/coop', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  pool.connect(err => {
    if (err) {
      console.error('Error connecting to Azure SQL database', err)
    } else {
      const request = new sql.Request(pool)
      request.query('SELECT * FROM dbo.widget WHERE attributescreditUnion is not NULL;', (err, result) => {
        if (err) {
          console.error('Error executing query', err)
        } else {
  
          const output = {
            meta: {
              updated: new Date().toISOString()
            },
            data: result.recordset.map(record => ({
              id: record.id,
              type: record.type,
              Access: record.Access,
              DisplayOnWeb: record.DisplayOnWeb,
              attributes: {
                creditUnion: record.attributescreditUnion,
                transactionTypes: record.attributestransactionTypes,
                name: record.attributesname,
                address1: record.attributesaddress1,
                City: record.attributesCity,
                State: record.attributesState,
                zipcode: record.attributeszipcode,
                locationDescription: record.attributeslocationDescription,
                latitude: record.attributeslatitude,
                longitude: record.attributeslongitude
              }
            }))
          }
          res.json(output);
          // console.log(output)
        }
      })
    }
  })
})


function calculateDistance(lat1, lng1, lat2, lng2) {
  const earthRadiusMi = 3959; // Earth's radius in miles
  const latDiff = degToRad(lat2 - lat1);
  const lngDiff = degToRad(lng2 - lng1);
  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
    Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMi = earthRadiusMi * c;
  return distanceMi.toFixed(2);
  // return parseFloat(distanceMi.toFixed(2)) + ' mi';
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}


app.get('/atms/search', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Extract latitude, longitude, and radius from query parameters
  const { lat, lng, radius } = req.query;

  // Validate query parameters using Joi
  const schema = Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    radius: Joi.number().required()
  });

  const { error } = schema.validate({ lat, lng, radius });

  if (error) {
    // Return error response if query parameters are invalid
    return res.status(400).json({ error: error.message });
  }

  pool.connect(err => {
    if (err) {
      console.error('Error connecting to Azure SQL database', err);
    } else {
      const request = new sql.Request(pool);
      request.query('SELECT * FROM dbo.widget', (err, result) => {
        if (err) {
          console.error('Error executing query', err);
        } else {
          const centerLat = parseFloat(lat);
          const centerLng = parseFloat(lng);
          const radiusMiles = parseFloat(radius);

          // Call the calculateCoordinatesWithinRadius function to get array of coordinates within radius
          const coordinates = calculateCoordinatesWithinRadius(centerLat, centerLng, radiusMiles);

          // Call the findMinMaxLatAndLng function to get min and max latitudes and longitudes
          const { minLat, maxLat, minLng, maxLng } = findMinMaxLatAndLng(coordinates);

          // Filter the results based on min and max latitudes and longitudes
          const filteredResults = result.recordset.filter(record => {
            const lat = record.attributeslatitude;
            const lng = record.attributeslongitude;
            return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
          });

          // Calculate distance from center for each filtered result
          const output = {
            meta: {
              updated: new Date().toISOString()
            },
            data: filteredResults.map(record => {
              const lat = record.attributeslatitude;
              const lng = record.attributeslongitude;
              const distance = calculateDistance(centerLat, centerLng, lat, lng);
              return {
                id: record.id,
                type: record.type,
                Access: record.Access,
                DisplayOnWeb: record.DisplayOnWeb,
                attributes: {
                  creditUnion: record.attributescreditUnion,
                  transactionTypes: record.attributestransactionTypes,
                  name: record.attributesname,
                  address1: record.attributesaddress1,
                  City: record.attributesCity,
                  State: record.attributesState,
                  zipcode: record.attributeszipcode,
                  locationDescription: record.attributeslocationDescription,
                  latitude: lat,
                  longitude: lng,
                  distance: distance // Add distance to the response
                }
              };
            })
          };
          res.json(output);
        }
      });
    }
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


