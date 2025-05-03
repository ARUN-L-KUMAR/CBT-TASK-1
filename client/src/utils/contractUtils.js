import { ethers } from 'ethers';
import ArtisanNFTArtifact from '../contracts/ArtisanNFT.json';

// Contract address will be set after deployment
let contractAddress = '';

// Function to set contract address after deployment
export const setContractAddress = (address) => {
  contractAddress = address;
};

// Function to switch to Sepolia network
export const switchToSepoliaNetwork = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Chain ID for Sepolia in hex
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7', // Chain ID for Sepolia in hex
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Sepolia network to MetaMask:', addError);
        throw addError;
      }
    }
    console.error('Error switching to Sepolia network:', switchError);
    throw switchError;
  }
};

// Function to get contract instance
export const getContractInstance = async (needSigner = false) => {
  if (!contractAddress) {
    throw new Error('Contract address not set');
  }

  console.log('Using contract address:', contractAddress);

  // Check if MetaMask is installed
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install it to use this app.');
  }

  try {
    // Request account access if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create a provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log('Provider created successfully');

    // Get network information
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);

    // Check if connected to Sepolia testnet
    if (network.chainId !== 11155111n) {
      console.error('Not connected to Sepolia testnet. Please switch networks in MetaMask.');
      throw new Error('Please connect to the Sepolia testnet (Chain ID: 11155111) in your wallet to use this application.');
    }

    // Get the signer if needed
    const signer = needSigner ? await provider.getSigner() : null;
    if (signer) {
      console.log('Signer created successfully');
      const signerAddress = await signer.getAddress();
      console.log('Signer address:', signerAddress);

      // Check if the signer has enough balance
      const balance = await provider.getBalance(signerAddress);
      console.log('Signer balance:', ethers.formatEther(balance), 'ETH');

      if (balance < ethers.parseEther('0.001')) {
        console.warn('Warning: Low balance. You may not have enough ETH to complete transactions.');
      }
    }

    // Verify ABI exists
    if (!ArtisanNFTArtifact.abi) {
      console.error('ABI is missing or invalid');
      throw new Error('Contract ABI is missing or invalid');
    }

    // Create contract instance
    console.log('Creating contract instance...');
    const contract = new ethers.Contract(
      contractAddress,
      ArtisanNFTArtifact.abi,
      needSigner ? signer : provider
    );

    console.log('Contract instance created successfully');

    return { contract, provider, signer };
  } catch (error) {
    console.error('Error getting contract instance:', error);
    throw error;
  }
};

// Function to register an artisan
export const registerArtisan = async (artisanAddress, details) => {
  try {
    const { contract, signer, provider } = await getContractInstance(true);

    // Convert details object to JSON string if it's an object
    const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;

    console.log('Registering artisan with address:', artisanAddress);
    console.log('Artisan details (as string):', detailsString);
    console.log('Transaction sender:', await signer.getAddress());

    // Explicitly connect the contract to the signer to ensure the transaction is sent from the correct account
    const connectedContract = contract.connect(signer);

    // Get current gas price and increase it by 20%
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const increasedGasPrice = gasPrice * 120n / 100n; // Increase by 20%

    console.log('Current gas price:', gasPrice.toString());
    console.log('Increased gas price:', increasedGasPrice.toString());

    // Add gas limit and increased gas price to avoid replacement underpriced errors
    const tx = await connectedContract.registerArtisan(artisanAddress, detailsString, {
      gasLimit: 500000, // Adjust this value as needed
      gasPrice: increasedGasPrice // Use higher gas price
    });

    console.log('Transaction sent:', tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return tx.hash;
  } catch (error) {
    console.error('Error registering artisan:', error);
    // Provide more detailed error information
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction was rejected by the user');
    } else if (error.code === 'REPLACEMENT_UNDERPRICED') {
      // If we get a replacement underpriced error, try again with an even higher gas price
      console.log('Replacement transaction underpriced. Please try again with a higher gas price.');
      throw new Error('Transaction failed: Gas price too low. Please try again or wait for pending transactions to complete.');
    } else if (error.message && error.message.includes('account')) {
      throw new Error('Account error: ' + error.message);
    } else if (error.message && error.message.includes('replacement fee too low')) {
      throw new Error('Transaction failed: Gas price too low. Please try again or wait for pending transactions to complete.');
    } else {
      throw error;
    }
  }
};

