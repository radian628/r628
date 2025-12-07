(() => {
  // demos-src/404.demo.ts
  if (window.location.pathname.startsWith("/demos-build")) {
    window.location.pathname = window.location.pathname.slice(12);
  }
})();
