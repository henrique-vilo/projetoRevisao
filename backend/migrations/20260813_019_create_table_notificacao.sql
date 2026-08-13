CREATE TABLE IF NOT EXISTS notificacoes (
    idNotificacao INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idSuporte INT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'sistema',
    lida TINYINT(1) NOT NULL DEFAULT 0,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idxNotificacoesIdUsuario (idUsuario),
    INDEX idxNotificacoesIdSuporte (idSuporte),

    FOREIGN KEY (idUsuario)
        REFERENCES usuarios(idUsuario)
        ON DELETE CASCADE,

    FOREIGN KEY (idSuporte)
        REFERENCES suporte(idSuporte)
        ON DELETE CASCADE
);
