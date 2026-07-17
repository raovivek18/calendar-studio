export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center p-8 text-center sm:items-start sm:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Calendar Studio
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Welcome to your social dashboard. Get started by building out your features.
        </p>
      </main>
    </div>
  );
}
