'use strict'

// Seleciona todos os links da navegação
const navLinks = document.querySelectorAll('nav a');

// Adiciona evento de click aos links da navegação
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    // Remove a classe "ativo" de todos os links
    navLinks.forEach((otherLink) => otherLink.classList.remove('ativo'));
    // Adiciona a classe "ativo" ao link clicado
    link.classList.add('ativo');
  });
});

// Adiciona evento de popstate ao objeto window
window.addEventListener('popstate', () => {
  // Remove a classe "ativo" de todos os links
  navLinks.forEach((link) => link.classList.remove('ativo'));
});

// Verifica a URL atual e adiciona a classe "ativo" ao link correspondente
const url = window.location.href;
const pageLinks = document.querySelectorAll('nav a');

pageLinks.forEach((link) => {
  if (link.href === url) {
    link.classList.add('ativo');
  } else {
    link.classList.remove('ativo');
  }
});