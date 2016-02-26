'use strict';

angular.module('bars.meal', [
])

.controller('meal.ctrl',
    ['$scope', '$element', '$timeout', '$rootScope', 'api.models.account', 'bars.meal',
    function($scope, $element, $timeout, $rootScope, Account, Meal) {
        $scope.meal = Meal;
        var accounts = Account.all();
        $scope.accountsf = function (v) {
            return _.filter(Account.all(), function (a) {
                return a.filter(v);
            });
        };
        var openned = false;
        var _this = this;
        this.toggle = function () {
            $timeout(function () {
                $element.triggerHandler(openned ? 'close' : 'open');
                openned = !openned;
            });
        };
        var close = function () {
            if (openned) {
                _this.toggle();
            }
        }
        var open = function () {
            if (!openned) {
                _this.toggle();
            }
        }
        $rootScope.$on('auth.hasLoggedOut', close);
        $rootScope.$on('meal.hasBeenValidated', close);
        $rootScope.$on('meal.begin', open);
    }]
)
.directive('popoverMeal', function() {
  return {
    scope: true,
    controller: 'meal.ctrl',
    link: function(scope, element, attrs, ctrl) {
        return element.on('click', ctrl.toggle);
    }
  };
})
.factory('bars.meal',
    ['$rootScope', '$timeout', 'storage.bar', 'api.models.sellitem', 'api.models.account', 'api.services.action', 'auth.user',
    function ($rootScope, $timeout, storage, SellItem, Account, APIAction, AuthUser) {
        var meal = {
            customersList: [],
            itemsList: [],
            totalPrice: 0,
            accountToAdd: "",
            account: null,
            inRequest: false,
            name: "",
            errorMessage: "",
            /**
             * Initialise la bouffe à plusieurs
             * Elle ne contient pas d'aliment, et uniquement l'utilisateur courant
             */
            init: function() {
                this.customersList = [ { account: this.account, ratio: 1, amount: 0 } ];
                this.itemsList = [];
                this.totalPrice = 0;
                this.accountToAdd = "";
                this.inRequest = false;
                this.name = "";
                this.errorMessage = "";
            },
            /**
             * Calcule le montant total de la bouffe à plusieurs,
             * le montant payé par chaque utilisateur,
             * et la valeur de chaque aliment,
             * et stocke tout ça
             */
            recomputeAmount: function() {
                var nbParts = 0; // nombre de parts pour le calcul (somme des ratios)
                _.forEach(this.customersList, function(customer) {
                    nbParts += customer.ratio;
                });

                var nbCustomers = this.customersList.length;
                var nbItems = this.itemsList.length;

                var totalPrice = 0;
                _.forEach(this.itemsList, function(item, i) {
                    totalPrice += item.item.fuzzy_price * item.buy_qty;
                });

                _.forEach(this.customersList, function(customer) {
                    customer.amount = totalPrice * customer.ratio / nbParts;
                });
                this.totalPrice = totalPrice;

                // recomputeAmount is called with each change
                // so we save at this time
                this.save();
            },
            /**
             * Ajoute un utilisateur à la bouffe à plusieurs
             * @param account Objet Account de la personne à ajouter
             * Les autres paramètres sont utilisés par ui-bootstrap typehead qui
             * appelle cette fonction, mais on ne les utilise pas
             */
            addCustomer: function(account, model, label) {
                var other = _.find(this.customersList, {'account': account});
                if (!other) {
                    this.customersList.push({ account: account, ratio: 1, amount: 0 });
                }
                this.accountToAdd = '';
                this.recomputeAmount();
            },
            /**
             * Supprime un utilisateur de la bouffe à plusieurs
             * @param cstmr Objet Account de la personne à retirer
             */
            removeCustomer: function(cstmr) {
                this.customersList.splice(this.customersList.indexOf(cstmr), 1);
                this.recomputeAmount();
            },
            /**
             * Ajoute un aliment à la bouffe à plusieurs
             * @param item Objet SellItem à ajouter
             * @param qty float Quantité
             * @param keepClose boolean true=ne pas afficher le panel de la bouffe
             * à plusieurs si ça n'est pas déjà le cas, false=afficher le panel
             * de la bouffe à plusieurs si ça n'est pas déjà le cas
             */
            addItem: function(item, qty, keepClose) {
                if (!this.in() && !keepClose) {
                    $rootScope.$broadcast('meal.begin');
                }
                if (!qty) {
                    qty = 1;
                }
                var other = _.find(this.itemsList, {'item': item});
                if (other) {
                    other.buy_qty += qty;
                } else {
                    this.itemsList.push({ item: item, buy_qty: qty });
                }
                this.recomputeAmount();
            },
            /**
             * Retirer un aliment de la bouffe à plusieurs
             * @param item Objet SellItem à retirer
             */
            removeItem: function(item) {
                this.itemsList.splice(this.itemsList.indexOf(item), 1);
                this.recomputeAmount();
            },
            filterAccounts: function(o) {
                return o.filter(this.accountToAdd);
            },
            isValidatable: function() {
                return this.totalPrice > 0 &&
                _.find(this.customersList, function (customer) {
                    return customer.ratio > 0;
                }) &&
                _.find(this.itemsList, function (item) {
                    return item.buy_qty > 0;
                });
            },
            /**
             * Envoie la bouffe à plusieurs au serveur et la réinitialise
             */
            validate: function() {
                this.inRequest = true;
                var data = {
                    items: [],
                    accounts: _.filter(this.customersList, function(customer) { return customer.ratio > 0; }),
                    name: this.name
                };
                _.forEach(this.itemsList, function(item) {
                    if (item.buy_qty > 0) {
                        data.items.push({
                            qty: item.buy_qty,
                            sellitem: item.item
                        });
                    }
                });
                var refThis = this;
                APIAction.meal(data)
                .then(function() {
                    $rootScope.$broadcast('meal.hasBeenValidated');
                    refThis.init();
                    delete storage.get('meal')[AuthUser.user.id];
                    document.getElementById("magic_bar").focus();
                })
                .catch(function() {
                    refThis.error("Impossible d'enregistrer la bouffe à plusieurs");
                });
            },
            /**
             * Affiche une erreur pendant 3 secondes
             * @param message string Message à afficher
             * @param duration int (facultatif, default = 4000) Nombre de
             * millisecondes pendant lesquelles afficher le message
             */
            error: function(message, duration) {
                var _this = this;
                _this.errorMessage = message;
                duration = duration || 4000;
                $timeout(function () {
                    _this.errorMessage = "";
                }, duration);
            },
            /**
             * Retourne true si on est en train de faire une bouffe à plusieurs,
             * false sinon
             */
            in: function() {
                return this.customersList.length > 1 || this.itemsList.length > 0;
            },
            /**
             * Restaurer la bouffe à plusieurs à partir des données sauvegardées
             * dans le localStorage du navigateur
             */
            restore: function() {
                var sinfos = storage.get('meal')[AuthUser.user.id];
                if (sinfos) {
                    // Si la sauvegarde date d'il y a plus de 12h, on supprime
                    if (moment(sinfos.date).isBefore(moment().subtract(12, 'hours'))) {
                        delete storage.get('meal')[AuthUser.user.id];
                        return;
                    }
                    this.name = sinfos.name;
                    _.forEach(sinfos.items, function (item) {
                        this.itemsList.push({ item: SellItem.get(item.id), buy_qty: item.buy_qty });
                    }, this);
                    this.customersList = [];
                    _.forEach(sinfos.customers, function (customer) {
                        this.customersList.push({ account: Account.get(customer.id), ratio: customer.ratio, amount: 0 });
                    }, this);

                    this.recomputeAmount();
                }
            },
            /**
             * Sauvegarde la bouffe à plusieurs courante dans le localStorage
             * du navigateur. On peut stocker une bouffe par utilisateur par bar
             */
            save: function() {
                var data = {
                    name: this.name,
                    items: [],
                    customers: [],
                    date: new Date()
                };

                _.forEach(this.itemsList, function (item) {
                    data.items.push({id: item.item.id, buy_qty: item.buy_qty});
                });
                _.forEach(this.customersList, function (customer) {
                    data.customers.push({id: customer.account.id, ratio: customer.ratio});
                });

                storage.get('meal')[AuthUser.user.id] = data;
            }
        };

        $rootScope.$on('auth.hasLoggedIn', function () {
            meal.account = AuthUser.account;
            meal.init();
            meal.restore();
        });
        $rootScope.$on('auth.hasLoggedOut', function () {
            meal.init();
        });
        return meal;
    }]
)
;
