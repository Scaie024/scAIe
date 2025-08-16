const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = 'https://akabrsyifmfdvcgwxsbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrYWJyc3lpZm1mZHZjZ3d4c2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzI2MDIsImV4cCI6MjA3MDgwODYwMn0.FP2P-G5Bz2hNvH0jxHax515HlJYI3kHZ5dlHVOJQrhk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    // Verificar tabla de contactos
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);

    if (contactsError) {
      console.error('Error al acceder a la tabla contacts:', contactsError);
    } else {
      console.log('Tabla contacts:', contacts ? 'Existe' : 'No existe o está vacía');
    }

    // Verificar tabla de logs de agentes
    const { data: logs, error: logsError } = await supabase
      .from('agent_logs')
      .select('*')
      .limit(1);

    if (logsError) {
      console.error('Error al acceder a la tabla agent_logs:', logsError);
    } else {
      console.log('Tabla agent_logs:', logs ? 'Existe' : 'No existe o está vacía');
    }

    // Si no existen las tablas, sugerir crearlas
    if (contactsError?.code === '42P01' || logsError?.code === '42P01') {
      console.log('\nParece que las tablas no existen. ¿Deseas crearlas? (s/n)');
      // Aquí podríamos agregar lógica para crear las tablas
    }

  } catch (error) {
    console.error('Error general:', error);
  }
}

checkTables();
