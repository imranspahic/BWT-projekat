class TestoviParser {
    dajTacnost(jsonData) {
        //Primljen string iz postavke zadatka?
        //kontruišemo json objekat da pristupimo atributima
        let jsonObject = JSON.parse(jsonData);
        let uspjesnih = jsonObject["stats"]["passes"];
        let ukupno = jsonObject["stats"]["tests"];

        //uzimamo listu gresaka i transformisemo da uzmemo samo naslove
        let listaGreski = jsonObject["failures"];
        let greskeNazivi = listaGreski.map((greska) => greska["fullTitle"]);
        let procenat;
        let rezultat = {};
        let neMozeSeIzvrsiti = listaGreski.some((greska) => greska["err"]["actual"] == null && greska["err"]["expected"] == null);

        if (neMozeSeIzvrsiti) {
            procenat = 0;
            greskeNazivi = ["Testovi se ne mogu izvršiti"];
        }
        else {
            //kreiramo procenat uspješnosti
            procenat = Math.round((uspjesnih / ukupno) * 1000) / 10;
        }
        //kreiranje rezultat objekta
        rezultat["tacnost"] = procenat.toString() + '%';
        rezultat["greske"] = greskeNazivi;
        console.log(JSON.stringify(rezultat));
        return JSON.parse(JSON.stringify(rezultat));
    }

    porediRezultate(rezultat1, rezultat2) {
        let rezultat1Json = JSON.parse(rezultat1);
        let rezultat2Json = JSON.parse(rezultat2);

        ///Liste testova sa nazivima
        let naziviRezultat1 = rezultat1Json["tests"].map((test1) => test1["fullTitle"]);
        let naziviRezultat2 = rezultat2Json["tests"].map((test2) => test2["fullTitle"]);
        let promjenaX;
        let greske = [];
        let rezultat = {};

        ///Provjera jednakosti testova
        let testoviJednaki = naziviRezultat1.length == naziviRezultat2.length &&
            naziviRezultat1.every((test1) =>
                naziviRezultat2.includes(test1)) && naziviRezultat2.every((test2) =>
                    naziviRezultat1.includes(test2));
        if (testoviJednaki) {
            promjenaX = rezultat2Json["stats"]["passes"] / rezultat2Json["stats"]["tests"];
            promjenaX = Math.round(promjenaX * 1000) / 10;
            greske = rezultat1Json["failures"].map((greska) => greska["fullTitle"])
        }
        else {
            let padajuR1mimoR2 = rezultat1Json["failures"].filter((fail1) => !rezultat2Json["tests"].map((test2) => test2["fullTitle"]).includes(fail1["fullTitle"])).length;
            let padajuR2 = rezultat2Json["failures"].length;
            let brojTestovaR2 = rezultat2Json["stats"]["tests"];
            promjenaX = (padajuR1mimoR2 + padajuR2) / (padajuR1mimoR2 + brojTestovaR2);
            promjenaX = Math.round(promjenaX * 1000) / 10;
            greske = rezultat1Json["failures"].filter((fail1) => !rezultat2Json["tests"].map((test2) => test2["fullTitle"]).includes(fail1["fullTitle"])).map((greska) => greska["fullTitle"]);
            let greskeSamoR2 = rezultat2Json["failures"].filter((fail2) => !rezultat1Json["tests"].map((test1) => test1["fullTitle"]).includes(fail2["fullTitle"])).map((greska) => greska["fullTitle"]);
            greske.push(...greskeSamoR2);
        }
        rezultat["promjena"] = promjenaX + "%";
        rezultat["greske"] = greske;
        console.log(rezultat);
        return JSON.parse(JSON.stringify(rezultat));

    }
}

module.exports = TestoviParser;