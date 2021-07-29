//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;


import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";




contract RockPaperScissorV2 is Initializable {

    enum PlayerChoice {WAITING, ROCK, PAPER, SCISSORS}
    
    enum GameStatus {WAITING_PLAYERS, WAITING_PLAYER2, READY_FOR_CALCULATE, WAITING_CONFIRMATION_PLAYER2, WINNER_PLAYER1, WINNER_PLAYER2, DRAW}

    struct Game {
        address player1;
        address player2;
        PlayerChoice player1Selection;
        PlayerChoice player2Selection;        
        bytes32 player1Hash;
        bytes32 player2Hash;
        GameStatus status;
    }

    event WinnerDeclared(address indexed winner, uint selectedPlay, uint losserSelectedPlay);

    Game private game;

    uint private gameId;

    function initialize() public initializer {
        console.log("Deploying a RockPaperScissors ");    
        game.status = GameStatus.WAITING_PLAYERS;
        game = Game(address(0),address(0),PlayerChoice.WAITING, PlayerChoice.WAITING, "", "", GameStatus.WAITING_PLAYERS);            
    }

    function gameStatus() external view returns (GameStatus) {
      return game.status;
    }

    function getGameId() external view returns (uint) {
        return gameId;
    }

    function getGameInfo() external view returns (uint, uint){
        console.log("getGameInfo, gameId: %s ", gameId);                
        return (gameId, uint(game.status));
    }

    function getPlayersInfo() external view returns (address, uint, address, uint, bytes32, bytes32){
        return (game.player1, uint(game.player1Selection), game.player2, uint(game.player2Selection), game.player1Hash, game.player2Hash);
    }

    function resetGame() external {
      game = Game(address(0),address(0),PlayerChoice.WAITING, PlayerChoice.WAITING, "", "", GameStatus.WAITING_PLAYERS);
      gameId = gameId + 1; 
    }

    function setPlayHash(bytes32 playerHash) external {
        console.log("Received hash: '%s'", string(abi.encodePacked(playerHash)));
        require(game.status == GameStatus.WAITING_PLAYERS || game.status == GameStatus.WAITING_PLAYER2, "Plays already done for this game");
        require(game.player1 != msg.sender && game.player2 != msg.sender, "This wallet already played");
                

        if (game.status == GameStatus.WAITING_PLAYERS){
            game.player1 = msg.sender;
            game.player1Hash = playerHash;
            game.status = GameStatus.WAITING_PLAYER2;
        } else {
          game.player2 = msg.sender;
          game.player2Hash = playerHash;  
          game.status = GameStatus.READY_FOR_CALCULATE;          
        }
    }

    function setSecretePhrase(string memory phrase) external {
        console.log("Received secrete phrase '%s'", phrase);
        require(game.status == GameStatus.READY_FOR_CALCULATE || game.status == GameStatus.WAITING_CONFIRMATION_PLAYER2, "Invalid game status for this function");
        require(game.player1 == msg.sender || game.player2 == msg.sender, "This wallet is not part of this game");

        if(game.player1 == msg.sender) {
            game.player1Selection = calculatePlay(phrase, game.player1Hash);                
        } else {
            game.player2Selection = calculatePlay(phrase, game.player2Hash);            
        }
        game.status = GameStatus.WAITING_CONFIRMATION_PLAYER2;
        console.log("game.player1Selection: '%s' game.player2Selection: '%s'", uint(game.player1Selection), uint(game.player2Selection));
        if (game.player1Selection != PlayerChoice.WAITING && game.player2Selection != PlayerChoice.WAITING) {
            calculateWinner();
            
            
        }
    }    

    function calculateWinner() private {  
        console.log("Calculate Winner p1 selection '%s' p2 selection '%s'", uint(game.player1Selection), uint(game.player2Selection));      
        if (game.player1Selection == game.player2Selection) {
            game.status = GameStatus.DRAW;
        } else if(game.player1Selection == PlayerChoice.PAPER && game.player2Selection == PlayerChoice.ROCK) {
            game.status = GameStatus.WINNER_PLAYER1;
        } else if (game.player1Selection == PlayerChoice.PAPER && game.player2Selection == PlayerChoice.SCISSORS) {
            game.status = GameStatus.WINNER_PLAYER2;
        } else if(game.player1Selection == PlayerChoice.ROCK  && game.player2Selection == PlayerChoice.PAPER) {
            game.status = GameStatus.WINNER_PLAYER2;
        } else if (game.player1Selection == PlayerChoice.ROCK && game.player2Selection == PlayerChoice.SCISSORS) {
            game.status = GameStatus.WINNER_PLAYER1;
        } else if(game.player1Selection == PlayerChoice.SCISSORS  && game.player2Selection == PlayerChoice.PAPER) {
            game.status = GameStatus.WINNER_PLAYER1;
        } else if (game.player1Selection == PlayerChoice.SCISSORS && game.player2Selection == PlayerChoice.ROCK) {
            game.status = GameStatus.WINNER_PLAYER2;
        }

        console.log("EMIT RESULT");
        if (game.status == GameStatus.WINNER_PLAYER1){
                emit WinnerDeclared(game.player1, uint(game.player1Selection), uint(game.player2Selection));
            } else if (game.status == GameStatus.WINNER_PLAYER2) {
                emit WinnerDeclared(game.player2, uint(game.player2Selection), uint(game.player1Selection));
            } else{
                emit WinnerDeclared(address(0), uint(game.player2Selection), uint(game.player1Selection));
            }            
    }

    function calculatePlay(string memory phrase, bytes32 hashed)  pure private returns(PlayerChoice){        
        if (keccak256(abi.encodePacked(phrase, "1")) == hashed){
            return PlayerChoice.ROCK;
        } else if (keccak256(abi.encodePacked(phrase, "2")) == hashed){
            return PlayerChoice.PAPER;
        } else if (keccak256(abi.encodePacked(phrase, "3")) == hashed){
            return PlayerChoice.SCISSORS;
        } else {
            revert("Secrete Phrase or Player Selection error");
        }
    }

    function getGameStatusString() external view returns (string memory){
        if (game.status == GameStatus.WAITING_PLAYERS){
            return "Waiting for Both Players Play";
        } else if(game.status == GameStatus.WAITING_PLAYER2) {
            return "Waiting for Second Player to Play";
        } else if(game.status == GameStatus.READY_FOR_CALCULATE) {
            return "Ready to calculate winner, waiting for confirmation from players";
        } else if(game.status == GameStatus.WAITING_CONFIRMATION_PLAYER2) {
            return "Ready for Calculate winner, waiting for second player confirmation";
        } else if(game.status == GameStatus.WINNER_PLAYER1) {
            return "Player 1 win the game";
        } else if(game.status == GameStatus.WINNER_PLAYER2) {
            return "Player 2 win the game";
        } else {
            return "Game result in draw";
        } 
    } 
}