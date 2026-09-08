import 'dotenv/config';
import multer from 'multer';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('../', import.meta.url));
export const uploadRoot = path.resolve(backendRoot, process.env.UPLOAD_PATH || './uploads');
const imageDirectory = path.join(uploadRoot, 'imagens');
mkdirSync(imageDirectory, { recursive: true });

const extensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};
const allowedTypes = (process.env.ALLOWED_FILE_TYPES || Object.keys(extensions).join(','))
  .split(',').map((value) => value.trim());
const configuredLimit = Number(process.env.MAX_FILE_SIZE || 5242880);
if (!Number.isSafeInteger(configuredLimit) || configuredLimit <= 0) {
  throw new Error('MAX_FILE_SIZE deve ser um inteiro positivo em bytes.');
}
const imageFields = ['imagem1', 'imagem2', 'imagem3', 'imagem4'];
const receive = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      try {
        mkdirSync(imageDirectory, { recursive: true });
        cb(null, imageDirectory);
      } catch (error) { cb(error); }
    },
    filename(req, file, cb) {
      cb(null, `${randomUUID()}${extensions[file.mimetype]}`);
    },
  }),
  limits: { fileSize: configuredLimit, files: 4, fields: 30, parts: 34 },
  fileFilter(req, file, cb) {
    if (!extensions[file.mimetype] || !allowedTypes.includes(file.mimetype)) {
      const error = new Error('Tipo de imagem não permitido. Utilize JPEG, PNG, GIF ou WebP.');
      error.code = 'INVALID_IMAGE_TYPE';
      return cb(error);
    }
    cb(null, true);
  },
}).fields(imageFields.map((name) => ({ name, maxCount: 1 })));

async function cleanup(files) {
  await Promise.all(files.map(async (file) => {
    try { await unlink(file.path); }
    catch (error) {
      if (error.code !== 'ENOENT') console.error('Falha ao limpar upload:', error);
    }
  }));
}

export function receberImagensProduto(req, res, next) {
  receive(req, res, async (error) => {
    const files = Object.values(req.files || {}).flat();
    if (error) {
      await cleanup(files);
      if (error instanceof multer.MulterError || error.code === 'INVALID_IMAGE_TYPE') {
        const message = error.code === 'LIMIT_FILE_SIZE'
          ? `Cada imagem pode ter no máximo ${configuredLimit / 1024 / 1024} MB.`
          : error.code === 'INVALID_IMAGE_TYPE'
            ? error.message
            : 'Upload inválido: envie até quatro imagens, uma por campo imagem1, imagem2, imagem3 e imagem4.';
        return res.status(400).json({ sucesso: false, erro: message });
      }
      return next(error);
    }

    // Remove somente arquivos desta requisição se o controller recusar a gravação.
    res.once('finish', () => {
      if (res.statusCode >= 400) void cleanup(files);
    });
    req.body ||= {};
    for (const name of imageFields) {
      const file = req.files?.[name]?.[0];
      if (file) req.body[name] = `/uploads/imagens/${file.filename}`;
      if (req.body[name] !== undefined && req.body[name] !== null && typeof req.body[name] !== 'string') {
        return res.status(400).json({ sucesso: false, erro: `Campo ${name} inválido.` });
      }
    }
    if (req.body.imagem1 !== undefined && !String(req.body.imagem1 ?? '').trim()) {
      return res.status(400).json({ sucesso: false, erro: 'A imagem principal é obrigatória.' });
    }
    for (const name of imageFields.slice(1)) {
      if (req.body[name] === '') req.body[name] = null;
    }
    next();
  });
}
