import { processData, calculateAdvancedStats } from "./router.js";
import { loadCSV, data } from "./database.js";
import request from "supertest";
import express from "express";
import router from "./router";

const app = express();
app.use(express.json());
app.use("/", router);

describe("processData", () => {
  it("should calculate stats correctly for a given player", () => {
    const playersData = [
      {
        PLAYER: "Test Testic",
        FTM: "2",
        FTA: "3",
        "2PM": "1",
        "2PA": "2",
        "3PM": "0",
        "3PA": "1",
        REB: "5",
        BLK: "1",
        AST: "2",
        STL: "0",
        TOV: "1",
      },
      {
        PLAYER: "Test Testic",
        FTM: "1",
        FTA: "2",
        "2PM": "0",
        "2PA": "1",
        "3PM": "1",
        "3PA": "2",
        REB: "4",
        BLK: "0",
        AST: "1",
        STL: "1",
        TOV: "0",
      },
      {
        PLAYER: "Jane Doe",
        FTM: "2",
        FTA: "3",
        "2PM": "1",
        "2PA": "2",
        "3PM": "0",
        "3PA": "1",
        REB: "5",
        BLK: "1",
        AST: "2",
        STL: "0",
        TOV: "1",
      },
    ];
    const playerName = "Test Testic";

    const result = processData(playersData, playerName);

    expect(result).toEqual({
      gamesPlayed: 2,
      FTM: 3,
      FTA: 5,
      "2PM": 1,
      "2PA": 3,
      "3PM": 1,
      "3PA": 3,
      REB: 9,
      BLK: 1,
      AST: 3,
      STL: 1,
      TOV: 1,
      PLAYER: "Test Testic",
    });
  });

  it("should throw an error if player is not found", () => {
    const playersData = [
      {
        PLAYER: "Jane Doe",
        FTM: "2",
        FTA: "3",
        "2PM": "1",
        "2PA": "2",
        "3PM": "0",
        "3PA": "1",
        REB: "5",
        BLK: "1",
        AST: "2",
        STL: "0",
        TOV: "1",
      },
    ];
    const playerName = "Test Testic";

    expect(() => processData(playersData, playerName)).toThrow(
      "Player not found"
    );
  });
});

describe("calculateAdvancedStats", () => {
  it("should correctly calculate player stats", () => {
    const stats = {
      gamesPlayed: 3,
      FTM: 10,
      FTA: 14,
      "2PM": 9,
      "2PA": 14,
      "3PM": 3,
      "3PA": 19,
      REB: 17,
      BLK: 5,
      AST: 2,
      STL: 3,
      TOV: 4,
      PLAYER: "Sifiso Abdalla",
    };

    const result = calculateAdvancedStats(stats);

    expect(result).toEqual({
      playerName: "Sifiso Abdalla",
      gamesPlayed: 3,
      traditional: {
        freeThrows: { attempts: 4.7, made: 3.3, shootingPercentage: 71.4 },
        twoPoints: { attempts: 4.7, made: 3, shootingPercentage: 64.3 },
        threePoints: { attempts: 6.3, made: 1, shootingPercentage: 15.8 },
        points: 12.3,
        rebounds: 5.7,
        blocks: 1.7,
        assists: 0.7,
        steals: 1,
        turnovers: 1.3,
      },
      advanced: {
        valorization: 11.7,
        effectiveFieldGoalPercentage: 40.9,
        trueShootingPercentage: 46.7,
        hollingerAssistRatio: 4.4,
      },
    });
  });
});

const mockCSVData = [{ name: "Test Testic", age: 30 }];

jest.mock("csvtojson", () => ({
  __esModule: true,
  default: () => ({
    fromFile: jest.fn().mockResolvedValue(mockCSVData),
  }),
}));

describe("loadCSV", () => {
  it('should successfully read the CSV file and store the data in the "data" variable', async () => {
    await loadCSV();
    expect(data).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
  });
});

describe("Player Stats API", () => {
  beforeAll(() => {
    data.push({
      PLAYER: "Test Player",
      FTM: 10,
      FTA: 15,
      "2PM": 5,
      "2PA": 10,
      "3PM": 3,
      "3PA": 8,
      REB: 6,
      BLK: 1,
      AST: 4,
      STL: 2,
      TOV: 3,
    });
  });

  test("GET /stats/player/:playerFullName - success", async () => {
    const response = await request(app).get("/stats/player/Test Player");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("playerName", "Test Player");
    expect(response.body.traditional).toBeDefined();
    expect(response.body.advanced).toBeDefined();
  });

  test("GET /stats/player/:playerFullName - player not found", async () => {
    const response = await request(app).get("/stats/player/Nonexistent Player");

    expect(response.status).toBe(404);
    expect(response.text).toBe("Player not found");
  });
});
