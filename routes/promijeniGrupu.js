const db = require("../database");
const Grupa = require("../models/grupa")(db);
const Student = require("../models/student")(db);

function promijeniGrupu(req, res) {
    let grupa = req.body.grupa;
    let index = req.params.index;

    console.log(`index: ${index}`);
    console.log(`grupa ${grupa}`);

    let contentType = req.headers["content-type"];
    console.log(`Content-type: ${contentType}`);

    Student.findOne({ where: { index: index } }).then(function (student) {
        if (student == null) {
            res.writeHead(400, "content-type: application/json");
            res.end(`{status:"Student sa indexom ${index} ne postoji"}`);
            return;
        }
        Grupa.findOrCreate({
            where: { naziv: grupa }
        }).then(function (grupaBaza) {
            student.grupaId = grupaBaza[0].id;
            student.save().then(function (saveSuccess) {
                res.writeHead(200, "content-type: application/json");
                res.end(`{status:"Promjenjena grupa studentu ${index}"}`);
            }, function (saveError) {
                console.log(saveError);
                res.writeHead(500, "content-type: application/json");
                res.end(`{status:"Pogreška prilikom ažuriranja grupe studenta ${index}"}`);
            });

        }, function (errorGrupa) {
            console.log(errorGrupa);
            res.writeHead(500, "content-type: application/json");
            res.end(`{status:"Pogreška prilikom pronalaska ili kreiranja grupe ${grupa}"}`);
        });
    }, function (errorStudent) {
        console.log(errorStudent);
        res.writeHead(500, "content-type: application/json");
        res.end(`{status:"Pogreška prilikom pronalaska ili kreiranja studenta ${index}"}`);
    });
}

module.exports = promijeniGrupu;