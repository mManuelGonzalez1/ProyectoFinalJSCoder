//Variables
const selectNombreCliente= document.getElementById("NombreCliente");
const direccionCliente= document.getElementById("DireccionCliente");
const numeroTelefono= document.getElementById("NumeroTelefono");
const botonAgregarInsumos= document.getElementById("agregarInsumo");
const cuerpoTablaInsumos=document.getElementById("tablaInsumosPreventivo");
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
const selectTipoServicio= document.getElementById("tipoServicio");

// Secciones principales
 const secciones=[
    {value:1,seccion:document.getElementById("correctivo")},
    {value:2,seccion:document.getElementById("preventivo")},
    {value:3,seccion:document.getElementById("diagnostico")},
    {value:4,seccion:document.getElementById("entrega")},
    {value:5,seccion:document.getElementById("retiro")}
];

//Map para no escribir 16 lineas de codigo
const configuracionFotos = paresFotos.map(([inputId, contenedorId]) => ({
    input: document.getElementById(inputId),
    contenedor: document.getElementById(contenedorId)
}));




// Arrays para almacenar fotos en base64
let fotosMontacargaBase64 = []; // Array para guardar las fotos del montacarga en base 64
let fotosBateriaBase64 = []; // Array para guardar las fotos de bateria en base 64
let fotosCargadorBase64 = []; // Array para guardar las fotos del cargador en base 64

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
  console.log(listaInsumos); 
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
        console.log(element.id);
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




//Escuchhador para autollenado de campos
selectNombreCliente.addEventListener("change",(event)=>{
        const clienteSeleccionado = listaClientes.find((i)=>{
            return i.id==parseInt(selectNombreCliente.value);
        })
        console.log(selectNombreCliente.value);
        console.log(clienteSeleccionado);
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
    par.input.addEventListener("change", function() {
        procesarFotos(par.contenedor, par.input);
// for para que la promesa ejecute cada imagen subida al los inputs 
        for (let foto of par.input.files){
            convertirBase64(foto)
            .then((base)=>{
                console.log("Exito", base)
            })
            .catch((error)=>{
                console.error("error", error)
            });
        }
            
    });
    }
}
