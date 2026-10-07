begin;
alter table public.miaoye_social_profiles add column if not exists nickname text not null default '' check(length(nickname)<=20);
alter table public.miaoye_social_profiles add column if not exists avatar text not null default 'cat:0' check(avatar ~ '^cat:[0-4]$' or (length(avatar)<=200000 and avatar ~ '^data:image/(jpeg|png);base64,[A-Za-z0-9+/=]+$'));
create table if not exists public.miaoye_friend_notes(viewer uuid not null references auth.users(id) on delete cascade,friend uuid not null references auth.users(id) on delete cascade,note text not null check(length(note)<=20),primary key(viewer,friend),check(viewer<>friend));
alter table public.miaoye_friend_notes enable row level security;
revoke all on public.miaoye_friend_notes from public,anon,authenticated;
create or replace function public.miaoye_social_me() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception '请先登录云账号'; end if;
 insert into miaoye_social_profiles(id,username) select id,split_part(email,'@',1) from auth.users where id=auth.uid() on conflict(id) do nothing;
 select jsonb_build_object('id',id,'username',username,'nickname',coalesce(nullif(nickname,''),username),'avatar',avatar) into result from miaoye_social_profiles where id=auth.uid();return result;
end $$;
create or replace function public.miaoye_social_profile(p_nickname text,p_avatar text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform miaoye_social_me();
 if p_nickname is null or length(trim(p_nickname))<1 or length(trim(p_nickname))>20 then raise exception '昵称请填写 1—20 个字';end if;
 if p_avatar is null or not (p_avatar ~ '^cat:[0-4]$' or (length(p_avatar)<=200000 and p_avatar ~ '^data:image/(jpeg|png);base64,[A-Za-z0-9+/=]+$')) then raise exception '头像格式不支持或超过大小限制';end if;
 update miaoye_social_profiles set nickname=trim(p_nickname),avatar=p_avatar where id=auth.uid();return miaoye_social_me();
end $$;
create or replace function public.miaoye_social_note(p_friend uuid,p_note text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null then raise exception '请先登录云账号';end if;
 if p_note is null or length(trim(p_note))>20 then raise exception '备注最多 20 个字';end if;
 if not exists(select 1 from miaoye_friendships f where f.accepted and least(f.sender,f.recipient)=least(auth.uid(),p_friend) and greatest(f.sender,f.recipient)=greatest(auth.uid(),p_friend)) then raise exception '只能为已同意的好友设置备注';end if;
 insert into miaoye_friend_notes(viewer,friend,note) values(auth.uid(),p_friend,trim(p_note)) on conflict(viewer,friend) do update set note=excluded.note;return '{"ok":true}'::jsonb;
end $$;
create or replace function public.miaoye_social_friends() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform miaoye_social_me();
 return coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'user_id',p.id,'username',p.username,'nickname',coalesce(nullif(p.nickname,''),p.username),'avatar',p.avatar,'note',coalesce(n.note,''),'accepted',f.accepted,'incoming',f.recipient=auth.uid()) order by f.created_at desc)
 from miaoye_friendships f join miaoye_social_profiles p on p.id=case when f.sender=auth.uid() then f.recipient else f.sender end
 left join miaoye_friend_notes n on n.viewer=auth.uid() and n.friend=p.id where f.sender=auth.uid() or f.recipient=auth.uid()),'[]'::jsonb);
end $$;
create or replace function public.miaoye_social_feed(p_today boolean default true) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform miaoye_social_me();
 return coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
 select s.id,s.owner,s.title,s.message,s.image,s.journal_day,s.created_at,p.username,coalesce(nullif(p.nickname,''),p.username) as nickname,p.avatar,coalesce(n.note,'') as note,
 (select count(*) from miaoye_likes l where l.post_id=s.id) as likes,exists(select 1 from miaoye_likes l where l.post_id=s.id and l.user_id=auth.uid()) as liked
 from miaoye_shares s join miaoye_social_profiles p on p.id=s.owner left join miaoye_friend_notes n on n.viewer=auth.uid() and n.friend=s.owner
 where (not p_today or s.journal_day=(now() at time zone 'Asia/Singapore')::date)
 and (s.owner=auth.uid() or exists(select 1 from miaoye_friendships f where f.accepted and least(f.sender,f.recipient)=least(auth.uid(),s.owner) and greatest(f.sender,f.recipient)=greatest(auth.uid(),s.owner)))
 order by s.created_at desc limit 30) q),'[]'::jsonb);
end $$;
revoke all on function public.miaoye_social_profile(text,text),public.miaoye_social_note(uuid,text) from public,anon;
grant execute on function public.miaoye_social_profile(text,text),public.miaoye_social_note(uuid,text) to authenticated;
commit;
