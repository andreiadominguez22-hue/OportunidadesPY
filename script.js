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

function mostrarOportunidades(listaOportunidades = oportunidades) {
	const seccionDestacadas = document.querySelector("#destacadas");
	const articulosExistentes = seccionDestacadas.querySelectorAll("article");

	articulosExistentes.forEach(function (articulo) {
		articulo.remove();
	});

	if (listaOportunidades.length === 0) {
		const mensajeSinResultados = document.createElement("p");
		mensajeSinResultados.textContent = "No encontramos oportunidades con esos criterios. Probá cambiar los filtros o la búsqueda.";
		seccionDestacadas.appendChild(mensajeSinResultados);
		return;
	}

	listaOportunidades.forEach(function (oportunidad) {
		const articulo = document.createElement("article");
		const mensajeEstado = estaVencida(oportunidad.fechaLimiteISO)
			? "<small class=\"estado-cerrada\">Oportunidad cerrada</small>"
			: "";

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

		return coincideConTexto
			&& coincideConCategoria
			&& coincideConModalidad
			&& coincideConCosto;
	});

		mostrarOportunidades(oportunidadesFiltradas);
	});
}

if (document.querySelector("#destacadas")) {
	mostrarOportunidades();
}
