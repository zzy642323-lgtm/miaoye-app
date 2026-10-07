begin;
create table public.miaoye_social_profiles(id uuid primary key references auth.users(id) on delete cascade,username text unique not null);
create table public.miaoye_friendships(id uuid primary key default gen_random_uuid(),sender uuid not null references auth.users(id) on delete cascade,recipient uuid not null references auth.users(id) on delete cascade,accepted boolean not null default false,created_at timestamptz not null default now(),check(sender<>recipient));
create unique index miaoye_friend_pair on public.miaoye_friendships(least(sender,recipient),greatest(sender,recipient));
create table public.miaoye_shares(id uuid primary key default gen_random_uuid(),owner uuid not null references auth.users(id) on delete cascade,entry_id text not null check(length(entry_id)<=100),journal_day date not null,title text not null check(length(title)<=100),message text not null check(length(message)<=300),image text not null check(length(image)<=1500000),created_at timestamptz not null default now(),unique(owner,entry_id));
create table public.miaoye_likes(post_id uuid not null references public.miaoye_shares(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,primary key(post_id,user_id));
alter table public.miaoye_social_profiles enable row level security;
alter table public.miaoye_friendships enable row level security;
alter table public.miaoye_shares enable row level security;
alter table public.miaoye_likes enable row level security;
revoke all on public.miaoye_social_profiles,public.miaoye_friendships,public.miaoye_shares,public.miaoye_likes from anon,authenticated;

create function public.miaoye_social_me() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception '请先登录云账号'; end if;
 insert into miaoye_social_profiles(id,username) select id,split_part(email,'@',1) from auth.users where id=auth.uid() on conflict(id) do nothing;
 select jsonb_build_object('id',id,'username',username) into result from miaoye_social_profiles where id=auth.uid();return result;
end $$;
create function public.miaoye_social_friends() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform miaoye_social_me();
 return coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'username',p.username,'accepted',f.accepted,'incoming',f.recipient=auth.uid()) order by f.created_at desc) from miaoye_friendships f join miaoye_social_profiles p on p.id=case when f.sender=auth.uid() then f.recipient else f.sender end where f.sender=auth.uid() or f.recipient=auth.uid()),'[]'::jsonb);
