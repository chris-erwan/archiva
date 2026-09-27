/* ============================================================
   SCRIPT.JS — Plateforme Archiva (PROSIT ALLER 2)
   Fonctionnalités dynamiques et interactives, avec jQuery.
   Chaque fonction vérifie la présence de ses éléments avant de
   s'exécuter : ce même fichier peut donc être chargé sur toutes
   les pages du site sans provoquer d'erreur.
   ============================================================ */

$(document).ready(function () {
  initFavoris();
  initRecherche();
  initVoirPlus();
  initMasquerCartes();
  initFormulairesAuth();
  initFormulaireAjoutCER();
  initSuppressionTableau();
});

/* ------------------------------------------------------------
   1. FAVORIS — clic sur le cœur d'une carte CER
   Fonctionne sur index.html, cers.html et favoris.html.
   Délégation d'événement : couvre aussi les cartes ajoutées
   plus tard par "Voir plus".
------------------------------------------------------------ */
function initFavoris() {
  $(document).on("click", ".card_fav", function () {
    const $bouton = $(this);
    const estFavori = $bouton.toggleClass("card_fav--active").hasClass("card_fav--active");
    $bouton.attr("aria-label", estFavori ? "Retirer des favoris" : "Ajouter aux favoris");
  });
}

/* ------------------------------------------------------------
   2. RECHERCHE EN DIRECT
   Filtre les cartes du catalogue selon le titre, au fur et à
   mesure de la saisie (input), sans recharger la page.
   Cible les barres de recherche de l'accueil et du catalogue.
------------------------------------------------------------ */
function initRecherche() {
  const $champRecherche = $(".hero_search input, .toolbar_search input");
  if ($champRecherche.length === 0) return;

  $champRecherche.on("input", function () {
    const texteSaisi = $(this).val().trim().toLowerCase();
    const $cartes = $(this).closest("main").find(".card_list .card");

    $cartes.each(function () {
      const titre = $(this).find(".card_title").text().toLowerCase();
      $(this).toggle(titre.includes(texteSaisi));
    });
  });
}

/* ------------------------------------------------------------
   3. VOIR PLUS — ajoute dynamiquement de nouveaux CER
   Bouton présent uniquement sur l'accueil (id="btn-voir-plus").
   Les données sont simulées ici ; à remplacer par un appel
   $.ajax()/fetch() vers une API si les CER viennent d'un serveur.
------------------------------------------------------------ */
function initVoirPlus() {
  const $bouton = $("#btn-voir-plus");
  if ($bouton.length === 0) return;

  const nouveauxCER = [
    { image: "assets/images/uml.png", auteur: "Chris-Erwan Nga", titre: "Prosit 2.4 Diagrammes de séquence", texte: "Le diagramme de séquence UML représente les échanges de messages entre objets au fil du temps, utile pour modéliser les scénarios d'utilisation d'un système." },
    { image: "assets/images/api.png", auteur: "Chris-Erwan Nga", titre: "Prosit 3.5 Sécurisation des API REST", texte: "Panorama des mécanismes d'authentification et d'autorisation (JWT, OAuth2) permettant de protéger une API REST exposée sur Internet." },
    { image: "assets/images/microservices.png", auteur: "Chris-Erwan Nga", titre: "Prosit 4.6 Conteneurisation avec Docker", texte: "Introduction à la conteneurisation : images, conteneurs et orchestration, appliquée au déploiement d'une architecture microservices." },
  ];

  let indexAffiche = 0;
  const parLot = 3;

  $bouton.on("click", function () {
    const lot = nouveauxCER.slice(indexAffiche, indexAffiche + parLot);

    lot.forEach(function (cer) {
      const carteHTML = `
        <article class="card">
            <img class="card_image" src="${cer.image}" alt="${cer.titre}">
            <div class="card_body">
                <div class="card_meta">
                    <button type="button" class="card_fav" aria-label="Ajouter aux favoris"></button>
                    <span>par ${cer.auteur}</span>
                </div>
                <h3 class="card_title">${cer.titre}</h3>
                <p class="card_text">${cer.texte}</p>
                <button type="button" class="card_btn">Consulter le CER</button>
            </div>
        </article>`;
      $(".card_list").append(carteHTML);
    });

    indexAffiche += parLot;
    ajouterBoutonsMasquer(); // les nouvelles cartes doivent aussi avoir leur bouton "Masquer"

    if (indexAffiche >= nouveauxCER.length) {
      $bouton.prop("disabled", true).text("Aucun autre CER à afficher");
    }
  });
}

