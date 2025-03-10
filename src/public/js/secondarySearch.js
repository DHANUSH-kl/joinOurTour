





function openFilterPopup() {
    document.getElementById('filterPopup').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Optional: Disable scrolling on main content
  }
  
  function closeFilterPopup() {
    document.getElementById('filterPopup').style.display = 'none';
    document.body.style.overflow = ''; // Enable scrolling back
  }
  