const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = 'https://akabrsyifmfdvcgwxsbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrYWJyc3lpZm1mZHZjZ3d4c2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzI2MDIsImV4cCI6MjA3MDgwODYwMn0.FP2P-G5Bz2hNvH0jxHax515HlJYI3kHZ5dlHVOJQrhk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
  try {
    // Verificar la sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (session) {
      console.log('Sesión activa:', session.user.email);
    } else {
      console.log('No hay sesión activa. Intentando autenticación anónima...');
      
      // Intentar autenticación anónima
      const { data, error: signInError } = await supabase.auth.signInAnonymously();
      
      if (signInError) throw signInError;
      
      console.log('Autenticación anónima exitosa');
    }
    
    // Verificar si podemos acceder a los datos
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);
      
    if (contactsError) throw contactsError;
    
    console.log('\nAcceso a datos exitoso');
    console.log('Primer contacto:', contacts[0] ? 'Disponible' : 'No hay contactos');
    
  } catch (error) {
    console.error('Error de autenticación:', error.message);
  }
}

checkAuth();
