const subscriptionBadge = document.getElementById('subscriptionBadge');
const balanceBadge = document.getElementById('balanceBadge');
const uploadButton = document.getElementById('uploadButton');
const uploadHint = document.getElementById('uploadHint');
const gallery = document.getElementById('gallery');
const monthlyButton = document.getElementById('monthlyButton');
const yearlyButton = document.getElementById('yearlyButton');
const itemTitle = document.getElementById('itemTitle');
const itemDescription = document.getElementById('itemDescription');
const itemFile = document.getElementById('itemFile');
const itemPrice = document.getElementById('itemPrice');
const itemFileType = document.getElementById('itemFileType');
const searchInput = document.getElementById('searchInput');
const clearSearchButton = document.getElementById('clearSearchButton');
const searchResults = document.getElementById('searchResults');
const categoryList = document.getElementById('categoryList');
const creatorGrid = document.getElementById('creatorGrid');

const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signOutButton = document.getElementById('signOutButton');
const accountStatus = document.getElementById('accountStatus');
const accountHint = document.getElementById('accountHint');
const createAccountTab = document.getElementById('createAccountTab');
const signInTab = document.getElementById('signInTab');
const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');
const userNameInput = document.getElementById('userName');
const userPasswordInput = document.getElementById('userPassword');
const signUpSubmit = document.getElementById('signUpSubmit');
const signInNicknameInput = document.getElementById('signInNickname');
const signInPasswordInput = document.getElementById('signInPassword');
const signInSubmit = document.getElementById('signInSubmit');

const STORAGE_KEY = 'pixelbay_state';
const ACCOUNTS_STORAGE_KEY = 'pixelbay_accounts';
const SESSION_STORAGE_KEY = 'pixelbay_session';
const MAX_STORED_UPLOAD_SIZE = 3 * 1024 * 1024; // allow up to 3MB data URLs in storage

const user = {
  signedIn: false,
  name: null,
  email: null,
  subscribed: false,
  subscriptionType: null,
  expiry: null,
};

let uploadedItems = [];
let marketplaceItems = [];
let accountUploads = {};
let accountMarketplaceItems = {};
let registeredUsers = {};
let accountBalances = {};
let activeAuthMode = 'create';
let selectedCategory = 'All';

const marketplaceCategories = ['All', 'Image', 'Template', 'Audio', 'Vector', 'Motion', 'Font', 'UI Kit', 'Other'];
const featuredCreators = [
  {
    name: '@pixelcraft',
    tagline: 'Pixel art and modern UI collections',
    items: '38 items',
    rating: '4.9 ★',
  },
  {
    name: '@designhub',
    tagline: 'Minimal templates, landing pages, and mockups',
    items: '24 items',
    rating: '4.8 ★',
  },
  {
    name: '@soundbyte',
    tagline: 'Royalty-free sound packs and motion audio',
    items: '18 items',
    rating: '4.7 ★',
  },
  {
    name: '@iconify',
    tagline: 'Scalable icon sets and vector bundles',
    items: '46 items',
    rating: '4.9 ★',
  },
];

