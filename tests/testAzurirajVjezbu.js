let chai = require('chai');
let chaiHttp = require('chai-http');
var assert = chai.assert;
chai.use(chaiHttp);
let server = require("../server");
let db = require("../database");
let Student = require("../models/student")(db);
let Grupa = require("../models/grupa")(db);
let Vjezba = require("../models/vjezba")(db);
let VjezbaGreska = require("../models/vjezbaGreska")(db);
let VjezbaTest = require("../models/vjezbaTest")(db);

describe('testiranje POST na /student/:index/vjezba/:vjezba', function () {

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
                    const brojVjezbi = { brojVjezbi: 5 };
                    chai.request(server)
                        .post('/vjezbe')
                        .set('content-type', 'application/json')
                        .send(brojVjezbi)
                        .end((err, res) => {
                            done();
                        });
                });
            });
        });
    });

    it('Ažuriranje testa za studenta 1109, vježba 1, nisu postojali prije testovi', function (done) {
        let index = 1109;
        let vjezba = 1;
        var testReport = {
            "stats": {
                "suites": 2,
                "tests": 3,
                "passes": 1,
                "pending": 0,
                "failures": 2,
                "start": "2021-11-15T10:54:48.897Z",
                "end": "2021-11-15T10:54:48.912Z",
                "duration": 15
            },
            "tests": [
                {
                    "title": "treba vratiti 15 kad je a = 3, b = 5",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5",
                    "file": null,
                    "duration": 1,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 15 to equal 16",
                        "showDiff": true,
                        "actual": "15",
                        "expected": "16",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 15 to equal 16\n    at Context.<anonymous> (testKvadrat.js:11:20)"
                    }
                },
                {
                    "title": "treba vratiti 20 kad je a = 5, b = 4",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 20 to equal 22",
                        "showDiff": true,
                        "actual": "20",
                        "expected": "22",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 20 to equal 22\n    at Context.<anonymous> (testKvadrat.js:17:20)"
                    }
                },
                {
                    "title": "treba vratiti 10 kad je a = 5, b = 2",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                }
            ],
            "pending": [],
            "failures": [
                {
                    "title": "treba vratiti 15 kad je a = 3, b = 5",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5",
                    "file": null,
                    "duration": 1,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 15 to equal 16",
                        "showDiff": true,
                        "actual": "15",
                        "expected": "16",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 15 to equal 16\n    at Context.<anonymous> (testKvadrat.js:11:20)"
                    }
                },
                {
                    "title": "treba vratiti 20 kad je a = 5, b = 4",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 20 to equal 22",
                        "showDiff": true,
                        "actual": "20",
                        "expected": "22",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 20 to equal 22\n    at Context.<anonymous> (testKvadrat.js:17:20)"
                    }
                }
            ],
            "passes": [
                {
                    "title": "treba vratiti 10 kad je a = 5, b = 2",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                }
            ]
        };

        chai.request(server)
            .post(`/student/${index}/vjezba/${vjezba}`)
            .set('content-type', 'application/json')
            .send(testReport)
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{vjezba:${vjezba},tacnost:"33.3%",promjena:"0%",greske:[Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5,Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4]}`);

                Vjezba.findOne({ where: { indexStudenta: index, brojVjezbe: vjezba } }).then(vjezba => {
                    assert.isNotNull(vjezba);
                    assert.equal(vjezba.tacnost, "33.3%");
                    assert.equal(vjezba.promjena, "0%");
                    VjezbaTest.findAndCountAll({ where: { vjezbaId: vjezba.id } }).then(result => {

                        //3 testa u reportu
                        assert.equal(result.count, 3);
                        assert.equal(result.rows[0].naziv, "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5");
                        assert.equal(result.rows[1].naziv, "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4");
                        assert.equal(result.rows[2].naziv, "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2");

                        VjezbaGreska.findAndCountAll({ where: { vjezbaId: vjezba.id } }).then(result => {

                            //2 greške u reportu
                            assert.equal(result.count, 2);
                            assert.equal(result.rows[0].naziv, "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5");
                            assert.equal(result.rows[1].naziv, "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4");
                            done();
                        }).catch(error => done(error));
                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });

    it('Ažuriranje testa za istog studenta 1109, vježba 1, postoje testovi od prije', function (done) {
        let index = 1109;
        let vjezba = 1;
        var testReport = {
            "stats": {
                "suites": 2,
                "tests": 3,
                "passes": 2,
                "pending": 0,
                "failures": 1,
                "start": "2021-11-15T10:53:45.075Z",
                "end": "2021-11-15T10:53:45.087Z",
                "duration": 12
            },
            "tests": [
                {
                    "title": "treba vratiti 10 kad je a = 5, b = 2",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2",
                    "file": null,
                    "duration": 3,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 10 to equal 11",
                        "showDiff": true,
                        "actual": "10",
                        "expected": "11",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 10 to equal 11\n    at Context.<anonymous> (testKvadrat.js:10:20)"
                    }
                },
                {
                    "title": "treba vratiti 20 kad je a = 5, b = 4",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                },
                {
                    "title": "treba vratiti 15 kad je a = 3, b = 5",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5",
                    "file": null,
                    "duration": 1,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                }
            ],
            "pending": [],
            "failures": [
                {
                    "title": "treba vratiti 10 kad je a = 5, b = 2",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2",
                    "file": null,
                    "duration": 3,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 10 to equal 11",
                        "showDiff": true,
                        "actual": "10",
                        "expected": "11",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 10 to equal 11\n    at Context.<anonymous> (testKvadrat.js:10:20)"
                    }
                }
            ],
            "passes": [
                {
                    "title": "treba vratiti 20 kad je a = 5, b = 4",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                },
                {
                    "title": "treba vratiti 15 kad je a = 3, b = 5",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5",
                    "file": null,
                    "duration": 1,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                }
            ]
        };

        chai.request(server)
            .post(`/student/${index}/vjezba/${vjezba}`)
            .set('content-type', 'application/json')
            .send(testReport)
            .end((err, res) => {
                assert.isFalse(res.error);
                assert.equal(res.status, 200);
                assert.equal(res.text, `{vjezba:${vjezba},tacnost:"33.3%",promjena:"66.7%",greske:[Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5,Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4]}`);

                Vjezba.findOne({ where: { indexStudenta: index, brojVjezbe: vjezba } }).then(vjezba => {
                    assert.isNotNull(vjezba);
                    assert.equal(vjezba.tacnost, "33.3%");

                    //Testiranje sada promjene
                    assert.equal(vjezba.promjena, "66.7%");
                    VjezbaTest.findAndCountAll({ where: { vjezbaId: vjezba.id } }).then(result => {

                        //3 testa u reportu
                        assert.equal(result.count, 3);
                        assert.equal(result.rows[0].naziv, "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2");
                        assert.equal(result.rows[1].naziv, "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4");
                        assert.equal(result.rows[2].naziv, "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5");

                        VjezbaGreska.findAndCountAll({ where: { vjezbaId: vjezba.id } }).then(result => {

                            //2 greške nakon ažuriranja promjene
                            assert.equal(result.count, 2);
                            assert.equal(result.rows[0].naziv, "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5");
                            assert.equal(result.rows[1].naziv, "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4");
                            done();
                        }).catch(error => done(error));
                    }).catch(error => done(error));
                }).catch(error => done(error));
            });
    });

    it('Ne postoji student 111', function (done) {
        let index = 111;
        let vjezba = 2;
        var testReport = {
            "stats": {
                "suites": 2,
                "tests": 3,
                "passes": 2,
                "pending": 0,
                "failures": 1,
                "start": "2021-11-15T10:53:45.075Z",
                "end": "2021-11-15T10:53:45.087Z",
                "duration": 12
            },
            "tests": [
                {
                    "title": "treba vratiti 10 kad je a = 5, b = 2",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2",
                    "file": null,
                    "duration": 3,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 10 to equal 11",
                        "showDiff": true,
                        "actual": "10",
                        "expected": "11",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 10 to equal 11\n    at Context.<anonymous> (testKvadrat.js:10:20)"
                    }
                },
                {
                    "title": "treba vratiti 20 kad je a = 5, b = 4",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                },
                {
                    "title": "treba vratiti 15 kad je a = 3, b = 5",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5",
                    "file": null,
                    "duration": 1,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                }
            ],
            "pending": [],
            "failures": [
                {
                    "title": "treba vratiti 10 kad je a = 5, b = 2",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2",
                    "file": null,
                    "duration": 3,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 10 to equal 11",
                        "showDiff": true,
                        "actual": "10",
                        "expected": "11",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 10 to equal 11\n    at Context.<anonymous> (testKvadrat.js:10:20)"
                    }
                }
            ],
            "passes": [
                {
                    "title": "treba vratiti 20 kad je a = 5, b = 4",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                },
                {
                    "title": "treba vratiti 15 kad je a = 3, b = 5",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5",
                    "file": null,
                    "duration": 1,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                }
            ]
        };

        chai.request(server)
            .post(`/student/${index}/vjezba/${vjezba}`)
            .set('content-type', 'application/json')
            .send(testReport)
            .end((err, res) => {
                assert.isNotNull(res.error);
                assert.equal(res.status, 400);
                assert.equal(res.text, `{status:"Nije moguće ažurirati vježbe!"}`);
                done();
            });
    });

    it('Ne postoji vježba 10', function (done) {
        let index = 1110;
        let vjezba = 10;
        var testReport = {
            "stats": {
                "suites": 2,
                "tests": 3,
                "passes": 2,
                "pending": 0,
                "failures": 1,
                "start": "2021-11-15T10:53:45.075Z",
                "end": "2021-11-15T10:53:45.087Z",
                "duration": 12
            },
            "tests": [
                {
                    "title": "treba vratiti 10 kad je a = 5, b = 2",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2",
                    "file": null,
                    "duration": 3,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 10 to equal 11",
                        "showDiff": true,
                        "actual": "10",
                        "expected": "11",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 10 to equal 11\n    at Context.<anonymous> (testKvadrat.js:10:20)"
                    }
                },
                {
                    "title": "treba vratiti 20 kad je a = 5, b = 4",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                },
                {
                    "title": "treba vratiti 15 kad je a = 3, b = 5",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5",
                    "file": null,
                    "duration": 1,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                }
            ],
            "pending": [],
            "failures": [
                {
                    "title": "treba vratiti 10 kad je a = 5, b = 2",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 10 kad je a = 5, b = 2",
                    "file": null,
                    "duration": 3,
                    "currentRetry": 0,
                    "err": {
                        "message": "expected 10 to equal 11",
                        "showDiff": true,
                        "actual": "10",
                        "expected": "11",
                        "operator": "strictEqual",
                        "stack": "AssertionError: expected 10 to equal 11\n    at Context.<anonymous> (testKvadrat.js:10:20)"
                    }
                }
            ],
            "passes": [
                {
                    "title": "treba vratiti 20 kad je a = 5, b = 4",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                    "file": null,
                    "duration": 0,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                },
                {
                    "title": "treba vratiti 15 kad je a = 3, b = 5",
                    "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 15 kad je a = 3, b = 5",
                    "file": null,
                    "duration": 1,
                    "currentRetry": 0,
                    "speed": "fast",
                    "err": {}
                }
            ]
        };

        chai.request(server)
            .post(`/student/${index}/vjezba/${vjezba}`)
            .set('content-type', 'application/json')
            .send(testReport)
            .end((err, res) => {
                assert.isNotNull(res.error);
                assert.equal(res.status, 400);
                assert.equal(res.text, `{status:"Nije moguće ažurirati vježbe!"}`);
                done();
            });
    });
});