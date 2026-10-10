const celdas = {};

function guardarCeldasUsadas(nombreCelda, referencias) {
    let celdasAnteriores = celdas[nombreCelda].celdasQueUsa;

    for (let i = 0; i < celdasAnteriores.length; i++) {
        let nombreAnterior = celdasAnteriores[i];
        let lista = celdas[nombreAnterior].celdasQueLaUsan;
        let lugar = lista.indexOf(nombreCelda);

        if (lugar != -1) {
            lista.splice(lugar, 1);
        }
    }

    celdas[nombreCelda].celdasQueUsa = [];

    for (let i = 0; i < referencias.length; i++) {
        let nombreUsado = referencias[i];

        if (celdas[nombreUsado] != undefined) {
            if (!celdas[nombreCelda].celdasQueUsa.includes(nombreUsado)) {
                celdas[nombreCelda].celdasQueUsa.push(nombreUsado);
            }

            if (!celdas[nombreUsado].celdasQueLaUsan.includes(nombreCelda)) {
                celdas[nombreUsado].celdasQueLaUsan.push(nombreCelda);
            }
        }
    }
}

function actualizarResultados(nombreCelda) {
    let lista = celdas[nombreCelda].celdasQueLaUsan;

    for (let i = 0; i < lista.length; i++) {
        let nombreFormula = lista[i];
        let formula = celdas[nombreFormula].contenido;

        celdas[nombreFormula].valor = calcularFormula(formula);
        document.getElementById(nombreFormula).textContent =
            mostrarValor(nombreFormula);
        pintarNumeroNegativo(nombreFormula);
        actualizarResultados(nombreFormula);
    }
}

function hayBucle(nombreCelda, referencias, revisadas) {
    if (revisadas == undefined) {
        revisadas = [];
    }

    for (let i = 0; i < referencias.length; i++) {
        let nombreBuscado = referencias[i];

        if (nombreBuscado == nombreCelda) {
            return true;
        }

        if (
            celdas[nombreBuscado] != undefined &&
            !revisadas.includes(nombreBuscado)
        ) {
            revisadas.push(nombreBuscado);

            if (
                hayBucle(
                    nombreCelda,
                    celdas[nombreBuscado].celdasQueUsa,
                    revisadas
                )
            ) {
                return true;
            }
        }
    }

    return false;
}