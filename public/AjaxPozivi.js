export default class AjaxPozivi {
    posaljiStudent(studentObjekat, callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                var parsedResponse = ajax.responseText.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
                    return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
                });
                var jsonRez = JSON.parse(parsedResponse);
                console.log(jsonRez.status);

                //Uspješno kreiranje status
                if (ajax.status == 200) callback(null, jsonRez.status);

                //Neupješno kreiranje status
                else callback(jsonRez.status, null);
            }
        }
        ajax.open("POST", "http://localhost:3000/student", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify(studentObjekat));
    }

    postaviGrupu(indexStudenta, grupa, callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                var parsedResponse = ajax.responseText.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
                    return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
                });
                var jsonRez = JSON.parse(parsedResponse);
                console.log(jsonRez.status);

                //Uspješno ažuriranje grupe status
                if (ajax.status == 200) callback(null, jsonRez.status);

                //Neupješno ažuriranje grupe status
                else callback(jsonRez.status, null);
            }
        }
        var url = `http://localhost:3000/student/${indexStudenta}`;
        var grupaObjekat = { "grupa": grupa };
        ajax.open("PUT", url, true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify(grupaObjekat));
    }

    posaljiStudente(studentiCSVString, callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                var parsedResponse = ajax.responseText.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
                    return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
                });
                var jsonRez = JSON.parse(parsedResponse);
                console.log(jsonRez.status);

                //Uspješno kreiranje više studenata status
                if (ajax.status == 200) callback(null, jsonRez.status);

                //Neupješno kreiranje više studenata status
                else callback(jsonRez.status, null);
            }
        }
        ajax.open("POST", "http://localhost:3000/batch/student", true);
        ajax.setRequestHeader("Content-Type", "text/csv");
        ajax.send(studentiCSVString);
    }

    postaviVjezbe(brojVjezbi, callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                var parsedResponse = ajax.responseText.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
                    return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
                });
                var jsonRez = JSON.parse(parsedResponse);
                console.log(jsonRez.status);

                //Uspješno kreiranje vježbe status
                if (ajax.status == 200) callback(null, jsonRez.status);

                //Neupješno kreiranje vježbe status
                else callback(jsonRez.status, null);
            }
        }
        var brojVjezbiObjekat = { "brojVjezbi": brojVjezbi };
        ajax.open("POST", "http://localhost:3000/vjezbe", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify(brojVjezbiObjekat));
    }

    postaviTestReport(indexStudenta, nazivVjezbe, testReport, callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                var parsedResponse = ajax.responseText.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
                    return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
                });
                var jsonRez = JSON.parse(parsedResponse);
                console.log(jsonRez.status);

                //Uspješno ažuriranje vježbe status
                if (ajax.status == 200) callback(null, `vjezba: ${jsonRez.vjezba}, tacnost: ${jsonRez.tacnost}, promjena: ${jsonRez.promjena}, greske: ${jsonRez.greske}`);

                //Neupješno ažuriranje vježbe status
                else callback(jsonRez.status, null);
            }
        }
        var url = `http://localhost:3000/student/${indexStudenta}/vjezba/${nazivVjezbe}`
        var testReportObjekat = JSON.stringify(testReport);
        ajax.open("POST", url, true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(testReportObjekat);
    }
}