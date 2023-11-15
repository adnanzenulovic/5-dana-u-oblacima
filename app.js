import express from "express";
import { loadCSV } from "./database.js";
import router from "./router.js";

const app = express();

const PORT = 3000;
app.use("/", router);

loadCSV()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error :", error);
  });
