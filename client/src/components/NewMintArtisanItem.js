import React, { useState, useContext } from 'react';
import { mintArtisanItem } from '../utils/contractUtils';
import { uploadFileToIPFS, uploadMetadataToIPFS, createItemMetadata } from '../utils/ipfsUtils';
import { AppContext } from '../context/AppContext';
import {
  Package,
  FileText,
  Layers,
  User,
  Tag,
  Upload,
  Send,
  CheckCircle,
  XCircle,
  Image
} from 'lucide-react';

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
      <div className="mint-container">
        <div className="mint-header">
          <h2 className="section-title">Become an Artisan</h2>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">
            <User size={48} />
          </div>
          <div className="empty-state-content">
            <h3>Registration Required</h3>
            <p>
              You need to be a registered artisan to mint items.
              Please contact the platform owner to register as an artisan.
            </p>
            <button
              className="action-button primary"
              onClick={() => setActiveTab('register')}
            >
              <User size={18} />
              <span>Register as Artisan</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mint-container">
      <div className="mint-header">
        <h2 className="section-title">Mint New Artisanal Item</h2>
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

      <div className="mint-card">
        <div className="mint-card-body">
          <form onSubmit={handleSubmit} className="mint-form">
            <div className="form-row">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="name">
                    <Package size={16} />
                    <span>Item Name</span>
                  </label>
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
                  <label htmlFor="description">
                    <FileText size={16} />
                    <span>Description</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your artisanal item in detail"
                    required
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="materials">
                    <Layers size={16} />
                    <span>Materials Used</span>
                  </label>
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
                  <label htmlFor="artisanName">
                    <User size={16} />
                    <span>Artisan Name</span>
                  </label>
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
                  <label htmlFor="category">
                    <Tag size={16} />
                    <span>Category</span>
                  </label>
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
              </div>

              <div className="form-column">
                <div className="form-group file-upload-group">
                  <label htmlFor="image">
                    <Image size={16} />
                    <span>Item Image</span>
                  </label>

                  <div className="file-upload-container">
                    {!previewUrl ? (
                      <>
                        <div className="file-upload-placeholder">
                          <Upload size={32} />
                          <p>Drag & drop an image or click to browse</p>
                        </div>
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                          className="file-input"
                        />
                      </>
                    ) : (
                      <div className="image-preview-container">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="image-preview"
                        />
                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={() => {
                            setFile(null);
                            setPreviewUrl('');
                            document.getElementById('image').value = '';
                          }}
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                  <small className="file-upload-help">Upload a clear image of your artisanal item</small>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="action-button primary submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    <span>Minting...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Mint Item</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewMintArtisanItem;
