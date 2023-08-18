const container = document.createElement("div");
container.style.width = "100vw";
container.style.height = "100vh";
const canvasEl = document.getElementById("myCanvas");
container.appendChild(canvasEl);
const body = document.querySelector("body");
body.appendChild(container);
canvasEl.width = parent.offsetWidth;
canvasEl.height = parent.offsetHeight;
canvasEl.classList.add("full-dimension");
const canvasCtx = canvasEl.getContext("2d");
let gapX = 10;
let paddle_p2 = 240;
let data = {ball_x: 0, ball_y: 0, paddle_y: 0, score_p1: 0, score_p2: 0, p2on: false};
let width_global = window.innerWidth;
let height_global = window.innerHeight;
let p2on;

// Abre conexão com o servidor websocket, mudar o IP.
var socket = new WebSocket('ws://10.15.114.82:8080/ws');

socket.onopen = function(event) {
    console.log('Player 1 está Conectado ao servidor WebSocket');
};

socket.onmessage = function(event) {
    var data_p2 = JSON.parse(event.data)
    paddle_p2 = parseInt(data_p2['paddle_y'])
    p2on = data_p2['p2on']
};

socket.onclose = function(event) {
    console.log('Conexão fechada');
};

const mouse = {x: 0, y: 0 }

// Cria uma nova instância de imagem
var imagem = new Image();
imagem.src = "images/image.png";

// Define as coordenadas x e y da imagem
const image = {
    x: width_global/2 - 40,
    y: height_global/2 - 40,
    _move: function(){
        this.x = ball.x - 40;
        this.y = ball.y - 40;
    },
    draw: function(){
        // Desenha a imagem nas coordenadas x e y
        canvasCtx.drawImage(imagem, image.x, image.y)
        this._move()
    }
}
// Desenha o campo verde de fundo
const field = {
    x: 0,
    y: 0,
    w: width_global,
    h: height_global,
    draw: function(){
        //Campo
        this.w = width_global
        this.h = height_global
        canvasCtx.fillStyle = "#286047"
        canvasCtx.fillRect(this.x, this.y, width_global, height_global)
    }
}
// Desenha a linha central
const line = {
    w: 15,
    x: (field.w/2) - (15/2),
    y: field.y,
    h: field.h,
    draw: function(){
        this.h = height_global
        this.x = (width_global/2) - (15/2)
        //Linha do meio
        canvasCtx.fillStyle = "#ffffff"
        canvasCtx.fillRect(this.x, this.y, this.w, this.h)
    }
}
const score = {
    player1: 0,
    player2: 0,
    increasePlayer1: function(){
        this.player1++
        data['score_p1'] = this.player1
        var json_data = JSON.stringify(data);
        socket.send(json_data);
    },
    increasePlayer2: function(){
        this.player2++
        data['score_p2'] = this.player2
        var json_data = JSON.stringify(data);
        socket.send(json_data);
    },
    draw: function () {
        canvasCtx.font = "bold 72px Arial"
        canvasCtx.textAlign = "center"
        canvasCtx.textBaseline = "top"
        canvasCtx.fillStyle = "#01341D"
        canvasCtx.fillText(this.player1, width_global / 4, 50)
        canvasCtx.fillText(this.player2, width_global / 2 + width_global / 4, 50)
    }
}

const leftPaddle = {
    x: gapX,
    y: 240,
    w: line.w,
    h: 200,
    speed: 10,
    _moveUp: function(){
        if (leftPaddle.y > field.y){
            this.y -= this.speed
            data['paddle_y'] = this.y
            var json_data = JSON.stringify(data);
            socket.send(json_data);
        }
    },
    _moveDown: function(){
        if (leftPaddle.y + leftPaddle.h < field.h){
            this.y += this.speed
            data['paddle_y'] = this.y
            var json_data = JSON.stringify(data);
            socket.send(json_data);
        }
    },
    _move: function(){
        //this.y = mouse.y - 100
    },
    draw: function(){
        //Raquete 1
        canvasCtx.fillStyle = "#ffffff"
        canvasCtx.fillRect(this.x, this.y, this.w, this.h)
        this._move()
    }
}

