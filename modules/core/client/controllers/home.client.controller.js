(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', '$state', '$translate', 'Authentication', 'TorrentsService', 'Notification', 'MeanTorrentConfig',
    'getStorageLangService', 'DownloadService'];

  function HomeController($scope, $state, $translate, Authentication, TorrentsService, Notification, MeanTorrentConfig, getStorageLangService,
                          DownloadService) {
    var vm = this;
    vm.tmdbConfig = MeanTorrentConfig.meanTorrentConfig.tmdbConfig;

    vm.movieTopOne = undefined;
    vm.movieTopList = undefined;
    vm.movieNewList = undefined;

    vm.TVTopOne = undefined;
    vm.TVTopList = undefined;
    vm.TVNewList = undefined;

    /**
     * If user is not signed in then redirect back signin
     */
    if (!Authentication.user) {
      $state.go('authentication.signin');
    }

    /**
     * initTopOneInfo
     */
    vm.initTopOneMovieInfo = function () {
      if (vm.movieTopOne.resource_detail_info.backdrop_path) {
        $('.movie-backdrop').css('backgroundImage', 'url(' + vm.tmdbConfig.backdrop_img_base_url + vm.movieTopOne.resource_detail_info.backdrop_path + ')');
      }
    };

    /**
     * initTopOneTVInfo
     */
    vm.initTopOneTVInfo = function () {
      if (vm.TVTopOne.resource_detail_info.backdrop_path) {
        $('.tv-backdrop').css('backgroundImage', 'url(' + vm.tmdbConfig.backdrop_img_base_url + vm.TVTopOne.resource_detail_info.backdrop_path + ')');
      }
    };

    /**
     * getTopInfo
     */
    vm.getTopInfo = function () {
      vm.getMovieTopInfo();
      vm.getTVTopInfo();
    };

    /**
     * getMovieTopInfo
     */
    vm.getMovieTopInfo = function () {
      vm.moviesInfo = TorrentsService.get({
        torrent_status: 'reviewed',
        torrent_type: 'movie',
        limit: 9
      }, function (items) {
        if (items.rows.length > 0) {
          vm.movieTopOne = items.rows[0];
          items.rows.splice(0, 1);
          vm.movieTopList = items.rows;

          vm.initTopOneMovieInfo();
        }
      }, function (err) {
        Notification.error({
          message: '<i class="glyphicon glyphicon-remove"></i> ' + $translate.instant('TOP_MOVIE_INFO_ERROR')
        });
      });

      vm.moviesInfo = TorrentsService.get({
        torrent_status: 'reviewed',
        torrent_type: 'movie',
        newest: true,
        limit: 14
      }, function (items) {
        if (items.rows.length > 0) {
          vm.movieNewList = items.rows;
        }
      }, function (err) {
        Notification.error({
          message: '<i class="glyphicon glyphicon-remove"></i> ' + $translate.instant('TOP_MOVIE_INFO_ERROR')
        });
      });
    };

    /**
     * getTVTopInfo
     */
    vm.getTVTopInfo = function () {
      vm.tvsInfo = TorrentsService.get({
        torrent_status: 'reviewed',
        torrent_type: 'tvserial',
        limit: 9
      }, function (items) {
        if (items.rows.length > 0) {
          vm.TVTopOne = items.rows[0];
          items.rows.splice(0, 1);
          vm.TVTopList = items.rows;

          vm.initTopOneTVInfo();
        }
      });

      vm.moviesInfo = TorrentsService.get({
        torrent_status: 'reviewed',
        torrent_type: 'tvserial',
        newest: true,
        limit: 14
      }, function (items) {
        if (items.rows.length > 0) {
          vm.TVNewList = items.rows;
        }
      });
    };

    /**
     * openTorrentInfo
     * @param id
     */
    vm.openTorrentInfo = function (id) {
      var url = $state.href('torrents.view', {torrentId: id});
      window.open(url, '_blank');
    };

    /**
     * getDirector
     * @returns {string}
     */
    vm.getDirector = function () {
      var n = '-';

      if (vm.movieTopOne && vm.movieTopOne.resource_detail_info) {
        angular.forEach(vm.movieTopOne.resource_detail_info.credits.crew, function (item) {
          if (item.job === 'Director') {
            n = item.name;
          }
        });
      }
      return n;
    };

    /**
     * downloadTorrent
     * @param id
     */
    vm.downloadTorrent = function (id) {
      var url = '/api/torrents/download/' + id;
      DownloadService.downloadFile(url, null, function (status) {
        if (status === 200) {
          Notification.success({
            message: '<i class="glyphicon glyphicon-ok"></i> ' + $translate.instant('TORRENTS_DOWNLOAD_SUCCESSFULLY')
          });
        }
      }, function (err) {
        Notification.error({
          title: 'ERROR',
          message: '<i class="glyphicon glyphicon-remove"></i> ' + $translate.instant('TORRENT_DOWNLOAD_ERROR')
        });
      });
    };
  }
}());
