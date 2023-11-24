// las imagenes que voy a usar como graficos
let barra = new Image();
barra.src = "img/barra.svg"

let imMesa1 = new Image();
imMesa1.src = "img/mesa1.png";

let imSilla1 = new Image();
imSilla1.src = "img/silla1.png";

let imSilla2 = new Image();
imSilla2.src = "img/silla2.png";

let imLeche = new Image();
imLeche.src = "img/leche.svg";

let imSolo = new Image();
imSolo.src = "img/solo.svg";

let imCortado = new Image();
imCortado.src = "img/cortado.svg";

let imAsiatico = new Image();
imAsiatico.src = "img/asiatico.svg";

let imBarraTiempo = new Image();
imBarraTiempo.src = "img/barra_tiempo.svg";

let boton = new Image();
boton.src = "img/boton.png";

let pjs = new Image();
pjs.src = "img/pjs.png";
//-----------------------------------------------------------------

//los audios que voy a usar como efectos
let audioPoner = new Audio("sonidos/poner.mp3");
let audioAsco = new Audio("sonidos/asco.mp3");
let audioBeber = new Audio("sonidos/beber.mp3");
//---------------------------------------------------------------


//tamaño canvas
const CANVASWIDTH = 1200;
const CANVASHEIGHT = 600;
//tamaño mesa
const MESAWIDTH = 50;
const MESAHEIGHT = 50;

//inicio en x de la siguiente mesa
let xms = 200;

//tamaño sillas
const SILLAWIDTH = 30;
const SILLAHEIGHT = 30;

//tamaño prota
const PROTAWIDTH = 30;
const PROTAHEIGHT = 40;

//TAMAÑO CLIENTE
const CLIENTEWIDTH = 30;
const CLIENTEHEIGHT = 40;

//cantidad de pixeles que se meve el prota
const VELOCIDAD = 10;

//numero maximo de clientes que se genera
const LIMITECLIENTES = Infinity;

//numero de mesas que se generan
let numeroMesas = 1;

//por cada cuanto cafes sube de nivel
const PUNTOSSUBIR = 3;

//parametros de subida de nivel, 
//en este caso se aumentara solo el numero
// de mesas
const AUMENTOMESA = 1;


//cada cuato tiempo genera un cliente en segundos
let GENCLIENTETIEMPO = 1000 * 4;

//cada cuanto tiempo desaparece un cliente en segundos
let TIEMPOESPERA = 1000 * 16;


//objetos CON COLISION, en esta array 
//se almacena los objetos que quiero que derecte colision
let objetosColision = [];

//OBJETOS CON INTERACION, en esta arrat
// se almacena los objetos que yo quiero que tenga interacion
let objetosInteracion = [];

//clientes actuales
let clientesActuales = 0;

//id interval generacion clientes
let idTiempoGeneradorCliente;


let nombreJugador; //el nombre del jugador 

let prota; // un objeto tipo protagonista

let ctx; //donde dibujare

//las mesas que vaya a crear se almacenara ene sta array
let mesas = [];


let bandeja = -1; //contenido de la badeja del jugador
let vidas = 3; //las vidas del jugador
let puntos = 0; // los puntos del jugador
let nivel = 1; // nivel de dificulta







//Esta es la clase principal que heredaran todo mis objetos
//lleva lo basico de un objeto que es x, y y el tamaño
class Objeto {
    constructor(x_, y_, siceX_, siceY_) {
        this.x = x_;
        this.y = y_;
        this.siceX = siceX_;
        this.siceY = siceY_;
    }
}

//la clase mesa que contendra a su vez objetos de tipo silla
class Mesa extends Objeto {
    constructor(x_, y_, siceX_, siceY_, id_) {
        super(x_, y_ + SILLAHEIGHT + 10, siceX_, siceY_);
        this.imagen = imMesa1;
        this.id = id_;
        this.dibujar()

        //crea dos sillas
        this.sillas = [new Silla((x_ + 10), y_, SILLAWIDTH, SILLAHEIGHT, 0, this.id),
        new Silla((x_ + 10), (y_ + SILLAHEIGHT + 20 + MESAWIDTH), SILLAWIDTH, SILLAHEIGHT, 1, this.id)];

        //dibuja dos sillas
        this.sillas[0].dibujar();
        this.sillas[1].dibujar();

    }

    //dibuja la mesa
    dibujar() {
        ctx.drawImage(this.imagen, this.x, this.y, this.siceX, this.siceY);
    }
}

