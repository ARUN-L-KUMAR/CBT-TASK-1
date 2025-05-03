import React from 'react';
import {
  Search,
  Users,
  Link,
  ShoppingBag,
  ChevronRight,
  CheckCircle,
  Shield,
  Gem
} from 'lucide-react';

const HomePage = ({ setActiveTab }) => {
  return (
    <div className="home-page">
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Authentic Chennai Artisanal Goods</h1>
          <p className="hero-subtitle">
            Discover and collect authentic artisanal products from Chennai's finest craftspeople,
            verified on the blockchain for guaranteed authenticity and provenance.
          </p>
          <div className="hero-actions">
            <button
              className="cta-button primary"
              onClick={() => setActiveTab('gallery')}
            >
              <ShoppingBag size={20} />
              <span>Browse Products</span>
            </button>
            <button
              className="cta-button secondary"
              onClick={() => setActiveTab('register')}
            >
              <Users size={20} />
              <span>Artisan Profiles</span>
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-container">
            <div className="image-placeholder">
              <Gem size={60} />
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose Our Platform</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <CheckCircle size={32} />
            </div>
            <h3>Verified Authenticity</h3>
            <p>
              Each artisanal product is verified on the blockchain,
              ensuring its authenticity and origin with immutable proof.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Users size={32} />
            </div>
            <h3>Support Local Artisans</h3>
            <p>
              Connect directly with Chennai's talented artisans and
              support traditional craftsmanship with fair compensation.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Link size={32} />
            </div>
            <h3>Blockchain Technology</h3>
            <p>
              Leveraging Ethereum blockchain to create a transparent
              and secure marketplace for artisanal goods with provable ownership.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Browse Products</h3>
            <p>Explore our collection of authentic artisanal products from Chennai.</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Verify Authenticity</h3>
            <p>Check the blockchain verification to ensure product authenticity.</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Support Artisans</h3>
            <p>Purchase products directly from artisans, supporting local craftsmanship.</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Own with Confidence</h3>
            <p>Receive a digital certificate of authenticity with your purchase.</p>
          </div>
        </div>
      </section>

      <section className="action-cards-section">
        <div className="action-card">
          <h3>For Collectors</h3>
          <p>Browse authentic artisanal products and verify their provenance.</p>
          <div className="action-buttons">
            <button
              className="action-button"
              onClick={() => setActiveTab('gallery')}
            >
              <ShoppingBag size={18} />
              <span>Browse Products</span>
            </button>
          </div>
        </div>

        <div className="action-card">
          <h3>For Artisans</h3>
          <p>Register as an artisan and mint your products as verifiable NFTs.</p>
          <div className="action-buttons">
            <button
              className="action-button"
              onClick={() => setActiveTab('register')}
            >
              <Users size={18} />
              <span>Artisan Profile</span>
            </button>
            <button
              className="action-button secondary"
              onClick={() => setActiveTab('mint')}
            >
              <Shield size={18} />
              <span>Mint Products</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