// Function to mint a new artisanal item
export const mintArtisanItem = async (tokenURI, description, materials, ipfsImageHash) => {
  try {
    const { contract, signer, provider } = await getContractInstance(true);

    console.log('Minting item with URI:', tokenURI);
    console.log('Transaction sender:', await signer.getAddress());

    // Explicitly connect the contract to the signer
    const connectedContract = contract.connect(signer);

    // Get current gas price and increase it by 20%
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const increasedGasPrice = gasPrice * 120n / 100n; // Increase by 20%

    console.log('Current gas price:', gasPrice.toString());
    console.log('Increased gas price:', increasedGasPrice.toString());

    // Add gas limit and increased gas price to avoid replacement underpriced errors
    const tx = await connectedContract.mintArtisanItem(tokenURI, description, materials, ipfsImageHash, {
      gasLimit: 500000, // Adjust this value as needed
      gasPrice: increasedGasPrice // Use higher gas price
    });

    console.log('Transaction sent:', tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return tx.hash;
  } catch (error) {
    console.error('Error minting item:', error);
    // Provide more detailed error information
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction was rejected by the user');
    } else if (error.code === 'REPLACEMENT_UNDERPRICED') {
      // If we get a replacement underpriced error, try again with an even higher gas price
      console.log('Replacement transaction underpriced. Please try again with a higher gas price.');
      throw new Error('Transaction failed: Gas price too low. Please try again or wait for pending transactions to complete.');
    } else if (error.message && error.message.includes('account')) {
      throw new Error('Account error: ' + error.message);
    } else if (error.message && error.message.includes('replacement fee too low')) {
      throw new Error('Transaction failed: Gas price too low. Please try again or wait for pending transactions to complete.');
    } else {
      throw error;
    }
  }
};

// Function to get item details
export const getItemDetails = async (tokenId) => {
  try {
    const { contract } = await getContractInstance();
    console.log(`Fetching details for token ID: ${tokenId}`);
    const details = await contract.getItemDetails(tokenId);
    console.log(`Got details for token ID ${tokenId}:`, details);

    return {
      description: details[0],
      materials: details[1],
      creationDate: new Date(Number(details[2]) * 1000).toLocaleString(),
      artisan: details[3],
      ipfsImageHash: details[4],
      isVerified: details[5]
    };
  } catch (error) {
    console.error(`Error getting item details for token ID ${tokenId}:`, error);
    throw error;
  }
};

// Function to verify an item
export const verifyItem = async (tokenId, verified) => {
  try {
    const { contract, signer, provider } = await getContractInstance(true);

    console.log('Verifying item with token ID:', tokenId, 'Status:', verified);
    console.log('Transaction sender:', await signer.getAddress());

    // Explicitly connect the contract to the signer
    const connectedContract = contract.connect(signer);

    // Get current gas price and increase it by 20%
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const increasedGasPrice = gasPrice * 120n / 100n; // Increase by 20%

    console.log('Current gas price:', gasPrice.toString());
    console.log('Increased gas price:', increasedGasPrice.toString());

    // Add gas limit and increased gas price to avoid replacement underpriced errors
    const tx = await connectedContract.verifyItem(tokenId, verified, {
      gasLimit: 300000, // Adjust this value as needed
      gasPrice: increasedGasPrice // Use higher gas price
    });

    console.log('Transaction sent:', tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return tx.hash;
  } catch (error) {
    console.error('Error verifying item:', error);
    // Provide more detailed error information
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction was rejected by the user');
    } else if (error.code === 'REPLACEMENT_UNDERPRICED') {
      // If we get a replacement underpriced error, try again with an even higher gas price
      console.log('Replacement transaction underpriced. Please try again with a higher gas price.');
      throw new Error('Transaction failed: Gas price too low. Please try again or wait for pending transactions to complete.');
    } else if (error.message && error.message.includes('account')) {
      throw new Error('Account error: ' + error.message);
    } else if (error.message && error.message.includes('replacement fee too low')) {
      throw new Error('Transaction failed: Gas price too low. Please try again or wait for pending transactions to complete.');
    } else {
      throw error;
    }
  }
};

