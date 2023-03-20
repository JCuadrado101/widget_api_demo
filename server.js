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

const schema = Joi.object({
  lat: Joi.number().required(),
  long: Joi.number().required(),
  radius: Joi.number().required()
});

app.get('/atms/search', (req, res) => {
  const { error, value } = schema.validate(req.query);

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const { lat, long, radius } = value;

  let latlngCalc = calculateCoordinatesWithinRadius(lat, long, radius);
  let findmaxmin = findMinMaxLatAndLng(latlngCalc);

  pool.connect(err => {
    if (err) {
      console.error('Error connecting to Azure SQL database', err)
    } else {
      const request = new sql.Request(pool)
      request.query(`
        SELECT * FROM dbo.widget WHERE 
          attributeslatitude > ${findmaxmin.minLat} AND attributeslatitude < ${findmaxmin.maxLat} AND 
          attributeslongitude > ${findmaxmin.minLng} AND attributeslongitude < ${findmaxmin.maxLng};`, 
          (err, result) => {
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

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


