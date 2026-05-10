import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI is not set. API will run without MongoDB persistence.');
    return { status: 'skipped', provider: 'mongodb' };
  }

  await mongoose.connect(uri);
  return { status: 'connected', provider: 'mongodb', database: mongoose.connection.name };
}
