//Variables
const logoOverhaul = "../Imagenes/logoOverhaul.png";
const formularioServicio = document.getElementById("formularioDeServicio");
const selectNombreCliente = document.getElementById("NombreCliente");
const nombrePersonalCliente = document.getElementById("NombrePersona");
const direccionCliente = document.getElementById("DireccionCliente");
const numeroTelefono = document.getElementById("NumeroTelefono");
const ciudadAtendida = document.getElementById("Ciudad");
const numeroBodega = document.getElementById("NumeroBodega");
const botonAgregarInsumos = document.getElementById("agregarInsumo");
const cuerpoTablaInsumos = document.getElementById("tablaInsumosPreventivo");
const selectTipoServicio = document.getElementById("tipoServicio");
const observaciones = document.getElementById("Observaciones");
const pendientes = document.getElementById("Pendientes");
const nombreTecnico = document.getElementById("nombreTecnico");
const nombreRecibe = document.getElementById("nombreRecibe");
const firmaTecnico = document.getElementById("firmaTecnico");
const firmaCliente = document.getElementById("firmaRecibe");

// Datos del equipo y tiempos (seleccionados por Id)
const marca = document.getElementById("Marca");
const modelo = document.getElementById("Modelo");
const serie = document.getElementById("serie");
const horometro = document.getElementById("Horometro");
const anioFabricacion = document.getElementById("año");
const fecha = document.getElementById("fecha");
const horaInicio = document.getElementById("time-inicial");
const horaFinalizacion = document.getElementById("time-final");
const consecutivo = document.getElementById("numeroConsecutivo");
//Crear contexto de dibujo
const ctxTecnico = firmaTecnico.getContext("2d");
const ctxCliente = firmaCliente.getContext("2d");

// boton borrar firma
const borrarFirmaTecnico = document.getElementById("eliminarFirmaTecnico");
const borrarFirmaCliente = document.getElementById("eliminarFirmaCliente");
const paresFotos = [
  ["fotoMontacarga", "contenedorFotosMontacarga"],
  ["fotoCargador", "contenedorFotosCargador"],
  ["fotoBateria", "contenedorFotosBateria"],
  ["fotoMontacargaRetiro", "contenedorFotosMontacargaRetiro"],
  ["fotoCargadorRetiro", "contenedorFotosCargadorRetiro"],
  ["fotoBateriaRetiro", "contenedorFotosBateriaRetiro"],
  ["fotoRepuestosPreventivo", "contenedorFotosRepuestosPreventivos"],
  ["fotoRepuestosCorrectivo", "contenedorFotosRepuestosCorrectivo"],
];
//Map para no escribir 16 lineas de codigo
const configuracionFotos = paresFotos.map(([inputId, contenedorId]) => ({
  input: document.getElementById(inputId),
  contenedor: document.getElementById(contenedorId),
}));

// Secciones principales
const secciones = [
  { value: 1, seccion: document.getElementById("correctivo") },
  { value: 2, seccion: document.getElementById("preventivo") },
  { value: 3, seccion: document.getElementById("diagnostico") },
  { value: 4, seccion: document.getElementById("entrega") },
  { value: 5, seccion: document.getElementById("retiro") },
];

// Arrays para almacenar fotos en base64
let reportesFotograficos64 = {}; // Array para guardar las fotos del montacarga en base 64
//variables para mostrar json
let listaClientes = [];
let listaInsumos = [];
//Peticion Fetch
fetch("./datosMantenimiento.json")
  .then((response) => response.json())
  .then((datos) => {
    listaClientes = datos.clientes;
    listaInsumos = datos.insumos;
    crearElementos(listaClientes);
  })
  .catch((error) => {
    console.error("Error cargando los datos:", error);
  });

//Funcion para crear elemento de clientes y autollenado de campo
function crearElementos(data) {
  const optionDefault = document.createElement("option");
  optionDefault.value = 0;
  optionDefault.setAttribute("disabled", true);
  optionDefault.setAttribute("selected", true);
  optionDefault.textContent = "Selecciona una cliente";
  selectNombreCliente.appendChild(optionDefault);
  data.forEach((element) => {
    const option = document.createElement("option");
    option.value = element.id;
    option.textContent = element.nombre;
    selectNombreCliente.appendChild(option);
  });
}

