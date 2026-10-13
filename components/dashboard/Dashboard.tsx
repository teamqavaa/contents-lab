import { getConnectedUser } from "@/actions/user";

export default async function Dashboard() {
  // Récupération sécurisée du user connecté côté serveur
  const user = await getConnectedUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>

      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center space-y-2">
          <p className="text-xl font-semibold text-gray-800">
            Welcome back, {user.name || "Utilisateur"} ! 👋
          </p>
          <p className="text-sm text-gray-600">Email : <span className="font-medium">{user.email}</span></p>
          {user.phone && <p className="text-sm text-gray-600">Téléphone : <span className="font-medium">{user.phone}</span></p>}
          <div className="pt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">
              Rôles : {user.roles?.join(', ') || 'Aucun'}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-lg text-gray-600">Welcome to your dashboard! (Non connecté)</p>
      )}
    </div>
  );
}