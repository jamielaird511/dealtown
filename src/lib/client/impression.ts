export function observeImpressions(selector: string, onView: (id: string)=>void) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const id = (e.target as HTMLElement).dataset.id;
      if (e.isIntersecting && id) { 
        onView(id); 
        io.unobserve(e.target); 
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(selector).forEach(el => io.observe(el));
}