//Funcion para mostar una url temporal de previsualizacion de imagenes
function procesarFotos(ContenedorFotos, InputFoto) {
  // 1. Limpiamos el contenedor antes de empezar, esto con el fin de que si
  // hay mas fotos, no se acumulen en el contenedor,
  // sino que se reemplacen por las nuevas fotos seleccionadas
  ContenedorFotos.innerHTML = "";

  // Creamos el for para que itere en todas las fotos
  for (let foto of InputFoto.files) {
    // 2. Creamos un nuevo elemento de imagen para cada foto seleccionada,
    // y le asignamos la URL de la foto utilizando URL
    const nuevaFoto = document.createElement("img");
    nuevaFoto.src = URL.createObjectURL(foto);

    // 3. Estilizamos las fotos para que se vean bien en el contenedor
    nuevaFoto.style.width = "200px";
    nuevaFoto.style.height = "200px";
    nuevaFoto.style.objectFit = "cover";
    nuevaFoto.style.margin = "10px";
    nuevaFoto.style.justifyContent = "center";

    // 4. Agregamos la nueva foto al contenedor
    ContenedorFotos.appendChild(nuevaFoto);
  }
}
//Funcion para crear imagenes en base 64
function convertirBase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      resolve(lector.result);
    };
    lector.onerror = (error) => {
      reject(error);
    };

    lector.readAsDataURL(archivo);
  });
}
// Función para empezar el trazo
function EmpezarTrazo(valor, evento) {
  valor.beginPath();
  valor.moveTo(evento.offsetX, evento.offsetY);
}

// Función para mover el trazo
function MoverTrazo(valor, evento, color) {
  valor.lineTo(evento.offsetX, evento.offsetY);
  valor.strokeStyle = `${color}`;
  valor.lineWidth = 3;
  valor.lineCap = "round"; // Hace que las puntas de las líneas sean redondas
  valor.lineJoin = "round"; // Hace que las esquinas donde se unen las líneas sean curvas
  valor.stroke();
}

// Función para eliminar trazo
function eliminarTrazo(contexto, valor) {
  contexto.clearRect(0, 0, valor.width, valor.height);
}

// ========================================
//FUNCION - FIRMA TÉCNICO
// ========================================
function activarCanvas(canvas, ctx, botonBorrar, color = "black") {
  let estaDibujando = false;
  canvas.addEventListener("mousedown", function (e) {
    estaDibujando = true;
    EmpezarTrazo(ctx, e);
  });
  canvas.addEventListener("mousemove", function (e) {
    if (estaDibujando === true) {
      MoverTrazo(ctx, e, color);
    }
  });
  canvas.addEventListener("mouseup", function (e) {
    estaDibujando = false;
  });
  canvas.addEventListener("mouseleave", function (e) {
    estaDibujando = false;
  });
  botonBorrar.addEventListener("click", (e) => {
    eliminarTrazo(ctx, canvas);
  });
}

activarCanvas(firmaTecnico, ctxTecnico, borrarFirmaTecnico, "red");
activarCanvas(firmaCliente, ctxCliente, borrarFirmaCliente, "blue");

function obtenerFirmas64(firmaTec, firmaClie, objeto) {
  let base64FirmaTecnico = firmaTec.toDataURL("image/png");
  let base64FirmaCliente = firmaClie.toDataURL("image/png");
  objeto["FirmaCliente"] = base64FirmaCliente;
  objeto["FirmaTecnico"] = base64FirmaTecnico;
}
function extraerTextoSelect(elementoSelect) {
  return elementoSelect.options[elementoSelect.selectedIndex].textContent;
}

function empaquetarArrayInsumos() {
  const filaInsumos = document.querySelectorAll(".fila-insumo");
  let arrayInsumosMto = [];
  //forEach para atrapar cada fila de insumos
  filaInsumos.forEach((fila) => {
    let insumoTemporal = {}; // Creamos un objeto vacío solo para esta fila
    // 3. Buscamos los elementos DENTRO de esta fila usando sus clases
    let selectNombre = fila.querySelector(".insumo");
    let inputCantidad = fila.querySelector(".cantidad");
    let selectMedida = fila.querySelector(".Medidainsumo");

    insumoTemporal.nombre = extraerTextoSelect(selectNombre);
    insumoTemporal.cantidad = inputCantidad.value;
    insumoTemporal.medida = extraerTextoSelect(selectMedida);

    arrayInsumosMto.push(insumoTemporal);
  });
  return arrayInsumosMto;
}

