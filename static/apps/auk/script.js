/* DOM Elements */
const clearBtn = document.getElementById("clear-btn");
const newFileBtn = document.getElementById("new-file-btn");

const saveBtn = document.getElementById("save-btn");
const downloadBtn = document.getElementById("download-btn");

const tabsList = document.getElementById("tabs-list");
const editorContainer = document.querySelector(".editor-container");

const previewContainer = document.querySelector(".preview-container");

const newFileModal = document.getElementById("new-file-modal");
const createFileBtn = document.getElementById("create-file-btn");
const cancelFileBtn = document.getElementById("cancel-file-btn");
const fileLanguageSelect = document.getElementById("file-language");
const fileNameInput = document.getElementById("file-name");
const closeNewFileBtn = document.getElementById("close-new-file");

const fpsCounter = document.getElementById("fps-counter");
const fpsDisplay = document.getElementById("fps");

const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");
const themeSelect = document.getElementById("theme-select");
const fontSizeSlider = document.getElementById("font-size");
const fontSizeValue = document.getElementById("font-size-value");
const autoRunToggle = document.getElementById("auto-run-toggle");
const lineNumbersToggle = document.getElementById("line-numbers-toggle");
const tabSizeSelect = document.getElementById("tab-size");
const showFPSToggle = document.getElementById("show-fps-toggle");
const autosaveToggle = document.getElementById("autosave-toggle");
const shortcutsToggle = document.getElementById("shortcuts-toggle");

const notificationContainer = document.getElementById("notification-container"); // Notification Container
const sidebarFilesList = document.getElementById("sidebar-files-list"); // Sidebar File List
const searchFilesInput = document.getElementById("search-files"); // Search Input

const shortcutsModal = document.getElementById("shortcuts-modal");
const closeShortcutsBtn = document.getElementById("close-shortcuts");

/* Application State */
let files = [];
let activeFileId = null;
let editors = {}; // To keep track of CodeMirror instances
let previews = {}; // To keep track of preview iframes

/* FPS Tracking Variables */
let showFPS = true;
let lastTime = performance.now();
let frames = 0;
let fps = 0;

/* Debounce Timer for Live Preview and Search */
let debounceTimer;
const DEBOUNCE_DELAY = 300; // 300ms

/* Autosave Interval */
let autosaveInterval;

/* Initialize Application */
window.addEventListener("load", initialize);

/* Event Listeners */
clearBtn.addEventListener("click", handleClear);
newFileBtn.addEventListener("click", openNewFileModal);
createFileBtn.addEventListener("click", handleCreateFile);
cancelFileBtn.addEventListener("click", closeNewFileModal);
closeNewFileBtn.addEventListener("click", closeNewFileModal);

settingsBtn.addEventListener("click", openSettingsModal);
closeSettingsBtn.addEventListener("click", closeSettingsModal);
themeSelect.addEventListener("change", changeTheme);
fontSizeSlider.addEventListener("input", changeFontSize);
autoRunToggle.addEventListener("change", toggleAutoRun);
lineNumbersToggle.addEventListener("change", toggleLineNumbers);
tabSizeSelect.addEventListener("change", changeTabSize);
showFPSToggle.addEventListener("change", toggleFPS);
autosaveToggle.addEventListener("change", toggleAutosave);
shortcutsToggle.addEventListener("change", toggleShortcuts);

saveBtn.addEventListener("click", saveToLocalStorage);
downloadBtn.addEventListener("click", downloadAsFile);

sidebarFilesList.addEventListener("click", function(event) {
  const target = event.target;
  const fileItem = target.closest("li");
  if (!fileItem) return;

  const fileId = parseInt(fileItem.getAttribute("data-id"));

  if (target.classList.contains("delete-sidebar-file")) {
    handleDeleteFile(fileId);
  } else {
    setActiveFile(fileId);
  }
});

tabsList.addEventListener("click", function(event) {
  const target = event.target;
  const tab = target.closest("li");
  if (!tab) return;

  const fileId = parseInt(tab.getAttribute("data-id"));

  if (target.classList.contains("delete-tab")) {
    handleDeleteFile(fileId);
  } else {
    setActiveFile(fileId);
  }
});

