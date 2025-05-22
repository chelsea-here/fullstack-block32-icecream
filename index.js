const express = require("express");
const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_icecream_flavors"
);
const app = express();
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res, next) => {
  res.send("<h1>I love icecream!</h1>");
});

// GET /api/flavors
// Returns an array of flavors

app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
      SELECT *
      FROM flavors
      ORDER BY id;
      `;
    const response = await client.query(SQL);
    console.log(response);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/flavors/:id
// Returns a single flavor
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
      SELECT *
      FROM flavors
      WHERE id = $1
      `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/flavors
// Returns the created flavor
app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
    INSERT INTO flavors (name, is_favorite)
    VALUES ($1, $2)
    RETURNING *
    `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/flavors/:id
// Returns nothing
app.delete("api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
      DELETE 
      FROM flavors
      WHERE id = $1;
    `;
    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// PUT /api/flavors/:id
// Returns the updated flavor
app.put("api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
    UPDATE flavors
    SET name = $1, is_favorite = $2, updated_at=now()
    WHERE id=$3 RETURNING * 
    `;
    await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  try {
    await client.connect();
    console.log("connected to db");
    const SQL = `
      DROP TABLE IF EXISTS flavors;
      CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
      INSERT INTO flavors(name, is_favorite) VALUES('rocky road', true);
      INSERT INTO flavors(name, is_favorite) VALUES('mint chocolate chip', false);
      INSERT INTO flavors(name, is_favorite) VALUES('chocolate chunk', false);
      INSERT INTO flavors(name, is_favorite) VALUES('chocolate chip', true);
      INSERT INTO flavors(name, is_favorite) VALUES('chocolate chip cookie dough', true);
      INSERT INTO flavors(name, is_favorite) VALUES('vanilla', false);
      INSERT INTO flavors(name, is_favorite) VALUES('strawberry', true);
      `;

    await client.query(SQL);
    console.log("tables created and seeded");
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  } catch (error) {
    next(error);
  }
};

init();
