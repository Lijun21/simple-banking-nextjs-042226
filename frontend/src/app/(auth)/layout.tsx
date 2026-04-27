export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-600">Company P</h1>
          <p className="text-sm text-gray-500 mt-1">Pay vendors with your credit card</p>
        </div>
        {children}
      </div>
    </div>
  );
}
