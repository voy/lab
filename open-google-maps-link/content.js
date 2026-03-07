// Function to extract coordinates or location data from the page
function extractLocationData() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');

  // Check if we're on a maps-related search
  const isMapsSearch = query && (
    query.toLowerCase().includes('maps') ||
    window.location.href.includes('/maps/') ||
    document.querySelector('[data-attrid="kc:/location/location:address"]') ||
    document.querySelector('[jsname="ZY0cM"]') // Maps container
  );

  return {
    isMapsSearch,
    query: query || ''
  };
}

// Function to create and inject the Maps button
function injectMapsButton() {
  const locationData = extractLocationData();

  if (!locationData.isMapsSearch) {
    return;
  }

  // Check if button already exists
  if (document.querySelector('.direct-maps-button')) {
    return;
  }

  // Find the search result container
  const searchContainer = document.querySelector('#search') ||
                          document.querySelector('#rcnt') ||
                          document.querySelector('#center_col');

  if (!searchContainer) {
    return;
  }

  // Create the button
  const button = document.createElement('a');
  button.className = 'direct-maps-button';
  button.textContent = '🗺️ Open in Google Maps';

  // Build the Google Maps URL
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(locationData.query)}`;
  button.href = mapsUrl;
  button.target = '_blank';
  button.rel = 'noopener noreferrer';

  // Try to find a good insertion point
  const knowledgePanel = document.querySelector('[data-attrid="kc:/location/location:address"]')?.closest('[jsname]');
  const localResults = document.querySelector('[jsname="dJKDsc"]');
  const firstResult = document.querySelector('#search .g, #rso > div');

  const insertionPoint = knowledgePanel || localResults || firstResult || searchContainer.firstChild;

  if (insertionPoint && insertionPoint.parentNode === searchContainer) {
    searchContainer.insertBefore(button, insertionPoint);
  } else if (insertionPoint) {
    insertionPoint.parentNode.insertBefore(button, insertionPoint);
  } else {
    searchContainer.insertBefore(button, searchContainer.firstChild);
  }
}

// Function to check for embedded maps and add direct link
function addDirectLinkToEmbeddedMaps() {
  // Get the search query
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');

  if (!query) return;

  // Look for the specific map container with jsname="dmpPd"
  const mapContainer = document.querySelector('[jsname="dmpPd"]');

  if (!mapContainer) return;

  // Check if button already exists
  const existingButton = mapContainer.parentElement?.querySelector('.embedded-maps-link');
  if (existingButton) return;

  // Create the button
  const link = document.createElement('a');
  link.className = 'embedded-maps-link direct-maps-button';
  link.textContent = '🗺️ Open in Google Maps';

  link.href = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  // Insert the button right after the map container
  if (mapContainer.nextSibling) {
    mapContainer.parentNode.insertBefore(link, mapContainer.nextSibling);
  } else {
    mapContainer.parentNode.appendChild(link);
  }
}

// Run the injection
function runInjection() {
  injectMapsButton();
  addDirectLinkToEmbeddedMaps();
}

// Initial run
runInjection();

// Watch for dynamic content changes (Google often loads content dynamically)
const observer = new MutationObserver((mutations) => {
  runInjection();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Also run on URL changes (for single-page navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(runInjection, 500);
  }
}).observe(document, { subtree: true, childList: true });
