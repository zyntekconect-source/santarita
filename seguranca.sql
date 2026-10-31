-- =====================================================================
-- SANTA RITA — Segurança do dashboard (só admin cadastra/edita/apaga)
-- Rode no Supabase: SQL Editor → New query. Siga a ORDEM dos passos.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PASSO 1 — Tabela de administradores e função is_admin()
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;

drop policy if exists "ver propria linha de admin" on public.admins;
create policy "ver propria linha de admin"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- PASSO 2 — Cadastre VOCÊ como admin  (TROQUE o e-mail abaixo!)
-- O e-mail precisa ser de um usuário que já existe em Authentication → Users
-- ---------------------------------------------------------------------
insert into public.admins (user_id)
select id from auth.users where email = 'SEU_EMAIL_AQUI'
on conflict do nothing;

-- CONFIRA: deve voltar 1 linha. Se voltar 0, o e-mail está errado — NÃO siga.
select a.user_id, u.email
from public.admins a join auth.users u on u.id = a.user_id;

-- ---------------------------------------------------------------------
-- PASSO 3 — Veja as regras que já existem (para apagar as permissivas)
-- ---------------------------------------------------------------------
select tablename, policyname, cmd, roles
from pg_policies
where (schemaname = 'public'  and tablename = 'produtos')
   or (schemaname = 'storage' and tablename = 'objects')
order by tablename, cmd;
-- Qualquer regra de INSERT / UPDATE / DELETE que NÃO seja uma das minhas abaixo
-- (ex.: "Enable insert for authenticated users") precisa ser apagada, senão
-- continua liberando clientes. Apague com:
--   drop policy "nome da regra" on public.produtos;
--   drop policy "nome da regra" on storage.objects;
-- (NÃO apague regras de SELECT: o site precisa ler os produtos.)

-- ---------------------------------------------------------------------
-- PASSO 4 — Tabela produtos: todos leem, só admin escreve
-- ---------------------------------------------------------------------
alter table public.produtos enable row level security;

drop policy if exists "todos leem produtos"   on public.produtos;
drop policy if exists "admin insere produtos" on public.produtos;
drop policy if exists "admin edita produtos"  on public.produtos;
drop policy if exists "admin apaga produtos"  on public.produtos;

create policy "todos leem produtos"
  on public.produtos for select to anon, authenticated using (true);

create policy "admin insere produtos"
  on public.produtos for insert to authenticated with check (public.is_admin());

create policy "admin edita produtos"
  on public.produtos for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin apaga produtos"
  on public.produtos for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- PASSO 5 — Fotos (bucket "produtos"): só admin envia/troca/apaga
-- (substitui as regras "admin envia imagens" / "admin apaga imagens" antigas,
--  que liberavam QUALQUER usuário logado)
-- ---------------------------------------------------------------------
drop policy if exists "admin envia imagens" on storage.objects;
drop policy if exists "admin apaga imagens" on storage.objects;
drop policy if exists "admin troca imagens" on storage.objects;

create policy "admin envia imagens"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'produtos' and public.is_admin());

create policy "admin troca imagens"
  on storage.objects for update to authenticated
  using (bucket_id = 'produtos' and public.is_admin())
  with check (bucket_id = 'produtos' and public.is_admin());

create policy "admin apaga imagens"
  on storage.objects for delete to authenticated
  using (bucket_id = 'produtos' and public.is_admin());
