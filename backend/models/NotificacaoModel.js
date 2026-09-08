import { create, read, update, getConnection } from '../config/database.js';

class NotificacaoModel {
    static async listarPorUsuario(idUsuario, pagina = 1, limite = 10) {
        const offset = (pagina - 1) * limite;
        const connection = await getConnection();

        try {
            const [notificacoes] = await connection.query(
                `
                SELECT
                    n.*,
                    s.idSuporte,
                    s.titulo AS suporte_titulo,
                    s.assunto AS suporte_assunto,
                    s.texto AS mensagem_original,
                    s.respostaAdmin AS resposta_admin,
                    admin.nome AS nome_admin_resposta,
                    admin.email AS email_admin_resposta
                FROM notificacoes n
                LEFT JOIN suporte s
                    ON s.idSuporte = n.idSuporte
                LEFT JOIN usuarios admin
                    ON admin.idUsuario = s.idAdminResposta
                WHERE n.idUsuario = ?
                ORDER BY n.dataCriacao DESC, n.idNotificacao DESC
                LIMIT ? OFFSET ?
                `,
                [parseInt(idUsuario), parseInt(limite), parseInt(offset)]
            );

            const [totalResult] = await connection.query(
                `SELECT
                    COUNT(*) AS total,
                    COALESCE(SUM(CASE WHEN lida = 0 OR lida IS NULL THEN 1 ELSE 0 END), 0) AS naoLidas
                FROM notificacoes
                WHERE idUsuario = ?`,
                [parseInt(idUsuario)]
            );

            const total = Number(totalResult[0].total) || 0;
            const naoLidas = Number(totalResult[0].naoLidas) || 0;

            return {
                notificacoes,
                total,
                naoLidas,
                pagina,
                limite,
                totalPaginas: Math.ceil(total / limite)
            };
        } finally {
            connection.release();
        }
    }

    static async buscarPorId(idNotificacao) {
        const rows = await read('notificacoes', 'idNotificacao = ?', [idNotificacao]);
        return rows[0] || null;
    }

    static async criar(dadosNotificacao) {
        return create('notificacoes', dadosNotificacao);
    }

    static async marcarComoLida(idNotificacao) {
        return update('notificacoes', { lida: 1 }, 'idNotificacao = ?', [idNotificacao]);
    }

    static async marcarTodasComoLidas(idUsuario) {
        return update('notificacoes', { lida: 1 }, 'idUsuario = ?', [idUsuario]);
    }
}

export default NotificacaoModel;
