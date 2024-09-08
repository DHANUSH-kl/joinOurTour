// Initialize Locomotive Scroll
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
  });
  
  scroll.on('call', (func, state, obj) => {
    if (func === 'animate-card' && state === 'enter') {
      const card = obj.el;
      const cardIndex = Array.from(document.querySelectorAll('.card')).indexOf(card);
  
      // Adjust styles for each card as it enters the viewport
      card.style.opacity = '1';
      card.style.marginBottom = getComputedStyle(document.querySelector(`.card${cardIndex}`)).marginBottom;
    }
  });