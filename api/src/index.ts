import dotenv from 'dotenv';
dotenv.config();

import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import router from "./app/routes"; // Corrigido o caminho para o router

const app = express();
app.set('trust proxy', true);
// A porta não é mais necessária aqui, a Vercel gerencia isso
// const PORT = 8000;

// Middleware de Log de Requisições (ANTES DO HEALTH CHECK para pegar todas as chamadas)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[API Backend - index.ts] Recebida requisição: ${req.method} ${req.originalUrl} para ${req.path}`);
  next();
});

// Health check simples
// A Vercel deve rotear /api/__health para cá, e o Express verá /__health
app.get("/__health", (req: Request, res: Response) => {
  console.log("[API Backend - index.ts] Health check /__health acessado!");
  res.status(200).send("API Health OK from index.ts at /__health");
});

app.use(cors());

app.use(express.json());

app.use(router);

// Em vez de app.listen(), exportamos o app para a Vercel
export default app; 