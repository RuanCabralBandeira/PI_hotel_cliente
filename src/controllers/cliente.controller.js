const prisma = require('../config/prisma');

// 1. Listar clientes (com filtros e ordenação)
const listar = async (req, res) => {
    try {
        const { status, ordem, nome } = req.query;

        const clientes = await prisma.cliente.findMany({
            where: {
                // Se mandou status, filtra por ele. Se não, oculta os inativos por padrão.
                ...(status ? { cliente_status: status } : { cliente_status: { not: 'Inativo' } }),
                // Se mandou nome, faz uma busca parcial (LIKE)
                ...(nome && { cliente_nome: { contains: nome } })
            },
            orderBy: {
                cliente_nome: ordem === 'desc' ? 'desc' : 'asc'
            }
        });

        res.send(200, clientes);
    } catch (error) {
        console.error("Erro ao listar clientes:", error);
        res.send(500, { erro: "Erro interno ao buscar os clientes." });
    }
};

// 2. Buscar cliente específico por ID
const buscarPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await prisma.cliente.findFirst({
            where: { cliente_id: id }
        });

        if (!cliente) {
            res.send(404, { erro: "Cliente não encontrado." });
            return;
        }

        res.send(200, cliente);
    } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        res.send(500, { erro: "Erro interno ao buscar o cliente." });
    }
};

// 3. Criar novo cliente
const criar = async (req, res) => {
    try {
        const dados = req.body;

        const novoCliente = await prisma.cliente.create({
            data: {
                cliente_nome: dados.cliente_nome,
                cliente_idade: parseInt(dados.cliente_idade),
                cliente_genero: dados.cliente_genero,
                cliente_cpf: dados.cliente_cpf,
                cliente_telefone: dados.cliente_telefone,
                cliente_status: dados.cliente_status || 'Ativo', // Padrão é Ativo se não vier nada
                usuario_id: parseInt(dados.usuario_id),
                quarto_id: dados.quarto_id ? parseInt(dados.quarto_id) : null
            }
        });

        res.send(201, novoCliente);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        // O Prisma costuma lançar o erro P2002 quando viola um campo UNIQUE (ex: CPF repetido)
        if (error.code === 'P2002') {
            res.send(409, { erro: "Já existe um cliente cadastrado com este CPF." });
        } else {
            res.send(500, { erro: "Erro interno ao criar o cliente. Verifique os dados." });
        }
    }
};

// 4. Atualizar cliente (Total ou Parcial - serve para PUT e PATCH)
const atualizar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dados = req.body;

        // Se o JSON trouxer IDs numéricos como string, precisamos converter antes de atualizar
        if (dados.cliente_idade) dados.cliente_idade = parseInt(dados.cliente_idade);
        if (dados.usuario_id) dados.usuario_id = parseInt(dados.usuario_id);
        if (dados.quarto_id) dados.quarto_id = parseInt(dados.quarto_id);

        const clienteAtualizado = await prisma.cliente.update({
            where: { cliente_id: id },
            data: dados
        });

        res.send(200, clienteAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        res.send(500, { erro: "Erro interno ao atualizar. Verifique se o ID existe." });
    }
};

// 5. Soft Delete (Excluir logicamente alterando o status)
const excluir = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.cliente.update({
            where: { cliente_id: id },
            data: { cliente_status: 'Inativo' }
        });

        res.send(200, { mensagem: "Cliente desativado com sucesso (Soft Delete)." });
    } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        res.send(500, { erro: "Erro interno ao executar o soft delete." });
    }
};

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    excluir
};