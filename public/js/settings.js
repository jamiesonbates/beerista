'use strict';

const logout = () => {
  const $xhr = $.ajax({
    method: 'DELETE',
    url: '/token',
    dataType: 'JSON'
  })
  .done((bool) => {
    if ($xhr.status !== 200) {
      return;
    }

    if (bool) {
      $('#login').removeClass('off');
      $('#account-icon').addClass('off');
    }

    window.location.href = '/login.html';
  })
  .fail((_err) => {
    window.alert('Invalid email or username!'); // eslint-disable-line no-alert
  });
};

// Toggle Account Menu
const toggleAccountMenu = function() {
  $('#drop-down-container').toggleClass('off');
};

const handleGeneralSearch = (event) => {
  event.preventDefault();
  const searchBeer = $('input').val();
  window.location.href = `/search.html?input=${searchBeer}`;
};

const getUser = (resolve, reject) => {
  const $xhr = $.ajax({
    method: 'GET',
    url: '/users',
    dataType: 'JSON'
  })
  .done((user) => {
    if ($xhr.status !== 200) {
      reject();
    }

    resolve(user);
  })
  .fail((err) => {
    reject(err);
  });
};

const handleEditUser = (event) => {
  event.preventDefault();

  const firstName = $('input[name|="first-name"]').val();
  const lastName = $('input[name|="last-name"]').val();
  const email = $('input[name|="email"]').val();
  const city = $('input[name|="city"]').val();
  const state = $('input[name|="state"]').val();
  const user = { firstName, lastName, email, city, state };

  const $xhr = $.ajax({
    method: 'PATCH',
    url: '/users',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(user)
  });
  $xhr.done(() => {
    if ($xhr.status !== 200) {
      return;
    }

    window.location.href = '/profile.html';
  });
  $xhr.fail((err) => {
    return err;
  });
};

const handleDeleteUser = (event) => {
  event.preventDefault();

  const $xhr = $.ajax({
    method: 'DELETE',
    url: '/users',
    dataType: 'json',
    contentType: 'application/json'
  });
  $xhr.done((user) => {
    if ($xhr.status !== 200) {
      return;
    }

    window.location.href = '/login.html';
  });
  $xhr.fail((err) => {
    return err;
  });
};

const loadDeleteConfirm = (event) => {
  event.preventDefault();
  $('#confirm').removeClass('off');
  $('#delete').addClass('off');
};

const exitDeleteConfirm = (event) => {
  event.preventDefault();

  $('#confirm').addClass('off');
  $('#delete').removeClass('off');
};

(function() {
  const user = new Promise(getUser);
  user.then((user) => {
    $('input[name|="first-name"]').val(user.firstName);
    $('input[name|="last-name"]').val(user.lastName);
    $('input[name|="email"]').val(user.email);
    $('input[name|="city"]').val(user.city);
    $('input[name|="state"]').val(user.state);
  });
  user.catch((err) => {
    console.error(err);
  });

  $('#account-icon').on('click', toggleAccountMenu);

  // Navigate to other pages via Account Menu
  const $findPeople = $('#find-people');
  const $myBeers = $('#my-beers');
  const $logout = $('#log-out');

  $findPeople.on('click', () => { window.location.href = '/users.html'; });
  $myBeers.on('click', () => { window.location.href = '/profile.html'; });
  $logout.on('click', logout);

  const $generalSearch = $('#general-search');

  $generalSearch.submit(handleGeneralSearch);

  const $userInfo = $('#user-info');

  $userInfo.submit(handleEditUser);

  const $delete = $('#delete');

  $delete.on('click', loadDeleteConfirm);

  const $remove = $('#remove');

  $remove.on('click', handleDeleteUser);

  const $cancel = $('#cancel');

  $cancel.on('click', exitDeleteConfirm);
})();