/* Search Files */
searchFilesInput.addEventListener("input", function() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    filterFiles(searchFilesInput.value.trim().toLowerCase());
  }, DEBOUNCE_DELAY);
});

/* Keyboard Shortcuts */
document.addEventListener("keydown", handleKeyboardShortcuts);

/* Delegate Shortcuts Modal Toggle */
shortcutsToggle.addEventListener("change", function() {
  if (shortcutsToggle.checked) {
    openShortcutsModal();
  } else {
    closeShortcutsModal();
  }
});

/* Close Shortcuts Modal via 'X' Button */
closeShortcutsBtn.addEventListener("click", closeShortcutsModal);

/* Functions */

/**
 * Display a notification bubble.
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification ('success', 'error', 'info').
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement("div");
  notification.classList.add("notification", type);
  notification.textContent = message;
  
  notificationContainer.appendChild(notification);
  
  // Remove the notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Initialize the application by loading data from localStorage or creating a default file.
 */
function initialize() {
  const savedData = localStorage.getItem("amazingEditorData");
  if (savedData) {
    const data = JSON.parse(savedData);
    files = data.files || [];
    const theme = data.theme || 'dark';
    const fontSize = data.fontSize || 14;
    const autoRun = data.autoRun !== undefined ? data.autoRun : true;
    const showLineNumbers = data.showLineNumbers !== undefined ? data.showLineNumbers : true;
    const tabSize = data.tabSize || "4";
    const showFPSSetting = data.showFPS !== undefined ? data.showFPS : true;
    const autosave = data.autosave !== undefined ? data.autosave : true;
    const showShortcuts = data.showShortcuts !== undefined ? data.showShortcuts : true;

    applyTheme(theme);
    themeSelect.value = theme;
    
    fontSizeSlider.value = fontSize;
    fontSizeValue.textContent = `${fontSize}px`;
    autoRunToggle.checked = autoRun;
    lineNumbersToggle.checked = showLineNumbers;
    tabSizeSelect.value = tabSize;
    showFPSToggle.checked = showFPSSetting;
    autosaveToggle.checked = autosave;
    shortcutsToggle.checked = showShortcuts;

    toggleFPS();
    toggleAutosave();
    toggleShortcuts();

    files.forEach(file => {
      addTab(file);
      addSidebarFile(file);
      addEditor(file);
      if (file.language.toLowerCase() === 'html') {
        addPreview(file);
      }
    });

    if (files.length > 0) {
      setActiveFile(files[0].id);
    }

    updateFontSize();

    showNotification("Loaded files and settings from LocalStorage.", "success");

  } else {
    createNewFile("index", "html");
    showNotification("Created default 'index.html' file.", "info");
  }

  // Initialize Shortcuts Modal State
  const shortcutsClosed = localStorage.getItem("shortcutsClosed");
  if (shortcutsClosed === "true") {
    shortcutsModal.style.display = "none";
    shortcutsModal.setAttribute("aria-hidden", "true");
    shortcutsToggle.checked = false;
  } else {
    shortcutsModal.style.display = "flex";
    shortcutsModal.setAttribute("aria-hidden", "false");
    shortcutsToggle.checked = true;
  }

  updateFPS();
}

/**
 * Create a new file and add it to the editor.
 * @param {string} name - The base name of the file.
 * @param {string} language - The programming language of the file.
 */
function createNewFile(name, language) {
  const id = Date.now();
  const extension = getExtension(language);
  let fileName = name.trim();

  // Append extension if not present
  if (!fileName.endsWith(extension)) {
    fileName += extension;
  }

  // Prevent duplicate file names
  if (files.some(f => f.name.toLowerCase() === fileName.toLowerCase())) {
    showNotification(`A file named "${fileName}" already exists.`, "error");
    return;
  }

  const newFile = {
    id,
    name: fileName,
    language,
    content: ""
  };

  files.push(newFile);
  addTab(newFile);
  addSidebarFile(newFile);
  addEditor(newFile);
  if (newFile.language.toLowerCase() === 'html') {
    addPreview(newFile);
  }
  setActiveFile(id);
  saveToLocalStorage();

  showNotification(`Created new file "${fileName}".`, "success");
}

