console.log(oportunidades[0].titulo);

function estaVencida(fechaISO) {
	if (!fechaISO) {
		return false;
	}

	const partesFecha = fechaISO.split("-").map(Number);
	const fechaLimite = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
	const fechaActual = new Date();

	fechaLimite.setHours(0, 0, 0, 0);
	fechaActual.setHours(0, 0, 0, 0);

	return fechaLimite.getTime() < fechaActual.getTime();
}

function obtenerFechaLimiteValida(fechaISO) {
	if (!fechaISO || !/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
		return null;
	}

	const partesFecha = fechaISO.split("-").map(Number);
	const fechaLimite = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);

	if (
		fechaLimite.getFullYear() !== partesFecha[0]
		|| fechaLimite.getMonth() !== partesFecha[1] - 1
		|| fechaLimite.getDate() !== partesFecha[2]
	) {
		return null;
	}

	return fechaLimite.getTime();
}

function mostrarOportunidades(listaOportunidades = oportunidades) {
	const seccionDestacadas = document.querySelector("#destacadas");
	const articulosExistentes = seccionDestacadas.querySelectorAll("article");

	articulosExistentes.forEach(function (articulo) {
		articulo.remove();
	});

	const mensajeAnterior = seccionDestacadas.querySelector(".mensaje-sin-resultados");
	if (mensajeAnterior) {
		mensajeAnterior.remove();
	}

	if (listaOportunidades.length === 0) {
		const mensajeSinResultados = document.createElement("p");
		mensajeSinResultados.classList.add("mensaje-sin-resultados");
		mensajeSinResultados.textContent = "No encontramos oportunidades con esos criterios. Probá cambiar los filtros o la búsqueda.";
		seccionDestacadas.appendChild(mensajeSinResultados);
		return;
	}

	listaOportunidades.forEach(function (oportunidad) {
		const articulo = document.createElement("article");
		const oportunidadEstaVencida = estaVencida(oportunidad.fechaLimiteISO);

const mensajeEstado = oportunidadEstaVencida
	? "<small class=\"estado-cerrada\">Postulación cerrada</small>"
	: "<small class=\"estado-abierta\">Postulación abierta</small>";

if (oportunidadEstaVencida) {
	articulo.classList.add("oportunidad-cerrada");
} else {
	articulo.classList.add("oportunidad-abierta");
}

		articulo.innerHTML = `
			<span class="categoria">${oportunidad.categoria}</span>
			<h3>${oportunidad.titulo}</h3>
			<p class="organizacion">${oportunidad.organizacion}</p>
			${mensajeEstado}
			<p class="descripcion">${oportunidad.descripcion}</p>
			<p class="fecha-limite">Fecha límite: ${oportunidad.fechaLimite}</p>
			<a href="oportunidad.html?id=${oportunidad.id}" target="_blank" rel="noopener noreferrer">Ver oportunidad →</a>
		`;

		seccionDestacadas.appendChild(articulo);
	});
}

const formularioBusqueda = document.querySelector("#explorar form");
const campoPalabrasClave = document.querySelector("#palabras-clave");
const campoCategoria = document.querySelector("#categoria");
const campoModalidad = document.querySelector("#modalidad");
const campoCosto = document.querySelector("#costo");
const campoEstado = document.querySelector("#estado");
const campoOrdenar = document.querySelector("#ordenar");
const categoriaDesdeURL = new URLSearchParams(window.location.search).get("categoria");

function normalizarTexto(texto) {
	return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

if (formularioBusqueda) {
	formularioBusqueda.addEventListener("submit", function (evento) {
	evento.preventDefault();

	const textoBuscado = normalizarTexto(campoPalabrasClave.value);
	const categoriaSeleccionada = normalizarTexto(campoCategoria.value);
	const modalidadSeleccionada = normalizarTexto(campoModalidad.value);
	const costoSeleccionado = normalizarTexto(campoCosto.value);
	const estadoSeleccionado = campoEstado
		? normalizarTexto(campoEstado.value)
		: "todas";
	const ordenarSeleccionado = campoOrdenar
		? normalizarTexto(campoOrdenar.value)
		: "predeterminado";
	const oportunidadesFiltradas = oportunidades.filter(function (oportunidad) {
		const coincideConTexto = normalizarTexto(oportunidad.titulo).includes(textoBuscado)
			|| normalizarTexto(oportunidad.organizacion).includes(textoBuscado)
			|| normalizarTexto(oportunidad.categoria).includes(textoBuscado)
			|| normalizarTexto(oportunidad.descripcion).includes(textoBuscado);
		const coincideConCategoria = categoriaSeleccionada === "todas"
			|| normalizarTexto(oportunidad.categoria) === categoriaSeleccionada;
		const coincideConModalidad = modalidadSeleccionada === "todas"
			|| normalizarTexto(oportunidad.modalidad) === modalidadSeleccionada;
		const costoOportunidad = normalizarTexto(oportunidad.costo);
		const esGratuita = costoOportunidad === "gratuito"
			|| costoOportunidad === "sin costo";
		const coincideConCosto = costoSeleccionado === "todas"
			|| (costoSeleccionado === "gratuitas" && esGratuita)
			|| (costoSeleccionado === "con-costo" && !esGratuita);
		const oportunidadEstaVencida = estaVencida(oportunidad.fechaLimiteISO);
		const coincideConEstado = estadoSeleccionado === "todas"
			|| (estadoSeleccionado === "abiertas" && !oportunidadEstaVencida)
			|| (estadoSeleccionado === "cerradas" && oportunidadEstaVencida);

		return coincideConTexto
			&& coincideConCategoria
			&& coincideConModalidad
			&& coincideConCosto
			&& coincideConEstado;
	});
	const oportunidadesOrdenadas = oportunidadesFiltradas.slice();

	if (ordenarSeleccionado === "fecha-proxima" || ordenarSeleccionado === "fecha-lejana") {
		oportunidadesOrdenadas.sort(function (primera, segunda) {
			const fechaPrimera = obtenerFechaLimiteValida(primera.fechaLimiteISO);
			const fechaSegunda = obtenerFechaLimiteValida(segunda.fechaLimiteISO);

			if (fechaPrimera === null && fechaSegunda === null) {
				return 0;
			}
			if (fechaPrimera === null) {
				return 1;
			}
			if (fechaSegunda === null) {
				return -1;
			}

			return ordenarSeleccionado === "fecha-proxima"
				? fechaPrimera - fechaSegunda
				: fechaSegunda - fechaPrimera;
		});
	} else if (ordenarSeleccionado === "alfabetico") {
		oportunidadesOrdenadas.sort(function (primera, segunda) {
			const tituloPrimero = normalizarTexto(primera.titulo);
			const tituloSegundo = normalizarTexto(segunda.titulo);

			if (tituloPrimero < tituloSegundo) {
				return -1;
			}
			if (tituloPrimero > tituloSegundo) {
				return 1;
			}
			return 0;
		});
	}

		mostrarOportunidades(oportunidadesOrdenadas);
	});
}

if (document.querySelector("#destacadas")) {
    const categoriaValida = Array.from(campoCategoria.options).some(function (opcion) {
        return opcion.value === categoriaDesdeURL;
    });

    if (categoriaValida && formularioBusqueda) {
        campoCategoria.value = categoriaDesdeURL;
        formularioBusqueda.dispatchEvent(new Event("submit", {
            bubbles: true,
            cancelable: true
        }));
    } else {
        mostrarOportunidades();
    }
}
