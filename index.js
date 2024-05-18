const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const games = {};

const getRandomWord = async () => {
  try {
    const response = await axios.get('https://random-word-api.herokuapp.com/word?number=1');
    return response.data[0];
  } catch (error) {
    console.error(error);
    return 'default';
  }
};

app.post('/start', async (req, res) => {
  const gameId = uuidv4();
  const word = await getRandomWord();
  games[gameId] = {
    word,
    guesses: [],
    wrongGuesses: 0,
  };
  console.log(games);
  res.json({ gameId, wordLength: word.length });
});

app.post('/guess', (req, res) => {
  const { gameId, letter } = req.body;
  const game = games[gameId];
  if (!game) return res.status(404).send('Game not found');

  if (game.word.includes(letter)) {
    game.guesses.push(letter);
  } else {
    game.wrongGuesses += 1;
  }

  const revealedWord = game.word.split('').map(l => (game.guesses.includes(l) ? l : '_')).join('');

  res.json({
    revealedWord,
    wrongGuesses: game.wrongGuesses,
    isGameOver: game.wrongGuesses >= 6 || !revealedWord.includes('_'),
    isWin: !revealedWord.includes('_'),
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
