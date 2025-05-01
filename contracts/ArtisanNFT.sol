// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "./node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract ArtisanNFT is ERC721URIStorage, Ownable, ERC721Burnable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Artisan registration
    mapping(address => bool) public registeredArtisans;
    mapping(address => string) public artisanDetails; // Name, location, specialty

    // Item metadata
    struct ArtisanItem {
        string description;
        string materials;
        uint256 creationDate;
        address artisan;
        string ipfsImageHash;
        bool isVerified;
    }

    // Mapping from token ID to item metadata
    mapping(uint256 => ArtisanItem) public artisanItems;

    // Events
    event ArtisanRegistered(address indexed artisan, string details);
    event ItemMinted(uint256 indexed tokenId, address indexed artisan, string description, string materials);
    event ItemVerified(uint256 indexed tokenId, bool verified);

    constructor() ERC721("ChennaiArtisanNFT", "CANFT") {
        // Initialize with contract deployer as owner
    }

    modifier onlyArtisan() {
        require(registeredArtisans[msg.sender], "Not a registered artisan");
        _;
    }

    function registerArtisan(address _artisan, string memory _details) public onlyOwner {
        registeredArtisans[_artisan] = true;
        artisanDetails[_artisan] = _details;
        emit ArtisanRegistered(_artisan, _details);
    }

    function mintArtisanItem(
        string memory _tokenURI,
        string memory _description,
        string memory _materials,
        string memory _ipfsImageHash
    ) public onlyArtisan returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // Store item metadata
        artisanItems[tokenId] = ArtisanItem({
            description: _description,
            materials: _materials,
            creationDate: block.timestamp,
            artisan: msg.sender,
            ipfsImageHash: _ipfsImageHash,
            isVerified: false
        });

        emit ItemMinted(tokenId, msg.sender, _description, _materials);

        return tokenId;
    }

    function verifyItem(uint256 _tokenId, bool _verified) public onlyOwner {
        require(_exists(_tokenId), "Item does not exist");
        artisanItems[_tokenId].isVerified = _verified;
        emit ItemVerified(_tokenId, _verified);
    }

    function getItemDetails(uint256 _tokenId) public view returns (
        string memory description,
        string memory materials,
        uint256 creationDate,
        address artisan,
        string memory ipfsImageHash,
        bool isVerified
    ) {
        require(_exists(_tokenId), "Item does not exist");
        ArtisanItem memory item = artisanItems[_tokenId];

        return (
            item.description,
            item.materials,
            item.creationDate,
            item.artisan,
            item.ipfsImageHash,
            item.isVerified
        );
    }

    function getArtisanDetails(address _artisan) public view returns (string memory) {
        require(registeredArtisans[_artisan], "Not a registered artisan");
        return artisanDetails[_artisan];
    }

    function isArtisanRegistered(address _artisan) public view returns (bool) {
        return registeredArtisans[_artisan];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete artisanItems[tokenId];
    }
}
