import { GameLevelConfig } from '../types/game';

export const GAME_LEVELS: GameLevelConfig[] = [
  {
    levelNumber: 1,
    titleBn: "রাঁধুনির রান্নাঘর",
    titleEn: "Chef's Cozy Kitchen",
    descriptionBn: "মিমি নামের চতুর বিড়ালটি টেবিলে উঠেছে! চিকেন টেনে দ্রুত হট-পট বক্সে সরাও।",
    descriptionEn: "Mimi the sneaky tabby has hopped on the counter! Drag chickens quickly into the hot-pot warmer.",
    targetRescues: 6,
    maxAllowedEaten: 3,
    catsConfig: [
      {
        breed: 'TABBY',
        nameBn: 'মিমি (কমলা বিড়াল)',
        nameEn: 'Mimi the Tabby',
        speed: 130,
        telegraphTime: 1.2
      }
    ],
    spawnInterval: 2200,
    maxSimultaneousChickens: 3
  },
  {
    levelNumber: 2,
    titleBn: "দুপুরের ডাইনিং টেবিল",
    titleEn: "Dining Table Ambush",
    descriptionBn: "এবার ভুলু নামের মোটু বিড়ালও যোগ দিয়েছে! ঝাল উইংস খাওয়ালে বিড়াল কিছুক্ষণের জন্য পিছিয়ে যাবে।",
    descriptionEn: "Chubby Golu has joined the raid! Feeding spicy wings will cause cats to sneeze and retreat.",
    targetRescues: 10,
    maxAllowedEaten: 3,
    catsConfig: [
      {
        breed: 'TABBY',
        nameBn: 'মিমি',
        nameEn: 'Mimi',
        speed: 145,
        telegraphTime: 1.0
      },
      {
        breed: 'CALICO',
        nameBn: 'গোলু (মোটু বিড়াল)',
        nameEn: 'Golu (Chonky Calico)',
        speed: 110,
        telegraphTime: 1.4
      }
    ],
    spawnInterval: 1800,
    maxSimultaneousChickens: 4
  },
  {
    levelNumber: 3,
    titleBn: "সন্ধ্যা স্ন্যাক্স পার্টি",
    titleEn: "Evening Snack Rush",
    descriptionBn: "ঝড়ের বেগে এসেছে চতুর কালু! উলের বল বা ক্যাটনিপ ছুড়ে বিড়ালকে অন্যমনস্ক রাখো।",
    descriptionEn: "Speedy Shadow strikes like lightning! Throw yarn balls or catnip toys to distract them.",
    targetRescues: 14,
    maxAllowedEaten: 3,
    catsConfig: [
      {
        breed: 'TABBY',
        nameBn: 'মিমি',
        nameEn: 'Mimi',
        speed: 160,
        telegraphTime: 0.9
      },
      {
        breed: 'SHADOW',
        nameBn: 'কালু (নিনজা বিড়াল)',
        nameEn: 'Shadow the Ninja',
        speed: 210,
        telegraphTime: 0.75
      }
    ],
    spawnInterval: 1500,
    maxSimultaneousChickens: 4
  },
  {
    levelNumber: 4,
    titleBn: "বিয়ের বিশাল খানা",
    titleEn: "Grand Wedding Banquet",
    descriptionBn: "টেবিলে এসেছে আস্ত রোস্ট চিকেন! তিনজন বিড়াল একযোগে চিকেনের দিকে তাকিয়ে আছে!",
    descriptionEn: "Whole roast chickens are being served! Three cats are attacking from all table sides!",
    targetRescues: 18,
    maxAllowedEaten: 3,
    catsConfig: [
      {
        breed: 'TABBY',
        nameBn: 'মিমি',
        nameEn: 'Mimi',
        speed: 170,
        telegraphTime: 0.8
      },
      {
        breed: 'CALICO',
        nameBn: 'গোলু',
        nameEn: 'Golu',
        speed: 130,
        telegraphTime: 1.1
      },
      {
        breed: 'SHADOW',
        nameBn: 'কালু',
        nameEn: 'Shadow',
        speed: 220,
        telegraphTime: 0.7
      }
    ],
    spawnInterval: 1300,
    maxSimultaneousChickens: 5
  },
  {
    levelNumber: 5,
    titleBn: "সম্রাট বিড়ালের শেষ আক্রমণ!",
    titleEn: "The King Cat Finale",
    descriptionBn: "বিড়াল সম্রাট তার বিশাল ক্ষুধা নিয়ে হাজির! সব মুরগি বাঁচিয়ে মাস্টার শেফের খেতাব অর্জন করো!",
    descriptionEn: "The Royal King Cat approaches with a bottomless belly! Rescue all chicken to become Master Chef!",
    targetRescues: 22,
    maxAllowedEaten: 3,
    catsConfig: [
      {
        breed: 'BOSS_CHONK',
        nameBn: 'সম্রাট বিল্টু (রাজা বিড়াল)',
        nameEn: 'King Fluffington',
        speed: 140,
        telegraphTime: 0.9
      },
      {
        breed: 'SHADOW',
        nameBn: 'কালু',
        nameEn: 'Shadow',
        speed: 230,
        telegraphTime: 0.65
      },
      {
        breed: 'TABBY',
        nameBn: 'মিমি',
        nameEn: 'Mimi',
        speed: 180,
        telegraphTime: 0.75
      }
    ],
    spawnInterval: 1100,
    maxSimultaneousChickens: 6
  }
];

