USE Everett;

ALTER TABLE vendas
ADD COLUMN dataEnvio DATE NULL AFTER dataPedido;

UPDATE vendas
SET dataEnvio = COALESCE(dataPedido, CURRENT_DATE())
WHERE status IN ('enviado', 'entregue') AND dataEnvio IS NULL;

CREATE INDEX idx_vendas_status_datas
ON vendas (status, dataEnvio, dataEntrega);