//clase silla que contendra a su vez clientes
class Silla extends Objeto {
    constructor(x_, y_, siceX_, siceY_, orientacion_, idMesa_) {
        super(x_, y_, siceX_, siceY_);
        this.orientacion = orientacion_;
        this.imagen = orientacion_ == 0 ? imSilla1 : imSilla2;
        this.cliente = null;
        this.idMesa = idMesa_;
        this.idTiempo;
    }

    //genera un cliente en la silla
    generarCliente() {
        this.cliente = new Cliente(this.x, this.y, PROTAWIDTH, PROTAHEIGHT, this.orientacion, this.idMesa, this.orientacion);
        let idIn = 0;
        while (idIn < objetosInteracion.length && objetosInteracion[idIn].idMesa != this.idMesa && objetosInteracion[idIn].idSilla != this.idSilla) {
            ++idIn
        }
        
        this.idTiempo = setTimeout(function (id_) {
            this.cliente.eliminarCafe(+id_);
            this.cliente = null;
            this.dibujar();
            --clientesActuales;
            --vidas;
            if (vidas <= 0) {
                finJuego();
            }
            actualizarMarcador();
        }.bind(this), TIEMPOESPERA, idIn);

    }

    eliminarCliente(id_ = -1) {
        clearTimeout(this.idTiempo);
        this.cliente.eliminarCafe(id_);
        if (id_ != -1) {
            this.cliente = null;
            this.dibujar();
        }
    }

    dibujar() {
        ctx.drawImage(this.imagen, this.x, this.y, this.siceX, this.siceY);
    }
}


class Cliente extends Objeto {
    constructor(x_, y_, siceX_, siceY_, orientacion_, idMesa_, idSilla_) {
        super(x_, y_, siceX_, siceY_);
        this.sprite = [[135, 4], [135, 199]];
        this.barraTiempoSprite = [[0, 0], [0, 20], [0, 40], [0, 60], [0, 80], [0, 100], [0, 120], [0, 140]];
        this.cafe = null;
        this.orientacion = orientacion_;
        this.y = this.orientacion == 1 ? this.y - 15 : this.y;
        this.idMesa = idMesa_;
        this.idSilla = idSilla_;
        this.dibujarCliente();
        this.generarCafe();
        this.idBarraTiempo;
        this.pos = 0;

    }

    dibujarCliente() {
        ctx.drawImage(pjs, this.sprite[this.orientacion][0], this.sprite[this.orientacion][1], 25, 40, this.x, this.y, CLIENTEWIDTH, CLIENTEHEIGHT);
        this.dibujarBarraTiempo(0);
        this.idBarraTiempo = setInterval(function () {
            this.pos = this.pos != 7 ? (this.pos + 1) % 8 : this.pos;
            this.dibujarBarraTiempo(this.pos);
        }.bind(this), (TIEMPOESPERA / 8));
    }

    dibujarGlobo() {
        ctx.fillStyle = "white";
        if (this.orientacion == 0) {
            ctx.fillRect(this.x + 2, this.y - 30, 25, 25,);
        } else {
            ctx.fillRect(this.x + 2, this.y + 28, 25, 25);
        }

    }

    dibujarBarraTiempo(id_) {
        if (this.orientacion == 0) {
            ctx.drawImage(imBarraTiempo, this.barraTiempoSprite[id_][0], this.barraTiempoSprite[id_][1], 50, 10, this.x, this.y, this.siceX, 5);
        } else {
            ctx.drawImage(imBarraTiempo, this.barraTiempoSprite[id_][0], this.barraTiempoSprite[id_][1], 50, 10, this.x, this.y, this.siceX, 5);
        }
    }

    generarCafe() {
        this.dibujarGlobo();
        if (this.orientacion == 0) {
            this.cafe = new Cafe(this.x + 5, this.y - 28, 20, 20, Math.floor(Math.random() * 4), [(this.x - 30), this.y, this.siceX + 60, this.siceY], this.idMesa, this.idSilla);
        } else {
            this.cafe = new Cafe(this.x + 5, this.y + 28, 20, 20, Math.floor(Math.random() * 4), [(this.x - 30), this.y, this.siceX + 60, this.siceY], this.idMesa, this.idSilla);
        }
        objetosInteracion.push(this.cafe);

    }

