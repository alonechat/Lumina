import { getDb } from "../api/queries/connection";
import { quotes } from "./schema";

async function seed() {
  const db = getDb();

  // Check if quotes already exist
  const existing = db.select().from(quotes).all();
  if (existing.length > 0) {
    console.log("Quotes already seeded, skipping.");
    return;
  }

  const quoteData = [
    { text: "The unexamined life is not worth living.", author: "Socrates", category: "philosophy" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "philosophy" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "inspiration" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "inspiration" },
    { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell", category: "wisdom" },
    { text: "What you seek is seeking you.", author: "Rumi", category: "wisdom" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "life" },
    { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: "wisdom" },
    { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde", category: "life" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "inspiration" },
    { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "philosophy" },
    { text: "The mind is everything. What you think you become.", author: "Buddha", category: "wisdom" },
    { text: "Happiness depends upon ourselves.", author: "Aristotle", category: "life" },
    { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey", category: "inspiration" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "life" },
  ];

  for (const q of quoteData) {
    db.insert(quotes).values(q).run();
  }

  console.log("Seeded 15 quotes");
}

seed().catch(console.error);
