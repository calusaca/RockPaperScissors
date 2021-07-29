import { useState } from 'react';
import { ethers } from 'ethers';
import logo from './logo.svg';
import './App.css';
import RPS from './artifacts/contracts/RockPaperScissors.sol/RockPaperScissors.json';

import { useEffect } from 'react';

const rpsAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';



function App() {
  const [gameId, setGameId] = useState(0);
  const [gameStatus, setGameStatus] = useState('');
  const [secretPhrase, setSecretPhrase] = useState('');
  const [selectedPlay, setSelectedPlay] = useState(1);
  const [waitingSecretKey, setWaitingSecretKey] = useState(false);
  const [waitingPlayerMove, setWaitingPlayerMove] = useState(false);

  const MINUTE_MS = 3000;

  useEffect(() => {
    const interval = setInterval(() => {
      //console.log('Logs every 10sec');
      fetchGameInfo();
    }, MINUTE_MS);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function fetchGameInfo() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(rpsAddress, RPS.abi, provider);

      try {
        const data = await contract.getGameInfo();

        console.log('FetchGameInfo : ', data);



        setGameId(data[0].toNumber());
        setGameStatus(StatusMapping(data[1].toNumber()))

        if (data[1].toNumber() < 2) {
          setWaitingSecretKey(false);
          setWaitingPlayerMove(true);
        }

        if (data[1].toNumber() > 1 && data[1].toNumber() < 4) {
          setWaitingSecretKey(true);
          setWaitingPlayerMove(false);
        }

        if (data[1].toNumber() > 3) {
          const playersData = await contract.getPlayersInfo();
          console.log("Final players info: ", playersData);

          var finalValue = StatusMapping(data[1].toNumber());
          if (data[1].toNumber() == 4) {
            finalValue += " WINNER WALLET : " + playersData[0];
            finalValue += " - WINNER SELECTION: " + PlayMapping(playersData[1].toNumber());
            finalValue += " - LOOSER SELECTION: " + PlayMapping(playersData[3].toNumber());
          } else if ((data[1].toNumber() == 5)) {
            finalValue += " WINNER WALLET : " + playersData[2];
            finalValue += " - WINNER SELECTION: " + PlayMapping(playersData[3].toNumber());
            finalValue += " - LOOSER SELECTION: " + PlayMapping(playersData[1].toNumber());
          } else {
            finalValue += " WINNER SELECTION: " + PlayMapping(playersData[3].toNumber());
            finalValue += " - LOOSER SELECTION: " + PlayMapping(playersData[1].toNumber());
          }
          setGameStatus(finalValue);
          setWaitingPlayerMove(false);
          setWaitingSecretKey(false);
        }

      }
      catch (err) {
        console.log("Error: ", err);
      }
    }

  }


  async function postPlay() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
      console.log("secretePhrase: " + secretPhrase);
      console.log("selectedPlay: " + selectedPlay);
      console.log("To Hash: " + secretPhrase + selectedPlay);
      const hashedSelection = ethers.utils.id(secretPhrase + selectedPlay);
      console.log(hashedSelection);
      try {
        const transaction = await contract.setPlayHash(hashedSelection);
        const resp = await transaction.wait();
        console.log(resp);
        fetchGameInfo();
      } catch (err) {
        console.log(err.data.message);
      }
    }
  }

  async function postSecretePhrase() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
      console.log("secretePhrase: " + secretPhrase);
      try {
        const transaction = await contract.setSecretePhrase(secretPhrase);
        const resp = await transaction.wait();
        console.log(resp);
        fetchGameInfo();
      } catch (err) {
        console.log(err.data.message);
      }
    }
  }

  async function resetGame() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
      console.log("reset game");
      try {
        const transaction = await contract.resetGame();
        const resp = await transaction.wait();
        console.log(resp);
        fetchGameInfo();
      } catch (err) {
        console.log(err.data.message);
      }
    }
  }



  //enum PlayerChoice {WAITING, ROCK, PAPER, SCISSORS}
  function PlayMapping(playSelected) {
    switch (playSelected) {
      case 1:
        return "ROCK"
      case 2:
        return "PAPER"
      case 3:
        return "SCISSORS"
      default:
        break;
    }
  }

  // enum GameStatus {WAITING_PLAYERS, WAITING_PLAYER2, READY_FOR_CALCULATE, WAITING_CONFIRMATION_PLAYER2, WINNER_PLAYER1, WINNER_PLAYER2, DRAW}
  const GameStatus = {
    WAITING_PLAYERS: 0,
    WAITING_PLAYER2: 1,
    WAITING_PLAYERS_SECRET_KEY: 2,
    WAITING_OTHER_PLAYER_SECRET_KEY: 3,
    WINNER_PLAYER1: 4,
    WINNER_PLAYER2: 5,
    DRAW: 6
  }

  function StatusMapping(gameStatus) {
    switch (gameStatus) {
      case 0:
        return "WAITING FOR PLAYERS TO SELECT THEIR MOVE"
      case 1:
        return "WAITING FOR ONE PLAYER TO SELECT THEIR MOVE"
      case 2:
        return "PLAYERS SELECTION DONE, WAITING FOR PLAYERS TO SHARE SECRET KEY"
      case 3:
        return "WAITING FOR ONE PLAYER TO SHARE SECRETE KEY"
      case 4:
        return "WINNER PLAYER 1"
      case 5:
        return "WINNER PLAYER 2"
      case 6:
        return "DRAW"
      default:
        break;
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="row">
          <div className="menu">
            <h3>MENU</h3>
            <button onClick={fetchGameInfo}>Fetch Game Info</button>
            <br></br>
            <button onClick={resetGame}>Reset</button>
          </div>
          <div className="main">
            <h3>GAME ID: {gameId}</h3>
            <h3>GAME STATUS: {gameStatus}</h3>
          </div>
          <div className="main">
            {waitingPlayerMove &&
              <label>
                Choose:
                <select className="selectPlay" onChange={e => setSelectedPlay(e.target.value)} >
                  <option value="1">ROCK</option>
                  <option value="2">PAPER</option>
                  <option value="3">SCISSORS</option>
                </select>
              </label>
            }
            <br></br>

            {(waitingSecretKey || waitingPlayerMove) &&
              <label>
                Secrete Key:
                <input
                  className="inputBigger"
                  onChange={e => setSecretPhrase(e.target.value)}
                  placeholder="Enter your secret key"
                  maxLength="10"
                />
                <br></br>
                <sub>Remember the Secret Key to resolve winner </sub>
              </label>
            }
            <div className="row">
              {waitingPlayerMove &&
                <div>
                  <button className="buttonPlay" onClick={postPlay}>PLAY</button>
                </div>
              }
              {waitingSecretKey &&
                <div >
                  <button className="buttonSecrete" onClick={postSecretePhrase}>REVEAL SECRET KEY</button>
                </div>
              }
            </div>
          </div>
        </div>

      </header>
    </div>
  );
}

export default App;
