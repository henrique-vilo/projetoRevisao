import { create } from '../config/database.js';

// Middleware para registrar logs de acesso
export const logMiddleware = async (req, res, next) => {
    const startTime = Date.now();
    let responseData;
    
    // Capturar dados da requisição (sem usuario_id ainda, será capturado na resposta)
    const logData = {
        rota: req.originalUrl,
        metodo: req.method,
        ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
        userAgent: req.get('User-Agent'),
        dadosRequisicao: JSON.stringify({
            headers: {
                'content-type': req.get('Content-Type'),
                'authorization': req.get('Authorization') ? 'Bearer [REDACTED]' : null,
                'user-agent': req.get('User-Agent')
            },
            body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : null,
            query: Object.keys(req.query).length > 0 ? req.query : null
        })
    };

    // Captura o corpo e grava uma única vez quando a resposta terminar.
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(data) {
        if (responseData === undefined) responseData = data;
        return originalSend.call(this, data);
    };

    res.json = function(data) {
        responseData = data;
        return originalJson.call(this, data);
    };

    res.once('finish', () => {
        const finalLogData = {
            ...logData,
            statusCode: res.statusCode,
            tempoResposta_ms: Date.now() - startTime
        };

        if (req.usuario && req.usuario.id) {
            finalLogData.idUsuario = req.usuario.id;
        }

        if (res.statusCode >= 400) {
            finalLogData.dadosResposta = JSON.stringify({
                error: true,
                status: res.statusCode,
                message: typeof responseData === 'object'
                    ? JSON.stringify(responseData).substring(0, 500)
                    : String(responseData || '').substring(0, 500)
            });
        }

        saveLog(finalLogData).catch(error => {
            console.error('Erro ao salvar log:', error);
        });
    });

    next();
};

// Função para sanitizar dados sensíveis do body
function sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') return body;
    
    const sanitized = { ...body };
    
    // Remover campos sensíveis
    const sensitiveFields = ['senha', 'password', 'token', 'authorization'];
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });
    
    return sanitized;
}

// Função para salvar o log no banco de dados
async function saveLog(logData) {
    try {
        await create('logs', logData);
    } catch (error) {
        console.error('Erro ao inserir log no banco:', error);
    }
}

// Middleware para logs simples (apenas console)
export const simpleLogMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const usuario = req.usuario ? `[${req.usuario.email}]` : '[Anônimo]';
    
    console.log(`${timestamp} - ${req.method} ${req.originalUrl} ${usuario} - IP: ${req.ip || 'N/A'}`);
    
    next();
};