const featuredMarketplaceItems = [
  {
    title: 'Pixel Sunrise Background',
    description: '4K digital wallpaper with vibrant gradients and clean geometry.',
    price: '$4.99',
    seller: '@pixelcraft',
    fileType: 'Image',
    filename: 'pixel-sunrise-background.png',
    downloadUrl: 'data:text/plain;base64,SGVsbG8sIHRoaXMgaXMgYSBzYW1wbGUgbWFya2V0cGxhY2UgaXRlbS4=',
  },
  {
    title: 'Minimal Web Template',
    description: 'A lightweight HTML/CSS template for landing pages and portfolios.',
    price: '$8.99',
    seller: '@designhub',
    fileType: 'Template',
    filename: 'minimal-web-template.zip',
    downloadUrl: 'data:text/plain;base64,VGhpcyBpcyBhIHNhbXBsZSBmaWxlIGZvciB0aGUgd2ViIHRlbXBsYXRlLg==',
  },
  {
    title: 'Abstract Sound Pack',
    description: '20 royalty-free loops and FX for videos, promos, and games.',
    price: '$12.50',
    seller: '@soundbyte',
    fileType: 'Audio',
    filename: 'abstract-sound-pack.zip',
    downloadUrl: 'data:text/plain;base64,U2FtcGxlIHNvdW5kIHBhY2sgZGF0YS4=',
  },
  {
    title: 'Vector Icon Set',
    description: 'A collection of 50 scalable icons for apps, dashboards, and presentations.',
    price: '$6.50',
    seller: '@iconify',
    fileType: 'Vector',
    tags: ['icons', 'SVG', 'UI'],
    rating: '4.9 ★',
    license: 'Standard',
    filename: 'vector-icon-set.zip',
    downloadUrl: 'data:text/plain;base64,U2FtcGxlIHZlY3RvciBpb24gc2V0IGRhdGEu',
  },
  {
    title: 'Modern Portfolio UI Kit',
    description: 'A fully responsive UI kit for designers and developers.',
    price: '$14.99',
    seller: '@designhub',
    fileType: 'UI Kit',
    tags: ['portfolio', 'responsive', 'web'],
    rating: '4.8 ★',
    license: 'Commercial',
    filename: 'portfolio-ui-kit.zip',
    downloadUrl: 'data:text/plain;base64,VGhpcyBpcyBhIG1vZGVybjBUIEtJVCBmaWxlLg==',
  },
  {
    title: 'Motion Loop Pack',
    description: 'Seamless motion graphics loops for social media and ads.',
    price: '$9.50',
    seller: '@pixelcraft',
    fileType: 'Motion',
    tags: ['video', 'animation', 'loop'],
    rating: '4.7 ★',
    license: 'Standard',
    filename: 'motion-loop-pack.zip',
    downloadUrl: 'data:text/plain;base64,TW90aW9uIGxvb3AgZGF0YS4=',
  },
  {
    title: 'Pro Font Bundle',
    description: 'Ten premium fonts for branding, headlines, and UI design.',
    price: '$11.99',
    seller: '@iconify',
    fileType: 'Font',
    tags: ['typeface', 'branding', 'creative'],
    rating: '5.0 ★',
    license: 'Commercial',
    filename: 'pro-font-bundle.zip',
    downloadUrl: 'data:text/plain;base64,UHJvIGZvbnQgYnVuZGxlIGRhdGEu',
  },
];

function cloneItems(items) {
  return items.map(item => ({ ...item }));
}

function normalizeAccountKey(value) {
  return String(value || '').trim().toLowerCase();
}

function getCurrentAccountKey() {
  return normalizeAccountKey(user.email || user.name || 'guest');
}

function hydrateRegisteredUsers() {
  try {
    const accountsRaw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (accountsRaw) {
      const parsedAccounts = JSON.parse(accountsRaw);
      if (parsedAccounts && typeof parsedAccounts === 'object') {
        registeredUsers = parsedAccounts;
      }
    }
  } catch (error) {
    console.warn('Could not hydrate accounts from browser storage.', error);
  }

  try {
    const stateRaw = localStorage.getItem(STORAGE_KEY);
    if (stateRaw) {
      const parsedState = JSON.parse(stateRaw);
      if (parsedState && parsedState.registeredUsers && typeof parsedState.registeredUsers === 'object') {
        registeredUsers = parsedState.registeredUsers;
      }
    }
  } catch (error) {
    console.warn('Could not hydrate state accounts from browser storage.', error);
  }
}

function findRegisteredAccount(email) {
  hydrateRegisteredUsers();

  const accountKey = normalizeAccountKey(email);
  if (registeredUsers[accountKey]) {
    return registeredUsers[accountKey];
  }

  const match = Object.entries(registeredUsers).find(([storedKey]) => normalizeAccountKey(storedKey) === accountKey);
  return match ? match[1] : null;
}

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function parsePriceToNumber(price) {
  if (price === null || price === undefined || price === '') {
    return 0;
  }

  if (typeof price === 'number') {
    return Number(price);
  }

  const text = String(price).trim();
  if (!text || text === 'Free' || text === '$0.00' || text === '$0') {
    return 0;
  }

  const cleaned = text.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSellerBalance(accountKey) {
  return Number(accountBalances[accountKey] || 0);
}

function setSellerBalance(accountKey, amount) {
  accountBalances[accountKey] = Number(amount || 0);
}

function addSellerEarnings(accountKey, amount) {
  setSellerBalance(accountKey, getSellerBalance(accountKey) + Number(amount || 0));
}

function setAuthMode(mode) {
  activeAuthMode = mode;
  createAccountTab.classList.toggle('active', mode === 'create');
  signInTab.classList.toggle('active', mode === 'signin');
  signUpForm.classList.toggle('hidden', mode !== 'create' || user.signedIn);
  signInForm.classList.toggle('hidden', mode !== 'signin' || user.signedIn);
}

function safeStoreInLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Could not save Pixelbay data to browser storage.', error);
  }
}