function empaquetarDatos() {
  let arrayInsumos = empaquetarArrayInsumos();
  let arrayEmpaquetadoFieldsetInterno = [];
  let reporteFinal = {};
  for (let seccion of secciones) {
    if (seccion.seccion.style.display === "block") {
      arrayEmpaquetadoFieldsetInterno = [
        ...seccion.seccion.querySelectorAll("input, select, textarea"),
      ];
      break;
    }
  }
  arrayEmpaquetadoFieldsetInterno.forEach((elemento) => {
    if (elemento.tagName === "SELECT") {
      reporteFinal[elemento.id] = extraerTextoSelect(elemento);
    } else {
      reporteFinal[elemento.id] = elemento.value;
    }
  });
  reporteFinal.nombreCliente = extraerTextoSelect(selectNombreCliente);
  reporteFinal.direccionCliente = direccionCliente.value;
  reporteFinal.numeroTelefonoCliente = numeroTelefono.value;
  reporteFinal.ciudad = ciudadAtendida.value;
  reporteFinal.numeroBodega = numeroBodega.value;
  reporteFinal.tipoServicio = extraerTextoSelect(selectTipoServicio);
  reporteFinal.evidenciaGrafica = reportesFotograficos64;
  reporteFinal.observaciones = observaciones.value;
  reporteFinal.pendientes = pendientes.value;
  reporteFinal.nombreTecnico = nombreTecnico.value;
  reporteFinal.nombreRecibe = nombreRecibe.value;
  reporteFinal.marca = extraerTextoSelect(marca);
  reporteFinal.modelo = modelo.value;
  reporteFinal.serie = serie.value;
  reporteFinal.horometro = horometro.value;
  reporteFinal.añoFabricacion = anioFabricacion.value;
  reporteFinal.fecha = fecha.value;
  reporteFinal.horaInicio = horaInicio.value;
  reporteFinal.horaFinalizacion = horaFinalizacion.value;
  reporteFinal.consecutivo = consecutivo.value;
  reporteFinal.insumos = arrayInsumos;
  return reporteFinal;
}

function generarPDF(datosEmpaquetados) {
  let hojaDeTrabajo = new jspdf.jsPDF();
  if (datosEmpaquetados.tipoServicio === "Mantenimiento Correctivo") {
    dibujarFormatoCorrectivo(hojaDeTrabajo, datosEmpaquetados);
  } else if (datosEmpaquetados.tipoServicio === "Mantenimiento Preventivo") {
    dibujarFormatoPreventivo(hojaDeTrabajo, datosEmpaquetados);
  } else if (datosEmpaquetados.tipoServicio === "Entrega de equipo") {
    dibujarFormatoEntrega(hojaDeTrabajo, datosEmpaquetados);
  } else {
    dibujarFormatoRetiro(hojaDeTrabajo, datosEmpaquetados);
  }
  hojaDeTrabajo.save("Hoja de trabajo.pdf");
}

function dibujarEncabezadoGlobal(documento, datos) {
  //Encabezdo inicio
  let padding1 = 62;
  let padding2 = 152;
  documento.setFontSize(10);
  documento.rect(10, 10, 190, 30, "S");
  documento.addImage(logoOverhaul, "PNG", 13, 13, 44, 24);
  documento.line(60, 10, 60, 40);
  documento.text(`Nombre cliente:${datos.nombreCliente}`, padding1, 16);
  documento.line(60, 20, 150, 20);
  documento.text(`Tipo de servicio:${datos.tipoServicio}`, padding1, 26);
  documento.line(60, 30, 150, 30);
  documento.text(`Ticket de servicio:`, padding1, 36);
  documento.line(150, 10, 150, 40);
  documento.text(`Hora inicio:${datos.horaInicio}`, padding2, 16);
  documento.line(150, 20, 200, 20);
  documento.text(`Hora fin:${datos.horaFinalizacion}`, padding2, 26);
  documento.line(150, 30, 200, 30);
  documento.text(`Numero de hoja:${datos.consecutivo}`, padding2, 36);
  //Encabezado final

  //segunda parte encabezado incio
  let paddingFila1 = 56;
  let paddingFila2 = 72;
  documento.rect(10, 50, 190, 35, "S");
  documento.line(10, 65, 200, 65);
  documento.line(50, 50, 50, 85);
  documento.line(90, 50, 90, 85);
  documento.line(130, 50, 130, 85);
  documento.line(170, 50, 170, 85);
  documento.text(`Nombre contacto:${datos.nombreRecibe}`, 12, paddingFila1, {
    maxWidth: 35,
  });
  documento.text(`Dirección:${datos.direccionCliente}`, 12, paddingFila2, {
    maxWidth: 35,
  });
  documento.text(`Ciudad:${datos.ciudad}`, 52, paddingFila1);
  documento.text(`Fecha:${datos.fecha}`, 52, paddingFila2);
  documento.text(`Marca Montacarga:${datos.marca}`, 92, paddingFila1, {
    maxWidth: 35,
  });
  documento.text(`Modelo:${datos.modelo}`, 92, paddingFila2);
  documento.text(`Serie:${datos.serie}`, 132, paddingFila1);
  documento.text(`Año:${datos.añoFabricacion}`, 132, paddingFila2);
  documento.text(`Bodega:${datos.numeroBodega}`, 172, paddingFila1, {
    maxWidth: 25,
  });
  documento.text(`Horometro:${datos.horometro}`, 172, paddingFila2, {
    maxWidth: 25,
  });
  return 95;
}

