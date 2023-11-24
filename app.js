const express = require("express");
const path = require("path");

const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET Players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM 
    cricket_team
    ORDER BY 
    player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// ADD Player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO 
    cricket_team (player_name, jersey_number, role)
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//API 3 GET Player
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `
    SELECT * FROM cricket_team
    WHERE player_id = ${playerId};`;

  const dbPlayerResponse = await db.all(getPlayerQuery);
  response.send(dbPlayerResponse);
});

//API 4 UPDATE Player
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerUpdatedDetails = request.body;
  const { playerName, jerseyNumber, role } = playerUpdatedDetails;
  const updatePlayerDetailsQuery = `
    UPDATE cricket_team
    SET player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE player_id = ${playerId};`;

  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//API 5 DELETE Player
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
