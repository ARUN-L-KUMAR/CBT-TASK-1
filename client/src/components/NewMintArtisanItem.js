import React, { useState, useContext } from 'react';
import { mintArtisanItem } from '../utils/contractUtils';
import { uploadFileToIPFS, uploadMetadataToIPFS, createItemMetadata } from '../utils/ipfsUtils';
import { AppContext } from '../context/AppContext';

const categories = [
  { id: 'pottery', name: 'Pottery' },
  { id: 'textiles', name: 'Textiles' },
  { id: 'jewelry', name: 'Jewelry' },
  { id: 'woodwork', name: 'Woodwork' },
  { id: 'metalwork', name: 'Metalwork' }
];

const NewMintArtisanItem = ({ setActiveTab }) => {
  const { isArtisan } = useContext(AppContext);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [artisanName, setArtisanName] = useState('');
  const [category, setCategory] = useState('pottery');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isArtisan) {
      setError('You must be a registered artisan to mint items.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Validate inputs
      if (!name || !description || !materials || !artisanName || !file) {
        throw new Error('All fields are required');
      }

      // Upload image to IPFS
      const imageResult = await uploadFileToIPFS(file);
      console.log('Image uploaded to IPFS:', imageResult);

      // Create and upload metadata to IPFS
      const metadata = createItemMetadata(
        name,
        description,
        materials,
        artisanName,
        imageResult.path
      );

      // Add category to metadata
      metadata.category = category;

      const metadataResult = await uploadMetadataToIPFS(metadata);
      console.log('Metadata uploaded to IPFS:', metadataResult);

      // Mint NFT with metadata URI
      const txHash = await mintArtisanItem(
        metadataResult.url,
        description,
        materials,
        imageResult.path
      );

      setMessage(`Item minted successfully! Transaction hash: ${txHash}`);

      // Reset form
      setName('');
      setDescription('');
      setMaterials('');
      setArtisanName('');
      setCategory('pottery');
      setFile(null);
      setPreviewUrl('');

      // Reset file input
      document.getElementById('image').value = '';

      // Redirect to gallery after 3 seconds
      setTimeout(() => {
        setActiveTab('gallery');
      }, 3000);
    } catch (error) {
      console.error('Error minting item:', error);
      setError(error.message || 'Failed to mint item');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isArtisan) {
    return (
      <div className="form-container">
        <h2 className="form-title">Become an Artisan</h2>
        <p className="not-artisan-message">
          You need to be a registered artisan to mint items.
          Please contact the platform owner to register as an artisan.
        </p>
        <button
          className="submit-button"
          onClick={() => setActiveTab('register')}
          style={{ marginTop: '1rem' }}
        >
          Register as Artisan
        </button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Mint New Artisanal Item</h2>

      {message && <div className="message success-message">{message}</div>}
      {error && <div className="message error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Item Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter the name of your artisanal item"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your artisanal item in detail"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="materials">Materials Used</label>
          <input
            type="text"
            id="materials"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="e.g., clay, cotton, silver"
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
            placeholder="Your name or artisan brand"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Item Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
          <small>Upload a clear image of your artisanal item</small>

          {previewUrl && (
            <div className="image-preview">
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  marginTop: '10px',
                  borderRadius: 'var(--border-radius)'
                }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Minting...' : 'Mint Item'}
        </button>
      </form>
    </div>
  );
};

export default NewMintArtisanItem;
