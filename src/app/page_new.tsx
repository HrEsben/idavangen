import UserManager from "@/components/UserManager";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Idavang Project
          </h1>
          <p className="text-lg text-gray-600">
            Next.js with Vercel Postgres Integration
          </p>
        </header>
        
        <UserManager />
        
        <footer className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
            <div className="text-left max-w-2xl mx-auto space-y-3">
              <p className="text-gray-700">
                <strong>1.</strong> Deploy this project to Vercel
              </p>
              <p className="text-gray-700">
                <strong>2.</strong> Go to your Vercel dashboard → Storage → Create Database → Postgres
              </p>
              <p className="text-gray-700">
                <strong>3.</strong> Connect the database to your project
              </p>
              <p className="text-gray-700">
                <strong>4.</strong> The environment variables will be automatically configured
              </p>
              <p className="text-gray-700">
                <strong>5.</strong> Redeploy and your database will be ready to use!
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
