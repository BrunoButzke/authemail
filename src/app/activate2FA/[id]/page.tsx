"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const Activate2FA = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [qrcode, setQrcode] = useState("");

  useEffect(() => {
    // Função para buscar o src do código de barras da API
    const fetchQRCode = async () => {
      const data = {
        id: params.id,
      };

      try {
        const res = await fetch("/api/activate2FA", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const data = await res.json();
          setQrcode(data.qrcode);
        } else {
          console.error("Erro ao buscar o código de barras");
        }
      } catch (error) {
        console.error("Erro ao buscar o código de barras:", error);
      }
    };

    fetchQRCode();
  }, [params.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Activate 2FA
          </h2>
        </div>
        <div className="flex justify-center">
          {qrcode && (
            <Image src={qrcode} alt="QR Code" width={500} height={500} />
          )}
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded-md shadow-sm"
            onClick={() => {
              router.push("/login");
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Activate2FA;