function sanitizeUploadItem(item) {
  if (!item) {
    return item;
  }

  const cleanedItem = { ...item };
  if (typeof cleanedItem.downloadUrl === 'string' && cleanedItem.downloadUrl.length > MAX_STORED_UPLOAD_SIZE) {
    cleanedItem.downloadUrl = '';
    cleanedItem.storageNote = 'Large file omitted to keep your account state stable.';
  }

  return cleanedItem;
}

function sanitizeAccountMap(data) {
  if (!data || typeof data !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.map(item => sanitizeUploadItem(item))];
      }
      return [key, value];
    })
  );
}

function saveState() {
  const state = {
    user: {
      ...user,
      expiry: user.expiry ? user.expiry.toISOString() : null,
    },
    uploadedItems: uploadedItems.map(item => sanitizeUploadItem(item)),
    marketplaceItems: marketplaceItems.map(item => sanitizeUploadItem(item)),
    accountUploads: sanitizeAccountMap(accountUploads),
    accountMarketplaceItems: sanitizeAccountMap(accountMarketplaceItems),
    registeredUsers,
    accountBalances,
  };

  safeStoreInLocalStorage(STORAGE_KEY, state);
  safeStoreInLocalStorage(ACCOUNTS_STORAGE_KEY, registeredUsers);
  safeStoreInLocalStorage(SESSION_STORAGE_KEY, {
    user: {
      ...user,
      expiry: user.expiry ? user.expiry.toISOString() : null,
    },
    accountUploads: sanitizeAccountMap(accountUploads),
    accountMarketplaceItems: sanitizeAccountMap(accountMarketplaceItems),
    accountBalances,
    marketplaceItems: marketplaceItems.map(item => sanitizeUploadItem(item)),
  });
}

function loadState() {
  hydrateRegisteredUsers();

  const raw = localStorage.getItem(STORAGE_KEY);
  const accountsRaw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const saved = JSON.parse(raw);
    if (saved.user) {
      const restoredUser = { ...saved.user };
      if (restoredUser.expiry) {
        restoredUser.expiry = new Date(restoredUser.expiry);
      }
      Object.assign(user, restoredUser);
    }
    if (Array.isArray(saved.uploadedItems)) {
      uploadedItems = saved.uploadedItems;
    }
    if (Array.isArray(saved.marketplaceItems)) {
      marketplaceItems = saved.marketplaceItems;
    }
    if (saved.accountUploads) {
      accountUploads = saved.accountUploads;
    }
    if (saved.accountMarketplaceItems) {
      accountMarketplaceItems = saved.accountMarketplaceItems;
    }
    if (saved.marketplaceItems && Array.isArray(saved.marketplaceItems)) {
      marketplaceItems = saved.marketplaceItems;
    }
    if (saved.registeredUsers) {
      registeredUsers = saved.registeredUsers;
    }
    if (saved.accountBalances) {
      accountBalances = saved.accountBalances;
    }

    if (accountsRaw) {
      try {
        const parsedAccounts = JSON.parse(accountsRaw);
        if (parsedAccounts && typeof parsedAccounts === 'object') {
          registeredUsers = parsedAccounts;
        }
      } catch (error) {
        console.warn('Could not load saved accounts.', error);
      }
    }

    if (sessionRaw) {
      try {
        const parsedSession = JSON.parse(sessionRaw);
        if (parsedSession && parsedSession.user) {
          const restoredSessionUser = { ...parsedSession.user };
          if (restoredSessionUser.expiry) {
            restoredSessionUser.expiry = new Date(restoredSessionUser.expiry);
          }
          Object.assign(user, restoredSessionUser);
        }
        if (parsedSession.accountUploads) {
          accountUploads = parsedSession.accountUploads;
        }
        if (parsedSession.accountMarketplaceItems) {
          accountMarketplaceItems = parsedSession.accountMarketplaceItems;
        }
        if (parsedSession.accountBalances) {
          accountBalances = parsedSession.accountBalances;
        }
      } catch (error) {
        console.warn('Could not load saved session.', error);
      }
    }
  } catch (error) {
    console.warn('Could not load saved Pixelbay state.', error);
  }
}

