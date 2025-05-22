import dotenv from 'dotenv';
dotenv.config();

import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import router from "./app/routes";

const app = express();
app.set('trust proxy', true);

// Middleware de Log de Requisições
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[API Backend - app.ts] Recebida requisição: ${req.method} ${req.originalUrl}`);
  next();
});

const PORT = 8000;

app.use(cors());

app.use(express.json());

app.use(router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
