//Variables
const logoOverhaul="../Imagenes/logoOverhaul.png";
const formularioServicio= document.getElementById("formularioDeServicio")
const selectNombreCliente= document.getElementById("NombreCliente");
const nombrePersonalCliente= document.getElementById("NombrePersona");
const direccionCliente= document.getElementById("DireccionCliente");
const numeroTelefono= document.getElementById("NumeroTelefono");
const ciudadAtendida= document.getElementById("Ciudad");
const numeroBodega= document.getElementById("NumeroBodega");
const botonAgregarInsumos= document.getElementById("agregarInsumo");
const cuerpoTablaInsumos=document.getElementById("tablaInsumosPreventivo");
const selectTipoServicio= document.getElementById("tipoServicio");
const observaciones= document.getElementById("Observaciones");
const pendientes= document.getElementById("Pendientes");
const nombreTecnico= document.getElementById("nombreTecnico");
const nombreRecibe= document.getElementById("nombreRecibe");
const firmaTecnico = document.getElementById("firmaTecnico");
const firmaCliente= document.getElementById("firmaRecibe");
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
const ctxCliente= firmaCliente.getContext("2d");

// boton borrar firma 
const borrarFirmaTecnico= document.getElementById("eliminarFirmaTecnico");
const borrarFirmaCliente= document.getElementById("eliminarFirmaCliente");
const paresFotos = [
    ["fotoMontacarga", "contenedorFotosMontacarga"],
    ["fotoCargador", "contenedorFotosCargador"],
    ["fotoBateria", "contenedorFotosBateria"],
    ["fotoMontacargaRetiro", "contenedorFotosMontacargaRetiro"],
    ["fotoCargadorRetiro", "contenedorFotosCargadorRetiro"],
    ["fotoBateriaRetiro", "contenedorFotosBateriaRetiro"],
    ["fotoRepuestosPreventivo", "contenedorFotosRepuestosPreventivos"],
    ["fotoRepuestosCorrectivo", "contenedorFotosRepuestosCorrectivo"]
];
//Map para no escribir 16 lineas de codigo
const configuracionFotos = paresFotos.map(([inputId, contenedorId]) => ({
    input: document.getElementById(inputId),
    contenedor: document.getElementById(contenedorId)
}));

// Secciones principales
 const secciones=[
    {value:1,seccion:document.getElementById("correctivo")},
    {value:2,seccion:document.getElementById("preventivo")},
    {value:3,seccion:document.getElementById("diagnostico")},
    {value:4,seccion:document.getElementById("entrega")},
    {value:5,seccion:document.getElementById("retiro")}
];

// Arrays para almacenar fotos en base64
let reportesFotograficos64 = {}; // Array para guardar las fotos del montacarga en base 64
//variables para mostrar json 
let listaClientes=[];
let listaInsumos=[];
//Peticion Fetch 
fetch("./datosMantenimiento.json")
.then((response)=> response.json())
.then((datos)=>{
  listaClientes=datos.clientes
  listaInsumos=datos.insumos;
  crearElementos(listaClientes); 
})
.catch((error)=>{
    console.error("Error cargando los datos:", error)  
})


