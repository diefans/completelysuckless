(function() {
  "use strict";
  angular.module("Foo", ["completelysuckless"]).controller("FooController", (function() {
    function _Class($scope) {
      $scope.input = {
        choices: this.demoChoices(),
        value: void 0
      };
      $scope.update = (function(_this) {
        return function(value, ctrl) {
          var choices, newChoice;
          ctrl.reselect();
          choices = _this.demoChoices();
          if (value) {
            if (_this.findChoice(choices, value) == null) {
              newChoice = {
                id: Math.round(Math.random() * 100 + 3),
                name: value
              };
              choices.splice(0, 0, newChoice);
            }
          }
          return $scope.input.choices = choices;
        };
      })(this);
      $scope.autoSelect = function(value, choice) {
        if ((value != null) && value.toLowerCase() === choice.name.toLowerCase()) {
          return true;
        } else {
          return false;
        }
      };
      $scope.choose = function(selection, value, ctrl) {
        return $scope.chosen = {
          selection: selection,
          input: value,
          ctrl: ctrl
        };
      };
    }
    _Class.$inject = ["$scope"];

    _Class.prototype.demoChoices = function() {
      return [
        {
          id: 1,
          name: "foo"
        }, {
          id: 2,
          name: "bar"
        }, {
          id: 3,
          name: "baz"
        }
      ];
    };

    _Class.prototype.findChoice = function(choices, name) {
      var choice, i, len;
      for (i = 0, len = choices.length; i < len; i++) {
        choice = choices[i];
        if (choice.name.toLowerCase() === name.toLowerCase()) {
          return choice;
        }
      }
      return void 0;
    };

    return _Class;

  })());

}).call(this);
