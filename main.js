
// ------------Global Var List------------
var input = document.querySelector('#file');
var photoGallery = document.querySelector('.image-card-area');
var addPhoto1 = document.querySelector('.add-photo-inputs1');
var addPhoto2 = document.querySelector('.add-photo-inputs2');
var addPhoto3 = document.querySelector('.image-input');
var searchInput = document.querySelector('.h2-input');
var imagesArray = JSON.parse(localStorage.getItem('photos')) || [];
var reader = new FileReader();



// ------------Event Listeners------------
$('.add-image').click(createElement);
$('.h2-input').keyup(searchPhotos);
$('.image-card-area').focusin(wheresTheCursor);
$('.add-photo-inputs1').blur(disableCreateButton);
$('.add-photo-inputs2').blur(disableCreateButton);
$('.image-input').change(disableCreateButton);
$(".favorite-filter").click(showFavorite)
$('.image-card-area').click(favoriteVoteCheck);



// ------------Functions------------
window.onload = function() {
  if (localStorage.length !== 0) {
    var keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
      var parseObj = JSON.parse(localStorage.getItem(keys[i]));
      var newPhoto = new Photo(parseObj.id, parseObj.title, parseObj.file, parseObj.caption, parseObj.favorite);
      imagesArray.push(newPhoto);
      newPhoto.saveToStorage();
      appendPhotos(newPhoto);
      favoritePhotos();
    }  
  } else {
    placeholderText();
  }
}

function disableCreateButton() {
  if (addPhoto1.value.length > 0 && addPhoto2.value.length > 0 && addPhoto3.files.length === 1) {
    $('.add-image').disabled = false;
  } else {
    $('.add-image').disabled = true;
  }
}

function createElement(e) {
  e.preventDefault();
  if (input.files[0]) {
    reader.readAsDataURL(input.files[0]); 
    reader.onload = createCard;
  }
}

function createCard(e) {
  e.preventDefault();
  var titleInput = document.querySelector('#title');
  var bodyInput = document.querySelector('#caption');
  var defaultFav = false;
  var newPhoto = new Photo(Date.now(), titleInput.value, e.target.result, bodyInput.value, defaultFav);
  imagesArray.push(newPhoto);
  newPhoto.saveToStorage();
  appendPhotos(newPhoto);
  clearPhotoAddInputs();
}

function appendPhotos(newPhoto) {
  var favoritesvg;
  if (newPhoto.favorite === true) {
    favoritesvg = "images/favorite-active.svg"
    favoritePhotos();
  } else {
    favoritesvg = "images/favorite.svg"
  }
  var newCard =
    `<article class="image-card" data-id="${newPhoto.id}">
      <section id="title-area">
        <h4 class="card-title edit-text"contentEditable = "true">${newPhoto.title}</h4>
      </section>
      <section id="image-area">
        <img class= "image-size" src="${newPhoto.file}">
      </section>
      <section id="caption-area">
        <h4 class="card-caption edit-text"contentEditable = "true">${newPhoto.caption}</h4>
      </section>
      <section id="bottom-area">
        <img class = "delete-button" onclick="deleteCard(${newPhoto.id})" src="images/delete.svg" onmouseover="this.src='images/delete-active.svg'" onmouseout="this.src='images/delete.svg'" width="40px" height="40px">
<section class="favorite-area"><img class="testing-button" src="${favoritesvg}"></section>
    </article>`;
  photoGallery.insertAdjacentHTML('afterbegin', newCard);
}


function wheresTheCursor(event) {
  if (event.target.closest('.image-card') !== null && 
    !event.target.classList.contains('delete-button') ) {
    event.target.onblur = event =>{
      updateText(event);
    }
  }
}

function searchPhotos (event) {
  event.preventDefault();
  var searchWord = searchInput.value.toUpperCase();
  var filteredPhotos = imagesArray.filter(obj => {
    var titleText = obj.title.toUpperCase();
    var captionText = obj.caption.toUpperCase();
    return titleText.includes(searchWord) || captionText.includes(searchWord);
  });
  photoGallery.innerHTML = "";
  filteredPhotos.forEach(obj => {
    appendPhotos(obj)
  })
}

function showFavorite(e) {
  e.preventDefault()
  var  favoriteArea = document.querySelectorAll("img")
  favoriteArea.forEach(image =>{
    if (image.src === "images/favorite-active.svg") {
      image.parentElement.parentElement.style.display = "grid";
    } else {
      image.parentElement.parentElement.style.display = "none";
    }
  })
}

function clearPhotoAddInputs() {
  addPhoto1.value = '';
  addPhoto2.value = '';
}

function updateText(event) {
  var number = event.target.closest('.image-card').dataset.id;
  var index = imagesArray.find(image =>{
    return parseInt(number) === image.id;
  });
  if (event.target.classList.contains('card-title')) {
    index.updatePhoto(event.target.innerText, 'card-title');
  } else {
    index.updatePhoto(event.target.innerText, 'card-caption');
  }
  index.saveToStorage(imagesArray);
}

function deleteCard (id) {
  var element = document.querySelector(`[data-id="${id}"]`);
  element.remove();
  var deletePhoto = imagesArray.find(newPhoto => {
    return id === newPhoto.id;
  });
  deletePhoto.deleteFromStorage();
  var deleteIndex = imagesArray.findIndex(newPhoto => {
    return id === newPhoto.id;
  });
  imagesArray.splice(deleteIndex, 1);
  placeholderText()
}

function favoriteVoteCheck() {
  if (event.target.classList.contains('testing-button') ) {
    favoriteVote()
  }
}

function favoriteVote() {
  var number = event.target.closest('.image-card').dataset.id;
  var index = imagesArray.find(image => {
    return parseInt(number) === image.id;  
  });
  if (index.favorite === false) {
    index.favorite = true;
    event.target.src = "images/favorite-active.svg";
    index.favoriteStatus(true, index);
    index.saveToStorage(imagesArray);

  } else {
    index.favorite = false;
    event.target.src = "images/favorite.svg";
    index.favoriteStatus(false, index);
    index.saveToStorage(imagesArray);
  }
  favoritePhotos();
}

function favoritePhotos() {
  var favoritePhoto = 0;
  imagesArray.forEach(photo => {
    if (photo.favorite === true) {
      favoritePhoto++
    }
  });
  document.querySelector('#favorite-counter').innerText = favoritePhoto;
}


function placeholderText() {
  if (imagesArray.length === 0) {
    photoGallery.insertAdjacentHTML('beforebegin',
      '<h4 id="no-photo-text">Add photos to start your album!</h3>');
  }
}
