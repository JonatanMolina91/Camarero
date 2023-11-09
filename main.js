
let barra = new Image();
barra.src = "img/barra.svg"

let imMesa1 = new Image();
imMesa1.src = "img/mesa1.png";

let imSilla1 = new Image();
imSilla1.src = "img/silla1.png";

let imSilla2 = new Image();
imSilla2.src = "img/silla2.png";

let pjs = new Image();
pjs.src = "img/pjs.png";



window.onload = function () {

    //tamaño canvas
    const CANVASWIDTH = 500;
    const CANVASHEIGHT = 800;
    //tamaño mesa
    const MESAWIDTH = 100;
    const MESAHEIGHT = 100;
    //tamaño sillas
    const SILLAWIDTH = 50;
    const SILLAHEIGHT = 50;
    //tamaño prota
    const PROTAWIDTH = 30;
    const PROTAHEIGHT = 60;
    //velocidad del prota
    const VELOCIDAD = 10;
    let prota;

    //objetos del mapa
    let objetos = [];

    //cafes de la barra
    let cafes = [];

    let bandeja;


    let ctx;

    class Objeto {
        constructor(x_, y_, siceX_, siceY_) {
            this.x = x_;
            this.y = y_;
            this.siceX = siceX_;
            this.siceY = siceY_;
        }
    }

    class Cafe extends Objeto {
        constructor(x_, y_, siceX_, siceY_, tipo_) {
            super(x_, y_, siceX_, siceY_);
            this.area = [(x_ + 70), y_, 30, 30];
            this.tipo = tipo_;
            switch (tipo_) {
                case "solo":
                    ctx.fillStyle = "black";
                    this.id=0;
                    break;
                case "leche":
                    ctx.fillStyle = "red";
                    this.id=1;
                    break;
            }
            ctx.fillRect(this.x, this.y, this.siceX, this.siceY);
            ctx.fillRect(this.area[0], this.area[1], this.area[2], this.area[3]);
        }
    }

    class Silla extends Objeto {
        constructor(x_, y_, siceX_, siceY_, orientacion_) {
            super(x_, y_, siceX_, siceY_);
            this.imagen = orientacion_ == 0 ? imSilla1 : imSilla2;
        }
    }

    class Mesa extends Objeto {
        constructor(x_, y_, siceX_, siceY_) {
            super(x_, y_, siceX_, siceY_);
            this.imagen = imMesa1;
        }
    }

    function crearCojunto(x_, y_) {
        let adios = [];
        adios.push(new Silla((x_ + 25), y_, SILLAWIDTH, SILLAHEIGHT, 0));
        adios.push(new Silla((x_ + 25), (y_ + SILLAHEIGHT + 20 + MESAWIDTH), SILLAWIDTH, SILLAHEIGHT));
        adios.push(new Mesa(x_, (y_ + SILLAHEIGHT + 10), MESAWIDTH, MESAHEIGHT, 1));
        for (i = 0; i < adios.length; ++i) {
            ctx.drawImage(adios[i].imagen, adios[i].x, adios[i].y, adios[i].siceX, adios[i].siceY);
        }

        return adios;
    }





    class Protagonista {
        constructor() {
            this.sprite = [[43, 132], [73, 132], [43, 198], [73, 198], [40, 3], [73, 3], [43, 69], [73, 69]];
            this.x = 10;
            this.y = 600;
            this.animacion;
            this.moviendo = false;
            this.posicion = 0;
            this.direccion = 0;
            this.cafe="nada";
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
        console.log(prota.area);
        if(event.keyCode == 32 && prota.area > -1) {
            prota.cafe = cafes[prota.area].tipo;
            bandeja.innerHTML = "Bandeja:" + prota.cafe;
        }
        if (!prota.moviendo && event.keyCode > 36 && event.keyCode < 41) {
            prota.animacion = setInterval(dibujarProta, 1000 / 10);
            prota.moviendo = true;
            prota.direccion = event.keyCode
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


        comprobarChoque(objetos);
        comprobarInteracion();

        ctx.drawImage(pjs, prota.sprite[prota.posicion][0], prota.sprite[prota.posicion][1], 17, 40, prota.x, prota.y, PROTAWIDTH, PROTAHEIGHT);

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
        let i=0;
        prota.area = -1;
        while( i<cafes.length && prota.area < 0 ) {
        let nIzq = cafes[i].area[0];
        let nDer = cafes[i].area[0] + cafes[i].area[2];
        let nDown = cafes[i].area[1];
        let nUp = cafes[i].area[1] + cafes[i].area[3];
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


    let canvas = document.getElementById("miCanvas");
    bandeja = document.getElementById("bandeja");
    canvas.setAttribute("width", CANVASWIDTH);
    canvas.setAttribute("height", CANVASHEIGHT);
    ctx = canvas.getContext("2d");

    ctx.drawImage(barra, 10, 10, 90, 480);


    prota = new Protagonista();
    dibujarProta();




    document.addEventListener("keydown", activaMovimiento, false);
    document.addEventListener("keyup", desactivaMovimiento, false);

    objetos = crearCojunto(200, 100);
    objetos.push(new Objeto(10, 10, 90, 480));
    cafes.push(new Cafe(30, 400, 30, 30, "leche"));
    cafes.push(new Cafe(30, 300, 30, 30, "solo"));




}