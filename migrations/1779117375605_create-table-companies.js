exports.up = (pgm) => {
  pgm.createTable('companies', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'VARCHAR(100)', notNull: true },
    description: { type: 'TEXT' },
    location: { type: 'TEXT' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('companies');
};