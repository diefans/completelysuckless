(function() {
  "use strict";
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  angular.module("completelysuckless", []).directive("sucklessTranscope", function() {
    return {
      restrict: 'EAC',
      link: {
        pre: function(scope, element, attrs, ctrl, transclude) {
          var NODE_TYPE_TEXT, childScope, scopeType, startingTag;
          if (transclude == null) {
            NODE_TYPE_TEXT = 3;
            startingTag = function(element) {
              var e, elemHtml;
              element = $(element).clone();
              try {
                element.empty();
              } catch (_error) {
                e = _error;
              }
              elemHtml = $('<div>').append(element).html();
              try {
                return elemHtml(element[0].nodeType === NODE_TYPE_TEXT ? void 0 : elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/, function(match, nodeName) {
                  return '<' + nodeName;
                }));
              } catch (_error) {
                e = _error;
                return elemHtml;
              }
            };
            throw angular.$$minErr('ngTransclude')('orphan', 'Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found. Element: {0}', startingTag(element));
          }
          scopeType = attrs['sucklessTranscope'] || 'parent';
          switch (scopeType) {
            case "sibling":
              return transclude(function(clone) {
                element.empty();
                return element.append(clone);
              });
            case "parent":
              return transclude(scope, function(clone) {
                element.empty();
                return element.append(clone);
              });
            case "child":
              childScope = scope.$new();
              return transclude(childScope, function(clone) {
                element.empty();
                element.append(clone);
                return element.on("$destroy", function() {
                  return childScope.$destroy();
                });
              });
          }
        }
      }
    };
  }).directive("sucklessComplete", function() {
    return {
      restrict: "E",
      require: "sucklessComplete",
      transclude: true,
      scope: {
        value: "=?",
        update: "=?",
        choices: "=",
        choose: "=",
        identity: "=?",
        autoSelect: "=?"
      },
      template: '<div class="suckless-complete"> <input type="text" data-ng-model="value" placeholder="{{ placeholder }}"/> <ul data-ng-class="{active: activeList}"> <li data-ng-repeat="choice in choices" data-ng-click="takeChoice(choice)" suckless-transcope data-ng-class="{selected: isSelected(choice)}"></li> </ul> </div>',
      link: function(scope, element, attrs, ctrl) {
        var inputElement, key, metaKeys, noChoice;
        key = {
          tab: 9,
          enter: 13,
          esc: 27,
          left: 37,
          up: 38,
          right: 39,
          down: 40
        };
        metaKeys = {
          meta: 91,
          shift: 16,
          caps: 20,
          alt: 18,
          altGr: 225,
          ctrl: 17
        };
        if ("placeholder" in attrs) {
          scope.placeholder = attrs.placeholder;
        }
        noChoice = (attrs.noChoice != null) && true || false;
        inputElement = element.find("input");
        inputElement.on("click", function(e) {
          return ctrl.focus();
        });
        inputElement.on("focus", function(e) {
          return ctrl.focus();
        });
        inputElement.on("blur", function(e) {
          return ctrl.blur(true);
        });
        return inputElement.on("keydown", function(e) {
          var _, code, selectionValue;
          for (_ in metaKeys) {
            code = metaKeys[_];
            if (e.keyCode === code) {
              return;
            }
          }
          ctrl.activateList(true);
          switch (e.keyCode) {
            case key.down:
              e.preventDefault();
              return ctrl.selectNext();
            case key.up:
              e.preventDefault();
              return ctrl.selectPrevious();
            case key.enter:
              selectionValue = ctrl.getSelectionValue();
              if ((selectionValue != null) || noChoice) {
                ctrl.choose(selectionValue);
                return ctrl.blur();
              }
              break;
            case key.tab:
              if (!"tabKeys" in attrs) {
                return;
              }
              e.preventDefault();
              switch (e.shiftKey) {
                case true:
                  return ctrl.selectPrevious();
                default:
                  return ctrl.selectNext();
              }
          }
        });
      },
      controller: (function() {
        function _Class($scope) {
          this.reselect = bind(this.reselect, this);
          if ($scope.identity == null) {
            this.identity = function(obj) {
              return new function() {
                var key, results, value;
                results = [];
                for (key in obj) {
                  value = obj[key];
                  if (typeof value !== "function" && key[0] !== "$") {
                    results.push(this[key] = value);
                  }
                }
                return results;
              };
            };
          } else {
            this.identity = $scope.identity;
          }
          this.autoSelect = $scope.autoSelect;
          this.choose = function(selection) {
            if (typeof $scope.choose === "function") {
              return $scope.choose(selection, $scope.value, this);
            } else {
              return $scope.choose = selection;
            }
          };
          this.update = function() {
            this.selectedValue = this.getSelectionValue();
            return $scope.$apply();
          };
          this.reset = function() {
            $scope.value = void 0;
            return this.deselect();
          };
          this.getValue = function() {
            return $scope.value;
          };
          this.activateList = function(state) {
            if ((this.choices == null) || this.choices.length === 0) {
              state = false;
            }
            if ($scope.activeList !== state) {
              $scope.activeList = state;
              return this.update();
            }
          };
          this.deselect();
          this.choices = $scope.choices;
          $scope.$watch('choices', (function(_this) {
            return function(choices) {
              _this.reselect(choices);
              return _this.choices = choices;
            };
          })(this));
          if ($scope.update != null) {
            $scope.$watch('value', function(value) {
              return $scope.update(value);
            });
          }
          $scope.isSelected = (function(_this) {
            return function(choice) {
              return choice === _this.getSelectionValue();
            };
          })(this);
          $scope.takeChoice = (function(_this) {
            return function(choice) {
              return _this.choose(choice);
            };
          })(this);
        }
        _Class.$inject = ["$scope"];

        _Class.prototype.cmp = function(a, b) {
          var aProps, bProps, j, key, len, value;
          aProps = (function() {
            var results;
            results = [];
            for (key in a) {
              results.push(key);
            }
            return results;
          })();
          bProps = (function() {
            var results;
            results = [];
            for (key in b) {
              results.push(key);
            }
            return results;
          })();
          if (aProps.length !== bProps.length) {
            return false;
          }
          for (j = 0, len = aProps.length; j < len; j++) {
            key = aProps[j];
            if (bProps.indexOf(key) === -1) {
              return false;
            }
          }
          for (key in a) {
            value = a[key];
            if (b[key] !== value) {
              return false;
            }
          }
          return true;
        };

        _Class.prototype.reselect = function(choices) {
          var autoSelected, choice, i, j, len, reSelected;
          autoSelected = void 0;
          reSelected = void 0;
          if (choices != null) {
            for (i = j = 0, len = choices.length; j < len; i = ++j) {
              choice = choices[i];
              if ((this.autoSelect != null) && (autoSelected == null) && this.autoSelect(this.getValue(), choice)) {
                autoSelected = i;
              }
              if ((this.selectedValue != null) && (reSelected == null) && this.cmp(this.selectedValue, choice)) {
                reSelected = i;
              }
            }
          }
          this.selected = autoSelected != null ? autoSelected : reSelected;
          if (this.selected == null) {
            return this.deselect();
          }
        };

        _Class.prototype.deselect = function() {
          this.selected = void 0;
          return this.selectedValue = void 0;
        };

        _Class.prototype.getSelectionValue = function() {
          if (this.selected != null) {
            return this.choices[this.selected];
          } else {
            return void 0;
          }
        };

        _Class.prototype.selectNext = function() {
          if (!this.choices.length) {
            return;
          }
          this.selected = (function() {
            switch (false) {
              case !((this.selected == null) || this.selected === this.choices.length - 1):
                return 0;
              default:
                return this.selected + 1;
            }
          }).call(this);
          return this.update();
        };

        _Class.prototype.selectPrevious = function() {
          if (!this.choices.length) {
            return;
          }
          this.selected = (function() {
            switch (false) {
              case !((this.selected == null) || this.selected === 0):
                return this.choices.length - 1;
              default:
                return this.selected - 1;
            }
          }).call(this);
          return this.update();
        };

        _Class.prototype.focus = function() {
          if (this.blurring != null) {
            clearTimeout(this.blurring);
          }
          return this.activateList(true);
        };

        _Class.prototype.blur = function(delay) {
          var blur;
          blur = (function(_this) {
            return function() {
              return _this.activateList(false);
            };
          })(this);
          if (delay != null) {
            if (typeof delay === "boolean") {
              delay = 150;
            }
            return this.blurring = setTimeout((function(_this) {
              return function() {
                _this.blurring = void 0;
                return blur();
              };
            })(this), delay);
          } else {
            return blur();
          }
        };

        return _Class;

      })()
    };
  });

}).call(this);
