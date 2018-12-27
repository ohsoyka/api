module.exports = {
  async up(db) {
    await db.collection('articles').updateMany({}, { $rename: { private: 'hidden' } });
    await db.collection('categories').updateMany({}, { $rename: { private: 'hidden' } });
    await db.collection('pages').updateMany({}, { $rename: { private: 'hidden' } });
    await db.collection('photoalbums').updateMany({}, { $rename: { private: 'hidden' } });
    await db.collection('projects').updateMany({}, { $rename: { private: 'hidden' } });
  },

  async down(db) {
    await db.collection('articles').updateMany({}, { $rename: { hidden: 'private' } });
    await db.collection('categories').updateMany({}, { $rename: { hidden: 'private' } });
    await db.collection('pages').updateMany({}, { $rename: { hidden: 'private' } });
    await db.collection('photoalbums').updateMany({}, { $rename: { hidden: 'private' } });
    await db.collection('projects').updateMany({}, { $rename: { hidden: 'private' } });
  },
};
