-- Cadastra (ou corrige) o administrador. TROQUE o e-mail pelo que você usa para entrar.
-- Precisa já ter rodado o PASSO 1 do seguranca.sql (cria a tabela "admins").
insert into public.admins (user_id)
select id from auth.users where email = 'henriquesoaressouza55@gmail.com'
on conflict do nothing;

-- Confira: deve aparecer 1 linha com o seu e-mail.
select a.user_id, u.email
from public.admins a
join auth.users u on u.id = a.user_id;
