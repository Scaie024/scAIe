const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = 'https://akabrsyifmfdvcgwxsbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrYWJyc3lpZm1mZHZjZ3d4c2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzI2MDIsImV4cCI6MjA3MDgwODYwMn0.FP2P-G5Bz2hNvH0jxHax515HlJYI3kHZ5dlHVOJQrhk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  try {
    // Contar registros en contacts
    const { count: contactsCount, error: contactsError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    if (contactsError) throw contactsError;
    console.log(`\nRegistros en contacts: ${contactsCount}`);

    // Contar registros en agent_logs
    const { count: logsCount, error: logsError } = await supabase
      .from('agent_logs')
      .select('*', { count: 'exact', head: true });

    if (logsError) throw logsError;
    console.log(`Registros en agent_logs: ${logsCount}`);

    // Si no hay datos, sugerir cargar datos de ejemplo
    if (contactsCount === 0 && logsCount === 0) {
      console.log('\nNo se encontraron datos. ¿Deseas cargar datos de ejemplo? (s/n)');
      // Aquí podríamos agregar lógica para cargar datos de ejemplo
    }

  } catch (error) {
    console.error('Error al verificar datos:', error);
  }
}

checkData();