const rightPaddle = {
    x: width_global - line.w - gapX,
    y: 240,
    w: line.w,
    h: 200,
    speed: 10,
    draw: function(){
        this.x = width_global - line.w - gapX
        //Raquete 2
        //console.log("Testando")
        canvasCtx.fillStyle = "#ffffff"
        canvasCtx.fillRect(this.x, paddle_p2, this.w, this.h)
    }
}
// Desenha e movimenta bola
const ball = {
    x: field.w/2,
    y: field.h/2,
    directionX: 1,
    directionY: 1,
    r: 20,
    speed: 5,
    _move: function(){

        this.x += this.directionX * this.speed
        this.y += this.directionY * this.speed
        data['ball_x'] = this.x
        data['ball_y'] = this.y
        var json_data = JSON.stringify(data);
        if (socket.readyState === WebSocket.OPEN) socket.send(json_data);
        
    },
    pointUp: function(){
        this.x = field.w/2
        this.y = field.h/2
    },
    _calcPosition: function () {
        if (this.y >= (field.h-this.r)) {
            this.directionY = -1; 
        }else if (this.y <= field.y) {
            this.directionY = 1;
        // Verifica bola na linha de fundo do player 2
        }else if (this.x >= (rightPaddle.x - this.r)){ 
            if (this.y >= paddle_p2 && this.y <= (paddle_p2 + rightPaddle.h)){
                this.directionX = -1;
            }else{
                score.increasePlayer1()
                this.pointUp()
            }
        }else if (this.x <= (leftPaddle.x+this.r+line.w)) {
            if(this.y >= leftPaddle.y && this.y <= (leftPaddle.y + leftPaddle.h)){
                this.directionX = 1;
            }else{
                score.increasePlayer2()
                this.pointUp()
            }
        }
    },
    draw: function(){
            //Bola
        canvasCtx.fillStyle = "#ffffff"
        canvasCtx.beginPath()
        canvasCtx.arc(this.x, this.y, this.r, 2 * Math.PI, false) // False é sentido anti-horário
        canvasCtx.fill() 
        this._calcPosition()
        this._move()
    }
}

  
  // Carrega a imagem e inicia a animação quando estiver pronta
  imagem.onload = function() {
    draw();
  };

function setup() {
    canvasEl.width = canvasCtx.width = window.innerWidth
    canvasEl.height = canvasCtx.height = window.innerHeight
}

function draw() {
    field.draw()
    leftPaddle.draw()
    rightPaddle.draw()
    score.draw()
    line.draw()
    ball.draw()
    image.draw()
}

window.animateFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
        return window.setTimeout(callback, 1000 / 60)
        }
    )
})()

function main() {
    
    animateFrame(main)
    draw()
}
setup()
main()

// Espera o jogador 2 entrar para começar o jogo
//timeStart = setInterval(waitingPlayer, 1000);
function waitingPlayer(){

    // Obtendo o valor do localStorage
    
    var player2on = true;
    console.log("Player 2 on: " + player2on); // Vai exibir: "Este é o valor que quero armazenar."

    if(player2on){
        clearInterval(timeStart)
        main()
    }
}

// Variáveis para controlar o estado das teclas
  const keysState = {};

// Função para tratar o evento de pressionar uma tecla
function handleKeyPress(event) {
    if (event.key === "8") {
        rightPaddle._moveUp()
    } else if (event.key === "5") {
        rightPaddle._moveDown()
    }
}

function handleKeyPress2(event) {
    if (event.key === "w") {     
        leftPaddle._moveUp()
    } else if (event.key === "s") {
        leftPaddle._moveDown()
    }
}

document.addEventListener("keypress", handleKeyPress2);

// window.addEventListener('resize', () => {
//     canvasEl.style.width = container.offsetWidth;
//     canvasEl.style.height = container.offsetHeight;  
//     console.log(`Nova largura: ${width_global}, Nova altura: ${height_global}`);
// });



