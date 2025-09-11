create extension if not exists "uuid-ossp";

create table note (
  id uuid primary key default uuid_generate_v4(),
  contents text,
  public boolean
);

create table user (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) not null,
  password varchar(255) not null
);

create table user_note (
  note_id uuid references note on delete cascade,
  user_id uuid references user on delete cascade,
  primary key (note_id, user_id)
);
