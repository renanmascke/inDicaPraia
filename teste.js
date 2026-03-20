const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Node.js está funcionando na Hostinger! Porta: ' + (process.env.PORT || 'padrão'));
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor de teste rodando na porta ${PORT}`);
});
