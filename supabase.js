const SUPABASE_URL = 'https://orhdgacjgdolyvodxziy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaGRnYWNqZ2RvbHl2b2R4eml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MDI4NDgsImV4cCI6MjEwNTE3ODg0OH0.4QopUcLK_qkCZEl_kBle8C-KeBv6tKY7prikEJmE5wM';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function testarSupabase() {
  const { data, error } = await supabaseClient
    .from('produtos')
    .select('*');

  if (error) {
    console.error('Erro Supabase:', error);
    return;
  }

  console.log('Supabase conectado!');
  console.log('Produtos:', data);
}

testarSupabase();

async function loginAdmin(email, senha) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    console.error('Erro no login:', error.message);
    return null;
  }

  console.log('Admin autenticado:', data.user.email);
  return data.user;
}