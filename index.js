const http = require('http');
const { Command } = require('commander');

const program = new Command();

// Налаштування командних параметрів
program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <directory>', 'шлях до директорії, яка міститиме закешовані файли');

program.parse(process.argv);

// Отримання значень параметрів
const options = program.opts();

const host = options.host;
const port = options.port;
const cacheDirectory = options.cache;

// Запуск веб-сервера
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, world!');
});

// Слухаємо на вказаних параметрах
server.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});
