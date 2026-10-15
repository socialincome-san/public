import { GeneratorForm } from "./generator-form";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12 text-center">
      <div className="flex w-full max-w-3xl flex-col items-center">
        <h1 className="text-primary text-4xl sm:text-5xl font-semibold tracking-tight">
          Image Generator
        </h1>
        <p className="text-muted-foreground mt-3 text-lg sm:text-xl font-normal">
          Beschreibe dein Bild.
        </p>
        <GeneratorForm />
      </div>
    </main>
  );
}
