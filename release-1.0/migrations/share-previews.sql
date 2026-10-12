begin;
alter table public.miaoye_shares add column if not exists photos jsonb;
create or replace function public.miaoye_social_publish_v2(p_entry text,p_day date,p_title text,p_message text,p_image text,p_photos jsonb) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare result jsonb; src jsonb;
begin
 if auth.uid() is null then raise exception '请先登录云账号'; end if;
 if p_photos is null or jsonb_typeof(p_photos)<>'array' then raise exception '照片预览格式错误'; end if;
 if jsonb_array_length(p_photos)>2 or length(p_photos::text)>1000000 then raise exception '照片预览过大'; end if;
 for src in select value from jsonb_array_elements(p_photos) loop
  if jsonb_typeof(src)<>'string' or (src#>>'{}') !~ '^data:image/(jpeg|png);base64,[A-Za-z0-9+/=]+$' then raise exception '照片预览格式错误'; end if;
 end loop;
 result:=miaoye_social_publish(p_entry,p_day,p_title,p_message,p_image);
 update miaoye_shares set photos=p_photos where id=(result->>'id')::uuid and owner=auth.uid();
 return result;
end $$;
revoke all on function public.miaoye_social_publish_v2(text,date,text,text,text,jsonb) from public,anon;
grant execute on function public.miaoye_social_publish_v2(text,date,text,text,text,jsonb) to authenticated;
create or replace function public.miaoye_social_feed(p_today boolean default true) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform miaoye_social_me();
 return coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
 select s.id,s.owner,s.title,s.message,s.image,s.photos,s.journal_day,s.created_at,p.username,coalesce(nullif(p.nickname,''),p.username) as nickname,p.avatar,coalesce(n.note,'') as note,
 (select count(*) from miaoye_likes l where l.post_id=s.id) as likes,exists(select 1 from miaoye_likes l where l.post_id=s.id and l.user_id=auth.uid()) as liked
 from miaoye_shares s join miaoye_social_profiles p on p.id=s.owner left join miaoye_friend_notes n on n.viewer=auth.uid() and n.friend=s.owner
 where (not p_today or s.journal_day=(now() at time zone 'Asia/Singapore')::date)
 and (s.owner=auth.uid() or exists(select 1 from miaoye_friendships f where f.accepted and least(f.sender,f.recipient)=least(auth.uid(),s.owner) and greatest(f.sender,f.recipient)=greatest(auth.uid(),s.owner)))
 order by s.created_at desc limit 30) q),'[]'::jsonb);
end $$;
commit;
