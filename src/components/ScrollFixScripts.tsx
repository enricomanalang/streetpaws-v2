'use client';

import { useEffect } from 'react';

export default function ScrollFixScripts() {
  useEffect(() => {
    // Early blocking of browser extension attributes
    const blockedAttributes = [
      'bis_skin_checked',
      'data-bis-config',
      'bis_use',
      'data-extension-id',
      'data-extension-version',
      'data-bis_skin_checked',
      'data-extension'
    ];

    // Block attributes immediately
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      if (blockedAttributes.includes(name)) {
        return;
      }
      return originalSetAttribute.call(this, name, value);
    };

    const originalSetAttributeNS = Element.prototype.setAttributeNS;
    Element.prototype.setAttributeNS = function(namespace, name, value) {
      if (blockedAttributes.includes(name)) {
        return;
      }
      return originalSetAttributeNS.call(this, namespace, name, value);
    };

    // Remove any existing problematic attributes
    function removeProblematicAttributes() {
      blockedAttributes.forEach(attr => {
        const elements = document.querySelectorAll('[' + attr + ']');
        elements.forEach(element => {
          element.removeAttribute(attr);
        });
      });
    }

    // Run immediately
    removeProblematicAttributes();

    // Set up observer to catch late additions
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          blockedAttributes.forEach(attr => {
            if (target.hasAttribute(attr)) {
              target.removeAttribute(attr);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: blockedAttributes
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
