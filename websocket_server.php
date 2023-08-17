<?php

require 'vendor/autoload.php';
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

echo "Okay, servidor aberto...";

class MyWebSocketServer implements MessageComponentInterface
{
    protected $clients;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
    }
    // Lógica a ser executada quando um cliente se conectar ao servidor
    public function onOpen(ConnectionInterface $conn)
    {
        echo "Nova conexão, Entrou...";
        file_put_contents('log.txt', "Nova conexão, Entrou... " . PHP_EOL, FILE_APPEND);
        $this->clients->attach($conn);
    }

    public function onClose(ConnectionInterface $conn)
    {   
        $this->clients->detach($conn);
        file_put_contents('log.txt', "Cliente saindo... " . PHP_EOL, FILE_APPEND);
    }
    // QUando servidor receber mensagem dos clientes
    public function onMessage(ConnectionInterface $from, $msg)
    {

        // Enviar a mensagem tratada para todos os clientes, exceto o remetente original
        foreach ($this->clients as $client) {
            if ($client !== $from) { // Menos quem enviou
                $client->send($msg);
            }
        }
        //file_put_contents('log.txt', "Mensagem recebida do cliente: " . $msg . PHP_EOL, FILE_APPEND);
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        // Lógica a ser executada quando ocorrer um erro na conexão
        $conn->close();
    }

    public function stopServer()
    {
        // Encerra todas as conexões ativas antes de encerrar o servidor
        foreach ($this->clients as $client) {
            $client->close();
        }
    }
}

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new MyWebSocketServer()
        )
    ),
    8080,
    '0.0.0.0' // ou substitua por um IP local específico da sua máquina
);

$server->run(); // Servidor é ativado
