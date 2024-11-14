const http = require('http');
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const program = new Command();

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <path>', 'cache directory');

program.parse(process.argv);
const options = program.opts();
const server = http.createServer(async (req, res) => {
  const code = path.basename(req.url);
  const cacheFile = path.join(options.cache, `${code}.jpg`);

  try {
    if (req.method === 'GET') {
      const file = await fs.promises.readFile(cacheFile);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(file);
    } else {
      res.writeHead(405);
      res.end('Method not allowed');
    }
  } catch (error) {
    if (!res.headersSent) {
      res.writeHead(404);
    }
    res.end('Not Found');
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
