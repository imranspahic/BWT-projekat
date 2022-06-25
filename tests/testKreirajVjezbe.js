let chai = require('chai');
let chaiHttp = require('chai-http');
var assert = chai.assert;
chai.use(chaiHttp);
let server = require("../server");
let db = require("../database");
let Student = require("../models/student")(db);
let Grupa = require("../models/grupa")(db);
let Vjezba = require("../models/vjezba")(db);

describe('testiranje POST na /vjezbe', function () {

    ///Dodavanje početnih podataka
    before(function (done) {
        db.sync({ force: true }).then(val => {
            Grupa.bulkCreate([
                { naziv: "RS1" },
                { naziv: "RS2" }
            ]).then(value => {
                Student.bulkCreate([
                    { ime: "student1", prezime: "prezime1", index: "1109", grupaId: 1 },
                    { ime: "student2", prezime: "prezime2", index: "1110", grupaId: 2 },
                    { ime: "student3", prezime: "prezime3", index: "1111", grupaId: 1 }
                ]).then(value => {
                    done();
                });
            });
        });
    });

    it('Kreiranje po 3 vježbe za svakog studenta, tabela vježbe treba imati 9 redova', function (done) {
        const brojVjezbi = { brojVjezbi: 3 };
        chai.request(server)
            .post('/vjezbe')
            .set('content-type', 'application/json')
            .send(brojVjezbi)
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{status:"Vježbe kreirane!"}`);

                Vjezba.count().then(brojVjezbi => {
                    assert.equal(brojVjezbi, 9);
                    done();
                }).catch(error => done(error));
            });
    });

    it('Kreiranje po 10 vježbi za svakog studenta, treba se izbrisati prethodni sadržaj i tabela vježbe će imati 30 redova', function (done) {
        const brojVjezbi = { brojVjezbi: 10 };
        chai.request(server)
            .post('/vjezbe')
            .set('content-type', 'application/json')
            .send(brojVjezbi)
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{status:"Vježbe kreirane!"}`);

                Vjezba.count().then(brojVjezbi => {
                    assert.equal(brojVjezbi, 30);
                    done();
                }).catch(error => done(error));
            });
    });


    it('Neispravan parametar brojVjezbi = 0, ne treba brisati starije vjezbe u bazi', function (done) {
        const brojVjezbi = { brojVjezbi: 0 };
        chai.request(server)
            .post('/vjezbe')
            .set('content-type', 'application/json')
            .send(brojVjezbi)
            .end((err, res) => {
                assert.isNotNull(res.error);
                assert.equal(res.status, 400);
                assert.equal(res.text, `{status:"Neispravan parametar brojVjezbi"}`);

                Vjezba.count().then(brojVjezbi => {
                    assert.equal(brojVjezbi, 30);
                    done();
                }).catch(error => done(error));
            });
    });

    it('Neispravan parametar brojVjezbi = -5, ne treba brisati starije vjezbe u bazi', function (done) {
        const brojVjezbi = { brojVjezbi: -5 };
        chai.request(server)
            .post('/vjezbe')
            .set('content-type', 'application/json')
            .send(brojVjezbi)
            .end((err, res) => {
                assert.isNotNull(res.error);
                assert.equal(res.status, 400);
                assert.equal(res.text, `{status:"Neispravan parametar brojVjezbi"}`);

                Vjezba.count().then(brojVjezbi => {
                    assert.equal(brojVjezbi, 30);
                    done();
                }).catch(error => done(error));
            });
    });


    it('Neispravan parametar brojVjezbi = "sfaf", ne treba brisati starije vjezbe u bazi', function (done) {
        const brojVjezbi = { brojVjezbi: "sfaf" };
        chai.request(server)
            .post('/vjezbe')
            .set('content-type', 'application/json')
            .send(brojVjezbi)
            .end((err, res) => {
                assert.isNotNull(res.error);
                assert.equal(res.status, 400);
                assert.equal(res.text, `{status:"Neispravan parametar brojVjezbi"}`);

                Vjezba.count().then(brojVjezbi => {
                    assert.equal(brojVjezbi, 30);
                    done();
                }).catch(error => done(error));
            });
    });

    it('Provjera podataka zapisanih u tabeli vježbe', function (done) {
        const brojVjezbi = { brojVjezbi: 5 };
        chai.request(server)
            .post('/vjezbe')
            .set('content-type', 'application/json')
            .send(brojVjezbi)
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{status:"Vježbe kreirane!"}`);

                Vjezba.findAndCountAll().then(result => {
                    assert.equal(result.count, 15);
                    var tacnostIspravna = result.rows.every(row => row.tacnost === "0%");
                    var promjenaIspravna = result.rows.every(row => row.promjena === "0%");
                    var naziviIspravni = true;

                    //Provjera naziva vježbi -> 1,2,3,4,5,1,2,3,4,5,1,2,3,4,5 (za svakog studenta po 1,2,3,4,5)
                    for (var i = 0; i < result.rows.length; i++) {
                        if ((i == 0 || i == 5 || i == 10) && result.rows[i].brojVjezbe != 1) naziviIspravni = false;
                        else if ((i == 1 || i == 6 || i == 11) && result.rows[i].brojVjezbe != 2) naziviIspravni = false;
                        else if ((i == 2 || i == 7 || i == 12) && result.rows[i].brojVjezbe != 3) naziviIspravni = false;
                        else if ((i == 3 || i == 8 || i == 13) && result.rows[i].brojVjezbe != 4) naziviIspravni = false;
                        else if ((i == 4 || i == 9 || i == 14) && result.rows[i].brojVjezbe != 5) naziviIspravni = false;
                    }
                    assert.isTrue(tacnostIspravna);
                    assert.isTrue(promjenaIspravna);
                    assert.isTrue(naziviIspravni);
                    done();
                }).catch(error => done(error));
            });
    });
});