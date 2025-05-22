import dotenv from 'dotenv';
dotenv.config();

import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import router from "./app/routes"; // Corrigido o caminho para o router

const app = express();
app.set('trust proxy', true);
// A porta não é mais necessária aqui, a Vercel gerencia isso
// const PORT = 8000;

app.use(cors());

app.use(express.json());

// Middleware de Log de Requisições
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[API Backend - index.ts] Recebida requisição: ${req.method} ${req.originalUrl}`);
  next();
});

app.use(router);

// Em vez de app.listen(), exportamos o app para a Vercel
export default app; 