USE Everett;

INSERT INTO produtos (
    sku, nome, nomeCombinacao, descricao, genero, preco, 
    idCategoria, idSubcategoria, idCor, idTamanho, idModelo, 
    imagem1, imagem2, imagem3, imagem4, estoque
) VALUES
('CAM-PRE-M', 'Camiseta Básica', 'Camiseta Básica - Preta - M - Reta', 'Camiseta básica ideal para o dia a dia.', 'Masculino', 59.90, 1, 1, 2, 3, 3, 'img_camisapreta_front.jpg', 'img_camisapreta_back.jpg', NULL, NULL, 150),
('SOC-BRA-G', 'Camisa Social', 'Camisa Social - Branca - G - Slim Fit', 'Elegância para o ambiente corporativo.', 'Masculino', 129.90, 1, 10, 1, 4, 1, 'img_social_branca.jpg', NULL, NULL, NULL, 40),
('JEA-AZU-42', 'Calça Jeans Masculina', 'Calça Jeans - Azul Marinho - 42 - Reta', 'Jeans de alta durabilidade com elastano.', 'Masculino', 149.90, 1, 2, 3, 10, 3, 'img_jeans_azul_f.jpg', 'img_jeans_azul_b.jpg', 'img_jeans_azul_detalhe.jpg', NULL, 85),
('VES-VER-P', 'Vestido Midi', 'Vestido Midi - Vermelho - P - Alfaiataria', 'Vestido elegante para eventos corporativos e sociais.', 'Feminino', 229.90, 2, 5, 4, 2, 8, 'img_vestido_verm.jpg', 'img_vestido_verm2.jpg', 'img_vestido_verm3.jpg', NULL, 30),
('CAL-SKI-40', 'Calça Skinny', 'Calça Skinny - Preta - 40', 'Calça justa e confortável, modela o corpo.', 'Feminino', 119.90, 2, 2, 2, 9, 4, 'img_calca_skinny_preta.jpg', 'img_calca_skinny_preta_costas.jpg', NULL, NULL, 120),
('SAI-ROS-M', 'Saia Curta', 'Saia Curta - Rosa Pastel - M', 'Saia perfeita para os dias quentes.', 'Feminino', 89.90, 2, 9, 8, 3, 6, 'img_saia_rosa.jpg', NULL, NULL, NULL, 45),
('PIJ-VIN-M', 'Pijama Confort', 'Pijama Confort - Vinho - M', 'Conjunto de pijama super macio para noites relaxantes.', 'Feminino', 99.90, 2, 3, 12, 3, 3, 'img_pijama_vinho.jpg', NULL, NULL, NULL, 65),
('TSH-AMA-INF', 'T-Shirt Divertida', 'T-Shirt - Amarela - P', 'T-Shirt leve com estampa moderna e divertida para crianças.', 'Infantil', 49.90, 3, 1, 6, 2, 3, 'img_tshirt_amarela_inf.jpg', NULL, NULL, NULL, 90),
('BON-PRE-M', 'Boné Aba Reta', 'Boné Aba Reta - Preto - M - Streetwear', 'Boné ajustável e super estiloso.', 'Unissex', 45.90, 4, 7, 2, 3, 9, 'img_bone_preto.jpg', 'img_bone_preto_lado.jpg', NULL, NULL, 400),
('DRY-VER-G', 'Camiseta Dryfit', 'Dryfit - Verde Esmeralda - G', 'Tecnologia que absorve suor e mantém o corpo fresco.', 'Masculino', 69.90, 5, 1, 15, 4, 5, 'img_dryfit_verde.jpg', 'img_dryfit_verde2.jpg', NULL, NULL, 140),
('LEG-PRE-M', 'Legging Alta Performance', 'Legging - Preta - M', 'Alta compressão, zero transparência, ideal para agachamentos.', 'Feminino', 89.90, 5, 11, 2, 3, 5, 'img_legging_preta.jpg', 'img_legging_preta2.jpg', NULL, NULL, 210),
('SHO-AZU-G', 'Shorts de Corrida', 'Shorts Corrida - Azul Marinho - G', 'Leve, respirável e com bolso interno para chaves.', 'Masculino', 79.90, 5, 6, 3, 4, 5, 'img_shorts_corrida_azul.jpg', NULL, NULL, NULL, 130),
('MOL-CIN-GG', 'Moletom Canguru', 'Moletom - Cinza Mescla - GG - Oversized', 'Moletom macio e flanelado com capuz.', 'Unissex', 119.90, 7, 8, 5, 5, 2, 'img_moletom_cinza_1.jpg', 'img_moletom_cinza_2.jpg', NULL, NULL, 60),
('JAQ-COU-M', 'Jaqueta de Couro', 'Jaqueta Couro - Marrom - M - Vintage', 'Jaqueta clássica de material sintético de alta qualidade.', 'Feminino', 299.90, 7, 4, 13, 3, 10, 'img_jaqueta_couro_marrom.jpg', 'img_jaqueta_couro_marrom2.jpg', NULL, NULL, 15),
('CAS-INV-BEG', 'Casaco de Frio Intenso', 'Casaco Inverno - Bege - GG', 'Proteção extrema contra o frio intenso, forrado por dentro.', 'Unissex', 349.90, 7, 4, 10, 5, 6, 'img_casaco_inverno_bege.jpg', 'img_casaco_inverno_bege_det.jpg', NULL, NULL, 40);