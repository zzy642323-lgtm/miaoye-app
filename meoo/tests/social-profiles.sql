begin;
do $$
declare a uuid=gen_random_uuid();b uuid=gen_random_uuid();c uuid=gen_random_uuid();an text='qa'||substr(replace(a::text,'-',''),1,24);bn text='qa'||substr(replace(b::text,'-',''),1,24);friend_id uuid;post_id uuid;v jsonb;rejected boolean;
begin
 insert into auth.users(id,email) values(a,an||'@meoo.local'),(b,bn||'@meoo.local'),(c,'qa'||replace(c::text,'-','')||'@meoo.local');
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform miaoye_social_me();v=miaoye_social_profile('猫主人','cat:3');
 if v->>'nickname'<>'猫主人' or v->>'username'<>an or v->>'avatar'<>'cat:3' then raise exception 'Profile update changed identity';end if;
 rejected=false;begin perform miaoye_social_profile('bad','data:image/svg+xml;base64,aGVsbG8=');exception when others then rejected=true;end;if not rejected then raise exception 'SVG avatar accepted';end if;
 rejected=false;begin perform miaoye_social_note(b,'stranger');exception when others then rejected=true;end;if not rejected then raise exception 'Stranger note accepted';end if;
 perform miaoye_social_request(bn);select id into friend_id from miaoye_friendships where sender=a and recipient=b;
 perform set_config('request.jwt.claim.sub',b::text,true);perform miaoye_social_friend_action(friend_id,'accept');
 perform set_config('request.jwt.claim.sub',a::text,true);perform miaoye_social_note(b,'我的小橘');
 v=miaoye_social_friends();if v->0->>'note'<>'我的小橘' then raise exception 'Owner note missing';end if;
 post_id=(miaoye_social_publish('synthetic-v22',current_date,'synthetic','test only','data:image/jpeg;base64,aGVsbG8=')->>'id')::uuid;
 perform set_config('request.jwt.claim.sub',b::text,true);v=miaoye_social_friends();if v->0->>'note'<>'' then raise exception 'Other person can read private note';end if;
 perform miaoye_social_note(a,'我给你的备注');v=miaoye_social_feed(false);if v->0->>'nickname'<>'猫主人' or v->0->>'avatar'<>'cat:3' or v->0->>'note'<>'我给你的备注' then raise exception 'Feed identity mismatch';end if;
 perform set_config('request.jwt.claim.sub',a::text,true);v=miaoye_social_feed(false);if v->0->>'note'<>'' then raise exception 'Private note leaked to profile owner';end if;
 perform set_config('request.jwt.claim.sub',c::text,true);if jsonb_array_length(miaoye_social_feed(false))<>0 then raise exception 'Stranger feed leaked';end if;
 perform set_config('request.jwt.claim.sub',b::text,true);perform miaoye_social_friend_action(friend_id,'remove');
 rejected=false;begin perform miaoye_social_note(a,'removed');exception when others then rejected=true;end;if not rejected then raise exception 'Removed friend note accepted';end if;
 if has_table_privilege('authenticated','miaoye_friend_notes','SELECT') or has_function_privilege('anon','miaoye_social_profile(text,text)','EXECUTE') then raise exception 'Direct/anonymous access allowed';end if;
end $$;
rollback;
select 'PASS: cloud profiles, immutable username, safe avatars, private notes, mutual friendship and revoked access; all fixtures rolled back' as result;
