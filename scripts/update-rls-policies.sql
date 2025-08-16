-- Habilitar acceso público a la tabla de contactos
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Permitir acceso de lectura sin autenticación
CREATE POLICY "Enable read access for all users" ON "public"."contacts"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Habilitar acceso público a la tabla de logs de agentes
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Permitir acceso de lectura sin autenticación
CREATE POLICY "Enable read access for all users" ON "public"."agent_logs"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Opcional: Permitir inserción de logs sin autenticación
CREATE POLICY "Enable insert for anonymous users" ON "public"."agent_logs"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);
