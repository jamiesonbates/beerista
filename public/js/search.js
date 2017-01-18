(function() {
  'use strict';

  // Check and verify logged in user
  const checkForCookie = function() {
    const $xhr = $.ajax({
      method: 'GET',
      url: '/token',
      dataType: 'JSON'
    })
    .done((bool) => {
      if ($xhr.status !== 200) {
        return;
      }

      if (bool) {
        $('#login').addClass('off');
        $('#account-icon').removeClass('off');
      }
    })
    .fail((err) => {
      console.log(err);
    })
  }

// Get User Id
  let userId;
  const $xhr = $.ajax({
    method: 'GET',
    contentType: 'application/json',
    dataType: 'json',
    url: '/users'
  });
  $xhr.done(($xhr) => {
    userId = $xhr.id;
  });
  $xhr.fail(() => {
    console.log('Could not get user Id');
  });

  $(window).on('load', checkForCookie);

  // Toggle Account Menu
  const toggleAccountMenu = function() {
    $('#drop-down-container').toggleClass('off');
  }

  $('#account-icon').on('click', toggleAccountMenu);

  // Navigate to other pages via Account Menu
  const myFollows = $('#my-follows');
  const myBeers = $('#my-beers');
  // const settings = $('#settings');

  myFollows.on('click', () => { window.location.href = '/followers.html' });
  myBeers.on('click', () => { window.location.href = '/profile.html' });

  // const menuOptions = $('#log-out');

  // Populate search results
  let beers = [];
  let beerData;
  let $allResults;

  const populateResults = function() {
    const $results = $('#results');
    $results.empty();

    for (const beer of beers) {
      const $result = $('<div>').addClass('result');

      $result.data(beer);

      const $photo = $('<div>').addClass('photo');

      $result.append($photo);

      const $img = $('<img>').attr('src', beer.photo_url);

      $photo.append($img);

      const $info = $('<div>').addClass('info');
      const $name = $('<div>').addClass('name');

      $result.append($info);
      $info.append($name);

      const $h3 = $('<h3>').text(beer.name);
      const $h4 = $('<h4>').text(beer.brewery);
      const $h5 = $('<h5>').text(beer.style);

      $name.append($h3);
      $name.append($h4);
      $name.append($h5);

      const $stats = $('<div>').addClass('stats');

      $info.append($stats);

      const $abvP = $('<p>').text(`ABV: ${beer.abv}`).addClass('abv');
      const $ibuP = $('<p>').text(`IBU: ${beer.ibu}`).addClass('ibu');
      const $ratingP = $('<p>').text(`Rating: ${beer.rating}`).addClass('rating');

      $stats.append($abvP);
      $stats.append($ibuP);
      $stats.append($ratingP);

      $results.append($result);
    };
  };

  const getBeers = function() {
    let searchParam;
    if (window.QUERY_PARAMETERS.input) {
      console.log(window.QUERY_PARAMETERS.input);
      searchParam = window.QUERY_PARAMETERS.input;
    }
    else {
      console.log('no params');
      searchParam = $('.search-box').val();
    }

    const $xhr = $.ajax({
      method: 'GET',
      url: `/beers/?name=${searchParam}`,
      dataType: 'json'
    })
    .done((data) => {
      if ($xhr.status !== 200) {
        return;
      }

      beers = data;
    })
    .fail(($xhr) => {
      console.log($xhr)
    });
  };

  window.QUERY_PARAMETERS = {};

  if (window.location.search) {
    window.location.search.substr(1).split('&').forEach((paramStr) => {
      const param = paramStr.split('=');

      window.QUERY_PARAMETERS[param[0]] = param[1];
    });
    getBeers();
    populateResults();
  }

  const $search = $('#search-btn');
  const $searchInput = $('.search-box');
  // console.log($searchInput);

  $searchInput.on('input', getBeers);
  $searchInput.on('input', populateResults);

  const loadBeerPage = function(event) {
    event.preventDefault();

    $allResults = $('.result');

    const $target = $(event.target).parents('.result');
    // console.log($target);

    beerData = $target.data();
    console.log(beerData);

    $allResults.detach();
    $results.addClass('off');

    $('#beer').removeClass('off');

    $('#beer-photo').attr('src', $target.find('.photo img').attr('src'));
    $('#name').text($target.find('.name h3').text());
    $('#brewery').text($target.find('.name h4').text());
    $('#style').text($target.find('.name h5').text());
    $('#abv').text($target.find('.abv').text());
    $('#ibu').text($target.find('.ibu').text());
    $('#rating').text($target.find('.rating').text());
  }

  // Exit individual beer "pop-up"
  const $results = $('#results');

  $results.on('click', '.result', loadBeerPage);

  const exitBeerPage = function(event) {
    event.preventDefault();

    $('#beer').addClass('off');
    $('.rating-circle').removeClass('rating-color');
    $results.append($allResults);
    $results.removeClass('off');
  }

  const $exit = $('i');

  $exit.on('click', exitBeerPage);

  // Color Rating Option on Beer Page
  const colorCircles = function() {
    $('div.rating-circle').removeClass('rating-color');
    $(this).prevAll().addClass('rating-color');
    $(this).addClass('rating-color');
  }

  $('div.rating-circle').on('click', colorCircles);

  // Grab Rating from Page Before Rating is Submitted
  // Event Listener for "Add Rating"
  const submitRating = function() {
    const ratingCircles = document.querySelectorAll('.rating-circle');
    let ratingCount = 0;

    ratingCircles.forEach((div) => {
      if (div.classList.contains('rating-color')) {
        ratingCount++;
      }
    });

    if (ratingCount === 0) {
      console.log('No rating selected.');
      return;
    }

    beerData.user_rating = ratingCount;
    beerData.user_id= userId;
    console.log(beerData);

    const requestContent = JSON.stringify(beerData);
    console.log(requestContent);

    const $xhr_2 = $.ajax({
      method: 'POST',
      url: '/beers',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(beerData)
    })
    .done((data) => {
      window.location.href = '/profile.html';
    })
    .fail(() => {
      console.log('Failure');
    });
  }

  $('#add-rating').on('click', submitRating);


})();
