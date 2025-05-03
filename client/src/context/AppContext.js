import React, { createContext, useState, useEffect } from 'react';
import { getContractInstance, isArtisanRegistered, setContractAddress } from '../utils/contractUtils';

// Create context
export const AppContext = createContext();

// Create provider
export const AppProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isArtisan, setIsArtisan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Use contract address from environment variable
  useEffect(() => {
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x5D2d4849A8B37F86228607446F0152176bB3Ae5D';
    console.log('Setting contract address from AppContext:', contractAddress);
    setContractAddress(contractAddress);
  }, []);

  useEffect(() => {
    if (account) {
      checkUserRole();
    } else {
      setIsOwner(false);
      setIsArtisan(false);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const checkUserRole = async () => {
    if (!account) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    setIsWrongNetwork(false);

    try {
      console.log('Checking user role for account:', account);
      const { contract } = await getContractInstance();

      // Check if user is owner
      try {
        console.log('Fetching contract owner...');
        const owner = await contract.owner();
        console.log('Contract owner:', owner);
        const isUserOwner = account.toLowerCase() === owner.toLowerCase();
        console.log('Is user owner?', isUserOwner);
        setIsOwner(isUserOwner);
      } catch (ownerError) {
        console.error('Error checking if user is owner:', ownerError);
        setIsOwner(false);
      }

      // Check if user is artisan
      try {
        console.log('Checking if user is a registered artisan...');
        const artisanStatus = await isArtisanRegistered(account);
        console.log('Is user a registered artisan?', artisanStatus);
        setIsArtisan(artisanStatus);
      } catch (artisanError) {
        console.error('Error checking if user is artisan:', artisanError);
        setIsArtisan(false);
      }
    } catch (error) {
      console.error('Error checking user role:', error);

      // Check if it's a network error
      if (error.message && error.message.includes('Sepolia testnet')) {
        setIsWrongNetwork(true);
        setError('You are connected to the wrong network. Please switch to the Sepolia testnet.');
      } else {
        setError('Failed to check user role. Please make sure you are connected to the Sepolia testnet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountChange = (newAccount) => {
    setAccount(newAccount);
  };

  // Context value
  const contextValue = {
    account,
    isOwner,
    isArtisan,
    isLoading,
    error,
    isWrongNetwork,
    setAccount,
    checkUserRole,
    handleAccountChange
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
