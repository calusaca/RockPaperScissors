// test/Box.proxy.js
// Load dependencies
const { expect } = require('chai');
 
let RPS;
let rps;
 
// Start test block
describe('RockPaperScissors (proxy)', function () {
  beforeEach(async function () {
    RPS = await ethers.getContractFactory("RockPaperScissors");
    rps = await upgrades.deployProxy(RPS);
  });
 
  // Test case
  it('retrieve returns a value previously initialized', async function () {
    // Test if the returned value is the same one
    // Note that we need to use strings to compare the 256 bit integers
    expect((await rps.gameStatus()).toString()).to.equal('0');
  });
});