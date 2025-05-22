import * as fs from "fs";
import path from "path";

// Usar o diretório /tmp para o arquivo JSON
const tmpDir = "/tmp";
const dbFileName = "users.json";
const dbPath = path.join(tmpDir, dbFileName);

// Função para garantir que o arquivo exista em /tmp ao iniciar (ou ao ser lido pela primeira vez)
// Copia do arquivo original (do build) se não existir em /tmp
const initializeDbInTmp = () => {
  if (!fs.existsSync(dbPath)) {
    // Caminho para o users.json original que foi incluído no build
    const sourceDbPath = path.resolve("./src/app/db/users.json"); // Relativo ao CWD da função (api/)
    try {
      if (fs.existsSync(sourceDbPath)) {
        // Garante que o diretório /tmp exista (geralmente já existe)
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        fs.copyFileSync(sourceDbPath, dbPath);
        console.log(`Copiado ${sourceDbPath} para ${dbPath}`);
      } else {
        // Se o arquivo de origem não existir, cria um users.json vazio em /tmp
        fs.writeFileSync(dbPath, JSON.stringify({})); // Ou "[]" se for um array
        console.log(`Criado ${dbPath} vazio pois ${sourceDbPath} não foi encontrado.`);
      }
    } catch (err) {
      console.error("Erro ao inicializar DB em /tmp:", err);
      // Cria um arquivo vazio como fallback em caso de erro na cópia
      if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}));
      }
    }
  }
};

export const saveUsers = (users: any) => {
  initializeDbInTmp(); // Garante que /tmp/users.json exista antes de tentar salvar
  const data = JSON.stringify(users, null, 2); // Adicionado null, 2 para formatação
  try {
    fs.writeFileSync(dbPath, data);
    console.log(`Usuários salvos em ${dbPath}`);
  } catch (err) {
    console.error(`Erro ao salvar usuários em ${dbPath}:`, err);
    throw err; // Relança o erro para o controller lidar
  }
};

export const getUsers = () => {
  initializeDbInTmp(); // Garante que /tmp/users.json exista antes de tentar ler
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath);
      return JSON.parse(data.toString());
    }
  } catch (err) {
    console.error(`Erro ao ler usuários de ${dbPath}:`, err);
  }
  // Se o arquivo não existir em /tmp ou houver erro, retorna um objeto vazio
  return {}; // Ou [] se for um array
};

export const getUserIdByUsername = (username: string) => {
  const data = getUsers();

  for (const id in data) {
    if (data.hasOwnProperty(id)) {
      if (data[id].username === username) {
        return id;
      }
    }
  }
  return undefined;
};
