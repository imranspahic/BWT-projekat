const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

const Sequelize = require('sequelize');
const db = require("./database");

//modeli
const Student = require("./models/student")(db);
const Grupa = require("./models/grupa")(db);
const Vjezba = require("./models/vjezba")(db);
const VjezbaGreska = require("./models/vjezbaGreska")(db);
const VjezbaTest = require("./models/vjezbaTest")(db);

//relacije
Grupa.hasMany(Student, {
    as: "Studenti",
    foreignKey: "grupaId"
});
Student.belongsTo(Grupa, {
    as: "grupa",
    through: Grupa,
    foreignKey: "grupaId"
});

Vjezba.hasMany(VjezbaGreska, {
    as: "greske",
    foreignKey: "vjezbaId",
})

VjezbaGreska.belongsTo(Vjezba, {
    as: "vjezba",
    through: Vjezba,
    foreignKey: "vjezbaId",
});

Vjezba.hasMany(VjezbaTest, {
    as: "testovi",
    foreignKey: "vjezbaId",
})

VjezbaTest.belongsTo(Vjezba, {
    as: "vjezba",
    through: Vjezba,
    foreignKey: "vjezbaId"
});

Vjezba.belongsTo(Student, {
    as: "vjezba",
    through: Vjezba,
    foreignKey: "indexStudenta",
});


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static("public"));

//rute
const kreirajStudenta = require("./routes/kreirajStudenta");
const promijeniGrupu = require("./routes/promijeniGrupu");
const kreirajViseStudenata = require("./routes/kreirajViseStudenata");
const kreirajVjezbe = require("./routes/kreirajVjezbe");
const azurirajVjezbu = require("./routes/azurirajVjezbu");

app.get("/", (req, res) => {
    res.end("Default response");
});

app.post("/student", (req, res) => {
    kreirajStudenta(req, res);
});

app.put("/student/:index", (req, res) => {
    promijeniGrupu(req, res);
});

app.post("/batch/student", (req, res) => {
    kreirajViseStudenata(req, res);
});

app.post("/vjezbe", (req, res) => {
    kreirajVjezbe(req, res);
});

app.post("/student/:index/vjezba/:vjezba", (req, res) => {
    azurirajVjezbu(req, res);
});

const server = app.listen(3000, function () {
    console.log("Listening on port 3000...");
    db.sync({ alter: true });
});

module.exports = server;