/**
 * Get the file extension based on the language.
 * @param {string} language - The programming language.
 * @returns {string} - The corresponding file extension.
 */
function getExtension(language) {
  const extensions = {
    html: ".html",
    css: ".css",
    javascript: ".js",
    python: ".py",
    ruby: ".rb",
    typescript: ".ts",
    java: ".java",
    csharp: ".cs",
    php: ".php",
    go: ".go",
    swift: ".swift",
    kotlin: ".kt",
    rust: ".rs"
  };
  return extensions[language.toLowerCase()] || ".txt";
}

/**
 * Add a new tab to the tabs list.
 * @param {Object} file - The file object.
 */
function addTab(file) {
  const li = document.createElement("li");
  li.setAttribute("data-id", file.id);
  li.innerHTML = `${file.name} <button class="delete-tab" title="Delete File" aria-label="Delete File">&times;</button>`;
  tabsList.appendChild(li);
}

/**
 * Add a new file to the sidebar list.
 * @param {Object} file - The file object.
 */
function addSidebarFile(file) {
  const li = document.createElement("li");
  li.setAttribute("data-id", file.id);
  li.innerHTML = `
    <span>${file.name}</span>
    <button class="delete-sidebar-file" title="Delete File" aria-label="Delete File">&times;</button>
  `;
  sidebarFilesList.appendChild(li);
}

/**
 * Add a new editor panel corresponding to the file using CodeMirror.
 * @param {Object} file - The file object.
 */
function addEditor(file) {
  const panel = document.createElement("div");
  panel.classList.add("editor-panel");
  panel.setAttribute("data-id", file.id);

  const header = document.createElement("div");
  header.classList.add("panel-header");
  header.textContent = file.name;

  const textarea = document.createElement("textarea");
  textarea.id = `editor-${file.id}`;
  textarea.placeholder = `Write your ${file.language.toUpperCase()} code here...`;
  textarea.value = file.content;

  panel.appendChild(header);
  panel.appendChild(textarea);
  editorContainer.appendChild(panel);

  // Initialize CodeMirror
  const mode = getCodeMirrorMode(file.language);
  const theme = getCurrentTheme() === 'github-dark' ? 'github-dark' : getCurrentTheme();
  const editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: lineNumbersToggle.checked,
    mode: mode,
    theme: theme === 'dracula' ? 'dracula' : (theme === 'github-dark' ? 'github-dark' : 'default'),
    tabSize: parseInt(tabSizeSelect.value),
    indentWithTabs: false,
    autofocus: false,
    lineWrapping: true
  });

  // Style CodeMirror for better aesthetics
  editor.setOption("viewportMargin", Infinity); // Show all lines
  editor.setSize("100%", "100%"); // Full size within the container

  // Listen to changes with debouncing
  editor.on("change", () => {
    handleInputDebounced(file.id);
  });

  editors[file.id] = editor;
}

/**
 * Add a preview iframe for an HTML file.
 * @param {Object} file - The HTML file object.
 */
function addPreview(file) {
  const iframe = document.createElement("iframe");
  iframe.classList.add("preview-iframe");
  iframe.id = `preview-${file.id}`;
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
  iframe.srcdoc = "<h2>No Content to Preview</h2>";
  previewContainer.appendChild(iframe);

  previews[file.id] = iframe;
}

/**
 * Get the CodeMirror mode based on the language.
 * @param {string} language - The programming language.
 * @returns {string} - The corresponding CodeMirror mode.
 */
function getCodeMirrorMode(language) {
  const modes = {
    html: "xml",
    css: "css",
    javascript: "javascript",
    python: "python",
    ruby: "ruby",
    typescript: "javascript",
    java: "text/x-java",
    csharp: "text/x-csharp",
    php: "php",
    go: "go",
    swift: "swift",
    kotlin: "clike",
    rust: "rust"
  };
  return modes[language.toLowerCase()] || "javascript";
}

