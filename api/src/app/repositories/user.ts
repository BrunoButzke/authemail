import * as fs from "fs";
import path from "path";

const dbPath = "./src/app/db/users.json";

export const saveUsers = (users: any) => {
  const data = JSON.stringify(users);
  fs.writeFileSync(dbPath, data);
};

export const getUsers = () => {
  const data = fs.readFileSync(path.resolve(dbPath));
  return JSON.parse(data.toString());
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
