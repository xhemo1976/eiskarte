import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const flavors = await prisma.flavor.findMany({
    where: { available: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div
      className="min-h-screen bg-fixed bg-center bg-cover"
      style={{ backgroundImage: "url('/logo.jpeg')" }}
    >
      <div className="min-h-screen bg-black/60 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-8">
          <header className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white tracking-wide">ARTIGIANI</h1>
            <p className="text-white/70 mt-1 text-sm italic">Your Gelato Artisans – since 2019</p>
          </header>

          <p className="text-center text-white/85 text-sm leading-relaxed italic mb-8 px-2">
            Unser Eis wird jeden Tag frisch mit Liebe und den besten Zutaten
            hergestellt – für ein unvergleichliches Erlebnis echten
            italienischen Handwerkseises.
          </p>

          {flavors.length === 0 ? (
            <p className="text-center text-white/70">
              Aktuell sind keine Eissorten verfügbar.
            </p>
          ) : (
            <div className="space-y-3">
              {flavors.map((flavor) => (
                <details
                  key={flavor.id}
                  className="bg-white/90 backdrop-blur rounded-lg shadow-md overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/95 select-none">
                    <span className="font-medium text-gray-900">{flavor.name}</span>
                    <span className="text-lg font-semibold text-emerald-700 ml-4 shrink-0">
                      {flavor.price.toFixed(2)} &euro;
                    </span>
                  </summary>
                  <div className="px-4 pb-4 border-t border-gray-200 pt-3 space-y-2 text-sm">
                    {flavor.ingredients && (
                      <div>
                        <span className="font-semibold text-gray-700">Zutaten: </span>
                        <span className="text-gray-600">{flavor.ingredients}</span>
                      </div>
                    )}
                    {flavor.additives && (
                      <div>
                        <span className="font-semibold text-gray-700">Zusatzstoffe: </span>
                        <span className="text-gray-600">{flavor.additives}</span>
                      </div>
                    )}
                    {flavor.allergens && (
                      <div>
                        <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          Allergene:{" "}
                        </span>
                        <span className="text-amber-800 font-medium ml-1">
                          {flavor.allergens}
                        </span>
                      </div>
                    )}
                    {!flavor.ingredients && !flavor.additives && !flavor.allergens && (
                      <p className="text-gray-400 italic">Keine weiteren Informationen verfügbar.</p>
                    )}
                    <p className="text-gray-400 text-xs italic mt-2 border-t border-gray-100 pt-2">
                      Alle Eissorten werden in unserem Labor hergestellt und können
                      Spuren von Milch, Schalenfrüchten, Soja, Eiern (nur
                      pasteurisiert) und Gluten enthalten.
                    </p>
                  </div>
                </details>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <a
              href="https://www.instagram.com/artigianiberlin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src="/instagram-qr.png"
                alt="@artigianiberlin auf Instagram"
                className="w-40 h-40 mx-auto rounded-xl shadow-lg hover:scale-105 transition-transform"
              />
            </a>
            <p className="text-white/60 text-xs mt-2">Alle Neuigkeiten und unsere neuesten Eiskreationen gibt es auf unserem Instagram – folgt uns!</p>
          </div>

          <footer className="text-center mt-6 text-xs text-white/50">
            <p>Alle Preise pro Kugel. Angaben ohne Gewähr.</p>
          </footer>
        </div>

        <a
          href="https://kaigent.de"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-3 right-3 opacity-40 hover:opacity-80 transition-opacity"
        >
          <img
            src="/kaigent_logo.avif"
            alt="KAIgent"
            className="h-14 w-auto"
          />
        </a>
      </div>
    </div>
  );
}
