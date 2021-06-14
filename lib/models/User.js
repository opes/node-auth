import pool from '../utils/pool.js';
import bcrypt from 'bcrypt';

export default class User {
  id;
  email;
  password;

  constructor(row) {
    this.id = row.id;
    this.email = row.email;
    this.password = row.password;
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

  static async insert({ email, password }) {
    try {
      const hash = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
      const { rows } = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
        [email, hash]
      );
      return new User(rows[0]);
    } catch (err) {
      if (err.message.includes('duplicate key value'))
        throw new Error('User already exists');
      throw new Error('An error occurred when creating user');
    }
  }

  // Helper method to hide password from user instances
  toJSON() {
    return { id: this.id, email: this.email };
  }
}
