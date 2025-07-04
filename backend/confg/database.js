const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conexión a MongoDB exitosa');
}).catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err);
});
