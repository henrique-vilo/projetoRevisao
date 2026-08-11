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