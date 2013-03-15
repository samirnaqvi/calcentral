(function(calcentral) {
  'use strict';

  /**
   * Activity controller
   */
  calcentral.controller('ActivityController', ['$http', '$scope', function($http, $scope) {

    /** Constructing a complex model with logic to hide away some of the data munging. */
    var activitiesModelInit = function(plain_objects) {
      var originalArray = [];
      if (plain_objects && plain_objects.activities) {
        originalArray = plain_objects.activities;
      }

      /** Dictionary for the type translator. **/
      var typeDict = {
        alert: ' Alerts Posted'
      };

      /**
       * Return the threaded actitivies array, without filters.
       * @return {Object} JSON object.
       */
      var get = function() {
        return displayArray;
      };

      /**
       * Algorithm to use when sorting activity elements
       * @param {Object} a Exhibit #1
       * @param {Object} b Exhibit #2 that's being compared to exhibit 1
       * @return {int} see String.compareTo responses
       */
      var sortFunction = function(a, b) {
        /** Date decending. */
        return b.date.epoch - a.date.epoch;
      };

      /**
       * Translate the different types of activity
       * @param {String} type from each activity object
       * @return {String} string partial for displaying the aggregated activities.
       */
      var translator = function(type) {
        if (typeDict[type]) {
          return typeDict[type];
        } else {
          return " " + type + " posted.";
        }
      };

      /**
       * Take the original thread feed and collapse similar items into threads
       * @param {Array} original activities array from the backend
       * @return {Array} activities array, with similar items collapsed under pseduo-activity postings.
       */
      var threadOnSource = function(original) {
        var source = angular.copy(original);
        var multiElementArray = [];

        /**
         * Split out all the "similar (souce, type, date)" items from the given original_source.
         * Collapse all the similar items into "multiElementArray".
         * @param {Array} original_source flat array of activities.
         * @return {Array} activities without any "similar" items.
         */
        var spliceMultiSourceElements = function(original_source) {
          return original_source.filter(function(value, index, arr) {
            // the multiElementArray stores arrays of multiElementSource for
            // items captured by the filter below.
            var multiElementSource = original_source.filter(function(sub_value, sub_index) {
              return ((sub_index !== index) &&
                (sub_value.source === value.source) &&
                (sub_value.type === value.type) &&
                (sub_value.date.epoch === value.date.epoch));
            });
            if (multiElementSource.length > 0) {
              multiElementSource.forEach(function(multi_value, multi_index) {
                arr.splice(arr.indexOf(multi_value), 1);
              });
              multiElementSource.push(value);
              multiElementArray.push(multiElementSource);
            }
            return multiElementSource.length === 0;
          });
        };

        /**
         * Construct a pseudo "grouping" activities object for the similar activities.
         * @param {Array} tmpMultiElementArray an array of similar activity objects.
         * @return {Object} a wrapping "grouping" object (ie. 2 Activities posted), that contains
         *                    the similar objects array underneath.
         */
        var processMultiElementArray = function(tmpMultiElementArray) {
          return tmpMultiElementArray.map(function(value) {
            // if object is malformed, return an empty object
            if (value.length < 1) {
              return {};
            }
            return {
              'title': value.length + translator(value[0].type),
              'source': value[0].source,
              'emitter': value[0].emitter,
              'color_class': value[0].color_class,
              'date': angular.copy(value[0].date),
              'elements': value
            };
          });
        };

        var result = spliceMultiSourceElements(source);
        multiElementArray = processMultiElementArray(multiElementArray);
        result = result.concat(multiElementArray).sort(sortFunction);

        return result;
      };

      /** Model Intialization **/
      var displayArray = threadOnSource(originalArray);

      return {
        get: get,
        length: originalArray.length
      };
    };

    $http.get('/api/my/activities').success(function(data) {
    // keeping this around for the filter work.
    // $http.get('/dummy/json/activities.json').success(function(data) {
      $scope.activities = activitiesModelInit(data);
    });

  }]);

})(window.calcentral);
