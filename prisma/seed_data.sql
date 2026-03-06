-- DADOS DE EXEMPLO (SEED)

-- 1. Usuário Admin
INSERT INTO "User" (id, name, email, "passwordHash", level, status, "forceReset", "createdAt", "updatedAt")
VALUES ('user_admin_001', 'Administrador Master', 'admin@oliviaprado.com.br', '$2a$10$3eYyYyYyYyYyYyYyYyYyYueYyYyYyYyYyYyYyYyYyYyYyYyYyYyY', 'MASTER', 'ATIVO', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- 2. Estados e Cidades
INSERT INTO "LocationState" (id, uf, name, "createdAt")
VALUES ('state_sp', 'SP', 'São Paulo', CURRENT_TIMESTAMP)
ON CONFLICT (uf) DO NOTHING;

INSERT INTO "LocationCity" (id, name, "stateId", "createdAt")
VALUES ('city_sp_cap', 'São Paulo', 'state_sp', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 3. Tipos de Imóvel
INSERT INTO "PropertyType" (id, name, "createdAt")
VALUES ('type_casa', 'Casa', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- 4. Imóvel de Exemplo
INSERT INTO "Property" (id, code, title, status, price, "typeId", "cityId", "bedrooms", "bathrooms", "totalArea", "usefulArea", "createdAt", "updatedAt")
VALUES ('prop_001', 'OLIVIA-001', 'Linda Casa no Morumbi', 'DISPONIVEL', 1500000.00, 'type_casa', 'city_sp_cap', 4, 3, 300.0, 250.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
