/** UI copy — English / French (CD). Extend keys as screens are migrated. */

export type I18nKey = keyof typeof I18N;

export const I18N = {
  // Navigation (sidebar / mobile tabs reuse when label matches)
  'nav.dashboard': { en: 'Dashboard', fr: 'Tableau de bord' },
  'nav.frontDesk': { en: 'Front desk', fr: 'Accueil' },
  'nav.myDesk': { en: 'My desk', fr: 'Mon poste' },
  'nav.staff': { en: 'Staff', fr: 'Personnel' },
  'nav.branches': { en: 'Branches', fr: 'Branches' },
  'nav.barbers': { en: 'Barbers', fr: 'Barbiers' },
  'nav.services': { en: 'Services', fr: 'Prestations' },
  'nav.customers': { en: 'Customers', fr: 'Clients' },
  'nav.transactions': { en: 'Transactions', fr: 'Opérations' },
  'nav.saleForm': { en: 'Sale form (page)', fr: 'Vente (page)' },
  'nav.settings': { en: 'Settings', fr: 'Réglages' },

  // Mobile bottom nav (short labels)
  'mobile.desk': { en: 'Desk', fr: 'Poste' },
  'mobile.home': { en: 'Home', fr: 'Accueil' },
  'mobile.sales': { en: 'Sales', fr: 'Ventes' },
  'mobile.more': { en: 'More', fr: 'Plus' },

  // Shell chrome
  'shell.salonOps': { en: 'Salon ops', fr: 'Exploitation salon' },
  'shell.internal': { en: 'Internal', fr: 'Interne' },
  'shell.controlCenter': { en: 'Control center', fr: 'Centre de contrôle' },
  'shell.closeMenu': { en: 'Close menu', fr: 'Fermer le menu' },
  'shell.menuAria': { en: 'Menu', fr: 'Menu' },
  'shell.language': { en: 'Language', fr: 'Langue' },
  'shell.currency': { en: 'Currency', fr: 'Devise' },
  'shell.newSale': { en: 'New sale', fr: 'Nouvelle vente' },
  'shell.receipts': { en: 'Receipts', fr: 'Reçus' },
  'shell.themeDark': { en: 'Dark mode', fr: 'Mode sombre' },
  'shell.themeLight': { en: 'Light mode', fr: 'Mode clair' },
  /** Prefix before user name — keep trailing space where used in templates */
  'shell.accountMenuFor': { en: 'Account menu for ', fr: 'Menu compte pour ' },
  'shell.primaryMobileNav': { en: 'Primary', fr: 'Principal' },

  // Quick actions (FAB strip)
  'qa.newSale': { en: 'New sale', fr: 'Nouvelle vente' },
  'qa.receipts': { en: 'Receipts', fr: 'Reçus' },
  'qa.whatsapp': { en: 'WhatsApp', fr: 'WhatsApp' },
  'qa.barbers': { en: 'Barbers', fr: 'Barbiers' },
  'qa.sales': { en: 'Sales', fr: 'Ventes' },
  'qa.reports': { en: 'Reports', fr: 'Rapports' },
  'qa.addBranch': { en: 'Add branch', fr: 'Ajouter une branche' },
  'qa.addStaff': { en: 'Add staff', fr: 'Ajouter personnel' },
  'qa.addBarber': { en: 'Add barber', fr: 'Ajouter barbier' },
  'qa.myEarnings': { en: 'My earnings', fr: 'Mes gains' },
  'qa.myActivity': { en: 'My activity', fr: 'Mon activité' },
  'qa.profile': { en: 'Profile', fr: 'Profil' },

  // Account menu sheet
  'menu.logout': { en: 'Log out', fr: 'Déconnexion' },
  'menu.navAria': { en: 'Account navigation', fr: 'Navigation du compte' },
  'menu.settings': { en: 'Settings', fr: 'Réglages' },
  'menu.settingsHint': { en: 'Profile & workspace', fr: 'Profil et espace de travail' },
  'menu.dashboard': { en: 'Dashboard', fr: 'Tableau de bord' },
  'menu.dashboardHint': { en: 'Overview & performance', fr: 'Vue d’ensemble et performance' },
  'menu.myDeskHint': { en: 'Earnings & activity', fr: 'Gains et activité' },
  'menu.frontDeskHint': { en: 'Checkout & receipts', fr: 'Caisse et reçus' },
  'menu.transactionsHint': { en: 'Sales & receipt history', fr: 'Historique ventes et reçus' },
  'menu.staffHint': { en: 'People & branch access', fr: 'Équipes et accès aux branches' },
  'menu.barbersHint': { en: 'Roster & commissions', fr: 'Liste et commissions' },

  // Login
  'login.heroKicker': { en: 'Mubase Saloon', fr: 'Mubase Saloon' },
  'login.heroTitle': { en: 'Operations, elevated.', fr: 'L’opération au sommet.' },
  'login.heroSubtitle': {
    en: 'Internal dashboard for four branches — mock data today, your Nest API tomorrow.',
    fr: 'Tableau de bord interne pour quatre branches — données simulées aujourd’hui, votre API Nest demain.',
  },
  'login.bulletPermissions': {
    en: 'Owner, manager, accountant, and barber permissions match a real internal ops model.',
    fr: 'Propriétaire, gestionnaire, caissier(e) et barbier — droits comme en exploitation réelle.',
  },
  'login.bulletTheme': {
    en: 'Try dark mode after sign-in — use the theme button in the header.',
    fr: 'Essayez le mode sombre après connexion avec le bouton du bandeau.',
  },
  'login.signIn': { en: 'Sign in', fr: 'Connexion' },
  'login.signInSubtitle': {
    en: 'Demo · seeded accounts use password MubaseDemo2024!',
    fr: 'Démo · les comptes fournis utilisent le mot de passe MubaseDemo2024!',
  },
  'login.email': { en: 'Email', fr: 'Courriel' },
  'login.password': { en: 'Password', fr: 'Mot de passe' },
  'login.submit': { en: 'Continue', fr: 'Continuer' },
  'login.signingIn': { en: 'Signing in…', fr: 'Connexion…' },
  'login.demoAccounts': { en: 'Demo accounts', fr: 'Comptes démo' },
  'login.demoSubtitle': {
    en: 'One tap fills the form',
    fr: 'Un toucher préremplit le formulaire',
  },
  'login.invalidCreds': {
    en: 'Invalid email or password (use demo list).',
    fr: 'Courriel ou mot de passe invalide (utilisez la liste démo).',
  },
  'login.role.owner': { en: 'Owner', fr: 'Propriétaire' },
  'login.role.manager': { en: 'Manager', fr: 'Gestionnaire' },
  'login.role.barber': { en: 'Barber', fr: 'Barbier' },
  'login.role.accountant': { en: 'Accountant', fr: 'Caissier' },
  'login.role.receptionist': { en: 'Receptionist', fr: 'Réceptionniste' },

  // Page titles & subtitles (feature pages — extend as needed)
  'page.settings.title': { en: 'Settings', fr: 'Réglages' },
  'page.settings.subtitle': {
    en: 'Session · mock preferences only',
    fr: 'Session · préférences simulées',
  },

  'page.services.title': { en: 'Services', fr: 'Prestations' },
  'page.services.subtitle': {
    en: 'Catalog by branch · pricing reference',
    fr: 'Catalogue par branche · prix de référence',
  },

  'page.customers.title': { en: 'Customers', fr: 'Clients' },
  'page.customers.subtitle': {
    en: 'Company-wide directory · salons visited are inferred from recorded sales',
    fr: 'Carnet unique · salons fréquentés déduits des ventes',
  },
  'page.staff.title': { en: 'Staff', fr: 'Personnel' },
  'page.staff.subtitle': {
    en: 'Managers, accountants, assignments · owner only (mock)',
    fr: 'Gestionnaires, caissiers, affectations · propriétaire seulement (simulation)',
  },
  'page.transactions.title': { en: 'Transactions', fr: 'Opérations' },
  'page.transactions.subtitle': {
    en: 'Ledger · details and receipt preview',
    fr: 'Journal · détails et aperçu des reçus',
  },
  'page.transactions.filterAllBranches': {
    en: 'All branches',
    fr: 'Toutes les branches',
  },
  'page.transactions.filterAllBarbers': {
    en: 'All barbers',
    fr: 'Tous les barbiers',
  },
  'page.transactions.searchPlaceholder': {
    en: 'Search customer or receipt…',
    fr: 'Rechercher client ou reçu…',
  },
  'page.transactions.statToday': { en: 'Today', fr: 'Aujourd’hui' },
  'page.transactions.statThisWeek': { en: 'This week', fr: 'Cette semaine' },
  'page.transactions.statThisMonth': { en: 'This month', fr: 'Ce mois-ci' },
  'page.transactions.statFilteredTotal': {
    en: 'Filtered total',
    fr: 'Total filtré',
  },
  'page.transactions.hintFilteredListSuffix': {
    en: ' · filtered list',
    fr: ' · liste filtrée',
  },
  'page.transactions.salesCountSuffix': {
    en: ' sales',
    fr: ' ventes',
  },
  'page.transactions.colWhen': { en: 'When', fr: 'Quand' },
  'page.transactions.colReceipt': { en: 'Receipt', fr: 'Reçu' },
  'page.transactions.colBranch': { en: 'Branch', fr: 'Branche' },
  'page.transactions.colCustomer': { en: 'Customer', fr: 'Client' },
  'page.transactions.colService': { en: 'Service', fr: 'Prestation' },
  'page.transactions.colPay': { en: 'Pay', fr: 'Paiement' },
  'page.transactions.colBarber': { en: 'Barber', fr: 'Barbier' },
  'page.transactions.colTotal': { en: 'Total', fr: 'Total' },
  'page.transactions.viewTxAria': { en: 'View transaction', fr: 'Voir l’opération' },
  'page.transactions.emptyFiltered': {
    en: 'No transactions match your filters.',
    fr: 'Aucune opération ne correspond aux filtres.',
  },
  'page.transactions.detailTitleFallback': {
    en: 'Transaction',
    fr: 'Opération',
  },
  'page.transactions.modalDescPreview': {
    en: 'Settlement detail · mock receipt preview',
    fr: 'Détail de règlement · aperçu de reçu simulé',
  },
  'page.transactions.labelService': { en: 'Service', fr: 'Prestation' },
  'page.transactions.labelBarber': { en: 'Barber', fr: 'Barbier' },
  'page.transactions.labelPhone': { en: 'Phone', fr: 'Téléphone' },
  'page.transactions.labelWhatsapp': { en: 'WhatsApp', fr: 'WhatsApp' },
  'page.transactions.labelTotal': { en: 'Total', fr: 'Total' },
  'page.transactions.labelBarberShare': {
    en: 'Barber share',
    fr: 'Part barbier',
  },
  'page.transactions.labelShopShare': { en: 'Shop share', fr: 'Part salon' },
  'page.transactions.receiptHeading': {
    en: 'Receipt',
    fr: 'Reçu',
  },
  'page.transactions.receiptThankYou': {
    en: 'Thank you,',
    fr: 'Merci,',
  },
  'page.transactions.receiptMockFooter': {
    en: 'Mubase Saloon · mock printable preview',
    fr: 'Mubase Saloon · aperçu imprimable simulé',
  },
  'page.transactions.barberPctSuffix': {
    en: ' barber',
    fr: ' barbier',
  },
  'page.transactions.deleteMock': {
    en: 'Delete (mock)',
    fr: 'Supprimer (simulé)',
  },
  'page.transactions.close': { en: 'Close', fr: 'Fermer' },
  'page.transactions.printReceipt': {
    en: 'Print receipt',
    fr: 'Imprimer le reçu',
  },
  'page.transactions.deleteConfirmTitle': {
    en: 'Delete this transaction?',
    fr: 'Supprimer cette opération ?',
  },
  'page.transactions.deleteConfirmMessage': {
    en: 'Removes the row and receipt from the mock ledger.',
    fr: 'Supprime la ligne et le reçu du journal simulé.',
  },
  'page.transactions.deleteConfirmLabel': {
    en: 'Delete',
    fr: 'Supprimer',
  },

  // Shared table pager
  'paginator.rowsPerPage': { en: 'Rows per page', fr: 'Lignes par page' },
  'paginator.rangeOf': { en: 'of', fr: 'sur' },
  'paginator.ariaFirst': { en: 'First page', fr: 'Première page' },
  'paginator.ariaPrev': { en: 'Previous page', fr: 'Page précédente' },
  'paginator.ariaNext': { en: 'Next page', fr: 'Page suivante' },
  'paginator.ariaLast': { en: 'Last page', fr: 'Dernière page' },
  'page.barbers.title': { en: 'Barbers', fr: 'Barbiers' },
  'page.barbers.subtitle': {
    en: 'Roster · commissions · mock earnings',
    fr: 'Liste · commissions · gains simulés',
  },
  'page.branches.title': { en: 'Branches', fr: 'Branches' },
  'page.branches.subtitle': {
    en: 'Locations · performance snapshot · mock directory',
    fr: 'Points de vente · vue performance · répertoire simulé',
  },
  /** Branches — grid cards */
  'page.branches.addCta': { en: 'Add branch', fr: 'Ajouter une branche' },
  'page.branches.statLocations': { en: 'Locations', fr: 'Points de vente' },
  'page.branches.statActive': { en: 'Active', fr: 'Actives' },
  'page.branches.statRevenue': { en: 'Revenue', fr: 'Chiffre d’affaires' },
  'page.branches.statTransactions': { en: 'Transactions', fr: 'Opérations' },
  'page.branches.cardRevenueDt': { en: 'Revenue', fr: 'CA' },
  'page.branches.cardShopDt': { en: 'Shop', fr: 'Part salon' },
  'page.branches.cardTxDt': { en: 'Tx', fr: 'Op.' },

  'page.accountant.title': { en: 'Front desk', fr: 'Accueil / Caisse' },
  'page.accountant.subtitle': {
    en: 'Sales & receipts · manual WhatsApp follow-up',
    fr: 'Ventes et reçus · suivi WhatsApp manuel',
  },
  'page.myDesk.title': { en: 'My desk', fr: 'Mon poste' },
  'page.myDesk.subtitle': {
    en: 'Your performance · mock payouts',
    fr: 'Votre performance · reversements simulés',
  },

  // New sale modal / operations
  'sale.modalTitle': {
    en: 'New sale',
    fr: 'Nouvelle vente',
  },
  'sale.modalDescription': {
    en: 'Front desk · mock ledger updates instantly',
    fr: 'Accueil · le journal simulé se met à jour instantanément',
  },

  /** Shared actions — modals, buttons */
  'common.cancel': { en: 'Cancel', fr: 'Annuler' },
  'common.save': { en: 'Save', fr: 'Enregistrer' },
  'common.confirm': { en: 'Confirm', fr: 'Confirmer' },
  'common.delete': { en: 'Delete', fr: 'Supprimer' },
  'common.deactivate': { en: 'Deactivate', fr: 'Désactiver' },
  'common.remove': { en: 'Remove', fr: 'Retirer' },
  'validation.passwordMin8': {
    en: 'Password must be at least 8 characters.',
    fr: 'Le mot de passe doit contenir au moins 8 caractères.',
  },
  'validation.passwordMismatch': {
    en: 'Password confirmation does not match.',
    fr: 'La confirmation ne correspond pas au mot de passe.',
  },
  'validation.emailTaken': {
    en: 'This email is already used by another user.',
    fr: 'Cette adresse courriel est déjà utilisée par un autre compte.',
  },

  /** Modal accessibility */
  'modal.ariaCloseDialog': { en: 'Close dialog', fr: 'Fermer la fenêtre' },
  'modal.ariaClose': { en: 'Close', fr: 'Fermer' },

  /** Kebab / ellipsis menus (mb-action-menu) */
  'actionMenu.ariaOpen': { en: 'Open actions', fr: 'Ouvrir les actions' },
  'actionMenu.viewDetails': { en: 'View details', fr: 'Voir le détail' },
  'actionMenu.edit': { en: 'Edit', fr: 'Modifier' },
  'actionMenu.delete': { en: 'Delete', fr: 'Supprimer' },
  'actionMenu.openTransactions': { en: 'Open transactions', fr: 'Ouvrir les opérations' },
  'actionMenu.deactivate': { en: 'Deactivate', fr: 'Désactiver' },
  'actionMenu.removeAssignment': {
    en: 'Remove assignment',
    fr: 'Retirer l’affectation',
  },
  'actionMenu.viewPerformance': {
    en: 'View performance',
    fr: 'Voir les performances',
  },
  'actionMenu.editBarber': { en: 'Edit barber', fr: 'Modifier le barbier' },
  'actionMenu.editStaffAccount': {
    en: 'Edit account',
    fr: 'Modifier le compte',
  },

  /** New sale modal — form & success panel */
  'sale.section.sale': { en: 'Sale', fr: 'Vente' },
  'sale.section.customer': { en: 'Customer', fr: 'Client' },
  'sale.section.checkout': { en: 'Checkout summary', fr: 'Récapitulatif' },
  'sale.field.branch': { en: 'Branch', fr: 'Branche' },
  'sale.placeholder.chooseBranch': { en: 'Choose branch', fr: 'Choisir la branche' },
  'sale.field.barber': { en: 'Barber', fr: 'Barbier' },
  'sale.placeholder.chooseBarber': { en: 'Choose barber', fr: 'Choisir un barbier' },
  'sale.field.service': { en: 'Service', fr: 'Prestation' },
  'sale.field.serviceHint': { en: 'Price loads from catalog — editable', fr: 'Prix du catalogue — modifiable' },
  'sale.placeholder.walkIn': {
    en: 'Custom / walk-in',
    fr: 'Personnalisé / sans réservation',
  },
  'sale.field.amountUsd': {
    en: 'Amount (USD)',
    fr: 'Montant (USD)',
  },
  'sale.field.existingCustomer': {
    en: 'Existing customer',
    fr: 'Client existant',
  },
  'sale.field.existingCustomerHint': {
    en: 'Pick someone already on file, or leave empty to create from the fields below',
    fr: 'Choisir un client enregistré, ou laisser vide pour remplir ci-dessous',
  },
  'sale.placeholder.newCustomerBelow': {
    en: 'New customer — use name below',
    fr: 'Nouveau client — saisir le nom ci-dessous',
  },
  'sale.customerSearch.placeholder': {
    en: 'Search customers…',
    fr: 'Rechercher des clients…',
  },
  'sale.customerSearch.aria': {
    en: 'Filter customer list',
    fr: 'Filtrer la liste des clients',
  },
  'sale.customerSearch.noMatches': {
    en: 'No customers match your search.',
    fr: 'Aucun client ne correspond.',
  },
  'sale.field.displayName': { en: 'Display name', fr: 'Nom affiché' },
  'sale.field.displayNameHint': {
    en: 'On receipt; if nobody is selected above, we save this person for this branch',
    fr: 'Sur le reçu ; sinon enregistré pour cette branche',
  },
  'sale.field.whatsapp': { en: 'WhatsApp number', fr: 'Numéro WhatsApp' },
  'sale.field.whatsappHint': {
    en: 'Optional — for receipts and follow-up',
    fr: 'Optionnel — pour reçus et suivi',
  },
  'sale.field.notes': { en: 'Notes', fr: 'Notes' },
  'sale.field.notesHint': {
    en: 'Optional — internal memo for this sale',
    fr: 'Optionnel — mémo interne pour cette vente',
  },
  'sale.placeholder.notes': {
    en: 'e.g. product add-on, VIP, special request…',
    fr: 'ex. supplément produit, VIP, demande particulière…',
  },
  'sale.badge.liveSplit': { en: 'Live split', fr: 'Partage en direct' },
  'sale.preview.barberPct': { en: 'Barber %', fr: '% barbier' },
  'sale.preview.barberEarns': { en: 'Barber earns', fr: 'Part barbier' },
  'sale.preview.shopEarns': { en: 'Shop earns', fr: 'Part salon' },
  'sale.field.payment': { en: 'Payment method', fr: 'Moyen de paiement' },
  'sale.placeholder.payment': {
    en: 'Payment',
    fr: 'Paiement',
  },
  'sale.pay.cash': { en: 'Cash', fr: 'Espèces' },
  'sale.pay.card': { en: 'Card', fr: 'Carte' },
  'sale.pay.transfer': { en: 'Transfer', fr: 'Virement' },
  'sale.pay.other': { en: 'Other', fr: 'Autre' },
  'sale.submitPost': {
    en: 'Post payment',
    fr: 'Enregistrer le paiement',
  },
  'sale.resetForm': {
    en: 'Reset',
    fr: 'Réinitialiser',
  },
  'sale.option.customWalkIn': {
    en: 'Custom / walk-in',
    fr: 'Personnalisé / sans réservation',
  },
  'sale.option.notOnList': {
    en: 'Not on list — new or walk-in',
    fr: 'Pas sur la liste — nouveau',
  },
  'sale.success.paymentRecorded': {
    en: 'Payment recorded',
    fr: 'Paiement enregistré',
  },
  'sale.success.barberPayout': { en: 'Barber payout', fr: 'Part barbier' },
  'sale.success.shopShare': { en: 'Shop share', fr: 'Part salon' },
  'sale.success.commission': { en: 'Commission', fr: 'Commission' },
  'sale.success.receipt': { en: 'Receipt', fr: 'Reçu' },
  'sale.success.service': {
    en: 'Service',
    fr: 'Prestation',
  },
  'sale.success.when': {
    en: 'When',
    fr: 'Quand',
  },
  'sale.whatsapp.cta': { en: 'Send WhatsApp', fr: 'Envoyer WhatsApp' },
  'sale.whatsapp.titleAttr': {
    en: 'Opens WhatsApp with a prefilled thank-you message (you send manually)',
    fr: 'Ouvre WhatsApp avec un message prérempli (envoi manuel)',
  },
  'sale.recordAnother': {
    en: 'Record another',
    fr: 'Autre vente',
  },
  'sale.done': { en: 'Done', fr: 'Terminé' },
  'sale.whatsapp.note': {
    en:
      'WhatsApp opens in a new tab. If no mobile number is on file, you can still copy the message from the generic chat link.',
    fr:
      'WhatsApp s’ouvre dans un nouvel onglet. Sans numéro mobile, vous pouvez copier le message depuis le lien générique.',
  },

  /** Barbers — modals & confirm */
  'page.barbers.modalCreate': {
    en: 'Create barber account',
    fr: 'Créer un compte barbier',
  },
  'page.barbers.modalEdit': {
    en: 'Edit barber',
    fr: 'Modifier le barbier',
  },
  'page.barbers.fieldWorkEmail': {
    en: 'Work email (login)',
    fr: 'Courriel professionnel (connexion)',
  },
  'page.barbers.fieldWorkEmailHint': {
    en: 'Used to sign in together with the password you set.',
    fr: 'Utilisé pour la connexion avec le mot de passe défini.',
  },
  'page.barbers.fieldPasswordCreate': {
    en: 'Login password',
    fr: 'Mot de passe de connexion',
  },
  'page.barbers.fieldPasswordConfirm': {
    en: 'Confirm password',
    fr: 'Confirmer le mot de passe',
  },
  'page.barbers.accountSection': {
    en: 'Account',
    fr: 'Compte',
  },
  'page.barbers.changePasswordHint': {
    en: 'Leave blank to keep current password. Minimum 8 characters.',
    fr: 'Laisser vide pour garder le mot de passe actuel (≥8 caractères).',
  },
  'page.barbers.fieldFullName': { en: 'Full name', fr: 'Nom complet' },
  'page.barbers.fieldDisplayName': { en: 'Display name', fr: 'Nom affiché' },
  'page.barbers.fieldBranch': { en: 'Branch', fr: 'Branche' },
  'page.barbers.placeholderBranch': { en: 'Branch', fr: 'Branche' },
  'page.barbers.fieldCommission': { en: 'Commission %', fr: 'Commission %' },
  'page.barbers.fieldCommissionHint': {
    en: 'Barber share of service total',
    fr: 'Part du barbier sur le total prestation',
  },
  'page.barbers.fieldStatus': { en: 'Status', fr: 'Statut' },
  'page.barbers.placeholderStatus': { en: 'Status', fr: 'Statut' },
  'page.barbers.confirmOffTitle': {
    en: 'Deactivate barber?',
    fr: 'Désactiver ce barbier ?',
  },
  'page.barbers.confirmOffMessage': {
    en: 'They’ll disappear from active selectors; history stays in mock data.',
    fr: 'Il disparaît des sélecteurs actifs ; l’historique reste dans les données simulées.',
  },
  /** Barbers — roster list */
  'page.barbers.searchPlaceholder': {
    en: 'Search barber or branch…',
    fr: 'Rechercher un barbier ou une branche…',
  },
  'page.barbers.statBarbers': { en: 'Barbers', fr: 'Barbiers' },
  'page.barbers.statInViewHint': { en: 'In view', fr: 'À l’écran' },
  'page.barbers.statActive': { en: 'Active', fr: 'Actifs' },
  'page.barbers.statGrossServices': { en: 'Gross services', fr: 'Prestations brutes' },
  'page.barbers.statBarberPayouts': { en: 'Barber payouts', fr: 'Reversements barbiers' },
  'page.barbers.rosterTitleLead': { en: 'Team roster', fr: 'Liste d’équipe' },
  'page.barbers.rosterSubtitle': {
    en: 'Sorted by gross service total',
    fr: 'Tri par total brut des prestations',
  },
  'page.barbers.thBarber': { en: 'Barber', fr: 'Barbier' },
  'page.barbers.thBranch': { en: 'Branch', fr: 'Branche' },
  'page.barbers.thSplit': { en: 'Split', fr: 'Partage' },
  'page.barbers.thServices': { en: 'Services', fr: 'Prestations' },
  'page.barbers.thGross': { en: 'Gross', fr: 'Brut' },
  'page.barbers.thEarned': { en: 'Earned', fr: 'Gagné' },
  'page.barbers.badgeOff': { en: 'Off', fr: 'Inactif' },
  'page.barbers.dlServices': { en: 'Services', fr: 'Prestations' },
  'page.barbers.dlGross': { en: 'Gross', fr: 'Brut' },
  'page.barbers.dlEarned': { en: 'Earned', fr: 'Gagné' },
  'page.barbers.emptyMatch': {
    en: 'No barbers match your search.',
    fr: 'Aucun barbier ne correspond à votre recherche.',
  },

  /** Services — modal & confirm */
  'page.services.modalAdd': { en: 'Add service', fr: 'Ajouter une prestation' },
  'page.services.modalEdit': { en: 'Edit service', fr: 'Modifier la prestation' },
  'page.services.fieldName': { en: 'Name', fr: 'Nom' },
  'page.services.fieldDescription': { en: 'Description', fr: 'Description' },
  'page.services.fieldPriceUsd': { en: 'Price (USD)', fr: 'Prix (USD)' },
  'page.services.fieldDuration': { en: 'Duration (min)', fr: 'Durée (min)' },
  'page.services.fieldStatus': { en: 'Status', fr: 'Statut' },
  'page.services.placeholderStatus': { en: 'Status', fr: 'Statut' },
  'page.services.confirmOffTitle': {
    en: 'Deactivate service?',
    fr: 'Désactiver cette prestation ?',
  },
  'page.services.confirmOffMessage': {
    en: 'It will be hidden from selectors; existing history remains.',
    fr: 'Elle sera masquée des listes ; l’historique reste.',
  },
  /** Services — catalog list */
  'page.services.statItems': { en: 'Services', fr: 'Prestations' },
  'page.services.statActiveCount': { en: 'Active', fr: 'Actives' },
  'page.services.statAvgPrice': { en: 'Avg price', fr: 'Prix moyen' },
  'page.services.statBranches': { en: 'Branches', fr: 'Branches' },
  'page.services.itemsCount': {
    en: 'items',
    fr: 'éléments',
  },
  'page.services.addInline': { en: 'Add service', fr: 'Ajouter une prestation' },
  'page.services.catalogOn': { en: 'On', fr: 'Activé' },
  'page.services.catalogOff': { en: 'Off', fr: 'Désactivé' },
  'common.minAbbrev': { en: 'min', fr: 'min' },

  /** Customers — modals & confirm */
  'page.customers.modalAdd': { en: 'Add customer', fr: 'Ajouter un client' },
  'page.customers.modalEdit': { en: 'Edit customer', fr: 'Modifier le client' },
  'page.customers.modalDetailFallback': { en: 'Customer', fr: 'Client' },
  'page.customers.modalDetailDesc': { en: 'Profile', fr: 'Profil' },
  'page.customers.fieldFullName': { en: 'Full name', fr: 'Nom complet' },
  'page.customers.fieldWhatsapp': { en: 'WhatsApp number', fr: 'Numéro WhatsApp' },
  'page.customers.fieldWhatsappHint': { en: 'Optional', fr: 'Optionnel' },
  'page.customers.fieldNotes': { en: 'Notes', fr: 'Notes' },
  'page.customers.labelWhatsapp': { en: 'WhatsApp', fr: 'WhatsApp' },
  'page.customers.labelNotes': { en: 'Notes', fr: 'Notes' },
  'page.customers.confirmDeleteTitle': {
    en: 'Delete customer?',
    fr: 'Supprimer ce client ?',
  },
  'page.customers.confirmDeleteMessage': {
    en: 'This removes the CRM record only. Transaction history keeps snapshots.',
    fr: 'Supprime seulement la fiche CRM. L’historique des opérations garde les instantanés.',
  },
  'page.customers.visitsModalTitle': {
    en: 'Visit history',
    fr: 'Historique des passages',
  },
  'page.customers.visitsModalHint': {
    en: 'Select a sale to view the full receipt.',
    fr: 'Sélectionnez une vente pour voir le reçu complet.',
  },
  'page.customers.visitsAriaOpen': {
    en: 'Show visit history',
    fr: 'Afficher les passages',
  },

  /** Customers — directory list */
  'page.customers.searchPlaceholder': {
    en: 'Search name or WhatsApp…',
    fr: 'Rechercher nom ou WhatsApp…',
  },
  'page.customers.addCta': { en: 'Add customer', fr: 'Ajouter un client' },
  'page.customers.statCount': { en: 'Customers', fr: 'Clients' },
  'page.customers.statVisits': { en: 'Total visits', fr: 'Visites totales' },
  'page.customers.statWithWa': { en: 'With WhatsApp', fr: 'Avec WhatsApp' },
  'page.customers.statBranches': {
    en: 'Locations (distinct branch visits)',
    fr: 'Salons (nombre distinct)',
  },
  'page.customers.dirTitleLead': { en: 'Directory', fr: 'Annuaire' },
  'page.customers.dirSubtitle': {
    en: 'WhatsApp · salons from sales · last visit',
    fr: 'WhatsApp · salons (ventes) · dernière visite',
  },
  'page.customers.thBranchesVisited': { en: 'Salons visited', fr: 'Salons fréquentés' },
  'page.customers.noVisitsYet': {
    en: 'None yet (appear after a sale)',
    fr: 'Aucun (après une vente)',
  },
  'page.customers.thCustomer': { en: 'Customer', fr: 'Client' },
  'page.customers.thWhatsapp': { en: 'WhatsApp', fr: 'WhatsApp' },
  'page.customers.thVisits': { en: 'Visits', fr: 'Visites' },
  'page.customers.thLastVisit': { en: 'Last visit', fr: 'Dernière visite' },
  'page.customers.mobileNoWa': { en: 'No WhatsApp', fr: 'Sans WhatsApp' },
  'page.customers.visitsCount': {
    en: 'visits',
    fr: 'visites',
  },
  'page.customers.emptyMatch': {
    en: 'No customers match your search.',
    fr: 'Aucun client ne correspond à votre recherche.',
  },

  /** Staff — assignments list */
  'page.staff.inviteTopCta': {
    en: 'Create staff & assign',
    fr: 'Créer du personnel et affecter',
  },
  'page.staff.statAssignments': { en: 'Assignments', fr: 'Affectations' },
  'page.staff.statManagers': { en: 'Managers', fr: 'Gestionnaires' },
  'page.staff.statAccountants': { en: 'Accountants', fr: 'Caissiers' },
  'page.staff.statBranches': { en: 'Branches', fr: 'Branches' },
  'page.staff.cardTitleLead': { en: 'All assignments', fr: 'Toutes les affectations' },
  'page.staff.cardSubtitle': {
    en: 'Across barbershops',
    fr: 'Tous les salons',
  },
  'page.staff.thName': { en: 'Name', fr: 'Nom' },
  'page.staff.thEmail': { en: 'Email', fr: 'Courriel' },
  'page.staff.thBranch': { en: 'Branch', fr: 'Branche' },
  'page.staff.thRole': { en: 'Role', fr: 'Rôle' },

  /** Staff — modal & confirm */
  'page.staff.modalTitle': {
    en: 'Create staff account',
    fr: 'Créer un compte personnel',
  },
  'page.staff.modalDesc': {
    en: 'Adds a login user and assigns a role at one barbershop.',
    fr: 'Crée un utilisateur et assigne un rôle sur une branche.',
  },
  'page.staff.fieldEmail': { en: 'Work email', fr: 'Courriel professionnel' },
  'page.staff.fieldFullName': { en: 'Full name', fr: 'Nom complet' },
  'page.staff.fieldBarbershop': { en: 'Barbershop', fr: 'Salon' },
  'page.staff.placeholderBranch': { en: 'Branch', fr: 'Branche' },
  'page.staff.fieldRole': { en: 'Role', fr: 'Rôle' },
  'page.staff.placeholderRole': { en: 'Role', fr: 'Rôle' },
  'page.staff.inviteHint': {
    en: 'Same person can hold manager + accountant at one shop: add one role, save, then add the second role with the same email (mock creates a second assignment).',
    fr: 'Une même personne peut être gestionnaire et caissier : ajoutez un rôle, enregistrez, puis le second avec le même courriel (la simulation crée une seconde affectation).',
  },
  'page.staff.submitInvite': {
    en: 'Create & assign',
    fr: 'Créer et affecter',
  },
  'page.staff.modalEditTitle': {
    en: 'Edit staff account',
    fr: 'Modifier un compte personnel',
  },
  'page.staff.modalEditDesc': {
    en: 'Update name, email, or login password (mock).',
    fr: 'Modifier le nom, le courriel ou le mot de passe (simulation).',
  },
  'page.staff.fieldPasswordInvite': {
    en: 'Login password (new users only)',
    fr: 'Mot de passe (nouveaux comptes seulement)',
  },
  'page.staff.fieldPasswordConfirmInvite': {
    en: 'Confirm password',
    fr: 'Confirmer le mot de passe',
  },
  'page.staff.invitePasswordHint': {
    en: 'If this email is new, we create an account with this password. If the person already exists, passwords are ignored.',
    fr: 'Si ce courriel est nouveau, un compte est créé avec ce mot de passe. Sinon, le mot de passe est ignoré.',
  },
  'page.staff.fieldNewPassword': {
    en: 'New password (optional)',
    fr: 'Nouveau mot de passe (optionnel)',
  },
  'page.staff.confirmRemoveTitle': {
    en: 'Remove assignment?',
    fr: 'Retirer l’affectation ?',
  },
  'page.staff.confirmRemoveMessage': {
    en: 'They lose access to this branch until reassigned (mock only).',
    fr: 'Perte d’accès à cette branche jusqu’à nouvelle affectation (simulation).',
  },

  /** Branches — modals & confirms */
  'page.branches.modalDetailFallback': { en: 'Branch', fr: 'Branche' },
  'page.branches.modalDetailDesc': {
    en: 'Details & staff (mock)',
    fr: 'Détails et personnel (simulation)',
  },
  'page.branches.labelCode': { en: 'Code', fr: 'Code' },
  'page.branches.labelPhone': { en: 'Phone', fr: 'Téléphone' },
  'page.branches.labelAddress': { en: 'Address', fr: 'Adresse' },
  'page.branches.staffAccess': { en: 'Staff access', fr: 'Accès personnel' },
  'page.branches.modalAdd': { en: 'Add branch', fr: 'Ajouter une branche' },
  'page.branches.modalEdit': { en: 'Edit branch', fr: 'Modifier la branche' },
  'page.branches.fieldName': { en: 'Name', fr: 'Nom' },
  'page.branches.fieldCode': { en: 'Code', fr: 'Code' },
  'page.branches.fieldCodeHint': {
    en: 'Short code for receipts',
    fr: 'Code court sur les reçus',
  },
  'page.branches.fieldAddress': { en: 'Address', fr: 'Adresse' },
  'page.branches.fieldPhone': { en: 'Phone', fr: 'Téléphone' },
  'page.branches.fieldStatus': { en: 'Status', fr: 'Statut' },
  'page.branches.placeholderStatus': { en: 'Status', fr: 'Statut' },
  'page.branches.createStaffLabel': {
    en: 'Create staff account',
    fr: 'Créer un compte personnel',
  },
  'page.branches.createStaffHint': {
    en: 'Adds a branch manager login in mock data and assigns them to this location.',
    fr: 'Ajoute une connexion gestionnaire simulée et l’affecte à ce lieu.',
  },
  'page.branches.staffManagerPassword': {
    en: 'Login password for this manager',
    fr: 'Mot de passe de connexion pour ce gestionnaire',
  },
  'page.branches.staffManagerPasswordConfirm': {
    en: 'Confirm password',
    fr: 'Confirmer le mot de passe',
  },
  'page.branches.statusActive': { en: 'Active', fr: 'Actif' },
  'page.branches.statusInactive': { en: 'Inactive', fr: 'Inactif' },
  'page.branches.assignSection': { en: 'Assign user', fr: 'Assigner un utilisateur' },
  'page.branches.fieldUser': { en: 'User', fr: 'Utilisateur' },
  'page.branches.placeholderSelect': { en: 'Select…', fr: 'Choisir…' },
  'page.branches.assignSubmit': { en: 'Assign', fr: 'Assigner' },
  'page.branches.removeStaffBtn': { en: 'Remove', fr: 'Retirer' },
  'page.branches.noStaffMock': {
    en: 'No staff assigned in mock data.',
    fr: 'Aucun personnel assigné (simulation).',
  },
  'page.branches.confirmDeactivateTitle': {
    en: 'Deactivate branch?',
    fr: 'Désactiver cette branche ?',
  },
  'page.branches.confirmDeactivateMessage': {
    en: 'Customers won’t see this branch in mock flows until reactivated.',
    fr: 'Branche masquée dans les flux simulés jusqu’à réactivation.',
  },
  'page.branches.confirmStaffRemoveTitle': {
    en: 'Remove staff access?',
    fr: 'Retirer l’accès personnel ?',
  },
  'page.branches.confirmStaffRemoveMessage': {
    en: 'They’ll lose branch tools until reassigned (mock only).',
    fr: 'Perte des accès liés à la branche jusqu’à nouvelle affectation (simulation).',
  },

  /** Dashboard (& shared labels) — high-traffic dashboard copy */
  'dash.title.owner': { en: 'Dashboard', fr: 'Tableau de bord' },
  'dash.title.manager': {
    en: 'Branch overview',
    fr: 'Vue branches',
  },
  'dash.subtitle.owner': {
    en: 'All barbershops · owner view · mock data (API-ready shape)',
    fr: 'Toutes les branches · vue propriétaire · données simulées (prêtes pour l’API)',
  },
  'dash.subtitle.manager': {
    en: 'Your assigned locations · manager view · no global admin controls',
    fr: 'Vos branches assignées · vue gestionnaire · pas d’admin global',
  },
  'dash.stats.grossRevenue': { en: 'Gross revenue', fr: 'Chiffre d’affaires brut' },
  'dash.stats.shopShare': { en: 'Shop share', fr: 'Part salon' },
  'dash.stats.shopShareHint': {
    en: 'After barber commissions',
    fr: 'Après commissions barbiers',
  },
  'dash.stats.barberPayouts': { en: 'Barber payouts', fr: 'Reversements barbiers' },
  'dash.stats.transactionsHint': {
    en: 'All time (mock)',
    fr: 'Tout temps (simulation)',
  },
  'dash.card.revTrend.title': {
    en: 'Revenue trend',
    fr: 'Tendance du chiffre d’affaires',
  },
  'dash.card.revTrend.subtitle': {
    en: 'Last 14 days · your scope',
    fr: '14 derniers jours · votre périmètre',
  },
  'dash.chart.revLabel': {
    en: 'Revenue',
    fr: 'Chiffre d’affaires',
  },
  'dash.card.serviceMix.title': {
    en: 'Service mix',
    fr: 'Mix de prestations',
  },
  'dash.card.serviceMix.subtitle': {
    en: 'Gross by service (top 8)',
    fr: 'CA par prestation (8 premières)',
  },
  'dash.card.branchPerf.title': {
    en: 'Branch performance',
    fr: 'Performance par branche',
  },
  'dash.card.branchPerf.subtitle': {
    en: 'Gross revenue by location',
    fr: 'Chiffre d’affaires par lieu',
  },
  'dash.card.barberEarn.title': {
    en: 'Barber earnings',
    fr: 'Gains barbiers',
  },
  'dash.card.barberEarn.subtitle': {
    en: 'Top barbers · payout totals',
    fr: 'Top barbiers · totaux reversés',
  },
  'dash.card.branchTable.title': {
    en: 'Branch table',
    fr: 'Table des branches',
  },
  'dash.card.branchTable.subtitle': {
    en: 'Revenue and shop share',
    fr: 'CA et part salon',
  },
  'dash.stat.locations': { en: 'Locations', fr: 'Salons' },

  /** Dashboard — remaining table / cards (were hardcoded English) */
  'dash.branchTh.branch': { en: 'Branch', fr: 'Branche' },
  'dash.branchTh.revenue': { en: 'Revenue', fr: 'CA' },
  'dash.branchTh.shop': { en: 'Shop', fr: 'Salon' },
  'dash.branchTh.tx': { en: 'Tx', fr: 'Op.' },
  'dash.branchMobile.rev': { en: 'Revenue', fr: 'Chiffre d’affaires' },
  'dash.branchMobile.shop': { en: 'Shop', fr: 'Part salon' },
  'dash.branchMobile.tx': { en: 'Transactions', fr: 'Opérations' },
  'dash.topBarbers.title': { en: 'Top barbers', fr: 'Top barbiers' },
  'dash.topBarbers.subtitle': {
    en: 'By gross service total',
    fr: 'Par total brut des prestations',
  },
  'dash.servicesCountCuts': {
    en: 'cuts',
    fr: 'coupes',
  },
  'dash.staff.cardTitle': { en: 'Staff', fr: 'Personnel' },
  'dash.staff.cardSubtitle': {
    en: 'People with access to your branches',
    fr: 'Personnes ayant accès à vos branches',
  },
  'dash.staff.empty': {
    en: 'No staff assignments in mock data for your scope.',
    fr: 'Aucune affectation simulée pour votre périmètre.',
  },
  'dash.staff.qPeople': { en: 'People', fr: 'Personnes' },
  'dash.staff.qManagers': { en: 'Managers', fr: 'Gestionnaires' },
  'dash.staff.qAccountants': { en: 'Accountants', fr: 'Caissiers' },
  'dash.staff.qReception': { en: 'Reception', fr: 'Accueil' },
  'dash.staff.thName': { en: 'Name', fr: 'Nom' },
  'dash.staff.thEmail': { en: 'Email', fr: 'Courriel' },
  'dash.staff.thBranch': { en: 'Branch', fr: 'Branche' },
  'dash.staff.thRole': { en: 'Role', fr: 'Rôle' },
  'dash.activity.title': { en: 'Recent activity', fr: 'Activité récente' },
  'dash.activity.subtitle': {
    en: 'Last 7 days · your scope',
    fr: '7 derniers jours · votre périmètre',
  },
  'dash.activity.empty': {
    en: 'No transactions this week in your view.',
    fr: 'Aucune opération cette semaine dans votre vue.',
  },
  'dash.activity.qSales7': { en: '7-day sales', fr: 'Ventes sur 7 jours' },
  'dash.activity.qVolume': { en: 'Volume', fr: 'Volume' },
  'dash.activity.qAvgTicket': { en: 'Avg ticket', fr: 'Panier moyen' },
  'dash.activity.qToday': { en: 'Today', fr: 'Aujourd’hui' },
  'dash.activity.details': { en: 'Details', fr: 'Détails' },
  'dash.activity.thWhen': { en: 'When', fr: 'Quand' },
  'dash.activity.thBranch': { en: 'Branch', fr: 'Branche' },
  'dash.activity.thCustomer': { en: 'Customer', fr: 'Client' },
  'dash.activity.thBarber': { en: 'Barber', fr: 'Barbier' },
  'dash.activity.thTotal': { en: 'Total', fr: 'Total' },
  'dash.trend.vsPriorWeek': {
    en: 'vs prior 7 days',
    fr: 'vs les 7 jours précédents',
  },

  /** My desk (barber) */
  'page.myDesk.notBarberTitle': {
    en: 'Not a barber profile',
    fr: 'Pas un profil barbier',
  },
  'page.myDesk.notBarberBody': {
    en: 'Sign in with a barber demo account to see personal earnings.',
    fr: 'Connectez-vous avec un compte barbier démo pour voir vos gains.',
  },
  'common.back': { en: 'Back', fr: 'Retour' },
  'page.myDesk.historyCta': {
    en: 'Transaction history',
    fr: 'Historique des opérations',
  },
  'page.myDesk.statYourEarnings': {
    en: 'Your earnings',
    fr: 'Vos gains',
  },
  'page.myDesk.statGrossServices': {
    en: 'Gross services',
    fr: 'Prestations brutes',
  },
  'page.myDesk.statCompleted': {
    en: 'Completed services',
    fr: 'Prestations réalisées',
  },
  'page.myDesk.statCompletedHint': {
    en: 'All time in mock data',
    fr: 'Tout le temps (données simulées)',
  },
  'page.myDesk.earnTrendTitle': { en: 'Earnings trend', fr: 'Tendance des gains' },
  'page.myDesk.earnTrendSub': {
    en: 'Your cut · last 14 service days in mock data',
    fr: 'Votre part · 14 derniers jours de prestations (simulation)',
  },
  'page.myDesk.chartYourEarnings': {
    en: 'Your earnings',
    fr: 'Vos gains',
  },
  'page.myDesk.trendVsWeek': {
    en: 'vs prior week',
    fr: 'vs la semaine précédente',
  },
  'page.myDesk.todaySales': { en: 'Your sales today', fr: 'Vos ventes aujourd’hui' },
  'page.myDesk.hintGrossSuffix': {
    en: ' gross',
    fr: ' brut',
  },
  'page.myDesk.thisWeek': { en: 'This week', fr: 'Cette semaine' },
  'page.myDesk.thisMonth': { en: 'This month', fr: 'Ce mois-ci' },
  'page.myDesk.yourCutMonth': {
    en: 'Your cut (month)',
    fr: 'Votre part (mois)',
  },
  'page.myDesk.recentCutsTitle': { en: 'Recent cuts', fr: 'Dernières prestations' },
  'page.myDesk.recentCutsSub': {
    en: 'Newest first',
    fr: 'Les plus récentes',
  },
  'page.myDesk.emptyServices': {
    en: 'No services yet.',
    fr: 'Aucune prestation pour le moment.',
  },
  'page.myDesk.thDate': { en: 'Date', fr: 'Date' },
  'page.myDesk.thBranch': { en: 'Branch', fr: 'Branche' },
  'page.myDesk.thCustomer': { en: 'Customer', fr: 'Client' },
  'page.myDesk.thService': { en: 'Service', fr: 'Prestation' },
  'page.myDesk.thYouEarned': { en: 'You earned', fr: 'Vous avez gagné' },

  /** Accountant desk — remaining chrome */
  'page.accountant.roleBadge': { en: 'Accountant', fr: 'Caissier(ère)' },
  'page.accountant.heroLine': {
    en:
      'Record payments and receipts for your assigned barbershops. Management screens are hidden — use New sale and Transactions only.',
    fr:
      'Enregistrez paiements et reçus pour les salons qui vous sont assignés. Les écrans de gestion sont masqués — utilisez Nouvelle vente et Opérations uniquement.',
  },
  'page.accountant.branchesCardTitle': {
    en: 'Your branches',
    fr: 'Vos branches',
  },
  'page.accountant.branchesCardSub': {
    en: 'Assignment (mock)',
    fr: 'Affectations (simulation)',
  },
  'page.accountant.statAllTime': {
    en: 'All time',
    fr: 'Tout le temps',
  },
  'page.accountant.recentSalesTitle': {
    en: 'Recent sales',
    fr: 'Ventes récentes',
  },
  'page.accountant.recentSalesSub': {
    en: 'Newest first · paginated',
    fr: 'Plus récentes en premier · paginées',
  },
  'page.accountant.emptyScoped': {
    en: 'No transactions yet. Post your first sale.',
    fr: 'Pas encore d’opération. Enregistrez une première vente.',
  },
  'page.accountant.openFullList': {
    en: 'Open full transaction list →',
    fr: 'Voir toute la liste des opérations →',
  },

  /** Settings — branding / profile extras */
  'page.settings.profileTitle': { en: 'Profile', fr: 'Profil' },
  'page.settings.brandTitle': {
    en: 'Workspace branding',
    fr: 'Image de marque',
  },
  'page.settings.brandSub': {
    en: 'Logo in the sidebar, header, and account menu (stored locally for demo)',
    fr: 'Logo dans le menu, bandeau et compte (stocké localement pour la démo)',
  },
  'page.settings.noLogo': {
    en: 'No logo',
    fr: 'Pas de logo',
  },
  'page.settings.uploadImage': {
    en: 'Upload image',
    fr: 'Téléverser une image',
  },
  'page.settings.removeLogo': {
    en: 'Remove logo',
    fr: 'Supprimer le logo',
  },
  'page.settings.businessNameLabel': {
    en: 'Business name',
    fr: 'Nom de l’entreprise',
  },
  'page.settings.businessNameHint': {
    en: 'Shown as the main title for owners and in the account menu.',
    fr: 'Affiché comme titre principal pour les propriétaires et dans le menu compte.',
  },
  'page.settings.businessNamePlaceholder': {
    en: 'Mubase Saloon',
    fr: 'Mubase Saloon',
  },
  'page.settings.logoAltPreview': {
    en: 'Workspace logo preview',
    fr: 'Aperçu du logo',
  },
  'page.settings.profileExtraSub': {
    en: 'From mock session',
    fr: 'Depuis la session simulée',
  },
  'page.settings.dtName': { en: 'Name', fr: 'Nom' },
  'page.settings.dtEmail': { en: 'Email', fr: 'Courriel' },
  'page.settings.dtWorkspace': { en: 'Workspace', fr: 'Espace' },
  'page.settings.dtAssignments': { en: 'Assignments', fr: 'Affectations' },
  'page.settings.badgeOwner': {
    en: 'Business owner',
    fr: 'Propriétaire',
  },
  'page.settings.badgeBarberProfile': {
    en: 'Barber profile',
    fr: 'Profil barbier',
  },
  'page.settings.alertLogoSize': {
    en: 'Please choose an image under 450 KB (demo limit).',
    fr: 'Choisissez une image de moins de 450 Ko (limite démo).',
  },

  // Operations page
  'operations.title': {
    en: 'New sale',
    fr: 'Nouvelle vente',
  },
  'operations.subtitle': {
    en: 'Full-page entry · same flow as the quick-action modal',
    fr: 'Saisie pleine page · même flux que la fenêtre rapide',
  },
  'operations.viewTx': {
    en: 'View transactions',
    fr: 'Voir les opérations',
  },
  'operations.lastPosted': {
    en: 'Last posted',
    fr: 'Dernier encaissement',
  },
  'operations.sessionHint': {
    en: 'From this session',
    fr: 'De cette session',
  },
} as const satisfies Record<string, { en: string; fr: string }>;
