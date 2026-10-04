import express from 'express';
import logger from 'morgan';
import expensesRouter from './routes/expenses.router.ts';
import cors from 'cors';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173', /\.onrender\.com$/],
  })
);

app.get('/ping', (req, res) => {
  res.sendStatus(204);
});

app.use('/api/expenses', expensesRouter);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
