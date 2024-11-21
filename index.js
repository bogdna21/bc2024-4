const http = require('http');
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const superagent = require('superagent');
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
      
      if (fs.existsSync(cacheFile)) {
        const file = await fs.promises.readFile(cacheFile);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(file);
      } else {

        try {
          const response = await superagent.get(`https://http.cat/${code}`);
          await fs.promises.writeFile(cacheFile, response.body); 
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(response.body);
        } catch (err) {
          console.error('Error fetching from http.cat:', err.message);
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      }
    } else if (req.method === 'PUT') {
      const fileData = [];
      req.on('data', chunk => fileData.push(chunk));
      req.on('end', async () => {
        await fs.promises.writeFile(cacheFile, Buffer.concat(fileData));
        res.writeHead(201, { 'Content-Type': 'text/plain' });
        res.end('Image cached');
      });
    } else if (req.method === 'DELETE') {
      await fs.promises.unlink(cacheFile);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Image deleted');
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