<?php

require 'vendor/autoload.php';
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

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

    public function onMessage(ConnectionInterface $from, $msg)
    {
        // Tratamento da mensagem recebida (coloque sua lógica aqui)
        //$tratada = strtoupper($msg); // Por exemplo, converter para letras maiúsculas

        // Enviar a mensagem tratada para todos os clientes, exceto o remetente original
        foreach ($this->clients as $client) {
            if ($client !== $from) {
                $client->send($msg);
            }
        }
        // Lógica a ser executada quando o servidor receber uma mensagem do cliente
        //$from->send('Ok recebida, msg Enviada com sucesso: ' . $msg);
        file_put_contents('log.txt', "Mensagem recebida do cliente: " . $msg . PHP_EOL, FILE_APPEND);
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

$server = new \Ratchet\App('localhost', 8080);
$server->route('/ws', new MyWebSocketServer(), array('*'));
$server->run();
