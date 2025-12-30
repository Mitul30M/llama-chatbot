const botCopy = {
  // Use for the input field before the user types
  placeholders: [
    "Spill it...",
    "What's the tea? ☕",
    "Your turn. 🎤",
    "Hit me with it.",
    "Go ahead, dazzle me.",
    "Make some noise...",
    "Speak your truth to the machine.",
    "Input your wildest dreams...",
    "What secrets shall we uncover?",
    "Beaming in... 📡",
    "Initialize conversation.",
    "Enter the simulation.",
    "Challenge me. 🥊",
    "Drop a hot take. 🔥",
    "Unleash your curiosity.",
    "Tell me something I don't know.",
    "Start a riot (the creative kind).",
    "Say something smart.",
    "Talk to me, Goose.",
    "What's cookin'?",
    "Vibe check: Go!",
    "Lay it on me.",
    "Ready when you are. ✨",
  ],

  // Use for the loading state while the AI is generating
  loadingStates: [
    "Reticulating splines... 👾",
    "Downloading more RAM (just kidding)...",
    "Buffering the multiverse...",
    "Consulting the digital oracle. 🔮",
    "Assembling pixels and possibilities...",
    "Initiating neural handshake. 🤝",
    "Staring into the void for an answer...",
    "Brewing a fresh pot of data. ☕",
    "Searching my 175 billion brain cells...",
    "Polishing my internal logic... ✨",
    "Consulting with my fellow bots.",
    "Training my gears to think harder. ⚙️",
    "Mixing a cocktail of insights... 🍸",
    "Cooking up something spicy. 🔥",
    "Wrangling rogue algorithms. 🤠",
    "Scanning the vibes... 📈",
    "Dusting off the knowledge base.",
    "Finding the right words (they're shy).",
    "Manifesting the reply...",
    "Sifting through the ether...",
    "Translating silence into logic.",
    "Whispering to the cloud. ☁️",
    "Awaiting the spark of inspiration. ⚡",
  ],
};

export const getBothPlaceholders = () => {
  const placeholder =
    botCopy.placeholders[
      Math.floor(Math.random() * botCopy.placeholders.length)
    ];
  const loadingState =
    botCopy.loadingStates[
      Math.floor(Math.random() * botCopy.loadingStates.length)
    ];
  return { placeholder, loadingState };
};
