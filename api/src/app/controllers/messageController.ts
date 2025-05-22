import { Request, Response } from "express";
import * as crypto from "crypto";
import { getUserIdByUsername, getUsers, saveUsers } from "../repositories/user";

export const receiveMessage = async (req: Request, res: Response) => {
  const { id, cipherMsg } = req.body;

  if (!id || !cipherMsg) {
    return res.status(400).send("missing params");
  }

  const users = getUsers();

  if (id == undefined) {
    res.status(400).send("user not found");
  }

  const sessionToken = users[id!]["session"];

  const hashIv = crypto.createHash("sha256");

  hashIv.update(users[id!]["username"] + users[id!]["msgCount"]);

  let iv = hashIv.digest("base64");

  users[id!]["msgCount"] += 1;

  const decipher = crypto.createDecipheriv("aes-256-gcm", sessionToken, iv);

  const msg = decipher.update(cipherMsg, "hex", "utf8");

  console.log(msg);

  const newHashIv = crypto.createHash("sha256");

  newHashIv.update(users[id!]["username"] + users[id!]["msgCount"]);

  let newIv = newHashIv.digest("base64");

  users[id!]["msgCount"] += 1;
  users[id!]["session"] = sessionToken;

  saveUsers(users);

  const cipher = crypto.createCipheriv("aes-256-gcm", sessionToken, newIv);

  const newMsg = cipher.update(
    "Recebida a msg '" + msg + "' com sucesso!",
    "utf8",
    "hex"
  );

  res.status(200).send({ newMsg });
};
