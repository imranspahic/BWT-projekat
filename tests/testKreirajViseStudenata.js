let chai = require('chai');
let chaiHttp = require('chai-http');
var assert = chai.assert;
chai.use(chaiHttp);
var expect = chai.expect;
let server = require("../server");
let db = require("../database");
let Student = require("../models/student")(db);
let Grupa = require("../models/grupa")(db);

describe('testiranje POST na /batch/student', function () {
    before(function (done) {
        db.sync({ force: true }).then(val => done());
    });

    it('Dodavanje 3 studenta uspješno', function (done) {
        let studenti = ["imran,spahic,122-st,grupa1", "imran2,spahic2,123-st,grupa2", "imran3,spahic3,124-st,grupa3"];
        chai.request(server)
            .post(`/batch/student`)
            .set('content-type', 'text/csv')
            .send(studenti.join("\n"))
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{status:"Dodano 3 studenata!"}`);

                Student.findAndCountAll({ limit: 10 }).then(result => {

                    //Provjera da li je i u bazi 3 studenta
                    assert.equal(result.count, 3);

                    //Provjera da su podaci zaista zapisani
                    let studentiBaza = result.rows.map(row => `${row.ime},${row.prezime},${row.index}`);
                    let studentiBezGrupe = studenti.map(s => {
                        let data = s.split(",");
                        return `${data[0]},${data[1]},${data[2]}`;
                    });
                    expect(studentiBaza).to.have.members(studentiBezGrupe);
                    Grupa.findAndCountAll({ limit: 10 }).then(result => {

                        //Provjera jesu li dodane 3 grupe
                        assert.equal(result.count, 3);
                        done();

                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });

    it('Dodavanje 1 studenta uspješno i 2 neuspješno', function (done) {
        let studenti = ["studentNovi,prezimeNovo,1,grupa1", "student2,prezime2,123-st,grupa5", "student3,prezime3,124-st,grupa6"];
        chai.request(server)
            .post(`/batch/student`)
            .set('content-type', 'text/csv')
            .send(studenti.join("\n"))
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{status:"Dodano 1 studenata, a studenti 123-st,124-st već postoje!"}`);

                Student.findAndCountAll({ limit: 10 }).then(result => {

                    //Provjera da li je i u bazi 4 studenta
                    //3 iz prošlog testa i 1 novi
                    assert.equal(result.count, 4);

                    //Provjera da li je novi student zaista dodan
                    Student.findOne({ where: { index: "1" } }).then(student => {
                        assert.isNotNull(student);
                        assert.equal(student.ime, "studentNovi");
                        assert.equal(student.prezime, "prezimeNovo");

                        //Provjera da li su ostale 3 grupe (grupa 5 i grupa 6 iz ovog zahtjeva nisu trebale biti dodane)
                        Grupa.count().then(brojGrupa => {
                            assert.equal(brojGrupa, 3);
                            done();
                        }).catch(error => done(error));
                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });

    it('Dodavanje 3 nova studenta, kreiranje 2 nove grupe', function (done) {
        let studenti = ["student10,prezime10,10-st,grupa1", "student11,prezime11,11-st,grupa11", "student12,prezime12,12-st,grupa12"];
        chai.request(server)
            .post(`/batch/student`)
            .set('content-type', 'text/csv')
            .send(studenti.join("\n"))
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{status:"Dodano 3 studenata!"}`);

                Student.findAndCountAll({ limit: 10 }).then(result => {

                    //Provjera da li je i u bazi 6 studenta
                    //3 iz prvog testa, 1 iz drugog i nova 3 = 7
                    assert.equal(result.count, 7);

                    //Provjera da su podaci zaista zapisani, uzet jedan student
                    Student.findOne({ where: { index: "11-st" } }).then(student => {
                        assert.isNotNull(student);
                        assert.equal(student.ime, "student11");
                        assert.equal(student.prezime, "prezime11");
                        done();
                    }).catch(error => done(error));

                    Grupa.findAndCountAll({ limit: 10 }).then(result => {

                        //Provjera jesu li dodane 2 nove grupe
                        //3 stare i 2 nove = 5
                        assert.equal(result.count, 5);
                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });
});