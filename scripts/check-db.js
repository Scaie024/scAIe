const { Client } = require('pg');
require('dotenv').config();

// Configuración de la conexión a Supabase
const client = new Client({
  connectionString: 'postgresql://postgres:Peditos123*@db.akabrsyifmfdvcgwxsbn.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false } // Necesario para Supabase
});

async function checkDatabase() {
  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('Conexión exitosa a la base de datos');

    // Verificar si las tablas existen
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('contacts', 'agent_logs')
    `);

    console.log('\nTablas encontradas:');
    console.log(tablesRes.rows.map(r => r.table_name).join(', ') || 'Ninguna tabla encontrada');

    // Si hay tablas, mostrar conteo de registros
    if (tablesRes.rows.length > 0) {
      for (const row of tablesRes.rows) {
        const countRes = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
        console.log(`\n${row.table_name}: ${countRes.rows[0].count} registros`);
      }
    } else {
      console.log('\nNo se encontraron las tablas. ¿Deseas ejecutar los scripts de inicialización? (s/n)');
      // Aquí podríamos agregar lógica para ejecutar automáticamente los scripts
    }

  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
