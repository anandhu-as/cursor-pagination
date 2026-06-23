import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import productsRouter from './routes/products.js';


const app = express();
const PORT = process.env.PORT || 3002;


app.use(express.json());

app.use(cors());

app.use('/api/products', productsRouter);




app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
