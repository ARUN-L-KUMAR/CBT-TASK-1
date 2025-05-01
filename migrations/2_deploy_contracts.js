const ArtisanNFT = artifacts.require("ArtisanNFT");

module.exports = function (deployer) {
  deployer.deploy(ArtisanNFT);
};
