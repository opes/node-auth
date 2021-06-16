import pool from '../utils/pool.js';
import bcrypt from 'bcrypt';

export default class User {
  id;
  email;
  password;
  role;

  constructor(row) {
    this.id = row.id;
    this.email = row.email;
    this.password = row.password;
    this.role = row.role;
  }

  static async findAll() {
    const { rows } = await pool.query('SELECT * FROM users');
    return rows.map((row) => new User(row));
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    if (!rows[0]) return null;
    return new User(rows[0]);
  }

  static async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [
      email,
    ]);
    if (!rows[0]) return null;
    return new User(rows[0]);
  }

  static async insert({ email, password, role }) {
    try {
      const hash = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));
      const { rows } = await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
        [email, hash, role]
      );
      return new User(rows[0]);
    } catch (err) {
      if (err.message.includes('duplicate key value'))
        throw new Error('User already exists');
      throw new Error(err.message);
    }
  }

  async update({ email, password, role }) {
    try {
      const updatedEmail = email ?? this.email;
      const hash = password
        ? bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS))
        : this.password;
      const updatedRole = role ?? this.role;

      const { rows } = await pool.query(
        'UPDATE users SET email = $1, password = $2, role = $3 WHERE id = $4 RETURNING *',
        [updatedEmail, hash, updatedRole, this.id]
      );
      return new User(rows[0]);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  // Helper method to hide password from user instances
  toJSON() {
    // eslint-disable-next-line no-unused-vars
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
