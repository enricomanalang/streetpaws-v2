'use client';

// Comprehensive hydration error fix for browser extensions
export function fixHydrationErrors() {
  if (typeof window === 'undefined') return;

  // List of problematic attributes added by browser extensions
  const problematicAttributes = [
    'bis_skin_checked',
    'data-bis-config',
    'bis_use',
    'data-extension-id',
    'data-extension-version',
    'data-bis_skin_checked',
    'data-extension',
    'data-bis',
    'bis-config',
    'bis-use',
    'data-bis-skin-checked',
    'bis-skin-checked',
    'data-bis-skin',
    'bis-skin',
    'data-bis-skin-checked',
    'bis-skin-checked'
  ];

  const removeProblematicAttributes = () => {
    problematicAttributes.forEach(attr => {
      const elements = document.querySelectorAll('[' + attr + ']');
      elements.forEach((element) => {
        element.removeAttribute(attr);
      });
    });
    
    // Also remove any attributes that start with 'bis_' or contain 'bis-skin'
    const allElements = document.querySelectorAll('*');
    allElements.forEach((element) => {
      const attrs = Array.from(element.attributes);
      attrs.forEach(attr => {
        if (attr.name.startsWith('bis_') || 
            attr.name.includes('bis-skin') || 
            attr.name.includes('bis_skin')) {
          element.removeAttribute(attr.name);
        }
      });
    });
  };

  // Run immediately and also after DOM is ready
  removeProblematicAttributes();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeProblematicAttributes);
  }
  
  // Also run after short delays to catch late-added attributes
  setTimeout(removeProblematicAttributes, 10);
  setTimeout(removeProblematicAttributes, 50);
  setTimeout(removeProblematicAttributes, 100);
  setTimeout(removeProblematicAttributes, 200);
  setTimeout(removeProblematicAttributes, 500);
  setTimeout(removeProblematicAttributes, 1000);
  setTimeout(removeProblematicAttributes, 2000);
}

// Observer to catch dynamically added elements
export function observeForExtensionAttributes() {
  if (typeof window === 'undefined') return;

  const problematicAttributes = [
    'bis_skin_checked',
    'data-bis-config',
    'bis_use',
    'data-extension-id',
    'data-extension-version',
    'data-bis_skin_checked',
    'data-extension',
    'data-bis',
    'bis-config',
    'bis-use',
    'data-bis-skin-checked',
    'bis-skin-checked',
    'data-bis-skin',
    'bis-skin'
  ];

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        const target = mutation.target as Element;
        problematicAttributes.forEach(attr => {
          if (target.hasAttribute(attr)) {
            target.removeAttribute(attr);
          }
        });
        
        // Also check for any attributes that start with 'bis_' or contain 'bis-skin'
        const attrs = Array.from(target.attributes);
        attrs.forEach(attr => {
          if (attr.name.startsWith('bis_') || 
              attr.name.includes('bis-skin') || 
              attr.name.includes('bis_skin')) {
            target.removeAttribute(attr.name);
          }
        });
      }
    });
  });

  // Observe the entire document to catch all problematic attributes
  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: problematicAttributes,
  });

  return () => observer.disconnect();
}


