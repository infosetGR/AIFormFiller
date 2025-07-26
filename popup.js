document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status');
  const uploadSection = document.getElementById('uploadSection');
  const fileInput = document.getElementById('fileInput');
  const uploadedFiles = document.getElementById('uploadedFiles');
  const knowledgeStatus = document.getElementById('knowledgeStatus');
  const clearLibraryBtn = document.getElementById('clearLibrary');

  function showStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + (isError ? 'error' : 'success');
    setTimeout(() => {
      statusEl.className = 'status';
    }, 3000);
  }

  // Initialize knowledge base status
  updateKnowledgeStatus();

  // File upload handling
  fileInput.addEventListener('change', handleFileUpload);
  
  // Clear library button
  clearLibraryBtn.addEventListener('click', clearLibrary);
  
  // Drag and drop handling
  uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.classList.add('dragover');
  });
  
  uploadSection.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('dragover');
  });
  
  uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  });

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    await processFiles(files);
    e.target.value = ''; // Clear input
  }

  async function processFiles(files) {
    showStatus('📤 Processing files...');
    
    let totalChunks = 0;
    let totalEmbeddings = 0;
    
    for (const file of files) {
      try {
        const result = await uploadFile(file);
        totalChunks += result.totalChunks || 0;
        totalEmbeddings += result.embeddingsCreated || 0;
      } catch (error) {
        console.error('Error uploading file:', error);
        showStatus(`❌ Error uploading ${file.name}: ${error.message}`, true);
      }
    }
    
    updateKnowledgeStatus();
    displayUploadedFiles();
    
    if (totalEmbeddings > 0) {
      showStatus(`✅ Processed ${files.length} file(s) → ${totalEmbeddings} embeddings`);
    } else {
      showStatus(`❌ No embeddings created`, true);
    }
  }

  async function uploadFile(file) {
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      content: null
    };

    // Read file content based on type
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv')) {
      fileData.content = await readTextFile(file);
    } else {
      throw new Error('Unsupported file type. Please use text-based files.');
    }

    // Send to background script for processing
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'uploadFile',
        fileData: fileData
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          console.log(`📊 Upload complete for "${response.fileName}"`);
          console.log(`   └─ Chunks: ${response.chunksProcessed}/${response.totalChunks}`);
          console.log(`   └─ Embeddings: ${response.embeddingsCreated}`);
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Upload failed'));
        }
      });
    });
  }

  async function readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  async function updateKnowledgeStatus() {
    try {
      const result = await chrome.storage.local.get(['uploadedFiles', 'knowledgeBase']);
      const files = result.uploadedFiles || [];
      const embeddings = result.knowledgeBase || [];
      
      if (files.length > 0) {
        knowledgeStatus.innerHTML = `
          <div class="stats-info">
            📚 <strong>${files.length}</strong> files • <strong>${embeddings.length}</strong> chunks
          </div>
        `;
      } else {
        knowledgeStatus.innerHTML = `
          <div class="stats-info">
            📚 No files uploaded yet
          </div>
        `;
      }
    } catch (error) {
      knowledgeStatus.innerHTML = `
        <div class="stats-info">
          ❌ Error reading knowledge base
        </div>
      `;
    }
  }

  async function clearLibrary() {
    try {
      // Show confirmation dialog
      const confirmed = confirm(
        '🗑️ Clear Knowledge Library\n\n' +
        'This will permanently delete all uploaded files and their embeddings.\n\n' +
        'Are you sure you want to continue?'
      );
      
      if (!confirmed) {
        return;
      }
      
      showStatus('🧹 Clearing knowledge library...');
      
      // Clear both uploaded files and knowledge base
      await chrome.storage.local.remove(['uploadedFiles', 'knowledgeBase']);
      
      // Update UI
      displayUploadedFiles();
      updateKnowledgeStatus();
      
      showStatus('✅ Knowledge library cleared successfully');
      
    } catch (error) {
      console.error('Error clearing library:', error);
      showStatus('❌ Error clearing library', true);
    }
  }

  async function displayUploadedFiles() {
    try {
      const result = await chrome.storage.local.get('uploadedFiles');
      const files = result.uploadedFiles || [];
      
      uploadedFiles.innerHTML = '';
      
      files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
          <span class="file-name" title="${file.name}">${file.name}</span>
          <button class="delete-file" data-index="${index}">×</button>
        `;
        uploadedFiles.appendChild(fileItem);
      });

      // Add delete handlers
      uploadedFiles.querySelectorAll('.delete-file').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.getAttribute('data-index'));
          deleteFile(index);
        });
      });
    } catch (error) {
      console.error('Error displaying files:', error);
    }
  }

  async function deleteFile(index) {
    try {
      const result = await chrome.storage.local.get(['uploadedFiles', 'knowledgeBase']);
      const files = result.uploadedFiles || [];
      const knowledgeBase = result.knowledgeBase || [];
      
      if (index >= 0 && index < files.length) {
        const deletedFile = files[index];
        files.splice(index, 1);
        
        // Remove embeddings for this file
        const updatedKnowledgeBase = knowledgeBase.filter(item => item.fileName !== deletedFile.name);
        
        await chrome.storage.local.set({
          uploadedFiles: files,
          knowledgeBase: updatedKnowledgeBase
        });
        
        displayUploadedFiles();
        updateKnowledgeStatus();
        showStatus(`🗑️ Deleted ${deletedFile.name}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      showStatus('❌ Error deleting file', true);
    }
  }

  // Initialize display
  displayUploadedFiles();

  // Helper function to inject content script if needed
  async function ensureContentScriptLoaded(tabId) {
    try {
      // Try to ping the content script
      await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    } catch (error) {
      // If content script isn't loaded, inject it
      console.log('Content script not found, injecting...');
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    }
  }

  // Read page button click handler
  document.getElementById('readPage').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        showStatus('❌ No active tab found', true);
        return;
      }

      // Ensure we can inject into this tab
      if (!tab.url.startsWith('http')) {
        showStatus('❌ Cannot access this page type', true);
        return;
      }

      // Make sure content script is loaded
      await ensureContentScriptLoaded(tab.id);

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: 'readPage' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          showStatus(`❌ Error: ${chrome.runtime.lastError.message}`, true);
          return;
        }
        if (response && response.success) {
          showStatus('✅ Page analyzed successfully');
        } else {
          showStatus('❌ No forms found on page', true);
        }
      });
    } catch (error) {
      console.error('Error in readPage:', error);
      showStatus(`❌ Error: ${error.message}`, true);
    }
  });

  // Fill form button click handler
  document.getElementById('fillForm').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        showStatus('❌ No active tab found', true);
        return;
      }

      // Ensure we can inject into this tab
      if (!tab.url.startsWith('http')) {
        showStatus('❌ Cannot access this page type', true);
        return;
      }

      // Make sure content script is loaded
      await ensureContentScriptLoaded(tab.id);

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          showStatus(`❌ Error: ${chrome.runtime.lastError.message}`, true);
          return;
        }
        if (response && response.success) {
          showStatus('✅ Forms filled successfully');
        } else {
          showStatus('❌ No saved data to fill forms', true);
        }
      });
    } catch (error) {
      console.error('Error in fillForm:', error);
      showStatus(`❌ Error: ${error.message}`, true);
    }
  });
});
