"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as crypto from "crypto";

const sendCode = async (id: string, code: string) => {
  const data = {
    id: id,
    code: code,
  };

  const res = await fetch("http://localhost:8000/authCode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res;
};

export default function Login({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await sendCode(params.id, code).then(async (res: Response) => {
      if (res.ok) {
        console.log("Usuário logado com sucesso!");
        const data = await res.json();

        const hashSalt = crypto.createHash("sha256");

        hashSalt.update(data.user.username);

        const salt = hashSalt.digest("base64");

        const sessionToken = crypto
          .pbkdf2Sync(code, salt, 1000, 16, "sha512")
          .toString("hex");
        console.log(data);
        router.push(
          `/chat/${data.user.id}/${data.user.username}/${sessionToken}`
        );
      } else {
        console.log("Erro ao logar usuário");
        setError("Código de autenticação incorreto!");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Send your 2FA code
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="code" className="sr-only">
                code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                autoComplete="code"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <div className="text-center">
            {error && <p className=" text-red-500">{error}</p>}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Send Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
