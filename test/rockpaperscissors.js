const { expect } = require("chai");
describe("ROCK PAPER SCISSORS", function () {

  let RPS;
  let rps;
  let gameInfo1;
  let playerInfo1;
  let hashToStore1;
  let hashToStore2;
  let player1SelectedMove;
  let player2SelectedMove;
  let player1SecretKey;
  let player2SecretKey;



  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    RPS = await ethers.getContractFactory("RockPaperScissors");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    rps = await RPS.deploy();
  });

  describe("Deployment", function () {
    it("Should set the initial values after deployment", async function () {
      gameInfo1 = await rps.getGameInfo();
      expect(gameInfo1[0].toNumber()).to.equal(0);
      expect(gameInfo1[1].toNumber()).to.equal(0);

      playerInfo1 = await rps.getPlayersInfo();
      expect(playerInfo1[0]).to.equal("0x0000000000000000000000000000000000000000");
      expect(playerInfo1[2]).to.equal("0x0000000000000000000000000000000000000000");
      expect(playerInfo1[1]).to.equal(0);
      expect(playerInfo1[3]).to.equal(0);

    });
  });

  describe("Functions", function () {
    it("Should reset all values to the initial values after deployment and increment gameId in 1", async function () {
      gameInfo1 = await rps.getGameInfo();
      expect(gameInfo1[0].toNumber()).to.equal(0);
      expect(gameInfo1[1].toNumber()).to.equal(0);

      playerInfo1 = await rps.getPlayersInfo();
      expect(playerInfo1[0]).to.equal("0x0000000000000000000000000000000000000000");
      expect(playerInfo1[2]).to.equal("0x0000000000000000000000000000000000000000");
      expect(playerInfo1[1]).to.equal(0);
      expect(playerInfo1[3]).to.equal(0);

      await rps.resetGame();
      gameInfo2 = await rps.getGameInfo();
      expect(gameInfo2[0].toNumber()).to.equal(gameInfo1[0].toNumber() + 1);
      expect(gameInfo2[1].toNumber()).to.equal(0);

      playerInfo1 = await rps.getPlayersInfo();
      expect(playerInfo1[0]).to.equal("0x0000000000000000000000000000000000000000");
      expect(playerInfo1[2]).to.equal("0x0000000000000000000000000000000000000000");
      expect(playerInfo1[1]).to.equal(0);
      expect(playerInfo1[3]).to.equal(0);
    });

    it("Should store the hash value send by the players", async function () {
      hashToStore1 = ethers.utils.id("KeyToHash1");
      await rps.setPlayHash(hashToStore1);

      playerInfo1 = await rps.getPlayersInfo();      
      expect(playerInfo1[4]).to.equal(hashToStore1);
      
      hashToStore2 = ethers.utils.id("KeyToHash2");
      await rps.connect(addr1).setPlayHash(hashToStore2);
      playerInfo1 = await rps.getPlayersInfo();      
      expect(playerInfo1[5]).to.equal(hashToStore2);
    });

    it("Should prevent same wallet to send more than 1 Hash", async function () {
      hashToStore1 = ethers.utils.id("KeyToHash1");
      await rps.setPlayHash(hashToStore1);

      playerInfo1 = await rps.getPlayersInfo();      
      expect(playerInfo1[4]).to.equal(hashToStore1);
      
      hashToStore2 = ethers.utils.id("KeyToHash2");
      await expect(rps.setPlayHash(hashToStore2)).to.be.revertedWith("This wallet already played");      
    });

    it("Should store the selected move by player after receive the secret key", async function () {
      player1SelectedMove = 1;
      player1SecretKey = "player1"
      hashToStore1 = ethers.utils.id(player1SecretKey + player1SelectedMove);
      await rps.setPlayHash(hashToStore1);      
      
      player2SelectedMove = 2;
      player2SecretKey = "player2"
      hashToStore2 = ethers.utils.id(player2SecretKey + player2SelectedMove);
      await rps.connect(addr1).setPlayHash(hashToStore2);
      
      await rps.setSecretePhrase(player1SecretKey);
      await rps.connect(addr1).setSecretePhrase(player2SecretKey);

      playerInfo1 = await rps.getPlayersInfo();      
      expect(playerInfo1[1]).to.equal(player1SelectedMove);
      expect(playerInfo1[3]).to.equal(player2SelectedMove);
    });

    it("Should calculate the winner after both players choose their play and revelead the secret key", async function () {
      //enum PlayerChoice {WAITING, ROCK, PAPER, SCISSORS}
      //Player 1 selected ROCK
      player1SelectedMove = 1;
      player1SecretKey = "player1"
      hashToStore1 = ethers.utils.id(player1SecretKey + player1SelectedMove);
      await rps.setPlayHash(hashToStore1);      
      
      //Player 2 selected PAPER
      player2SelectedMove = 2;
      player2SecretKey = "player2"
      hashToStore2 = ethers.utils.id(player2SecretKey + player2SelectedMove);
      await rps.connect(addr1).setPlayHash(hashToStore2);
      
      await rps.setSecretePhrase(player1SecretKey);
      await rps.connect(addr1).setSecretePhrase(player2SecretKey);
      
      gameInfo1 = await rps.getGameInfo();      
      //GameStatus {WAITING_PLAYERS, WAITING_PLAYER2, READY_FOR_CALCULATE, WAITING_CONFIRMATION_PLAYER2, WINNER_PLAYER1, WINNER_PLAYER2, DRAW}
      //For the current game:
      // Player 1 = Rock
      // Player 2 = Paper
      // Result should be that Player 2 WIN which implies that code should be 5
      expect(gameInfo1[1]).to.equal(5);      
    });
  }); 
  
});
