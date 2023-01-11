var express = require("express"),
  bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");
var cors = require("cors");
const app = express();

app.use(cors());
require("dotenv").config();
const PORT = process.env.PORT || 3000;
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use("/todos", require("./routes/todos"));
console.log(PORT);
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API with Swagger",
      version: "0.1.0",
    },
    servers: [
      {
        url: `http://2.56.213.92:${PORT}/`,
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

app.listen(PORT);

console.debug("Server listening on port: " + PORT);
