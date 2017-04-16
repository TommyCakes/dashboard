(function() {
  'use strict';

  var Dashboard = {

    gamesList: ['Overwatch', 'Inside', 'The Witcher 3', 'Watch Dogs 2', ],

    init: function () {
      this.cacheDOM();
      this.bindEvents();
      this.checkInternetHeartbeat(3);
      this.startClock();
      this.loadTrackInfo();
      this.checkTrack(30);
      this.loadTwitch();
      this.showTodos();
      this.getWeather();
    },

    cacheDOM: function () {
      this.search = $('#search-game');
      this.wifi = $('.fa-wifi');
      this.clock = $('.time');
      this.date = $('.date');
      this.artistAlbumCover = $('.album-artwork');
      this.artistName = $('.artist-name');
      this.artistTrack = $('.artist-track');
      this.username = $('.username');
      this.videoContainer = $('#video-container');
      this.gameSearchedFor = $('.game-searched');
      this.errorMessage = $('.error-message');
      this.tommyList = $('.todo-list-tommy');
      this.shabzList = $('.todo-list-shabz');
      this.stevenList = $('.todo-list-steven');
    },

    bindEvents: function () {
      this.search.on('click', this.searchForGame.bind(this));
    },

    randomIndex: function (array) {
      return Math.floor(Math.random() * array.length)
    },

    checkInternetHeartbeat: function(timeInSeconds) {
      var self = this;

      setInterval (function() {
        self.wifi.toggleClass('wifi-connected');
        // TODO check internet pulse...
      }, 1000 * timeInSeconds)
    },

    startClock: function () {
      var self = this;
      var time = new Date();
      var formattedDate = $.datepicker.formatDate("M d, yy", time);
      self.date.text(formattedDate);

      setInterval (function () {
        var hh = time.getHours();
        var mm = time.getMinutes();
        var ss = time.getSeconds()
        self.clock.text(new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"));
      }, 1000)
    },

    clearTrackInfo: function () {
      this.artistName.text("").hide('fast');
      this.artistTrack.text("").hide('fast');
    },

    loadTrackInfo: function () {
      var self = this;

      $.getJSON("http://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=indiebros&api_key=12dbf5690b6f13b6e1930c52ba9ff2ab&limit=2&format=json&callback=?", function(data) {
        console.log(data);
        var albumCover = data.recenttracks.track[0].image[3]['#text']
        var trackName = data.recenttracks.track[0].name;
        var name = data.recenttracks.track[0].artist['#text']
        var username = data.recenttracks["@attr"].user;

        self.artistAlbumCover.attr('src', albumCover);
        self.artistName.show('slow').append(name);
        self.artistTrack.show('slow').append(trackName);
        self.username.text(username)
      });
    },

    checkTrack : function(timeInSeconds) {
      var self = this;

      setInterval (function () {
        self.clearTrackInfo();
        self.loadTrackInfo();
      }, 1000 * timeInSeconds)
    },

    createVideoStream: function(data, game) {
      var channel = 'twitch'
      if (data.streams.length) {
        channel = data.streams[this.randomIndex(data.streams)].channel.name;
      }
      var video = '<iframe id="video" src="http://player.twitch.tv/?channel=' + channel +'&muted=true" height="720" width="1280" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>'
      this.videoContainer.append(video);
    },

    loadTwitch: function() {
      var self = this;
      var randomGame = self.gamesList[self.randomIndex(self.gamesList)];
      self.gameSearchedFor.text(randomGame);

      $.ajax ({
        type: 'GET',
        url: 'https://api.twitch.tv/kraken/streams?game=' + randomGame,
        dataType: 'JSON',
        headers: {
          'Client-ID': 'r9feviwcj6v642he2nymobpfb6ayj1p'
        },
        success: function (data) {
          self.createVideoStream(data);
        }
      });
    },

    searchForGame: function() {
      console.log('test');
      var self = this;
      var game = $('#game-input').val();
      self.errorMessage.text("");

      $('#video').length ? $('#video').remove() : null;
      $('.fa-gamepad').removeClass('hidden').addClass('flash');

      $.ajax ({
        type: 'GET',
        url: 'https://api.twitch.tv/kraken/streams?game=' + game,
        dataType: 'JSON',
        headers: {
          'Client-ID': 'r9feviwcj6v642he2nymobpfb6ayj1p'
        },
        success: function (data) {
          console.log('searching!');
          setTimeout (function() {
            $('.fa-gamepad').addClass('hidden');
            console.log(data);

            if (data.streams.length > 0) {
              self.createVideoStream(data);
              game = game.toLowerCase().split(' ').map(function(c) {
                var firstCharUppercased = c.charAt(0).toUpperCase() + c.substr(1, c.length);
                return firstCharUppercased
              });
              self.gameSearchedFor.text(game.join(" "));
              self.errorMessage.text("");
            } else {
              self.errorMessage.text("Game not found!");
            }
          }, 2000);
        }
      });
    },


    makeTodos: function(array, list) {
      for (var i = 0; i < array.length; i++) {
        list.append('<li>' + array[i] +'</li><hr>');
      }
    },

    showTodos: function() {
      var tommy = ['Do this!', 'Learn Some Unity', 'Refactor Game'];
      var shabz = ['Do this!', 'Learn Some Unity', 'Refactor Game'];
      var steven = ['Do this!', 'Learn Some Unity', 'Refactor Game'];

      this.makeTodos(tommy, this.tommyList);
      this.makeTodos(shabz, this.shabzList);
      this.makeTodos(steven, this.stevenList);

    },

    getWeather: function() {
      $.getJSON('http://api.wipmania.com/jsonp?callback=?', function (data) {
        console.log(data);
        var lat = data.latitude;
        var long = data.longitude;
        var country = data.address.country;
        var id = '6214db0042e9d02f80c5f3ba15803622';
        var url = "https://api.forecast.io/forecast/" + id + "/" + lat +"," + long +"?units=si";

        $('.weather-location').text('The weather in the ' + data.address.country);

        $.ajax ({
          type: 'GET',
          url : url,
          dataType:  'JSONP',
          success: function (data) {
            console.log(data);
            var icon = data.daily.data[0].icon;

            if (icon == "clear-day") {
              $('.weather-icon').addClass('fa fa-sun-o fa-3x');
            } else if (icon == "partly-cloudy-day") {
              $('.weather-icon').addClass('fa fa-cloud fa-3x');
            } else if (icon == "rain") {
              $('.weather-icon').addClass('fa fa-cloud fa-3x');
            }

            $('.weather-description').text(data.daily.data[0].summary);
            $('.temperature').text(data.daily.data[0].temperatureMax + '°c');
          }
        });
      });
    },
  };

  Dashboard.init();

}());
