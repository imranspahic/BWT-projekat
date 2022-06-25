const db = require("../database");
const Grupa = require("../models/grupa")(db);
const Student = require("../models/student")(db);


function provjeraStudentPromise(studentRequest) {
    return new Promise((resolve, reject) => {
        Student.findOne({ where: { index: studentRequest.index } }).then(function (student) {
            let statusPostoji = student == null ? "ne" : "da";
            resolve({ postoji: statusPostoji, student: studentRequest });
        }, function (error) {
            console.log(error);
            resolve(-1);
        });
    });
}

function kreiranjeStudentPromise(studentRequest) {
    return new Promise((resolve, reject) => {
        Grupa.findOrCreate({
            where: { naziv: studentRequest.grupa }
        }).then(function (grupa) {
            console.log(`grupa = ${grupa.id}`);
            Student.create({
                ime: studentRequest.ime,
                prezime: studentRequest.prezime,
                index: studentRequest.index,
                grupaId: grupa[0].id
            },
            ).then(function (student) {
                resolve({ status: 1, poruka: `Student sa indexom ${studentRequest.index} uspješno kreiran` });
            }, function (errorStudent) {
                console.log(errorStudent);
                resolve({ status: -1, poruka: `Student sa indexom ${studentRequest.index} nije uspješno kreiran` });
            })
        }, function (errorGrupa) {
            console.log(errorGrupa);
            resolve({ status: -1, poruka: `Grupa sa nazivom ${studentRequest.grupa} nije uspješno dobivena/kreirana` });
        });
    });
}

function kreirajViseStudenata(req, res) {
    let tijeloZahtjeva = "";
    req.on('data', data => tijeloZahtjeva += data);

    req.on('end', () => {
        let contentType = req.headers["content-type"];
        console.log(`Content-type: ${contentType}`);

        let studentiLinije = tijeloZahtjeva.trim().split('\n');
        let ispravanUnos = true;
        let studenti = [];
        for (let i = 0; i < studentiLinije.length; i++) {
            let studentData = studentiLinije[i].split(',');
            //provjera ispravnosti poslanih podataka
            if (studentData.length != 4 || studentData.some(data => data.length == 0)) {
                ispravanUnos = false;
                break;
            }
            studenti.push({ "ime": studentData[0].trim(), "prezime": studentData[1].trim(), "index": studentData[2].trim(), "grupa": studentData[3].trim() });
        }

        if (!ispravanUnos) {
            res.writeHead(400, "content-type: application/json");
            res.end(`{status:"Neispravan format unesenog CSV teksta"}`);
            return;
        }
        console.log(studenti);

        //Izbacivanje duplikata u listi studenata
        studenti = studenti.filter((value, index, self) =>
            index === self.findIndex((s) => (
                s.index === value.index
            ))
        )

        let nisuDodani = [];
        let provjeraStudentPromises = [];
        let error = false;

        studenti.forEach(student => {
            provjeraStudentPromises.push(provjeraStudentPromise(student));
        });

        Promise.all(provjeraStudentPromises).then((statusStudenata) => {
            console.log(`Promises.all(provjeraStudentPromises) complete: `);
            statusStudenata.forEach((status) => {
                if (status == -1)
                    error = true;
                else if (status.postoji == "da") nisuDodani.push(status.student.index);
            });

            if (error) {
                res.writeHead(500, "content-type: application/json");
                res.end(`{status:"Greška u serveru"}`)
                return;
            }

            console.log(`Promises.all(provjeraStudentPromises) no error`);

            let kreiranjeStudentPromises = [];

            statusStudenata.filter(status => status.postoji == "ne").forEach((statusZaDodat) => {
                kreiranjeStudentPromises.push(kreiranjeStudentPromise(statusZaDodat.student));
            });

            console.log(`Promises.all(provjeraStudentPromises) studenata za dodati: ${kreiranjeStudentPromises.length}`);
            console.log(`Promises.all(provjeraStudentPromises) studenata već postoji: ${nisuDodani.length}`);


            Promise.all(kreiranjeStudentPromises).then((statusKreiranja) => {
                console.log(`Promises.all(kreiranjeStudentPromises) complete: `);
                console.log(statusKreiranja);

                //slanje odgovora
                if (nisuDodani.length == 0) {
                    res.writeHead(200, "content-type: application/json");
                    res.end(`{status:"Dodano ${studenti.length} studenata!"}`);
                }
                else {
                    res.writeHead(200, "content-type: application/json");
                    let studentTekst = nisuDodani.length == 1 ? "student" : "studenti";
                    let postojiTekst = nisuDodani.length == 1 ? "postoji" : "postoje";
                    res.end(`{status:"Dodano ${studenti.length - nisuDodani.length} studenata, a ${studentTekst} ${nisuDodani.join(",")} već ${postojiTekst}!"}`);
                }
            });
        });
    });
}

module.exports = kreirajViseStudenata;