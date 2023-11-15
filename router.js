import express from "express";
import { data } from "./database.js";

const router = express.Router();

router.get("/stats/player/:playerFullName", function (req, res) {
  try {
    const playerFullName = req.params.playerFullName;
    const playerStats = processData(data, playerFullName);
    const summary = calculateAdvancedStats(playerStats);
    return res.status(200).json(summary);
  } catch (e) {
    return res.status(404).send("Player not found");
  }
});

export function processData(playersData, playerName) {
  const playerStats = {
    gamesPlayed: 0,
    FTM: 0,
    FTA: 0,
    "2PM": 0,
    "2PA": 0,
    "3PM": 0,
    "3PA": 0,
    REB: 0,
    BLK: 0,
    AST: 0,
    STL: 0,
    TOV: 0,
  };

  for (let player of playersData) {
    if (player.PLAYER === playerName) {
      playerStats.gamesPlayed++;
      playerStats.FTM += parseInt(player.FTM, 10);
      playerStats.FTA += parseInt(player.FTA, 10);
      playerStats["2PM"] += parseInt(player["2PM"], 10);
      playerStats["2PA"] += parseInt(player["2PA"], 10);
      playerStats["3PM"] += parseInt(player["3PM"], 10);
      playerStats["3PA"] += parseInt(player["3PA"], 10);
      playerStats.REB += parseInt(player.REB, 10);
      playerStats.BLK += parseInt(player.BLK, 10);
      playerStats.AST += parseInt(player.AST, 10);
      playerStats.STL += parseInt(player.STL, 10);
      playerStats.TOV += parseInt(player.TOV, 10);
    }
  }

  if (playerStats.gamesPlayed === 0) {
    throw new Error("Player not found");
  }

  playerStats.PLAYER = playerName;

  return playerStats;
}

export function calculateAdvancedStats(stats) {
  const {
    PLAYER: playerName,
    gamesPlayed,
    FTM,
    FTA,
    "2PM": TPM,
    "2PA": TPA,
    "3PM": ThPM,
    "3PA": ThPA,
    REB,
    BLK,
    AST,
    STL,
    TOV,
  } = stats;
  const freeThrows = {
    attempts: roundToOneDecimal(FTA / gamesPlayed),
    made: roundToOneDecimal(FTM / gamesPlayed),
    shootingPercentage: roundToOneDecimal((FTM / FTA) * 100),
  };

  const twoPoints = {
    attempts: roundToOneDecimal(TPA / gamesPlayed),
    made: roundToOneDecimal(TPM / gamesPlayed),
    shootingPercentage: roundToOneDecimal((TPM / TPA) * 100),
  };

  const threePoints = {
    attempts: roundToOneDecimal(ThPA / gamesPlayed),
    made: roundToOneDecimal(ThPM / gamesPlayed),
    shootingPercentage: roundToOneDecimal((ThPM / ThPA) * 100),
  };

  const points = roundToOneDecimal(FTM + 2 * TPM + 3 * ThPM);

  const valorization = roundToOneDecimal(
    freeThrows.made +
      2 * twoPoints.made +
      3 * threePoints.made +
      roundToOneDecimal(REB / gamesPlayed) +
      roundToOneDecimal(BLK / gamesPlayed) +
      roundToOneDecimal(AST / gamesPlayed) +
      roundToOneDecimal(STL / gamesPlayed) -
      (freeThrows.attempts -
        freeThrows.made +
        twoPoints.attempts -
        twoPoints.made +
        threePoints.attempts -
        threePoints.made +
        roundToOneDecimal(TOV / gamesPlayed))
  );

  const effectiveFieldGoalPercentage = roundToOneDecimal(
    ((TPM + ThPM + 0.5 * ThPM) / (TPA + ThPA)) * 100
  );
  const trueShootingPercentage = roundToOneDecimal(
    (points / (2 * (TPA + ThPA + 0.475 * FTA))) * 100
  );
  const hollingerAssistRatio = roundToOneDecimal(
    (AST / (TPA + ThPA + 0.475 * FTA + AST + TOV)) * 100
  );

  return {
    playerName,
    gamesPlayed,
    traditional: {
      freeThrows,
      twoPoints,
      threePoints,
      points: roundToOneDecimal(points / gamesPlayed),
      rebounds: roundToOneDecimal(REB / gamesPlayed),
      blocks: roundToOneDecimal(BLK / gamesPlayed),
      assists: roundToOneDecimal(AST / gamesPlayed),
      steals: roundToOneDecimal(STL / gamesPlayed),
      turnovers: roundToOneDecimal(TOV / gamesPlayed),
    },
    advanced: {
      valorization,
      effectiveFieldGoalPercentage,
      trueShootingPercentage,
      hollingerAssistRatio,
    },
  };
}

const roundToOneDecimal = (number) =>
  parseFloat((Math.round(number * 10) / 10).toFixed(1));

export default router;
