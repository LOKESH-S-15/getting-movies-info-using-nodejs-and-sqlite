const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const movies = express();
movies.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let database;

initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    movies.listen(3000, () => {
      console.log("server is running");
      console.log(database);
    });
  } catch (error) {
    console.log(error.message);
  }
};
initializeDbAndServer();

let convertDbObjectToDatabaseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

let convertDbObjectToDatabaseObjectDirector = (dbDirector) => {
  return {
    directorId: dbDirector.director_id,
    directorName: dbDirector.director_name,
  };
};
movies.get("/movies/", async (request, response) => {
  let getMovies = `
    SELECT *
    FROM 
    movie;`;

  let moviesArray = await database.all(getMovies);

  response.send(moviesArray.map((each) => ({ movieName: each.movie_name })));
});

movies.post("/movies/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;
  let addMovie = `
    INSERT INTO movie(
          director_id,movie_name,lead_actor
    )VALUES(${directorId},'${movieName}','${leadActor}');`;

  let moviesArray = await database.run(addMovie);

  response.send("Movie Successfully Added");
});

movies.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let getMovie = `
    SELECT *
    FROM 
    movie
    WHERE 
       movie_id = ${movieId} ;`;

  const movies = await database.get(getMovie);

  response.send(convertDbObjectToDatabaseObject(movies));
});

movies.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;

  let { directorId, movieName, leadActor } = request.body;

  let updateMovie = `
  UPDATE movie
  SET
   director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'

  WHERE 
  movie_id=${movieId};`;
  console.log(updateMovie);
  let updatedMovie = await database.run(updateMovie);

  response.send("Movie Details Updated");
});
movies.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;

  let deleteMovie = `
  DELETE FROM movie
  WHERE movie_id=${movieId}

   ;`;
  console.log(deleteMovie);

  let deletedMovie = await database.run(deleteMovie);

  response.send("Movie Removed");
});

movies.get("/directors/", async (request, response) => {
  let getDirectors = `
    SELECT *
    FROM 
    director
    ORDER BY 
    director_id;`;

  let directorArray = await database.all(getDirectors);

  response.send(
    directorArray.map((each) => convertDbObjectToDatabaseObjectDirector(each))
  );
});
movies.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  let getDirectorsMovies = `
    SELECT movie_name as movieName
    FROM 
    movie
    WHERE director_id=${directorId}
    ORDER BY 
    director_id;`;

  let movies = await database.all(getDirectorsMovies);
  response.send(movies);
});
module.exports = movies;
