import React, { useState, useContext } from 'react';
import './NewApp.css';
import { AppContext } from './context/AppContext';
import { switchToSepoliaNetwork } from './utils/contractUtils';
import NewWalletConnection from './components/NewWalletConnection';
import NewArtisanRegistration from './components/NewArtisanRegistration';
import NewMintArtisanItem from './components/NewMintArtisanItem';
import NewArtisanItemGallery from './components/NewArtisanItemGallery';
import HomePage from './components/HomePage';

function App() {
  const {
    account,
    isOwner,
    isArtisan,
    isLoading,
    error,
    isWrongNetwork,
    handleAccountChange
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('home');

  const handleSwitchNetwork = async () => {
    try {
      await switchToSepoliaNetwork();
      window.location.reload(); // Reload the page after switching networks
    } catch (error) {
      console.error('Error switching network:', error);
      alert('Failed to switch to Sepolia network. Please try manually switching in MetaMask.');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Handle accounts
        if (accounts.length > 0) {
          handleAccountChange(accounts[0]);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return (
        <div className="message error-message">
          {error}
          {isWrongNetwork && (
            <button
              onClick={handleSwitchNetwork}
              className="connect-button"
              style={{ marginTop: '1rem' }}
            >
              Switch to Sepolia Network
            </button>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'gallery':
        return <NewArtisanItemGallery isOwner={isOwner} />;
      case 'mint':
        return <NewMintArtisanItem setActiveTab={setActiveTab} />;
      case 'register':
        return <NewArtisanRegistration />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo" onClick={() => setActiveTab('home')}>
          Chennai Artisanal Goods
        </div>
        <NewWalletConnection />
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button
          className={`nav-tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Browse Products
        </button>
        {isArtisan && (
          <button
            className={`nav-tab ${activeTab === 'mint' ? 'active' : ''}`}
            onClick={() => setActiveTab('mint')}
          >
            Mint New Item
          </button>
        )}
        {(isOwner || !isArtisan) && (
          <button
            className={`nav-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            {isArtisan ? 'Artisan Profile' : 'Register Artisan'}
          </button>
        )}
      </nav>

      <main className="App-main">
        {account ? renderContent() : (
          <div className="home-container">
            <div className="hero-section">
              <h1>Chennai Artisanal Goods Provenance</h1>
              <p>
                Connect your wallet to explore authentic artisanal products from Chennai's finest craftspeople.
              </p>
              <button className="cta-button" onClick={connectWallet}>Connect Wallet</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
