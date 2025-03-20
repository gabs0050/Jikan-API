'use strict'

const navLinks = document.querySelectorAll('nav a');

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.forEach((otherLink) => otherLink.classList.remove('ativo'));
    link.classList.add('ativo');
  });
});

const url = window.location.href;
const pageLinks = document.querySelectorAll('nav a');

pageLinks.forEach((link) => {
  if (link.href === url) {
    link.classList.add('ativo');
  }
});