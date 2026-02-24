import type { WikiCard } from "./types";
import { v4 as uuid } from "uuid";

const CURATED_PAIRS: [string, string][] = [
  ["Donald Trump", "Brazil"],
  ["Eiffel Tower", "Sushi"],
  ["Albert Einstein", "Football"],
  ["Cleopatra", "Moon landing"],
  ["Leonardo da Vinci", "Hip hop music"],
  ["Great Wall of China", "Bitcoin"],
  ["William Shakespeare", "Olympic Games"],
  ["Pyramids of Giza", "Artificial intelligence"],
  ["Marie Curie", "Netflix"],
  ["Nikola Tesla", "K-pop"],
  ["Machu Picchu", "Taylor Swift"],
  ["Napoleon", "Video game"],
  ["Amazon rainforest", "Pizza"],
  ["Titanic", "Mars"],
  ["Mona Lisa", "World Cup"],
  ["Vikings", "Internet"],
  ["Dinosaur", "Smartphone"],
  ["Mozart", "Electric car"],
  ["Ancient Rome", "Social media"],
  ["Frida Kahlo", "Quantum computing"],
  ["Pablo Picasso", "Space Station"],
  ["Genghis Khan", "Anime"],
  ["Bermuda Triangle", "Virtual reality"],
  ["Stonehenge", "Spotify"],
  ["Galileo Galilei", "Cryptocurrency"],
  ["Samurai", "Hollywood"],
  ["Atlantis", "Machine learning"],
  ["Socrates", "TikTok"],
  ["Tutankhamun", "Climate change"],
  ["Marco Polo", "Robotics"],
];

let pairIndex = 0;

export function generateCard(): WikiCard {
  const [start_title, target_title] =
    CURATED_PAIRS[pairIndex % CURATED_PAIRS.length];
  pairIndex++;

  return {
    card_id: uuid(),
    start_title,
    target_title,
    language: "en",
    max_steps: 15,
  };
}

export function generateCards(count: number): WikiCard[] {
  return Array.from({ length: count }, () => generateCard());
}
