import csv from "csvtojson";

export let data;

export async function loadCSV() {
  const csvFilePath = "./L9HomeworkChallengePlayersInput.csv";

  try {
    const jsonObj = await csv().fromFile(csvFilePath);
    data = jsonObj;
  } catch (error) {
    throw new Error("Error reading CSV file");
  }
}
