create table if not exists public.miaoye_backups (
  id uuid primary key,
  user_id uuid not null default auth.uid(),
  device_id uuid not null,
  path text not null,
  bytes integer not null check(bytes > 0 and bytes <= 52428800),
  entries integer not null default 0,
  created_at timestamptz not null default now(),
  check(path = user_id::text || '/' || device_id::text || '/' || id::text || '.json')
);
alter table public.miaoye_backups enable row level security;
revoke all on public.miaoye_backups from anon;
grant select,insert,delete on public.miaoye_backups to authenticated;
create policy own_backups on public.miaoye_backups for all to authenticated
  using(user_id=auth.uid()) with check(user_id=auth.uid());
create index if not exists miaoye_backups_owner on public.miaoye_backups(user_id,created_at desc);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('miaoye-private','miaoye-private',false,52428800,array['application/json'])
on conflict(id) do update set public=false,file_size_limit=52428800,allowed_mime_types=array['application/json'];
create policy miaoye_private_owner on storage.objects for all to authenticated
using(bucket_id='miaoye-private' and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='miaoye-private' and (storage.foldername(name))[1]=auth.uid()::text);
