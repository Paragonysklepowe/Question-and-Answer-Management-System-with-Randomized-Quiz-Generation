import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Question Management System
          </h1>
        </header>
        <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <ul className="space-y-4">
            <li>
              <Link
                to="/questions"
                className="flex items-center gap-3 p-3 text-blue-700 hover:underline dark:text-blue-500"
              >
                Manage Questions
              </Link>
            </li>
            <li>
              <Link
                to="/quiz"
                className="flex items-center gap-3 p-3 text-blue-700 hover:underline dark:text-blue-500"
              >
                Take a Quiz
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
