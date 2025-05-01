import React from 'react';

const HomePage = ({ setActiveTab }) => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Chennai Artisanal Goods Provenance</h1>
        <p>
          Discover authentic artisanal products from Chennai's finest craftspeople, 
          verified on the blockchain for guaranteed authenticity and provenance.
        </p>
        <button 
          className="cta-button"
          onClick={() => setActiveTab('gallery')}
        >
          Browse Artisanal Products
        </button>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Verified Authenticity</h3>
          <p>
            Each artisanal product is verified on the blockchain, 
            ensuring its authenticity and origin.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🧑‍🎨</div>
          <h3>Support Local Artisans</h3>
          <p>
            Connect directly with Chennai's talented artisans and 
            support traditional craftsmanship.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔗</div>
          <h3>Blockchain Technology</h3>
          <p>
            Leveraging Ethereum blockchain to create a transparent 
            and secure marketplace for artisanal goods.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
