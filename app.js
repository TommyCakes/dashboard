(function() {
  'use strict';

  var Dashboard = {

    gamesList: ['Overwatch', 'Inside', 'The Witcher 3', 'Watch Dogs 2'],

    init: function () {
      this.cacheDOM();
      this.bindEvents();
      this.checkInternetHeartbeat(3);
      this.startClock();
      this.loadTrackInfo();
      this.checkTrack(30);
      this.loadTwitch();
      this.getTodos();
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
      }, 1000 * timeInSeconds)
    },

    startClock: function () {
      var self = this;

      setInterval (function () {
        var time = new Date();
        var hh = time.getHours();
        var mm = time.getMinutes();
        var ss = time.getSeconds()
        var formattedDate = $.datepicker.formatDate("M d, yy", time);
        self.clock.text(new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"));
        self.date.text(formattedDate);
      }, 100)
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
          console.log(data);
          if (data.streams.length > 0) {
            var channel = data.streams[self.randomIndex(data.streams)].channel.name;
            var video = '<iframe id="video" src="http://player.twitch.tv/?channel=' + channel +'&muted=true" height="720" width="1280" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>'
          } else {
            var video = '<iframe id="video" src="http://player.twitch.tv/?channel=twitch&muted=true" height="720" width="1280" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>'
          }
          self.videoContainer.append(video);
        }
      });
    },

    searchForGame: function() {
      console.log('test');
      var self = this;
      var game = $('#game-input').val();

      if ($('#video').length ) {
          $('#video').remove();
      }
      if (game.length == 0) {
        game = 'Overwatch';
      }

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
              var channel = data.streams[self.randomIndex(data.streams)].channel.name;
              console.log(channel);
              var video = '<iframe id="video" src="http://player.twitch.tv/?channel=' + channel +'&muted=true" height="720" width="1280" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>'
              self.videoContainer.append(video);
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

    getTodos: function() {
      var todosTommy = ['Do this!', 'Learn Some Unity', 'Refactor Game'];
      var todosShabz = ['Do this!', 'Learn Some Unity', 'Refactor Game'];
      var todosSteven = ['Do this!', 'Learn Some Unity', 'Refactor Game'];

        for (var i = 0; i < todosTommy.length; i++) {
          $('.todo-list-tommy').append('<li>' + todosTommy[i] +'</li><hr>');
        }

        for (var i = 0; i < todosShabz.length; i++) {
          $('.todo-list-shabz').append('<li>' + todosShabz[i] +'</li><hr>');
        }

        for (var i = 0; i < todosSteven.length; i++) {
          $('.todo-list-steven').append('<li>' + todosSteven[i] +'</li><hr>');
        }
    },

    getWeather: function() {

      $.getJSON('http://api.wipmania.com/jsonp?callback=?', function (data) {
        var lat = data.latitude;
        var long = data.longitude;
        var country = data.address.country;
        var id = '6214db0042e9d02f80c5f3ba15803622';
        var url = "https://api.forecast.io/forecast/" + id + "/" + lat +"," + long +"?units=si";

        $.ajax ({
          type: 'GET',
          url : url,
          dataType:  'JSONP',
          success: function (data) {
            console.log(data);
            var icon = data.hourly.data[0].icon;
            if (icon == "clear-day") {
              $('.weather-icon').addClass('fa fa-sun-o fa-3x');
            } else if (icon == "partly-cloudy-day") {
              $('.weather-icon').addClass('fa fa-cloud fa-3x');
            }
            $('.weather-description').text(data.hourly.data[0].summary);
            $('.temperature').text(data.hourly.data[0].temperature + '°c');
            $('.weather-location').text('The weather today in ' + data.timezone);
          }
        });
      });
    },
  };

  Dashboard.init();

}());
