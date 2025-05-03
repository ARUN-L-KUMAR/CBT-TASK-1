import React, { useState, useEffect, useContext } from "react";
import { registerArtisan, getArtisanDetails, getAllArtisans } from "../utils/contractUtils";
import { AppContext } from "../context/AppContext";
import {
  User,
  MapPin,
  Palette,
  FileText,
  Send,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronLeft
} from 'lucide-react';

const craftSpecialties = [
  { id: "pottery", name: "Pottery" },
  { id: "textiles", name: "Textiles" },
  { id: "jewelry", name: "Jewelry" },
  { id: "woodwork", name: "Woodwork" },
  { id: "metalwork", name: "Metalwork" },
  { id: "other", name: "Other" },
];

const NewArtisanRegistration = ({ setActiveTab, showRegistrationForm, setShowRegistrationForm }) => {
  const { isOwner, isArtisan, account, checkUserRole } = useContext(AppContext);

  const [artisanAddress, setArtisanAddress] = useState("");
  const [artisanName, setArtisanName] = useState("");
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("pottery");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // State for artisan profile details
  const [artisanDetails, setArtisanDetails] = useState({
    name: "",
    location: "",
    specialty: "",
    bio: "",
    registrationDate: "",
  });
  const [loadingDetails, setLoadingDetails] = useState(false);

  // State for managing artisans (available in both artisan profile and owner registration)
  const [showManageArtisans, setShowManageArtisans] = useState(false);
  const [allArtisans, setAllArtisans] = useState([]);
  const [loadingArtisans, setLoadingArtisans] = useState(false);

  // Fetch artisan details when component mounts if user is an artisan
  useEffect(() => {
    const fetchArtisanDetails = async () => {
      if (isArtisan && account) {
        try {
          setLoadingDetails(true);
          const details = await getArtisanDetails(account);

          // Format the details
          setArtisanDetails({
            name: details.name || "Not provided",
            location: details.location || "Not provided",
            specialty: details.specialty || "Not provided",
            bio: details.bio || "Not provided",
            registrationDate:
              new Date(
                Number(details.registrationDate) * 1000
              ).toLocaleDateString() || "Unknown",
          });
        } catch (error) {
          console.error("Error fetching artisan details:", error);
          setError("Failed to load artisan details. Please try again later.");
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    fetchArtisanDetails();
  }, [isArtisan, account]);

  // Function to fetch all registered artisans
  const fetchAllArtisans = async () => {
    setLoadingArtisans(true);
    try {
      const artisans = await getAllArtisans();
      setAllArtisans(artisans);
    } catch (error) {
      console.error("Error fetching all artisans:", error);
      setError("Failed to load artisans. Please try again.");
    } finally {
      setLoadingArtisans(false);
    }
  };

  // Fetch all artisans when the manage section is shown
  useEffect(() => {
    if (showManageArtisans) {
      fetchAllArtisans();
    }
  }, [showManageArtisans]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For debugging - log the current user status
    console.log("Current user status - isOwner:", isOwner, "isArtisan:", isArtisan, "account:", account);

    // Validate owner status
    if (!isOwner) {
      setError("Only the contract owner can register artisans.");
      return;
    }

    // Validate form fields
    if (!artisanAddress || !artisanName || !location || !specialty) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate Ethereum address format
    if (!artisanAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Please enter a valid Ethereum address.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Prepare artisan details
      const artisanDetails = {
        name: artisanName,
        location: location,
        specialty: specialty,
        bio: bio || "",
      };

      console.log("Registering artisan with address:", artisanAddress);
      console.log("Artisan details:", artisanDetails);

      // Register artisan
      const txHash = await registerArtisan(artisanAddress, artisanDetails);

      console.log("Registration successful, transaction hash:", txHash);

      // Create a more user-friendly success message
      setMessage(
        `Artisan "${artisanName}" registered successfully! Transaction hash: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 6)}`
      );

      // Show a browser notification if supported
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Registration Successful', {
            body: `Artisan "${artisanName}" has been registered successfully!`,
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Registration Successful', {
                body: `Artisan "${artisanName}" has been registered successfully!`,
                icon: '/favicon.ico'
              });
            }
          });
        }
      }

      // Check user role to update UI without requiring refresh
      await checkUserRole();

      // If manage artisans section is open, refresh the list
      if (showManageArtisans) {
        await fetchAllArtisans();
      }

      // Reset form
      setArtisanAddress("");
      setArtisanName("");
      setLocation("");
      setSpecialty("pottery");
      setBio("");
    } catch (error) {
      console.error("Error registering artisan:", error);

      // Provide more specific error messages
      if (error.message && error.message.includes("execution reverted")) {
        setError("Transaction failed. The address might already be registered or there was a contract error.");
      } else if (error.message && error.message.includes("user rejected")) {
        setError("Transaction was rejected in your wallet. Please try again.");
      } else {
        setError("Failed to register artisan. Please try again: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If the current user is already an artisan, show their profile
  if (isArtisan && !showRegistrationForm) {
    return (
      <div className="artisan-profile">
        <div className="profile-header">
          <div className="profile-header-content">
            <h2 className="section-title">Your Artisan Profile</h2>
            <div className="profile-actions">
              {isOwner && (
                <button
                  className="profile-button register"
                  onClick={() => {
                    // Navigate to the register tab and show the registration form
                    if (setActiveTab) {
                      console.log("Navigating to register tab");
                      setActiveTab('register');

                      // Set the flag to show the registration form
                      if (setShowRegistrationForm) {
                        console.log("Setting showRegistrationForm to true");
                        setShowRegistrationForm(true);
                      }
                    }
                  }}
                >
                  <User size={18} />
                  <span>Register Artisan</span>
                </button>
              )}
              <button
                className={`profile-button ${showManageArtisans ? 'active' : ''}`}
                onClick={() => setShowManageArtisans(!showManageArtisans)}
              >
                <Users size={18} />
                <span>{showManageArtisans ? 'Hide Artisans' : 'Manage Artisans'}</span>
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="message success-message">
            <div className="message-content">
              <CheckCircle size={20} />
              <span>{message}</span>
            </div>
            <button className="message-close" onClick={() => setMessage('')}>
              <XCircle size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="message error-message">
            <div className="message-content">
              <XCircle size={20} />
              <span>{error}</span>
            </div>
            <button className="message-close" onClick={() => setError('')}>
              <XCircle size={18} />
            </button>
          </div>
        )}

        {loadingDetails ? (
          <div className="loading">Loading your artisan details...</div>
        ) : (
          <div className="profile-content">
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar">
                  {artisanDetails.name
                    ? artisanDetails.name.charAt(0).toUpperCase()
                    : account.substring(2, 4).toUpperCase()}
                </div>
                <div className="profile-identity">
                  <h3>
                    <span>{artisanDetails.name || "Registered Artisan"}</span>
                    <div className="verified-badge">
                      <CheckCircle size={14} />
                      <span>Verified Artisan</span>
                    </div>
                  </h3>
                  <div className="wallet-address">
                    <span>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                    <button
                      className="copy-button"
                      onClick={() => {
                        navigator.clipboard.writeText(account);
                        setMessage("Address copied to clipboard!");
                      }}
                      title="Copy address to clipboard"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="profile-card-body">
                <div className="profile-detail">
                  <div className="detail-icon">
                    <MapPin size={18} />
                  </div>
                  <div className="detail-content">
                    <h4>Location</h4>
                    <p>{artisanDetails.location}</p>
                  </div>
                </div>

                <div className="profile-detail">
                  <div className="detail-icon">
                    <Palette size={18} />
                  </div>
                  <div className="detail-content">
                    <h4>Specialty</h4>
                    <p>{artisanDetails.specialty}</p>
                  </div>
                </div>

                {artisanDetails.bio && artisanDetails.bio !== "Not provided" && (
                  <div className="profile-detail">
                    <div className="detail-icon">
                      <FileText size={18} />
                    </div>
                    <div className="detail-content">
                      <h4>Bio</h4>
                      <p>{artisanDetails.bio}</p>
                    </div>
                  </div>
                )}

                <div className="profile-detail">
                  <div className="detail-icon">
                    <User size={18} />
                  </div>
                  <div className="detail-content">
                    <h4>Registration Date</h4>
                    <p>{artisanDetails.registrationDate}</p>
                  </div>
                </div>
              </div>

              <div className="profile-card-footer">
                <button
                  className="action-button primary"
                  onClick={() => setActiveTab('mint')}
                >
                  <Send size={18} />
                  <span>Mint New Item</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Artisans section */}
        {showManageArtisans && (
          <div className="artisans-list">
            <h3>Registered Artisans</h3>

            {loadingArtisans ? (
              <div className="artisanloading" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid rgba(108, 92, 231, 0.2)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: 'var(--space-md)' }}></div>
                Loading artisans...
              </div>
            ) : allArtisans && allArtisans.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-xl)', textAlign: 'center', backgroundColor: 'var(--off-white)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--space-lg)' }}>
                <Users size={48} style={{ color: 'var(--primary-light)', marginBottom: 'var(--space-md)' }} />
                <h3 style={{ marginBottom: 'var(--space-sm)' }}>No artisans registered yet</h3>
                <p style={{ color: 'var(--dark-gray)' }}>Use the registration form to add new artisans to the platform.</p>
              </div>
            ) : (
              <div className="artisans-grid">
                {allArtisans && allArtisans.map((artisan, index) => (
                  <div key={index} className="artisan-card">
                    <div className="profile-card-header" style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--light-gray)' }}>
                      <div className="profile-avatar" style={{ width: '50px', height: '50px', fontSize: '1.3rem' }}>
                        {artisan.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div className="profile-identity">
                        <h1 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>{artisan.name}</h1>
                        <div className="wallet-address" style={{ backgroundColor: 'rgba(108, 92, 231, 0.1)', padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--border-radius-sm)' }}>
                          <span>{artisan.address.substring(0, 6)}...{artisan.address.substring(artisan.address.length - 4)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="profile-card-body" style={{ padding: 'var(--space-lg)', flex: '1' }}>
                      <div className="profile-detail" style={{ marginBottom: 'var(--space-md)' }}>
                        <div className="detail-icon" style={{ width: '36px', height: '36px', padding: '0.5rem', backgroundColor: 'rgba(0, 184, 148, 0.1)', color: 'var(--success)' }}>
                          <MapPin size={16} />
                        </div>
                        <div className="detail-content">
                          <h4 style={{ color: 'var(--dark-gray)', marginBottom: 'var(--space-xs)' }}>Location</h4>
                          <p style={{ fontSize: '1rem', fontWeight: '500' }}>{artisan.location}</p>
                        </div>
                      </div>

                      <div className="profile-detail" style={{ marginBottom: 'var(--space-md)' }}>
                        <div className="detail-icon" style={{ width: '36px', height: '36px', padding: '0.5rem', backgroundColor: 'rgba(253, 203, 110, 0.1)', color: 'var(--warning)' }}>
                          <Palette size={16} />
                        </div>
                        <div className="detail-content">
                          <h4 style={{ color: 'var(--dark-gray)', marginBottom: 'var(--space-xs)' }}>Specialty</h4>
                          <p style={{ fontSize: '1rem', fontWeight: '500' }}>{artisan.specialty}</p>
                        </div>
                      </div>

                      {artisan.bio && (
                        <div className="profile-detail" style={{ marginBottom: 'var(--space-md)' }}>
                          <div className="detail-icon" style={{ width: '36px', height: '36px', padding: '0.5rem', backgroundColor: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary)' }}>
                            <FileText size={16} />
                          </div>
                          <div className="detail-content">
                            <h4 style={{ color: 'var(--dark-gray)', marginBottom: 'var(--space-xs)' }}>Bio</h4>
                            <p style={{ fontSize: '1rem' }}>{artisan.bio.length > 100 ? `${artisan.bio.substring(0, 100)}...` : artisan.bio}</p>
                          </div>
                        </div>
                      )}

                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--dark-gray)',
                        marginTop: 'var(--space-md)',
                        padding: 'var(--space-xs) var(--space-sm)',
                        backgroundColor: 'var(--off-white)',
                        borderRadius: 'var(--border-radius-sm)',
                        display: 'inline-block'
                      }}>
                        <span style={{ fontWeight: '500' }}>Registered:</span> {new Date(Number(artisan.registrationDate) * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
              <button
                className="action-button primary"
                onClick={() => fetchAllArtisans()}
                style={{
                  padding: 'var(--space-md) var(--space-xl)',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '1rem'
                }}
              >
                <RefreshCw size={18} />
                <span>Refresh Artisans List</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If user is not the owner and not an artisan, show registration request form
  if (!isOwner && !isArtisan) {
    return (
      <div className="registration-container">
        <div className="registration-header">
          <h2 className="section-title">Artisan Registration</h2>
        </div>

        <div className="registration-card">
          <div className="registration-card-body">
            <div className="info-message">
              <div className="message-content">
                <User size={20} />
                <span>Only the contract owner can register new artisans. Please contact the platform administrator if you wish to become a registered artisan.</span>
              </div>
            </div>

            <div className="registration-action">
              <button
                className="action-button primary"
                onClick={() => {
                  // Copy owner's address to clipboard
                  const ownerAddress = "0xD3a30bE0132d90F22Fe0ea7906400d2Ed3322D03"; // Replace with actual owner address
                  navigator.clipboard.writeText(ownerAddress);
                  setMessage("Owner's address copied to clipboard. Please contact them to request registration.");
                }}
              >
                <User size={18} />
                <span>Copy Owner Address</span>
              </button>
              <p className="action-description">
                Copy the owner's address to contact them for registration
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="message success-message">
            <div className="message-content">
              <CheckCircle size={20} />
              <span>{message}</span>
            </div>
            <button className="message-close" onClick={() => setMessage('')}>
              <XCircle size={18} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-header">
        <h2 className="section-title">Register New Artisan</h2>
        {isArtisan && (
          <button
            className="profile-button"
            onClick={() => {
              console.log("Going back to artisan profile");
              if (setShowRegistrationForm) {
                setShowRegistrationForm(false);
              }
            }}
          >
            <ChevronLeft size={18} />
            <span>Back to Profile</span>
          </button>
        )}
      </div>

      {message && (
        <div className="message success-message">
          <div className="message-content">
            <CheckCircle size={20} />
            <span>{message}</span>
          </div>
          <button className="message-close" onClick={() => setMessage('')}>
            <XCircle size={18} />
          </button>
        </div>
      )}

      {error && (
        <div className="message error-message">
          <div className="message-content">
            <XCircle size={20} />
            <span>{error}</span>
          </div>
          <button className="message-close" onClick={() => setError('')}>
            <XCircle size={18} />
          </button>
        </div>
      )}

      <div className="registration-card">
        <div className="registration-card-body">
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="artisanAddress">
                <User size={16} />
                <span>Artisan Wallet Address</span>
              </label>
              <input
                type="text"
                id="artisanAddress"
                value={artisanAddress}
                onChange={(e) => setArtisanAddress(e.target.value)}
                placeholder="0x..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="artisanName">
                <User size={16} />
                <span>Artisan Name</span>
              </label>
              <input
                type="text"
                id="artisanName"
                value={artisanName}
                onChange={(e) => setArtisanName(e.target.value)}
                placeholder="Full name or business name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">
                <MapPin size={16} />
                <span>Location</span>
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Chennai, Tamil Nadu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="specialty">
                <Palette size={16} />
                <span>Craft Specialty</span>
              </label>
              <select
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
              >
                {craftSpecialties.map((craft) => (
                  <option key={craft.id} value={craft.id}>
                    {craft.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bio">
                <FileText size={16} />
                <span>Artisan Bio (Optional)</span>
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about the artisan's background, experience, and craft techniques..."
                rows={4}
              />
            </div>

            <button
              type="submit"
              className="action-button primary submit-button"
              disabled={isLoading}
            >
              <Send size={18} />
              <span>{isLoading ? "Registering..." : "Register Artisan"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewArtisanRegistration;
