DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS roles_type;

CREATE TYPE roles_type AS ENUM ('Admin', 'User');

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role roles_type NOT NULL
);