// Function to get artisan details
export const getArtisanDetails = async (artisanAddress) => {
  try {
    const { contract } = await getContractInstance();
    const result = await contract.getArtisanDetails(artisanAddress);

    console.log('Raw artisan details from contract:', result);

    // Check if the result is already an object
    if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
      console.log('Result is already an object, using directly');
      return {
        name: result.name || 'Unknown',
        location: result.location || 'Unknown',
        specialty: result.specialty || 'Unknown',
        bio: result.bio || '',
        registrationDate: result.registrationDate || Date.now()
      };
    }

    // The contract might return an array with [detailsString, registrationDate]
    let detailsString = '';
    let registrationDate = Date.now();

    if (Array.isArray(result)) {
      detailsString = result[0];
      registrationDate = result[1];
    } else {
      // If it's not an array, use the result directly as the details string
      detailsString = result;
    }

    console.log('Details string:', detailsString);
    console.log('Registration date:', registrationDate);

    // Try to parse the details string as JSON
    let parsedDetails = {};

    // If detailsString is already an object, use it directly
    if (typeof detailsString === 'object' && detailsString !== null) {
      console.log('Details string is already an object, using directly');
      parsedDetails = detailsString;
    } else {
      try {
        // Try to clean up the string if it's not valid JSON
        if (typeof detailsString === 'string') {
          // Remove any extra quotes that might be causing issues
          const cleanedString = detailsString.replace(/^"(.*)"$/, '$1');
          // Replace escaped quotes with regular quotes
          const unescapedString = cleanedString.replace(/\\"/g, '"');
          console.log('Cleaned details string:', unescapedString);

          parsedDetails = JSON.parse(unescapedString);
          console.log('Parsed artisan details:', parsedDetails);
        }
      } catch (parseError) {
        console.error('Error parsing artisan details JSON:', parseError);
        // If parsing fails, create a default object
        parsedDetails = {
          name: typeof detailsString === 'string' ? detailsString : 'Unknown',
          location: 'Unknown',
          specialty: 'Unknown',
          bio: ''
        };
      }
    }

    // Add the registration date to the parsed details
    parsedDetails.registrationDate = registrationDate;

    return parsedDetails;
  } catch (error) {
    console.error('Error getting artisan details:', error);
    throw error;
  }
};

// Function to check if an address is a registered artisan
export const isArtisanRegistered = async (artisanAddress) => {
  try {
    const { contract } = await getContractInstance();
    console.log('Checking if artisan is registered:', artisanAddress);
    const isRegistered = await contract.isArtisanRegistered(artisanAddress);
    console.log('Artisan registration status:', isRegistered);
    return isRegistered;
  } catch (error) {
    console.error('Error checking artisan registration:', error);
    // If there's an error, assume the user is not registered
    return false;
  }
};

// Function to get the token URI
export const getTokenURI = async (tokenId) => {
  try {
    // Skip token ID 1 as it's corrupted
    if (tokenId === 1) {
      console.warn(`Skipping token ID ${tokenId} as it's corrupted`);
      throw new Error('Token ID 1 is corrupted and should be skipped');
    }

    const { contract } = await getContractInstance();
    const uri = await contract.tokenURI(tokenId);
    return uri;
  } catch (error) {
    console.error('Error getting token URI:', error);
    throw error;
  }
};

// Function to get all registered artisans from events
export const getAllArtisans = async () => {
  try {
    const { contract, provider } = await getContractInstance();

    console.log('Fetching all registered artisans...');

    // Get the current block number
    const currentBlock = await provider.getBlockNumber();

    // Get all ArtisanRegistered events from the contract
    const filter = contract.filters.ArtisanRegistered();
    const events = await contract.queryFilter(filter, 0, currentBlock);

    console.log(`Found ${events.length} artisan registration events`);

    // Process the events to get unique artisans
    const artisans = [];
    const artisanAddresses = new Set();

    for (const event of events) {
      const artisanAddress = event.args[0];

      // Skip if we've already processed this artisan
      if (artisanAddresses.has(artisanAddress)) {
        continue;
      }

      artisanAddresses.add(artisanAddress);

      try {
        // Get artisan details
        const details = await getArtisanDetails(artisanAddress);

        artisans.push({
          address: artisanAddress,
          name: details.name || 'Unknown',
          location: details.location || 'Unknown',
          specialty: details.specialty || 'Unknown',
          bio: details.bio || '',
          registrationDate: details.registrationDate || Date.now()
        });
      } catch (error) {
        console.error(`Error fetching details for artisan ${artisanAddress}:`, error);
        // Add with minimal information if details can't be fetched
        artisans.push({
          address: artisanAddress,
          name: 'Unknown',
          location: 'Unknown',
          specialty: 'Unknown',
          bio: '',
          registrationDate: Date.now()
        });
      }
    }

    console.log(`Processed ${artisans.length} unique artisans`);
    return artisans;

  } catch (error) {
    console.error('Error getting all artisans:', error);
    throw error;
  }
};
