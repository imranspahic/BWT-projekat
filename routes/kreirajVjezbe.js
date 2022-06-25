const db = require("../database");
const Student = require("../models/student")(db);
const Vjezba = require("../models/vjezba")(db);
const VjezbaGreska = require("../models/vjezbaGreska")(db);
const VjezbaTest = require("../models/vjezbaTest")(db);

function kreiranjeVjezbiPromise(vjezbeData) {
    return new Promise((resolve, reject) => {
        Vjezba.bulkCreate(vjezbeData).then(function (result) {
            console.log(`Vjezba.bulkCreate() result = ${result}`);
            resolve(1);
        });
    });
}

function kreirajVjezbe(req, res) {
    let brojVjezbi = req.body.brojVjezbi;

    let contentType = req.headers["content-type"];
    console.log(`Content-type: ${contentType}`);
    console.log(`brojVjezbi: ${brojVjezbi}`);

    if (isNaN(brojVjezbi) || brojVjezbi <= 0) {
        res.writeHead(400, "content-type: application/json");
        res.end(`{status:"Neispravan parametar brojVjezbi"}`);
        return;
    }
    Promise.all([VjezbaGreska.destroy({ where: {}, truncate: { cascade: true } }), VjezbaTest.destroy({ where: {}, truncate: { cascade: true } }), Vjezba.destroy({ where: {}, truncate: { cascade: true } })]).then((value) => {
        console.log("Resetovana tabele za vježbe");
        Student.findAll().then(function (studenti) {
            console.log(studenti);
            let kreiranjeVjezbiPromises = [];
            studenti.forEach(studentResponse => {
                let vjezbeData = [];
                for (let i = 0; i < brojVjezbi; i++)
                    vjezbeData.push({
                        brojVjezbe: i + 1,
                        indexStudenta: studentResponse.index,
                        tacnost: "0%",
                        promjena: "0%"
                    });
                kreiranjeVjezbiPromises.push(kreiranjeVjezbiPromise(vjezbeData));
            });

            Promise.all(kreiranjeVjezbiPromises).then((value) => {
                console.log("Promise.all(kreiranjeVjezbiPromises) završeno");
                console.log(value);
                res.writeHead(200, "content-type: application/json");
                res.end(`{status:"Vježbe kreirane!"}`);
            });

        }, function (errorStudenti) {
            console.log(errorStudenti);
            res.writeHead(500, "content-type: application/json");
            res.end(`{status:"Pogreška prilikom učitavanja studenata"}`);
        });
    });
}

module.exports = kreirajVjezbe;