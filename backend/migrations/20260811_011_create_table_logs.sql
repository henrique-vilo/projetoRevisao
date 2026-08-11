USE Everett;

CREATE TABLE IF NOT EXISTS logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT,
    rota VARCHAR(255) NOT NULL,
    metodo VARCHAR(10) NOT NULL,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    statusCode INT,
    tempoResposta_ms INT,
    dataHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    dadosRequisicao JSON,
    dadosResposta JSON,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
    );
    
CREATE INDEX idx_logs_idUsuario ON logs(idUsuario);
CREATE INDEX idx_logs_dataHora ON logs(dataHora);
CREATE INDEX idx_logsRota ON logs(rota);
CREATE INDEX idx_logsMetodo ON logs(metodo);
CREATE INDEX idx_logsStatusCode ON logs(statusCode);