import { promises as fs } from "fs";
import path from "path";

type RouteIndex = {
  pages: string[];
  apiAndAuth: string[];
};

async function collectRoutes(rootDir: string): Promise<RouteIndex> {
  const pages = new Set<string>();
  const apiAndAuth = new Set<string>();

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
          return;
        }

        if (entry.name !== "page.tsx" && entry.name !== "route.ts") {
          return;
        }

        const relative = path.relative(rootDir, fullPath).replace(/\\/g, "/");
        if (entry.name === "page.tsx") {
          const routePath = `/${relative.replace(/(^|\/)page\.tsx$/, "")}`
            .replace(/\/+/g, "/")
            .replace(/\/$/, "");
          pages.add(routePath === "" ? "/" : routePath);
          return;
        }

        if (entry.name === "route.ts") {
          const routePath = `/${relative.replace(/(^|\/)route\.tsx?$/, "")}`
            .replace(/\/+/g, "/")
            .replace(/\/$/, "");
          apiAndAuth.add(routePath === "" ? "/" : routePath);
        }
      })
    );
  }

  await walk(rootDir);

  return {
    pages: Array.from(pages).sort(),
    apiAndAuth: Array.from(apiAndAuth).sort(),
  };
}

export default async function Home() {
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900">
        <main className="mx-auto w-full max-w-3xl space-y-4">
          <h1 className="text-3xl font-semibold">Home</h1>
          <p className="text-base text-zinc-600">
            This page is only available in development.
          </p>
        </main>
      </div>
    );
  }

  const appDir = path.join(process.cwd(), "app");
  const { pages: pageRoutes, apiAndAuth: apiRoutes } = await collectRoutes(appDir);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900">
      <main className="mx-auto w-full max-w-3xl space-y-10">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Route Index
          </p>
          <h1 className="text-3xl font-semibold">Available Paths</h1>
          <p className="text-base text-zinc-600">
            Dynamic segments are shown with brackets, for example
            <span className="font-medium"> /trips/[trip]</span>.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Pages</h2>
          <ul className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-6">
            {pageRoutes.map((path) => (
              <li key={path} className="text-sm text-zinc-700">
                <a
                  href={path}
                  className="underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-900"
                >
                  {path}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">API and Auth</h2>
          <ul className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-6">
            {apiRoutes.map((path) => (
              <li key={path} className="text-sm text-zinc-700">
                <a
                  href={path}
                  className="underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-900"
                >
                  {path}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
