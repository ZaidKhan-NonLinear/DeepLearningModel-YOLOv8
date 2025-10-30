// Main JavaScript for YOLO Detection App

// Utility function to get CSRF token
function getCSRFToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (!csrfInput) {
        console.error('CSRF token not found!');
        return '';
    }
    console.log('CSRF token found:', csrfInput.value ? 'Yes' : 'No');
    return csrfInput.value;
}

// Initialize drop zone functionality
function initializeDropZone() {
    console.log('Initializing drop zone...');
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    
    if (!dropZone || !imageInput) {
        console.error('Drop zone or image input not found!');
        return;
    }
    
    console.log('Drop zone and image input found');
    
    // Prevent default drag behaviors on the entire document
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    dropZone.addEventListener('dragenter', handleDragEnter, false);
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragLeave, false);
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Handle file input change
    imageInput.addEventListener('change', handleFileSelect, false);
    
    // Handle drop zone click to trigger file input
    dropZone.addEventListener('click', function(e) {
        // Only trigger if clicking on the drop zone itself, not on buttons
        if (e.target === dropZone || e.target.closest('#dropZoneContent')) {
            imageInput.click();
        }
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function handleDragEnter(e) {
        preventDefaults(e);
        dropZone.classList.add('dragover');
        console.log('Drag enter');
    }
    
    function handleDragOver(e) {
        preventDefaults(e);
        dropZone.classList.add('dragover');
        console.log('Drag over');
    }
    
    function handleDragLeave(e) {
        preventDefaults(e);
        // Only remove highlight if we're leaving the drop zone entirely
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('dragover');
            console.log('Drag leave');
        }
    }
    
    function handleDrop(e) {
        preventDefaults(e);
        dropZone.classList.remove('dragover');
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        console.log('Files dropped:', files.length);
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }
    
    function handleFileSelect(e) {
        console.log('File input changed');
        const files = e.target.files;
        console.log('Files selected:', files.length);
        if (files.length > 0) {
            handleFiles(files);
        } else {
            console.log('No files selected');
        }
    }
}

// Handle uploaded files
function handleFiles(files) {
    console.log('handleFiles called with:', files.length, 'files');
    
    if (!files || files.length === 0) {
        console.error('No files provided to handleFiles');
        showError('No files selected.');
        return;
    }
    
    // If multiple files are dropped, only process the first one
    if (files.length > 1) {
        console.warn('Multiple files detected, processing only the first one');
        showError('Multiple files detected. Only the first file will be processed.');
    }
    
    const file = files[0];
    console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size
    });
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        showError('Please select a valid image file. Supported formats: JPG, PNG, GIF, WebP, etc.');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        console.error('File too large:', file.size);
        showError('File size too large. Maximum size is 10MB.');
        return;
    }
    
    // Check for empty files
    if (file.size === 0) {
        console.error('Empty file detected');
        showError('The selected file appears to be empty. Please select a valid image file.');
        return;
    }
    
    try {
        currentFile = file;
        console.log('File set as currentFile:', currentFile.name);
        showImagePreview(file);
        
        // Show success message
        showSuccess(`File "${file.name}" loaded successfully!`);
    } catch (error) {
        console.error('Error processing file:', error);
        showError('Error processing the selected file.');
    }
}

// Show image preview
function showImagePreview(file) {
    console.log('showImagePreview called for file:', file.name);
    
    try {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            console.log('FileReader loaded successfully');
            const previewImg = document.getElementById('previewImg');
            const imagePreview = document.getElementById('imagePreview');
            const dropZoneContent = document.getElementById('dropZoneContent');
            
            if (!previewImg || !imagePreview || !dropZoneContent) {
                console.error('Required elements not found for image preview');
                showError('Error displaying image preview.');
                return;
            }
            
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            dropZoneContent.style.display = 'none';
            
            // Add fade-in animation
            imagePreview.classList.add('fade-in');
            console.log('Image preview displayed successfully');
        };
        
        reader.onerror = function(error) {
            console.error('FileReader error:', error);
            showError('Error reading the selected file.');
        };
        
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error in showImagePreview:', error);
        showError('Error displaying image preview.');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Analyze button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeImage);
        console.log('Analyze button listener added');
    } else {
        console.error('Analyze button not found!');
    }
    
    // Clear button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAll);
        console.log('Clear button listener added');
    } else {
        console.error('Clear button not found!');
    }
    
    // New analysis button
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    if (newAnalysisBtn) {
        newAnalysisBtn.addEventListener('click', clearAll);
        console.log('New analysis button listener added');
    } else {
        console.error('New analysis button not found!');
    }
    
    // Download results button
    const downloadResultsBtn = document.getElementById('downloadResultsBtn');
    if (downloadResultsBtn) {
        downloadResultsBtn.addEventListener('click', downloadResults);
        console.log('Download results button listener added');
    } else {
        console.error('Download results button not found!');
    }
}

