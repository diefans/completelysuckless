completely suckless
===================

## Objective

Have an input completion, that sucks less.

### Simple interface and no "Schnickschnack"

- You provide a list of choices, where ``sucklessComplete`` is watching on.
- You provide a value, which gets modified by the input element.
    Just watch for changes and update your choices accordingly.
- You provide a callback, which is called when the user makes his choice.
    You can also provide a scope var and watch for changes yourself to get your trigger.


### No assumptions on whatever

- You choose how choices are presented.


## Usage


```coffeescript
angular.module "sucklessFoo", ["completelysuckless"]

.controller "FooController", ($scope) ->
  $scope.choose = (choice) ->
    console.log "your choice", choice

  # if $scope.choose is not a function, watch it
  # $scope.$watch "choose", (choice) ->
  #   console.log "your choice", choice

  $scope.choices = [{name: "foo"}, {name: "bar"}, {name: "baz"}]

  # this is for recognizing a previous selected item on updated choices
  # sucklessComplete will use lodash to do the job otherwise
  $scope.identity = (choice) ->
    return choice.name

  $scope.$watch "value", (value) ->
    console.log "new value", value
    # do something to load new choices...
```

```html
<div data-ng-controller="FooController">
    <!--
        data-tab-keys enables tab and shift-tab to circle through choices,
        thus disabling default focus moves.
    -->
    <suckless-complete
        data-choose="choose"
        data-value="value"
        data-choices="choices"
        data-identity="identity"
        data-tab-keys
        placeholder="enter something...">
        <!--
            choice is one of the choices.
            It is up to you to do highlighting of substrings or whatever
        -->
        <span class="foobar">{{ choice.name }}</span>
    </suckless-complete>
</div>
```



