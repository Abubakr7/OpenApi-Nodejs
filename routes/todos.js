const express = require("express");
const router = express.Router();

const pool = require("../db/db");

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *         - message
 *         - complete
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the todo
 *         title:
 *           type: string
 *           description: The title of your todo
 *         message:
 *           type: string
 *           description: The todo description of the todo
 *         complete:
 *           type: boolean
 *           description: Whether you have finished todo
 *       example:
 *         id: 1
 *         title: React
 *         message: JavaScript Library for developing user interface.
 *         complete: false
 */

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: The todos managing API
 * /todos:
 *   get:
 *     summary: Lists all the todos
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: The list of the todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: The created todo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Some server error
 * /todos/{id}:
 *   get:
 *     summary: Get the todo by id
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The todo id
 *     responses:
 *       200:
 *         description: The todo response by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: The todo was not found
 *   put:
 *    summary: Update the todo by the id
 *    tags: [Todos]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The todo id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Todo'
 *    responses:
 *      200:
 *        description: The todo was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Todo'
 *      404:
 *        description: The todo was not found
 *      500:
 *        description: Some error happened
 *   delete:
 *     summary: Remove the todo by id
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The todo id
 *
 *     responses:
 *       200:
 *         description: The todo was deleted
 *       404:
 *         description: The todo was not found
 */

router.get("/", function (req, res) {
  pool.query("SELECT * FROM todos ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

router.get("/:id", function (req, res) {
  const id = parseInt(req.params.id);

  pool.query("SELECT * FROM todos WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

router.post("/", function (req, res) {
  const { title, message, complete } = req.body;

  pool.query(
    "INSERT INTO todos (title, message, complete) VALUES ($1, $2, $3) RETURNING *",
    [title, message, complete],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).json({ message: `Todo added`, todo: results.rows[0] });
    }
  );
});

router.put("/:id", function (req, res) {
  const id = parseInt(req.params.id);
  const { title, message, complete } = req.body;
  pool.query(
    "UPDATE todos SET title = $1, message = $2, complete = $3  WHERE id = $4",
    [title, message, complete, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json({ message: "Todo updated" });
    }
  );
});

router.delete("/:id", function (req, res) {
  const id = parseInt(req.params.id);

  pool.query("DELETE FROM todos WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json({ message: "Todo deleted" });
  });
});

module.exports = router;
