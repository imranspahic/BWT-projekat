const db = require("../database");
const Grupa = require("../models/grupa")(db);
const Student = require("../models/student")(db);

function kreirajStudenta(req, res) {
    let ime = req.body.ime;
    let prezime = req.body.prezime;
    let index = req.body.index;
    let grupa = req.body.grupa;

    let contentType = req.headers["content-type"];
    console.log(`Content-type: ${contentType}`);
    console.log(`ime: ${ime}, prezime: ${prezime}, index: ${index}, grupa ${grupa}`);

    Student.findOne({ where: { index: index } }).then(function (student) {
        if (student == null) {
            Grupa.findOrCreate({
                where: { naziv: grupa }
            }).then(function (grupaBaza) {
                console.log(`grupa = ${grupaBaza[0].id}`);
                Student.create({
                    ime: ime,
                    prezime: prezime,
                    index: index,
                    grupaId: grupaBaza[0].id
                },
                ).then(function (student) {
                    console.log(`kreiran student = ${student}`);
                    res.writeHead(200, "content-type: application/json");
                    res.end(`{status:"Kreiran student!"}`);
                    return;
                }, function (errorStudent) {
                    console.log(errorStudent);
                    res.writeHead(500, "content-type: application/json");
                    res.end(`{status:"Pogreška prilikom kreiranja studenta ${index}"}`);
                })
            }, function (errorGrupa) {
                console.log(errorGrupa);
                res.writeHead(500, "content-type: application/json");
                res.end(`{status:"Pogreška prilikom pronalaska ili kreiranja grupe ${grupa}"}`);
            });
            return;
        }
        res.writeHead(400, "content-type: application/json");
        res.end(`{status:"Student sa indexom ${index} već postoji!"}`);
    }, function (errorStudent) {
        console.log(errorStudent);
        res.writeHead(500, "content-type: application/json");
        res.end(`{status:"Pogreška prilikom pronalaska ili kreiranja studenta ${index}"}`);
    });
}

module.exports = kreirajStudenta;