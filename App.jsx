import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Ghost, HelpCircle, Check, User } from 'lucide-react';

// --- Configuration des Questions ---
const QUESTIONS = [
  {
    id: 1,
    question: "Pour tes vacances de rêve (ou de cauchemar)...",
    optionA: "Partir 1 semaine avec Enguerrand",
    optionB: "Partir 1 semaine avec Juliette Tramier",
    chaosA: 5,
    chaosB: 5 // Les deux sont probablement le chaos ;)
  },
  {
    id: 2,
    question: "Choisis ton mentor pour la vie entière :",
    optionA: "Mme Richard",
    optionB: "Mr Daume",
    chaosA: 2, // Plus sage ?
    chaosB: 10 // Plus chaos ?
  },
  {
    id: 3,
    question: "Tu préferes travailler :",
    optionA: "Avec de la musique (à fond)",
    optionB: "un silence absolu",
    chaosA: 8,
    chaosB: 0
  },
  {
    id: 4,
    question: "Allez, sois honnête...",
    optionA: "Chaud de se refaire un joggo un de ces quatre ?",
    optionB: "Plus jamais de sport de ma vie",
    chaosA: 10, // C'est l'indice fort pour toi
    chaosB: 0
  },
  {
    id: 5,
    question: "Le deal ultime :",
    optionA: "CAP : Tu m'aide pour le Classique, je t'aide pour le Jazz",
    optionB: "PAS CAP : le classique c'est la vie",
    chaosA: 20, // Max chaos/fun
    chaosB: -5
  }
];

const SECRET_NAME = "AUGUSTE";