/* ------------------------------------------------------------
   4. MASQUER UNE CARTE CER
   Un bouton "Masquer" est injecté dans chaque carte au chargement
   (et pour chaque carte ajoutée par "Voir plus"). Cliquer dessus
   fait disparaître la carte correspondante, sans recharger la page.
------------------------------------------------------------ */
function initMasquerCartes() {
  if ($(".card_list").length === 0) return;

  ajouterBoutonsMasquer();

  // Délégation d'événement : indispensable pour que les boutons
  // "Masquer" des cartes ajoutées après coup (Voir plus) fonctionnent.
  $(document).on("click", ".card_btn--masquer", function () {
    $(this).closest(".card").fadeOut(250, function () {
      $(this).remove();
    });
  });
}

/**
 * Ajoute un bouton "Masquer" à chaque carte qui n'en a pas encore.
 */
function ajouterBoutonsMasquer() {
  $(".card_body").each(function () {
    if ($(this).find(".card_btn--masquer").length === 0) {
      $(this).append('<button type="button" class="card_btn card_btn--masquer">Masquer ce CER</button>');
    }
  });
}

/* ------------------------------------------------------------
   5. FORMULAIRES DE CONNEXION / INSCRIPTION
   Validation côté client + message de retour dynamique,
   sans rechargement de page (les deux formulaires n'ont pas
   de vrai backend ici : action="#").
------------------------------------------------------------ */
function initFormulairesAuth() {
  const $formulaire = $(".auth_card form");
  if ($formulaire.length === 0) return;

  $formulaire.on("submit", function (event) {
    event.preventDefault();
    const $form = $(this);
    const erreurs = [];

    $form.find("input[required]").each(function () {
      if ($(this).val().trim() === "") {
        erreurs.push("Le champ « " + ($(this).prev("label").text() || $(this).attr("name")) + " » est obligatoire.");
      }
    });

    const $feedback = obtenirZoneFeedback($form);

    if (erreurs.length > 0) {
      afficherFeedback($feedback, erreurs.join(" "), "erreur");
      return;
    }

    const estInscription = $form.find("#nom").length > 0;
    afficherFeedback(
      $feedback,
      estInscription ? "Compte créé avec succès ! Vous pouvez maintenant vous connecter." : "Connexion réussie, bienvenue sur Archiva !",
      "succes"
    );
  });
}

/* ------------------------------------------------------------
   6. FORMULAIRE D'AJOUT DE CER (add-cer.html)
   Validation minimale + message de retour, en l'absence de
   backend réel pour l'instant.
------------------------------------------------------------ */
function initFormulaireAjoutCER() {
  const $formulaire = $(".modal_dialog form");
  if ($formulaire.length === 0) return;

  $formulaire.on("submit", function (event) {
    event.preventDefault();
    const $form = $(this);
    const titre = $form.find("#titre").val().trim();
    const $feedback = obtenirZoneFeedback($form);

    if (titre === "") {
      afficherFeedback($feedback, "Le titre du CER est obligatoire.", "erreur");
      return;
    }

    afficherFeedback($feedback, `Le CER « ${titre} » a bien été enregistré !`, "succes");
    $form.trigger("reset");
  });
}

/* ------------------------------------------------------------
   7. SUPPRESSION D'UNE LIGNE DU TABLEAU (mes-cers.html)
   Demande une confirmation avant de retirer la ligne du DOM.
------------------------------------------------------------ */
function initSuppressionTableau() {
  const $tableau = $(".table_wrapper table");
  if ($tableau.length === 0) return;

  $tableau.on("click", ".btn--delete", function () {
    const $ligne = $(this).closest("tr");
    const titreCER = $ligne.find("td").first().text();

    if (confirm(`Supprimer définitivement « ${titreCER} » ?`)) {
      $ligne.fadeOut(250, function () {
        $(this).remove();
      });
    }
  });
}

/* ------------------------------------------------------------
   FONCTIONS UTILITAIRES PARTAGÉES
------------------------------------------------------------ */

/**
 * Récupère (ou crée si besoin) la zone d'affichage du message de
 * retour juste après le formulaire donné.
 */
function obtenirZoneFeedback($form) {
  let $feedback = $form.find(".form_feedback");
  if ($feedback.length === 0) {
    $feedback = $('<p class="form_feedback"></p>');
    $form.append($feedback);
  }
  return $feedback;
}

/**
 * Affiche un message de succès ou d'erreur dans la zone donnée.
 */
function afficherFeedback($zone, texte, type) {
  $zone
    .text(texte)
    .removeClass("form_feedback--erreur form_feedback--succes")
    .addClass("form_feedback--visible " + (type === "erreur" ? "form_feedback--erreur" : "form_feedback--succes"));
}
