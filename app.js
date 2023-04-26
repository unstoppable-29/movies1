const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");

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
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

//API-1 GET Method
app.get("/states/", async (request, response) => {
  const getStates = `
    SELECT
      *
    FROM
       state;`;
  const statesArray = await db.all(getStates);
  response.send(
    statesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API 2 GET METHOD FOR PARTICULAR MOVIE
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const stateQuery = `
    SELECT
      *
    FROM
       state
       where state_id=${stateId};`;
  const state = await db.get(stateQuery);
  response.send(state);
});

//API 3  create new resource
app.post("/districts/", async (request, response) => {
  const districtsDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtsDetails;
  const addDistrictQuery = `
    INSERT INTO
      district (district_name,state_id,cases,cured,active,deaths)
    VALUES
      (
        '${districtName}',
         ${stateId},
         ${cases},
         ${cured},
         ${active},
         ${deaths}
      );`;
  const dbResponse = await db.run(addDistrictQuery);
  response.send(`District Successfully Added`);
});
//API 4 get particular resource from district database
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const stateQuery = `
    SELECT
      *
    FROM
        district
       where district_id=${districtId};`;
  const state = await db.get(stateQuery);
  response.send(state);
});
