let chai = require('chai');
let chaiHttp = require('chai-http');
var assert = chai.assert;
chai.use(chaiHttp);
let server = require("../server");
let db = require("../database");
let Student = require("../models/student")(db);
let Grupa = require("../models/grupa")(db);

describe('testiranje POST na /student', function () {

    ///Briše/resetuje bazu prije pokretanja testova
    before(function (done) {
        db.sync({ force: true }).then(val => done());
    });

    it('Dodavanje studenta', function (done) {
        let student = { "ime": "imran", "prezime": "prezime", "index": "122-st", "grupa": "RS-1" };
        chai.request(server)
            .post('/student')
            .set('content-type', 'application/json')
            .send(student)
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, '{status:"Kreiran student!"}');
                //Provjera da li je zaista kreiran student u tabeli Student u bazi
                Student.findOne({ where: { index: student.index } }).then(bazaStudent => {

                    assert.isNotNull(bazaStudent);
                    assert.equal(bazaStudent.ime, student.ime);
                    assert.equal(bazaStudent.prezime, student.prezime);
                    //Provjera da li je broj studenata u bazi jednak 1
                    Student.count().then(brojStudenata => {
                        assert.equal(brojStudenata, 1);

                        //Provjera da li je grupa kreirana jer nije postojala ranije
                        Grupa.findOne({ where: { naziv: student.grupa } }).then(grupa => {
                            assert.isNotNull(grupa);

                            //Provjera povezanosti studenta sa grupom
                            assert.equal(bazaStudent.grupaId, grupa.id);
                            done();
                        }).catch(error => done(error));
                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });

    it('Dodavanje novog studenta sa istom grupom', function (done) {
        let student = { "ime": "hamza", "prezime": "vildanovic", "index": "105-ST", "grupa": "RS-1" };
        chai.request(server)
            .post('/student')
            .set('content-type', 'application/json')
            .send(student)
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, '{status:"Kreiran student!"}');
                //Provjera da li je zaista kreiran student u tabeli Student u bazi
                Student.findOne({ where: { index: student.index } }).then(bazaStudent => {

                    assert.isNotNull(bazaStudent);
                    assert.equal(bazaStudent.ime, student.ime);
                    assert.equal(bazaStudent.prezime, student.prezime);
                    //Provjera da li je broj studenata u bazi jednak 2
                    Student.count().then(brojStudenata => {
                        assert.equal(brojStudenata, 2);

                        //Provjera da li je broj grupa i dalje 1
                        Grupa.count().then(brojGrupa => {
                            assert.equal(brojGrupa, 1);

                            Grupa.findOne({ where: { naziv: student.grupa } }).then(grupa => {
                                assert.isNotNull(grupa);

                                //Provjera da li je ostala jedino stara kreirana grupa u bazi
                                //da se nije overwrite
                                assert.equal(grupa.id, 1);

                                //Provjera povezanosti studenta sa grupom
                                assert.equal(bazaStudent.grupaId, grupa.id);
                                done();
                            }).catch(error => done(error));
                        }).catch(error => done(error));
                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });

    it('Dodavanje studenta sa postojećim indexom', function (done) {
        let student = { "ime": "nedim", "prezime": "delibasic", "index": "105-ST", "grupa": "RS-2" };
        chai.request(server)
            .post('/student')
            .set('content-type', 'application/json')
            .send(student)
            .end((err, res) => {
                //Postoji error jer je status 400
                assert.isNotNull(res.error);
                assert.equal(res.status, 400);
                assert.equal(res.text, `{status:"Student sa indexom ${student.index} već postoji!"}`);

                //Provjera da li je broj studenata u bazi ostao 2
                Student.count().then(brojStudenata => {
                    assert.equal(brojStudenata, 2);

                    Grupa.count().then(brojGrupa => {

                        //Provjera da li je broj grupa i dalje 1
                        assert.equal(brojGrupa, 1);

                        //Provjera da nije grupa kreirana jer nije postojala ranije a student se nije dodao
                        //ne treba se kreirati grupa
                        Grupa.findOne({ where: { naziv: student.grupa } }).then(grupa => {
                            assert.isNull(grupa);
                            done();
                        }).catch(error => done(error));
                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });
});