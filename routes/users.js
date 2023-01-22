const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const pool = require("../db/db");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *         - phonenumber
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         phonenumber:
 *           type: boolean
 *           description: The phonenumber of the user
 *       example:
 *         id: 1
 *         name: john
 *         email: john@example.com
 *         phonenumber: "987654321"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserReq:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phonenumber
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         phonenumber:
 *           type: boolean
 *           description: The phonenumber of the user
 *       example:
 *         name: john
 *         email: john@example.com
 *         phonenumber: "987654321"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PassAdd:
 *       type: object
 *       required:
 *         - id
 *         - password
 *         - confirmPassword
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the user
 *         password:
 *           type: string
 *           description: The set password  user
 *         confirmPassword:
 *           type: string
 *           description: The confirm password from user
 *       example:
 *         id: 1
 *         password: "12345"
 *         confirmPassword: "12345"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PassEdit:
 *       type: object
 *       required:
 *         - oldPassword
 *         - password
 *         - confirmPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           description: The old password of user
 *         password:
 *           type: string
 *           description: The set password to user
 *         confirmPassword:
 *           type: string
 *           description: The confirm password from user
 *       example:
 *         oldPassword: "123"
 *         password: "12345"
 *         confirmPassword: "12345"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 * /api/users:
 *   get:
 *     summary: Lists all the users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: add a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserReq'
 *     responses:
 *       200:
 *         description: The added user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 * /api/users/{id}:
 *   get:
 *     summary: Get the user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user response by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 *   put:
 *    summary: Update the user by the id
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserReq'
 *    responses:
 *      200:
 *        description: The user was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      404:
 *        description: The user was not found
 *      500:
 *        description: Some error happened
 *   delete:
 *     summary: Remove the user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *
 *     responses:
 *       200:
 *         description: The user was deleted
 *       404:
 *         description: The user was not found
 * /api/users/password:
 *   post:
 *     summary: add a password to user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PassAdd'
 *     responses:
 *       200:
 *         description: The added user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PassAdd'
 *       500:
 *         description: Some server error
 * /api/users/password/{id}:
 *   put:
 *    summary: Update password  user
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/PassEdit'
 *    responses:
 *      200:
 *        description: The user was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/PassEdit'
 *      404:
 *        description: The user was not found
 *      500:
 *        description: Some error happened
 */

router.get("/", function (req, res) {
  pool.query(
    "SELECT id, name, email, phonenumber FROM users ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
});

router.get("/:id", function (req, res) {
  const id = parseInt(req.params.id);

  pool.query(
    "SELECT id, name, email, phonenumber FROM users WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows[0]);
    }
  );
});

router.post("/", function (req, res) {
  const { name, email, phonenumber } = req.body;

  pool.query(
    "INSERT INTO users (name, email, phonenumber) VALUES ($1, $2, $3) RETURNING *",
    [name, email, phonenumber],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).json({ message: `User added`, user: results.rows[0] });
    }
  );
});

router.put("/:id", function (req, res) {
  const id = parseInt(req.params.id);

  const { name, phonenumber } = req.body;
  pool.query(
    "UPDATE users SET name = $1, phonenumber = $2  WHERE id = $3",
    [name, phonenumber, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json({ message: "User updated" });
    }
  );
});

router.delete("/:id", function (req, res) {
  const id = parseInt(req.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json({ message: "User deleted" });
  });
});

router.post("/password", function (req, res) {
  const { id, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    res.status(400).json({ message: "Invalid password" });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err)
      res.status(err).json({
        error: "Server error",
      });

    var flag = 1; //Declaring a flag

    pool.query(
      "UPDATE users SET password = $1  WHERE id = $2",
      [hash, id],
      (err) => {
        if (err) {
          flag = 0; //If user is not inserted is not inserted to database assigning flag as 0/false.
          console.error(err);
          return res.status(500).json({
            error: "Database error",
          });
        } else {
          flag = 1;

          res.status(200).json({ message: "Setting password to user" });
        }
      }
    );
  });
});

router.put("/password/:id", async function (req, res) {
  const { oldPassword, password, confirmPassword } = req.body;
  const id = parseInt(req.params.id);

  if (password !== confirmPassword) {
    res.status(400).json({ message: "Invalid password" });
  }

  try {
    const user = await pool.query(`SELECT password FROM users WHERE id= $1;`, [
      id,
    ]);
    bcrypt.compare(oldPassword, user.rows[0].password, (err, result) => {
      if (err) {
        res.status(500).json({
          error: "Server error",
        });
      } else if (result != true) {
        res.status(400).json({
          error: "Enter correct old password password!",
        });
      } else if (result) {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            res.status(err).json({
              error: "Server error",
            });
          } else {
            var flag = 1; //Declaring a flag

            pool.query(
              "UPDATE users SET password = $1  WHERE id = $2",
              [hash, id],
              (err) => {
                if (err) {
                  flag = 0; //If user is not inserted is not inserted to database assigning flag as 0/false.
                  console.error(err);
                  return res.status(500).json({
                    error: "Database error",
                  });
                } else {
                  flag = 1;

                  res.status(200).json({ message: "Update password of user" });
                }
              }
            );
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Database error while registring user!", //Database connection error
    });
  }
});

module.exports = router;
