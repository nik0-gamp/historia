
const historias = document.getElementById("historias");
const agregar = document.getElementById("agregar");
const archivo = document.getElementById("archivo");

const visor = document.getElementById("visor");
const imagenHistoria = document.getElementById("imagenHistoria");
const cerrar = document.getElementById("cerrar");
const progreso = document.getElementById("progreso");

// Tiempo de duración: 24 horas
const TIEMPO_HISTORIA = 24 * 60 * 60 * 1000;

// Para probar durante 30 segundos, usa:
// const TIEMPO_HISTORIA = 30 * 1000;

let listaHistorias = JSON.parse(localStorage.getItem("historias")) || [];

let historiaActual = 0;
let intervalo = null;
let inicio = 0;
let duracionVisor = 5000;

// Eliminar historias vencidas
function eliminarVencidas() {

    let ahora = Date.now();

    listaHistorias = listaHistorias.filter(function(historia) {

        return ahora - historia.fecha < TIEMPO_HISTORIA;

    });

    guardarHistorias();

}

// Guardar historias
function guardarHistorias() {

    localStorage.setItem("historias", JSON.stringify(listaHistorias));

}

// Mostrar historias
function mostrarHistorias() {

    eliminarVencidas();

    // Eliminar historias anteriores de la pantalla
    document.querySelectorAll(".publicada").forEach(function(elemento) {
        elemento.remove();
    });

    listaHistorias.forEach(function(historia, indice) {

        let nuevaHistoria = document.createElement("div");

        nuevaHistoria.classList.add("historia", "publicada");

        nuevaHistoria.innerHTML = `
            <div class="circulo">
                <img src="${historia.imagen}">
            </div>
            <p>Mi historia</p>
        `;

        nuevaHistoria.addEventListener("click", function() {

            abrirHistoria(indice);

        });

        historias.appendChild(nuevaHistoria);

    });

}

// Abrir selector de imágenes
agregar.addEventListener("click", function() {

    archivo.click();

});

// Agregar una historia
archivo.addEventListener("change", function() {

    let imagen = archivo.files[0];

    if (!imagen) {
        return;
    }

    if (!imagen.type.startsWith("image/")) {
        alert("Selecciona una imagen válida");
        archivo.value = "";
        return;
    }

    // Leer imagen
    let lector = new FileReader();

    lector.onload = function(event) {

        let nuevaImagen = new Image();

        nuevaImagen.onload = function() {

            let ancho = nuevaImagen.width;
            let alto = nuevaImagen.height;

            // Limitar imagen a 1080 x 1920
            let escala = Math.min(1080 / ancho, 1920 / alto, 1);

            let canvas = document.createElement("canvas");

            canvas.width = Math.round(ancho * escala);
            canvas.height = Math.round(alto * escala);

            let contexto = canvas.getContext("2d");

            contexto.drawImage(
                nuevaImagen,
                0,
                0,
                canvas.width,
                canvas.height
            );

            // Convertir imagen a Base64
            let imagenBase64 = canvas.toDataURL("image/jpeg", 0.85);

            let historia = {
                imagen: imagenBase64,
                fecha: Date.now()
            };

            listaHistorias.push(historia);

            try {

                guardarHistorias();
                mostrarHistorias();

            } catch (error) {

                listaHistorias.pop();

                alert("No hay suficiente espacio para guardar la historia");

            }

            archivo.value = "";

        };

        nuevaImagen.src = event.target.result;

    };

    lector.readAsDataURL(imagen);

});

// Abrir una historia
function abrirHistoria(indice) {

    eliminarVencidas();
    mostrarHistorias();

    if (!listaHistorias[indice]) {
        return;
    }

    historiaActual = indice;

    visor.style.display = "flex";

    mostrarHistoriaActual();

}

// Mostrar imagen actual
function mostrarHistoriaActual() {

    if (historiaActual >= listaHistorias.length) {

        cerrarVisor();
        return;

    }

    imagenHistoria.src = listaHistorias[historiaActual].imagen;

    progreso.style.width = "0%";

    clearInterval(intervalo);

    inicio = Date.now();

    intervalo = setInterval(function() {

        let tiempo = Date.now() - inicio;

        let porcentaje = (tiempo / duracionVisor) * 100;

        progreso.style.width = porcentaje + "%";

        if (tiempo >= duracionVisor) {

            historiaActual++;

            mostrarHistoriaActual();

        }

    }, 50);

}

// Cerrar historias
function cerrarVisor() {

    clearInterval(intervalo);

    visor.style.display = "none";

    imagenHistoria.src = "";

}

// Botón cerrar
cerrar.addEventListener("click", cerrarVisor);

// Cerrar al pulsar fuera de la imagen
visor.addEventListener("click", function(event) {

    if (event.target === visor) {
        cerrarVisor();
    }

});

// Mostrar historias al iniciar
mostrarHistorias();
