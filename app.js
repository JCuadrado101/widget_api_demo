// const sql = require('mssql');
// const express = require('express');
// const app = express();

// const config = {
//   server: 'widgetdataserver.database.windows.net',
//   database: 'LargeDataTest',
//   user: 'widgetadmin@widgetdataserver',
//   password: 'SolidWorks1',
//   encrypt: true
// }

// const pool = new sql.ConnectionPool(config);


// app.get('/atms', (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");

//   pool.connect(err => {
//     if (err) {
//       console.error('Error connecting to Azure SQL database', err)
//     } else {
//       const request = new sql.Request(pool)
//       request.query('SELECT * FROM dbo.widget', (err, result) => {
//         if (err) {
//           console.error('Error executing query', err)
//         } else {
  
//           const output = {
//             meta: {
//               updated: new Date().toISOString()
//             },
//             data: result.recordset.map(record => ({
//               id: record.id,
//               type: record.type,
//               Access: record.Access,
//               DisplayOnWeb: record.DisplayOnWeb,
//               attributes: {
//                 creditUnion: record.attributescreditUnion,
//                 transactionTypes: record.attributestransactionTypes,
//                 name: record.attributesname,
//                 address1: record.attributesaddress1,
//                 City: record.attributesCity,
//                 State: record.attributesState,
//                 zipcode: record.attributeszipcode,
//                 locationDescription: record.attributeslocationDescription,
//                 latitude: record.attributeslatitude,
//                 longitude: record.attributeslongitude
//               }
//             }))
//           }

//           res.json(output);
//           // console.log(output)
//         }
//       })
//     }
//   })

// })

// app.get('/atms/coop', (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");

//   pool.connect(err => {
//     if (err) {
//       console.error('Error connecting to Azure SQL database', err)
//     } else {
//       const request = new sql.Request(pool)
//       request.query('SELECT * FROM dbo.widget WHERE attributescreditUnion is not NULL;', (err, result) => {
//         if (err) {
//           console.error('Error executing query', err)
//         } else {
  
//           const output = {
//             meta: {
//               updated: new Date().toISOString()
//             },
//             data: result.recordset.map(record => ({
//               id: record.id,
//               type: record.type,
//               Access: record.Access,
//               DisplayOnWeb: record.DisplayOnWeb,
//               attributes: {
//                 creditUnion: record.attributescreditUnion,
//                 transactionTypes: record.attributestransactionTypes,
//                 name: record.attributesname,
//                 address1: record.attributesaddress1,
//                 City: record.attributesCity,
//                 State: record.attributesState,
//                 zipcode: record.attributeszipcode,
//                 locationDescription: record.attributeslocationDescription,
//                 latitude: record.attributeslatitude,
//                 longitude: record.attributeslongitude
//               }
//             }))
//           }

//           res.json(output);
//           // console.log(output)
//         }
//       })
//     }
//   })

// })

// // Start the server
// app.listen(80, () => {
//   console.log('Server started on port 80');
// });

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
