USE Everett;

CREATE TABLE vendas(
idVendas INT AUTO_INCREMENT PRIMARY KEY,
idUsuario INT NOT NULL,
idProduto INT NOT NULL,
dataPedido DATE NOT NULL,
dataEntrega DATE NOT NULL,

STATUS ENUM('carrino', 'pendente', 'processando', 'enviado', 'entregue', 'cancelado') NOT NULL DEFAULT 'pendente',

CONSTRAINT fkVendasUsuarios
FOREIGN KEY (idUsuario)
REFERENCES usuarios(idUsuario) ON UPDATE CASCADE ON DELETE CASCADE,

CONSTRAINT fkVendasProdutos
FOREIGN KEY (idProduto)
REFERENCES produtos(idProduto) ON UPDATE CASCADE ON DELETE CASCADE 
);