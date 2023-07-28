const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
dbPath = path.join(__dirname, "moviesData.db");

let database = null;

const intDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost/3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDBObjectToResponseObjectDirector = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};
intDBAndServer();

// get movies API
app.get("/movies/", async (request, response) => {
  const getAllMovies = `SELECT  movie_name FROM movie;`;
  const moviesArray = await database.all(getAllMovies);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// post movies API

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const queryToCreate = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES ('${directorId}', '${movieName}', '${leadActor}')`;
  await database.run(queryToCreate);
  response.send("Movie Successfully Added");
});

//GET API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      * 
    FROM 
      movie
    WHERE
      movie_id = ${movieId};`;
  const movieResponse = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieResponse));
});
//PUT  API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE
      movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// DELETE API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
     DELETE FROM movie WHERE movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});
// GET API 6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`;
  const directorArray = await database.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachItem) =>
      convertDBObjectToResponseObjectDirector(eachItem)
    )
  );
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovie = `
    SELECT movie_name FROM
         movie 
        WHERE director_id = ${directorId};`;
  const directorResponse = await database.all(getDirectorMovie);
  response.send(
    directorResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
