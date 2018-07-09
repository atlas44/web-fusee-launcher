
function setPageLanguage(lang) {
  var langObj = null;

  if (lang === "en-US")
    langObj = enUS;

  else if (lang === "it-IT")
    langObj = itIT;

  else if (lang === "pt-BR")
    langObj = ptBR;

  else if (lang === "de-DE")
    langObj = deDE;

  else if (lang === "es-MX")
    langObj = esMX;

  else if (lang === "fr-FR")
    langObj = frFR;

  else if (lang === "pl-PL")
    langObj = plPL;

  else if (lang === "ru-RU")
    langObj = ruRU;

  else
    langObj = enUS;


  document.getElementById("pageTitle").innerHTML      = langObj.pageTitle;
  document.getElementById("pageSubtitle").innerHTML   = langObj.pageSubtitle;
  document.getElementById("dangerDanger").innerHTML   = langObj.dangerDanger;
  document.getElementById("warningWindows").innerHTML = langObj.warningWindows;
  document.getElementById("warningBrowser").innerHTML = langObj.warningBrowser;
  document.getElementById("warningLinux").innerHTML   = langObj.warningLinux;
  document.getElementById("warningTested").innerHTML  = langObj.warningTested;
  document.getElementById("labelInstructions").innerHTML = langObj.labelInstructions;
  document.getElementById("liRCM").innerHTML          = langObj.liRCM;
  document.getElementById("liSelect").innerHTML       = langObj.liSelect;
  document.getElementById("liPress").innerHTML        = langObj.liPress;
  document.getElementById("liAPX").innerHTML          = langObj.liAPX;
  document.getElementById("liLaunch").innerHTML       = langObj.liLaunch;
  document.getElementById("h1SetupDelivery").innerHTML = langObj.h1SetupDelivery;
  document.getElementById("h4SelectPayload").innerHTML = langObj.h4SelectPayload;
  document.getElementById("optionCTCaerHekate").innerHTML  = langObj.optionCTCaerHekate;
  document.getElementById("optionFusee").innerHTML     = langObj.optionFusee;
  document.getElementById("optionSXOS").innerHTML      = langObj.optionSXOS;
  document.getElementById("optionUpload").innerHTML    = langObj.optionUpload;
  document.getElementById("h4GetByteArray").innerHTML  = langObj.h4GetByteArray;
  document.getElementById("goButton").innerHTML        = langObj.goButton;
  document.getElementById("clearlogsbutton").innerHTML = langObj.clearlogsbutton;
  document.getElementById("disclaimer1").innerHTML = langObj.disclaimer1;
  document.getElementById("disclaimer2").innerHTML = langObj.disclaimer2;
  document.getElementById("disclaimer3").innerHTML = langObj.disclaimer3;
  document.getElementById("disclaimer4").innerHTML = langObj.disclaimer4;
}
