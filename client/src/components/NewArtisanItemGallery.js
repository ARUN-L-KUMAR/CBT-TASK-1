import React, { useState, useEffect } from "react";
import {
  getContractInstance,
  getItemDetails,
  getTokenURI,
} from "../utils/contractUtils";
import {
  Search,
  Filter,
  Copy,
  CheckCircle,
  Package,
  Calendar,
  Layers,
  User,
  Loader
} from "lucide-react";

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
      // Set initial loading state
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
      let newItems = []; // Collect all items before updating state

      // Process tokens one by one
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
            // Use the creation date directly as in the old implementation
            creationDate: details.creationDate ,
            artisan: details.artisan,
            image: metadata.image || "",
            isVerified: details.isVerified,
            category: category,
          };

          // Check if this item already exists in our new items array
          const itemExists = newItems.some(item => item.id === newItem.id);
          if (!itemExists) {
            newItems.push(newItem);
            foundItems++;
          } else {
            console.log(`Item with ID ${newItem.id} already exists, skipping`);
          }

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
      } else {
        // Set all items at once instead of one by one
        setItems(newItems);
      }

    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load artisanal items. Please try again later.");
    } finally {
      // Set loading to false and progress to 100% only after all processing is done
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // Small delay to ensure progress bar animation completes
    }
  };

  // Verification is now displayed as text instead of having a verify button

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Show full-screen loading only when we have no items yet
  if (isLoading && items.length === 0) {
    return (
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 className="section-title">Browse Artisanal Products</h2>
        </div>

        <div className="products-container">
          <div className="loading-container">
            <div className="itemloading">
              <Loader size={24} className="loading-spinner" />
              <span>Loading artisanal items...</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {loadingProgress < 100 ? 'Searching for artisanal items...' : 'Almost done...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2 className="section-title">Browse Artisanal Products</h2>
      </div>

      <div className="products-container">
        <div className="search-filter-container">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, description, or artisan..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="filter-bar">
            <Filter size={18} className="filter-icon" />
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
        </div>

        {error && (
          <div className="message error-message">
            <div className="message-content">
              <CheckCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Only show this loading indicator when we have some items but are still loading more */}
        {isLoading && items.length > 0 && (
          <div className="loading-indicator">
            <Loader size={18} className="loading-spinner" />
            <span>Finalizing item details...</span>
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {searchTerm || selectedCategory !== "all" ? (
                <Search size={48} />
              ) : (
                <Package size={48} />
              )}
            </div>

            {searchTerm || selectedCategory !== "all" ? (
              <div className="empty-state-content">
                <h3>No items match your search criteria</h3>
                <p>
                  Try adjusting your search terms or selecting a different
                  category.
                </p>
                <button
                  className="action-button secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  <Filter size={18} />
                  <span>Clear Filters</span>
                </button>
              </div>
            ) : (
              <div className="empty-state-content">
                <h3>No artisanal items found</h3>
                <p>
                  Be the first to mint an artisanal item and showcase your craft!
                </p>
                <button
                  className="action-button primary"
                  onClick={() => (window.location.href = "#/mint")}
                >
                  <Package size={18} />
                  <span>Mint Your First Item</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="item-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-image-container">
                  <div className="item-date">
                    <Calendar size={14} />
                    <span>
                    {item.creationDate}
                    </span>
                  </div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="item-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://picsum.photos/seed/${item.id}/400/300`;
                    }}
                  />
                  <div className="item-category-badge">
                    {item.category}
                  </div>
                </div>

                <div className="item-details">
                  <h3 className="item-title">{item.name}</h3>

                  <div className="item-property">
                    <div className="property-icon">
                      <Package size={16} />
                    </div>
                    <div className="property-content">
                      <span className="property-label">Description</span>
                      <p className="property-value">{item.description}</p>
                    </div>
                  </div>

                  <div className="item-property">
                    <div className="property-icon">
                      <Layers size={16} />
                    </div>
                    <div className="property-content">
                      <span className="property-label">Materials</span>
                      <p className="property-value">{item.materials}</p>
                    </div>
                  </div>

                  <div
                    className="item-owner"
                    onClick={() => copyToClipboard(item.artisan, item.id)}
                    title="Click to copy full address"
                  >
                    <div className="owner-icon">
                      <User size={16} />
                    </div>
                    <div className="owner-details">
                      <span className="owner-label">Owner</span>
                      <div className="owner-address">
                        <span>{formatArtisanAddress(item.artisan)}</span>
                        {copiedItemId === item.id ? (
                          <CheckCircle size={14} className="copied-icon" />
                        ) : (
                          <Copy size={14} className="copy-icon" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanItemGallery;
