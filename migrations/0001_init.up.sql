create extension if not exists "uuid-ossp";

create table "user" (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) not null unique,
  password varchar(255) not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table note (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references "user" on delete cascade,
  contents text not null,
  public boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table note_shared_to_user (
  note_id uuid references note on delete cascade,
  user_id uuid references "user" on delete cascade,
  created_at timestamp default now(),
  primary key (note_id, user_id)
);

create index idx_user_email on "user"(email);
create index idx_note_owner on note(owner);
create index idx_note_public on note(public);
create index idx_note_created_at on note(created_at);
create index idx_note_shared_user on note_shared_to_user(user_id);

alter table note add constraint check_contents_not_empty check (length(contents) > 0);
alter table "user" add constraint check_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
