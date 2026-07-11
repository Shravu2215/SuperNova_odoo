// The protected home page. This is where your actual hackathon app UI goes tomorrow.
// It also shows a live Socket.io test so you KNOW realtime is working.
import { useEffect, useState } from "react";
import { LogOut, Zap, CheckCircle2, XCircle, Radio } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { socket } from "@/lib/socket";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [connected, setConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState<string | null>(null);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }
    function onPong(data: { time: string }) {
      setLastPong(new Date(data.time).toLocaleTimeString());
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("pong", onPong);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("pong", onPong);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-400" />
          <span className="font-semibold">Hackathon App</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">Hi, {user?.name} 👋</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Everything is working 🎉</h1>
        <p className="mt-1 text-slate-400">
          You are logged in, the database saved your account, and realtime is
          live. Replace this page with your hackathon idea tomorrow.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {/* Auth + DB status */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h2 className="font-medium">Auth + Database</h2>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Logged in as <span className="text-white">{user?.email}</span>.
              This account lives in your PostgreSQL database via Prisma.
            </p>
          </div>

          {/* Realtime status */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2">
              {connected ? (
                <Radio className="h-5 w-5 animate-pulse text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <h2 className="font-medium">
                Socket.io: {connected ? "Connected" : "Disconnected"}
              </h2>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {lastPong
                ? `Last pong from server at ${lastPong}`
                : "Click to test the realtime connection."}
            </p>
            <button
              onClick={() => socket.emit("ping")}
              className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium transition hover:bg-indigo-500"
            >
              Send ping
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
