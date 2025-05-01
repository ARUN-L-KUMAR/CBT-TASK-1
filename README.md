# Chennai Artisanal Goods Provenance DApp

A decentralized application (DApp) focused on bringing transparency to the local artisanal market in Chennai. This platform allows registered local artisans to certify their unique products (e.g., pottery, textiles) on the blockchain, providing buyers with verifiable proof of authenticity and origin.

## Features

- **Artisan Registration**: Only verified artisans can mint NFTs for their products
- **NFT Minting**: Each artisanal item is represented as a unique NFT with detailed metadata
- **Provenance Tracking**: Full history of each item is stored on the blockchain
- **Verification System**: Platform administrators can verify the authenticity of items
- **IPFS Integration**: Images and metadata are stored on IPFS for decentralized storage

## Technology Stack

- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract**: Solidity
- **Development Framework**: Truffle
- **Frontend**: React.js with Tailwind CSS
- **Web3 Integration**: ethers.js
- **Decentralized Storage**: IPFS (via Pinata)
- **Blockchain Provider**: Alchemy
- **Token Standard**: ERC-721 (NFTs)

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MetaMask browser extension
- Truffle CLI

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd chennai-artisanal-goods-provenance
   ```

2. Install dependencies:
   ```
   npm install
   npm run client-install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Ethereum wallet private key (without 0x prefix)
   PRIVATE_KEY=your_private_key_here

   # Sepolia testnet RPC URL (e.g., from Infura or Alchemy)
   SEPOLIA_RPC_URL=your_sepolia_rpc_url

   # Optional: Etherscan API Key for contract verification
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

4. For IPFS integration, update the Pinata API key and secret in `client/src/utils/ipfsUtils.js`.

## Deployment Instructions

### Compiling the Smart Contract

1. Compile the smart contract:
   ```
   npx truffle compile
   ```

2. Copy the ABI to the client directory:
   ```
   node scripts/copyAbi.js
   ```

### Deploying to Sepolia Testnet

1. Make sure your `.env` file is configured with the correct private key and Sepolia RPC URL.

2. Deploy to Sepolia testnet:
   ```
   npx truffle migrate --network sepolia
   ```

3. After successful deployment, you'll see the contract address in the console output. Copy this address.

4. Update the contract address in `client/src/App.js`:
   ```javascript
   // Set the contract address after deployment
   const CONTRACT_ADDRESS = '0x...'; // Replace with your deployed contract address
   ```

### Troubleshooting Deployment Issues

If you encounter connection issues when deploying to Sepolia:

1. Make sure your RPC URL is correct and working
2. Try using a different RPC provider (Alchemy is recommended, but you can also try Infura, QuickNode, etc.)
3. Check that your wallet has enough ETH for gas fees
4. Verify that your private key is correct and has the necessary permissions

### Running the Frontend

1. Start the React frontend:
   ```
   npm run client
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Smart Contract

The main smart contract is `ArtisanNFT.sol`, which extends ERC721 with additional functionality:

- Registration of artisans
- Minting of artisanal items with detailed metadata
- Verification of items by the contract owner
- Tracking of item provenance

### Contract Structure

```solidity
contract ArtisanNFT is ERC721URIStorage, Ownable, ERC721Burnable {
    // Artisan registration
    mapping(address => bool) public registeredArtisans;
    mapping(address => string) public artisanDetails;

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

    // Main functions:
    // - registerArtisan: Register a new artisan (owner only)
    // - mintArtisanItem: Create a new NFT for an artisanal item (artisan only)
    // - verifyItem: Verify an item's authenticity (owner only)
    // - getItemDetails: Get detailed information about an item
}
```

## Frontend

The React frontend provides interfaces for:

- Connecting to MetaMask
- Browsing artisanal items
- Minting new items (for registered artisans)
- Registering new artisans (for contract owner)
- Verifying items (for contract owner)

## License

MIT

## Contributors

- Chennai Artisanal Goods Team
