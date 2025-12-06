"use client";

import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { useAuth, DEMO_USERS } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(email, password);

    if (!success) {
      setError(
        "Nieprawidłowy email lub hasło. W wersji demo użyj jednego z przykładowych kont."
      );
    }

    setIsLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setIsLoading(true);
    await login(demoEmail, "demo1234");
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gov-gray-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gov-blue mb-2">
            Panel Urzędnika
          </h1>
          <p className="text-gov-text text-sm">
            System zgłaszania rzeczy znalezionych do rejestru centralnego
          </p>
        </div>

        <Card className="shadow-sm bg-white p-8 border-t-4 border-t-gov-blue">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Adres email"
              type="email"
              placeholder="jan.kowalski@um.wroclaw.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Hasło"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="p-4 bg-gov-error-light border-l-4 border-gov-error text-gov-text text-sm">
                <p className="font-bold text-gov-error mb-1">Błąd logowania</p>
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              isLoading={isLoading}
            >
              Zaloguj się
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gov-border">
            <p className="text-xs text-gov-text-light mb-2 font-bold uppercase tracking-wide">
              Informacja o systemie
            </p>
            <p className="text-xs text-gov-text leading-relaxed">
              To jest wersja demonstracyjna systemu. W środowisku produkcyjnym logowanie 
              wymaga uwierzytelnienia przez <strong>Węzeł Krajowy</strong> (Profil Zaufany/mObywatel).
            </p>
          </div>
        </Card>

        <div className="mt-8 bg-white border border-gov-border p-6 shadow-sm">
          <p className="text-sm font-bold text-gov-black mb-4 border-b border-gov-border pb-2">
            Dostęp demonstracyjny (wybierz konto):
          </p>
          <div className="space-y-3">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => handleDemoLogin(user.email)}
                className="w-full text-left p-4 bg-gov-gray-light border border-gov-border hover:border-gov-blue hover:bg-white transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gov-blue text-sm group-hover:underline decoration-2 underline-offset-4">
                      {user.imie} {user.nazwisko}
                    </p>
                    <p className="text-xs text-gov-text mt-1">
                      {user.urzad.nazwa}
                    </p>
                  </div>
                  {user.rola === "admin" && (
                    <span className="px-2 py-1 bg-gov-warning-light text-gov-black text-[10px] font-bold uppercase tracking-wide border border-gov-warning">
                      Admin
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/mapa"
            className="text-sm font-bold text-gov-blue hover:underline decoration-2 underline-offset-4"
          >
            &larr; Przejdź do publicznej mapy zgub
          </a>
        </div>
      </div>
    </div>
  );
}
