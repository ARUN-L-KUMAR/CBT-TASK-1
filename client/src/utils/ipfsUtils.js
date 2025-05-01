// Using Pinata for IPFS storage

// Pinata API credentials from environment variables
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY;
const PINATA_GATEWAY = process.env.REACT_APP_PINATA_GATEWAY;
const PINATA_API_URL = process.env.REACT_APP_PINATA_API_URL;

// Validate that Pinata credentials are available
if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY || !PINATA_GATEWAY || !PINATA_API_URL) {
  console.error('Pinata credentials not found in environment variables. Please check your .env file.');
}

// Function to upload file to IPFS using Pinata
export const uploadFileToIPFS = async (file) => {
  try {
    console.log('Uploading file to Pinata:', file.name);

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Upload to Pinata
    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata upload failed: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('Pinata upload result:', result);

    // Get the IPFS hash (CID) from the response
    const ipfsHash = result.IpfsHash;

    // Format the response with Pinata gateway
    const url = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;

    console.log('File upload successful:', { path: ipfsHash, url });

    return { path: ipfsHash, url };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

// Function to upload metadata to IPFS using Pinata
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    // Convert metadata to JSON
    const metadataJSON = JSON.stringify(metadata);
    console.log('Metadata to upload:', metadataJSON);

    // Upload to Pinata
    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      },
      body: JSON.stringify({
        pinataContent: metadata
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata metadata upload failed: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('Pinata metadata upload result:', result);

    // Get the IPFS hash (CID) from the response
    const ipfsHash = result.IpfsHash;

    // Format the response with Pinata gateway
    const url = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;

    console.log('Metadata upload successful:', { path: ipfsHash, url });

    return { path: ipfsHash, url };
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
};

// Function to create metadata for an artisanal item
export const createItemMetadata = (name, description, materials, artisanName, imagePath) => {
  return {
    name,
    description,
    materials,
    artisan: artisanName,
    image: `${PINATA_GATEWAY}/ipfs/${imagePath}`,
    attributes: [
      {
        trait_type: 'Materials',
        value: materials,
      },
      {
        trait_type: 'Artisan',
        value: artisanName,
      },
      {
        display_type: 'date',
        trait_type: 'Creation Date',
        value: Math.floor(Date.now() / 1000),
      },
    ],
  };
};
