var socket = new WebSocket('ws://localhost:8080/websocket');

socket.onopen = function(event) {
    console.log('Conectado ao servidor WebSocket');
};

socket.onmessage = function(event) {
    var message = 'Olá, servidor WebSocket!';
    console.log('Mensagem recebida: ' + event.data);
    
};

socket.onclose = function(event) {
    console.log('Conexão fechada');
};

function sendMessage() {
    var message = 'Olá, servidor WebSocket!';
    socket.send(message);
    console.log('Mensagem enviada: ' + message);
}
document.getElementById('sendButton').addEventListener('click', sendMessage);