end $$;
create function public.miaoye_social_request(p_username text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare target uuid;
begin
 perform miaoye_social_me();
 if p_username !~ '^[A-Za-z0-9_]{3,32}$' then raise exception '请填写好友的喵页用户名'; end if;
 select id into target from auth.users where lower(email)=lower(p_username)||'@meoo.local';
 if target is null then raise exception '没有找到这个喵页账号，请确认好友已经注册'; end if;
 if target=auth.uid() then raise exception '不能添加自己为好友'; end if;
 if (select count(*) from miaoye_friendships where sender=auth.uid() or recipient=auth.uid())>=100 then raise exception '好友和申请已达到 100 条上限'; end if;
 insert into miaoye_social_profiles(id,username) values(target,lower(p_username)) on conflict(id) do nothing;
 if exists(select 1 from miaoye_friendships where least(sender,recipient)=least(auth.uid(),target) and greatest(sender,recipient)=greatest(auth.uid(),target)) then raise exception '你们已经是好友或已有待处理申请'; end if;
 insert into miaoye_friendships(sender,recipient) values(auth.uid(),target);return '{"ok":true}'::jsonb;
end $$;
create function public.miaoye_social_friend_action(p_id uuid,p_action text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null then raise exception '请先登录云账号'; end if;
 if p_action='accept' then
  update miaoye_friendships set accepted=true where id=p_id and recipient=auth.uid() and accepted=false;
 elsif p_action='remove' then
  delete from miaoye_friendships where id=p_id and (sender=auth.uid() or recipient=auth.uid());
 else raise exception '不支持的好友操作';end if;
 if not found then raise exception '申请已失效或无权操作';end if;
 return '{"ok":true}'::jsonb;
end $$;
create function public.miaoye_social_publish(p_entry text,p_day date,p_title text,p_message text,p_image text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare result uuid;
begin
 perform miaoye_social_me();
 if p_image !~ '^data:image/(jpeg|png);base64,[A-Za-z0-9+/=]+$' or length(p_image)>1500000 then raise exception '分享图片格式错误或超过 1 MB，请缩小后重试';end if;
 if length(p_entry)=0 or length(p_title)>100 or length(p_message)>300 then raise exception '分享内容超出长度限制';end if;
 if (select count(*) from miaoye_shares where owner=auth.uid())>=100 and not exists(select 1 from miaoye_shares where owner=auth.uid() and entry_id=p_entry) then raise exception '分享已达到 100 条，请撤回一些旧分享';end if;
 insert into miaoye_shares(owner,entry_id,journal_day,title,message,image) values(auth.uid(),p_entry,p_day,p_title,p_message,p_image)
 on conflict(owner,entry_id) do update set journal_day=excluded.journal_day,title=excluded.title,message=excluded.message,image=excluded.image,created_at=now() returning id into result;
 return jsonb_build_object('id',result);
end $$;
create function public.miaoye_social_feed(p_today boolean default true) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform miaoye_social_me();
 return coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
 select s.id,s.owner,s.title,s.message,s.image,s.journal_day,s.created_at,p.username,
 (select count(*) from miaoye_likes l where l.post_id=s.id) as likes,
 exists(select 1 from miaoye_likes l where l.post_id=s.id and l.user_id=auth.uid()) as liked
 from miaoye_shares s join miaoye_social_profiles p on p.id=s.owner
 where (not p_today or s.journal_day=(now() at time zone 'Asia/Singapore')::date)
 and (s.owner=auth.uid() or exists(select 1 from miaoye_friendships f where f.accepted and least(f.sender,f.recipient)=least(auth.uid(),s.owner) and greatest(f.sender,f.recipient)=greatest(auth.uid(),s.owner)))
 order by s.created_at desc limit 30) q),'[]'::jsonb);
end $$;
create function public.miaoye_social_like(p_id uuid,p_like boolean) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare owner_id uuid;
begin
 if auth.uid() is null then raise exception '请先登录云账号';end if;
 select owner into owner_id from miaoye_shares where id=p_id;
 if owner_id is null or (owner_id<>auth.uid() and not exists(select 1 from miaoye_friendships f where f.accepted and least(f.sender,f.recipient)=least(auth.uid(),owner_id) and greatest(f.sender,f.recipient)=greatest(auth.uid(),owner_id))) then raise exception '分享已撤回或仅好友可见';end if;
 if p_like then insert into miaoye_likes values(p_id,auth.uid()) on conflict do nothing;else delete from miaoye_likes where post_id=p_id and user_id=auth.uid();end if;
 return '{"ok":true}'::jsonb;
end $$;
create function public.miaoye_social_unshare(p_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null then raise exception '请先登录云账号';end if;
 delete from miaoye_shares where id=p_id and owner=auth.uid();if not found then raise exception '分享不存在或无权撤回';end if;return '{"ok":true}'::jsonb;
end $$;
revoke all on function public.miaoye_social_me(),public.miaoye_social_friends(),public.miaoye_social_request(text),public.miaoye_social_friend_action(uuid,text),public.miaoye_social_publish(text,date,text,text,text),public.miaoye_social_feed(boolean),public.miaoye_social_like(uuid,boolean),public.miaoye_social_unshare(uuid) from public,anon;
grant execute on function public.miaoye_social_me(),public.miaoye_social_friends(),public.miaoye_social_request(text),public.miaoye_social_friend_action(uuid,text),public.miaoye_social_publish(text,date,text,text,text),public.miaoye_social_feed(boolean),public.miaoye_social_like(uuid,boolean),public.miaoye_social_unshare(uuid) to authenticated;
commit;
