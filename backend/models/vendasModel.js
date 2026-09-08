import { getConnection } from '../config/database.js';

const CAMPOS = new Set(['idUsuario', 'idProduto', 'dataPedido', 'dataEntrega', 'status']);
const SELECT_VENDAS = `SELECT v.*, v.STATUS AS status, u.nome AS nomeUsuario, p.nome AS nomeProduto
    FROM vendas v
    LEFT JOIN usuarios u ON u.idUsuario = v.idUsuario
    LEFT JOIN produtos p ON p.idProduto = v.idProduto`;

async function consultar(sql, params = []) {
    const connection = await getConnection();
    try {
        const [result] = await connection.query(sql, params);
        return result;
    } finally {
        connection.release();
    }
}

function camposValidos(dados) {
    const entries = Object.entries(dados).filter(([key, value]) => CAMPOS.has(key) && value !== undefined);
    if (!entries.length) throw new Error('Nenhum campo válido para salvar.');
    return entries.map(([key, value]) => [key === 'status' ? 'STATUS' : key, value]);
}

class VendaModel {
    static async listarTodos(limite, offset, busca = '', idUsuario = null) {
        const conditions = [];
        const params = [];
        if (idUsuario !== null) {
            conditions.push('v.idUsuario = ?');
            params.push(idUsuario);
        }
        if (busca) {
            conditions.push(`(CAST(v.idVendas AS CHAR) LIKE ? OR CAST(v.idUsuario AS CHAR) LIKE ?
                OR CAST(v.idProduto AS CHAR) LIKE ? OR u.nome LIKE ? OR p.nome LIKE ? OR v.STATUS LIKE ?)`);
            params.push(...Array(6).fill(`%${busca}%`));
        }
        const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
        const connection = await getConnection();
        try {
            const [vendas] = await connection.query(`${SELECT_VENDAS}${where} ORDER BY v.idVendas DESC LIMIT ? OFFSET ?`, [...params, limite, offset]);
            const [totais] = await connection.query(`SELECT COUNT(*) AS total FROM vendas v
                LEFT JOIN usuarios u ON u.idUsuario = v.idUsuario
                LEFT JOIN produtos p ON p.idProduto = v.idProduto${where}`, params);
            const total = Number(totais[0].total);
            return { vendas, total, pagina: offset / limite + 1, limite, totalPaginas: Math.ceil(total / limite) };
        } finally {
            connection.release();
        }
    }

    static async buscarPorId(id) {
        const rows = await consultar(`${SELECT_VENDAS} WHERE v.idVendas = ?`, [id]);
        return rows[0] || null;
    }

    static async buscarPorUsuario(idUsuario) {
        return consultar(`${SELECT_VENDAS} WHERE v.idUsuario = ? ORDER BY v.idVendas DESC`, [idUsuario]);
    }

    static async buscarUsuarioVenda(idUsuario) {
        const rows = await consultar('SELECT idUsuario, cep FROM usuarios WHERE idUsuario = ?', [idUsuario]);
        return rows[0] || null;
    }

    static async buscarProdutoVenda(idProduto) {
        const rows = await consultar('SELECT idProduto FROM produtos WHERE idProduto = ?', [idProduto]);
        return rows[0] || null;
    }

    static async criar(dadosVenda) {
        const entries = camposValidos(dadosVenda);
        const result = await consultar(`INSERT INTO vendas (${entries.map(([key]) => key).join(', ')}) VALUES (${entries.map(() => '?').join(', ')})`, entries.map(([, value]) => value));
        return result.insertId;
    }

    static async atualizar(id, dadosVenda) {
        const entries = camposValidos(dadosVenda);
        const result = await consultar(`UPDATE vendas SET ${entries.map(([key]) => `${key} = ?`).join(', ')} WHERE idVendas = ?`, [...entries.map(([, value]) => value), id]);
        return result.affectedRows;
    }

    static async excluir(id) {
        const result = await consultar('DELETE FROM vendas WHERE idVendas = ?', [id]);
        return result.affectedRows;
    }
}

export default VendaModel;