function dibujarObservacionesPendientes(documento, datos, Y) {
  let yInicialEncabeObs = Y + 10;
  let alturaEncabeObs = 10;
  let alturaEncabePendi = 10;
  let alturaObs = 30;
  let yInicialObs = yInicialEncabeObs + alturaEncabeObs + 5;
  let yInicialEncabePendi = yInicialObs + alturaObs;
  let yInicialPendi = yInicialEncabePendi + alturaEncabePendi + 5;
  let yInicialFirmas = yInicialPendi + alturaObs;

  documento.rect(10, yInicialEncabeObs, 190, alturaEncabeObs, "S");
  documento.text("Trabajo realizado", 12, yInicialEncabeObs + 6);
  documento.rect(10, yInicialObs, 190, alturaObs, "S");
  documento.text(datos.observaciones, 12, yInicialObs + 6, { maxWidth: 170 });
  documento.rect(10, yInicialEncabePendi, 190, alturaEncabePendi, "S");
  documento.text("Pendientes", 12, yInicialEncabePendi + 6);
  documento.rect(10, yInicialPendi, 190, alturaObs);
  documento.text(datos.pendientes, 12, yInicialPendi + 6, { maxWidth: 170 });

  return yInicialFirmas;
}

function dibujarFirmas(documento, datos, yIncialFirmas) {
  let posicionYinicialFirmas = yIncialFirmas + 20;
  documento.line(10, posicionYinicialFirmas, 80, posicionYinicialFirmas);
  documento.text(datos.nombreTecnico, 10, posicionYinicialFirmas + 3);
  documento.line(100, posicionYinicialFirmas, 180, posicionYinicialFirmas);
  documento.text(datos.nombreRecibe, 100, posicionYinicialFirmas + 3);
  //documento.addImage(imagen, formato, x, y, ancho, alto).
  //documento.addImage(datos.evidenciaGrafica.FirmaTecnico, "PNG", 10, 0, 70, 30);
  //documento.addImage(
  //datos.evidenciaGrafica.FirmaCliente,
  //"PNG",
  //100,
  //70,
  //70,
  //30,
  //);
}

function dibujarFormatoCorrectivo(documento, datos) {
  let coordenadaYinicio = dibujarEncabezadoGlobal(documento, datos);
}

