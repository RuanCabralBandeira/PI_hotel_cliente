const restify = require("restify");
const ClienteController = require("./controllers/cliente.controller");
const UsuarioController = require("./controllers/usuario.controller");

const server = restify.createServer({ name: "api-hotel-cliente" });

server.use(restify.plugins.queryParser()); 
server.use(restify.plugins.bodyParser()); 


// Rotas de Usuário (Autenticação)
server.post('/usuario/cadastrar', UsuarioController.cadastrar);
server.post('/usuario/login', UsuarioController.login);

// Rotas de Cliente
server.get('/', ClienteController.listar);
server.get('/:id', ClienteController.buscarPorId);
server.post('/', ClienteController.criar);
server.put('/:id', ClienteController.atualizar);
server.patch('/:id', ClienteController.atualizar);
server.patch('/:id/excluir', ClienteController.excluir);

const PORT = 9531; 
server.listen(PORT, () => { 
    console.log(`${server.name} rodando na porta ${PORT} | Aguardando chamadas do API Gateway`); 
});