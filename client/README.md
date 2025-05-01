<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
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
>>>>>>> 99299d6a80b40bb40c840801d4f824d131d65a13
