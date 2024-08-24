import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { xsellRouter } from './routes/xsell';
import { xsellProspectsRouter } from './routes/xsell-propsects';
import { xsellGeneratorRouter } from './routes/xsell-generate';
import objectionHandlerRouter from './routes/xsell-objectionhandler';
import { xsellProposalRouter } from './routes/xsell-porposal';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3012'
}));
app.use(express.json());

app.use('/api/xsell', xsellRouter);
app.use('/api/xsell-prospects', xsellProspectsRouter);
app.use('/api/xsell-generator', xsellGeneratorRouter);
app.use('/api/objection-handler', objectionHandlerRouter);
app.use('/api/xsell-proposal', xsellProposalRouter);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});