if (!marketplaceItems.length) {
  marketplaceItems = cloneItems(featuredMarketplaceItems);
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function updateUI() {
  const now = new Date();
  let active = false;
  let badgeText = 'Not subscribed';

  accountStatus.textContent = user.signedIn ? `Signed in as ${user.name}` : 'Guest';
  signUpButton.classList.toggle('hidden', user.signedIn);
  signInButton.classList.toggle('hidden', user.signedIn);
  signOutButton.classList.toggle('hidden', !user.signedIn);
  setAuthMode(user.signedIn ? 'create' : activeAuthMode);
  accountHint.textContent = user.signedIn
    ? 'Welcome back! Subscribe to unlock uploads and sell items on Pixelbay.'
    : 'Create an account to subscribe, upload, and sell items. Use your nickname and password to sign in.';

  if (user.subscribed && user.expiry && now < user.expiry) {
    active = true;
    badgeText = `Subscribed (${user.subscriptionType}) until ${formatDate(user.expiry)}`;
  } else {
    user.subscribed = false;
    user.subscriptionType = null;
    user.expiry = null;
  }

  subscriptionBadge.textContent = badgeText;
  if (balanceBadge) {
    const balanceText = user.signedIn ? `Balance: ${formatCurrency(getSellerBalance(getCurrentAccountKey()))}` : 'Balance: $0.00';
    balanceBadge.textContent = balanceText;
    balanceBadge.classList.toggle('hidden', !user.signedIn);
  }
  uploadButton.disabled = !active;
  monthlyButton.disabled = active;
  yearlyButton.disabled = active;
  uploadHint.textContent = active
    ? 'You are subscribed and can upload digital products for sale.'
    : 'Subscribe for $2.99 per month or $13.99 per year to unlock uploads.';
}

function subscribe(plan) {
  if (!user.signedIn) {
    alert('Please sign up or sign in before subscribing.');
    return;
  }

  const now = new Date();
  user.subscribed = true;
  user.subscriptionType = plan === 'yearly' ? 'Yearly' : 'Monthly';
  user.expiry = new Date(now);

  if (plan === 'yearly') {
    user.expiry.setFullYear(user.expiry.getFullYear() + 1);
  } else {
    user.expiry.setMonth(user.expiry.getMonth() + 1);
  }

  updateUI();
  saveState();
  alert(`Thank you for subscribing to the ${user.subscriptionType} plan! You can now upload items.`);
}

function isDownloadable(item) {
  return Boolean(item && item.downloadUrl);
}

function getDownloadLabel(item) {
  const priceText = item && item.price ? String(item.price).trim() : '';
  if (!priceText || priceText === 'Free' || priceText === '$0.00' || priceText === '$0') {
    return 'Download';
  }
  return `Download • ${priceText}`;
}

function renderCategoryFilters() {
  categoryList.innerHTML = '';
  marketplaceCategories.forEach(category => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `category-chip${category === selectedCategory ? ' active' : ''}`;
    chip.textContent = category;
    chip.addEventListener('click', () => {
      selectedCategory = category;
      renderCategoryFilters();
      handleSearch();
    });
    categoryList.appendChild(chip);
  });
}

function renderFeaturedCreators() {
  creatorGrid.innerHTML = '';
  featuredCreators.forEach(creator => {
    const card = document.createElement('article');
    card.className = 'creator-card';

    const heading = document.createElement('h3');
    heading.textContent = creator.name;

    const tagline = document.createElement('p');
    tagline.textContent = creator.tagline;

    const stats = document.createElement('p');
    stats.textContent = `${creator.items} · ${creator.rating}`;

    card.appendChild(heading);
    card.appendChild(tagline);
    card.appendChild(stats);
    creatorGrid.appendChild(card);
  });
}

