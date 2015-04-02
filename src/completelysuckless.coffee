"use strict"

angular.module "completelysuckless", []

  .directive "sucklessTranscope", ->
    # see https://github.com/angular/angular.js/issues/7874
    # see http://plnkr.co/edit/FbpFeL?p=preview

    restrict: 'EAC'
    link:
      pre: (scope, element, attrs, ctrl, transclude) ->
        if not transclude?
          # startingTag is closed in newer angular
          NODE_TYPE_TEXT = 3
          startingTag = (element) ->
            element = $(element).clone()
            try
              # turns out IE does not let you set .html() on elements which
              # are not allowed to have children. So we just ignore it.
              element.empty()
            catch e
              # pass

            elemHtml = $('<div>').append(element).html()
            try
              elemHtml if element[0].nodeType == NODE_TYPE_TEXT
              else
                elemHtml.
                match(/^(<[^>]+>)/)[1].
                replace(/^<([\w\-]+)/, (match, nodeName) ->
                  '<' + nodeName
                )
            catch e
              elemHtml

          throw angular.$$minErr('ngTransclude')(
            'orphan',
            'Illegal use of ngTransclude directive in the template!
            No parent directive that requires a transclusion found.
            Element: {0}',
            startingTag(element)
          )

        scopeType = attrs['sucklessTranscope'] || 'parent'

        switch scopeType
          when "sibling"
            transclude (clone) ->
              element.empty()
              element.append(clone)

          when "parent"
            transclude scope, (clone) ->
              element.empty()
              element.append(clone)

          when "child"
            childScope = scope.$new()

            transclude childScope, (clone) ->
              element.empty()
              element.append(clone)
              element.on "$destroy", ->
                childScope.$destroy()

  .directive "sucklessComplete", ->
    restrict: "E"
    require: "sucklessComplete"
    transclude: true
    scope:
      # this is the input value bound from outer scope
      value: "=?"

      # use this callback if you don't bind an object for your value
      # inheritance/double binding is not working on primitive values
      # when used within a ng-if or ng-switch, ...
      # see https://groups.google.com/forum/#!topic/angular/B2uB8-9_Xbk
      # see http://plnkr.co/OllvtOdZoA1vPd4pdKjQ
      update: "=?"

      # these are the choices
      choices: "="

      # a callback or a scope value to set/callback the selected choice
      choose: "="

      # callback to compare two objects
      # this is used to preserve the selection upon reload of choices
      identity: "=?"

      # callback(value, choice): if true will select the choice
      autoSelect: "=?"

    template: '<div class="suckless-complete">
      <input type="text" data-ng-model="value" placeholder="{{ placeholder }}"/>
      <ul data-ng-class="{active: activeList}">
        <li data-ng-repeat="choice in choices"
        data-ng-click="takeChoice(choice)"
        suckless-transcope
        data-ng-class="{selected: isSelected(choice)}"></li>
      </ul>
    </div>
    '
    link: (scope, element, attrs, ctrl) ->
      key =
        tab: 9
        enter: 13
        esc: 27
        left: 37
        up: 38
        right: 39
        down: 40

      # some meta keys
      metaKeys =
        meta: 91
        shift: 16
        caps: 20
        alt: 18
        altGr: 225
        ctrl: 17

      if "placeholder" of attrs then scope.placeholder = attrs.placeholder

      # use data-no-choice to allow choosing a none-selection by pressing enter
      noChoice = attrs.noChoice? and true or false

      # setup event listeners
      inputElement = element.find("input")

      # after choosing the input keeps focused
      inputElement.on "click", (e) ->
        ctrl.focus()

      inputElement.on "focus", (e) ->
        ctrl.focus()

      inputElement.on "blur", (e) ->
        # we blur with delay to catch click on choices
        ctrl.blur(true)

      inputElement.on "keydown", (e) ->
        # just do nothing on meta keys
        (return if e.keyCode == code) for _, code of metaKeys

        # we activate the list of choices on every other key
        ctrl.activateList(true)

        switch e.keyCode
          when key.down
            # stop moving cursor around
            e.preventDefault()
            ctrl.selectNext()

          when key.up
            # stop moving cursor around
            e.preventDefault()
            ctrl.selectPrevious()

          when key.enter
            # choose selected value
            selectionValue = ctrl.getSelectionValue()
            if selectionValue? or noChoice
              ctrl.choose(selectionValue)
              # hide choices
              ctrl.blur()

          when key.esc
            ctrl.blur()

          when key.tab
            # tabKeys attribute enables tab selection
            if not "tabKeys" of attrs then return

            e.preventDefault()

            switch e.shiftKey
              when true then ctrl.selectPrevious()
              else ctrl.selectNext()

    controller: class
      constructor: ($scope) ->
        # this is our default identity function
        if not $scope.identity?
          @identity = (obj) ->
            new -> @[key] = value for key, value of obj \
              when typeof value != "function" and key[0] != "$"

        else
          @identity = $scope.identity

        @autoSelect = $scope.autoSelect

        # choose a selection
        @choose = (selection) ->
          # either callback or set var directly
          if typeof $scope.choose is "function"
            $scope.choose(selection, $scope.value, @)

          else
            $scope.choose = selection

        # new digest on selection change
        @update = ->
          # stores the selected value
          # this is usefull to reselect this value if
          # it is still there when choices change
          @selectedValue = @getSelectionValue()

          $scope.$apply()

        # reset all values
        @reset = ->
          $scope.value = undefined
          @deselect()

        # access input value
        @getValue = ->
          $scope.value

        # set the state of the completion list
        @activateList = (state, update=true) ->
          if not @choices? or @choices.length == 0
            state = false

          if $scope.activeList != state
            $scope.activeList = state

            if update then @update()

        # initialize selection
        @deselect()

        # choices to make a selection in
        @choices = $scope.choices

        $scope.$watch 'choices', (choices) =>
          # XXX at the moment I feel it sane
          # to separate outer choices from inner
          @choices = choices

          # try to find last selection in new choices
          @reselect()

          # don't update, since digest already running
          if @hasFocus then @activateList(true, false)

        # if an update callback is given, we use it
        # this is to overcome inheritance and overriding of object properties
        if $scope.update?
          $scope.$watch 'value', (value) =>
            $scope.update(value, @)

        # just to set css class=selected
        $scope.isSelected = (choice) =>
          choice == @getSelectionValue()

        # for clicking: see template
        $scope.takeChoice = (choice) =>
          @choose(choice)

      # compares two things
      # TODO nested comparision
      cmp: (a, b) ->
        # test property names
        aProps = (key for key of a)
        bProps = (key for key of b)

        # test length
        if aProps.length != bProps.length then return false

        # all properties have to be defined
        for key in aProps
          if bProps.indexOf(key) == -1 then return false

        # all values have to be the same
        for key, value of a
          if b[key] != value then return false

        true

      # find the last selection on choices update
      reselect: =>
        autoSelected = undefined
        reSelected = undefined

        if @choices?
          for choice, i in @choices
            if @autoSelect? and not autoSelected? \
            and @autoSelect(@getValue(), choice)
              autoSelected = i

            if @selectedValue? and not reSelected? \
            and @cmp(@selectedValue, choice)
              reSelected = i

        @selected = if autoSelected? then autoSelected else reSelected

        if not @selected?
          @deselect()

      # reset selection
      deselect: ->
        @selected = undefined
        @selectedValue = undefined

      # return the value of the selected index
      getSelectionValue: ->
        if @selected? then @choices[@selected] else undefined

      # just select the next choice
      selectNext: ->
        # check
        if not @choices.length then return

        @selected = switch
          when not @selected? or @selected == @choices.length - 1 then 0
          else @selected + 1

        @update()

      # select the previous choice
      selectPrevious: ->
        # check
        if not @choices.length then return

        @selected = switch
          when not @selected? or @selected == 0 then @choices.length - 1
          else @selected - 1

        @update()

      focus: ->
        if @blurring? then clearTimeout(@blurring)

        @hasFocus = true
        @activateList(true)

      blur: (delay) ->
        blur = =>
          # TODO switching screens/windows also blurs
          # so the selection is lost after coming back
          #@deselect()
          @activateList(false)
          @hasFocus = false

        if delay?
          if typeof delay == "boolean" then delay = 150
          # input is blurred before click from choice arrives
          # so we delay
          @blurring = setTimeout( =>
            @blurring = undefined
            blur()
          , delay)

        else
          blur()