    eliminarCafe(id_ = -1) {
        clearInterval(this.idBarraTiempo);

        if (id_ != -1) {
            this.dibujarBarraTiempo(7);
            this.cafe = null;
            if (this.orientacion == 0) {
                ctx.clearRect(this.x, this.y - 32, CLIENTEWIDTH, CLIENTEHEIGHT + 32);
            } else {
                ctx.clearRect(this.x, this.y, CLIENTEWIDTH, CLIENTEHEIGHT + 32);
            }
            objetosInteracion.splice(id_, 1);
        }
    }
}

class Cafe extends Objeto {
    constructor(x_, y_, siceX_, siceY_, tipo_, area_, idMesa_ = -1, idSilla_ = -1) {
        super(x_, y_, siceX_, siceY_);
        this.area = area_;
        this.tipo = tipo_;
        this.idMesa = idMesa_;
        this.idSilla = idSilla_;
        this.image;
        switch (this.tipo) {
            case 0:
                this.nombre = "solo";
                this.image = imSolo;
                break;
            case 1:
                this.nombre = "leche";
                this.image = imLeche;
                break;
            case 2:
                this.nombre = "cortado";
                this.image = imCortado;
                break;
            case 3:
                this.nombre = "asiatico";
                this.image = imAsiatico;
                break;
        }
        this.dibujar();
    }
    dibujar() {
        ctx.drawImage(this.image, this.x, this.y, this.siceX, this.siceY);
    }
}










class Protagonista {
    constructor() {
        this.sprite = [[43, 132], [73, 132], [43, 198], [73, 198], [40, 3], [73, 3], [43, 69], [73, 69]];
        this.x = 100;
        this.y = 200;
        this.animacion;
        this.moviendo = false;
        this.posicion = 0;
        this.direccion = 0;
        this.cafe = "nada";
        this.area = -1;
    }

    moverDerecha() {
        if (this.x < (CANVASWIDTH - 40)) {
            this.x = this.x + VELOCIDAD;
        } else {
            this.x = (CANVASWIDTH - 40);
        }
    }

    moverIzquierda() {
        if (this.x > 0) {
            this.x = this.x - VELOCIDAD;
        } else {
            this.x = 0;
        }
    }

    moverArriba() {
        if (this.y > 0) {
            this.y = this.y - VELOCIDAD;
        } else {
            this.y = 0;
        }
    }

    moverAbajo() {
        if (this.y < (CANVASHEIGHT - 40)) {
            this.y = this.y + VELOCIDAD;
        } else {
            this.y = (CANVASHEIGHT - 40);
        }
    }
}



function activaMovimiento(event) {
    if (event.keyCode == 32) {
        comprobarInteracion();
    }
    if (event.keyCode == 32 && prota.area > -1 && prota.area < 4) {
        audioPoner.duration = 0.3;
        audioPoner.play();
        prota.cafe = objetosInteracion[prota.area];
        bandeja = prota.cafe.tipo;
        actualizarMarcador();
    }

    if (event.keyCode == 32 && prota.area > 3) {
        bandeja = -1;

        comprobarBebida(prota, objetosInteracion[prota.area]);
        prota.cafe = "vacio";
        actualizarMarcador();
    }
    if (!prota.moviendo && event.keyCode > 36 && event.keyCode < 41) {
        prota.animacion = setInterval(dibujarProta, 1000 / 30);
        prota.moviendo = true;
        prota.direccion = event.keyCode
    }


}

function comprobarBebida(prota_, cafe_) {
    if (prota_.cafe.tipo === cafe_.tipo) {
        puntos += 1;
        audioBeber.play();
        comprobarNivel();
    } else {
        vidas -= 1;
        audioAsco.play();
    }
    mesas[cafe_.idMesa].sillas[cafe_.idSilla].eliminarCliente(prota_.area);
    clientesActuales--;
    if (vidas <= 0) {
        finJuego();
    }
}

function desactivaMovimiento(event) {
    if (prota.moviendo && event.keyCode > 36 && event.keyCode < 41 && event.keyCode == prota.direccion) {
        clearInterval(prota.animacion);
        prota.moviendo = false;
        switch (event.keyCode) {
            case 39:
                prota.posicion = 0;
                break;
            case 38:
                prota.posicion = 2;
                break;
            case 40:
                prota.posicion = 4;
                break;
            case 37:
                prota.posicion = 6;
                break;
        }
        prota.direccion = 0;
        dibujarProta();

    }
}

