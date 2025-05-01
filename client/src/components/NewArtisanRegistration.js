import React, { useState, useEffect, useContext } from "react";
import { registerArtisan, getArtisanDetails } from "../utils/contractUtils";
import { AppContext } from "../context/AppContext";

const craftSpecialties = [
  { id: "pottery", name: "Pottery" },
  { id: "textiles", name: "Textiles" },
  { id: "jewelry", name: "Jewelry" },
  { id: "woodwork", name: "Woodwork" },
  { id: "metalwork", name: "Metalwork" },
  { id: "other", name: "Other" },
];

const NewArtisanRegistration = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOwner) {
      setError("Only the contract owner can register artisans.");
      return;
    }

    if (!artisanAddress || !artisanName || !location || !specialty) {
      setError("Please fill in all required fields.");
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

      // Register artisan
      const txHash = await registerArtisan(artisanAddress, artisanDetails);
      setMessage(
        `Artisan registered successfully! Transaction hash: ${txHash}`
      );

      // Check user role to update UI without requiring refresh
      await checkUserRole();

      // Reset form
      setArtisanAddress("");
      setArtisanName("");
      setLocation("");
      setSpecialty("pottery");
      setBio("");
    } catch (error) {
      console.error("Error registering artisan:", error);
      setError("Failed to register artisan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If the current user is already an artisan, show their profile
  if (isArtisan) {
    return (
      <div className="profile-container">
        <h2 className="form-title">Your Artisan Profile</h2>

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

            <div style={{ marginTop: "2rem", textAlign: "center" }}>
            
              <button
                className="cta-button"
                onClick={() => (window.location.href = "#/mint")}
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
                Mint New Artisanal Item
              </button>
              <div style={{ marginTop: "0.6rem" , fontSize: "0.7rem", color: "#6c5ce7" }}>You can mint new artisanal items as NFTs</div>
            </div>
          </>
        )}
      </div>
    );
  }

  // If user is not the owner, show a message
  if (!isOwner) {
    return (
      <div className="form-container">
        <h2 className="form-title">Artisan Registration</h2>
        <p className="not-owner-message">
          Only the contract owner can register new artisans. Please contact the
          platform administrator if you wish to become a registered artisan.
        </p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Register New Artisan</h2>

      {message && <div className="message success-message">{message}</div>}
      {error && <div className="message error-message">{error}</div>}

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
