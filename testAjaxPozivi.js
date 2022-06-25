chai.should();
import AjaxPozivi from "../public/AjaxPozivi.js";
var assert = chai.assert;

describe("Testiranje modula AjaxPozivi", function () {

    describe("AjaxPozivi.posaljiStudent()", function () {
        beforeEach(function () {
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.requests = [];
            this.xhr.onCreate = function (xhr) {
                this.requests.push(xhr);
            }.bind(this);
        });

        afterEach(function () {
            this.xhr.restore();
        });

        it('metoda treba dodati uspješno studenta', function (done) {
            let student = { "ime": "imran", "prezime": "prezime", "index": "122-st", "grupa": "RS-1" };
            var mochaContext = this;
            var ajax = new AjaxPozivi();
            ajax.posaljiStudent(student, function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNull(error);
                assert.isNotNull(data);

                //Testiranje uspješno parsiranog statusa
                assert.equal(data, "Kreiran student!");

                //Provjera da li je body u post zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                assert.equal(mochaContext.requests[0].requestBody, '{"ime":"imran","prezime":"prezime","index":"122-st","grupa":"RS-1"}');

                done();
            });
            //Simulacija uspješno dodanog studenta
            this.requests[0].respond(200, { 'Content-Type': 'application/json' }, `{status:"Kreiran student!"}`);
        });

        it('metoda ne treba dodati uspješno studenta, prijaviti grešku', function (done) {
            let student = { "ime": "Hamid", "prezime": "Delić", "index": "10831", "grupa": "3" };
            var mochaContext = this;
            var ajax = new AjaxPozivi();
            ajax.posaljiStudent(student, function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNull(data);
                assert.isNotNull(error);

                //Testiranje uspješno parsiranog statusa
                assert.equal(error, "Student sa indexom 10831 već postoji!");

                //Provjera da li je body u post zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                assert.equal(mochaContext.requests[0].requestBody, '{"ime":"Hamid","prezime":"Delić","index":"10831","grupa":"3"}');

                done();
            });
            //Simulacija neuspješno dodanog studenta
            this.requests[0].respond(400, { 'Content-Type': 'application/json' }, `{status:"Student sa indexom 10831 već postoji!"}`);
        });
    });


    describe("AjaxPozivi.postaviGrupu()", function () {
        beforeEach(function () {
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.requests = [];
            this.xhr.onCreate = function (xhr) {
                this.requests.push(xhr);
            }.bind(this);
        });

        afterEach(function () {
            this.xhr.restore();
        });

        it('metoda treba uspješno promijeniti grupu studenta', function (done) {
            let grupa = "RS-4";
            let index = "122-ST";
            var ajax = new AjaxPozivi();
            var mochaContext = this;
            ajax.postaviGrupu(index, grupa, function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNull(error);
                assert.isNotNull(data);

                //Testiranje uspješno parsiranog statusa
                assert.equal(data, "Promjenjena grupa studentu 122-ST");

                //Provjera da li je body u put zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                assert.equal(mochaContext.requests[0].requestBody, '{"grupa":"RS-4"}');

                done();
            });
            //Simulacija uspješno promijenjene grupe studenta
            this.requests[0].respond(200, { 'Content-Type': 'application/json' }, `{status:"Promjenjena grupa studentu 122-ST"}`);
        });

        it('metoda ne treba dodati promijeniti grupu studenta, prijaviti grešku', function (done) {
            let index = "1345";
            let grupa = "15";
            let mochaContext = this;
            var ajax = new AjaxPozivi();
            ajax.postaviGrupu(index, grupa, function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNull(data);
                assert.isNotNull(error);

                //Testiranje uspješno parsiranog statusa
                assert.equal(error, "Student sa indexom 1345 ne postoji");

                //Provjera da li je body u put zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                assert.equal(mochaContext.requests[0].requestBody, '{"grupa":"15"}');

                done();
            });
            //Simulacija neuspješno promijenjene grupe studenta
            this.requests[0].respond(400, { 'Content-Type': 'application/json' }, `{status:"Student sa indexom 1345 ne postoji"}`);
        });
    });

    describe("AjaxPozivi.posaljiStudente()", function () {
        beforeEach(function () {
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.requests = [];
            this.xhr.onCreate = function (xhr) {
                this.requests.push(xhr);
            }.bind(this);
        });

        afterEach(function () {
            this.xhr.restore();
        });

        it('metoda treba uspješno dodati studente', function (done) {
            let studenti = ["imran,spahic,122-st,grupa1", "imran2,spahic2,123-st,grupa2", "imran3,spahic3,124-st,grupa3"];
            var ajax = new AjaxPozivi();
            var mochaContext = this;
            ajax.posaljiStudente(studenti.join("\n"), function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNull(error);
                assert.isNotNull(data);

                //Testiranje uspješno parsiranog statusa
                assert.equal(data, "Dodano 3 studenata!");

                //Provjera da li je body u post zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                assert.equal(mochaContext.requests[0].requestBody, studenti.join("\n"));

                done();
            });
            //Simulacija uspješno dodanih studenata
            this.requests[0].respond(200, { 'Content-Type': 'application/json' }, `{status:"Dodano 3 studenata!"}`);
        });

        it('metoda treba uspješno dodati neke studente', function (done) {
            let studenti = ["student1,prezime1,1,grupa1", "student2,prezime2,2,grupa2", "student3,prezime3,3,grupa3", "student4,prezime4,4,grupa4"];
            let mochaContext = this;
            var ajax = new AjaxPozivi();
            ajax.posaljiStudente(studenti.join("\n"), function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNull(error);
                assert.isNotNull(data);

                //Testiranje uspješno parsiranog statusa
                assert.equal(data, "Dodano 2 studenata, a 1,2 već postoje!");

                //Provjera da li je body u post zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                assert.equal(mochaContext.requests[0].requestBody, studenti.join("\n"));

                done();
            });
            //Simulacija uspješno i neuspješno dodanih studenata
            this.requests[0].respond(200, { 'Content-Type': 'application/json' }, `{status:"Dodano 2 studenata, a 1,2 već postoje!"}`);
        });

        it('pogrešan format csv teksta - nekom studentu fali informacija, metoda treba prijaviti grešku', function (done) {

            //student 1 nema indeksa
            let studenti = ["student1,prezime1,grupa1", "student2,prezime2,2,grupa2", "student3,prezime3,3,grupa3", "student4,prezime4,4,grupa4"];
            let mochaContext = this;
            var ajax = new AjaxPozivi();
            ajax.posaljiStudente(studenti.join("\n"), function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNotNull(error);
                assert.isNull(data);

                //Testiranje uspješno parsiranog statusa
                assert.equal(error, "Neispravan format unesenog CSV teksta");

                //Provjera da li je body u post zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                assert.equal(mochaContext.requests[0].requestBody, studenti.join("\n"));

                done();
            });
            //Simulacija neispravnog formata csv teksta
            this.requests[0].respond(400, { 'Content-Type': 'application/json' }, `{status:"Neispravan format unesenog CSV teksta"}`);
        });
    });

    describe("AjaxPozivi.postaviVjezbe()", function () {

        beforeEach(function () {
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.requests = [];
            this.xhr.onCreate = function (xhr) {
                this.requests.push(xhr);
            }.bind(this);
        });

        afterEach(function () {
            this.xhr.restore();
        });

        it('metoda treba uspješno kreirati vježbe', function (done) {

            let brojVjezbi = 3;
            let mochaContext = this;
            var ajax = new AjaxPozivi();
            ajax.postaviVjezbe(brojVjezbi, function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNull(error);
                assert.isNotNull(data);

                //Testiranje uspješno parsiranog statusa
                assert.equal(data, "Vježbe kreirane!");

                //Provjera da li je body u post zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                assert.equal(mochaContext.requests[0].requestBody, '{"brojVjezbi":3}');

                done();
            });
            //Simulacija ispavno kreiranih vježbi
            this.requests[0].respond(200, { 'Content-Type': 'application/json' }, `{status:"Vježbe kreirane!"}`);
        });

        it('neispravan parametar brojVjezbi, metoda treba prijaviti grešku', function (done) {

            let brojVjezbi = -1;
            let mochaContext = this;
            var ajax = new AjaxPozivi();
            ajax.postaviVjezbe(brojVjezbi, function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNotNull(error);
                assert.isNull(data);

                //Testiranje uspješno parsiranog statusa
                assert.equal(error, "Neispravan parametar brojVjezbi");

                //Provjera da li je body u post zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                assert.equal(mochaContext.requests[0].requestBody, '{"brojVjezbi":-1}');

                done();
            });
            //Simulacija neispavno kreiranih vježbi
            this.requests[0].respond(400, { 'Content-Type': 'application/json' }, `{status:"Neispravan parametar brojVjezbi"}`);
        });
    });

    describe("AjaxPozivi.postaviTestReport()", function () {
        beforeEach(function () {
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.requests = [];
            this.xhr.onCreate = function (xhr) {
                this.requests.push(xhr);
            }.bind(this);
        });

        afterEach(function () {
            this.xhr.restore();
        });

        it('metoda treba uspješno kreirati test report', function (done) {

            let index = "11-ST";
            let brojVjezbe = 2;
            var jsonReport = {
                "stats": {
                    "suites": 2,
                    "tests": 1,
                    "passes": 1,
                    "pending": 0,
                    "failures": 0,
                    "start": "2021-11-15T10:51:21.880Z",
                    "end": "2021-11-15T10:51:22.185Z",
                    "duration": 305
                },
                "tests": [
                    {
                        "title": "treba vratiti 20 kad je a = 5, b = 4",
                        "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                        "file": null,
                        "duration": 1,
                        "currentRetry": 0,
                        "speed": "fast",
                        "err": {}
                    }
                ],
                "pending": [],
                "failures": [],
                "passes": [
                    {
                        "title": "treba vratiti 20 kad je a = 5, b = 4",
                        "fullTitle": "Kvadrat dajPovrsinu() treba vratiti 20 kad je a = 5, b = 4",
                        "file": null,
                        "duration": 1,
                        "currentRetry": 0,
                        "speed": "fast",
                        "err": {}
                    }
                ]
            };
            let mochaContext = this;
            var ajax = new AjaxPozivi();
            ajax.postaviTestReport(index, brojVjezbe, jsonReport, function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNull(error);
                assert.isNotNull(data);

                //Testiranje uspješno parsiranog statusa
                assert.equal(data, `vjezba: 2, tacnost: 100%, promjena: 0%, greske: `);

                //Provjera da li je body u post zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                done();
            });
            //Simulacija ispavno ažurirane vježbe
            this.requests[0].respond(200, { 'Content-Type': 'application/json' }, `{vjezba:2,tacnost:"100%",promjena:"0%",greske:[]}`);
        });

        it('ne postoji vježba, metoda treba prijaviti grešku', function (done) {

            let brojVjezbe = 5;
            let index = "11938";
            let mochaContext = this;
            var jsonReport = {
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
            var ajax = new AjaxPozivi();
            ajax.postaviTestReport(index, brojVjezbe, jsonReport, function (error, data) {
                //Testiranje da li modul popunjava callback parametre ispravno
                assert.isNotNull(error);
                assert.isNull(data);

                //Testiranje uspješno parsiranog statusa
                assert.equal(error, "Nije moguće ažurirati vježbe!");

                //Provjera da li je body u post zahtjevu uspješno postavljen
                assert.isNotNull(mochaContext.requests[0].requestBody);
                done();
            });
            //Simulacija nepostojeće vježbe
            this.requests[0].respond(400, { 'Content-Type': 'application/json' }, `{status:"Nije moguće ažurirati vježbe!"}`);
        });
    });

});