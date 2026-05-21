exports.up = (pgm) => {
  pgm.createTable('applications', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: { type: 'VARCHAR(50)', references: '"users"', onDelete: 'CASCADE' },
    job_id: { type: 'VARCHAR(50)', references: '"jobs"', onDelete: 'CASCADE' },
    status: { type: 'VARCHAR(20)', notNull: true, default: 'pending' }, // pending, accepted, rejected
    document_path: { type: 'TEXT' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('applications');
};