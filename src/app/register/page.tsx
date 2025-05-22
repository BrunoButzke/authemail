"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import * as crypto from "crypto";

const registerUser = async (
  username: string,
  password: string,
  email: string,
  country: string
) => {
  const token = crypto.pbkdf2Sync(password, username, 1000, 64, "sha512");

  const userData = {
    username: username,
    token: token.toString('hex'),
    email: email,
    country: country,
  };

  const res = await fetch("http://localhost:8000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return res;
};

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [detectedIp, setDetectedIp] = useState("");
  const [isLoadingCountry, setIsLoadingCountry] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountry = async () => {
      setIsLoadingCountry(true);
      try {
        const res = await fetch("/api/ip-details");
        if (res.ok) {
          const data = await res.json();
          setCountry(data.country || 'País não detectado');
          setDetectedIp(data.ip || 'IP não detectado');
        } else {
          setCountry('País não detectado');
          setDetectedIp('IP não detectado');
          console.error("Erro ao buscar país:", await res.text());
        }
      } catch (err) {
        setCountry('Erro ao buscar país');
        setDetectedIp('Erro ao buscar IP');
        console.error("Erro de rede ao buscar país/IP:", err);
      } finally {
        setIsLoadingCountry(false);
      }
    };

    fetchCountry();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await registerUser(username, password, email, country).then(
      async (res: Response) => {
        if (res.ok) {
          console.log("Usuário registrado com sucesso!");
          const data = await res.json();
          router.push(`activate2FA/${data.id}`);
        } else {
          const errorData = await res.json().catch(() => ({ message: "Erro desconhecido ao registrar." }));
          console.log("Erro ao registrar usuário:", errorData);
          setError(errorData.message || "Erro ao registrar usuário");
        }
      }
    ).catch(err => {
      console.error("Erro na requisição de registro:", err);
      setError("Não foi possível conectar ao servidor para registrar.");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 pt-2">
                País Detectado
              </label>
              <input
                id="country"
                name="country"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-100"
                placeholder={isLoadingCountry ? "Detectando país..." : "País"}
                value={country}
                readOnly
              />
            </div>
            <div className="pt-2">
              <label htmlFor="detectedIp" className="block text-sm font-medium text-gray-700">
                Seu IP Detectado
              </label>
              <input
                id="detectedIp"
                name="detectedIp"
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-100 mt-1"
                placeholder={isLoadingCountry ? "Detectando IP..." : "IP"}
                value={detectedIp}
                readOnly
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
