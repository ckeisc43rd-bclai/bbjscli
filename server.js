const WebSocket = require('ws');
const net = require('net');
const iconv = require('iconv-lite');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws) => {
    console.log('新的WebSocket連接');

    const telnetClient = new net.Socket();
    telnetClient.connect(23, 'fgisc.org', () => {
        console.log('已連接到 fgisc.org');
    });

    let buffer = Buffer.alloc(0);

    telnetClient.on('data', (data) => {
        buffer = Buffer.concat([buffer, data]);
        let result = iconv.decode(buffer, 'big5');
        ws.send(result);
        buffer = Buffer.alloc(0);
    });

    telnetClient.on('close', () => {
        console.log('Telnet連接關閉');
        ws.close();
    });

    ws.on('message', (message) => {
        const big5Buffer = iconv.encode(message.toString(), 'big5');
        telnetClient.write(big5Buffer);
    });

    ws.on('close', () => {
        console.log('WebSocket連接關閉');
        telnetClient.destroy();
    });
});

console.log('WebSocket服務器運行在端口3000');