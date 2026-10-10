function separarFormula(formula) {
    let partes = [];
    let palabra = "";

    for (let i = 1; i < formula.length; i++) {
        let letra = formula[i];

        if (letra == " ") {
            continue;
        }

        if (
            letra == "+" ||
            letra == "-" ||
            letra == "*" ||
            letra == "/" ||
            letra == "(" ||
            letra == ")"
        ) {
            if (palabra != "") {
                partes.push(palabra);
                palabra = "";
            }

            partes.push(letra);
        } else {
            palabra = palabra + letra;
        }
    }

    if (palabra != "") {
        partes.push(palabra);
    }

    return partes;
}

function buscarValor(parte) {
    if (celdas[parte] != undefined) {
        return Number(celdas[parte].valor);
    }

    return Number(parte);
}

function hacerMultiplicacionYDivision(partes) {
    for (let i = 0; i < partes.length; i++) {
        if (partes[i] == "*" || partes[i] == "/") {
            let numero1 = buscarValor(partes[i - 1]);
            let numero2 = buscarValor(partes[i + 1]);
            let resultado;

            if (partes[i] == "*") {
                resultado = numero1 * numero2;
            } else {
                if (numero2 == 0) {
                    return "#DIV/0!";
                }

                resultado = numero1 / numero2;
            }

            partes.splice(i - 1, 3, resultado);
            i = i - 1;
        }
    }

    return partes;
}

function hacerSumaYResta(partes) {
    while (partes.length > 1) {
        if (partes.length < 3) {
            return "#ERROR!";
        }

        let numero1 = buscarValor(partes[0]);
        let signo = partes[1];
        let numero2 = buscarValor(partes[2]);
        let resultado;

        if (isNaN(numero1) || isNaN(numero2)) {
            return "#ERROR!";
        }

        if (signo == "+") {
            resultado = numero1 + numero2;
        } else if (signo == "-") {
            resultado = numero1 - numero2;
        } else {
            return "#ERROR!";
        }

        partes.splice(0, 3, resultado);
    }

    return buscarValor(partes[0]);
}

function hacerCuentasEntreParentesis(partes) {
    while (partes.includes(")")) {
        let cierre = partes.indexOf(")");
        let inicio = cierre;

        while (partes[inicio] != "(") {
            inicio--;
        }

        let dentro = partes.slice(inicio + 1, cierre);
        let resultadoMultiplicar = hacerMultiplicacionYDivision(dentro);

        if (resultadoMultiplicar == "#DIV/0!") {
            return "#DIV/0!";
        }

        let resultado = hacerSumaYResta(dentro);
        partes.splice(inicio, cierre - inicio + 1, resultado);
    }

    return partes;
}

function buscarCeldasDelGrupo(inicio, fin) {
    let columnaInicio = inicio.charCodeAt(0) - 64;
    let filaInicio = Number(inicio.substring(1));
    let columnaFin = fin.charCodeAt(0) - 64;
    let filaFin = Number(fin.substring(1));
    let grupo = [];

    if (columnaInicio > columnaFin || filaInicio > filaFin) {
        return grupo;
    }

    for (let fila = filaInicio; fila <= filaFin; fila++) {
        for (let columna = columnaInicio; columna <= columnaFin; columna++) {
            let letra = String.fromCharCode(64 + columna);
            grupo.push(letra + fila);
        }
    }

    return grupo;
}

function buscarNombreDeCuenta(formula) {
    if (formula.startsWith("=SUMA(")) {
        return "SUMA";
    }

    if (formula.startsWith("=PROMEDIO(")) {
        return "PROMEDIO";
    }

    if (formula.startsWith("=MAX(")) {
        return "MAX";
    }

    if (formula.startsWith("=MIN(")) {
        return "MIN";
    }

    return "";
}

function hacerCuentaDelGrupo(formula, nombreCuenta) {
    let inicio = formula.indexOf("(") + 1;
    let fin = formula.length - 1;
    let extremos = formula.substring(inicio, fin).split(":");

    if (extremos.length != 2) {
        return "#ERROR!";
    }

    let grupo = buscarCeldasDelGrupo(extremos[0], extremos[1]);

    if (grupo.length == 0) {
        return "#ERROR!";
    }

    let suma = 0;
    let mayor = Number(celdas[grupo[0]].valor);
    let menor = mayor;

    for (let i = 0; i < grupo.length; i++) {
        let numero = Number(celdas[grupo[i]].valor);
        suma = suma + numero;

        if (numero > mayor) {
            mayor = numero;
        }

        if (numero < menor) {
            menor = numero;
        }
    }

    if (nombreCuenta == "SUMA") {
        return suma;
    }

    if (nombreCuenta == "PROMEDIO") {
        return suma / grupo.length;
    }

    if (nombreCuenta == "MAX") {
        return mayor;
    }

    if (nombreCuenta == "MIN") {
        return menor;
    }

    return "#ERROR!";
}

function buscarReferencias(formula) {
    let nombreCuenta = buscarNombreDeCuenta(formula);

    if (nombreCuenta != "") {
        let extremos = formula.substring(
            formula.indexOf("(") + 1,
            formula.length - 1
        ).split(":");

        if (extremos.length != 2) {
            return [];
        }

        return buscarCeldasDelGrupo(extremos[0], extremos[1]);
    }

    let partes = separarFormula(formula);
    let referencias = [];

    for (let i = 0; i < partes.length; i++) {
        if (celdas[partes[i]] != undefined) {
            if (!referencias.includes(partes[i])) {
                referencias.push(partes[i]);
            }
        }
    }

    return referencias;
}

function revisarReferencias(formula) {
    let referencias = buscarReferencias(formula);

    for (let i = 0; i < referencias.length; i++) {
        let celda = celdas[referencias[i]];

        if (celda == undefined || celda.valor == "") {
            return "#ERROR!";
        }

        if (
            celda.valor == "#CIRCULAR!" ||
            celda.valor == "#DIV/0!" ||
            celda.valor == "#ERROR!"
        ) {
            return celda.valor;
        }
    }

    return "";
}

function calcularFormula(formula) {
    let nombreCuenta = buscarNombreDeCuenta(formula);

    if (formula.length < 2 || formula[0] != "=") {
        return "#ERROR!";
    }

    let error = revisarReferencias(formula);

    if (error != "") {
        return error;
    }

    if (nombreCuenta != "") {
        return hacerCuentaDelGrupo(formula, nombreCuenta);
    }

    let partes = separarFormula(formula);
    let nivelParentesis = 0;
    let signos = "+-*/";

    for (let i = 0; i < partes.length; i++) {
        if (partes[i] == "(") {
            nivelParentesis++;
        }

        if (partes[i] == ")") {
            nivelParentesis--;
        }

        if (nivelParentesis < 0) {
            return "#ERROR!";
        }

        if (
            signos.includes(partes[i]) &&
            signos.includes(partes[i + 1])
        ) {
            return "#ERROR!";
        }
    }

    if (
        nivelParentesis != 0 ||
        partes.length == 0 ||
        signos.includes(partes[0]) ||
        signos.includes(partes[partes.length - 1])
    ) {
        return "#ERROR!";
    }

    let resultadoParentesis = hacerCuentasEntreParentesis(partes);

    if (resultadoParentesis == "#DIV/0!") {
        return "#DIV/0!";
    }

    let resultadoMultiplicar = hacerMultiplicacionYDivision(partes);

    if (resultadoMultiplicar == "#DIV/0!") {
        return "#DIV/0!";
    }

    let resultado = hacerSumaYResta(partes);

    if (isNaN(resultado)) {
        return "#ERROR!";
    }

    return resultado;
}