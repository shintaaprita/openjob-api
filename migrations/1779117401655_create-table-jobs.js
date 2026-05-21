exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'VARCHAR(100)', notNull: true },
    description: { type: 'TEXT', notNull: true },
    company_id: { type: 'VARCHAR(50)', references: '"companies"', onDelete: 'CASCADE' },
    category_id: { type: 'VARCHAR(50)', references: '"categories"', onDelete: 'CASCADE' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('jobs');
};