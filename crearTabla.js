const filas = 15;
const columnas = 10;
let cuadroActivo = null;
let celdaEditando = "";

const lugarTabla = document.getElementById("cuadricula");
const tabla = document.createElement("table");
const filaTitulos = document.createElement("tr");
const esquina = document.createElement("th");

tabla.border = "1";
filaTitulos.appendChild(esquina);

for (let columna = 1; columna <= columnas; columna++) {
    let titulo = document.createElement("th");
    titulo.textContent = String.fromCharCode(64 + columna);
    filaTitulos.appendChild(titulo);
}

tabla.appendChild(filaTitulos);

for (let fila = 1; fila <= filas; fila++) {
    let filaNueva = document.createElement("tr");
    let numeroFila = document.createElement("th");
    numeroFila.textContent = fila;
    filaNueva.appendChild(numeroFila);

    for (let columna = 1; columna <= columnas; columna++) {
        let celda = document.createElement("td");
        let letra = String.fromCharCode(64 + columna);
        let nombreCelda = letra + fila;

        celda.id = nombreCelda;
        celda.tabIndex = 0;

        celdas[nombreCelda] = {
            contenido: "",
            valor: "",
            celdasQueUsa: [],
            celdasQueLaUsan: [],
            formato: "normal"
        };

        celda.addEventListener("focus", function () {
            guardarCeldaSeleccionada(nombreCelda);
        });

        celda.addEventListener("click", function () {
            if (
                cuadroActivo != null &&
                cuadroActivo.value[0] == "=" &&
                nombreCelda != celdaEditando
            ) {
                cuadroActivo.value += nombreCelda;
                cuadroActivo.focus();
            }
        });

        celda.addEventListener("keydown", function (tecla) {
            moverSeleccion(nombreCelda, tecla);
        });

        celda.addEventListener("dblclick", function () {
            let cuadroTexto = document.createElement("input");
            cuadroTexto.value = celdas[nombreCelda].contenido;
            celda.textContent = "";
            celda.appendChild(cuadroTexto);
            cuadroTexto.focus();

            cuadroActivo = cuadroTexto;
            celdaEditando = nombreCelda;

            cuadroTexto.addEventListener("keydown", function (tecla) {
                tecla.stopPropagation();

                if (tecla.key == "Enter") {
                    let nuevoContenido = cuadroTexto.value.trim();

                    guardarCambio();
                    guardarContenidoCelda(nombreCelda, nuevoContenido);

                    celda.textContent = mostrarValor(nombreCelda);
                    pintarNumeroNegativo(nombreCelda);
                    actualizarResultados(nombreCelda);
                    guardarExcel();

                    cuadroActivo = null;
                    celdaEditando = "";
                }
            });
        });

        filaNueva.appendChild(celda);
    }

    tabla.appendChild(filaNueva);
}

lugarTabla.appendChild(tabla);
cargarExcel();

function guardarContenidoCelda(nombreCelda, contenido) {
    celdas[nombreCelda].contenido = contenido;

    if (contenido[0] == "=") {
        let referencias = buscarReferencias(contenido);

        if (hayBucle(nombreCelda, referencias)) {
            guardarCeldasUsadas(nombreCelda, []);
            celdas[nombreCelda].valor = "#CIRCULAR!";
        } else {
            guardarCeldasUsadas(nombreCelda, referencias);
            celdas[nombreCelda].valor = calcularFormula(contenido);
        }
    } else if (contenido != "" && !isNaN(contenido)) {
        guardarCeldasUsadas(nombreCelda, []);
        celdas[nombreCelda].valor = Number(contenido);
    } else {
        guardarCeldasUsadas(nombreCelda, []);
        celdas[nombreCelda].valor = contenido;
    }
}