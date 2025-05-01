import React, { useState, useEffect } from "react";
import {
  getContractInstance,
  getItemDetails,
  getTokenURI,
} from "../utils/contractUtils";

const categories = [
  { id: "all", name: "All Categories" },
  { id: "pottery", name: "Pottery" },
  { id: "textiles", name: "Textiles" },
  { id: "jewelry", name: "Jewelry" },
  { id: "woodwork", name: "Woodwork" },
  { id: "metalwork", name: "Metalwork" },
];

const ArtisanItemGallery = ({ isOwner }) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedItemId, setCopiedItemId] = useState(null);

  // Function to format artisan address (first 10 and last 10 characters)
  const formatArtisanAddress = (address) => {
    if (!address || address.length <= 20) return address;
    return `${address.substring(0, 15)}...${address.substring(address.length - 15)}`;
  };

  // Function to copy artisan address to clipboard
  const copyToClipboard = (address, itemId) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopiedItemId(itemId);
        // Reset copied status after 2 seconds
        setTimeout(() => setCopiedItemId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy address: ', err);
      });
  };

  // Use a ref to track if items have been fetched to prevent duplicate fetches
  const itemsFetched = React.useRef(false);

  useEffect(() => {
    // Only fetch items if they haven't been fetched yet
    if (!itemsFetched.current) {
      fetchItems();
      itemsFetched.current = true;
    }

    // Cleanup function to reset the ref when component unmounts
    return () => {
      itemsFetched.current = false;
    };
  }, []);

  useEffect(() => {
    // Filter items based on search term and category
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.artisan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, items]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError("");
      // Clear existing items to show we're loading fresh data
      setItems([]); // This will trigger the useEffect to clear filteredItems
      setLoadingProgress(0);

      // Get contract instance
      await getContractInstance();

      // Since we don't have a public tokenCounter function, we'll try to find tokens by checking for errors
      const maxTokensToCheck = 10; // Adjust as needed
      let foundItems = 0;
      let consecutiveErrors = 0;

      // Process tokens one by one and update UI after each one
      for (let i = 0; i < maxTokensToCheck; i++) {
        // Update progress based on how many tokens we've checked
        setLoadingProgress(Math.min(((i + 1) / maxTokensToCheck) * 90, 90)); // Max 90% until complete

        // Skip token ID 1 as it's corrupted
        if (i === 1) {
          console.warn(`Skipping token ID ${i} as it's corrupted`);
          continue;
        }

        try {
          // Get item details from contract
          const details = await getItemDetails(i);

          // Get token URI and fetch metadata
          const uri = await getTokenURI(i);
          let metadata = {};

          try {
            // Fetch metadata from IPFS
            const response = await fetch(uri);
            metadata = await response.json();
          } catch (metadataError) {
            console.error(
              `Error fetching metadata for token ${i}:`,
              metadataError
            );
            metadata = {
              name: `Item #${i}`,
              image: "",
              description: details.description,
            };
          }

          // Determine category (for UI filtering)
          let category = "pottery"; // Default category

          // Try to extract category from metadata
          if (metadata.category) {
            category = metadata.category;
          } else if (metadata.attributes) {
            const categoryAttr = metadata.attributes.find(
              (attr) =>
                attr.trait_type === "Category" || attr.trait_type === "category"
            );
            if (categoryAttr) {
              category = categoryAttr.value.toLowerCase();
            }
          }

          // Create the new item
          const newItem = {
            id: i,
            name: metadata.name || `Item #${i}`,
            description: details.description,
            materials: details.materials,
            creationDate: details.creationDate,
            artisan: details.artisan,
            image: metadata.image || "",
            isVerified: details.isVerified,
            category: category,
          };

          // Update only the items state with the new item, checking for duplicates
          // The useEffect will handle updating filteredItems
          setItems(prevItems => {
            // Check if this item already exists in the array
            const itemExists = prevItems.some(item => item.id === newItem.id);
            if (itemExists) {
              console.log(`Item with ID ${newItem.id} already exists, skipping`);
              return prevItems; // Return unchanged array
            }
            return [...prevItems, newItem]; // Add the new item
          });

          foundItems++;
          consecutiveErrors = 0; // Reset consecutive errors counter

        } catch (itemError) {
          console.error(`Error fetching details for token ${i}:`, itemError);
          consecutiveErrors++;

          // If the error message indicates the token doesn't exist, count it as an error
          if (
            itemError.message &&
            (itemError.message.includes("Item does not exist") ||
              itemError.message.includes("nonexistent token") ||
              itemError.message.includes("invalid token ID"))
          ) {
            console.log(`Token ID ${i} doesn't exist`);

            // If we've had 3 consecutive errors, we can probably stop
            if (consecutiveErrors >= 3) {
              console.log(`Stopping at token ID ${i} after 3 consecutive errors`);
              break;
            }
          }
        }
      }

      console.log(`Total items found: ${foundItems}`);

      if (foundItems === 0) {
        console.warn(
          "No items were found. This could indicate an issue with token retrieval."
        );
      }

    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load artisanal items. Please try again later.");
    } finally {
      setIsLoading(false);
      setLoadingProgress(100);
    }
  };

  // Verification is now displayed as text instead of having a verify button

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading">Loading artisanal items...</div>
        <div className="progress-bar-container" style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          margin: '1rem auto',
          maxWidth: '400px'
        }}>
          <div className="progress-bar" style={{
            width: `${loadingProgress}%`,
            height: '100%',
            backgroundColor: '#6c5ce7',
            borderRadius: '4px',
            transition: 'width 0.3s ease-in-out'
          }}></div>
        </div>
        <div className="loading-text" style={{ color: '#666' }}>
          {loadingProgress < 100 ? 'Searching for artisanal items...' : 'Almost done...'}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2 className="form-title">Browse Artisanal Products</h2>

      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search by name, description, or artisan..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <select
          className="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading && items.length > 0 && (
        <div className="loading-indicator" style={{
          textAlign: 'center',
          padding: '0.5rem',
          margin: '0.5rem 0',
          backgroundColor: '#e6f7ff',
          borderRadius: '4px',
          color: '#1890ff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{
              width: '16px',
              height: '16px',
              border: '2px solid #1890ff',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '8px'
            }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            Loading more items...
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div
          className="no-items-message"
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "var(--white)",
            borderRadius: "var(--border-radius)",
            boxShadow: "var(--box-shadow)",
          }}
        >
          {searchTerm || selectedCategory !== "all" ? (
            <>
              <h3 style={{ marginBottom: "1rem" }}>
                No items match your search criteria
              </h3>
              <p>
                Try adjusting your search terms or selecting a different
                category.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ marginBottom: "1rem" }}>No artisanal items found</h3>
              <p>
                Be the first to mint an artisanal item and showcase your craft!
              </p>
              <button
                className="cta-button"
                style={{ marginTop: "1.5rem" }}
                onClick={() => (window.location.href = "#/mint")}
              >
                Mint Your First Item
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="item-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="item-card">
              <div
                className="item-image-container"
                style={{ position: "relative" }}
              >
                <p
                  className="item-date"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    margin: 0,
                    padding: "5px 10px",
                    borderRadius: "4px",
                    zIndex: 1,
                  }}
                >
                  {item.creationDate}
                </p>
                <img
                  src={item.image}
                  alt={item.name}
                  className="item-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://picsum.photos/seed/${item.id}/400/300`;
                  }}
                />
              </div>
              <div className="item-details">
                <div className="item-header">
                  <h3 className="item-title">{item.name}</h3>
                </div>
                <p className="item-description">
                  Description: {item.description}
                </p>
                <p className="item-description">Materials: {item.materials}</p>
                <div className="item-meta">
                  <h6
                    className="item-artisan"
                    onClick={() => copyToClipboard(item.artisan, item.id)}
                    style={{
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: copiedItemId === item.id ? '#e6f7ff' : 'e9ecef',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.3s'
                    }}
                    title="Click to copy full address"
                  >
                    <span className="item-artisan-title">Owner: </span> {formatArtisanAddress(item.artisan)}
                    {copiedItemId === item.id && (
                      <span style={{
                        marginLeft: '8px',
                        color: '#1890ff',
                        fontSize: '0.8em'
                      }}>
                        Copied!
                      </span>
                    )}
                  </h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtisanItemGallery;
