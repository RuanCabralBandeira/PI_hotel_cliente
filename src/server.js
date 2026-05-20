const restify = require("restify");
const ClienteController = require("./controllers/cliente.controller");
const UsuarioController = require("./controllers/usuario.controller");

const server = restify.createServer({ name: "api-hotel-cliente" });

server.use(restify.plugins.queryParser()); 
server.use(restify.plugins.bodyParser()); 

const BASE_URL = "/20261prj5/hotel/cliente";
const AUTH_URL = "/20261prj5/hotel/usuario";

// Rotas de Usuário (Autenticação)
server.post(`${AUTH_URL}/cadastrar`, UsuarioController.cadastrar);
server.post(`${AUTH_URL}/login`, UsuarioController.login);
// Mapeamento dos Endpoints
server.get(`${BASE_URL}/`, ClienteController.listar);
server.get(`${BASE_URL}/:id`, ClienteController.buscarPorId);
server.post(`${BASE_URL}/`, ClienteController.criar);
server.put(`${BASE_URL}/:id`, ClienteController.atualizar);
server.patch(`${BASE_URL}/:id`, ClienteController.atualizar);
server.patch(`${BASE_URL}/:id/excluir`, ClienteController.excluir);

const PORT = 9531; 
server.listen(PORT, () => { 
    console.log(`${server.name} rodando na porta ${PORT} | Base URL: ${BASE_URL}`); 
});