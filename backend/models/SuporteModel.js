import { create, read, update, getConnection } from '../config/database.js';

class SuporteModel {
    static async listarTodos(pagina = 1, limite = 10) {
        const offset = (pagina - 1) * limite;
        const connection = await getConnection();

        try {
            const [tickets] = await connection.query(
                `SELECT s.*, u.nome, u.email
                 FROM suporte s
                 LEFT JOIN usuarios u ON u.idUsuario = s.idUsuario
                 ORDER BY s.idSuporte DESC
                 LIMIT ? OFFSET ?`,
                [parseInt(limite), parseInt(offset)]
            );

            const [totalResult] = await connection.query('SELECT COUNT(*) as total FROM suporte');
            const total = totalResult[0].total;

            return {
                tickets,
                total,
                pagina,
                limite,
                totalPaginas: Math.ceil(total / limite)
            };
        } finally {
            connection.release();
        }
    }

    static async listarPorUsuario(idUsuario, pagina = 1, limite = 10) {
        const offset = (pagina - 1) * limite;
        const connection = await getConnection();

        try {
            const [tickets] = await connection.query(
                `SELECT s.*, u.nome, u.email
                 FROM suporte s
                 LEFT JOIN usuarios u ON u.idUsuario = s.idUsuario
                 WHERE s.idUsuario = ?
                 ORDER BY s.idSuporte DESC
                 LIMIT ? OFFSET ?`,
                [parseInt(idUsuario), parseInt(limite), parseInt(offset)]
            );

            const [totalResult] = await connection.query(
                'SELECT COUNT(*) as total FROM suporte WHERE idUsuario = ?',
                [parseInt(idUsuario)]
            );
            const total = totalResult[0].total;

            return {
                tickets,
                total,
                pagina,
                limite,
                totalPaginas: Math.ceil(total / limite)
            };
        } finally {
            connection.release();
        }
    }

    static async listarAdministradores() {
        const connection = await getConnection();
        try {
            // ATENÇÃO: Ajuste a cláusula WHERE ('tipo = "admin"') 
            // de acordo com como o seu banco identifica um administrador.
            const [admins] = await connection.query(
                `SELECT idUsuario, nome, email 
                 FROM usuarios 
                 WHERE tipo = 'admin'`
            );
            return admins;
        } catch (error) {
            console.error('Erro ao listar administradores:', error);
            return [];
        } finally {
            if (connection) connection.release();
        }
    }

    static async buscarPorId(idSuporte) {
        const rows = await read('suporte', 'idSuporte = ?', [idSuporte]);
        return rows[0] || null;
    }

    static async criar(dadosTicket) {
        return create('suporte', dadosTicket);
    }

    static async atualizar(idSuporte, dadosTicket) {
        return update('suporte', dadosTicket, 'idSuporte = ?', [idSuporte]);
    }
}

export default SuporteModel;