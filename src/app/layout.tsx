import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ConditionalNavigation from "@/components/ConditionalNavigation";
import { HydrationBoundary } from "@/lib/hydration-fix";
import ScrollFixScripts from "@/components/ScrollFixScripts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StreetPaws - Geographic Information System for Stray Animal Welfare",
  description: "Report stray animals, request adoptions, and help manage animal welfare in Lipa City",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // NUCLEAR hydration fix for browser extensions
              (function() {
                const problematicAttributes = [
                  'bis_skin_checked', 'data-bis-config', 'bis_use',
                  'data-extension-id', 'data-extension-version', 
                  'data-bis_skin_checked', 'data-extension', 'data-bis',
                  'bis-config', 'bis-use', 'data-bis-skin-checked',
                  'bis-skin-checked', 'data-bis-skin', 'bis-skin',
                  'data-bis-skin-checked', 'bis-skin-checked'
                ];
                
                function removeProblematicAttributes() {
                  // Remove specific attributes
                  problematicAttributes.forEach(attr => {
                    const elements = document.querySelectorAll('[' + attr + ']');
                    elements.forEach((element) => {
                      element.removeAttribute(attr);
                    });
                  });
                  
                  // Remove any attributes that start with 'bis_' or contain 'bis-skin'
                  const allElements = document.querySelectorAll('*');
                  allElements.forEach((element) => {
                    const attrs = Array.from(element.attributes);
                    attrs.forEach(attr => {
                      if (attr.name.startsWith('bis_') || 
                          attr.name.includes('bis-skin') || 
                          attr.name.includes('bis_skin') ||
                          attr.name.includes('skin-checked')) {
                        element.removeAttribute(attr.name);
                      }
                    });
                  });
                }
                
                // Run immediately
                removeProblematicAttributes();
                
                // Run when DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeProblematicAttributes);
                }
                
                // Run EXTREMELY frequently to catch late-added attributes
                setInterval(removeProblematicAttributes, 50);
                
                // Run after multiple short delays
                setTimeout(removeProblematicAttributes, 1);
                setTimeout(removeProblematicAttributes, 5);
                setTimeout(removeProblematicAttributes, 10);
                setTimeout(removeProblematicAttributes, 25);
                setTimeout(removeProblematicAttributes, 50);
                setTimeout(removeProblematicAttributes, 100);
                setTimeout(removeProblematicAttributes, 200);
                setTimeout(removeProblematicAttributes, 500);
                setTimeout(removeProblematicAttributes, 1000);
                setTimeout(removeProblematicAttributes, 2000);
                
                // Use MutationObserver to catch attributes as they're added
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                      const target = mutation.target;
                      const attrs = Array.from(target.attributes);
                      attrs.forEach(attr => {
                        if (attr.name.startsWith('bis_') || 
                            attr.name.includes('bis-skin') || 
                            attr.name.includes('bis_skin') ||
                            attr.name.includes('skin-checked')) {
                          target.removeAttribute(attr.name);
                        }
                      });
                    }
                  });
                });
                
                // Start observing immediately
                if (document.body) {
                  observer.observe(document.body, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: problematicAttributes
                  });
                } else {
                  // Wait for body to be available
                  document.addEventListener('DOMContentLoaded', () => {
                    observer.observe(document.body, {
                      attributes: true,
                      subtree: true,
                      attributeFilter: problematicAttributes
                    });
                  });
                }
                
                // Additional aggressive cleanup
                const aggressiveCleanup = () => {
                  const allElements = document.querySelectorAll('*');
                  allElements.forEach((element) => {
                    const attrs = Array.from(element.attributes);
                    attrs.forEach(attr => {
                      if (attr.name.includes('bis') || attr.name.includes('skin')) {
                        element.removeAttribute(attr.name);
                      }
                    });
                  });
                };
                
                // Run aggressive cleanup every 25ms
                setInterval(aggressiveCleanup, 25);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <HydrationBoundary>
          <AuthProvider>
            <ScrollFixScripts />
            <ConditionalNavigation />
            {children}
          </AuthProvider>
        </HydrationBoundary>
      </body>
    </html>
  );
}
