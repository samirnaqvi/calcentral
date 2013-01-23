(function(angular) {

  'use strict';

  angular.module('calcentral.services', ['ng']).service('analyticsService', ['$rootScope', '$window', '$location', function($rootScope, $window, $location) {

    /**
     * Track an event on the page
     * @param {Array} eventtrack An array of what you want to track.
     * In this order: category - action - label - value and non-interaction
     * e.g. ['Videos', 'Play', 'Flying to Belgium']
     * More info on https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
     */
    var trackEvent = function(eventtrack) {
      $window._gaq.push(['_trackEvent'].concat(eventtrack));
    };

    /**
     * Track when there is an external link being clicked
     * @param {String} section The section you're currently in (e.g. Up Next / My Classes / Notifications)
     * @param {String} website The website you're trying to access (Google Maps)
     * @param {String} url The URL you're accessing
     */
    var trackExternalLink = function(section, website, url) {
      trackEvent(['External link', 'Clicked', 'section: ' + section + ' - website: ' + website, url]);
    };

    /**
     * This will track the the page that you're viewing
     * e.g. /, /dashboard, /settings
     */
    var trackPageview = function() {
      $window._gaq.push(['_trackPageview', $location.path()]);
    };

    // Whenever we're changing the content loaded, we need to track which page we're viewing.
    $rootScope.$on('$viewContentLoaded', trackPageview);

    // Expose methods
    return {
      trackEvent: trackEvent,
      trackExternalLink: trackExternalLink
    };

  }]);

}(window.angular));
