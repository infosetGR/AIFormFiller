# AI Form Filler Chrome Extension

An intelligent Chrome extension that automatically analyzes and fills web forms using AI-powered field recognition and a knowledge base built from your uploaded documents.

## 🌟 Features

### Core Functionality
- **AI-Powered Form Analysis**: Automatically detects and analyzes form fields using contextual information
- **Intelligent Field Recognition**: Uses multiple strategies to identify field types and purposes
- **Document Knowledge Base**: Upload personal documents to create a searchable knowledge base
- **Semantic Matching**: Uses embeddings to match form fields with relevant information from your documents

### Supported Field Types
- Text inputs (name, address, etc.)
- Email addresses
- Phone numbers
- URLs/websites
- Dates
- Numbers
- Checkboxes and dropdowns

### File Upload Support
- **Text files** (.txt, .md)
- **JSON files** (.json)
- **CSV files** (.csv)
- **Structured data** with automatic chunking and embedding

## � API Configuration

### Required API Key
This extension requires a Google Generative AI API key for embedding generation and AI-powered suggestions.

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Replace the `API_KEY` in `background.js` with your actual key
3. Ensure your API key has access to:
   - `embedding-001` model for embeddings
   - `gemini-pro` model for AI suggestions

### Troubleshooting API Issues

#### 404 Errors
- **Issue**: "API error: 404" when uploading files
- **Solution**: Ensure you're using the correct Google Generative AI API key
- **Check**: API endpoint format and request structure

#### Rate Limiting
- **Issue**: "API error: 429" - too many requests
- **Solution**: The extension automatically retries with exponential backoff
- **Prevention**: Small delays (500ms) are added between embedding requests

#### Authentication Issues
- **Issue**: "API error: 403" - forbidden
- **Solution**: Verify your API key is valid and has proper permissions
- **Check**: API key restrictions and quotas in Google AI Studio

### API Endpoints Used
- **Embeddings**: `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent`
- **AI Suggestions**: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`

## �🚀 Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this directory
4. The extension icon should appear in your Chrome toolbar

## 📋 Usage

### Setting Up Your Knowledge Base
1. Click the extension icon to open the popup
2. Use the file upload section to upload documents containing your personal information
3. Supported formats: TXT, JSON, CSV, MD files
4. The extension will automatically process and embed your documents
5. **NEW**: View detailed embedding statistics (files count, chunks count)
6. **NEW**: Use the "📚🗑️ Clear Library" button to remove all uploaded files and embeddings

### Filling Forms
1. Navigate to any webpage with forms
2. Click "📄 Read Page" to analyze the form structure
3. Click "🤖 Fill Form" to automatically fill forms with data from your knowledge base
4. The extension will match form fields with the most relevant information from your uploaded documents

### Testing the Extension
1. **Knowledge Base Test**: Open the included `test-form.html` file in Chrome
2. Upload the provided `sample-data.txt` file using the extension
3. Use the "Read Page" and "Fill Form" buttons to test knowledge-based filling

4. **AI Fallback Test**: Open `gemini-test-form.html` without uploading any files
5. The extension will use Gemini AI to generate intelligent form values
6. Check console logs to see the source of each suggestion (📚 Knowledge Base, 🤖 AI Generated, 🔧 Fallback)

## 🧠 How It Works

### AI-Powered Analysis
- Analyzes form structure and field context
- Extracts meaningful field labels from various sources (labels, placeholders, ARIA attributes, etc.)
- Uses Google's Generative AI for text embeddings

### Knowledge Base Processing
- Splits uploaded documents into semantic chunks
- Generates embeddings for each chunk using Google's embedding API
- Stores embeddings locally for fast similarity search

### Intelligent Form Filling
- Creates search queries based on field context
- Finds semantically similar content from your knowledge base
- **NEW**: Gemini AI fallback when no relevant data is found
- Extracts relevant values based on field type (email, phone, etc.)
- Provides intelligent AI-generated values as last resort

## 🔧 Configuration

### API Key Setup
Update the `API_KEY` in `background.js` with your Google Generative AI API key:
```javascript
const API_KEY = 'your-google-ai-api-key-here';
```

### Storage
- Form analysis data: Chrome sync/local storage
- Knowledge base: Chrome local storage (higher capacity)
- File metadata: Chrome local storage

## 🛡️ Privacy & Security

- All data is stored locally in Chrome's storage
- No data is sent to external servers except for AI processing
- Embeddings are generated using Google's Generative AI API
- You control what documents are uploaded and can delete them anytime

## 📁 Project Structure

```
├── manifest.json          # Extension manifest
├── popup.html/js          # Extension popup interface
├── content.js             # Content script for form interaction
├── background.js          # Service worker for AI processing
├── services/
│   ├── embedding-service.js   # Google AI embeddings
│   ├── file-service.js       # File processing and knowledge base
│   └── gemini-service.js     # Gemini AI integration
├── test-form.html         # Test page for development
└── sample-data.txt        # Sample personal data
```

## 🧪 Development & Testing

### Test Files Included
- `test-form.html`: Comprehensive test form with various field types (tests knowledge base)
- `gemini-test-form.html`: Creative form to test Gemini AI fallback functionality
- `sample-data.txt`: Sample personal information for testing

### Console Logging
The extension provides detailed console logging. Open Chrome DevTools (F12) to see:
- **File Upload Process**: Detailed embedding statistics and chunk processing
- **Knowledge Base Stats**: Total files and embeddings when filling forms
- Form analysis progress
- Field recognition details
- Knowledge base search results
- Embedding generation status

### Debugging
- Use "📄 Read Page" to see how forms are analyzed
- Check storage in DevTools > Application > Storage
- Monitor network requests for API calls

## 🔄 Recent Updates

### Version 2.1 Features
- **NEW**: Clear Library button with confirmation dialog
- **NEW**: Enhanced embedding process logging with detailed statistics
- **NEW**: Knowledge base stats display in popup and console
- **NEW**: Source file attribution for form field suggestions
- Added file upload functionality with drag & drop support
- Implemented AI-powered knowledge base using document embeddings
- Enhanced form field recognition with multiple detection strategies
- Added semantic search for intelligent form filling
- Improved error handling and user feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test your changes with the provided test forms
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
