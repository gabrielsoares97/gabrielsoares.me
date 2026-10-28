<?php
// Contador de likes compartilhado entre todos os visitantes.
// GET  -> { "total": 123 }
// POST -> corpo { "n": 5 } soma até MAX_POR_ENVIO cliques e devolve o novo total.
// O total fica salvo em likes.txt, nesta mesma pasta (criado sozinho no primeiro acesso).

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const ARQUIVO = __DIR__ . '/likes.txt';
const MAX_POR_ENVIO = 50;

$metodo = $_SERVER['REQUEST_METHOD'];
if ($metodo !== 'GET' && $metodo !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Use GET ou POST.']);
    exit;
}

$arquivo = @fopen(ARQUIVO, 'c+');
if (!$arquivo) {
    http_response_code(500);
    echo json_encode(['erro' => 'Sem permissão para gravar likes.txt na pasta api.']);
    exit;
}

// Trava o arquivo para que cliques simultâneos não se percam.
flock($arquivo, $metodo === 'POST' ? LOCK_EX : LOCK_SH);
$total = (int) stream_get_contents($arquivo);

if ($metodo === 'POST') {
    $corpo = json_decode(file_get_contents('php://input'), true);
    $n = max(0, min(MAX_POR_ENVIO, (int) ($corpo['n'] ?? 0)));
    if ($n > 0) {
        $total += $n;
        ftruncate($arquivo, 0);
        rewind($arquivo);
        fwrite($arquivo, (string) $total);
        fflush($arquivo);
    }
}

flock($arquivo, LOCK_UN);
fclose($arquivo);

echo json_encode(['total' => $total]);
