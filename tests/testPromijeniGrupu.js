let chai = require('chai');
let chaiHttp = require('chai-http');
var assert = chai.assert;
chai.use(chaiHttp);
let server = require("../server");
let db = require("../database");
let Student = require("../models/student")(db);
let Grupa = require("../models/grupa")(db);

describe('testiranje PUT na /student/:index', function () {

    ///Briše/resetuje bazu prije pokretanja testova
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

    it('Promjena grupe studentu 1109', function (done) {
        let index = 1109;
        let grupa = "RS2";
        chai.request(server)
            .put(`/student/${index}`)
            .set('content-type', 'application/json')
            .send({ "grupa": `${grupa}` })
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{status:"Promjenjena grupa studentu ${index}"}`);
                Student.findOne({ where: { index: index } }).then(student => {
                    assert.isNotNull(student);

                    ///Provjera da li je grupa promijenjena u bazi uspješno, id grupe RS2 je 2
                    assert.equal(student.grupaId, 2);
                    done();
                }).catch(error => done(error));
            });
    });

    it('Promjena grupe studentu 1110 u grupu koja ne postoji, treba kreirati novu grupu', function (done) {
        let index = 1110;
        let grupa = "RS3";
        chai.request(server)
            .put(`/student/${index}`)
            .set('content-type', 'application/json')
            .send({ "grupa": `${grupa}` })
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{status:"Promjenjena grupa studentu ${index}"}`);
                Grupa.findOne({ where: { naziv: grupa } }).then(grupa => {
                    Student.findOne({ where: { index: index } }).then(student => {
                        assert.isNotNull(student);

                        ///Provjera da li je grupa promijenjena u bazi uspješno, id sada nove grupe RS3 treba biti 3
                        assert.equal(student.grupaId, grupa.id);
                        done();
                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });

    it('Ne postoji student 200, grupu ne treba kreirati', function (done) {
        let index = 200;
        let grupa = "RS4";
        chai.request(server)
            .put(`/student/${index}`)
            .set('content-type', 'application/json')
            .send({ "grupa": `${grupa}` })
            .end((err, res) => {
                assert.isNotNull(res.error);
                assert.equal(res.status, 400);
                assert.equal(res.text, `{status:"Student sa indexom ${index} ne postoji"}`);
                Grupa.findOne({ where: { naziv: grupa } }).then(grupa => {
                    //Nije kreirana grupa u bazi
                    assert.isNull(grupa);
                    Grupa.count().then(brojGrupa => {

                        //Broj grupa je i dalje 3, ne 4
                        assert.equal(brojGrupa, 3);
                        done();
                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });
});