function downloadItem(item) {
  if (!item || !item.downloadUrl) {
    alert('This item is not available for download.');
    return;
  }

  const link = document.createElement('a');
  link.href = item.downloadUrl;
  link.download = item.filename || `${(item.title || 'download').replace(/\s+/g, '-').toLowerCase()}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function createDownloadLink(item) {
  const link = document.createElement('button');
  link.type = 'button';
  link.className = 'download-link';
  link.textContent = getDownloadLabel(item);
  link.addEventListener('click', () => downloadItem(item));
  return link;
}

function syncAccountData() {
  const key = getCurrentAccountKey();
  if (!user.signedIn) {
    uploadedItems = [];
    if (!marketplaceItems.length) {
      marketplaceItems = cloneItems(featuredMarketplaceItems);
    }
    return;
  }

  if (key) {
    accountUploads[key] = uploadedItems.map(item => sanitizeUploadItem(item));
    const publicItems = uploadedItems.map(item => sanitizeUploadItem(item));
    accountMarketplaceItems[key] = publicItems;
    marketplaceItems = [...publicItems, ...marketplaceItems.filter(m => !publicItems.some(pi => pi.downloadUrl === m.downloadUrl && pi.title === m.title))];
  }
}

function loadAccountData() {
  if (!user.signedIn) {
    uploadedItems = [];
    if (!marketplaceItems.length) {
      marketplaceItems = cloneItems(featuredMarketplaceItems);
    }
    return;
  }

  const key = getCurrentAccountKey();
  uploadedItems = Array.isArray(accountUploads[key]) ? accountUploads[key].map(item => sanitizeUploadItem(item)) : [];

  if (Array.isArray(accountMarketplaceItems[key]) && accountMarketplaceItems[key].length) {
    const sharedItems = accountMarketplaceItems[key].map(item => sanitizeUploadItem(item));
    marketplaceItems = [...sharedItems, ...marketplaceItems.filter(m => !sharedItems.some(si => si.downloadUrl === m.downloadUrl && si.title === m.title))];
  }

  if (!marketplaceItems.length) {
    marketplaceItems = cloneItems(featuredMarketplaceItems);
  }
}

function createGalleryItem(item) {
  const card = document.createElement('article');
  card.className = 'gallery-card';

  const heading = document.createElement('h3');
  heading.textContent = item.title;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `File: ${item.filename}`;

  const subtitle = document.createElement('div');
  subtitle.className = 'meta-extra';
  subtitle.textContent = item.rating ? `Rating: ${item.rating} · ${item.license || 'License: Standard'}` : `${item.license || 'Standard license'}`;

  const body = document.createElement('p');
  body.textContent = item.description ? item.description : 'No description provided.';

  const footer = document.createElement('div');
  footer.className = 'meta-extra';
  footer.textContent = `${item.seller ? 'Seller: ' + item.seller + ' · ' : ''}${item.price ? item.price : 'Free'}`;

  const tagContainer = document.createElement('div');
  tagContainer.className = 'meta';
  if (Array.isArray(item.tags)) {
    item.tags.forEach(tag => {
      const tagPill = document.createElement('span');
      tagPill.className = 'tag-pill';
      tagPill.textContent = tag;
      tagContainer.appendChild(tagPill);
    });
  }

  const actions = document.createElement('div');
  actions.className = 'meta-actions';
  if (isDownloadable(item)) {
    actions.appendChild(createDownloadLink(item));
  }

  card.appendChild(heading);
  card.appendChild(meta);
  card.appendChild(subtitle);
  card.appendChild(body);
  if (tagContainer.childNodes.length) {
    card.appendChild(tagContainer);
  }
  card.appendChild(footer);
  card.appendChild(actions);

  return card;
}

function renderGalleryItems() {
  gallery.innerHTML = '';

  if (!uploadedItems.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No uploads yet. Subscribe and upload your first digital product.';
    gallery.appendChild(emptyState);
    return;
  }

  uploadedItems.forEach(item => {
    gallery.appendChild(createGalleryItem(item));
  });
}

function createPurchaseButton(item) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'download-link';
  button.textContent = `Buy • ${item.price}`;
  button.addEventListener('click', () => purchaseItem(item));
  return button;
}

function purchaseItem(item) {
  if (!item) {
    return;
  }

  const amount = parsePriceToNumber(item.price);
  if (amount <= 0) {
    if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank', 'noopener');
    }
    return;
  }

  if (!user.signedIn) {
    alert('Please sign in to purchase this item.');
    return;
  }

  const sellerKey = normalizeAccountKey(item.sellerEmail || item.sellerId || item.seller || 'seller');
  addSellerEarnings(sellerKey, amount);
  saveState();
  updateUI();

  if (item.downloadUrl) {
    downloadItem(item);
  }

  alert(`Purchase complete. ${item.seller || 'Seller'} earned ${formatCurrency(amount)}.`);
}

function createProductCard(item) {
  const card = document.createElement('article');
  card.className = 'product-card';

  const heading = document.createElement('h3');
  heading.textContent = item.title;

  const body = document.createElement('p');
  body.textContent = item.description;

  const meta = document.createElement('div');
  meta.className = 'product-meta';
  meta.textContent = `${item.fileType} · Seller: ${item.seller}`;

  const price = document.createElement('div');
  price.className = 'product-price';
  price.textContent = item.price;

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  if (isDownloadable(item)) {
    const priceValue = parsePriceToNumber(item.price);
    actions.appendChild(priceValue > 0 ? createPurchaseButton(item) : createDownloadLink(item));
  }

  card.appendChild(heading);
  card.appendChild(body);
  card.appendChild(meta);
  card.appendChild(price);
  card.appendChild(actions);

  return card;
}

function renderSearchResults(items) {
  searchResults.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No marketplace items match your search. Try a different keyword.';
    searchResults.appendChild(empty);
    return;
  }

  items.forEach(item => {
    searchResults.appendChild(createProductCard(item));
  });
}

function filterMarketplace(query) {
  const normalized = query.trim().toLowerCase();

  return marketplaceItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.fileType.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !normalized ||
      item.title.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized) ||
      item.fileType.toLowerCase().includes(normalized) ||
      item.seller.toLowerCase().includes(normalized) ||
      (Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(normalized)));

    return matchesCategory && matchesSearch;
  });
}

function handleSearch() {
  const results = filterMarketplace(searchInput.value);
  renderSearchResults(results);
}

function handleUpload() {
  const title = itemTitle.value.trim();
  const description = itemDescription.value.trim();
  const file = itemFile.files[0];
  const priceInput = itemPrice ? itemPrice.value.trim() : '';
  let fileTypeInput = itemFileType ? itemFileType.value : '';

  if (!title) {
    alert('Please enter an item title.');
    return;
  }

  if (!file) {
    alert('Please choose a file to upload.');
    return;
  }

  // normalize price input into a display string like "$4.99" or "Free"
  let price = 'Free';
  if (priceInput) {
    // remove non-numeric characters except dot
    const cleaned = priceInput.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) {
      price = `$${num.toFixed(2)}`;
    } else if (!isNaN(num) && num === 0) {
      price = 'Free';
    } else {
      // fallback to raw input if it can't be parsed
      price = priceInput;
    }
  }

  // try to detect file type from provided select or filename
  if (!fileTypeInput && file && file.name) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) fileTypeInput = 'Image';
    else if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) fileTypeInput = 'Audio';
    else if (['zip', 'rar'].includes(ext)) fileTypeInput = 'Template';
    else if (['pdf', 'ai', 'eps', 'svg'].includes(ext)) fileTypeInput = 'Vector';
    else fileTypeInput = 'Other';
  }

  const seller = user.name || user.email || 'Seller';
  const sellerId = getCurrentAccountKey();

  const reader = new FileReader();
  reader.onload = () => {
    const downloadUrl = reader.result;

    uploadedItems.unshift({
      title,
      description,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
      price,
      seller,
      sellerId,
      sellerEmail: user.email || '',
      fileType: fileTypeInput || 'Other',
      downloadUrl,
    });

    const marketplaceItem = {
      title,
      description,
      price,
      seller,
      sellerId,
      sellerEmail: user.email || '',
      fileType: fileTypeInput || 'Other',
      downloadUrl,
      filename: file.name,
    };

    marketplaceItems.unshift(marketplaceItem);
    syncAccountData();
    saveState();
    renderGalleryItems();
    renderSearchResults(marketplaceItems);

    itemTitle.value = '';
    itemDescription.value = '';
    itemFile.value = '';
    if (itemPrice) itemPrice.value = '';
    if (itemFileType) itemFileType.value = '';
    alert('Your item is uploaded and visible in the gallery.');
  };

  reader.onerror = () => {
    alert('Could not read the selected file. Please try again.');
  };

  reader.readAsDataURL(file);
}

function attachEventHandlers() {
  monthlyButton.addEventListener('click', () => subscribe('monthly'));
  yearlyButton.addEventListener('click', () => subscribe('yearly'));
  uploadButton.addEventListener('click', handleUpload);
  searchInput.addEventListener('input', handleSearch);
  clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    renderSearchResults(marketplaceItems);
  });
  signUpButton.addEventListener('click', () => {
    setAuthMode('create');
    signUpForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  signInButton.addEventListener('click', () => {
    setAuthMode('signin');
    signInForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  createAccountTab.addEventListener('click', () => setAuthMode('create'));
  signInTab.addEventListener('click', () => setAuthMode('signin'));
  signOutButton.addEventListener('click', () => {
    user.signedIn = false;
    user.name = null;
    user.email = null;
    user.subscribed = false;
    user.subscriptionType = null;
    user.expiry = null;
    uploadedItems = [];
    if (!marketplaceItems.length) {
      marketplaceItems = cloneItems(featuredMarketplaceItems);
    }
    saveState();
    renderGalleryItems();
    renderSearchResults(marketplaceItems);
    updateUI();
    alert('Signed out successfully.');
  });

  function handleSignUp(event) {
    event.preventDefault();

    hydrateRegisteredUsers();

    const name = userNameInput.value.trim();
    const password = userPasswordInput.value.trim();

    if (!name || !password) {
      alert('Please fill in all signup fields.');
      return;
    }

    const accountKey = normalizeAccountKey(name);
    if (registeredUsers[accountKey]) {
      alert('That nickname is already taken. Please choose a different display name.');
      return;
    }

    registeredUsers[accountKey] = {
      name,
      password,
    };

    user.signedIn = true;
    user.name = name;
    user.email = null;
    user.subscribed = false;
    user.subscriptionType = null;
    user.expiry = null;

    loadAccountData();
    userNameInput.value = '';
    userPasswordInput.value = '';
    saveState();
    renderGalleryItems();
    renderSearchResults(marketplaceItems);
    updateUI();
    alert(`Welcome to Pixelbay, ${name}! Your account is ready.`);
  }

  function handleSignIn(event) {
    event.preventDefault();

    hydrateRegisteredUsers();

    const nickname = signInNicknameInput.value.trim();
    const password = signInPasswordInput.value.trim();

    if (!nickname || !password) {
      alert('Please enter your nickname and password.');
      return;
    }

    const account = findRegisteredAccount(nickname);

    if (!account || account.password !== password) {
      alert('No matching account was found. Please create an account first.');
      return;
    }

    user.signedIn = true;
    user.name = account.name;
    user.email = null;
    user.subscribed = false;
    user.subscriptionType = null;
    user.expiry = null;

    loadAccountData();
    signInNicknameInput.value = '';
    signInPasswordInput.value = '';
    saveState();
    renderGalleryItems();
    renderSearchResults(marketplaceItems);
    updateUI();
    alert(`Welcome back, ${account.name}!`);
  }

  signUpForm.addEventListener('submit', handleSignUp);
  signInForm.addEventListener('submit', handleSignIn);

  signUpSubmit.addEventListener('click', (event) => {
    event.preventDefault();
    handleSignUp(event);
  });

  signInSubmit.addEventListener('click', (event) => {
    event.preventDefault();
    handleSignIn(event);
  });
}

function restoreState() {
  loadState();
  if (user.signedIn) {
    loadAccountData();
  } else {
    uploadedItems = [];
    if (!marketplaceItems.length) {
      marketplaceItems = cloneItems(featuredMarketplaceItems);
    }
  }
  renderGalleryItems();
}

function initializeApp() {
  restoreState();
  attachEventHandlers();
  renderCategoryFilters();
  renderFeaturedCreators();
  renderSearchResults(marketplaceItems);
  updateUI();
  setAuthMode('create');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
