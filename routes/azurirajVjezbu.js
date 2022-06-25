const TestoviParser = require("../testoviParser");
const db = require("../database");
const Student = require("../models/student")(db);
const Vjezba = require("../models/vjezba")(db);
const VjezbaGreska = require("../models/vjezbaGreska")(db);
const VjezbaTest = require("../models/vjezbaTest")(db);

function azurirajVjezbu(req, res) {
    let index = req.params.index;
    let brojVjezbe = req.params.vjezba;
    let testReport = req.body;

    console.log(`index = ${index}, brojVjezbe = ${brojVjezbe}`);
    console.log(`testReport = ${JSON.stringify(testReport)}`);

    Student.findOne({ where: { index: index } }).then(function (student) {
        if (student == null) {
            console.log("Ne postoji student");
            res.writeHead(400, "content-type: application/json");
            res.end(`{status:"Nije moguće ažurirati vježbe!"}`);
            return;
        }

        Vjezba.findAll({ where: { indexStudenta: index } }).then(function (vjezbe) {
            console.log("Vjezba.findAll()");
            console.log(vjezbe);
            var pronadjenaVjezba = vjezbe.find(vjezba => vjezba.brojVjezbe == brojVjezbe);
            if (pronadjenaVjezba == null) {
                console.log("Ne postoji student");
                res.writeHead(400, "content-type: application/json");
                res.end(`{status:"Nije moguće ažurirati vježbe!"}`);
                return;
            }

            VjezbaTest.findAll({ where: { vjezbaId: pronadjenaVjezba.id } }).then(function (vjezbaTestovi) {
                console.log("VjezbaTest.findAll()");
                console.log(vjezbaTestovi);
                VjezbaGreska.findAll({ where: { vjezbaId: pronadjenaVjezba.id } }).then(function (vjezbaGreske) {
                    console.log("VjezbaGreska.findAll()");
                    console.log(vjezbaGreske);

                    let novaTacnost = pronadjenaVjezba.tacnost;
                    let novaPromjena = pronadjenaVjezba.promjena;
                    let noveGreske = [];
                    let noviTestovi = [];
                    let testoviParser = new TestoviParser();
                    if (vjezbaTestovi.length == 0) {
                        let rezultat = testoviParser.dajTacnost(JSON.stringify(testReport));
                        novaTacnost = rezultat["tacnost"];
                        noveGreske = rezultat["greske"];
                        noviTestovi = testReport["tests"].map(test => test["fullTitle"]);
                    }
                    else {
                        let testReport1 = {};
                        let tacnih = Math.round(vjezbaTestovi.length * novaTacnost.substr(0, novaTacnost.length - 1) / 100);
                        testReport1["stats"] = { "tests": vjezbaTestovi.length, "passes": tacnih, "failures": vjezbaTestovi.length - tacnih };
                        testReport1["tests"] = Array.from(vjezbaTestovi).map(function (test) {
                            return { "fullTitle": test.naziv };
                        });
                        testReport1["failures"] = Array.from(vjezbaGreske).map(function (greska) {
                            return { "fullTitle": greska.naziv };
                        })

                        let rezultat = testoviParser.porediRezultate(JSON.stringify(testReport1), JSON.stringify(testReport));
                        novaPromjena = rezultat["promjena"];
                        noveGreske = rezultat["greske"];
                        noviTestovi = testReport["tests"].map(test => test["fullTitle"]);
                    }

                    pronadjenaVjezba.tacnost = novaTacnost;
                    pronadjenaVjezba.promjena = novaPromjena;

                    pronadjenaVjezba.save().then(function (saveSuccess) {
                        console.log("Ažurirana vježba save()");
                        VjezbaTest.destroy({ where: { vjezbaId: pronadjenaVjezba.id } }).then(function (destroySuccess) {
                            console.log("VjezbaTest destroy() success");
                            let nizTestovaObjekti = [];
                            noviTestovi.forEach(test => nizTestovaObjekti.push({ naziv: test, vjezbaId: pronadjenaVjezba.id }));
                            VjezbaTest.bulkCreate(nizTestovaObjekti).then(function (value) {
                                console.log("VjezbaTest bulkCreate() success");
                                VjezbaGreska.destroy({ where: { vjezbaId: pronadjenaVjezba.id } }).then(function (destroySuccess) {
                                    console.log("VjezbaGreska destroy() success");
                                    let nizGreskiObjekti = [];
                                    noveGreske.forEach(greska => nizGreskiObjekti.push({ naziv: greska, vjezbaId: pronadjenaVjezba.id }));
                                    VjezbaGreska.bulkCreate(nizGreskiObjekti).then(function (value) {
                                        res.writeHead(200, "content-type: application/json");
                                        res.end(`{vjezba:${brojVjezbe},tacnost:"${pronadjenaVjezba.tacnost}",promjena:"${pronadjenaVjezba.promjena}",greske:[${nizGreskiObjekti.map(greska => greska.naziv).join(",")}]}`);
                                        console.log("VjezbaGreska bulkCreate() success");
                                    });
                                }, function (destroyFail) {
                                    console.log(destroyFail);
                                    res.writeHead(500, "content-type: application/json");
                                    res.end(`{status:"Pogreška prilikom ažuriranja brisanja greški za vježbi ${pronadjenaVjezba.id}"}`);
                                });
                            });
                        }, function (destroyFail) {
                            console.log(destroyFail);
                            res.writeHead(500, "content-type: application/json");
                            res.end(`{status:"Pogreška prilikom ažuriranja brisanja testova za vježbi ${pronadjenaVjezba.id}"}`);
                        });
                    }, function (saveError) {
                        console.log(saveError);
                        res.writeHead(500, "content-type: application/json");
                        res.end(`{status:"Pogreška prilikom ažuriranja grupe vježbe ${pronadjenaVjezba.id}"}`);
                    });

                }, function (errorVjezbaGreske) {
                    console.log(errorVjezbaGreske);
                    res.writeHead(500, "content-type: application/json");
                    res.end(`{status:"Pogreška prilikom pronalaska greški za vjezbu ${pronadjenaVjezba.id}"}`);
                });

            }, function (errorVjezbaTestovi) {
                console.log(errorVjezbaTestovi);
                res.writeHead(500, "content-type: application/json");
                res.end(`{status:"Pogreška prilikom pronalaska testova za vjezbu ${pronadjenaVjezba.id}"}`);
            });

        }, function (errorVjezbe) {
            console.log(errorVjezbe);
            res.writeHead(500, "content-type: application/json");
            res.end(`{status:"Pogreška prilikom pronalaska vježbi"}`);
        });

    }, function (errorStudent) {
        console.log(errorStudent);
        res.writeHead(500, "content-type: application/json");
        res.end(`{status:"Pogreška prilikom pronalaska studenta ${index}"}`);
    });
}

module.exports = azurirajVjezbu;