function dibujarFormatoPreventivo(documento, datos) {
  //Tabla preventivo
  let coordenadaYinicio = dibujarEncabezadoGlobal(documento, datos); //95
  let puntoYiniciotablaInspeccion = 105;
  let alturaCasilla = 10;

  let itemsInspeccion = [
    { item: "Estado de la batería", estado: datos.estadoBateriaPreventivo },
    { item: "Nivel de electrolito", estado: datos.estadoElectrolitoPreventivo },
    {
      item: "Nivel de aceite hidraulico",
      estado: datos.nivelAceiteHidraulicoPreventivo,
    },
    {
      item: "Estado de aceite hidraulico",
      estado: datos.estadoAceiteHidraulicoPreventivo,
    },
    {
      item: "¿Fugas de aceite presentadas?",
      estado: datos.fugasAceite,
      obs: datos.observacionesFugas,
    },
    {
      item: "Estado de mangueras",
      estado: datos.estadoMangueras,
      obs: datos.observacionesMangueras,
    },
    {
      item: "Estado cilindros",
      estado: datos.estadoCilindros,
      obs: datos.observacionesCilindros,
    },
    { item: "Estado deslizadores de carro", estado: datos.estadoDeslizadores },
    { item: "Estado de cadenas", estado: datos.estadoCadenas },
    { item: "Estado de ruedas", estado: datos.estadoRuedas },
    { item: "Estado de frenos", estado: datos.estadoFrenos },
    {
      item: "Funcionamiento de horometro",
      estado: datos.funcionamientoHorometro,
    },
    {
      item: "Indicador de descarga",
      estado: datos.funcionamientoIndicadorDescarga,
    },
    { item: "Funcionamiento bocina", estado: datos.funcionamientoBocina },
    { item: "Funcionamiento luces", estado: datos.funcionamientoLuces },
    {
      item: "Funcionamiento Joystick",
      estado: datos.funcionamientoJoystick,
      obs: datos.observacionesJoystick,
    },
    {
      item: "Funcionamiento hombre muerto",
      estado: datos.funcionamientoHombreMuerto,
    },
    {
      item: "Funcionamiento paro de emergencia",
      estado: datos.funcionamientoParoEmergencia,
    },
  ];
  let altoTabla = itemsInspeccion.length * alturaCasilla;

  documento.rect(10, coordenadaYinicio, 190, 10, "S");
  documento.line(73, coordenadaYinicio, 73, 105);
  documento.line(133, coordenadaYinicio, 133, 105);
  documento.text(`Item a inspeccionar`, 12, coordenadaYinicio + 6);
  documento.text(`Estado`, 75, coordenadaYinicio + 6);
  documento.text("Observaciones", 136, coordenadaYinicio + 6);
  documento.rect(10, coordenadaYinicio + 10, 190, altoTabla, "S");

  documento.line(
    73,
    puntoYiniciotablaInspeccion,
    73,
    puntoYiniciotablaInspeccion + altoTabla,
  );
  documento.line(
    133,
    puntoYiniciotablaInspeccion,
    133,
    puntoYiniciotablaInspeccion + altoTabla,
  );

  itemsInspeccion.forEach((item) => {
    documento.line(
      10,
      puntoYiniciotablaInspeccion,
      200,
      puntoYiniciotablaInspeccion,
    );
    documento.text(item.item, 12, puntoYiniciotablaInspeccion + 6);
    documento.text(item.estado, 75, puntoYiniciotablaInspeccion + 6);
    if (item.obs) {
      documento.text(item.obs, 136, puntoYiniciotablaInspeccion + 6, {
        maxWidth: 60,
      });
    }
    puntoYiniciotablaInspeccion += alturaCasilla;
  });
  documento.addPage();
  let puntoYinicioEncabezadoInsumos = 10;
  let puntoYinicioCuerpoInsumos = 20;
  //alturaCasilla=10;
  let altoTablaInsumos = datos.insumos.length * alturaCasilla;
  //Tabla insumos(Encabezado)
  documento.rect(10, puntoYinicioEncabezadoInsumos, 70, alturaCasilla, "S");
  documento.line(40, puntoYinicioEncabezadoInsumos, 40, 20);
  documento.line(60, puntoYinicioEncabezadoInsumos, 60, 20);
  documento.text(`Insumo`, 12, puntoYinicioEncabezadoInsumos + 6);
  documento.text(`Cantidad`, 42, puntoYinicioEncabezadoInsumos + 6);
  documento.text(`Medida`, 62, puntoYinicioEncabezadoInsumos + 6);
  //Tabla insumos(Cuerpo)
  documento.rect(10, puntoYinicioCuerpoInsumos, 70, altoTablaInsumos, "S");
  documento.line(
    40,
    puntoYinicioCuerpoInsumos,
    40,
    puntoYinicioCuerpoInsumos + altoTablaInsumos,
  );
  documento.line(
    60,
    puntoYinicioCuerpoInsumos,
    60,
    puntoYinicioCuerpoInsumos + altoTablaInsumos,
  );
  datos.insumos.forEach((insumo) => {
    documento.line(
      10,
      puntoYinicioCuerpoInsumos + alturaCasilla,
      80,
      puntoYinicioCuerpoInsumos + alturaCasilla,
    );
    documento.text(insumo.nombre, 12, puntoYinicioCuerpoInsumos + 6, {
      maxWidth: 20,
    });
    documento.text(insumo.cantidad, 42, puntoYinicioCuerpoInsumos + 6);
    documento.text(insumo.medida, 62, puntoYinicioCuerpoInsumos + 6);
    puntoYinicioCuerpoInsumos += alturaCasilla;
  });
  let coordenadaInicialYfirmas = dibujarObservacionesPendientes(
    documento,
    datos,
    puntoYinicioCuerpoInsumos,
  );
  //Seccion observaciones y firmas
  dibujarFirmas(documento, datos, coordenadaInicialYfirmas);
}

