var express = require("express"),
  bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");
var cors = require("cors");
const app = express();
const authToken = require("./middleware/authToken");

app.use(cors());
require("dotenv").config();
const PORT = process.env.PORT || 3000;
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const { router: auth, router1: logout } = require("./routes/auth");

app.use("/todos", require("./routes/todos"));
app.use("/api", auth);
app.use("/api", authToken, logout);
app.use("/api/users", authToken, require("./routes/users"));

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
        url: `http://localhost:${PORT}/`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
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
