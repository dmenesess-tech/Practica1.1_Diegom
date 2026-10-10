function guardarExcel() {
    localStorage.setItem("hojaClara", JSON.stringify(celdas));
}

function cargarExcel() {
    let textoGuardado = localStorage.getItem("hojaClara");

    if (textoGuardado == null) {
        return;
    }

    let celdasGuardadas = JSON.parse(textoGuardado);

    for (let nombre in celdasGuardadas) {
        let celda = celdasGuardadas[nombre];

        celda.celdasQueUsa = celda.celdasQueUsa || celda.dependencias || [];
        celda.celdasQueLaUsan = celda.celdasQueLaUsan || celda.dependientes || [];
    }

    Object.assign(celdas, celdasGuardadas);

    for (let nombre in celdas) {
        document.getElementById(nombre).textContent = mostrarValor(nombre);
        pintarNumeroNegativo(nombre);
    }
}