function dibujarFormatoEntrega(documento, datos) {
  documento.text("Entrega", 20, 30);
}

function dibujarFormatoRetiro(documento, datos) {
  documento.text("Retiro", 20, 30);
}

selectNombreCliente.addEventListener("change", (event) => {
  const clienteSeleccionado = listaClientes.find((i) => {
    return i.id == parseInt(selectNombreCliente.value);
  });
  //console.log(selectNombreCliente.value);
  //console.log(clienteSeleccionado.nombre);
  direccionCliente.value = clienteSeleccionado.direccion;
  numeroTelefono.value = clienteSeleccionado.numeroTelefonico;
});
//Escuchador para leida de fectch y llenado de select insumos
botonAgregarInsumos.addEventListener("click", (event) => {
  let opcionesHTML =
    '<option value="0" disabled selected>Selecciona un insumo</option>';
  listaInsumos.forEach((insumo) => {
    opcionesHTML += `<option value="${insumo.id}">${insumo.nombre}</option>`;
  });
  cuerpoTablaInsumos.insertAdjacentHTML(
    "beforeend",
    `
            <tr class="fila-insumo">
                <td>
                    <select name="insumo" class="insumo">
                        ${opcionesHTML}
                    </select>
                </td>
                <td>
                    <input type="number" class="cantidad" value="2" min="0" max="20">
                </td>
                <td>
                    <select name="medida" class="Medidainsumo">
                        <option value="0" disabled selected>Selecciona una medida</option>
                        <option value="litros" name="Litros">Litros</option>
                        <option value="bolsa" name="bolsa">Bolsa</option>
                    </select>
                </td>
            </tr>
    `,
  );
});

//evento para activar las secciones
selectTipoServicio.addEventListener("change", (event) => {
  const valor = parseInt(event.target.value);
  secciones.forEach((i) => {
    i.seccion.style.display = "none";
    if (valor === i.value) {
      i.seccion.style.display = "block";
    }
  });
});
// Evento para mostrar la foto subida por el tecnico dependiendo del modelo seleccionado
for (let par of configuracionFotos) {
  if (par.input && par.contenedor) {
    par.input.addEventListener("change", function (e) {
      let idEvento = e.target.id;
      procesarFotos(par.contenedor, par.input);
      // for para que la promesa ejecute cada imagen subida al los inputs
      for (let foto of par.input.files) {
        convertirBase64(foto)
          .then((base) => {
            if (!reportesFotograficos64[idEvento]) {
              reportesFotograficos64[idEvento] = [];
            }
            reportesFotograficos64[idEvento].push(base);
          })
          .catch((error) => {
            console.error("error", error);
          });
      }
    });
  }
}

let arrayFieldsetInterno = [];
//Escuchador para el envio del formulario
formularioServicio.addEventListener("submit", (e) => {
  e.preventDefault();
  //Funcion para obtener firmas en imagen
  obtenerFirmas64(firmaTecnico, firmaCliente, reportesFotograficos64);

  //console.log(selectTipoServicio.value);
  let arrayFieldset = [
    ...formularioServicio.getElementsByClassName("contenedor-global"),
  ];
  //console.log(arrayFieldset);
  let valorElegido = parseInt(selectTipoServicio.value);
  let objetoEncontrado = secciones.find((v) => v.value === valorElegido);
  objetoEncontrado
    ? arrayFieldset.push(objetoEncontrado.seccion)
    : console.error("error");
  let formularioValido = true;
  arrayFieldset.forEach((campos) => {
    let arrayFieldsetInterno = [
      ...campos.querySelectorAll("input, select, textarea"),
    ];
    arrayFieldsetInterno.forEach((elementos) => {
      if (elementos.value.trim() === "" || elementos.value === "0") {
        formularioValido = false;
        elementos.style.border = "1px solid red";
      }
    });
  });
  if (formularioValido) {
    console.log("¡Formulario 100% validado y listo para empaquetar!");

    let paqueteFinal = empaquetarDatos();
    console.log(paqueteFinal);
    generarPDF(paqueteFinal);
  } else {
    alert("Por favor llena todos los campos");
  }
});
