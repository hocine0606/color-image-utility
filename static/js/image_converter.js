// Image Converter JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize file upload
    initFileUpload();
});

// Initialize file upload
function initFileUpload() {
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('image-upload');
    const filePreview = document.getElementById('file-preview');
    const previewImage = document.getElementById('preview-image');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const fileType = document.getElementById('file-type');
    const removeFileBtn = document.getElementById('remove-file');
    
    if (!fileUploadArea || !fileInput) return;
    
    // Click on upload area to trigger file input
    fileUploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        fileUploadArea.classList.add('highlight');
    }
    
    function unhighlight() {
        fileUploadArea.classList.remove('highlight');
    }
    
    // Handle file drop
    fileUploadArea.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            fileInput.files = files;
            handleFiles(files[0]);
        }
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFiles(this.files[0]);
        }
    });
    
    // Handle selected file
    function handleFiles(file) {
        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        // Display file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileType.textContent = file.type;
        
        // Create image preview
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            
            // Show preview and hide upload area
            filePreview.style.display = 'block';
            fileUploadArea.style.display = 'none';
        };
        
        reader.readAsDataURL(file);
    }
    
    // Remove file button
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', function() {
            // Clear file input
            fileInput.value = '';
            
            // Hide preview and show upload area
            filePreview.style.display = 'none';
            fileUploadArea.style.display = 'block';
        });
    }
    
    // Target format selection based on original format
    const targetFormatSelect = document.getElementById('target-format');
    
    if (fileInput && targetFormatSelect) {
        fileInput.addEventListener('change', function() {
            if (this.files.length) {
                const file = this.files[0];
                const fileExtension = file.name.split('.').pop().toLowerCase();
                
                // Set a different default format based on the input format
                if (fileExtension) {
                    const options = targetFormatSelect.options;
                    
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].value.toLowerCase() !== fileExtension) {
                            targetFormatSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        });
    }
}