/**
 * Set the active file and update the UI accordingly.
 * @param {number} id - The unique identifier of the file.
 */
function setActiveFile(id) {
  activeFileId = id;

  // Update Tabs
  Array.from(tabsList.children).forEach(tab => {
    if (parseInt(tab.getAttribute("data-id")) === id) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Update Sidebar Files
  Array.from(sidebarFilesList.children).forEach(fileItem => {
    if (parseInt(fileItem.getAttribute("data-id")) === id) {
      fileItem.classList.add("active");
    } else {
      fileItem.classList.remove("active");
    }
  });

  // Update Editor Panels
  Array.from(editorContainer.children).forEach(panel => {
    if (parseInt(panel.getAttribute("data-id")) === id) {
      panel.classList.add("active");
      editors[id].refresh(); // Refresh CodeMirror to ensure proper rendering
    } else {
      panel.classList.remove("active");
    }
  });

  // Update Previews
  Object.keys(previews).forEach(fileId => {
    const iframe = previews[fileId];
    if (parseInt(fileId) === id) {
      iframe.style.display = "block";
      if (autoRunToggle.checked) {
        const file = files.find(f => f.id === id);
        if (file && file.language.toLowerCase() === 'html') {
          updatePreview(file.id);
        }
      }
    } else {
      iframe.style.display = "none";
    }
  });
}

/**
 * Debounced handler for input changes to update live preview.
 * @param {number} fileId - The unique identifier of the file.
 */
function handleInputDebounced(fileId) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    handleInput(fileId);
  }, DEBOUNCE_DELAY); // 300ms delay
}

/**
 * Handle input event in CodeMirror editor to update file content and preview.
 * @param {number} fileId - The unique identifier of the file.
 */
function handleInput(fileId) {
  const file = files.find(f => f.id === fileId);
  if (file) {
    const editor = editors[fileId];
    file.content = editor.getValue();
  }

  // Update Preview if Auto-Run is enabled and the file is HTML
  if (autoRunToggle.checked) {
    const file = files.find(f => f.id === fileId);
    if (file && file.language.toLowerCase() === 'html') {
      updatePreview(file.id);
    }
  }

  // Save to LocalStorage
  if (autosaveToggle.checked) {
    saveToLocalStorage();
  }
}

/**
 * Update the live preview based on the specified HTML file.
 * @param {number} htmlFileId - The unique identifier of the HTML file to preview.
 */
