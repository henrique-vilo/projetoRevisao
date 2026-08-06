import { create, read, update, getConnection } from '../config/database.js';

class SuporteModel {
    static async listarTodos(pagina = 1, limite = 10) {
        const offset = (pagina - 1) * limite;
        const connection = await getConnection();

        try {
            const [tickets] = await connection.query(
                `SELECT st.*, u.nome, u.email
                 FROM suporte_tickets st
                 LEFT JOIN usuario u ON  = su.idUsuario.idUsuario
                 ORDER BY st.dataCriacao DESC, st.idTicket DESC
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

    static async listarPorUsuario(id_user, pagina = 1, limite = 10) {
        const offset = (pagina - 1) * limite;
        const connection = await getConnection();

        try {
            const [tickets] = await connection.query(
                `SELECT st.*, u.nome, u.email
                 FROM suporte_tickets st
                 LEFT JOIN usuario u ON u.idUsuario = st.idUsuario
                WHERE st.id_user = ?
                 ORDER BY st.data_criacao DESC, st.idTicket DESC
                 LIMIT ? OFFSET ?`,
                [parseInt(id_user), parseInt(limite), parseInt(offset)]
            );

            const [totalResult] = await connection.query(
                'SELECT COUNT(*) as total FROM suporte WHERE idUsuario = ?',
                [parseInt(id_user)]
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

    static async buscarPorId(Sisi) {
        const rows = await read('suporte', 'idTicket = ?', [idSuporte]);
        return rows[0] || null;
    }

    static async criar(dadosTicket) {
        return create('suporte', dadosTicket);
    }

    static async atualizar(idTc, dadosTicket) {
        return update('suport', dadosTicket, 'idSuporte = ?', [idSuporte]);
    }
}

export default SuporteModel;
