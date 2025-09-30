let menuIcon = document.querySelector('#menuicon');
let nav = document.querySelector('.nav');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x')
    nav.classList.toggle('active')
}

var typed = new Typed('.typed', {
    strings: [
        'Developer',
        'Gamer',
        'Designer',
        'Writer',
        'Engineer'
    ],
    typeSpeed: 100,
    backSpeed: 80,
    loop: true,
    cursorChar: '|',
    backDelay: 1500,
  });