function updatePreview(htmlFileId) {
  const htmlFile = files.find(f => f.id === htmlFileId && f.language.toLowerCase() === 'html');
  if (!htmlFile) {
    const iframe = previews[htmlFileId];
    if (iframe) {
      iframe.srcdoc = "<h2>No Content to Preview</h2>";
    }
    return;
  }

  const cssFiles = files.filter(f => f.language.toLowerCase() === 'css');
  const jsFiles = files.filter(f => ['javascript', 'js'].includes(f.language.toLowerCase()));

  let combinedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Preview of ${htmlFile.name}</title>`;

  // Append CSS
  cssFiles.forEach(file => {
    combinedHTML += `<style>${file.content}</style>`;
  });

  combinedHTML += `</head>
<body>`;

  // Append HTML
  combinedHTML += `${htmlFile.content}`;

  // Append JS
  jsFiles.forEach(file => {
    combinedHTML += `<script>${file.content}<\/script>`;
  });

  combinedHTML += `</body>
</html>`;

  // Update the corresponding iframe's srcdoc
  const iframe = previews[htmlFileId];
  if (iframe) {
    iframe.srcdoc = combinedHTML;
  }
}

/**
 * Save the current state to localStorage.
 */
function saveToLocalStorage() {
  const data = {
    files,
    theme: getCurrentTheme(),
    fontSize: fontSizeSlider.value,
    autoRun: autoRunToggle.checked,
    showLineNumbers: lineNumbersToggle.checked,
    tabSize: tabSizeSelect.value,
    showFPS: showFPS,
    autosave: autosaveToggle.checked,
    showShortcuts: shortcutsToggle.checked
  };
  localStorage.setItem("amazingEditorData", JSON.stringify(data));
  showNotification("Files and settings have been saved to LocalStorage.", "success");
}

/**
 * Download the active file with the correct MIME type.
 */
function downloadAsFile() {
  if (!activeFileId) {
    showNotification("No active file to download.", "error");
    return;
  }

  const file = files.find(f => f.id === activeFileId);
  if (!file) {
    showNotification("Active file not found.", "error");
    return;
  }

  const blob = new Blob([file.content], { type: getMimeType(file.language) });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  showNotification(`Downloaded "${file.name}".`, "success");
}

/**
 * Get the MIME type based on the language.
 * @param {string} language - The programming language.
 * @returns {string} - The corresponding MIME type.
 */
function getMimeType(language) {
  const mimeTypes = {
    html: "text/html",
    css: "text/css",
    javascript: "application/javascript",
    python: "text/x-python",
    ruby: "text/x-ruby",
    typescript: "application/typescript",
    java: "text/x-java-source",
    csharp: "text/plain",
    php: "application/x-httpd-php",
    go: "text/plain",
    swift: "text/x-swift",
    kotlin: "text/x-kotlin",
    rust: "text/plain"
  };
  return mimeTypes[language.toLowerCase()] || "text/plain";
}

/**
 * Handle clearing the content of the active file.
 */
function handleClear() {
  if (!activeFileId) {
    showNotification("No active file to clear.", "error");
    return;
  }

  const file = files.find(f => f.id === activeFileId);
  if (file) {
    const confirmClear = confirm(`Are you sure you want to clear the content of "${file.name}"?`);
    if (confirmClear) {
      file.content = "";
      const activeEditor = editors[activeFileId];
      if (activeEditor) {
        activeEditor.setValue("");
      }
      if (autoRunToggle.checked && file.language.toLowerCase() === 'html') {
        updatePreview(file.id);
      }
      if (autosaveToggle.checked) {
        saveToLocalStorage();
      }
      showNotification(`Cleared content of "${file.name}".`, "success");
    }
  }
}

/**
 * Open the New File modal.
 */
function openNewFileModal() {
  newFileModal.style.display = "flex";
  newFileModal.setAttribute("aria-hidden", "false");
  fileNameInput.focus();
}

/**
 * Close the New File modal.
 */
function closeNewFileModal() {
  newFileModal.style.display = "none";
  newFileModal.setAttribute("aria-hidden", "true");
  fileNameInput.value = "";
  fileLanguageSelect.value = "html";
}

/**
 * Handle creating a new file from the modal inputs.
 */
function handleCreateFile() {
  const language = fileLanguageSelect.value;
  const name = fileNameInput.value.trim();

  if (!name) {
    showNotification("Please enter a file name.", "error");
    return;
  }

  createNewFile(name, language);
  closeNewFileModal();
}

/**
 * Open the Settings modal.
 */
function openSettingsModal() {
  settingsModal.style.display = "flex";
  settingsModal.setAttribute("aria-hidden", "false");
  themeSelect.focus();
}

/**
 * Close the Settings modal.
 */
function closeSettingsModal() {
  settingsModal.style.display = "none";
  settingsModal.setAttribute("aria-hidden", "true");
}

/**
 * Change the theme based on user selection.
 */
function changeTheme() {
  const selectedTheme = themeSelect.value;
  applyTheme(selectedTheme);
  // Update CodeMirror themes
  Object.values(editors).forEach(editor => {
    const theme = selectedTheme === 'github-dark' ? 'github-dark' : (selectedTheme === 'dracula' ? 'dracula' : 'default');
    editor.setOption("theme", theme);
  });
  saveToLocalStorage();
  showNotification(`Theme changed to "${selectedTheme}".`, "info");
}

/**
 * Apply the selected theme by updating the body class.
 * @param {string} theme - The selected theme.
 */
function applyTheme(theme) {
  document.body.classList.remove('dark', 'light', 'solarized', 'dracula', 'monokai', 'github-dark');
  document.body.classList.add(theme);
}

/**
 * Get the current theme based on the body class.
 * @returns {string} - The current theme.
 */
function getCurrentTheme() {
  const themes = ['dark', 'light', 'solarized', 'dracula', 'monokai', 'github-dark'];
  for (const theme of themes) {
    if (document.body.classList.contains(theme)) {
      return theme;
    }
  }
  return 'dark'; // Default Theme
}

/**
 * Change the font size of the editor.
 */
function changeFontSize() {
  const size = fontSizeSlider.value;
  fontSizeValue.textContent = `${size}px`;
  Object.values(editors).forEach(editor => {
    editor.getWrapperElement().style.fontSize = `${size}px`;
    editor.refresh();
  });
  saveToLocalStorage();
  showNotification(`Font size set to ${size}px.`, "info");
}

/**
 * Update the font size display and apply it to editors.
 */
function updateFontSize() {
  const size = fontSizeSlider.value;
  fontSizeValue.textContent = `${size}px`;
  Object.values(editors).forEach(editor => {
    editor.getWrapperElement().style.fontSize = `${size}px`;
    editor.refresh();
  });
}

/**
 * Toggle the Auto-Run Preview feature.
 */
function toggleAutoRun() {
  saveToLocalStorage();
  if (autoRunToggle.checked) {
    const activeFile = files.find(f => f.id === activeFileId);
    if (activeFile && activeFile.language.toLowerCase() === 'html') {
      updatePreview(activeFile.id);
    }
    showNotification("Auto-Run Preview enabled.", "info");
  } else {
    showNotification("Auto-Run Preview disabled.", "info");
  }
}

/**
 * Toggle the visibility of line numbers.
 */
function toggleLineNumbers() {
  const show = lineNumbersToggle.checked;
  Object.values(editors).forEach(editor => {
    editor.setOption("lineNumbers", show);
  });
  saveToLocalStorage();
  showNotification(`Line Numbers ${show ? 'enabled' : 'disabled'}.`, "info");
}

/**
 * Change the tab size based on user selection.
 */
function changeTabSize() {
  const size = parseInt(tabSizeSelect.value);
  Object.values(editors).forEach(editor => {
    editor.setOption("tabSize", size);
    editor.setOption("indentUnit", size);
  });
  saveToLocalStorage();
  showNotification(`Tab size set to ${size}.`, "info");
}

/**
 * Toggle the FPS Counter visibility.
 */
function toggleFPS() {
  showFPS = showFPSToggle.checked;
  fpsCounter.style.display = showFPS ? "block" : "none";
  saveToLocalStorage();
  showNotification(`FPS Counter ${showFPS ? 'shown' : 'hidden'}.`, "info");
}

/**
 * Toggle the Autosave feature.
 */
function toggleAutosave() {
  if (autosaveToggle.checked) {
    // Start Autosave Interval
    autosaveInterval = setInterval(() => {
      saveToLocalStorage();
      showNotification("Autosaved files.", "info");
    }, 30000); // Autosave every 30 seconds
    showNotification("Autosave enabled.", "info");
  } else {
    // Clear Autosave Interval
    clearInterval(autosaveInterval);
    showNotification("Autosave disabled.", "info");
  }
}

/**
 * Toggle the Keyboard Shortcuts modal.
 */
function toggleShortcuts() {
  if (shortcutsToggle.checked) {
    openShortcutsModal();
  } else {
    closeShortcutsModal();
  }
}

/**
 * Open the Keyboard Shortcuts modal.
 */
function openShortcutsModal() {
  shortcutsModal.style.display = "flex";
  shortcutsModal.setAttribute("aria-hidden", "false");
  localStorage.setItem("shortcutsClosed", "false");
}

/**
 * Close the Keyboard Shortcuts modal.
 */
function closeShortcutsModal() {
  shortcutsModal.style.display = "none";
  shortcutsModal.setAttribute("aria-hidden", "true");
  localStorage.setItem("shortcutsClosed", "true");
}

/**
 * Update the FPS Counter.
 */
function updateFPS() {
  const update = () => {
    frames++;
    const now = performance.now();
    const delta = now - lastTime;
    if (delta >= 1000) {
      fps = Math.round((frames * 1000) / delta);
      fpsDisplay.textContent = fps;
      frames = 0;
      lastTime = now;
    }
    if (showFPS) {
      requestAnimationFrame(update);
    }
  };
  requestAnimationFrame(update);
}

/**
 * Handle deleting a file.
 * @param {number} fileId - The unique identifier of the file.
 */
function handleDeleteFile(fileId) {
  const fileIndex = files.findIndex(f => f.id === fileId);
  if (fileIndex === -1) return;

  const file = files[fileIndex];
  const confirmDelete = confirm(`Are you sure you want to delete "${file.name}"?`);
  if (confirmDelete) {
    files.splice(fileIndex, 1);
    // Remove Tab
    const tab = document.querySelector(`.tabs ul li[data-id="${fileId}"]`);
    if (tab) tab.remove();
    // Remove Sidebar File
    const sidebarFile = document.querySelector(`.sidebar ul li[data-id="${fileId}"]`);
    if (sidebarFile) sidebarFile.remove();
    // Remove Editor Panel and CodeMirror Instance
    const panel = document.querySelector(`.editor-panel[data-id="${fileId}"]`);
    if (panel) panel.remove();
    if (editors[fileId]) {
      editors[fileId].toTextArea();
      delete editors[fileId];
    }
    // Remove Preview Iframe if exists
    const iframe = previews[fileId];
    if (iframe) {
      iframe.remove();
      delete previews[fileId];
    }
    // If the deleted file was active, set a new active file
    if (activeFileId === fileId) {
      if (files.length > 0) {
        setActiveFile(files[0].id);
      } else {
        activeFileId = null;
        // Reset Editor and Preview Containers
        editorContainer.innerHTML = "";
        previewContainer.innerHTML = `<div class="preview-header">Preview</div>`;
        previews = {};
        showNotification("No files left. Created a new default 'index.html' file.", "info");
        createNewFile("index", "html");
      }
    }
    if (autosaveToggle.checked) {
      saveToLocalStorage();
    }
    showNotification(`Deleted file "${file.name}".`, "success");
  }
}

/**
 * Filter files in the sidebar based on the search query.
 * @param {string} query - The search query.
 */
function filterFiles(query) {
  Array.from(sidebarFilesList.children).forEach(fileItem => {
    const fileName = fileItem.querySelector("span").textContent.toLowerCase();
    if (fileName.includes(query)) {
      fileItem.style.display = "flex";
    } else {
      fileItem.style.display = "none";
    }
  });
}

/**
 * Handle Keyboard Shortcuts.
 * @param {KeyboardEvent} event
 */
function handleKeyboardShortcuts(event) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'n':
        event.preventDefault();
        openNewFileModal();
        break;
      case 's':
        event.preventDefault();
        saveToLocalStorage();
        break;
      case 'd':
        event.preventDefault();
        downloadAsFile();
        break;
      case 'f':
        event.preventDefault();
        searchFilesInput.focus();
        break;
      case 'p':
        event.preventDefault();
        togglePreview();
        break;
      case 'c':
        if (event.shiftKey) {
          event.preventDefault();
          handleClear();
        }
        break;
      default:
        break;
    }
  }
}

/**
 * Toggle the Preview Container visibility.
 */
function togglePreview() {
  if (activeFileId && files.find(f => f.id === activeFileId && f.language.toLowerCase() === 'html')) {
    const iframe = previews[activeFileId];
    if (iframe) {
      if (iframe.style.display === "none") {
        iframe.style.display = "block";
        updatePreview(activeFileId);
        showNotification("Preview Enabled.", "info");
      } else {
        iframe.style.display = "none";
        showNotification("Preview Disabled.", "info");
      }
    }
  } else {
    showNotification("No active HTML file to preview.", "error");
  }
}

/* Hide Modals When Clicking Outside */
window.addEventListener("click", function(event) {
  if (event.target === newFileModal) {
    closeNewFileModal();
  }
  if (event.target === settingsModal) {
    closeSettingsModal();
  }
  if (event.target === shortcutsModal) {
    closeShortcutsModal();
  }
});
