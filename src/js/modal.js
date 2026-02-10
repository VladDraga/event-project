const modalBackdrop = document.querySelector('.modal-backdrop');
const modalContent = document.querySelector('.modal-content');
const closeBtn = document.querySelector('.btn-modal-close');

export function toggleModal() {
  modalBackdrop.classList.toggle('is-hidden');
}

export function renderModal(event) {
  console.log(event)
  const previewEventImg = event.images.find(({ ratio }) => ratio === "3_2")
  const mainEventImg = event.images.find(({ ratio, width }) => ratio === "16_9" && width === 1024)

  console.log(previewEventImg)
  console.log(mainEventImg)

  modalContent.innerHTML = '';
  const markup = `<div class="modal-main"><img src="${mainEventImg.url}" alt='' class='modal-artist-main' /><div class='modal-info'>
  <section>
    <h2 class='modal-title'>Info</h2>
    <p class='modal-desc'>${event.info ? event.info.slice(0, 200) + '…' : "No information provided"}</p>
  </section>
  <section>
    <h2 class='modal-title'>When</h2>
    <p class='modal-desc'>${event.dates.start.localDate}</p>
    <p class='modal-desc'>${event.dates.start.localTime} (${event.dates.timezone})</p>
  </section>
  <section>
    <h2 class='modal-title'>Where</h2>
    <p class='modal-desc'>${event._embedded.venues[0].city.name}</p>
    <p class='modal-desc'>${event._embedded.venues[0].name}</p>
  </section>
  <section>
    <h2 class='modal-title'>Who</h2>
    <p class='modal-desc'>${event._embedded.attractions[0].name}</p>
  </section>
  <section>
    <h2 class='modal-title'>Tickets</h2>
    <a href="${event.url}" target="_blank"><button type="button" class="modal-tickets">View Tickets</button></a>
  </section>
  <a href="${event._embedded.attractions[0].url}" target="_blank"><button type="button" class="modal-tickets-more">MORE FROM THIS AUTHOR</button></a>
</div>
</div>`;
  modalContent.insertAdjacentHTML('afterbegin', markup);
}

closeBtn.addEventListener('click', toggleModal);
modalBackdrop.addEventListener('click', e => {
  if (e.target === e.currentTarget) toggleModal();
});