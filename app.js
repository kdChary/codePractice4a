const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dataBasePath = path.join(__dirname, "cricketTeam.db");
let dataBase = null;

const initializeDbAndServer = async () => {
  try {
    dataBase = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server running at "http://localhost:3000/"`);
    });
  } catch (error) {
    console.log(`Data Base Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const changeDbOjectCase = (dataObject) => {
  return {
    playerId: dataObject.player_id,
    playerName: dataObject.player_name,
    jerseyNumber: dataObject.jersey_number,
    role: dataObject.role,
  };
};

//API 1 to get all players.
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT
            *
        FROM
            cricket_team;
        `;
  const allPlayers = await dataBase.all(getPlayersQuery);
  response.send(allPlayers.map((each) => changeDbOjectCase(each)));
});

//API 3 to get particular player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT
            *
        FROM
            cricket_team
        WHERE
            player_id=${playerId};`;
  const player = await dataBase.get(getPlayerQuery);
  response.send(changeDbOjectCase(player));
});

//API 2 to insert a new player
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
    INSERT INTO
        cricket_team(player_name,jersey_number,role)
    VALUES
        (
            '${playerName}',
            ${jerseyNumber},
            '${role}'
        );`;
  await dataBase.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//API 4 to update details of a player
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
        UPDATE
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number=${jerseyNumber},
            role= '${role}'
        WHERE
            player_id=${playerId};`;
  await dataBase.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 5 to delete a player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM
            cricket_team
        WHERE
            player_id = ${playerId};`;
  await dataBase.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
