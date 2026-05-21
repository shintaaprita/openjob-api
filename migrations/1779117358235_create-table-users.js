exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    username: { type: 'VARCHAR(50)', notNull: true, unique: true },
    password: { type: 'TEXT', notNull: true },
    fullname: { type: 'TEXT', notNull: true },
    email: { type: 'VARCHAR(100)', notNull: true, unique: true }, // Unique constraint
    role: { type: 'VARCHAR(20)', notNull: true, default: 'user' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};