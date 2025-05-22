"use client";
import { useState } from "react";
import * as crypto from "crypto";

const ChatPage = ({
  params,
}: {
  params: { id: string; username: string; sessionToken: string };
}) => {
  const [messages, setMessages] = useState<
    { msg: string; cipherMsg: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [msgCount, setMsgCount] = useState(0);

  const handleReceiveMessage = (
    cipherMsg: string,
    count: number,
    msgSend: { msg: string; cipherMsg: string }
  ) => {
    const hashIv = crypto.createHash("sha256");

    hashIv.update(params.username + count);

    let iv = hashIv.digest("base64");

    count += 1;

    setMsgCount(count);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      params.sessionToken,
      iv
    );

    const msg = decipher.update(cipherMsg, "hex", "utf8");

    const chat = { msg, cipherMsg };

    if (inputText.trim() !== "") {
      setMessages([...messages, msgSend, chat]);
      setInputText("");
    }
  };

  const handleSendMessage = async () => {
    const hashIv = crypto.createHash("sha256");

    let count = msgCount;

    hashIv.update(params.username + count);

    let iv = hashIv.digest("base64");

    count += 1;

    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      params.sessionToken,
      iv
    );

    const msg = cipher.update(inputText, "utf8", "hex");

    const data = {
      id: params.id,
      cipherMsg: msg,
    };

    const chat = {
      msg: inputText,
      cipherMsg: msg,
    };

    const res = await fetch("http://localhost:8000/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const newMsg = await res.json();
    console.log(newMsg);

    handleReceiveMessage(newMsg.newMsg, count, chat);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-500">
      <div className="flex-1 w-full max-w-7xl overflow-y-auto bg-gray-100 rounded-lg shadow-md  m-3">
        <div className="p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className="bg-blue-100 text-blue-900 rounded-md p-2 mb-2"
            >
              {message.cipherMsg}
              <br />
              {message.msg}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-7xl p-4 bg-gray-100 rounded-lg shadow-md m-3">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 mr-2 text-black border-gray-300 border rounded-md p-2"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-200"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
