const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('O Node.js puro está recebendo sua chamada!\nURL acessada: ' + req.url);
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor de teste rodando em ${PORT}`);
});
