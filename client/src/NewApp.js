import React, { useState, useContext } from 'react';
import './ModernApp.css'; // Using our new modern CSS file
import { AppContext } from './context/AppContext';
import { switchToSepoliaNetwork } from './utils/contractUtils';
import NewWalletConnection from './components/NewWalletConnection';
import NewArtisanRegistration from './components/NewArtisanRegistration';
import NewMintArtisanItem from './components/NewMintArtisanItem';
import NewArtisanItemGallery from './components/NewArtisanItemGallery';
import HomePage from './components/HomePage';

// Import icons
import {
  Home,
  ShoppingBag,
  PlusCircle,
  User,
  ChevronRight
} from 'lucide-react';

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
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

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
        return <NewArtisanRegistration
          setActiveTab={setActiveTab}
          showRegistrationForm={showRegistrationForm}
          setShowRegistrationForm={setShowRegistrationForm}
        />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-container">
          <div className="logo" onClick={() => setActiveTab('home')}>
            <div className="logo-icon">CA</div>
            <span className="logo-text">Chennai Artisanal</span>
          </div>

          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Home size={18} />
              <span>Home</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
            >
              <ShoppingBag size={18} />
              <span>Browse Products</span>
            </button>
            {isArtisan && (
              <button
                className={`nav-tab ${activeTab === 'mint' ? 'active' : ''}`}
                onClick={() => setActiveTab('mint')}
              >
                <PlusCircle size={18} />
                <span>Mint New Item</span>
              </button>
            )}
            <button
              className={`nav-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              <User size={18} />
              <span>{isArtisan ? 'Artisan Profile' : 'Register Artisan'}</span>
            </button>
          </nav>

          <div className="wallet-container">
            <NewWalletConnection />
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-container">
          {account ? renderContent() : (
            <div className="welcome-container">
              <div className="hero-section">
                <div className="hero-content">
                  <h1>Chennai Artisanal Goods Provenance</h1>
                  <p className="hero-description">
                    Connect your wallet to explore authentic artisanal products from Chennai's finest craftspeople,
                    verified on the blockchain for guaranteed authenticity and provenance.
                  </p>
                  <button className="cta-button" onClick={connectWallet}>
                    <span>Connect Wallet</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="hero-pattern"></div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="logo-icon small">CA</div>
              <span>Chennai Artisanal Goods</span>
            </div>
            <p className="footer-description">
              A blockchain-based platform for authentic artisanal products from Chennai
            </p>
          </div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} Chennai Artisanal Goods. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
