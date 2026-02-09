const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "./problems.json";

// отримати всі проблеми
app.get("/problems", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  res.json(data);
});

// додати проблему
app.post("/problems", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  const newProblem = {
    id: Date.now(),
    status: "Нове",
    ...req.body
  };
  data.push(newProblem);
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  res.json({ message: "проблему додано" });
});

app.listen(3000, () => {
  console.log("запущено: http://localhost:3000");
});