function dibujarProta() {

    ctx.clearRect(prota.x, prota.y, PROTAWIDTH, PROTAHEIGHT);
    switch (prota.direccion) {
        case 37:
            prota.moverIzquierda();
            prota.posicion = ((prota.posicion + 1) % 2) + 6;
            break;
        case 38:
            prota.moverArriba();
            prota.posicion = ((prota.posicion + 1) % 2) + 2;
            break;
        case 39:
            prota.moverDerecha();
            prota.posicion = (prota.posicion + 1) % 2;
            break;
        case 40:

            prota.moverAbajo();
            prota.posicion = ((prota.posicion + 1) % 2) + 4;
            break;
    }


    comprobarChoque(objetosColision);
    ctx.drawImage(pjs, prota.sprite[prota.posicion][0], prota.sprite[prota.posicion][1], 17, 40, prota.x, prota.y, PROTAWIDTH, PROTAHEIGHT);
    redibujarGlobos();


}

function comprobarChoque(obj_) {
    let bIzq = prota.x;
    let bDer = prota.x + PROTAWIDTH;
    let bDown = prota.y;
    let bUp = prota.y + PROTAHEIGHT;


    for (i = 0; i < obj_.length; ++i) {

        let nIzq = obj_[i].x;
        let nDer = obj_[i].x + obj_[i].siceX;
        let nDown = obj_[i].y;
        let nUp = obj_[i].y + obj_[i].siceY;
        if ((bDer > nIzq) &
            (bIzq < nDer) &
            (bUp > nDown) &
            (bDown < nUp)) {

            prota.x = prota.direccion == 39 ? (nIzq - PROTAWIDTH) : prota.x;
            prota.y = prota.direccion == 40 ? (nDown - PROTAHEIGHT) : prota.y;
            prota.y = prota.direccion == 38 ? nUp : prota.y;
            prota.x = prota.direccion == 37 ? nDer : prota.x;
        } else {
        }
    }

}

function comprobarInteracion() {
    let bIzq = prota.x;
    let bDer = prota.x + PROTAWIDTH;
    let bDown = prota.y;
    let bUp = prota.y + PROTAHEIGHT;
    let i = 0;
    prota.area = -1;
    while (i < objetosInteracion.length && prota.area < 0) {
        let nIzq = objetosInteracion[i].area[0];
        let nDer = objetosInteracion[i].area[0] + objetosInteracion[i].area[2];
        let nDown = objetosInteracion[i].area[1];
        let nUp = objetosInteracion[i].area[1] + objetosInteracion[i].area[3];
        if ((bDer > nIzq) &
            (bIzq < nDer) &
            (bUp > nDown) &
            (bDown < nUp)) {
            prota.area = i;
        } else {

        }
        ++i;
    }

}


function redibujarGlobos() {
    for (i = 0; i < mesas.length; ++i) {
        for (u = 0; u < 2; ++u) {
            if (mesas[i].sillas[u].cliente != null) {
                mesas[i].sillas[u].cliente.dibujarGlobo();
                mesas[i].sillas[u].cliente.cafe.dibujar();
            }
        }
    }
}



function iniciarMenu() {
    document.getElementById("fin").hidden = true;
    document.getElementById("menu").hidden = false;

}

function finJuego() {
    clearInterval(idTiempoGeneradorCliente);
    for (i = 0; i < mesas.length; ++i) {
        if (mesas[i].sillas[0].cliente != null) {
            mesas[i].sillas[0].eliminarCliente();
        }

        if (mesas[i].sillas[1].cliente != null) {
            mesas[i].sillas[1].eliminarCliente();
        }
    }

    localStorage.setItem(nombreJugador, puntos);



    document.removeEventListener("keydown", activaMovimiento);
    document.removeEventListener("keyup", desactivaMovimiento);

    objetosColision = [];
    objetosInteracion = [];



    ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
    document.getElementById("miCanvas").hidden = true;
    document.getElementById("barra").hidden = true;
    document.getElementById("fin").hidden = false;
    cargarRecords();
}



function actualizarMarcador() {
    let dire = "";
    switch (bandeja) {

        case 0:
            dire = "img/solo.svg";
            break;
        case 1:
            dire = "img/leche.svg";
            break;
        case 2:
            dire = "img/cortado.svg";
            break;
        case 3:
            dire = "img/asiatico.svg";
            break;

        default:
            dire = "img/probi.svg";
            break;
    }
    document.getElementById("bandeja").setAttribute("src", dire);



    document.getElementById("vidas").innerHTML = "";

    for (i = 0; i < vidas; ++i) {
        let vidita = document.createElement("img");
        vidita.setAttribute("src", "img/corazon.jpg");
        document.getElementById("vidas").appendChild(vidita);
    }

    document.getElementById("puntos").innerText = "Nivel " + nivel;
}