export default function App() {
  // --- États de l'application ---
  // Ajout de la vue 'reveal' pour quand on ne trouve pas à la fin
  const [view, setView] = useState('welcome');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [chaosScore, setChaosScore] = useState(0);
  const [identityRevealed, setIdentityRevealed] = useState(false);
  const [foundAtRound, setFoundAtRound] = useState(null);
  const [guessInput, setGuessInput] = useState("");
  const [shake, setShake] = useState(false); // Pour l'effet de vibration visuelle

  // Effet sonore (simulé par console pour éviter les problèmes d'autoplay, 
  // mais on pourrait ajouter de vrais sons ici)
  const playSound = (type) => {
    // Dans une vraie app, on jouerait un Audio ici
    if (navigator.vibrate) navigator.vibrate(type === 'fail' ? 200 : 50);
  };

  const handleStart = () => {
    playSound('pop');
    setView('question');
  };

  const handleAnswer = (chaosPoints) => {
    playSound('pop');
    setChaosScore(prev => prev + chaosPoints);
    
    // Si on n'a pas encore trouvé qui c'est, on propose de deviner
    if (!identityRevealed) {
      setView('guess');
    } else {
      goToNextQuestion();
    }
  };

  const goToNextQuestion = () => {
    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setView('question');
    } else {
      handleFinish();
    }
  };

  const handleSkipGuess = () => {
    // Si c'est la dernière question et qu'on skip, on révèle l'identité
    if (currentQIndex === QUESTIONS.length - 1) {
      setView('reveal');
    } else {
      goToNextQuestion();
    }
  };

  const handleGuessSubmit = () => {
    if (guessInput.trim().toUpperCase() === SECRET_NAME) {
      // GAGNÉ !
      playSound('success');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF69B4', '#8A2BE2', '#00FFFF']
      });
      setIdentityRevealed(true);
      setFoundAtRound(currentQIndex + 1);
      setView('found');
    } else {
      // PERDU
      playSound('fail');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      // On ne bloque pas, on peut réessayer ou passer
    }
  };

  const handleFinish = () => {
    // Lancement de confettis final
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF0000', '#00FF00', '#0000FF']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF0000', '#00FF00', '#0000FF']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
    setView('result');
  };

  // --- Composants d'Écrans ---

  // 1. Écran d'Accueil
  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="z-10 text-center space-y-8"
        >
          <div className="inline-block p-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
            <Ghost size={48} className="text-white" />
          </div>
          
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              Le Quiz de l'Amitié
            </h1>
            {/* Suppression de "Mission 30 Novembre" comme demandé */}
            <p className="text-slate-400 text-lg">T'es pas prête (rime avec tartiflette!)</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-slate-700">
            <p className="mb-2">🕵️‍♀️ <span className="font-bold text-pink-400">Objectif :</span> Répondre aux questions ET démasquer qui je suis!</p>
            <p>⚠️ Attention : En fonction de tes réponses, l'indice de Chaos sera mesuré.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl font-bold text-xl shadow-xl shadow-indigo-500/30"
          >
            C'est parti !
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // 2. Écran Question
  if (view === 'question') {
    const q = QUESTIONS[currentQIndex];
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col p-4 relative font-sans">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full mb-8 mt-2">
          <motion.div 
            className="h-full bg-pink-500 rounded-full"
            initial={{ width: `${((currentQIndex) / QUESTIONS.length) * 100}%` }}
            animate={{ width: `${((currentQIndex + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <motion.div
          key={q.id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
        >
          <h2 className="text-2xl font-bold text-center mb-8 text-white">
            Question {currentQIndex + 1}/{QUESTIONS.length}
            <br/>
            <span className="text-lg font-normal text-slate-400 mt-2 block">{q.question}</span>
          </h2>

          <div className="space-y-4">
            {/* Option A */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(q.chaosA)}
              className="w-full p-6 bg-indigo-600 rounded-2xl text-left relative overflow-hidden group shadow-lg shadow-indigo-900/20 border border-indigo-500/30"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-4xl font-bold">A</span>
              </div>
              <span className="text-lg font-semibold relative z-10">{q.optionA}</span>
            </motion.button>

            <div className="flex items-center justify-center text-slate-500 font-bold text-sm">OU</div>

            {/* Option B */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(q.chaosB)}
              className="w-full p-6 bg-pink-600 rounded-2xl text-left relative overflow-hidden group shadow-lg shadow-pink-900/20 border border-pink-500/30"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-4xl font-bold">B</span>
              </div>
              <span className="text-lg font-semibold relative z-10">{q.optionB}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Écran Guess (Interstitiel)
  if (view === 'guess') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="w-full max-w-md space-y-6 text-center"
        >
          <div className="inline-block p-3 bg-yellow-400/20 rounded-full mb-4">
            <HelpCircle className="text-yellow-400 w-12 h-12" />
          </div>
          
          <h3 className="text-2xl font-bold">Indice débloqué...</h3>
          <p className="text-slate-400">HOHOHOHOHO! As-tu deviné qui t'envoie ce quizz ?</p>

          <input
            type="text"
            placeholder="Tape le prénom ici..."
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-800 border-2 border-slate-700 focus:border-yellow-400 outline-none text-center text-xl text-white placeholder-slate-500 transition-colors"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGuessSubmit}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors shadow-lg shadow-yellow-500/20"
          >
            Je valide ma réponse !
          </motion.button>

          <div className="pt-4">
             {/* Bouton "Passer" rendu plus visible */}
            <button
              onClick={handleSkipGuess}
              className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 font-semibold hover:bg-slate-800 hover:text-white transition-all"
            >
              Je donne ma langue au chat (Passer) →
            </button>
          </div>
         
        </motion.div>
      </div>
    );
  }

  // 4. Écran "Trouvé !" (Succès)
  if (view === 'found') {
    return (
      <div className="min-h-screen bg-green-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20"
        >
          <Check className="w-24 h-24 text-green-400 mx-auto mb-4" />
          <h2 className="text-4xl font-extrabold mb-2">BIEN JOUÉ !</h2>
          <p className="text-xl mb-6">HOHOHOHOHO, tu as trouvé! C'est bien moi, <span className="font-bold text-green-300">Auguste</span> !</p>
          <p className="text-slate-300 mb-8">
            Bien joué Jehanne! Mais c'est pas fini, il reste peut-être des questions (ou le résultat final) !
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNextQuestion}
            className="px-8 py-3 bg-white text-green-900 font-bold rounded-full text-lg shadow-lg"
          >
            Continuer
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // 5. Écran "Révélation" (Échec/Abandon à la fin)
  if (view === 'reveal') {
    return (
      <div className="min-h-screen bg-indigo-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20"
        >
          <User className="w-24 h-24 text-indigo-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Le mystère est levé...</h2>
          <p className="text-lg mb-6 text-slate-200">
            T'as pas trouvé? Même avec la dernière question? ?<br/>
            Là je peux écrire ce que je veux parce que je sais que tu n'iras jamais !
            AHAHAHAHA! C'était moi:
          </p>
          <p className="text-5xl font-black text-indigo-300 mb-8 tracking-wider">
            AUGUSTE
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFinish}
            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full text-lg shadow-lg transition-colors"
          >
            Voir mon score de Chaos →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // 6. Écran Résultats
  if (view === 'result') {
    let chaosTitle = "L'Ange Gardien";
    let chaosColor = "text-blue-400";
    if (chaosScore > 15) { chaosTitle = "Le Chaos Incarné"; chaosColor = "text-red-500"; }
    else if (chaosScore > 8) { chaosTitle = "L'Esprit Libre"; chaosColor = "text-purple-400"; }

    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center font-sans relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="z-10 max-w-md w-full bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">Analyse Terminée</h2>
          
          <div className="mb-8">
            <p className="text-sm text-slate-400 mb-1">Indice de Chaos</p>
            <div className={`text-4xl font-black ${chaosColor} mb-2`}>{chaosScore * 2}%</div>
            <div className={`text-xl font-bold ${chaosColor}`}>{chaosTitle}</div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl mb-8 border border-slate-700/50">
            <p className="text-sm text-slate-400 mb-2">Statut de l'enquête</p>
            {identityRevealed ? (
              <p className="text-green-400 font-semibold">
                Grillé en {foundAtRound} question{foundAtRound && foundAtRound > 1 ? 's' : ''} ! 🕵️‍♀️
              </p>
            ) : (
              <p className="text-slate-300 font-semibold">
                Identité révélée à la fin (Le suspense était total) 🥸
              </p>
            )}
          </div>

          <hr className="border-slate-700 my-6" />

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-4"
          >
            <p className="text-xl font-medium leading-relaxed">
              "Tu gères! <br/>
              J'éspère que t'as passé un bon moment."
            </p>
            <div className="flex justify-center items-center gap-2 text-pink-400 font-bold text-lg mt-4">
              <Heart className="fill-current" />
              <span>Je pense fort à toi.</span>
              <Heart className="fill-current" />
            </div>
            <p className="text-sm text-slate-500 mt-8 font-mono">
              - Auguste
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return null;
}
