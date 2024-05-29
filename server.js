const express = require("express");
const initAPIRoute = require("./src/routes/api");
const app = express();
const port = 6969;
const route = require("./src/routes/api");
const bp = require("body-parser");
const morgan = require('morgan');


const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const database = require('./src/config/database');

//cors
const cors = require("cors");
const https = require(`https`);
const fs = require(`fs`);
const path = require("path");

app.use(morgan('combined'));

// const options = {
//   key: fs.readFileSync('cert', `key.pem`),
//   cert: fs.readFileSync('cert', `cert.pem`)
// };

app.use(express.static(path.join(__dirname,'public'))); 

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors()); //cross site orgin resource sharing
initAPIRoute(app);

// https.createServer(options, (req, res) => {
//   res.writeHead(200);
//   res.end(`hello world\n`);
// }).listen(5000);

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Watch Store BSK',
      version: '1.0.0',
      description: 'Documentation for the API endpoints',
    },
    servers: [
      {
        url: 'http://localhost:6969',
      },
    ],
  },
  apis: ['src/routes/api.js','src/routes/apiAccount.js','src/routes/apiWatch.js','src/routes/apiCart.js','src/routes/apiOrder.js'],
};
const swaggerSpec = swaggerJsDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log("Example app listening http://localhost:" + port);
});
