require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const path = require("path");
const cors = require("cors");

const morgan = require("morgan");

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true, limit: "100mb", parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));


const appRoute = require("./app/routes/route-auth");
const appEmployee = require("./app/routes/route-employee");
const appRole = require("./app/routes/route-role");
const appRecruitment = require("./app/routes/route-recruitment");
const appReference = require("./app/routes/route-reference");



app.use("/public/uploads", express.static(path.join(__dirname, "uploads/")));

app.use(
  cors({
    origin: ["https://odsyst.mscode.id", "http://localhost:3000"],
  })
);
app.use("/auth", appRoute);
app.use("/emp", appEmployee);
app.use("/role", appRole);
app.use("/recruitment", appRecruitment);
app.use("/reference", appReference);


app.get("/", (req, res) => {
  res.send("Selamat Datang Di ODSYSY");
});

app.listen(3034, () => {
  console.log("Server Berjalan di Port : 3034");
});
