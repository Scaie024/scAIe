const { createClient } = require('../lib/supabase/server');

async function checkTables() {
  try {
    const supabase = createClient();
    
    // Verificar tabla de contactos
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);
      
    console.log('Tabla contacts:', contactsError ? 'Error' : 'OK');
    
    // Verificar tabla de logs de agentes
    const { data: logs, error: logsError } = await supabase
      .from('agent_logs')
      .select('*')
      .limit(1);
      
    console.log('Tabla agent_logs:', logsError ? 'Error' : 'OK');
    
    // Mostrar esquema de las tablas si existen
    if (!contactsError) {
      const { data: columns } = await supabase
        .rpc('get_columns', { table_name: 'contacts' });
      console.log('\nEstructura de contacts:', columns);
    }
    
    if (!logsError) {
      const { data: columns } = await supabase
        .rpc('get_columns', { table_name: 'agent_logs' });
      console.log('\nEstructura de agent_logs:', columns);
    }
    
  } catch (error) {
    console.error('Error al verificar tablas:', error);
  }
}

checkTables();
