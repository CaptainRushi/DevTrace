-- Add banner_path to users table if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'banner_path') then
        alter table public.users add column banner_path text;
    end if;
end $$;
