USE Everett;

CREATE TABLE suporte(
idSuporte INT AUTO_INCREMENT PRIMARY KEY,
idUsuario INT NOT NULL,
titulo varchar(250) not null,
assunto varchar(250) not null,
texto text not null,
CONSTRAINT fkSuporteUsuarios
FOREIGN KEY (idUsuario)
REFERENCES usuarios(idUsuario) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE suporte(
    ADD COLUMN respostaAdmin TEXT,
    ADD COLUMN INT NULL AFTER respostaAdmin,
    ADD CONSTRAINT fkSuporteAdminResposta
    FOREIGN KEY (idAdminResposta)
    REFERENCES usuarios(idUsuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
)