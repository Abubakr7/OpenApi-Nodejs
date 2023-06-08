const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const router1 = express.Router();
require("dotenv").config();
const pool = require("../db/db");

const jwt = require("jsonwebtoken");

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterReq:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phonenumber
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: User name
 *         email:
 *           type: string
 *           description: User email
 *         phonenumber:
 *           type: string
 *           description: User phonenumber
 *         password:
 *           type: string
 *           description: User password
 *       example:
 *         name: john
 *         email: john@example.com
 *         phonenumber: "987654321"
 *         password: "12345"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginReq:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *       example:
 *         email: john@example.com
 *         password: "12345"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TokenRes:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Access Token
 *         refreshToken:
 *           type: string
 *           description: Refresh Token
 *       example:
 *        accessToken: "asdasdyasdn!alsjdlkasjaas"
 *        refreshToken: "asdasdyasdn!asdasdasdasd"
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    LogoutReq:
 *      type: object
 *      required:
 *       - token
 *      properties:
 *       token: string
 *       description: Refresh Token
 *      example:
 *       token: "asdasdyas"
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The auth managing API
 * /api/register:
 *   post:
 *     summary: Add a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterReq'
 *     responses:
 *       200:
 *         description: User added.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenRes'
 *       500:
 *         description: Some server error
 * /api/login:
 *   post:
 *     summary: Login to your account
 *     tags: [Auth]
 *     requestBody:
 *      required: true
 *      content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginReq'
 *     responses:
 *       200:
 *         description: User added.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenRes'
 *       500:
 *         description: Some server error
 * /api/refresh:
 *   post:
 *     summary: Refresh Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutReq'
 *     responses:
 *       200:
 *         description: User added.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenRes'
 *       500:
 *         description: Some server error
 * /api/logout:
 *   post:
 *     summary: Logout from account
 *     tags: [Auth]
 *     requestBody:
 *      required: true
 *      content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutReq'
 *     responses:
 *       200:
 *         description: The user was deleted
 */

let refreshTokens = [];

router.post(
  "/register",
  [
    check("email", "Invalid email").isEmail(),
    check("password", "Password must be at least 6 chars long").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const { name, email, phonenumber, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const data = await pool.query(`SELECT * FROM users WHERE email= $1;`, [
        email,
      ]); //Checking if user already exists

      const arr = data.rows;

      if (arr.length != 0) {
        return res.status(400).json({
          error: "Email already there, No need to register again.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      pool.query(
        `INSERT INTO users (name, email, phonenumber, password) VALUES ($1,$2,$3,$4);`,
        [name, email, phonenumber, hashedPassword],
        (err) => {
          if (err) {
            flag = 0; //If user is not inserted is not inserted to database assigning flag as 0/false.
            console.error(err);
            return res.status(500).json({
              error: "Database error",
            });
          }
        }
      );
      const datas = await pool.query(`SELECT * FROM users WHERE email= $1;`, [
        email,
      ]); //Verifying if the user exists in the database
      const users = datas.rows;

      const accessToken = jwt.sign(
        {
          id: users[0].id,
          email: email,
          name: name,
          phonenumber: phonenumber,
        },
        process.env.ACCESS,
        {
          expiresIn: "10m",
        }
      );
      const refreshToken = jwt.sign(
        {
          id: users[0].id,
          email: email,
          name: name,
          phonenumber: phonenumber,
        },
        process.env.REFRESH,
        {
          expiresIn: "60m",
        }
      );

      refreshTokens.push(refreshToken);

      res
        .status(200)
        .send({ accessToken: accessToken, refreshToken: refreshToken });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Database error while registring user!", //Database connection error
      });
    }
  }
);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await pool.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]); //Verifying if the user exists in the database
    const user = data.rows;
    if (user.length === 0) {
      return res.status(400).json({
        error: "User is not registered, Sign Up first",
      });
    }

    let isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(401).json({
        errors: [
          {
            msg: "Email or password is invalid",
          },
        ],
      });
    }
    const accessToken = jwt.sign(
      {
        id: user[0].id,
        email: email,
        name: user[0].name,
        phonenumber: user[0].phonenumber,
      },
      process.env.ACCESS,
      {
        expiresIn: "10m",
      }
    );
    const refreshToken = jwt.sign(
      {
        id: user[0].id,
        email: email,
        name: user[0].name,
        phonenumber: user[0].phonenumber,
      },
      process.env.REFRESH,
      {
        expiresIn: "60m",
      }
    );

    refreshTokens.push(refreshToken);

    res.status(200).send({ accessToken, refreshToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Database error occurred while signing in!", //Database connection error
    });
  }
});

router.post("/refresh", async (req, res) => {
  //take the refresh token from the user
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(401).json({
      errors: [
        {
          msg: "Token not found",
        },
      ],
    });
  }

  // If token does not exist, send error message
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(401).json({
      errors: [
        {
          msg: "Invalid refresh token",
        },
      ],
    });
  }

  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH);
    // user = { email: 'jame@gmail.com', iat: 1633586290, exp: 1633586350 }
    const { iat, exp, ...other } = user;
    const accessToken = jwt.sign(other, process.env.ACCESS, {
      expiresIn: "1m",
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
});

router1.post("/logout", (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("You logged out successfully.");
});

module.exports = {
  router,
  router1,
};
