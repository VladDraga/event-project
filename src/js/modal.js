const modalBackdrop = document.querySelector('.modal-backdrop');
const closeBtn = document.querySelector('.btn-modal-close');

export function toggleModal() {
  modalBackdrop.classList.toggle('is-hidden');
}

closeBtn.addEventListener('click', toggleModal);
modalBackdrop.addEventListener('click', e => {
  if (e.target === e.currentTarget) toggleModal();
});