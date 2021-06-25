# Implementation Logic

The logic implemented to solve the problem is as following:
* Each player will choose a secret key
* Each player will select the desire play (ROCK, PAPER or SCISSORS)
When the player send the selection what is really sent to the contract is the hash between the SecretKey + Selection.
This will make sure that for each player the actual selection will be recorded but it is not saved in plain text, so the other player cannot know in advance the selection of the player that played first.

After both players send their selection, the system will request for each player to send their SecretKey.

With the secret key, the contract will try to figure out which was the selection by each player, this is done by finding out the hash as follows:
Rock
Hash(SecretKey+1)
Paper
Hash(SecretKey+2)
Scissors
Hash(SecretKey+3)

So if any of this hash matches the hash that was previously saved then the found moved will be assigned to the player.

Once we discover each player selection then we can calculate the actual result based on each player selection.

# Test Coverage

The following tests cases were implemented:

* Initial values after deployment
* Reset variables to start a new game
* Verify that hash values send by each player is recorded on the smart contract
* Prevent same wallet to be both players
* Record the selected play by each user after each user send the secret key
* Calculate winner after each user send selection and secret key

## Test execution

Execute the following command to run the tests:
npx hardhat test    

# Environment Setup

* Install dependencies by running the following command 
    * yarn add ethers hardhat @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers 
* Instruction to execute the program:
    * Run the hardhat node with the following command (keep it running)
        * npx hardhat node
    * Compile the contract to generate the necessary artifacts, by executing the following command:    
        * npx hardhat compile
    * Deploy the contract in the running hardhat node with the following command:
        * npx hardhat run scripts/deploy.js --network localhost
    * Modify the react project to point to the deployed contract
        * copy the address generated when deployed the contract, search for something like this:
            * RPS deployed to: 0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8, copy the address
        * open file src/App.js
            * Search for this "const rpsAddress = '0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8';" (should be line 9)
            * Replace the address with the generated address after deploy.
    * Execute the react app with the following command (Keep it running)
        * npm start 

# Using the app

* Import into metamask at least 2 wallets from the list of wallets when the harhat node was executed.
* Switch metamask to localhost network
* Switch wallet to one of the wallet imported
* With the current wallet select ROCK/PAPER/SCISSORS
* Enter a secret key, it can be anything
* Click on play and accept the transaction on Metamask.
* Switch to the second imported wallet on metamask and repeat steps to select play.
* After second player made the play, each wallet will be requested to reveal the secret key (which has to be the same entered before)
* After both players revealead the secret key the app will show the result that was calculated by the contract.



