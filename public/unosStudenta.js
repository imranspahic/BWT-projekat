
var dodajDugmeElement, statusPorukaElement, statusElement;
var imeElement, prezimeElement, indexElement, grupaElement;
import AjaxPozivi from "./AjaxPozivi.js";

window.onload = function () {
    postaviElemente();
}

function postaviElemente() {
    dodajDugmeElement = document.getElementById("dodajDugme");
    statusElement = document.getElementById("status");
    statusPorukaElement = document.getElementById("status-message");
    imeElement = document.getElementById("ime");
    prezimeElement = document.getElementById("prezime");
    indexElement = document.getElementById("index");
    grupaElement = document.getElementById("grupa");
    dodajDugmeElement.addEventListener("click", dodajDugmeListener);
}

function dodajDugmeListener() {
    let student = {
        "ime": imeElement.value,
        "prezime": prezimeElement.value,
        "index": indexElement.value,
        "grupa": grupaElement.value
    };
    var ajaxPozivi = new AjaxPozivi();
    ajaxPozivi.posaljiStudent(student, function (error, data) {
        if (error) {
            statusElement.classList.remove("hide");
            statusElement.classList.add("show");
            statusPorukaElement.innerHTML = error;
            statusElement.classList.remove("green");
            statusElement.classList.add("red");
            statusPorukaElement.classList.remove("green");
            statusPorukaElement.classList.add("red");
        }
        else if (data) {
            statusElement.classList.remove("hide");
            statusElement.classList.add("show");
            statusPorukaElement.innerHTML = data;
            statusElement.classList.remove("red");
            statusElement.classList.add("green");
            statusPorukaElement.classList.remove("red");
            statusPorukaElement.classList.add("green");
        }
    });
}