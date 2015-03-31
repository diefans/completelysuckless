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

  # select a choice if its lowercase name equals the input value
  $scope.autoSelect: (value, choice) ->
    if value? and value.toLowerCase() == choice.name.toLowerCase()
      true
    else false

  $scope.input =
    value: null

  $scope.$watch "input.value", (value) ->
    console.log "new value", value
    # do something to load new choices...

  # use this if your value is not an object property
  # and you are using suckless-complete within ng-if or ng-switch
  # $scope.updateChoices = (value) ->
  #  console.log "new value", value
  #  # do something to load new choices...
```

```html
<div data-ng-controller="FooController">
    <!--
        data-tab-keys enables tab and shift-tab to circle through choices,
        thus disabling default focus moves.

        data-no-choice enables entering a value without selecting a choice

        data-update="updateChoices" can be useful for primitive input value
    -->
    <suckless-complete
        data-choose="choose"
        data-value="input.value"
        data-choices="choices"
        data-identity="identity"
        data-auto-select="autoSelect"
        data-tab-keys
        data-no-choice
        placeholder="enter something...">
        <!--
            choice is one of the choices.
            It is up to you to do highlighting of substrings or whatever
        -->
        <span class="foobar">{{ choice.name }}</span>
    </suckless-complete>
</div>
```

### Style

There is a minimalistic style applied, just to have it functional.

Since I am just playing with http://groundworkcss.github.io, I have also provided a minimalistic ``suckless_groundwork.sass``.


## Browser support

I tested this with chrome, firefox and opera. I welcome luckily any report from an IE user.


## Bugs, issues, suggestions and collaboration

Feel free to contribute. Stay clean and easy.


## UNLICENSE - payback

You cannot open a source to something, so speaking "releasing" it and in the same moment hold it tight.
If it's out, you have to let it go. You cannot keep control.

If someone wants to keep control of something, if he wants to keep things as they are or he doesn't want something to be modified, used, copied and what else - he MUST keep it secret!