export const STRINGS = {
  bn: {
    gameTitle: "চিকেন বাঁচাও!",
    gameSubtitle: "লোভী বিড়াল বনাম রাঁধুনির লড়াই",
    startBtn: "খেলা শুরু করো",
    endlessBtn: "অসীম আর্কেড মোড",
    howToPlay: "কীভাবে খেলবে:",
    rule1: "চিকেন ড্র্যাগ করে বা ক্লিক করে নিচে ডানদিকের 'হট-পট বাক্সে' সরিয়ে নাও।",
    rule2: "বিড়ালের নাকে ট্যাপ/ক্লিক করলে বিড়াল পিছু হটবে (Boop!)।",
    rule3: "উলের বল বা ক্যাটনিপ ছুড়ে বিড়ালদের মনোযোগ নষ্ট করো।",
    rule4: "৩টির বেশি চিকেন বিড়াল খেয়ে ফেললে খেলা শেষ!",
    controlsHint: "ক্লিক ও ড্র্যাগ · স্পেসবার দিয়ে পিকআপ · ১, ২ দিয়ে খেলনা নিক্ষেপ",
    score: "স্কোর",
    saved: "বাঁচানো হয়েছে",
    eaten: "বিড়ালে খেয়েছে",
    level: "লেভেল",
    lives: "জীবন",
    combo: "কম্বো",
    pause: "বিরতি",
    resume: "চালিয়ে যাও",
    restart: "পুনরায় খেলো",
    quit: "প্রধান মেনু",
    pausedTitle: "খেলা স্থগিত",
    nextLevel: "পরবর্তী লেভেল",
    levelClearTitle: "লেভেল সম্পন্ন!",
    gameOverTitle: "বিড়াল সব চিকেন খেয়ে ফেলেছে!",
    gameOverDesc: "হায় হায়! টেবিলে রাখা চিকেনগুলো লোভী বিড়ালের পেটে চলে গেলো!",
    playAgain: "আবার খেলো",
    highScore: "সর্বোচ্চ স্কোর",
    toysTitle: "ক্যাট বিভ্রান্তিকর আইটেম",
    toyYarn: "উলের বল (১)",
    toyCatnip: "ক্যাটনিপ (২)",
    boopMessage: "নো বিড়াল! দূরে যাও!",
    savedPopup: "+বাঁচানো হলো!",
    eatenPopup: "খেয়ে ফেললো!",
    spicyPopup: "ঝাল লাগলো! উহ্!",
    soundOn: "শব্দ চালু",
    soundOff: "শব্দ বন্ধ",
    langBn: "বাংলা",
    langEn: "English",
  },
  en: {
    gameTitle: "Chicken Rescue!",
    gameSubtitle: "Greedy Cat vs The Chef",
    startBtn: "Start Story Mode",
    endlessBtn: "Endless Arcade Mode",
    howToPlay: "How to Play:",
    rule1: "Drag or click fried chicken pieces into the safe Hot-Pot basket.",
    rule2: "Tap the cat's nose to boop and scare them away!",
    rule3: "Toss yarn balls or catnip to distract the hungry cats.",
    rule4: "Don't let the cats eat 3 or more chickens!",
    controlsHint: "Click & Drag · Space to grab · 1, 2 keys for toys · Esc to Pause",
    score: "Score",
    saved: "Saved",
    eaten: "Eaten",
    level: "Level",
    lives: "Lives",
    combo: "Combo",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    quit: "Main Menu",
    pausedTitle: "Game Paused",
    nextLevel: "Next Level",
    levelClearTitle: "Level Cleared!",
    gameOverTitle: "The Cats Devoured the Feast!",
    gameOverDesc: "Oh no! The greedy cats managed to eat too much chicken!",
    playAgain: "Play Again",
    highScore: "High Score",
    toysTitle: "Cat Distractions",
    toyYarn: "Yarn Ball (1)",
    toyCatnip: "Catnip (2)",
    boopMessage: "No cat! Shoo!",
    savedPopup: "SAVED!",
    eatenPopup: "NOM NOM!",
    spicyPopup: "TOO SPICY!",
    soundOn: "Sound On",
    soundOff: "Sound Muted",
    langBn: "বাংলা",
    langEn: "English",
  }
};
