import React, { useState, useEffect, useContext } from "react";
import { registerArtisan, getArtisanDetails, getAllArtisans } from "../utils/contractUtils";
import { AppContext } from "../context/AppContext";

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
      <div className="profile-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>Your Artisan Profile</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isOwner && (
              <button
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
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Register Artisan
              </button>
            )}
            <button
              onClick={() => setShowManageArtisans(!showManageArtisans)}
              style={{
                backgroundColor: showManageArtisans ? '#e9ecef' : '#6c5ce7',
                color: showManageArtisans ? '#495057' : 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {showManageArtisans ? 'Hide Artisans' : 'Manage Artisans'}
            </button>
          </div>
        </div>

        {message && (
          <div className="message success-message" style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #c3e6cb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span role="img" aria-label="success" style={{ marginRight: '0.5rem' }}>✅</span>
              {message}
            </div>
            <button
              onClick={() => setMessage('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#155724'
              }}
            >
              &times;
            </button>
          </div>
        )}
        {error && (
          <div className="message error-message" style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span role="img" aria-label="error" style={{ marginRight: '0.5rem' }}>❌</span>
              {error}
            </div>
            <button
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#721c24'
              }}
            >
              &times;
            </button>
          </div>
        )}

        {loadingDetails ? (
          <div className="loading">Loading your artisan details...</div>
        ) : (
          <>
            <div className="profile-header">
              <div
                className="profile-avatar"
                style={{
                  backgroundColor: "#6c5ce7",
                  color: "white",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                {artisanDetails.name
                  ? artisanDetails.name.charAt(0).toUpperCase()
                  : account.substring(2, 4).toUpperCase()}
              </div>
              <div className="profile-info">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "start" }}>
                  <h2>{artisanDetails.name || "Registered Artisan"}</h2>
                  <div
                    className="verified-badge"
                    style={{
                      backgroundColor: "#bcffcb",
                      color: "#197c44",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      marginLeft: "10px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Verified Artisan
                  </div>
                </div>
                <p className="wallet-address">{account}</p>
              </div>
            </div>

            <div className="profile-details" style={{ marginTop: "2rem" }}>
              <div
                className="profile-detail-item"
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div
                  className="profile-detail-label"
                  style={{ fontWeight: "bold" }}
                >
                  Location
                </div>
                <div>{artisanDetails.location}</div>
              </div>

              <div
                className="profile-detail-item"
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div
                  className="profile-detail-label"
                  style={{ fontWeight: "bold" }}
                >
                  Specialty
                </div>
                <div>{artisanDetails.specialty}</div>
              </div>


              {artisanDetails.bio && artisanDetails.bio !== "Not provided" && (
                <div
                  className="profile-detail-item"
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div
                    className="profile-detail-label"
                    style={{
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Bio
                  </div>
                  <div style={{ lineHeight: "1.5" }}>{artisanDetails.bio}</div>
                </div>
              )}



            </div>

            
          </>
        )}

        {/* Manage Artisans section */}
        {showManageArtisans && (
          <div className="artisans-list" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <h3>Registered Artisans</h3>

            {loadingArtisans ? (
              <div className="loading">Loading artisans...</div>
            ) : allArtisans.length === 0 ? (
              <p>No artisans registered yet.</p>
            ) : (
              <div className="artisans-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                {allArtisans.map((artisan, index) => (
                  <div key={index} className="artisan-card" style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{
                        backgroundColor: '#6c5ce7',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginRight: '0.75rem'
                      }}>
                        {artisan.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0' }}>{artisan.name}</h4>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6c757d',
                          wordBreak: 'break-all'
                        }}>
                          {artisan.address.substring(0, 6)}...{artisan.address.substring(artisan.address.length - 4)}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 'bold' }}>Location:</span> {artisan.location}
                    </div>

                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 'bold' }}>Specialty:</span> {artisan.specialty}
                    </div>

                    {artisan.bio && (
                      <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Bio:</span> {artisan.bio.length > 100 ? `${artisan.bio.substring(0, 100)}...` : artisan.bio}
                      </div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem' }}>
                      Registered: {new Date(Number(artisan.registrationDate) * 1000).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={fetchAllArtisans}
              style={{
                backgroundColor: '#6c5ce7',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              Refresh Artisans List
            </button>
          </div>
        )}
      </div>
    );
  }

  // If user is not the owner and not an artisan, show registration request form
  if (!isOwner && !isArtisan) {
    return (
      <div className="form-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>Artisan Registration</h2>
          <button
            onClick={async () => {
              console.log("Force refreshing user role...");
              await checkUserRole();
              console.log("User role refreshed - isOwner:", isOwner, "isArtisan:", isArtisan);
            }}
            style={{
              backgroundColor: '#6c5ce7',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Refresh Status
          </button>
        </div>

        <p className="not-owner-message">
          Only the contract owner can register new artisans. Please contact the
          platform administrator if you wish to become a registered artisan.
        </p>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            className="cta-button"
            onClick={() => {
              // Copy owner's address to clipboard
              const ownerAddress = "0xD3a30bE0132d90F22Fe0ea7906400d2Ed3322D03"; // Replace with actual owner address
              navigator.clipboard.writeText(ownerAddress);
              alert("Owner's address copied to clipboard. Please contact them to request registration.");
            }}
            style={{
              backgroundColor: "#6c5ce7",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Copy Owner Address
          </button>
          <div style={{ marginTop: "0.6rem", fontSize: "0.7rem", color: "#6c5ce7" }}>
            Copy the owner's address to contact them for registration
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="form-title" style={{ margin: 0 }}>Register New Artisan</h2>
        {isArtisan && (
          <button
            onClick={() => {
              console.log("Going back to artisan profile");
              if (setShowRegistrationForm) {
                setShowRegistrationForm(false);
              }
            }}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Back to Profile
          </button>
        )}
      </div>

      {message && (
        <div className="message success-message" style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #c3e6cb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span role="img" aria-label="success" style={{ marginRight: '0.5rem' }}>✅</span>
            {message}
          </div>
          <button
            onClick={() => setMessage('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#155724'
            }}
          >
            &times;
          </button>
        </div>
      )}
      {error && (
        <div className="message error-message" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span role="img" aria-label="error" style={{ marginRight: '0.5rem' }}>❌</span>
            {error}
          </div>
          <button
            onClick={() => setError('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#721c24'
            }}
          >
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="artisanAddress">Artisan Wallet Address</label>
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
          <label htmlFor="artisanName">Artisan Name</label>
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
          <label htmlFor="location">Location</label>
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
          <label htmlFor="specialty">Craft Specialty</label>
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
          <label htmlFor="bio">Artisan Bio (Optional)</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about the artisan's background, experience, and craft techniques..."
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
          style={{
            backgroundColor: "#6c5ce7",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          {isLoading ? "Registering..." : "Register Artisan"}
        </button>
      </form>
    </div>
  );
};

export default NewArtisanRegistration;
