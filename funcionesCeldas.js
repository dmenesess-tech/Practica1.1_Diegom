function pintarNumeroNegativo(nombreCelda) {
    let celda = document.getElementById(nombreCelda);
    let valor = Number(celdas[nombreCelda].valor);

    if (valor < 0) {
        celda.style.color = "red";
    } else {
        celda.style.color = "black";
    }
}

function moverSeleccion(nombreCelda, tecla) {
    let columna = nombreCelda.charCodeAt(0);
    let fila = Number(nombreCelda.substring(1));

    if (tecla.key == "ArrowRight") {
        columna++;
    } else if (tecla.key == "ArrowLeft") {
        columna--;
    } else if (tecla.key == "ArrowDown" || tecla.key == "Enter") {
        fila++;
    } else if (tecla.key == "ArrowUp") {
        fila--;
    } else {
        return;
    }

    let destino = String.fromCharCode(columna) + fila;

    if (celdas[destino] != undefined) {
        tecla.preventDefault();
        document.getElementById(destino).focus();
    }
}

function mostrarValor(nombreCelda) {
    let valor = celdas[nombreCelda].valor;
    let formato = celdas[nombreCelda].formato;

    if (valor == "" || isNaN(valor)) {
        return valor;
    }

    if (formato == "moneda") {
        return "Q " + Number(valor).toFixed(2);
    }

    if (formato == "porcentaje") {
        return Number(valor).toFixed(2) + "%";
    }

    if (formato == "decimal") {
        return Number(valor).toFixed(2);
    }

    return valor;
}

let celdaSeleccionada = "";

function guardarCeldaSeleccionada(nombreCelda) {
    celdaSeleccionada = nombreCelda;
}

function aplicarFormato() {
    if (celdaSeleccionada == "") {
        return;
    }

    let formato = document.getElementById("formato").value;

    guardarCambio();
    celdas[celdaSeleccionada].formato = formato;
    document.getElementById(celdaSeleccionada).textContent =
        mostrarValor(celdaSeleccionada);
    guardarExcel();
}

let historial = [];
let historialRehacer = [];

function guardarCambio() {
    let estado = JSON.stringify(celdas);

    if (historial[historial.length - 1] != estado) {
        historial.push(estado);
    }

    historialRehacer = [];
}

function volverAEstado(estado) {
    let celdasGuardadas = JSON.parse(estado);
    let nombres = Object.keys(celdas);

    for (let i = 0; i < nombres.length; i++) {
        delete celdas[nombres[i]];
    }

    Object.assign(celdas, celdasGuardadas);

    for (let nombre in celdas) {
        document.getElementById(nombre).textContent = mostrarValor(nombre);
        pintarNumeroNegativo(nombre);
    }

    guardarExcel();
}

function deshacer() {
    if (historial.length == 0) {
        return;
    }

    historialRehacer.push(JSON.stringify(celdas));
    volverAEstado(historial.pop());
}

function rehacer() {
    if (historialRehacer.length == 0) {
        return;
    }

    historial.push(JSON.stringify(celdas));
    volverAEstado(historialRehacer.pop());
}

document.addEventListener("keydown", function (tecla) {
    if (tecla.ctrlKey && tecla.key.toLowerCase() == "z") {
        tecla.preventDefault();
        deshacer();
    }

    if (tecla.ctrlKey && tecla.key.toLowerCase() == "y") {
        tecla.preventDefault();
        rehacer();
    }
});