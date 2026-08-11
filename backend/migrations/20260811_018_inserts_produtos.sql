USE Everett;

INSERT INTO produtos (idCategoria, idSubcategoria, idCor, idTamanho, idModelo, imagem, imagem1, imagem2, imagem3, estoque) VALUES
(1, 1, 2, 3, 2, 'img_camisapreta_front.jpg', 'img_camisapreta_back.jpg', NULL, NULL, 150),
(1, 1, 1, 4, 1, 'img_camisabranca_front.jpg', NULL, NULL, NULL, 200),
(1, 2, 3, 9, 4, 'img_jeans_azul_f.jpg', 'img_jeans_azul_b.jpg', 'img_jeans_azul_detalhe.jpg', NULL, 85),
(1, 14, 1, 3, 7, 'img_social_branca.jpg', NULL, NULL, NULL, 40),
(1, 10, 5, 5, 2, 'img_moletom_cinza_1.jpg', 'img_moletom_cinza_2.jpg', NULL, NULL, 60),

(2, 5, 4, 2, 6, 'img_vestido_verm.jpg', 'img_vestido_verm2.jpg', 'img_vestido_verm3.jpg', NULL, 30),
(2, 2, 2, 8, 4, 'img_calca_skinny_preta.jpg', 'img_calca_skinny_preta_costas.jpg', NULL, NULL, 120),
(2, 11, 8, 3, 3, 'img_saia_rosa.jpg', NULL, NULL, NULL, 45),
(2, 1, 6, 2, 2, 'img_tshirt_amarela.jpg', NULL, NULL, NULL, 90),
(2, 4, 13, 3, 10, 'img_jaqueta_couro_marrom.jpg', 'img_jaqueta_couro_marrom2.jpg', NULL, NULL, 15),

(4, 3, 1, 9, 6, 'img_tenis_branco_1.jpg', 'img_tenis_branco_2.jpg', 'img_tenis_branco_3.jpg', 'img_tenis_branco_4.jpg', 300),
(4, 3, 2, 10, 5, 'img_tenis_esporte_preto.jpg', 'img_tenis_esporte_preto2.jpg', NULL, NULL, 180),
(4, 12, 13, 8, 8, 'img_bota_marrom.jpg', NULL, NULL, NULL, 50),
(4, 3, 11, 7, 9, 'img_tenis_azulbebe.jpg', 'img_tenis_azulbebe2.jpg', NULL, NULL, 25),
(4, 12, 2, 10, 3, 'img_bota_coturno_preto.jpg', NULL, NULL, NULL, 75),

(5, 7, 2, 12, 9, 'img_bone_preto.jpg', 'img_bone_preto_lado.jpg', NULL, NULL, 400),
(5, 13, 13, 12, 7, 'img_cinto_marrom.jpg', NULL, NULL, NULL, 110),
(5, 7, 4, 12, 5, 'img_bone_esporte_verm.jpg', NULL, NULL, NULL, 80),
(5, 13, 2, 12, 6, 'img_cinto_preto_basico.jpg', NULL, NULL, NULL, 250),
(5, 8, 1, 12, 5, 'img_meia_branca_par.jpg', NULL, NULL, NULL, 500),

(6, 1, 15, 4, 5, 'img_dryfit_verde.jpg', 'img_dryfit_verde2.jpg', NULL, NULL, 140),
(6, 15, 2, 3, 5, 'img_legging_preta.jpg', 'img_legging_preta2.jpg', NULL, NULL, 210),
(6, 6, 3, 4, 5, 'img_shorts_corrida_azul.jpg', NULL, NULL, NULL, 130),
(6, 10, 5, 4, 5, 'img_moletom_esporte_cinza.jpg', NULL, NULL, NULL, 90),
(6, 8, 2, 12, 5, 'img_meia_compressao.jpg', NULL, NULL, NULL, 300),

(7, 9, 4, 3, 6, 'img_biquini_verm.jpg', 'img_biquini_verm2.jpg', NULL, NULL, 85),
(8, 8, 10, 3, 3, 'img_sutia_bege.jpg', NULL, NULL, NULL, 150),
(9, 4, 2, 5, 2, 'img_casaco_inverno_preto.jpg', 'img_casaco_inverno_preto_det.jpg', NULL, NULL, 40),
(10, 1, 9, 6, 2, 'img_tshirt_laranja_plus.jpg', NULL, NULL, NULL, 60),
(10, 2, 3, 11, 4, 'img_jeans_plus_azul.jpg', 'img_jeans_plus_azul_costas.jpg', NULL, NULL, 75);