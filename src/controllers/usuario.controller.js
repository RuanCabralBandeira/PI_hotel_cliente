const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Cadastrar Usuário (Primeira etapa antes de criar o cliente)
const cadastrar = async (req, res) => {
    try {
        const { usuario_login, usuario_senha } = req.body;

        if (!usuario_login || !usuario_senha) {
            res.send(400, { erro: "Login e senha são obrigatórios." });
            return;
        }

        // Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(usuario_senha, salt);

        // Salvar no banco
        const novoUsuario = await prisma.usuario.create({
            data: {
                usuario_login: usuario_login,
                usuario_senha: senhaHash,
                usuario_status: 'Ativo'
            }
        });

        // Retorna os dados (sem a senha, por segurança)
        res.send(201, {
            mensagem: "Usuário criado com sucesso!",
            usuario_id: novoUsuario.usuario_id,
            usuario_login: novoUsuario.usuario_login
        });

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        if (error.code === 'P2002') {
            res.send(409, { erro: "Este login já está em uso." });
        } else {
            res.send(500, { erro: "Erro interno ao cadastrar." });
        }
    }
};

// 2. Login (Autenticação e geração do Token)
const login = async (req, res) => {
    try {
        const { usuario_login, usuario_senha } = req.body;

        // Buscar usuário no banco pelo login
        const usuario = await prisma.usuario.findUnique({
            where: { usuario_login: usuario_login }
        });

        // Se não achar o usuário ou se ele estiver inativo
        if (!usuario) {
            res.send(404, { erro: "Usuário não encontrado." });
            return;
        }
        if (usuario.usuario_status === 'Inativo') {
            res.send(403, { erro: "Usuário inativo. Acesso negado." });
            return;
        }

        // Comparar a senha enviada com o Hash do banco
        const senhaValida = await bcrypt.compare(usuario_senha, usuario.usuario_senha);
        if (!senhaValida) {
            res.send(401, { erro: "Senha incorreta." });
            return;
        }

        // Gerar o Token JWT (válido por 1 dia)
        // O payload contém o ID e o Login, que os outros microsserviços poderão ler
        const token = jwt.sign(
            { id: usuario.usuario_id, login: usuario.usuario_login },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.send(200, {
            mensagem: "Login efetuado com sucesso!",
            token: token,
            usuario_id: usuario.usuario_id
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.send(500, { erro: "Erro interno ao efetuar login." });
    }
};

module.exports = {
    cadastrar,
    login
};