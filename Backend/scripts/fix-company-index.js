const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medtrap';

async function run() {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB for index fix');

  const db = mongoose.connection.db;
  const collName = 'companies';

  try {
    const indexes = await db.collection(collName).indexes();
    console.log(
      'Existing indexes:',
      indexes.map(i => i.name),
    );

    // If a non-sparse unique index exists on licenseNumber, drop it first
    const problematicIndex = indexes.find(
      i => i.key && i.key.licenseNumber === 1 && i.unique && !i.sparse,
    );
    if (problematicIndex) {
      console.log('Dropping problematic index:', problematicIndex.name);
      await db.collection(collName).dropIndex(problematicIndex.name);
    }

    // Create sparse unique index
    console.log('Creating sparse unique index on licenseNumber...');
    await db
      .collection(collName)
      .createIndex({ licenseNumber: 1 }, { unique: true, sparse: true });

    console.log('Index fix complete');
  } catch (err) {
    console.error('Index fix failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
