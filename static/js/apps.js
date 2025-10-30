let games = [];
// Favorites stored as array of game names (unique)
let favorites = [];
let selectedCategory = 'All';

function getCategories() {
  const set = new Set();
  if (!Array.isArray(games)) return ['All'];
  games.forEach(g => {
    if (Array.isArray(g.categories)) {
      g.categories.forEach(c => set.add(c));
    } else if (g.category) {
      set.add(g.category);
    }
  });
  return ['All', ...Array.from(set).sort((a,b)=>a.localeCompare(b))];
}

function renderCategoryFilters() {
  const container = document.getElementById('category-dropdown');
  if (!container) return;
  const cats = getCategories();
  container.innerHTML = '';

  const selectedEl = document.createElement('div');
  selectedEl.className = 'selected';
  selectedEl.textContent = selectedCategory || 'All';

  const caret = document.createElement('div');
  caret.innerHTML = '<i class="fas fa-chevron-down"></i>';

  container.appendChild(selectedEl);
  container.appendChild(caret);

  let open = false;
  let listEl = null;

  function closeList() {
    if (listEl) { listEl.remove(); listEl = null; }
    container.setAttribute('aria-expanded', 'false');
    open = false;
  }

  function openList() {
    if (open) return;
    listEl = document.createElement('div');
    listEl.className = 'dropdown-list';
    cats.forEach(cat => {
      const it = document.createElement('div');
      it.className = 'dropdown-item';
      it.textContent = cat;
      if (cat === selectedCategory) it.classList.add('active');
      it.addEventListener('click', () => {
        selectedCategory = cat;
        selectedEl.textContent = cat;
        closeList();
        loadGames();
        try { renderFavorites(); } catch(e){}
      });
      listEl.appendChild(it);
    });

    // position list relative to container
    container.appendChild(listEl);
    container.setAttribute('aria-expanded', 'true');
    open = true;

    // close when clicking outside
    setTimeout(() => {
      document.addEventListener('click', outsideClick);
    }, 0);
  }

  function outsideClick(e) {
    if (!container.contains(e.target)) {
      closeList();
      document.removeEventListener('click', outsideClick);
    }
  }

  container.addEventListener('click', (e) => {
    e.stopPropagation();
    if (open) closeList(); else openList();
  });
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem('favoriteGames');
    favorites = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(favorites)) favorites = [];
  } catch (e) {
    favorites = [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem('favoriteGames', JSON.stringify(favorites));
  } catch (e) {
    console.error('Could not save favorites', e);
  }
}

function isFavorited(game) {
  if (!game) return false;
  return favorites.includes(game.name);
}

function toggleFavorite(game) {
  if (!game) return;
  const idx = favorites.indexOf(game.name);
  if (idx === -1) {
    favorites.unshift(game.name); // add to front
  } else {
    favorites.splice(idx, 1);
  }
  saveFavorites();
  // Update UI instantly
  renderFavorites();
  // Update favorite buttons on cards
  document.querySelectorAll('.game-card').forEach(card => {
    const name = card.dataset.name;
    const btn = card.querySelector('.favorite-btn');
    if (!btn) return;
    if (favorites.includes(name)) {
      btn.classList.add('active');
      btn.title = 'Remove from favorites';
      const icon = btn.querySelector('i');
      if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
    } else {
      btn.classList.remove('active');
      btn.title = 'Add to favorites';
      const icon = btn.querySelector('i');
      if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
    }
  });
}

function ensureFavoritesUI() {
  // Add favorites section above games container if not present
  const containerWrapper = document.querySelector('.container');
  if (!containerWrapper) return;
  // Place favorites section above the games grid (full-width, same style as games)
  const gamesContainer = document.getElementById('games-container');
  if (!gamesContainer) return;

  let favSection = document.getElementById('favorites-section');
  if (!favSection) {
    favSection = document.createElement('div');
    favSection.id = 'favorites-section';
    favSection.className = 'favorites-section';
    favSection.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div class="favorites-inline-title">Favorites</div>
      </div>
      <div id="favorites-grid" class="games-grid"></div>
    `;
    gamesContainer.parentNode.insertBefore(favSection, gamesContainer);
  }
}

function renderFavorites() {
  loadFavorites();
  const favSection = document.getElementById('favorites-section');
  const favGrid = document.getElementById('favorites-grid');
  if (!favSection || !favGrid) return;

  // Map favorite names to game objects (preserve order)
  const favGames = favorites.map(name => games.find(g => g.name === name)).filter(Boolean);

  favGrid.innerHTML = '';
  // Always show favorites section; show placeholder if empty
  favSection.style.display = 'block';
  if (favGames.length === 0) {
    favGrid.innerHTML = `<div class="favorites-empty">Favorite some games to show here</div>`;
    return;
  }

  favGames.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.name = game.name;
    card.dataset.url = game.url;

    const imageHTML = game.image ? `<img src="${game.image}" alt="${game.name}" />` : `<div class="game-card-image-placeholder">🎮</div>`;

    card.innerHTML = `
      <div class="game-card-image">${imageHTML}</div>
      <div class="game-card-content">
        <div class="game-card-title">${game.name}</div>
      </div>
    `;

  const favBtn = document.createElement('button');
  favBtn.className = 'favorite-btn active';
  favBtn.title = 'Remove from favorites';
  // create as outline first, then switch to solid icon
  favBtn.innerHTML = '<i class="far fa-heart"></i>';
  const favIcon = favBtn.querySelector('i');
  if (favIcon) { favIcon.classList.remove('far'); favIcon.classList.add('fas'); }
    favBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleFavorite(game);
    });

    card.appendChild(favBtn);

    card.addEventListener('click', () => {
      if (typeof openGameModal === 'function') {
        openGameModal(game.url, game.name);
      } else if (typeof openModal === 'function') {
        openModal(game.url, game.name);
      }
    });

    favGrid.appendChild(card);
  });
}

// load favorites initially
loadFavorites();

// ===============================
// Load games JSON
// ===============================
fetch('static/js/apps.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log('Loaded games:', data);
    games = Array.isArray(data) ? data : data.games; // works for both array or {games:[...]}
    // Make the games available under the name other modules expect
    try {
      window.gamesData = games;
      window.games = games;
    } catch (e) {
      // In some environments `window` may not be available; ignore silently
    }

    loadGames();

    // If the page has a hash for opening a game, try to handle it now
    if (typeof checkUrlHash === 'function') {
      // call asynchronously to let render complete
      setTimeout(() => {
        try { checkUrlHash(); } catch (e) { console.error('checkUrlHash error:', e); }
      }, 0);
    }
  })
  .catch(error => console.error('Error loading games:', error));

// ===============================
// Display Games Function
// ===============================
function loadGames() {
  const container = document.getElementById('games-container');
  if (!container) return console.error('Error: #games-container not found.');

  if (!Array.isArray(games) || games.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎮</div>
        <div class="empty-state-text">No games found</div>
      </div>
    `;
    return;
  }

  // Ensure favorites UI exists above the games grid
  ensureFavoritesUI();
  renderCategoryFilters();

  container.className = 'games-grid';
  container.innerHTML = '';

  // Apply category filter
  const filteredGames = selectedCategory && selectedCategory !== 'All'
    ? games.filter(g => (Array.isArray(g.categories) ? g.categories.includes(selectedCategory) : g.category === selectedCategory))
    : games;

  filteredGames.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.name = game.name;
    card.dataset.url = game.url;

    // Favorite button
  const favBtn = document.createElement('button');
  favBtn.className = 'favorite-btn';
  favBtn.title = 'Add to favorites';
  // start with outline icon
  favBtn.innerHTML = '<i class="far fa-heart"></i>';
    // prevent clicks bubbling to card click
    favBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleFavorite(game);
    });

    // mark active if favorited
    if (isFavorited(game)) {
      favBtn.classList.add('active');
      favBtn.title = 'Remove from favorites';
      // switch to filled icon
      const icon = favBtn.querySelector('i');
      if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
    }

    const imageHTML = game.image
      ? `<img src="${game.image}" alt="${game.name}" />`
      : `<div class="game-card-image-placeholder">🎮</div>`;

    card.innerHTML = `
      <div class="game-card-image">${imageHTML}</div>
      <div class="game-card-content">
        <div class="game-card-title">${game.name}</div>
      </div>
    `;
    card.appendChild(favBtn);

    // ✅ Hook into your modal system properly
    card.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      // Check if modal method exists
      if (typeof openModal === 'function') {
        openModal(game.url, game.name); // ✅ correct parameter order
      } else if (typeof openGameModal === 'function') {
        openGameModal(game.url, game.name);
      } else {
        console.error('No openModal() or openGameModal() found.');
      }
    });

    container.appendChild(card);
  });

    // Update favorites UI after building the games list
    renderFavorites();
}