//Funcion para crear elemento de clientes y autollenado de campo
function crearElementos(data){
const optionDefault= document.createElement("option");
    optionDefault.value=0;
    optionDefault.setAttribute("disabled",true);
    optionDefault.setAttribute("selected",true);
    optionDefault.textContent="Selecciona una cliente";
    selectNombreCliente.appendChild(optionDefault);
    data.forEach(element => {
        const option= document.createElement("option");
        option.value=element.id;
        option.textContent=element.nombre;
        selectNombreCliente.appendChild(option)
        })
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
function convertirBase64(archivo){
    return new Promise((resolve, reject) => {
        const lector= new FileReader();
            lector.onload=()=>{
            resolve(lector.result);
        
        }
            lector.onerror=(error)=>{
            reject(error);
        }
        
        lector.readAsDataURL(archivo);
    })
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
function activarCanvas(canvas,ctx,botonBorrar,color="black"){
    let estaDibujando= false;
    canvas.addEventListener("mousedown", function(e) {
    estaDibujando = true;
    EmpezarTrazo(ctx, e);
    });
    canvas.addEventListener("mousemove", function(e) {
    if (estaDibujando === true) {
        MoverTrazo(ctx, e, color);
    }
    });
    canvas.addEventListener("mouseup", function(e) {
    estaDibujando = false;
    });
    canvas.addEventListener("mouseleave", function(e) {
    estaDibujando = false;
    });
    botonBorrar.addEventListener("click", e=>{
    eliminarTrazo(ctx,canvas);
    })
    
}

activarCanvas(firmaTecnico,ctxTecnico,borrarFirmaTecnico,"red");
activarCanvas(firmaCliente, ctxCliente, borrarFirmaCliente,"blue");

function obtenerFirmas64(firmaTec,firmaClie,objeto){
    
    let base64FirmaTecnico=firmaTec.toDataURL("image/png");
    let base64FirmaCliente=firmaClie.toDataURL("image/png");
    objeto["FirmaCliente"]=base64FirmaCliente;
    objeto["FirmaTecnico"]=base64FirmaTecnico;
    
}
function extraerTextoSelect(elementoSelect) {
    return elementoSelect.options[elementoSelect.selectedIndex].textContent;
}

function empaquetarDatos(){
let arrayEmpaquetadoFieldsetInterno=[]
let reporteFinal={}
    for(let seccion of secciones){
        if(seccion.seccion.style.display === "block"){
              arrayEmpaquetadoFieldsetInterno=[...seccion.seccion.querySelectorAll("input, select, textarea")];
             break;
        }
    }
    arrayEmpaquetadoFieldsetInterno.forEach((elemento)=>{
        if(elemento.tagName==="SELECT"){
            reporteFinal[elemento.id]=extraerTextoSelect(elemento)
        }else{
            reporteFinal[elemento.id]=elemento.value;
        }
    })
    reporteFinal.nombreCliente=extraerTextoSelect(selectNombreCliente);
    reporteFinal.direccionCliente=direccionCliente.value;
    reporteFinal.numeroTelefonoCliente=numeroTelefono.value;
    reporteFinal.ciudad=ciudadAtendida.value;
    reporteFinal.numeroBodega=numeroBodega.value;
    reporteFinal.tipoServicio=extraerTextoSelect(selectTipoServicio)
    reporteFinal.evidenciaGrafica=reportesFotograficos64;
    reporteFinal.observaciones=observaciones.value;
    reporteFinal.pendientes=pendientes.value;
    reporteFinal.nombreTecnico=nombreTecnico.value;
    reporteFinal.nombreRecibe=nombreRecibe.value;
    reporteFinal.marca=extraerTextoSelect(marca);
    reporteFinal.modelo=modelo.value;
    reporteFinal.serie=serie.value;
    reporteFinal.horometro=horometro.value;
    reporteFinal.añoFabricacion=anioFabricacion.value;
    reporteFinal.fecha=fecha.value;
    reporteFinal.horaInicio=horaInicio.value;
    reporteFinal.horaFinalizacion=horaFinalizacion.value;
    reporteFinal.consecutivo=consecutivo.value;
    return reporteFinal;
}

function generarPDF(datosEmpaquetados){
    let hojaDeTrabajo= new jspdf.jsPDF();
    if (datosEmpaquetados.tipoServicio === "Mantenimiento Correctivo") {
        dibujarFormatoCorrectivo(hojaDeTrabajo, datosEmpaquetados);
    } else if (datosEmpaquetados.tipoServicio === "Mantenimiento Preventivo") {
        dibujarFormatoPreventivo(hojaDeTrabajo, datosEmpaquetados);
    }else if(datosEmpaquetados.tipoServicio === "Entrega de equipo"){
        dibujarFormatoEntrega(hojaDeTrabajo, datosEmpaquetados);
    }else{
        dibujarFormatoRetiro(hojaDeTrabajo, datosEmpaquetados);
    } 
    hojaDeTrabajo.save("Hoja de trabajo.pdf");
}

function dibujarFormatoCorrectivo(documento,datos){
    documento.text("Correctivo",20,30);
}

function dibujarFormatoPreventivo(documento,datos){
    documento.setFontSize(10);
    documento.rect(10,10,190,30,"S");
    documento.addImage(logoOverhaul,"PNG",15,12,30,25);
    documento.text(`Tipo de servicio : ${datos.tipoServicio}`,50,15);
    documento.text(`Numero de hoja`,80,15)
}

function dibujarFormatoEntrega(documento,datos){
    documento.text("Entrega",20,30);
}

function dibujarFormatoRetiro(documento,datos){
    documento.text("Retiro",20,30);
}

selectNombreCliente.addEventListener("change",(event)=>{
        const clienteSeleccionado = listaClientes.find((i)=>{
            return i.id==parseInt(selectNombreCliente.value);
        })
        //console.log(selectNombreCliente.value);
        //console.log(clienteSeleccionado.nombre);
        direccionCliente.value=clienteSeleccionado.direccion;
        numeroTelefono.value=clienteSeleccionado.numeroTelefonico;
    })
//Escuchador para leida de fectch y llenado de select insumos 
botonAgregarInsumos.addEventListener("click",(event)=>{
    let opcionesHTML='<option value="0" disabled selected>Selecciona un insumo</option>';
    listaInsumos.forEach(insumo=>{
        opcionesHTML+=`<option value="${insumo.id}">${insumo.nombre}</option>`;
    })
    cuerpoTablaInsumos.insertAdjacentHTML("beforeend", `
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
    `);
});


//evento para activar las secciones
selectTipoServicio.addEventListener("change",(event)=>{
    const valor= parseInt(event.target.value)
    secciones.forEach(i=>{
        i.seccion.style.display="none";
        if(valor === i.value){
            i.seccion.style.display="block";
        }
        })
})
// Evento para mostrar la foto subida por el tecnico dependiendo del modelo seleccionado
for (let par of configuracionFotos) {
    if(par.input && par.contenedor){
    par.input.addEventListener("change", function(e) {
        let idEvento=e.target.id
        procesarFotos(par.contenedor, par.input);
// for para que la promesa ejecute cada imagen subida al los inputs 
        for (let foto of par.input.files){
            convertirBase64(foto)
            .then((base)=>{
                if(!reportesFotograficos64[idEvento]){
                    reportesFotograficos64[idEvento] = [];
                }
                reportesFotograficos64[idEvento].push(base);
            })
            .catch((error)=>{
                console.error("error", error)
            });
        }
            
    });
    }
}

let arrayFieldsetInterno=[]
//Escuchador para el envio del formulario
formularioServicio.addEventListener("submit",(e)=>{
    e.preventDefault();
    //Funcion para obtener firmas en imagen
    obtenerFirmas64(firmaTecnico,firmaCliente,reportesFotograficos64)
    

    //console.log(selectTipoServicio.value);
    let arrayFieldset =[...formularioServicio.getElementsByClassName("contenedor-global")]
    //console.log(arrayFieldset);
    let valorElegido = parseInt(selectTipoServicio.value);
    let objetoEncontrado= secciones.find(v=> v.value === valorElegido);
    objetoEncontrado ? arrayFieldset.push(objetoEncontrado.seccion):console.error("error");
    let formularioValido=true;
    arrayFieldset.forEach(campos=>{
        let arrayFieldsetInterno=[...campos.querySelectorAll("input, select, textarea")];
        arrayFieldsetInterno.forEach(elementos=>{
            if(elementos.value.trim() ===""||elementos.value=== "0"){
                formularioValido=false;
                elementos.style.border="1px solid red";
            }
        })
    })
    if(formularioValido){
        console.log("¡Formulario 100% validado y listo para empaquetar!")
       
        let paqueteFinal = empaquetarDatos();
        generarPDF(paqueteFinal);

    }else{ 
        alert("Por favor llena todos los campos")
            
    }
    
   
})