function generarClientes() {
    let numeroMesa = 0;
    let numeroSilla = 0;
    let hayCliente = true;
    while (hayCliente && clientesActuales != (numeroMesas * 2)) {
        numeroMesa = Math.floor(Math.random() * numeroMesas);
        numeroSilla = Math.floor(Math.random() * 2);
        if (mesas[numeroMesa].sillas[numeroSilla].cliente == null && LIMITECLIENTES != clientesActuales) {
            mesas[numeroMesa].sillas[numeroSilla].generarCliente();
            hayCliente = false;
            clientesActuales++;
        }
    }
}



function iniciarJuego() {

    vidas = 3;
    puntos = 0;
    xms = 200;
    numeroMesas = 1;
    nivel = 1;
    clientesActuales = 0;
    mesas = [];
    bandeja = -1;




    nombreJugador = document.getElementById("nombre").value;
    document.getElementById("barra").hidden = false;
    document.getElementById("menu").hidden = true;
    let canvas = document.getElementById("miCanvas");
    canvas.hidden = false;
    canvas.setAttribute("width", CANVASWIDTH);
    canvas.setAttribute("height", CANVASHEIGHT);
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");

    //limpiamos el canvas
    ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);



    //dibujamos la barra
    ctx.drawImage(barra, 10, 10, 50, 390);

    //agrego colision a la barra
    objetosColision.push(new Objeto(10, 10, 50, 390));

    //creamos al prota y lo dibujamos
    prota = new Protagonista();
    dibujarProta();

    //iniciamos marcador
    actualizarMarcador();

    // agregamos las escuchas a las teclas
    document.addEventListener("keydown", activaMovimiento, false);
    document.addEventListener("keyup", desactivaMovimiento, false);

    //creo los cafes de la barra y los agrego a la raid de interaciones
    objetosInteracion.push(new Cafe(25, 350, 20, 20, 0, [45, 350, 40, 20]));
    objetosInteracion.push(new Cafe(25, 300, 20, 20, 1, [45, 300, 40, 20]));
    objetosInteracion.push(new Cafe(25, 250, 20, 20, 2, [45, 250, 40, 20]));
    objetosInteracion.push(new Cafe(25, 200, 20, 20, 3, [45, 200, 40, 20]));

    //creamos las mesas iniciales

    for (i = 0; i < numeroMesas; ++i) {
        crearMesa(i);
    }
    //iniciamos la generacion automatica de clientes
    idTiempoGeneradorCliente = setInterval(generarClientes, GENCLIENTETIEMPO);

}

function crearMesa(id_) {
    mesas.push(new Mesa(xms, 100, MESAWIDTH, MESAHEIGHT, id_));
    xms += MESAWIDTH * 2;

    //agrego colision a las mesas y sillas;
    objetosColision.push(mesas[i], mesas[i].sillas[0], mesas[i].sillas[1]);
}


function cargarRecords() {
    let datos = {};
    for (i = 0; i < localStorage.length; ++i) {
        datos[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
    }
    let arrayDePares = Object.entries(datos);
    arrayDePares.sort(function (a, b) {
        return b[1] - a[1];
    });

    let tabla = document.getElementById("tabla");
    let elimina = tabla.children.length;
    for (i = 1; i < elimina; i++) {
        tabla.removeChild(tabla.children[1]);
    }
    let maxIndes = arrayDePares.length > 5 ? 5 : arrayDePares.length;

    for (i = 0; i < maxIndes; i++) {
        let clave = arrayDePares[i][0];
        let valor = arrayDePares[i][1];

        let fila = document.createElement("tr");
        let puesto = document.createElement("td");
        let nom = document.createElement("td");
        let punt = document.createElement("td");

        puesto.innerHTML = 1 + i;
        nom.innerHTML = clave;
        punt.innerHTML = valor;

        fila.appendChild(puesto);
        fila.appendChild(nom);
        fila.appendChild(punt);

        tabla.appendChild(fila);
    }

}

function comprobarNivel() {
    if (puntos == (nivel * PUNTOSSUBIR)) {
        crearMesa(numeroMesas);
        numeroMesas += AUMENTOMESA;
        nivel += 1;
        actualizarMarcador();
    }
}



window.onload = function () {


    //iniciarJuego();

}
