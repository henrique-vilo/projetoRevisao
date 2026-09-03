import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar pastas de uploads se não existirem
const uploadPathImagens = path.join(__dirname, '..', 'uploads', 'imagens');
const uploadPathArquivos = path.join(__dirname, '..', 'uploads', 'arquivos');

if (!fs.existsSync(uploadPathImagens)) {
    fs.mkdirSync(uploadPathImagens, { recursive: true });
}

if (!fs.existsSync(uploadPathArquivos)) {
    fs.mkdirSync(uploadPathArquivos, { recursive: true });
}

// Função para gerar nome único com timestamp
const gerarNomeUnico = (nomeOriginal) => {
    const timestamp = Date.now();
    const extensao = path.extname(nomeOriginal);
    const nomeSemExtensao = path.basename(nomeOriginal, extensao).replace(/[^a-zA-Z0-9]/g, '_');
    return `${timestamp}-${nomeSemExtensao}${extensao}`;
};

// Configuração do multer para upload de imagens
const storageImagens = multer.diskStorage({
    destination: (req, file, cb) => {
        // Verificar se pasta existe, criar se não existir
        if (!fs.existsSync(uploadPathImagens)) {
            fs.mkdirSync(uploadPathImagens, { recursive: true });
        }
        cb(null, uploadPathImagens);
    },
    filename: (req, file, cb) => {
        const nomeArquivo = gerarNomeUnico(file.originalname);
        cb(null, nomeArquivo);
    }
});


// Verificar se é imagem
const isImage = (mimetype) => {
    return mimetype.startsWith('image/');
};

// Filtro para tipos de arquivo permitidos (imagens)
const fileFilterImagens = (req, file, cb) => {
    const tiposPermitidos = process.env.ALLOWED_FILE_TYPES ? 
        process.env.ALLOWED_FILE_TYPES.split(',').map(t => t.trim()) : 
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${tiposPermitidos.join(', ')}`), false);
    }
};


// Obter tamanho máximo do arquivo
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB por padrão

// Upload para imagens
const upload = multer({
    storage: storageImagens,
    limits: {
        fileSize: maxFileSize
    },
    fileFilter: fileFilterImagens
});

// Middleware para tratamento de erros do multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                sucesso: false,
                erro: 'Arquivo muito grande',
                mensagem: `Tamanho máximo permitido: ${maxFileSize / 1024 / 1024}MB`
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                sucesso: false,
                erro: 'Muitos arquivos',
                mensagem: 'Apenas um arquivo por vez é permitido'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                sucesso: false,
                erro: 'Campo de arquivo inválido',
                mensagem: 'Verifique o nome do campo no formulário'
            });
        }
    }
    
    if (error.message && error.message.includes('Tipo de arquivo não permitido')) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Tipo de arquivo inválido',
            mensagem: error.message
        });
    }

    next(error);
};

// Função helper para remover arquivo antigo
export const removerArquivoAntigo = async (nomeArquivo, tipo = 'imagem') => {
    try {
        if (!nomeArquivo) return;
        
        const nomeSeguro = path.basename(String(nomeArquivo).replace(/\\/g, '/'));
        const caminhoArquivo = tipo === 'imagem'
            ? path.join(uploadPathImagens, nomeSeguro)
            : path.join(uploadPathArquivos, nomeSeguro);
        
        if (fs.existsSync(caminhoArquivo)) {
            fs.unlinkSync(caminhoArquivo);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao remover arquivo antigo:', error);
        return false;
    }
};

export { upload, handleUploadError };
