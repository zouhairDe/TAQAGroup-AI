/**
 * ThemeScript component that runs before React hydration to set the theme
 * This prevents hydration mismatches and theme flashing
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme') || 'light';
              var root = document.documentElement;
              if (theme === 'dark') {
                root.classList.add('dark');
              } else {
                root.classList.remove('dark');
              }
            } catch (e) {
              // Fallback to light theme if localStorage is not available
            }
          })();
        `,
      }}
    />
  );
}

export default ThemeScript; 