// Search Func
    document.addEventListener('DOMContentLoaded', function() {
      const searchInput = document.getElementById('searchInput');
      const gamesContainer = document.getElementById('games-container');
      let noResultsDiv = null;

      function updateSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const allCards = gamesContainer.querySelectorAll('.game-card');

        let visibleCount = 0;
        allCards.forEach(function(card) {
          const titleElement = card.querySelector('.game-card-title');
          if (titleElement) {
            const titleText = titleElement.textContent.toLowerCase();
            if (searchTerm === '' || titleText.includes(searchTerm)) {
              card.classList.remove('hidden');
              visibleCount++;
            } else {
              card.classList.add('hidden');
            }
          } else {
            card.classList.add('hidden');
          }
        });

        if (searchTerm !== '' && visibleCount === 0) {

          if (!noResultsDiv) {
            noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = '<div class="no-results-text">No Games Found</div><div>Maybe you misspelled it?</div>';
            gamesContainer.appendChild(noResultsDiv);
          }

          if (gamesContainer.querySelector('.games-grid')) {
            gamesContainer.querySelector('.games-grid').style.display = 'none';
          }
          gamesContainer.classList.remove('loading', 'empty-state');
        } else {

          if (noResultsDiv) {
            noResultsDiv.remove();
            noResultsDiv = null;
          }
          if (gamesContainer.querySelector('.games-grid')) {
            gamesContainer.querySelector('.games-grid').style.display = 'grid';
          }

          if (searchTerm === '' && allCards.length === 0) {
            gamesContainer.classList.add('loading');
          }
        }

        // Also filter favorites (if present)
        const favoritesGrid = document.getElementById('favorites-grid');
        if (favoritesGrid) {
          const favCards = favoritesGrid.querySelectorAll('.game-card');
          // If there are no favorite cards (maybe placeholder present), leave the placeholder alone
          if (favCards.length > 0) {
            let favVisible = 0;
            favCards.forEach(card => {
              const titleElement = card.querySelector('.game-card-title') || card.querySelector('.fav-title') || card.querySelector('h3');
              const titleText = titleElement ? titleElement.textContent.toLowerCase() : '';
              if (searchTerm === '' || titleText.includes(searchTerm)) {
                card.classList.remove('hidden');
                favVisible++;
              } else {
                card.classList.add('hidden');
              }
            });

            // show temporary message when no favorites match the search
            let favNoResults = favoritesGrid.querySelector('#favorites-no-results');
            if (searchTerm !== '' && favVisible === 0) {
              if (!favNoResults) {
                favNoResults = document.createElement('div');
                favNoResults.id = 'favorites-no-results';
                favNoResults.className = 'favorites-empty';
                favNoResults.textContent = 'No favorites match';
                favoritesGrid.appendChild(favNoResults);
              }
            } else {
              if (favNoResults) favNoResults.remove();
            }
          }
        }
      }

      searchInput.addEventListener('input', updateSearch);

      updateSearch();
    });

   // Global variables for Firefox footer (keeping your original structure)
    let navigationHistory = [];
    let currentHistoryIndex = -1;
    let currentGameUrl = '';

    // Tab Management System
    class GameTabManager {
      constructor() {
        this.tabs = new Map();
        this.activeTabId = null;
        this.nextTabId = 1;
        this.MAX_TABS = 10;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadTabsFromCookies();
        
        if (this.tabs.size === 0) {
          this.showEmptyState();
        }
      }

// Add these methods to your GameTabManager class

refreshCurrentTab() {
  const tab = this.tabs.get(this.activeTabId);
  if (!tab || !tab.iframe) return;
  
  // Show loading spinner while refreshing
  this.showLoading();
  
  // Refresh the iframe by reloading its src
  const currentSrc = tab.iframe.src;
  if (currentSrc) {
    tab.iframe.src = '';
    setTimeout(() => {
      tab.iframe.src = currentSrc;
    }, 100);
  }
}

toggleFullscreen() {
  const tab = this.tabs.get(this.activeTabId);
  if (!tab || !tab.iframe) return;

  const elem = tab.iframe;
  const icon = this.fullscreenBtn?.querySelector('i');

  if (!document.fullscreenElement) {
    // Enter fullscreen
    elem.requestFullscreen()
      .then(() => {
        if (icon) {
          icon.classList.remove('fa-expand');
          icon.classList.add('fa-compress');
        }
        this.fullscreenBtn?.setAttribute('aria-pressed', 'true');
        this.showNotification('Fullscreen enabled');
      })
      .catch(err => {
        console.error('Fullscreen error:', err);
        this.showNotification('Could not enter fullscreen');
      });
  } else {
    // Exit fullscreen
    document.exitFullscreen()
      .then(() => {
        if (icon) {
          icon.classList.remove('fa-compress');
          icon.classList.add('fa-expand');
        }
        this.fullscreenBtn?.setAttribute('aria-pressed', 'false');
        this.showNotification('Fullscreen disabled');
      })
      .catch(err => {
        console.error('Exit fullscreen error:', err);
      });
  }
}

      initializeElements() {
        this.modal = document.getElementById('game-modal');
        this.tabBar = document.getElementById('tab-bar');
        this.iframeContainer = document.getElementById('iframe-container');
        this.emptyState = document.getElementById('empty-state');
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.loadingOverlay = document.getElementById('modal-loading-overlay');
        this.exitMessage = document.getElementById('exit-message');
        this.gameSelectionScreen = document.getElementById('game-selection-screen');
        this.gameSelectionGrid = document.getElementById('game-selection-grid');
        this.gameSelectionSearch = document.getElementById('game-selection-search');
        this.modalProgress = document.getElementById('modal-progress');
        this.modalProgressBar = document.getElementById('modal-progress-bar');

        // Firefox footer elements
        this.backBtn = document.getElementById('back-btn');
        this.forwardBtn = document.getElementById('forward-btn');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.urlBar = document.getElementById('url-bar');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.openNewTabBtn = document.getElementById('open-new-tab-btn');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.newTabBtn = document.getElementById('new-tab-btn');
        this.closeAllBtn = document.getElementById('close-all-tabs-btn');
        this.keepAliveToggle = document.getElementById('keep-alive-toggle');
        this.modalHelper = document.querySelector('.modal-helper-text');

  // Session/action buttons removed on apps page
      }

      setupEventListeners() {
        // Modal controls
        this.closeModalBtn?.addEventListener('click', () => this.closeModal());
        this.newTabBtn?.addEventListener('click', () => this.createNewTab());
        this.closeAllBtn?.addEventListener('click', () => this.closeAllTabs());
        
        // Firefox navigation
        this.backBtn?.addEventListener('click', () => this.navigateBack());
        this.forwardBtn?.addEventListener('click', () => this.navigateForward());
        this.refreshBtn?.addEventListener('click', () => this.refreshCurrentTab());
        this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
        this.openNewTabBtn?.addEventListener('click', () => this.openInNewWindow());

        // Removed handlers for session/action buttons (upload/export/text editor/import)

        // Keep alive toggle
        this.keepAliveToggle?.addEventListener('click', () => this.toggleKeepAlive());
        
        // Game selection search
        this.gameSelectionSearch?.addEventListener('input', (e) => {
          this.filterGameSelection(e.target.value);
        });
        
        // Disable click-outside-to-close: no backdrop click closes the modal

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
          if (!this.modal?.classList.contains('active')) return;
          
          // If an iframe is focused, don't intercept keyboard events
          if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
            return;
          }
          
          // Only handle shortcuts when NOT typing in the URL bar or search
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
          }
          
          if (e.key === 'Escape') {
            this.closeModal();
          } else if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
              case 't':
                e.preventDefault();
                this.createNewTab();
                break;
              case 'w':
                e.preventDefault();
                if (this.activeTabId) this.closeTab(this.activeTabId);
                break;
              case 'r':
                e.preventDefault();
                this.refreshCurrentTab();
                break;
            }
          }
        });

        // Mouse tracking for exit message
        this.setupExitMessage();
      }

      closeAllTabs() {
        const ids = Array.from(this.tabs.keys());
        ids.forEach(id => this.closeTab(id));
        this.showEmptyState();
        this.saveTabsToCookies();
      }

      setupExitMessage() { /* disabled */ }

      updateExitMessagePosition(e) {
        if (this.exitMessage) {
          this.exitMessage.style.left = e.clientX + 'px';
          this.exitMessage.style.top = e.clientY + 'px';
          // Ensure exit message doesn't capture pointer events
          this.exitMessage.style.pointerEvents = 'none';
        }
      }

      openModal(gameUrl, gameName) {
        this.modal?.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Position helper below modal when the modal opens
        this.updateModalHelperPosition(true);

        // Clear any existing URL hash to avoid white flash
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        // Disable topbar if available
        if (window.topbarControl) {
          window.topbarControl.disableTopbar();
        }

        // If no tabs exist, create the first one
        if (this.tabs.size === 0) {
          this.createTab(gameUrl, gameName);
        } else {
          // Create a new tab for the game
          this.createTab(gameUrl, gameName);
        }

        // Ensure active iframe gets focus after modal opens
        setTimeout(() => {
          const activeTab = this.tabs.get(this.activeTabId);
          if (activeTab?.iframe) {
            activeTab.iframe.contentWindow?.focus();
          }
        }, 300);
      }

      closeModal() {
        this.modal?.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Restore helper to bottom-center when modal closes
        this.updateModalHelperPosition(false);

        // Clear URL hash when closing modal
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        // Enable topbar if available
        if (window.topbarControl) {
          window.topbarControl.enableTopbar();
        }

        this.exitMessage?.classList.remove('show');

        // Pause all non-keep-alive games
        this.tabs.forEach(tab => {
          if (!tab.keepAlive && tab.iframe) {
            tab.iframe.style.display = 'none';
          }
        });

        // Clear iframe after animation (keeping your original logic)
        setTimeout(() => {
          this.tabs.forEach(tab => {
            if (tab.iframe && !tab.keepAlive) {
              tab.iframe.src = '';
            }
          });
        }, 300);
      }

      // Position the modal helper; when modalOpen=true move it to be a sibling under the
      // modal content (so it doesn't overlay the iframe). When modalOpen=false make it
      // fixed bottom-center again.
      updateModalHelperPosition(modalOpen) {
        if (!this.modalHelper) return;
        if (modalOpen) {
          // Make helper a normal flow element inside the modal so it sits below content
          this.modalHelper.style.position = 'relative';
          this.modalHelper.style.left = 'auto';
          this.modalHelper.style.bottom = 'auto';
          this.modalHelper.style.transform = 'none';
          this.modalHelper.style.zIndex = '2100';
          // Ensure it's visually placed below the modal content - rely on .game-modal flex column
          // If the helper isn't already a child of the modal, move it there
          if (this.modal && this.modalHelper.parentElement !== this.modal) {
            this.modal.appendChild(this.modalHelper);
          }
        } else {
          // Reset to fixed bottom-center in the viewport
          this.modalHelper.style.position = 'fixed';
          this.modalHelper.style.left = '50%';
          this.modalHelper.style.bottom = '18px';
          this.modalHelper.style.transform = 'translateX(-50%)';
          this.modalHelper.style.zIndex = '3000';
          // If helper is inside modal, move it back to be direct child of body so it's visible when modal closed
          if (this.modal && this.modalHelper.parentElement === this.modal) {
            document.body.appendChild(this.modalHelper);
          }
        }
      }

      createNewTab() {
        if (this.tabs.size >= this.MAX_TABS) {
          this.showNotification('Tabs are Limited to 10 Tabs Only');
          return null;
        }
        const tabId = this.nextTabId++;
        
        // Create tab element
        const tabElement = document.createElement('div');
        tabElement.className = 'game-tab';
        tabElement.dataset.tabId = tabId;
        tabElement.innerHTML = `
          <div class="tab-title">New Tab</div>
          <button class="tab-close" title="Close tab">
            <i class="fas fa-times"></i>
          </button>
        `;

        // Add tab event listeners
        tabElement.addEventListener('click', (e) => {
          if (!e.target.closest('.tab-close')) {
            this.switchToTab(tabId);
          }
        });

        tabElement.querySelector('.tab-close')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeTab(tabId);
        });

        // Insert tab before the new tab button
        this.tabBar?.insertBefore(tabElement, this.newTabBtn);

        // Create tab data for game selection
        const tab = {
          id: tabId,
          url: null,
          name: 'New Tab',
          element: tabElement,
          iframe: null,
          keepAlive: false,
          loaded: false,
          isGameSelection: true
        };

        this.tabs.set(tabId, tab);
        this.switchToTab(tabId);
  // Hide the empty state and show iframe area
  this.hideEmptyState();
  try { iframe.classList.add('active'); iframe.style.display = 'block'; } catch (e) {}

        return tabId;
      }

      createTab(gameUrl, gameName) {
        if (this.tabs.size >= this.MAX_TABS) {
          this.showNotification('Tabs are Limited to 10 Tabs Only');
          return null;
        }
        const tabId = this.nextTabId++;
        
  // Create iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'game-iframe';
  // set src after onload hookup to avoid races in some browsers
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.scrolling = 'yes';
        iframe.allow = 'fullscreen; gamepad; microphone; camera';
        iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-fullscreen allow-downloads allow-modals allow-popups';
        iframe.setAttribute('tabindex', '0');
        
        // Add click listener to iframe container to ensure focus
        iframe.addEventListener('load', () => {
          iframe.addEventListener('click', () => {
            iframe.contentWindow?.focus();
          });
        });
        
        
        // Create tab element
        const tabElement = document.createElement('div');
        tabElement.className = 'game-tab';
        tabElement.dataset.tabId = tabId;
        tabElement.innerHTML = `
          <div class="tab-title">${gameName}</div>
          <button class="tab-close" title="Close tab">
            <i class="fas fa-times"></i>
          </button>
        `;

        // Add tab event listeners
        tabElement.addEventListener('click', (e) => {
          if (!e.target.closest('.tab-close')) {
            this.switchToTab(tabId);
          }
        });

        tabElement.querySelector('.tab-close')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeTab(tabId);
        });

  // Insert tab before the new tab button
        this.tabBar?.insertBefore(tabElement, this.newTabBtn);
        this.iframeContainer?.appendChild(iframe);

        // Create tab data
        const tab = {
          id: tabId,
          url: gameUrl,
          name: gameName,
          element: tabElement,
          iframe: iframe,
          keepAlive: false, // Default to false - games will freeze when not active
          loaded: false,
          isGameSelection: false
        };

        this.tabs.set(tabId, tab);
        this.switchToTab(tabId);
        this.hideEmptyState();

        // Setup iframe loading
        console.log('[GameTabManager] createTab:', { tabId, gameName, gameUrl });
        // Attach onload before assigning src where possible
        iframe.onload = () => {
          tab.loaded = true;
          this.hideLoading();
        };
        this.showLoading();
        // assign src last
        try { iframe.src = gameUrl; } catch (e) { console.error('Error setting iframe.src', e); }

        // Add to navigation history (keeping your original function)
        this.addToHistory(gameName, gameUrl);

        // Save tabs to cookies
        this.saveTabsToCookies();

        return tabId;
      }

      switchToTab(tabId, updateHash = true) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;

        // Hide current active tab
        if (this.activeTabId && this.activeTabId !== tabId) {
          const currentTab = this.tabs.get(this.activeTabId);
          if (currentTab) {
            currentTab.element.classList.remove('active');
            if (currentTab.isGameSelection) {
              this.gameSelectionScreen.classList.remove('active');
            } else if (currentTab.iframe) {
              if (currentTab.keepAlive) {
                // Keep iframe loaded but hidden
                currentTab.iframe.style.display = 'none';
              } else {
                // Freeze the game by removing src (saves resources)
                currentTab.iframe.style.display = 'none';
                if (currentTab.loaded) {
                  currentTab.iframe.dataset.frozenSrc = currentTab.url; // Store the original game URL, not current src
                  currentTab.iframe.src = '';
                }
              }
            }
          }
        }

        // Show new active tab
        this.activeTabId = tabId;
        tab.element.classList.add('active');
        
        if (tab.isGameSelection) {
          // Show game selection screen
          this.gameSelectionScreen.classList.add('active');
          this.loadGameSelection();
          // Clear hash for new tab only if updateHash is true
          if (updateHash && window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        } else if (tab.iframe) {
          // Do not update URL hash to avoid flash
          
          // Handle iframe display
          if (tab.keepAlive || !tab.loaded) {
            // Show iframe directly if keep-alive or still loading
            tab.iframe.style.display = 'block';
          } else if (tab.iframe.dataset.frozenSrc) {
            // Restore frozen game - always use the stored game URL
            this.showLoading();
            const gameUrl = tab.iframe.dataset.frozenSrc;
            tab.iframe.src = ''; // Clear first
            setTimeout(() => {
              tab.iframe.src = gameUrl; // Then reload with correct URL
              tab.iframe.style.display = 'block';
              // Force focus to iframe after it loads
              tab.iframe.onload = () => {
                tab.loaded = true;
                this.hideLoading();
                setTimeout(() => {
                  tab.iframe.contentWindow?.focus();
                }, 100);
              };
            }, 50);
            delete tab.iframe.dataset.frozenSrc;
          } else {
            tab.iframe.style.display = 'block';
            // Ensure iframe has focus
            setTimeout(() => {
              tab.iframe.contentWindow?.focus();
            }, 100);
          }
        }

        // Update URL bar and keep-alive indicator
        this.updateUrlBar(tab.name);
        this.updateKeepAliveIndicator(tab.keepAlive);
        this.updateNavigationButtons();
        this.hideEmptyState();
      }

      loadGameSelection() {
        // Show loading state
        if (this.gameSelectionGrid) {
          this.gameSelectionGrid.innerHTML = `
            <div class="game-selection-loading" style="grid-column: 1 / -1;">
              <i class="fas fa-spinner"></i>
              <p>Loading games...</p>
            </div>
          `;
        }

        // Load games from your games.js
        if (typeof gamesData !== 'undefined' && this.gameSelectionGrid) {
          this.renderGameSelection(gamesData);
        } else {
          // Try to load games after a short delay
          setTimeout(() => {
            if (typeof gamesData !== 'undefined') {
              this.renderGameSelection(gamesData);
            } else {
              this.gameSelectionGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #9ca3af;">
                  <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 16px;"></i>
                  <p>Apps not loaded yet. Please try refreshing.</p>
                </div>
              `;
            }
          }, 1000);
        }
      }

      renderGameSelection(games) {
        if (!this.gameSelectionGrid || !games) return;

        // Apply category filter to selection view as well
        const selectionGames = selectedCategory && selectedCategory !== 'All'
          ? games.filter(g => (Array.isArray(g.categories) ? g.categories.includes(selectedCategory) : g.category === selectedCategory))
          : games;

        if (selectionGames.length === 0) {
          this.gameSelectionGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #9ca3af;">
              <p>No games found matching your search.</p>
            </div>
          `;
          return;
        }
        const gameCards = selectionGames.map(game => {
          const safeName = game.name.replace(/'/g, "\\'").replace(/"/g, '\\"');
          const safeUrl = game.url.replace(/'/g, "\\'").replace(/"/g, '\\"');
          
          return `
            <div class="game-selection-card" onclick="gameTabManager.selectGameFromSelection('${safeUrl}', '${safeName}')">
              ${game.image ? `<img src="${game.image}" alt="${safeName}" loading="lazy">` : `<div style="width: 100%; height: 80px; background: linear-gradient(45deg, #4a5568, #2d3748); border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-gamepad" style="font-size: 24px; color: #9ca3af;"></i></div>`}
              <h3>${game.name}</h3>
              <p>Click to open</p>
            </div>
          `;
        }).join('');

        this.gameSelectionGrid.innerHTML = gameCards;

        // Add click event listeners as backup
        const cards = this.gameSelectionGrid.querySelectorAll('.game-selection-card');
        cards.forEach((card, index) => {
          card.addEventListener('click', () => {
            const game = games[index];
            if (game) {
              this.selectGameFromSelection(game.url, game.name);
            }
          });
        });

        // Add favorite button to each selection card and update state
        cards.forEach((card, index) => {
          const game = games[index];
          if (!game) return;

          // Create fav btn
          const favBtn = document.createElement('button');
          favBtn.className = 'favorite-btn';
          // start with outlined heart
          favBtn.innerHTML = '<i class="far fa-heart"></i>';
          favBtn.title = isFavorited(game) ? 'Remove from favorites' : 'Add to favorites';
          if (isFavorited(game)) {
            favBtn.classList.add('active');
            const icon = favBtn.querySelector('i');
            if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
          }

          favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(game);
            const nowFav = isFavorited(game);
            favBtn.classList.toggle('active', nowFav);
            favBtn.title = nowFav ? 'Remove from favorites' : 'Add to favorites';
            const icon = favBtn.querySelector('i');
            if (icon) {
              if (nowFav) { icon.classList.remove('far'); icon.classList.add('fas'); }
              else { icon.classList.remove('fas'); icon.classList.add('far'); }
            }
          });

          // insert into card (position relative required)
          card.style.position = 'relative';
          card.appendChild(favBtn);
        });
      }

      filterGameSelection(searchQuery) {
        if (typeof gamesData === 'undefined') return;

        const filteredGames = gamesData.filter(game => 
          game.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        this.renderGameSelection(filteredGames);
      }

      selectGameFromSelection(gameUrl, gameName) {
        if (!this.activeTabId) return;

        const tab = this.tabs.get(this.activeTabId);
        if (!tab || !tab.isGameSelection) return;

        // Convert the game selection tab to a game tab
        tab.url = gameUrl;
        tab.name = gameName;
        tab.isGameSelection = false;
        tab.keepAlive = false;
        tab.loaded = false;

        // Update tab title
        const tabTitle = tab.element.querySelector('.tab-title');
        if (tabTitle) {
          tabTitle.textContent = gameName;
        }

  // Do not update URL hash to avoid flash

  // Create and setup iframe
  const iframe = document.createElement('iframe');
  iframe.className = 'game-iframe active';
  iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.scrolling = 'yes';
        iframe.allow = 'fullscreen; gamepad; microphone; camera';
        iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-fullscreen allow-downloads allow-modals allow-popups';
        iframe.setAttribute('tabindex', '0');

        // Add click listener to ensure focus
        iframe.addEventListener('load', () => {
          iframe.addEventListener('click', () => {
            iframe.contentWindow?.focus();
          });
        });

  tab.iframe = iframe;
  this.iframeContainer?.appendChild(iframe);

  // Hide game selection screen
  this.gameSelectionScreen.classList.remove('active');

  // Ensure empty state is hidden and iframe area is visible
  this.hideEmptyState();
  try {
    iframe.classList.add('active');
    iframe.style.display = 'block';
  } catch (e) { /* ignore if DOM not ready */ }

        // Setup loading: attach onload before assigning src, then set src
        iframe.onload = () => {
          tab.loaded = true;
          this.hideLoading();
        };
        this.showLoading();
        try { iframe.src = gameUrl; } catch (e) { console.error('Error assigning iframe.src in selectGameFromSelection', e); }

        // Update UI
        this.updateUrlBar(gameName);
        this.updateKeepAliveIndicator(tab.keepAlive);
        this.addToHistory(gameName, gameUrl);
        
        // Save tabs to cookies
        this.saveTabsToCookies();
      }

      closeTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;

        // Remove elements
        tab.element.remove();
        if (tab.iframe) {
          tab.iframe.remove();
        }
        this.tabs.delete(tabId);

        // Switch to another tab if this was active
        if (this.activeTabId === tabId) {
          this.activeTabId = null;
          
          // Find another tab to switch to
          const remainingTabs = Array.from(this.tabs.keys());
          if (remainingTabs.length > 0) {
            this.switchToTab(remainingTabs[remainingTabs.length - 1]);
          } else {
            this.showEmptyState();
            this.updateUrlBar('');
            this.updateKeepAliveIndicator(false);
            this.gameSelectionScreen.classList.remove('active');
          }
        }

        // Close modal if no tabs remain
        if (this.tabs.size === 0) {
          this.showEmptyState();
        }

        // Save tabs to cookies
        this.saveTabsToCookies();
      }

      // Cookie management functions
      saveTabsToCookies() {
        const tabData = [];
        this.tabs.forEach((tab, id) => {
          if (!tab.isGameSelection && tab.url) {
            tabData.push({
              id: id,
              url: tab.url,
              name: tab.name,
              keepAlive: tab.keepAlive,
              isActive: id === this.activeTabId
            });
          }
        });
        
        localStorage.setItem('gameTabsData', JSON.stringify(tabData));
        localStorage.setItem('nextTabId', this.nextTabId.toString());
      }

      loadTabsFromCookies() {
        try {
          const tabData = JSON.parse(localStorage.getItem('gameTabsData') || '[]');
          const savedNextTabId = localStorage.getItem('nextTabId');
          
          if (savedNextTabId) {
            this.nextTabId = parseInt(savedNextTabId);
          }

          let activeTabFound = false;
          
          tabData.forEach(savedTab => {
            if (this.tabs.size >= this.MAX_TABS) return; // respect max tabs on restore
            if (savedTab.url && savedTab.name) {
              const tabId = this.createTabFromSave(savedTab.url, savedTab.name, savedTab.keepAlive, savedTab.id);
              if (savedTab.isActive && !activeTabFound) {
                // Don't update hash when restoring tabs - use updateHash=false
                this.switchToTab(tabId, false);
                activeTabFound = true;
              }
            }
          });

          // If tabs were loaded but no active tab found, activate the last one
          if (this.tabs.size > 0 && !activeTabFound) {
            const tabIds = Array.from(this.tabs.keys());
            // Don't update hash when restoring tabs - use updateHash=false
            this.switchToTab(tabIds[tabIds.length - 1], false);
          }
          
          // Don't auto-update hash when loading from cookies - let checkUrlHash handle it
        } catch (error) {
          console.log('Error loading tabs from cookies:', error);
        }
      }

      createTabFromSave(gameUrl, gameName, keepAlive, savedId) {
        if (this.tabs.size >= this.MAX_TABS) {
          this.showNotification('Tabs are Limited to 10 Tabs Only');
          return null;
        }
        const tabId = savedId || this.nextTabId++;
        if (savedId >= this.nextTabId) {
          this.nextTabId = savedId + 1;
        }
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'game-iframe';
        iframe.src = gameUrl;
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.scrolling = 'yes';
        iframe.allow = 'fullscreen; gamepad; microphone; camera';
        iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-fullscreen allow-downloads allow-modals allow-popups';
        iframe.setAttribute('tabindex', '0');
        
        // Add click listener to ensure focus
        iframe.addEventListener('load', () => {
          iframe.addEventListener('click', () => {
            iframe.contentWindow?.focus();
          });
        });
        
        // Create tab element
        const tabElement = document.createElement('div');
        tabElement.className = 'game-tab';
        tabElement.dataset.tabId = tabId;
        tabElement.innerHTML = `
          <div class="tab-title">${gameName}</div>
          <button class="tab-close" title="Close tab">
            <i class="fas fa-times"></i>
          </button>
        `;

        // Add tab event listeners
        tabElement.addEventListener('click', (e) => {
          if (!e.target.closest('.tab-close')) {
            this.switchToTab(tabId);
          }
        });

        tabElement.querySelector('.tab-close')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeTab(tabId);
        });

        // Insert tab before the new tab button
        this.tabBar?.insertBefore(tabElement, this.newTabBtn);
        this.iframeContainer?.appendChild(iframe);

        // Create tab data
        const tab = {
          id: tabId,
          url: gameUrl,
          name: gameName,
          element: tabElement,
          iframe: iframe,
          keepAlive: keepAlive || false,
          loaded: false,
          isGameSelection: false
        };

        this.tabs.set(tabId, tab);

        // Setup iframe loading
        iframe.onload = () => {
          tab.loaded = true;
          if (this.activeTabId === tabId) {
            this.hideLoading();
          }
        };

        return tabId;
      }

      toggleKeepAlive() {
        if (!this.activeTabId) return;

        const tab = this.tabs.get(this.activeTabId);
        if (!tab || tab.isGameSelection) return;

        tab.keepAlive = !tab.keepAlive;
        this.updateKeepAliveIndicator(tab.keepAlive);

        const status = tab.keepAlive ? 'will stay loaded' : 'will freeze when switching tabs';
        this.showNotification(`"${tab.name}" ${status}`);
        
        // Save tabs to cookies
        this.saveTabsToCookies();
      }

      updateKeepAliveIndicator(keepAlive) {
        if (!this.keepAliveToggle) return;

        // Use play/pause icons instead of text, update aria-pressed
        let icon = this.keepAliveToggle.querySelector('.keep-alive-icon');
        if (!icon) {
          // create icon element if missing
          icon = document.createElement('i');
          icon.className = 'keep-alive-icon fas';
          this.keepAliveToggle.insertBefore(icon, this.keepAliveToggle.firstChild);
        }

        if (keepAlive) {
          this.keepAliveToggle.classList.remove('inactive');
          this.keepAliveToggle.classList.add('active');
          this.keepAliveToggle.title = 'Game stays loaded (click to allow freezing)';
          icon.classList.remove('fa-play');
          icon.classList.add('fa-pause');
          this.keepAliveToggle.setAttribute('aria-pressed', 'true');
        } else {
          this.keepAliveToggle.classList.remove('active');
          this.keepAliveToggle.classList.add('inactive');
          this.keepAliveToggle.title = 'Game freezes when not active (click to keep loaded)';
          icon.classList.remove('fa-pause');
          icon.classList.add('fa-play');
          this.keepAliveToggle.setAttribute('aria-pressed', 'false');
        }
      }

      showLoading() {
        if (this.loadingSpinner) {
          this.loadingSpinner.style.display = 'block';
        }
        if (this.loadingOverlay) {
          this.loadingOverlay.style.display = 'flex';
          this.loadingOverlay.setAttribute('aria-hidden', 'false');
        }

        // Modal progress animation (simulated). Advances to ~90% while loading.
        if (this.modalProgress && this.modalProgressBar) {
          this.modalProgress.classList.add('show');
          this.modalProgressBar.style.width = '3%';
          this._modalProgressValue = 3;
          if (this._modalProgressInterval) clearInterval(this._modalProgressInterval);
          this._modalProgressInterval = setInterval(() => {
            if (this._modalProgressValue < 90) {
              const step = 1 + Math.random() * 4;
              this._modalProgressValue = Math.min(90, this._modalProgressValue + step);
              this.modalProgressBar.style.width = this._modalProgressValue + '%';
            }
          }, 200);
        }
      }

      hideLoading() {
        if (this.loadingSpinner) {
          this.loadingSpinner.style.display = 'none';
        }
        if (this.loadingOverlay) {
          this.loadingOverlay.style.display = 'none';
          this.loadingOverlay.setAttribute('aria-hidden', 'true');
        }

        // Finish modal progress
        if (this.modalProgress && this.modalProgressBar) {
          if (this._modalProgressInterval) { clearInterval(this._modalProgressInterval); this._modalProgressInterval = null; }
          this.modalProgressBar.style.width = '100%';
          setTimeout(() => {
            this.modalProgress.classList.remove('show');
            this.modalProgressBar.style.width = '0%';
            this._modalProgressValue = 0;
          }, 220);
        }
      }

      updateUrlBar(gameName) {
        if (this.urlBar) {
          const safeName = (gameName || '').replace(/ /g, '_');
          let display;
          if (!safeName) display = 'sienna://home';
          else display = `sienna://${safeName}`;
          this.urlBar.value = display;
        }
      }

      updateNavigationButtons() {
        // Update based on your navigation history (keeping your original logic)
        if (this.backBtn) this.backBtn.disabled = currentHistoryIndex <= 0;
        if (this.forwardBtn) this.forwardBtn.disabled = currentHistoryIndex >= navigationHistory.length - 1;
      }

      showEmptyState() {
        if (this.emptyState) {
          // CSS defines .empty-state as display:flex; use flex to match layout
          this.emptyState.style.display = 'flex';
        }
        if (this.iframeContainer) {
          // hide iframe area when empty
          this.iframeContainer.style.display = 'none';
        }
        // Update URL bar and navigation when no tabs
        // Show base yellownet:// when no tab is active
        this.updateUrlBar('');
        this.updateNavigationButtons();
      }

      hideEmptyState() {
        if (this.emptyState) {
          this.emptyState.style.display = 'none';
        }
        if (this.iframeContainer) {
          this.iframeContainer.style.display = 'block';
        }
      }

      // Open the current active tab in a new window. Prefer opening an about:blank and
      // injecting a full-viewport iframe so we retain the same embedding behavior. If the
      // browser blocks the popup or injection fails, fall back to a normal window.open.
      openInNewWindow() {
        const tab = this.tabs.get(this.activeTabId);
        if (!tab || !tab.url) return;

        const gameUrl = tab.url;

        // Try to open an about:blank first (should be allowed from a user click).
        let newWin = null;
        try {
          newWin = window.open('about:blank', '_blank');
        } catch (e) {
          console.warn('[GameTabManager] window.open failed', e);
          newWin = null;
        }

        // If popup blocked or not available, fallback to direct open
        if (!newWin) {
          try { window.open(gameUrl, '_blank'); } catch (e) { console.error('[GameTabManager] fallback window.open failed', e); }
          return;
        }

        // Try to write a small injected page with a full-size iframe. This can fail if
        // the browser blocks document.write on about:blank or due to CSP restrictions.
        try {
          const safeTitle = (tab.name || 'Night Game').replace(/"/g, '');
          const injected = `<!doctype html><html><head><title>${safeTitle}</title><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;background:#000"><iframe src="${gameUrl}" style="position:fixed;inset:0;border:0;width:100%;height:100%;" allow="fullscreen; gamepad; microphone; camera" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-fullscreen allow-downloads allow-modals allow-popups"></iframe></body></html>`;
          newWin.document.open();
          newWin.document.write(injected);
          newWin.document.close();
        } catch (e) {
          // If injection fails, navigate the new window directly as a last resort
          try {
            newWin.location.href = gameUrl;
          } catch (err) {
            console.error('[GameTabManager] could not inject iframe into about:blank nor navigate it', err);
            // Final fallback: open another window directly
            try { window.open(gameUrl, '_blank'); } catch (err2) { console.error('[GameTabManager] final fallback failed', err2); }
          }
        }
      }

      addToHistory(gameName, gameUrl) {
        // Remove any forward history if we're not at the end (keeping your original logic)
        if (currentHistoryIndex < navigationHistory.length - 1) {
          navigationHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
        }
        
        navigationHistory.push({ name: gameName, url: gameUrl });
        currentHistoryIndex = navigationHistory.length - 1;
        this.updateNavigationButtons();
      }

      showNotification(message) {
        // Use your existing notification function
        if (typeof showNotification === 'function') {
          showNotification(message);
        } else {
          console.log('Notification:', message);
        }
      }

      // gatherSessionData removed along with export session feature

      // Basic history navigation between tabs
      navigateBack() {
        if (currentHistoryIndex <= 0) return;
        currentHistoryIndex--;
        const entry = navigationHistory[currentHistoryIndex];
        if (!entry) return;
        let existingId = null;
        this.tabs.forEach((tab, id) => {
          if (!tab.isGameSelection && tab.name.toLowerCase() === entry.name.toLowerCase()) {
            existingId = id;
          }
        });
        if (existingId) {
          this.switchToTab(existingId);
        } else {
          this.createTab(entry.url, entry.name);
        }
        this.updateNavigationButtons();
      }

      navigateForward() {
        if (currentHistoryIndex >= navigationHistory.length - 1) return;
        currentHistoryIndex++;
        const entry = navigationHistory[currentHistoryIndex];
        if (!entry) return;
        let existingId = null;
        this.tabs.forEach((tab, id) => {
          if (!tab.isGameSelection && tab.name.toLowerCase() === entry.name.toLowerCase()) {
            existingId = id;
          }
        });
        if (existingId) {
          this.switchToTab(existingId);
        } else {
          this.createTab(entry.url, entry.name);
        }
        this.updateNavigationButtons();
      }
    }

    // Initialize the tab manager
    const gameTabManager = new GameTabManager();
    // Ensure the modal helper is positioned correctly initially
    try {
      gameTabManager.updateModalHelperPosition(!!(gameTabManager.modal && gameTabManager.modal.classList.contains('active')));
    } catch (e) { /* ignore */ }

    // Check URL hash on page load to auto-open games
    function checkUrlHash() {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const gameNameFromHash = decodeURIComponent(hash.substring(1)).replace(/_/g, ' '); // Remove # and replace _ with spaces
        
        // Wait for games data to load
        const checkGamesData = setInterval(() => {
          if (typeof gamesData !== 'undefined' && gamesData.length > 0) {
            clearInterval(checkGamesData);
            
            // Find the game by name (case-insensitive)
            const game = gamesData.find(g => 
              g.name.toLowerCase() === gameNameFromHash.toLowerCase()
            );
            
            if (game) {
              // Check if game is already open in a tab
              let existingTabId = null;
              gameTabManager.tabs.forEach((tab, id) => {
                if (!tab.isGameSelection && tab.name.toLowerCase() === game.name.toLowerCase()) {
                  existingTabId = id;
                }
              });

              if (existingTabId) {
                // Switch to existing tab without updating hash (avoid loop)
                gameTabManager.switchToTab(existingTabId, false);
                if (!gameTabManager.modal.classList.contains('active')) {
                  gameTabManager.modal.classList.add('active');
                  document.body.style.overflow = 'hidden';
                  if (window.topbarControl) {
                    window.topbarControl.disableTopbar();
                  }
                }
              } else {
                // Open the game in a new tab
                openGameModal(game.url, game.name);
              }
            }
          }
        }, 100);
        
        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(checkGamesData), 5000);
      }
    }

    // Check hash on page load
    window.addEventListener('load', checkUrlHash);

    // Also check if hash changes while page is open
    window.addEventListener('hashchange', checkUrlHash);

    // Enhanced openGameModal function (keeping your original structure)
    function openGameModal(gameUrl, gameName) {
      currentGameUrl = gameUrl;
      gameTabManager.openModal(gameUrl, gameName);
    }

    // Enhanced closeGameModal function (keeping your original structure) 
    function closeGameModal() {
      gameTabManager.closeModal();
    }

    // Compatibility functions (keeping your original API)
    function openModal(gameUrl, gameTitle) {
      openGameModal(gameUrl, gameTitle);
    }

    function closeModal() {
      closeGameModal();
    }

    function toggleFullscreen() {
      gameTabManager.toggleFullscreen();
    }

    // Function to show a notification (keeping your original function)
    function showNotification(message) {
      let notificationContainer = document.getElementById('notification-container');
      if (!notificationContainer) {
        // Create a fallback container inside the modal so notifications are in-modal
        const modalContent = document.querySelector('#game-modal .game-modal-content') || document.getElementById('game-modal');
        if (modalContent) {
          notificationContainer = document.createElement('div');
          notificationContainer.id = 'notification-container';
          modalContent.appendChild(notificationContainer);
        }
      }

      if (!notificationContainer) {
        console.log('Notification:', message);
        return;
      }

      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.innerHTML = `
        <div>${message}</div>
        <div class="close-btn"></div>
        <div class="timer-bar"></div>
      `;

      const closeBtn = notification.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          notification.remove();
        });
      }

      setTimeout(() => {
        notification.remove();
      }, 4000);

      notificationContainer.appendChild(notification);
    }

    // Handle fullscreen change events (keeping your original logic)
    document.addEventListener('fullscreenchange', () => {
      const icon = document.querySelector('#fullscreen-btn i');
      if (icon && !document.fullscreenElement) {
        icon.className = 'fas fa-expand';
      }
    });

    // Event listeners for modal controls (keeping your original compatibility)
    const legacyCloseBtn = document.getElementById('close-modal');
    if (legacyCloseBtn) {
      legacyCloseBtn.addEventListener('click', closeGameModal);
    }
    
    // Close modal when clicking outside (keeping your original logic)
    const modal = document.getElementById('game-modal');
    if (modal) {
      // Disable backdrop click-to-close
      // Keep favorites UI up to date
      try { renderFavorites(); } catch (e) { /* noop */ }
    }

    // Close modal with Escape key (keeping your original logic)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('active')) {
        // Only close if not focused on an iframe
        if (document.activeElement && document.activeElement.tagName !== 'IFRAME') {
          closeGameModal();
        }
      }
    });

    // Instant search functionality (keeping your original logic)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.toLowerCase();
        if (typeof gamesData !== 'undefined' && typeof renderGames === 'function') {
          const filteredGames = gamesData.filter(game => game.name.toLowerCase().includes(searchQuery));
          renderGames(filteredGames);
        }
      });
    }

    // Preload some assets or data if needed
    // Example: Preload favorite game images
    document.addEventListener('DOMContentLoaded', () => {
      const favGames = favorites.map(name => games.find(g => g.name === name)).filter(Boolean);
      favGames.forEach(game => {
        if (game.image) {
          const img = new Image();
          img.src = game.image;
        }
      });
    });