// Analyze the uploaded image
async function analyzeImage() {
    if (!currentFile) {
        showError('Please select an image first.');
        return;
    }
    
    // Show loading spinner
    showLoading(true);
    hideError();
    
    try {
        const formData = new FormData();
        formData.append('image', currentFile);
        
        // Get CSRF token
        const csrfToken = getCSRFToken();
        console.log('CSRF Token:', csrfToken ? 'Found' : 'Not found');
        
        const response = await fetch('/predict/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response result:', result);
        
        if (result.success) {
            detectionResults = result;
            displayResults(result);
        } else {
            showError(result.error || 'Analysis failed. Please try again.');
        }
    } catch (error) {
        showError('Network error. Please check your connection and try again.');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

// Display analysis results
function displayResults(result) {
    // Update summary stats
    document.getElementById('totalDetections').textContent = result.total_detections;
    document.getElementById('uniqueClasses').textContent = Object.keys(result.class_counts).length;
    document.getElementById('processingTime').textContent = result.processing_time + 's';
    
    // Calculate average confidence
    const avgConfidence = result.detections.length > 0 
        ? (result.detections.reduce((sum, det) => sum + det.confidence, 0) / result.detections.length * 100).toFixed(1)
        : 0;
    document.getElementById('avgConfidence').textContent = avgConfidence + '%';
    
    // Create charts
    createClassChart(result.class_counts);
    createConfidenceChart(result.detections);
    
    // Populate results table
    populateResultsTable(result.detections);
    
    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    resultsSection.classList.add('slide-in');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Create class distribution chart
function createClassChart(classCounts) {
    const ctx = document.getElementById('classChart').getContext('2d');
    
    if (classChart) {
        classChart.destroy();
    }
    
    const labels = Object.keys(classCounts);
    const data = Object.values(classCounts);
    const colors = generateColors(labels.length);
    
    classChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Create confidence distribution chart
function createConfidenceChart(detections) {
    const ctx = document.getElementById('confidenceChart').getContext('2d');
    
    if (confidenceChart) {
        confidenceChart.destroy();
    }
    
    const confidences = detections.map(det => Math.round(det.confidence * 100));
    const ranges = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
    const counts = [0, 0, 0, 0, 0];
    
    confidences.forEach(conf => {
        if (conf <= 20) counts[0]++;
        else if (conf <= 40) counts[1]++;
        else if (conf <= 60) counts[2]++;
        else if (conf <= 80) counts[3]++;
        else counts[4]++;
    });
    
    confidenceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ranges,
            datasets: [{
                label: 'Number of Detections',
                data: counts,
                backgroundColor: [
                    '#dc3545',
                    '#fd7e14',
                    '#ffc107',
                    '#20c997',
                    '#28a745'
                ],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Populate results table
function populateResultsTable(detections) {
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';
    
    detections.forEach((detection, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <span class="badge bg-primary">${detection.class_name}</span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="confidence-bar me-2" style="width: 100px;">
                        <div class="confidence-fill" style="width: ${detection.confidence * 100}%"></div>
                    </div>
                    <span class="fw-bold">${(detection.confidence * 100).toFixed(1)}%</span>
                </div>
            </td>
            <td>(${detection.bbox.x.toFixed(1)}, ${detection.bbox.y.toFixed(1)})</td>
            <td>${detection.bbox.width.toFixed(1)} × ${detection.bbox.height.toFixed(1)}</td>
            <td>
                <small class="text-muted">
                    x: ${detection.bbox.x.toFixed(1)}, y: ${detection.bbox.y.toFixed(1)}<br>
                    w: ${detection.bbox.width.toFixed(1)}, h: ${detection.bbox.height.toFixed(1)}
                </small>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Generate random colors for charts
function generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
        const hue = i * hueStep;
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return colors;
}

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (show) {
        spinner.style.display = 'block';
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    } else {
        spinner.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Image';
    }
}

// Show error message
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorAlert.style.display = 'block';
    errorAlert.classList.add('show');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Create a temporary success alert
    const successAlert = document.createElement('div');
    successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed';
    successAlert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    successAlert.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(successAlert);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (successAlert.parentNode) {
            successAlert.remove();
        }
    }, 3000);
}

// Hide error message
function hideError() {
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.style.display = 'none';
    errorAlert.classList.remove('show');
}

// Clear all data
function clearAll() {
    // Reset file input
    document.getElementById('imageInput').value = '';
    currentFile = null;
    
    // Hide preview and results
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    
    // Show drop zone content
    document.getElementById('dropZoneContent').style.display = 'block';
    
    // Clear charts
    if (classChart) {
        classChart.destroy();
        classChart = null;
    }
    if (confidenceChart) {
        confidenceChart.destroy();
        confidenceChart = null;
    }
    
    // Hide error
    hideError();
    
    // Reset button
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Image';
}

// Download results as JSON
function downloadResults() {
    if (!detectionResults) {
        showError('No results to download.');
        return;
    }
    
    const dataStr = JSON.stringify(detectionResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `yolo_detection_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    link.click();
}

// Utility function to format numbers
function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals);
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
