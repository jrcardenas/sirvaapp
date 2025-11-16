export default function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl font-bold text-center mb-6">
      {children}
    </h1>
  );
}
