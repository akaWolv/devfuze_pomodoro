'use strict';

pomodoroApp.controller('PomodorCtrl', function ($scope, $rootScope, socket) {
    //$scope.pomodor = {
    //    current: 0,
    //    email: "",
    //    interval: "",
    //    md5_hash: "",
    //    name: "",
    //    state: "", running/stopped/paused
    //    started_on: "",
    //    current_tme: ""
    //};
    $scope.is_current_user_counter = false;

    $scope.init = function (email) {
        if (angular.isUndefined($rootScope.pomodores[email])) {
            return false;
        }
        $scope.pomodor = $rootScope.pomodores[email];
        //$scope.updateTimer();

        // current user
        if ($scope.pomodor.email == $scope.ConnectionData.user_email) {
            $rootScope.user = $scope.pomodor;
        }

        $scope.calculateCurrentTimeDiff($scope.pomodor.started_on, $rootScope.current_time);

        $scope.is_current_user_counter = $scope.pomodor.email == $scope.ConnectionData.user_email;
    }

    $rootScope.$watch('current_time', function (newValue) {
        $scope.calculateCurrentTimeDiff($scope.pomodor.started_on, newValue);
    });

    socket.on('user update ' + $scope.pomodor.email, function (details) {
        $scope.pomodor = details;
    });

    $rootScope.$watchCollection('pomodores', function (newValue) {
        if (angular.isDefined(newValue[$scope.pomodor.email])) {
            $scope.pomodor = newValue[$scope.pomodor.email];
        }
    });

    $scope.calculateCurrentTimeDiff = function (startedOn, currentTime) {
        var a = new Date(startedOn);
        var b = new Date(currentTime);
        var secondsDiff = parseFloat(b - a) / 1000
        if ('running' == $scope.pomodor.state && false === isNaN(secondsDiff)) {
            if (secondsDiff > $scope.pomodor.seconds_left) {
                $scope.pomodor.current = 0;
                if (true === $scope.is_current_user_counter) {
                    // @todo: current_user?
                    $rootScope.timerUp = true;
                }
            }
            else {
                $scope.pomodor.current = $scope.pomodor.seconds_left - secondsDiff;
            }
        }

        if ($scope.is_current_user_counter) {
            $rootScope.user.current = $scope.pomodor.current;
        }
    }

    $scope.pomodorClass = function () {
        var name = '';
        switch ($scope.pomodor.state) {
            case 'running':
                switch ($scope.pomodor.interval) {
                    case '5':
                        name = 'colors-interval-5'
                        break;
                    case '25':
                        name = 'colors-interval-25'
                        break;
                    default:
                        name = 'colors-interval-break'
                        break;
                }
                break;
            case 'stopped':
                name = 'colors-interval-break'
                break;
            case 'paused':
                name = 'colors-interval-pause'
                break;
        }
        return name;
    }

    $scope.currentStateColor = function (darkMode) {
        var colorHex = '';
        if (true === darkMode) {
            // dark mode
            switch ($scope.pomodor.state) {
                case 'running':
                    switch ($scope.pomodor.interval) {
                        case '5':
                            colorHex = '#ADFF2F';
                            break;
                        case '25':
                            colorHex = '#e4262c';
                            break;
                        default:
                            colorHex = '#F0F0F0';
                            break;
                    }
                    break;
                case 'stopped':
                    colorHex = '#000000';
                    break;
                case 'paused':
                    colorHex = '#ffff00';
                    break;
            }
        } else {
            // light mode
            switch ($scope.pomodor.state) {
                case 'running':
                    switch ($scope.pomodor.interval) {
                        case '5':
                            colorHex = '#ADFF2F';
                            break;
                        case '25':
                            colorHex = '#e4262c';
                            break;
                        default:
                            colorHex = '#F0F0F0';
                            break;
                    }
                    break;
                case 'stopped':
                    colorHex = '#aaa';
                    break;
                case 'paused':
                    colorHex = '#ffff00';
                    break;
            }
        }
        return colorHex;
    }

    $scope.userBoxMainColor = function (darkMode) {
        return true === darkMode ? '#262626' : '#FFFFFF';
    }

    $scope.getUserBoxStyle = function (darkMode) {
        if (true === darkMode) {
            return "" +
                "background: -webkit-linear-gradient(0deg, " + $scope.currentStateColor(darkMode) + " -150%, " + $scope.userBoxMainColor(darkMode) + " 95%);" +
                "background:    -moz-linear-gradient(0deg, " + $scope.currentStateColor(darkMode) + " -150%, " + $scope.userBoxMainColor(darkMode) + " 95%);" +
                "background:      -o-linear-gradient(0deg, " + $scope.currentStateColor(darkMode) + " -150%, " + $scope.userBoxMainColor(darkMode) + " 95%);" +
                "background:         linear-gradient(0deg, " + $scope.currentStateColor(darkMode) + " -150%, " + $scope.userBoxMainColor(darkMode) + " 95%);";
        } else {
            return "" +
                "background: -webkit-linear-gradient(0deg, " + $scope.currentStateColor(darkMode) + " -150%, " + $scope.userBoxMainColor(darkMode) + " 95%);" +
                "background:    -moz-linear-gradient(0deg, " + $scope.currentStateColor(darkMode) + " -150%, " + $scope.userBoxMainColor(darkMode) + " 95%);" +
                "background:      -o-linear-gradient(0deg, " + $scope.currentStateColor(darkMode) + " -150%, " + $scope.userBoxMainColor(darkMode) + " 95%);" +
                "background:         linear-gradient(0deg, " + $scope.currentStateColor(darkMode) + " 0%, " + $scope.userBoxMainColor(darkMode) + " 95%);";
        }
    }

    $scope.pomodorText = function () {
        var text = '';
        switch ($scope.pomodor.state) {
            case 'running':
                switch ($scope.pomodor.interval) {
                    case '5':
                        text = 'minor tasks'
                        break;
                    case '25':
                        text = 'do not disturb'
                        break;
                    default:
                        text = 'waiting'
                        break;
                }
                break;
            case 'stopped':
                text = 'waiting'
                break;
            case 'paused':
                text = 'idle'
                break;
        }
        return text;
    }

    if (angular.isUndefined($rootScope.user.email) || $rootScope.user.email == $scope.pomodor.email) {
        $scope.show_notify_checkbox = false;
        return false;
    } else {
        $scope.show_notify_checkbox = true;
    }
});