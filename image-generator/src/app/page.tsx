import { GeneratorForm } from "./generator-form";

export default function Page() {
  return (
    <div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-foreground mb-5 text-center text-xl font-semibold">
        Test
      </h1>
      <GeneratorForm />
    </div>
  );
}
